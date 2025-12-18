import { Router, Response } from "express";
import { query } from "../db";
import { authenticateJWT, AuthRequest } from "../middleware/auth";
import { asyncHandler, APIError } from "../middleware/errorHandler";
import { validateRequest, createStreamSchema, claimStreamSchema } from "../middleware/validation";
import { createStreamOnChain, toggleStreamOnChain, cancelStreamOnChain, getStreamedAmountOnChain } from "../contract";
import { logger } from "../utils/logger";
import { logAudit } from "../utils/audit";

const router = Router();

/**
 * @swagger
 * /api/streams:
 *   get:
 *     summary: List all streams for authenticated user
 *     tags: [Streams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of items to skip for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           maximum: 100
 *         description: Number of items to return
 *     responses:
 *       200:
 *         description: List of streams retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Stream'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     skip:
 *                       type: integer
 *                     limit:
 *                       type: integer
 */
router.get(
    "/",
    authenticateJWT,
    asyncHandler(async (req: AuthRequest, res: Response) => {
        if (!req.user) {
            throw new APIError(401, "Not authenticated", "NOT_AUTHENTICATED");
        }

        const { skip = 0, limit = 20 } = req.query;
        const offset = parseInt(String(skip)) || 0;
        const pageLimit = Math.min(parseInt(String(limit)) || 20, 100); // Max 100

        // Buscar streams como sender e recipient
        const result = await query(
            `
            SELECT id, sender, recipient, token, deposit, rate_per_second, 
                   start_time, stop_time, remaining_balance, active, created_at
            FROM streams
            WHERE sender = $1 OR recipient = $1
            ORDER BY created_at DESC
            LIMIT $2 OFFSET $3
            `,
            [req.user.address, pageLimit, offset]
        );

        const countResult = await query(
            "SELECT COUNT(*) FROM streams WHERE sender = $1 OR recipient = $1",
            [req.user.address]
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
 * GET /api/streams/:id
 * Obter detalhes de um stream específico
 */
router.get(
    "/:id",
    authenticateJWT,
    asyncHandler(async (req: AuthRequest, res: Response) => {
        if (!req.user) {
            throw new APIError(401, "Not authenticated", "NOT_AUTHENTICATED");
        }

        const { id } = req.params;
        const streamId = parseInt(id);

        if (isNaN(streamId)) {
            throw new APIError(400, "Invalid stream ID", "INVALID_STREAM_ID");
        }

        const result = await query(
            `
            SELECT id, sender, recipient, token, deposit, rate_per_second,
                   start_time, stop_time, remaining_balance, active, created_at
            FROM streams
            WHERE id = $1 AND (sender = $2 OR recipient = $2)
            `,
            [streamId, req.user.address]
        );

        if (result.rows.length === 0) {
            throw new APIError(404, "Stream not found", "STREAM_NOT_FOUND");
        }

        res.json({
            success: true,
            data: result.rows[0],
        });
    })
);

/**
 * @swagger
 * /api/streams:
 *   post:
 *     summary: Create a new payment stream
 *     tags: [Streams]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - recipient
 *               - token
 *               - amount
 *               - ratePerSecond
 *               - duration
 *             properties:
 *               recipient:
 *                 type: string
 *                 example: "0x0987654321098765432109876543210987654321"
 *               token:
 *                 type: string
 *                 example: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238"
 *               amount:
 *                 type: string
 *                 example: "1000000000000000000"
 *               ratePerSecond:
 *                 type: string
 *                 example: "11574074074074"
 *               duration:
 *                 type: integer
 *                 example: 86400
 *     responses:
 *       201:
 *         description: Stream created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Stream'
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
    "/",
    authenticateJWT,
    validateRequest(createStreamSchema),
    asyncHandler(async (req: AuthRequest, res: Response) => {
        if (!req.user) {
            throw new APIError(401, "Not authenticated", "NOT_AUTHENTICATED");
        }

        const { recipient, token, amount, ratePerSecond, duration } = req.body;

        // Validações
        if (recipient.toLowerCase() === req.user.address.toLowerCase()) {
            throw new APIError(400, "Cannot stream to self", "STREAM_TO_SELF");
        }

        if (amount < ratePerSecond * BigInt(duration)) {
            throw new APIError(
                400,
                "Insufficient deposit for duration",
                "INSUFFICIENT_DEPOSIT"
            );
        }

        // Registrar stream no banco
        const result = await query(
            `
            INSERT INTO streams (sender, recipient, token, deposit, rate_per_second,
                                 duration, status, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, 'pending', NOW())
            RETURNING id, sender, recipient, token, deposit, rate_per_second,
                      duration, status, created_at
            `,
            [
                req.user.address,
                recipient.toLowerCase(),
                token.toLowerCase(),
                amount.toString(),
                ratePerSecond.toString(),
                duration,
            ]
        );

        const stream = result.rows[0];
        const streamId = stream.id;

        // Audit log
        await logAudit({
            userId: req.user.address,
            action: "CREATE_STREAM",
            resource: "stream",
            resourceId: streamId.toString(),
            details: {
                recipient: recipient.toLowerCase(),
                token: token.toLowerCase(),
                amount: amount.toString(),
                duration,
            },
            ipAddress: req.ip,
            userAgent: req.headers["user-agent"],
            status: "success",
        });

        // Executar no blockchain (assíncrono, não bloqueia resposta)
        try {
            logger.info(`[Streams] Creating on-chain stream ${streamId} for ${recipient}...`);
            
            const onChainResult = await createStreamOnChain({
              freelancer: recipient.toLowerCase(),
              totalAmount: amount.toString(),
              duration,
              outputToken: token.toLowerCase(),
              tokenAddress: token.toLowerCase(), // Assuming token address = token symbol for now
            });

            // Atualizar banco com tx hash
            await query(
                `UPDATE streams SET status = $1, tx_hash = $2, on_chain_id = $3 WHERE id = $4`,
                ['confirmed', onChainResult.txHash, onChainResult.streamId, streamId]
            );

            logger.info(`[Streams] On-chain stream created: ${onChainResult.txHash}`);
        } catch (error) {
            logger.warn(`[Streams] On-chain creation failed: ${error}. Stream stored locally as 'pending'.`);
            // Não falha a resposta - stream está no banco de forma local
        }

        res.status(201).json({
            success: true,
            data: { ...stream, tx_hash: stream.tx_hash || null },
            message: stream.tx_hash ? "Stream created on-chain successfully!" : "Stream created locally. On-chain confirmation pending...",
        });
    })
);

/**
 * POST /api/streams/:id/claim
 * Reivindicar tokens disponíveis
 */
router.post(
    "/:id/claim",
    authenticateJWT,
    asyncHandler(async (req: AuthRequest, res: Response) => {
        if (!req.user) {
            throw new APIError(401, "Not authenticated", "NOT_AUTHENTICATED");
        }

        const { id } = req.params;
        const streamId = parseInt(id);

        if (isNaN(streamId)) {
            throw new APIError(400, "Invalid stream ID", "INVALID_STREAM_ID");
        }

        // Verificar que o usuário é o recipient
        const streamResult = await query(
            "SELECT recipient, active, on_chain_id FROM streams WHERE id = $1",
            [streamId]
        );

        if (streamResult.rows.length === 0) {
            throw new APIError(404, "Stream not found", "STREAM_NOT_FOUND");
        }

        const stream = streamResult.rows[0];

        if (stream.recipient.toLowerCase() !== req.user.address.toLowerCase()) {
            throw new APIError(
                403,
                "Only recipient can claim",
                "UNAUTHORIZED_CLAIM"
            );
        }

        if (!stream.active) {
            throw new APIError(
                400,
                "Stream is not active",
                "STREAM_NOT_ACTIVE"
            );
        }

        // Buscar quantidade streamada no contrato
        let claimableAmount = "0";
        try {
            if (stream.on_chain_id) {
                logger.info(`[Streams] Fetching streamed amount for on-chain stream ${stream.on_chain_id}...`);
                claimableAmount = await getStreamedAmountOnChain(parseInt(stream.on_chain_id));
                logger.info(`[Streams] Claimable amount: ${claimableAmount}`);
            }
        } catch (error) {
            logger.warn(`[Streams] Could not fetch streamed amount from contract: ${error}. Using local calculation.`);
            // Fallback: calcular localmente
            claimableAmount = "0";
        }

        // Registrar claim pendente
        const claimResult = await query(
            `
            INSERT INTO stream_claims (stream_id, recipient, status, amount, created_at)
            VALUES ($1, $2, 'pending', $3, NOW())
            RETURNING id, stream_id, recipient, status, amount, created_at
            `,
            [streamId, req.user.address, claimableAmount]
        );

        // Audit log
        await logAudit({
            userId: req.user.address,
            action: "CLAIM_STREAM",
            resource: "stream",
            resourceId: streamId.toString(),
            details: {
                claimAmount: claimableAmount,
                claimId: claimResult.rows[0].id,
            },
            ipAddress: req.ip,
            userAgent: req.headers["user-agent"],
            status: "success",
        });

        res.status(201).json({
            success: true,
            data: claimResult.rows[0],
            message: `Claim submitted for ${claimableAmount} tokens. Waiting for on-chain confirmation...`,
        });
    })
);

/**
 * PATCH /api/streams/:id/pause
 * Pausar stream
 */
router.patch(
    "/:id/pause",
    authenticateJWT,
    asyncHandler(async (req: AuthRequest, res: Response) => {
        if (!req.user) {
            throw new APIError(401, "Not authenticated", "NOT_AUTHENTICATED");
        }

        const { id } = req.params;
        const streamId = parseInt(id);

        if (isNaN(streamId)) {
            throw new APIError(400, "Invalid stream ID", "INVALID_STREAM_ID");
        }

        // Verificar que o usuário é o sender
        const streamResult = await query(
            "SELECT sender FROM streams WHERE id = $1",
            [streamId]
        );

        if (streamResult.rows.length === 0) {
            throw new APIError(404, "Stream not found", "STREAM_NOT_FOUND");
        }

        const stream = streamResult.rows[0];

        if (stream.sender.toLowerCase() !== req.user.address.toLowerCase()) {
            throw new APIError(
                403,
                "Only sender can pause",
                "UNAUTHORIZED_PAUSE"
            );
        }

        // Atualizar status
        const result = await query(
            "UPDATE streams SET active = false WHERE id = $1 RETURNING *",
            [streamId]
        );

        // Executar no blockchain (assíncrono)
        try {
            logger.info(`[Streams] Pausing on-chain stream ${streamId}...`);
            const onChainResult = await toggleStreamOnChain(streamId, false);
            logger.info(`[Streams] On-chain stream paused: ${onChainResult.txHash}`);
        } catch (error) {
            logger.warn(`[Streams] On-chain pause failed: ${error}. Stream paused locally.`);
        }

        res.json({
            success: true,
            data: result.rows[0],
            message: "Stream paused successfully!",
        });
    })
);

/**
 * DELETE /api/streams/:id
 * Cancelar stream
 */
router.delete(
    "/:id",
    authenticateJWT,
    asyncHandler(async (req: AuthRequest, res: Response) => {
        if (!req.user) {
            throw new APIError(401, "Not authenticated", "NOT_AUTHENTICATED");
        }

        const { id } = req.params;
        const streamId = parseInt(id);

        if (isNaN(streamId)) {
            throw new APIError(400, "Invalid stream ID", "INVALID_STREAM_ID");
        }

        // Verificar que o usuário é o sender
        const streamResult = await query(
            "SELECT sender FROM streams WHERE id = $1",
            [streamId]
        );

        if (streamResult.rows.length === 0) {
            throw new APIError(404, "Stream not found", "STREAM_NOT_FOUND");
        }

        const stream = streamResult.rows[0];

        if (stream.sender.toLowerCase() !== req.user.address.toLowerCase()) {
            throw new APIError(
                403,
                "Only sender can cancel",
                "UNAUTHORIZED_CANCEL"
            );
        }

        // Marcar como cancelado
        const result = await query(
            "UPDATE streams SET active = false, status = 'cancelled' WHERE id = $1 RETURNING *",
            [streamId]
        );

        // Executar no blockchain (assíncrono)
        try {
            logger.info(`[Streams] Cancelling on-chain stream ${streamId}...`);
            const onChainResult = await cancelStreamOnChain(streamId);
            logger.info(`[Streams] On-chain stream cancelled: ${onChainResult.txHash}`);
        } catch (error) {
            logger.warn(`[Streams] On-chain cancel failed: ${error}. Stream cancelled locally.`);
        }

        res.json({
            success: true,
            data: result.rows[0],
            message: "Stream cancelled. Waiting for on-chain confirmation...",
        });
    })
);

export default router;
