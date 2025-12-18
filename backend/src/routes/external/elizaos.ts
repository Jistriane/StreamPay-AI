import { Router, Request, Response } from 'express';
import { elizaosService } from '../../services/external/elizaos.service';
import { logger } from '../../utils/logger';

const router = Router();

/**
 * POST /api/eliza-message
 * Enviar mensagem para o ElizaOS
 */
router.post('/eliza-message', async (req: Request, res: Response) => {
  try {
    const { message, userId, userName } = req.body;

    if (!message || typeof message !== 'string' || message.length === 0) {
      return res.status(400).json({ error: 'Message is required and must be non-empty' });
    }
    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'UserId is required' });
    }

    const response = await elizaosService.sendMessage({
      text: message,
      userId,
      userName: userName || `User_${userId}`,
    });
    res.json({ userId, message, response });
  } catch (error) {
    logger.error('[ElizaOS Route] Erro ao enviar mensagem:', error);
    res.status(500).json({ error: 'Failed to send message to ElizaOS' });
  }
});

/**
 * GET /api/eliza-status
 * Obter status do ElizaOS
 */
router.get('/eliza-status', async (req: Request, res: Response) => {
  try {
    const status = await elizaosService.getStatus();
    res.json({ status });
  } catch (error) {
    logger.error('[ElizaOS Route] Erro ao obter status:', error);
    res.status(500).json({ error: 'Failed to fetch ElizaOS status' });
  }
});

/**
 * POST /api/eliza-analyze
 * Analisar fluxo de dados com ElizaOS
 */
router.post('/eliza-analyze', async (req: Request, res: Response) => {
  try {
    const { streamData } = req.body;

    if (!streamData || typeof streamData !== 'object') {
      return res.status(400).json({ error: 'streamData is required and must be an object' });
    }

    const analysis = await elizaosService.analyzeStream(streamData);
    res.json({ analysis, timestamp: new Date().toISOString() });
  } catch (error) {
    logger.error('[ElizaOS Route] Erro ao analisar stream:', error);
    res.status(500).json({ error: 'Failed to analyze stream with ElizaOS' });
  }
});

export default router;
