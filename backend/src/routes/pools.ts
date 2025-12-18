import { Router, Response } from "express";
import { query } from "../db";
import { authenticateJWT, AuthRequest } from "../middleware/auth";
import { asyncHandler, APIError } from "../middleware/errorHandler";
import { validateRequest, createPoolSchema } from "../middleware/validation";

const router = Router();

/**
 * GET /api/pools
 * Listar todos os pools de liquidez
 */
router.get(
    "/",
    authenticateJWT,
    asyncHandler(async (req: AuthRequest, res: Response) => {
        const { skip = 0, limit = 20 } = req.query;
        const offset = parseInt(String(skip)) || 0;
        const pageLimit = Math.min(parseInt(String(limit)) || 20, 100);

        const result = await query(
            `
            SELECT id, token0, token1, reserve0, reserve1, total_shares,
                   fee_tier, active, created_at
            FROM liquidity_pools
            WHERE active = true
            ORDER BY created_at DESC
            LIMIT $1 OFFSET $2
            `,
            [pageLimit, offset]
        );

        const countResult = await query(
            "SELECT COUNT(*) FROM liquidity_pools WHERE active = true"
        );

        res.json({
            success: true,
            data: result.rows,
            pagination: {
                total: parseInt(countResult.rows[0].count),
                skip: offset,
                limit: pageLimit,
            },
        });
    })
);

/**
 * GET /api/pools/:id
 * Obter detalhes de um pool
 */
router.get(
    "/:id",
    authenticateJWT,
    asyncHandler(async (req: AuthRequest, res: Response) => {
        const { id } = req.params;
        const poolId = parseInt(id);

        if (isNaN(poolId)) {
            throw new APIError(400, "Invalid pool ID", "INVALID_POOL_ID");
        }

        const result = await query(
            `
            SELECT id, token0, token1, reserve0, reserve1, total_shares,
                   fee_tier, active, created_at
            FROM liquidity_pools
            WHERE id = $1
            `,
            [poolId]
        );

        if (result.rows.length === 0) {
            throw new APIError(404, "Pool not found", "POOL_NOT_FOUND");
        }

        res.json({
            success: true,
            data: result.rows[0],
        });
    })
);

/**
 * POST /api/pools
 * Criar novo pool de liquidez
 */
router.post(
    "/",
    authenticateJWT,
    validateRequest(createPoolSchema),
    asyncHandler(async (req: AuthRequest, res: Response) => {
        if (!req.user) {
            throw new APIError(401, "Not authenticated", "NOT_AUTHENTICATED");
        }

        const { token0, token1, amount0, amount1 } = req.body;

        if (token0.toLowerCase() === token1.toLowerCase()) {
            throw new APIError(400, "Tokens must be different", "SAME_TOKEN");
        }

        // Criar pool no banco (pendente execução on-chain)
        const result = await query(
            `
            INSERT INTO liquidity_pools (token0, token1, reserve0, reserve1,
                                         creator, fee_tier, status, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, 'pending', NOW())
            RETURNING id, token0, token1, reserve0, reserve1, creator,
                      fee_tier, status, created_at
            `,
            [
                token0.toLowerCase(),
                token1.toLowerCase(),
                amount0.toString(),
                amount1.toString(),
                req.user.address,
                3000, // Default fee tier (0.3%)
            ]
        );

        const pool = result.rows[0];

        res.status(201).json({
            success: true,
            data: pool,
            message: "Pool created. Waiting for on-chain confirmation...",
        });
    })
);

/**
 * POST /api/pools/:id/add-liquidity
 * Adicionar liquidez a um pool
 */
router.post(
    "/:id/add-liquidity",
    authenticateJWT,
    asyncHandler(async (req: AuthRequest, res: Response) => {
        if (!req.user) {
            throw new APIError(401, "Not authenticated", "NOT_AUTHENTICATED");
        }

        const { id } = req.params;
        const { amount0, amount1 } = req.body;

        const poolId = parseInt(id);

        if (isNaN(poolId)) {
            throw new APIError(400, "Invalid pool ID", "INVALID_POOL_ID");
        }

        if (!amount0 || !amount1) {
            throw new APIError(400, "Amounts are required", "MISSING_AMOUNTS");
        }

        // Verificar que pool existe
        const poolResult = await query(
            "SELECT id FROM liquidity_pools WHERE id = $1 AND active = true",
            [poolId]
        );

        if (poolResult.rows.length === 0) {
            throw new APIError(404, "Pool not found", "POOL_NOT_FOUND");
        }

        // Registrar liquidez pendente
        const result = await query(
            `
            INSERT INTO lp_positions (pool_id, provider, amount0, amount1,
                                      status, created_at)
            VALUES ($1, $2, $3, $4, 'pending', NOW())
            RETURNING id, pool_id, provider, amount0, amount1, status, created_at
            `,
            [poolId, req.user.address, amount0.toString(), amount1.toString()]
        );

        res.status(201).json({
            success: true,
            data: result.rows[0],
            message: "Liquidity added. Waiting for on-chain confirmation...",
        });
    })
);

/**
 * GET /api/pools/:id/positions
 * Obter posições de liquidez do usuário em um pool
 */
router.get(
    "/:id/positions",
    authenticateJWT,
    asyncHandler(async (req: AuthRequest, res: Response) => {
        if (!req.user) {
            throw new APIError(401, "Not authenticated", "NOT_AUTHENTICATED");
        }

        const { id } = req.params;
        const poolId = parseInt(id);

        if (isNaN(poolId)) {
            throw new APIError(400, "Invalid pool ID", "INVALID_POOL_ID");
        }

        const result = await query(
            `
            SELECT id, pool_id, provider, amount0, amount1, shares,
                   status, created_at
            FROM lp_positions
            WHERE pool_id = $1 AND provider = $2
            ORDER BY created_at DESC
            `,
            [poolId, req.user.address]
        );

        res.json({
            success: true,
            data: result.rows,
        });
    })
);

/**
 * POST /api/pools/:id/remove-liquidity
 * Remover liquidez de um pool
 */
router.post(
    "/:id/remove-liquidity",
    authenticateJWT,
    asyncHandler(async (req: AuthRequest, res: Response) => {
        if (!req.user) {
            throw new APIError(401, "Not authenticated", "NOT_AUTHENTICATED");
        }

        const { id } = req.params;
        const { positionId, shares } = req.body;

        const poolId = parseInt(id);

        if (isNaN(poolId)) {
            throw new APIError(400, "Invalid pool ID", "INVALID_POOL_ID");
        }

        if (!positionId || !shares) {
            throw new APIError(
                400,
                "Position ID and shares are required",
                "MISSING_PARAMS"
            );
        }

        // Verificar que posição pertence ao usuário
        const positionResult = await query(
            "SELECT id FROM lp_positions WHERE id = $1 AND pool_id = $2 AND provider = $3",
            [positionId, poolId, req.user.address]
        );

        if (positionResult.rows.length === 0) {
            throw new APIError(404, "Position not found", "POSITION_NOT_FOUND");
        }

        // Registrar remoção pendente
        const result = await query(
            `
            INSERT INTO lp_removals (position_id, pool_id, provider, shares,
                                     status, created_at)
            VALUES ($1, $2, $3, $4, 'pending', NOW())
            RETURNING id, position_id, pool_id, provider, shares, status, created_at
            `,
            [positionId, poolId, req.user.address, shares.toString()]
        );

        res.status(201).json({
            success: true,
            data: result.rows[0],
            message: "Liquidity removal requested. Waiting for on-chain confirmation...",
        });
    })
);

export default router;
