// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// Uniswap V3 interfaces
interface INonfungiblePositionManager {
    struct MintParams {
        address token0;
        address token1;
        uint24 fee;
        int24 tickLower;
        int24 tickUpper;
        uint256 amount0Desired;
        uint256 amount1Desired;
        uint256 amount0Min;
        uint256 amount1Min;
        address recipient;
        uint256 deadline;
    }

    struct IncreaseLiquidityParams {
        uint256 tokenId;
        uint256 amount0Desired;
        uint256 amount1Desired;
        uint256 amount0Min;
        uint256 amount1Min;
        uint256 deadline;
    }

    struct DecreaseLiquidityParams {
        uint256 tokenId;
        uint128 liquidity;
        uint256 amount0Min;
        uint256 amount1Min;
        uint256 deadline;
    }

    function mint(MintParams calldata params)
        external
        payable
        returns (uint256 tokenId, uint128 liquidity, uint256 amount0, uint256 amount1);

    function increaseLiquidity(IncreaseLiquidityParams calldata params)
        external
        payable
        returns (uint128 liquidity, uint256 amount0, uint256 amount1);

    function decreaseLiquidity(DecreaseLiquidityParams calldata params)
        external
        payable
        returns (uint256 amount0, uint256 amount1);

    function collect(CollectParams calldata params)
        external
        payable
        returns (uint256 amount0, uint256 amount1);

    struct CollectParams {
        uint256 tokenId;
        address recipient;
        uint128 amount0Max;
        uint128 amount1Max;
    }

    function ownerOf(uint256 tokenId) external view returns (address owner);
    function positions(uint256 tokenId) external view returns (
        uint96 nonce,
        address operator,
        address token0,
        address token1,
        uint24 fee,
        int24 tickLower,
        int24 tickUpper,
        uint128 liquidity,
        uint256 feeGrowthInside0LastX128,
        uint256 feeGrowthInside1LastX128,
        uint128 tokensOwed0,
        uint128 tokensOwed1
    );
}

interface IUniswapV3Factory {
    function getPool(address tokenA, address tokenB, uint24 fee)
        external
        view
        returns (address pool);

    function createPool(address tokenA, address tokenB, uint24 fee)
        external
        returns (address pool);
}

interface IUniswapV3Pool {
    function slot0() external view returns (
        uint160 sqrtPriceX96,
        int24 tick,
        uint16 observationIndex,
        uint16 observationCardinality,
        uint16 observationCardinalityNext,
        uint8 feeProtocol,
        bool unlocked
    );

    function liquidity() external view returns (uint128);
}

/**
 * @title PoolManager
 * @notice Gerencia pools de liquidez Uniswap V3 para StreamPay
 * @dev Permite criar, adicionar e remover liquidez automaticamente
 */
