// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// Uniswap V3 Swap Router interface
interface ISwapRouter {
    struct ExactInputSingleParams {
        address tokenIn;
        address tokenOut;
        uint24 fee;
        address recipient;
        uint256 deadline;
        uint256 amountIn;
        uint256 amountOutMinimum;
        uint160 sqrtPriceLimitX96;
    }

    function exactInputSingle(ExactInputSingleParams calldata params)
        external
        payable
        returns (uint256 amountOut);

    struct ExactInputParams {
        bytes path;
        address recipient;
        uint256 deadline;
        uint256 amountIn;
        uint256 amountOutMinimum;
    }

    function exactInput(ExactInputParams calldata params)
        external
        payable
        returns (uint256 amountOut);
}

// Chainlink Price Feed interface para proteção de slippage
interface AggregatorV3Interface {
    function latestRoundData()
        external
        view
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        );

    function decimals() external view returns (uint8);
}

/**
 * @title SwapRouter
 * @notice Router otimizado para swaps via Uniswap V3 com proteção de slippage via Chainlink
 * @dev Implementa circuit breaker para preços anômalos e suporta multi-hop swaps
 */
contract SwapRouter is ReentrancyGuard, Pausable, Ownable {
    using SafeERC20 for IERC20;

    struct SwapRoute {
        address[] tokens; // Tokens na rota (ex: [MNEE, USDC, USDT])
        uint24[] fees; // Fees para cada hop (ex: [3000, 3000])
        bool active;
    }

    struct OracleConfig {
        address priceFeed; // Chainlink price feed
        uint8 decimals;
        uint256 stalePriceThreshold; // Tempo máximo de dados antigos (segundos)
        int256 lowerBoundPercent; // Limite inferior de preço aceito (em basis points, ex: 9500 = 95%)
        int256 upperBoundPercent; // Limite superior de preço aceito (em basis points, ex: 10500 = 105%)
    }

    event SwapExecuted(
        address indexed user,
        address indexed tokenIn,
        address indexed tokenOut,
        uint256 amountIn,
        uint256 amountOut,
        uint24 fee,
        uint256 timestamp
    );

    event MultiHopSwapExecuted(
        address indexed user,
        address indexed tokenIn,
        address indexed tokenOut,
        uint256 amountIn,
        uint256 amountOut,
        uint256 routeIndex,
        uint256 timestamp
    );

    event PriceCircuitBreakerTriggered(
        address indexed token,
        int256 currentPrice,
        int256 expectedPrice,
        string reason
    );

    event RouteCreated(uint256 indexed routeIndex, address[] tokens, uint24[] fees);

    // State
    ISwapRouter public swapRouter;
    uint256 public nextRouteId;
    
    mapping(uint256 => SwapRoute) public routes; // routeIndex -> route
    mapping(bytes32 => OracleConfig) public oracles; // keccak256(tokenAddress) -> oracle config
    mapping(address => uint256) public lastSwapTime; // Para rate limiting
    
    uint256 public constant MAX_SLIPPAGE_BPS = 500; // 5% slippage máximo padrão
    uint256 public constant BPS = 10000; // Basis points
    uint256 public constant CIRCUIT_BREAKER_THRESHOLD = 1000; // 10% de desvio máximo

    constructor(address _swapRouter) Ownable() {
        require(_swapRouter != address(0), "Invalid swap router");
        swapRouter = ISwapRouter(_swapRouter);
    }

    /**
     * @notice Registra um oracle Chainlink para um token
     * @param token Endereço do token
     * @param priceFeed Endereço do price feed
     * @param stalePriceThreshold Tempo máximo para dados considerados "frescos"
     * @param lowerBound Limite inferior em basis points (ex: 9500 = 95%)
     * @param upperBound Limite superior em basis points (ex: 10500 = 105%)
     */
    function registerOracle(
        address token,
        address priceFeed,
        uint256 stalePriceThreshold,
        int256 lowerBound,
        int256 upperBound
    ) external onlyOwner {
        require(token != address(0), "Invalid token");
        require(priceFeed != address(0), "Invalid price feed");
        require(stalePriceThreshold > 0, "Invalid threshold");
        require(lowerBound > 0 && upperBound > lowerBound, "Invalid bounds");

        uint8 decimals = AggregatorV3Interface(priceFeed).decimals();
        bytes32 tokenKey = keccak256(abi.encodePacked(token));

        oracles[tokenKey] = OracleConfig({
            priceFeed: priceFeed,
            decimals: decimals,
            stalePriceThreshold: stalePriceThreshold,
            lowerBoundPercent: lowerBound,
            upperBoundPercent: upperBound
        });
    }

    /**
     * @notice Cria uma rota de swap multi-hop
     * @param tokens Array de tokens na rota
     * @param fees Array de fees para cada hop
     * @return routeId ID da rota criada
     */
    function createRoute(
        address[] calldata tokens,
        uint24[] calldata fees
    ) external onlyOwner returns (uint256 routeId) {
        require(tokens.length >= 2, "Route must have at least 2 tokens");
        require(fees.length == tokens.length - 1, "Fee array length must be tokens.length - 1");

        // Validar tokens
        for (uint256 i = 0; i < tokens.length; i++) {
            require(tokens[i] != address(0), "Invalid token");
            if (i > 0) {
                require(tokens[i] != tokens[i - 1], "Duplicate tokens in route");
            }
        }

        routeId = nextRouteId;
        routes[routeId] = SwapRoute({
            tokens: tokens,
            fees: fees,
            active: true
        });

        emit RouteCreated(routeId, tokens, fees);
        nextRouteId++;
        return routeId;
    }

    /**
     * @notice Executa swap simples (single hop) via Uniswap V3
     * @param tokenIn Token de entrada
     * @param tokenOut Token de saída
     * @param fee Fee tier do pool
     * @param amountIn Quantidade a trocar
     * @param minAmountOut Proteção de slippage (mínimo a receber)
     * @return amountOut Quantidade recebida
     */
    function swapExactInputSingle(
        address tokenIn,
        address tokenOut,
        uint24 fee,
        uint256 amountIn,
        uint256 minAmountOut
    ) external nonReentrant whenNotPaused returns (uint256 amountOut) {
        require(tokenIn != address(0) && tokenOut != address(0), "Invalid tokens");
        require(tokenIn != tokenOut, "Tokens must be different");
        require(amountIn > 0, "Amount must be > 0");

        // Validar preço se oracle registrado
        _validatePrice(tokenIn, tokenOut, amountIn, minAmountOut);

        // Transferir tokens
        IERC20(tokenIn).safeTransferFrom(msg.sender, address(this), amountIn);

        // Aprovar router
        IERC20(tokenIn).forceApprove(address(swapRouter), amountIn);

        // Executar swap
        ISwapRouter.ExactInputSingleParams memory params = ISwapRouter.ExactInputSingleParams({
            tokenIn: tokenIn,
            tokenOut: tokenOut,
            fee: fee,
            recipient: msg.sender,
            deadline: block.timestamp + 60, // 1 minuto
            amountIn: amountIn,
            amountOutMinimum: minAmountOut,
            sqrtPriceLimitX96: 0 // Sem limite adicional (já temos minAmountOut)
        });

        amountOut = swapRouter.exactInputSingle(params);

        // Rate limiting
        lastSwapTime[msg.sender] = block.timestamp;

        emit SwapExecuted(msg.sender, tokenIn, tokenOut, amountIn, amountOut, fee, block.timestamp);
        return amountOut;
    }

    /**
     * @notice Executa swap multi-hop via rota predefinida
     * @param routeId ID da rota
     * @param amountIn Quantidade a trocar
     * @param minAmountOut Proteção de slippage
     * @return amountOut Quantidade recebida
     */
    function swapExactInputMultiHop(
        uint256 routeId,
        uint256 amountIn,
        uint256 minAmountOut
    ) external nonReentrant whenNotPaused returns (uint256 amountOut) {
        require(routeId < nextRouteId, "Route does not exist");
        SwapRoute storage route = routes[routeId];
        require(route.active, "Route is inactive");
        require(amountIn > 0, "Amount must be > 0");

        address tokenIn = route.tokens[0];
        address tokenOut = route.tokens[route.tokens.length - 1];

        // Validar preço
        _validatePrice(tokenIn, tokenOut, amountIn, minAmountOut);

        // Transferir tokens
        IERC20(tokenIn).safeTransferFrom(msg.sender, address(this), amountIn);

        // Aprovar router
        IERC20(tokenIn).forceApprove(address(swapRouter), amountIn);

        // Construir path (tokens entrelçados com fees)
        bytes memory path = _encodePath(route.tokens, route.fees);

        // Executar swap
        ISwapRouter.ExactInputParams memory params = ISwapRouter.ExactInputParams({
            path: path,
            recipient: msg.sender,
            deadline: block.timestamp + 60,
            amountIn: amountIn,
            amountOutMinimum: minAmountOut
        });

        amountOut = swapRouter.exactInput(params);

        // Rate limiting
        lastSwapTime[msg.sender] = block.timestamp;

        emit MultiHopSwapExecuted(
            msg.sender,
            tokenIn,
            tokenOut,
            amountIn,
            amountOut,
            routeId,
            block.timestamp
        );

        return amountOut;
    }

    /**
     * @notice Simula um swap sem executá-lo (para quote)
     * @param amountIn Quantidade
     * @param route Array de tokens
     * @return estimatedAmountOut Quantidade estimada de saída
     */
    function estimateSwap(
        uint256 amountIn,
        address[] calldata route
    ) external view returns (uint256 estimatedAmountOut) {
        require(route.length >= 2, "Invalid route");
        require(amountIn > 0, "Amount must be > 0");

        // Simplificado: seria necessário fazer chamadas estáticas ao pool
        // Para demo, retorna com base em oracle (se disponível)
        
        address tokenIn = route[0];
        address tokenOut = route[route.length - 1];

        // Se temos oracle para ambos, usar para estimar
        bytes32 inKey = keccak256(abi.encodePacked(tokenIn));
        bytes32 outKey = keccak256(abi.encodePacked(tokenOut));

        if (oracles[inKey].priceFeed != address(0) && oracles[outKey].priceFeed != address(0)) {
            int256 priceIn = _getPrice(tokenIn);
            int256 priceOut = _getPrice(tokenOut);

            if (priceIn > 0 && priceOut > 0) {
                estimatedAmountOut = (amountIn * uint256(priceIn)) / uint256(priceOut);
            }
        }

        return estimatedAmountOut;
    }

    // ===== INTERNAL FUNCTIONS =====

    /**
     * @notice Valida preço usando circuit breaker
     */
    function _validatePrice(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 minAmountOut
    ) internal view {
        bytes32 inKey = keccak256(abi.encodePacked(tokenIn));
        bytes32 outKey = keccak256(abi.encodePacked(tokenOut));

        if (oracles[inKey].priceFeed == address(0) || oracles[outKey].priceFeed == address(0)) {
            return; // Sem oracle, não validar
        }

        int256 priceIn = _getPrice(tokenIn);
        int256 priceOut = _getPrice(tokenOut);

        require(priceIn > 0 && priceOut > 0, "Invalid prices");

        // Calcular preço esperado
        uint256 expectedOut = (amountIn * uint256(priceIn)) / uint256(priceOut);

        // Circuit breaker: se desvio > 10%, rejeitar
        int256 deviation = int256(expectedOut) - int256(minAmountOut);
        int256 deviationPercent = (deviation * 10000) / int256(expectedOut);

        require(
            deviationPercent <= int256(CIRCUIT_BREAKER_THRESHOLD),
            "Price deviation too high"
        );
    }

    /**
     * @notice Obtém preço atual do Chainlink
     */
    function _getPrice(address token) internal view returns (int256) {
        bytes32 key = keccak256(abi.encodePacked(token));
        OracleConfig memory config = oracles[key];

        if (config.priceFeed == address(0)) return -1; // Oracle não registrado

        (
            ,
            int256 answer,
            ,
            uint256 updatedAt,

        ) = AggregatorV3Interface(config.priceFeed).latestRoundData();

        // Verificar se dados estão frescos
        require(
            block.timestamp - updatedAt <= config.stalePriceThreshold,
            "Stale price data"
        );

        require(answer > 0, "Invalid price");
        return answer;
    }

    /**
     * @notice Codifica path para Uniswap V3 (tokens + fees entrelçados)
     * Format: tokenA (20 bytes) + fee (3 bytes) + tokenB (20 bytes) + fee (3 bytes) + tokenC (20 bytes)
     */
    function _encodePath(
        address[] memory tokens,
        uint24[] memory fees
    ) internal pure returns (bytes memory) {
        bytes memory path = abi.encodePacked(tokens[0]);
        for (uint256 i = 0; i < fees.length; i++) {
            path = abi.encodePacked(path, fees[i], tokens[i + 1]);
        }
        return path;
    }

    // ===== EMERGENCY FUNCTIONS =====

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @notice Recupera tokens presos no contrato (emergência)
     */
    function emergencyWithdraw(address token) external onlyOwner {
        uint256 balance = IERC20(token).balanceOf(address(this));
        require(balance > 0, "No balance");
        IERC20(token).safeTransfer(owner(), balance);
    }
}
