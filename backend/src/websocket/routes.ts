/**
 * WebSocket Routes
 * REST endpoints for WebSocket management and info
 */

import express from "express";
import { WebSocketManager } from "./manager";
import { Logger } from "../utils/logger";

const logger = Logger.getInstance();
const router = express.Router();
const wsManager = WebSocketManager.getInstance();

/**
 * Middleware to authenticate requests
 */
const authenticate = (req: any, res: any, next: any) => {
  const { authorization } = req.headers;
  if (!authorization) {
    return res.status(401).json({ error: "Não autenticado" });
  }
  next();
};

/**
 * GET /ws/info
 * Get WebSocket connection info and metrics
 */
router.get("/ws/info", authenticate, (req: any, res: any) => {
  try {
    const metrics = wsManager.getMetrics();
    res.json({
      status: "active",
      activeConnections: metrics.activeConnections,
      totalConnections: metrics.totalConnections,
      metrics: {
        messagesSent: metrics.messagesSent,
        messagesReceived: metrics.messagesReceived,
        errorCount: metrics.errorCount,
        avgLatency: `${metrics.avgLatency.toFixed(2)}ms`,
      },
    });
  } catch (error: any) {
    logger.error("Error fetching WebSocket info", { error: error.message });
    res.status(500).json({ error: "Erro ao obter informações WebSocket" });
  }
});

/**
 * GET /ws/room/:roomId
 * Get info about a specific room
 */
router.get("/ws/room/:roomId", authenticate, (req: any, res: any) => {
  try {
    const { roomId } = req.params;
    const roomInfo = wsManager.getRoomInfo(roomId);

    res.json({
      ...roomInfo,
      timestamp: Date.now(),
    });
  } catch (error: any) {
    logger.error("Error fetching room info", { error: error.message });
    res.status(500).json({ error: "Erro ao obter informações da sala" });
  }
});

/**
 * POST /ws/broadcast
 * Send message to all connected clients (admin only)
 */
router.post("/ws/broadcast", authenticate, (req: any, res: any) => {
  try {
    const { event, data } = req.body;

    if (!event || !data) {
      return res.status(400).json({ error: "event e data são obrigatórios" });
    }

    wsManager.broadcastToAll(event, data);

    res.json({
      success: true,
      message: "Mensagem enviada para todos os clientes",
      timestamp: Date.now(),
    });
  } catch (error: any) {
    logger.error("Error broadcasting message", { error: error.message });
    res.status(500).json({ error: "Erro ao enviar mensagem" });
  }
});

/**
 * POST /ws/broadcast-room
 * Send message to a specific room
 */
router.post("/ws/broadcast-room", authenticate, (req: any, res: any) => {
  try {
    const { roomId, event, data } = req.body;

    if (!roomId || !event || !data) {
      return res
        .status(400)
        .json({ error: "roomId, event e data são obrigatórios" });
    }

    wsManager.broadcastToRoom(roomId, event, data);

    res.json({
      success: true,
      message: `Mensagem enviada para a sala ${roomId}`,
      timestamp: Date.now(),
    });
  } catch (error: any) {
    logger.error("Error broadcasting to room", { error: error.message });
    res.status(500).json({ error: "Erro ao enviar mensagem para sala" });
  }
});

/**
 * POST /ws/broadcast-user
 * Send message to a specific user
 */
router.post("/ws/broadcast-user", authenticate, (req: any, res: any) => {
  try {
    const { userId, event, data } = req.body;

    if (!userId || !event || !data) {
      return res
        .status(400)
        .json({ error: "userId, event e data são obrigatórios" });
    }

    wsManager.broadcastToUser(userId, event, data);

    res.json({
      success: true,
      message: `Mensagem enviada para usuário ${userId}`,
      timestamp: Date.now(),
    });
  } catch (error: any) {
    logger.error("Error broadcasting to user", { error: error.message });
    res.status(500).json({ error: "Erro ao enviar mensagem para usuário" });
  }
});

export const wsRouter = router;
