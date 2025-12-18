// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title LiquidityPool
 * @notice Gerencia pools de liquidez MNEE/Stables com AMM simples
 * @dev Base para integração com Uniswap V3 futura
 */
contract LiquidityPool is ReentrancyGuard, Pausable, Ownable {
    using SafeERC20 for IERC20;

    struct Pool {
        address token0; // Token esquerda (ex: MNEE)
        address token1; // Token direita (ex: USDC)
        uint256 reserve0; // Saldo de token0
        uint256 reserve1; // Saldo de token1
        uint256 totalShares; // LP tokens emitidos
        bool active;
    }

    struct LPPosition {
        uint256 poolId;
        uint256 shares; // Quantidade de LP tokens possuídos
        uint256 depositedToken0;
        uint256 depositedToken1;
    }

    event PoolCreated(
        uint256 indexed poolId,
        address indexed token0,
        address indexed token1,
        uint256 initialLiquidity0,
        uint256 initialLiquidity1
    );

    event LiquidityAdded(
        uint256 indexed poolId,
        address indexed provider,
        uint256 amount0,
        uint256 amount1,
        uint256 sharesIssued
    );

    event LiquidityRemoved(
        uint256 indexed poolId,
        address indexed provider,
        uint256 amount0,
        uint256 amount1,
        uint256 sharesBurned
    );

    event Swapped(
        uint256 indexed poolId,
        address indexed user,
        address indexed tokenIn,
        uint256 amountIn,
        uint256 amountOut,
        uint256 newReserve0,
        uint256 newReserve1
    );

    event PoolFeeCollected(
        uint256 indexed poolId,
        uint256 fee0,
        uint256 fee1
    );

    // State
    uint256 public nextPoolId;
    mapping(uint256 => Pool) public pools;
    mapping(address => mapping(uint256 => LPPosition)) public lpPositions; // user -> poolId -> position
    mapping(uint256 => uint256) public collectedFees0; // poolId -> fee amount
    mapping(uint256 => uint256) public collectedFees1; // poolId -> fee amount

    // Constants
    uint256 public constant FEE_PERCENTAGE = 30; // 0.3% = 30 basis points
    uint256 public constant PRECISION = 10000; // Para cálculos com taxas

    // Minimum liquidity para evitar divisão por zero
    uint256 public constant MINIMUM_LIQUIDITY = 10 ** 3;

    constructor() Ownable() {}

    /**
     * @notice Cria um novo pool de liquidez
     * @param token0 Primeiro token (ex: MNEE)
     * @param token1 Segundo token (ex: USDC)
     * @param amount0 Quantidade inicial de token0
     * @param amount1 Quantidade inicial de token1
     * @return poolId ID do pool criado
     */
    function createPool(
        address token0,
        address token1,
        uint256 amount0,
        uint256 amount1
    ) external nonReentrant whenNotPaused returns (uint256) {
        require(token0 != address(0) && token1 != address(0), "Invalid tokens");
        require(token0 != token1, "Tokens must be different");
        require(amount0 > 0 && amount1 > 0, "Amounts must be > 0");

        // Ordenar tokens por endereço (padrão Uniswap)
        (address _token0, address _token1, uint256 _amount0, uint256 _amount1) = 
            token0 < token1 
            ? (token0, token1, amount0, amount1)
            : (token1, token0, amount1, amount0);

        uint256 poolId = nextPoolId;

        // Calcular LP shares iniciais (geometria média)
        uint256 liquidity = _sqrt(_amount0 * _amount1);
        require(liquidity > MINIMUM_LIQUIDITY, "Insufficient liquidity");

        // Queimar MINIMUM_LIQUIDITY para evitar divisão por zero
        uint256 sharesIssued = liquidity - MINIMUM_LIQUIDITY;

        // Transferir tokens
        IERC20(_token0).safeTransferFrom(msg.sender, address(this), _amount0);
        IERC20(_token1).safeTransferFrom(msg.sender, address(this), _amount1);

        // Criar pool
        pools[poolId] = Pool({
            token0: _token0,
            token1: _token1,
            reserve0: _amount0,
            reserve1: _amount1,
            totalShares: liquidity,
            active: true
        });

        // Registrar LP position
        lpPositions[msg.sender][poolId] = LPPosition({
            poolId: poolId,
            shares: sharesIssued,
            depositedToken0: _amount0,
            depositedToken1: _amount1
        });

        emit PoolCreated(poolId, _token0, _token1, _amount0, _amount1);
        nextPoolId++;
        return poolId;
    }

    /**
     * @notice Adiciona liquidez a um pool existente
     * @param poolId ID do pool
     * @param amount0 Quantidade de token0 a depositar
     * @param amount1 Quantidade de token1 a depositar
     */
    function addLiquidity(
        uint256 poolId,
        uint256 amount0,
        uint256 amount1
    ) external nonReentrant whenNotPaused {
        require(_poolExists(poolId), "Pool does not exist");
        Pool storage pool = pools[poolId];
        require(pool.active, "Pool is inactive");
        require(amount0 > 0 && amount1 > 0, "Amounts must be > 0");

        // Calcular shares baseado na razão de liquidez
        uint256 shares = _min(
            (amount0 * pool.totalShares) / (pool.reserve0 + 1), // +1 para evitar divisão por zero
            (amount1 * pool.totalShares) / (pool.reserve1 + 1)
        );

        require(shares > 0, "Insufficient liquidity provided");

        // Transferir tokens
        IERC20(pool.token0).safeTransferFrom(msg.sender, address(this), amount0);
        IERC20(pool.token1).safeTransferFrom(msg.sender, address(this), amount1);

        // Atualizar pool
        pool.reserve0 += amount0;
        pool.reserve1 += amount1;
        pool.totalShares += shares;

        // Registrar ou atualizar LP position
        lpPositions[msg.sender][poolId].shares += shares;
        lpPositions[msg.sender][poolId].depositedToken0 += amount0;
        lpPositions[msg.sender][poolId].depositedToken1 += amount1;

        emit LiquidityAdded(poolId, msg.sender, amount0, amount1, shares);
    }

    /**
     * @notice Remove liquidez de um pool
     * @param poolId ID do pool
     * @param shares Quantidade de LP shares a queimar
     */
    function removeLiquidity(
        uint256 poolId,
        uint256 shares
    ) external nonReentrant {
        require(_poolExists(poolId), "Pool does not exist");
        Pool storage pool = pools[poolId];
        require(pool.totalShares > 0, "Invalid pool state");

        LPPosition storage position = lpPositions[msg.sender][poolId];
        require(position.shares >= shares, "Insufficient shares");

        // Calcular amounts a retornar
        uint256 amount0 = (shares * pool.reserve0) / pool.totalShares;
        uint256 amount1 = (shares * pool.reserve1) / pool.totalShares;

        require(amount0 > 0 && amount1 > 0, "Amounts must be > 0");

        // Atualizar state
        position.shares -= shares;
        pool.reserve0 -= amount0;
        pool.reserve1 -= amount1;
        pool.totalShares -= shares;

        // Transferir tokens de volta
        IERC20(pool.token0).safeTransfer(msg.sender, amount0);
        IERC20(pool.token1).safeTransfer(msg.sender, amount1);

        emit LiquidityRemoved(poolId, msg.sender, amount0, amount1, shares);
    }

    /**
     * @notice Faz swap de token0 por token1 (ou vice-versa)
     * @param poolId ID do pool
     * @param tokenIn Endereço do token a ser enviado
     * @param amountIn Quantidade do token de entrada
     * @param minAmountOut Proteção de slippage (mínimo a receber)
     * @return amountOut Quantidade do token recebido
     */
    function swap(
        uint256 poolId,
        address tokenIn,
        uint256 amountIn,
        uint256 minAmountOut
    ) external nonReentrant whenNotPaused returns (uint256 amountOut) {
        require(_poolExists(poolId), "Pool does not exist");
        Pool storage pool = pools[poolId];
        require(pool.active, "Pool is inactive");
        require(amountIn > 0, "Amount must be > 0");
        require(tokenIn == pool.token0 || tokenIn == pool.token1, "Invalid token");

        // Determinar direção do swap
        bool isToken0To1 = tokenIn == pool.token0;
        uint256 reserveIn = isToken0To1 ? pool.reserve0 : pool.reserve1;
        uint256 reserveOut = isToken0To1 ? pool.reserve1 : pool.reserve0;
        address tokenOut = isToken0To1 ? pool.token1 : pool.token0;

        require(reserveIn > 0 && reserveOut > 0, "Insufficient liquidity");

        // Transferir token de entrada
        IERC20(tokenIn).safeTransferFrom(msg.sender, address(this), amountIn);

        // Calcular taxa (0.3%)
        uint256 fee = (amountIn * FEE_PERCENTAGE) / PRECISION;
        uint256 amountInAfterFee = amountIn - fee;

        // Fórmula AMM: x*y = k (constant product)
        uint256 numerator = amountInAfterFee * reserveOut;
        uint256 denominator = reserveIn + amountInAfterFee;
        amountOut = numerator / denominator;

        require(amountOut >= minAmountOut, "Excessive slippage");
        require(amountOut <= reserveOut, "Insufficient output liquidity");

        // Transferir token de saída
        IERC20(tokenOut).safeTransfer(msg.sender, amountOut);

        // Atualizar reserves
        if (isToken0To1) {
            pool.reserve0 += amountIn;
            pool.reserve1 -= amountOut;
            collectedFees0[poolId] += fee;
        } else {
            pool.reserve1 += amountIn;
            pool.reserve0 -= amountOut;
            collectedFees1[poolId] += fee;
        }

        emit Swapped(poolId, msg.sender, tokenIn, amountIn, amountOut, pool.reserve0, pool.reserve1);

        return amountOut;
    }

    /**
     * @notice Coleta taxas acumuladas do pool (apenas owner)
     * @param poolId ID do pool
     */
    function collectFees(uint256 poolId) external nonReentrant onlyOwner {
        require(_poolExists(poolId), "Pool does not exist");

        uint256 fee0 = collectedFees0[poolId];
        uint256 fee1 = collectedFees1[poolId];

        require(fee0 > 0 || fee1 > 0, "No fees to collect");

        Pool storage pool = pools[poolId];

        if (fee0 > 0) {
            collectedFees0[poolId] = 0;
            IERC20(pool.token0).safeTransfer(owner(), fee0);
        }

        if (fee1 > 0) {
            collectedFees1[poolId] = 0;
            IERC20(pool.token1).safeTransfer(owner(), fee1);
        }

        emit PoolFeeCollected(poolId, fee0, fee1);
    }

    // ===== VIEW FUNCTIONS =====

    /**
     * @notice Retorna informações de um pool
     */
    function getPoolInfo(uint256 poolId) external view returns (
        address token0,
        address token1,
        uint256 reserve0,
        uint256 reserve1,
        uint256 totalShares,
        bool active
    ) {
        require(_poolExists(poolId), "Pool does not exist");
        Pool storage pool = pools[poolId];
        return (pool.token0, pool.token1, pool.reserve0, pool.reserve1, pool.totalShares, pool.active);
    }

    /**
     * @notice Simula um swap sem executá-lo
     */
    function getSwapAmount(
        uint256 poolId,
        address tokenIn,
        uint256 amountIn
    ) external view returns (uint256 amountOut) {
        require(_poolExists(poolId), "Pool does not exist");
        Pool storage pool = pools[poolId];
        require(tokenIn == pool.token0 || tokenIn == pool.token1, "Invalid token");

        bool isToken0To1 = tokenIn == pool.token0;
        uint256 reserveIn = isToken0To1 ? pool.reserve0 : pool.reserve1;
        uint256 reserveOut = isToken0To1 ? pool.reserve1 : pool.reserve0;

        if (reserveIn == 0 || reserveOut == 0) return 0;

        uint256 fee = (amountIn * FEE_PERCENTAGE) / PRECISION;
        uint256 amountInAfterFee = amountIn - fee;

        uint256 numerator = amountInAfterFee * reserveOut;
        uint256 denominator = reserveIn + amountInAfterFee;

        return numerator / denominator;
    }

    /**
     * @notice Retorna LP position do usuário
     */
    function getLPPosition(address user, uint256 poolId) external view returns (
        uint256 shares,
        uint256 depositedToken0,
        uint256 depositedToken1
    ) {
        LPPosition storage position = lpPositions[user][poolId];
        return (position.shares, position.depositedToken0, position.depositedToken1);
    }

    // ===== INTERNAL FUNCTIONS =====

    function _poolExists(uint256 poolId) internal view returns (bool) {
        return poolId < nextPoolId;
    }

    function _sqrt(uint256 y) internal pure returns (uint256 z) {
        if (y > 3) {
            z = y;
            uint256 x = y / 2 + 1;
            while (x < z) {
                z = x;
                x = (y / x + x) / 2;
            }
        } else if (y != 0) {
            z = 1;
        }
    }

    function _min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }

    // ===== EMERGENCY FUNCTIONS =====

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}