contract PoolManager is ReentrancyGuard, Pausable, Ownable {
    using SafeERC20 for IERC20;

    struct LPRecord {
        uint256 positionId; // NFT token ID do Uniswap V3
        address token0;
        address token1;
        uint24 fee;
        int24 tickLower;
        int24 tickUpper;
        uint256 depositedAmount0;
        uint256 depositedAmount1;
        bool active;
    }

    event PositionCreated(
        uint256 indexed recordId,
        uint256 indexed positionId,
        address indexed token0,
        address token1,
        int24 tickLower,
        int24 tickUpper,
        uint256 amount0,
        uint256 amount1
    );

    event LiquidityIncreased(
        uint256 indexed recordId,
        uint128 liquidity,
        uint256 amount0,
        uint256 amount1
    );

    event LiquidityDecreased(
        uint256 indexed recordId,
        uint256 amount0,
        uint256 amount1
    );

    event FeesCollected(
        uint256 indexed recordId,
        uint256 fee0,
        uint256 fee1
    );

    // State
    uint256 public nextRecordId;
    INonfungiblePositionManager public positionManager;
    IUniswapV3Factory public factory;

    mapping(uint256 => LPRecord) public positions;
    mapping(address => uint256[]) public userPositions; // user -> array of recordIds

    // Default Uniswap V3 fee tiers
    uint24 public constant FEE_TIER_LOW = 500;     // 0.05%
    uint24 public constant FEE_TIER_MEDIUM = 3000; // 0.30%
    uint24 public constant FEE_TIER_HIGH = 10000;  // 1.00%

    constructor(address _positionManager, address _factory) Ownable() {
        require(_positionManager != address(0), "Invalid position manager");
        require(_factory != address(0), "Invalid factory");
        positionManager = INonfungiblePositionManager(_positionManager);
        factory = IUniswapV3Factory(_factory);
    }

    /**
     * @notice Cria uma nova posição de liquidez Uniswap V3
     * @param token0 Primeiro token
     * @param token1 Segundo token
     * @param fee Taxa do pool (500, 3000, 10000)
     * @param amount0Desired Quantidade desejada de token0
     * @param amount1Desired Quantidade desejada de token1
     * @param tickLower Tick inferior da faixa
     * @param tickUpper Tick superior da faixa
     * @return recordId ID do record criado
     */
    function createPosition(
        address token0,
        address token1,
        uint24 fee,
        uint256 amount0Desired,
        uint256 amount1Desired,
        int24 tickLower,
        int24 tickUpper
    ) external nonReentrant whenNotPaused returns (uint256 recordId) {
        require(token0 != address(0) && token1 != address(0), "Invalid tokens");
        require(token0 != token1, "Tokens must be different");
        require(amount0Desired > 0 && amount1Desired > 0, "Amounts must be > 0");
        require(_isValidFeeTier(fee), "Invalid fee tier");
        require(tickLower < tickUpper, "Invalid tick range");

        // Garantir que tokens estão em ordem
        if (token0 > token1) {
            (token0, token1) = (token1, token0);
            (amount0Desired, amount1Desired) = (amount1Desired, amount0Desired);
        }

        // Garantir que pool existe
        address pool = factory.getPool(token0, token1, fee);
        if (pool == address(0)) {
            pool = factory.createPool(token0, token1, fee);
            require(pool != address(0), "Pool creation failed");
        }

        // Transferir tokens do usuário para este contrato
        IERC20(token0).safeTransferFrom(msg.sender, address(this), amount0Desired);
        IERC20(token1).safeTransferFrom(msg.sender, address(this), amount1Desired);

        // Aprovar position manager
        IERC20(token0).forceApprove(address(positionManager), amount0Desired);
        IERC20(token1).forceApprove(address(positionManager), amount1Desired);

        // Chamar mint
        INonfungiblePositionManager.MintParams memory params = 
            INonfungiblePositionManager.MintParams({
                token0: token0,
                token1: token1,
                fee: fee,
                tickLower: tickLower,
                tickUpper: tickUpper,
                amount0Desired: amount0Desired,
                amount1Desired: amount1Desired,
                amount0Min: 0,
                amount1Min: 0,
                recipient: address(this),
                deadline: block.timestamp + 1 hours
            });

        (uint256 tokenId, , uint256 amount0, uint256 amount1) = 
            positionManager.mint(params);

        // Devolver tokens não utilizados
        if (amount0 < amount0Desired) {
            IERC20(token0).safeTransfer(msg.sender, amount0Desired - amount0);
        }
        if (amount1 < amount1Desired) {
            IERC20(token1).safeTransfer(msg.sender, amount1Desired - amount1);
        }

        // Registrar position
        recordId = nextRecordId;
        positions[recordId] = LPRecord({
            positionId: tokenId,
            token0: token0,
            token1: token1,
            fee: fee,
            tickLower: tickLower,
            tickUpper: tickUpper,
            depositedAmount0: amount0,
            depositedAmount1: amount1,
            active: true
        });

        userPositions[msg.sender].push(recordId);

        emit PositionCreated(
            recordId,
            tokenId,
            token0,
            token1,
            tickLower,
            tickUpper,
            amount0,
            amount1
        );

        nextRecordId++;
        return recordId;
    }

    /**
     * @notice Aumenta liquidez em uma posição existente
     * @param recordId ID do record
     * @param amount0Desired Quantidade desejada de token0
     * @param amount1Desired Quantidade desejada de token1
     */
    function increaseLiquidity(
        uint256 recordId,
        uint256 amount0Desired,
        uint256 amount1Desired
    ) external nonReentrant whenNotPaused {
        require(_recordExists(recordId), "Record does not exist");
        LPRecord storage record = positions[recordId];
        require(record.active, "Record is inactive");
        require(amount0Desired > 0 && amount1Desired > 0, "Amounts must be > 0");

        // Transferir tokens
        IERC20(record.token0).safeTransferFrom(msg.sender, address(this), amount0Desired);
        IERC20(record.token1).safeTransferFrom(msg.sender, address(this), amount1Desired);

        // Aprovar
        IERC20(record.token0).forceApprove(address(positionManager), amount0Desired);
        IERC20(record.token1).forceApprove(address(positionManager), amount1Desired);

        // Aumentar liquidez
        INonfungiblePositionManager.IncreaseLiquidityParams memory params =
            INonfungiblePositionManager.IncreaseLiquidityParams({
                tokenId: record.positionId,
                amount0Desired: amount0Desired,
                amount1Desired: amount1Desired,
                amount0Min: 0,
                amount1Min: 0,
                deadline: block.timestamp + 1 hours
            });

        (uint128 liquidity, uint256 amount0, uint256 amount1) =
            positionManager.increaseLiquidity(params);

        // Devolver excedentes
        if (amount0 < amount0Desired) {
            IERC20(record.token0).safeTransfer(msg.sender, amount0Desired - amount0);
        }
        if (amount1 < amount1Desired) {
            IERC20(record.token1).safeTransfer(msg.sender, amount1Desired - amount1);
        }

        record.depositedAmount0 += amount0;
        record.depositedAmount1 += amount1;

        emit LiquidityIncreased(recordId, liquidity, amount0, amount1);
    }

    /**
     * @notice Remove liquidez de uma posição
     * @param recordId ID do record
     * @param liquidity Quantidade de liquidez a remover
     */
    function decreaseLiquidity(
        uint256 recordId,
        uint128 liquidity
    ) external nonReentrant {
        require(_recordExists(recordId), "Record does not exist");
        require(msg.sender == owner(), "Only owner can decrease"); // Simplificado para demo
        LPRecord storage record = positions[recordId];
        require(record.active, "Record is inactive");
        require(liquidity > 0, "Liquidity must be > 0");

        // Diminuir liquidez
        INonfungiblePositionManager.DecreaseLiquidityParams memory params =
            INonfungiblePositionManager.DecreaseLiquidityParams({
                tokenId: record.positionId,
                liquidity: liquidity,
                amount0Min: 0,
                amount1Min: 0,
                deadline: block.timestamp + 1 hours
            });

        (uint256 amount0, uint256 amount1) =
            positionManager.decreaseLiquidity(params);

        // Coletar tokens
        INonfungiblePositionManager.CollectParams memory collectParams =
            INonfungiblePositionManager.CollectParams({
                tokenId: record.positionId,
                recipient: msg.sender,
                amount0Max: type(uint128).max,
                amount1Max: type(uint128).max
            });

        positionManager.collect(collectParams);

        emit LiquidityDecreased(recordId, amount0, amount1);
    }

    /**
     * @notice Coleta fees de uma posição
     * @param recordId ID do record
     */
    function collectFees(uint256 recordId) external nonReentrant {
        require(_recordExists(recordId), "Record does not exist");
        require(msg.sender == owner(), "Only owner can collect fees");
        LPRecord storage record = positions[recordId];

        INonfungiblePositionManager.CollectParams memory params =
            INonfungiblePositionManager.CollectParams({
                tokenId: record.positionId,
                recipient: msg.sender,
                amount0Max: type(uint128).max,
                amount1Max: type(uint128).max
            });

        (uint256 fee0, uint256 fee1) = positionManager.collect(params);

        emit FeesCollected(recordId, fee0, fee1);
    }

    // ===== VIEW FUNCTIONS =====

    /**
     * @notice Retorna informações de uma posição
     */
    function getPositionInfo(uint256 recordId) external view returns (
        uint256 positionId,
        address token0,
        address token1,
        uint24 fee,
        int24 tickLower,
        int24 tickUpper,
        uint256 depositedAmount0,
        uint256 depositedAmount1,
        bool active
    ) {
        require(_recordExists(recordId), "Record does not exist");
        LPRecord storage record = positions[recordId];
        return (
            record.positionId,
            record.token0,
            record.token1,
            record.fee,
            record.tickLower,
            record.tickUpper,
            record.depositedAmount0,
            record.depositedAmount1,
            record.active
        );
    }

    /**
     * @notice Retorna todas as posições do usuário
     */
    function getUserPositions(address user) external view returns (uint256[] memory) {
        return userPositions[user];
    }

    /**
     * @notice Obtém liquidity atual da posição (do Uniswap V3)
     */
    function getPositionLiquidity(uint256 recordId) external view returns (uint128 liquidity) {
        require(_recordExists(recordId), "Record does not exist");
        LPRecord storage record = positions[recordId];
        
        (, , , , , , , liquidity, , , , ) = positionManager.positions(record.positionId);
        return liquidity;
    }

    /**
     * @notice Verifica se fee tier é válido
     */
    function _isValidFeeTier(uint24 fee) internal pure returns (bool) {
        return fee == FEE_TIER_LOW || fee == FEE_TIER_MEDIUM || fee == FEE_TIER_HIGH;
    }

    /**
     * @notice Verifica se record existe
     */
    function _recordExists(uint256 recordId) internal view returns (bool) {
        return recordId < nextRecordId;
    }

    // ===== EMERGENCY FUNCTIONS =====

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}
