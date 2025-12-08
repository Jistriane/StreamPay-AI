// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title StreamPayCore
 * @notice Contrato de pagamentos streaming ERC20
 * @dev Otimizado para eficiência de gas e integração ElizaOS
 * @dev Versão corrigida com proteções contra cancelamento malicioso
 */
contract StreamPayCore is ReentrancyGuard, Pausable, Ownable {
    using SafeERC20 for IERC20;

    struct Stream {
        address sender;
        address recipient;
        address token;
        uint256 deposit;
        uint256 ratePerSecond;
        uint256 startTime;
        uint256 stopTime;
        uint256 remainingBalance;
        bool active;
    }

    event StreamCreated(
        uint256 indexed streamId,
        address indexed sender,
        address indexed recipient,
        address token,
        uint256 ratePerSecond,
        uint256 duration
    );
    event StreamClaimed(
        uint256 indexed streamId,
        address indexed recipient,
        uint256 amount
    );
    event StreamCancelled(
        uint256 indexed streamId,
        address indexed sender,
        uint256 senderRefund,
        uint256 recipientPayout
    );
    event StreamWithdrawn(
        uint256 indexed streamId,
        address indexed sender,
        uint256 amount
    );

    uint256 public nextStreamId;
    mapping(uint256 => Stream) public streams;

    constructor() Ownable(msg.sender) {}

    /**
     * @notice Cria um novo stream de pagamento
     * @param recipient Endereço do destinatário
     * @param token Endereço do token ERC20
     * @param deposit Quantidade total de tokens a depositar
     * @param ratePerSecond Taxa de tokens por segundo
     * @param duration Duração do stream em segundos
     * @return streamId ID do stream criado
     */
    function createStream(
        address recipient,
        address token,
        uint256 deposit,
        uint256 ratePerSecond,
        uint256 duration
    ) external nonReentrant whenNotPaused returns (uint256) {
        require(recipient != address(0), "Invalid recipient");
        require(recipient != msg.sender, "Cannot stream to self");
        require(token != address(0), "Invalid token");
        require(deposit > 0, "Deposit must be > 0");
        require(ratePerSecond > 0, "Rate must be > 0");
        require(duration > 0, "Duration must be > 0");

        uint256 stopTime = block.timestamp + duration;

        // Validação flexível: deposit deve ser >= ao mínimo necessário
        uint256 minDeposit = ratePerSecond * duration;
        require(deposit >= minDeposit, "Insufficient deposit");

        // Transfere tokens do sender para o contrato
        IERC20(token).safeTransferFrom(msg.sender, address(this), deposit);

        streams[nextStreamId] = Stream({
            sender: msg.sender,
            recipient: recipient,
            token: token,
            deposit: deposit,
            ratePerSecond: ratePerSecond,
            startTime: block.timestamp,
            stopTime: stopTime,
            remainingBalance: deposit,
            active: true
        });

        emit StreamCreated(
            nextStreamId,
            msg.sender,
            recipient,
            token,
            ratePerSecond,
            duration
        );

        nextStreamId++;
        return nextStreamId - 1;
    }

    /**
     * @notice Permite ao destinatário reivindicar tokens acumulados
     * @param streamId ID do stream
     */
    function claim(uint256 streamId) external nonReentrant {
        Stream storage stream = streams[streamId];
        require(stream.active, "Inactive stream");
        require(msg.sender == stream.recipient, "Only recipient can claim");

        uint256 claimable = _calculateClaimable(stream);
        require(claimable > 0, "Nothing to claim");
        require(claimable <= stream.remainingBalance, "Insufficient balance");

        stream.remainingBalance -= claimable;
        IERC20(stream.token).safeTransfer(stream.recipient, claimable);

        emit StreamClaimed(streamId, stream.recipient, claimable);

        // Finaliza stream se todo saldo foi reivindicado ou tempo expirou
        if (stream.remainingBalance == 0 || block.timestamp >= stream.stopTime) {
            stream.active = false;
        }
    }

    /**
     * @notice Consulta saldo disponível para claim
     * @param streamId ID do stream
     * @return Quantidade de tokens disponíveis para reivindicação
     */
    function availableToClaim(uint256 streamId) external view returns (uint256) {
        Stream storage stream = streams[streamId];
        if (!stream.active) return 0;

        uint256 claimable = _calculateClaimable(stream);
        return claimable <= stream.remainingBalance ? claimable : stream.remainingBalance;
    }

    /**
     * @notice Cancela stream, paga ao recipient o que ele já ganhou e devolve o resto ao sender
     * @param streamId ID do stream
     * @dev CORREÇÃO CRÍTICA: Agora protege os tokens já "earned" pelo recipient
     */
    function cancelStream(uint256 streamId) external nonReentrant {
        Stream storage stream = streams[streamId];
        require(stream.active, "Inactive stream");
        require(msg.sender == stream.sender, "Only sender can cancel");

        // Calcular quanto o recipient já tem direito (earned mas não claimed)
        uint256 claimable = _calculateClaimable(stream);

        stream.active = false;

        uint256 recipientPayout = 0;
        uint256 senderRefund = 0;

        // Transferir para recipient o que ele tem direito
        if (claimable > 0 && claimable <= stream.remainingBalance) {
            recipientPayout = claimable;
            IERC20(stream.token).safeTransfer(stream.recipient, recipientPayout);
        }

        // Devolver ao sender apenas o saldo não earned
        uint256 remaining = stream.remainingBalance - recipientPayout;
        if (remaining > 0) {
            senderRefund = remaining;
            IERC20(stream.token).safeTransfer(stream.sender, senderRefund);
        }

        stream.remainingBalance = 0;

        emit StreamCancelled(streamId, stream.sender, senderRefund, recipientPayout);
    }

    /**
     * @notice Permite ao sender retirar fundos de streams expirados e inativos
     * @param streamId ID do stream
     * @dev Útil quando o stream terminou mas o recipient nunca reivindicou
     */
    function withdrawExpiredStream(uint256 streamId) external nonReentrant {
        Stream storage stream = streams[streamId];
        require(!stream.active, "Stream still active");
        require(block.timestamp >= stream.stopTime, "Stream not expired");
        require(msg.sender == stream.sender, "Only sender can withdraw");
        require(stream.remainingBalance > 0, "Nothing to withdraw");

        // Calcular se ainda há tokens não earned pelo recipient
        uint256 elapsed = stream.stopTime - stream.startTime;
        uint256 totalEarned = stream.ratePerSecond * elapsed;
        uint256 alreadyClaimed = stream.deposit - stream.remainingBalance;

        // O recipient teve todo o tempo para reivindicar, então só devolve o excesso
        uint256 unclaimedEarned = totalEarned > alreadyClaimed
        ? totalEarned - alreadyClaimed
        : 0;

        uint256 withdrawable = stream.remainingBalance > unclaimedEarned
        ? stream.remainingBalance - unclaimedEarned
        : 0;

        require(withdrawable > 0, "No withdrawable funds");

        stream.remainingBalance -= withdrawable;
        IERC20(stream.token).safeTransfer(stream.sender, withdrawable);

        emit StreamWithdrawn(streamId, stream.sender, withdrawable);
    }

    /**
     * @notice Função de emergência para pausar criação de novos streams
     * @dev Apenas owner pode pausar/despausar
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Despausa o contrato
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @notice Calcula tokens disponíveis para claim (interno)
     * @param stream Struct do stream
     * @return Quantidade de tokens claimable
     */
    function _calculateClaimable(Stream storage stream) internal view returns (uint256) {
        uint256 elapsed = block.timestamp > stream.stopTime
        ? stream.stopTime - stream.startTime
        : block.timestamp - stream.startTime;

        uint256 totalClaimable = stream.ratePerSecond * elapsed;
        uint256 alreadyClaimed = stream.deposit - stream.remainingBalance;

        uint256 claimable = totalClaimable > alreadyClaimed
        ? totalClaimable - alreadyClaimed
        : 0;

        return claimable;
    }

    /**
     * @notice Retorna informações completas de um stream
     * @param streamId ID do stream
     */
    function getStreamInfo(uint256 streamId) external view returns (
        address sender,
        address recipient,
        address token,
        uint256 deposit,
        uint256 ratePerSecond,
        uint256 startTime,
        uint256 stopTime,
        uint256 remainingBalance,
        bool active,
        uint256 claimableNow
    ) {
        Stream storage stream = streams[streamId];
        return (
            stream.sender,
            stream.recipient,
            stream.token,
            stream.deposit,
            stream.ratePerSecond,
            stream.startTime,
            stream.stopTime,
            stream.remainingBalance,
            stream.active,
            stream.active ? _calculateClaimable(stream) : 0
        );
    }
}
