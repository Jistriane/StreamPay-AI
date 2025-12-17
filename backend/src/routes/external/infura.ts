import { Router, Request, Response } from 'express';
import { infuraService } from '../../services/external/infura.service';
import { logger } from '../../utils/logger';

const router = Router();

/**
 * GET /api/infura-gas
 * Estimar taxa de gas atual
 */
router.get('/infura-gas', async (req: Request, res: Response) => {
  try {
    const gasEstimate = await infuraService.getGasEstimate();
    res.json({ gasEstimate, unit: 'gwei' });
  } catch (error) {
    logger.error('[Infura Route] Erro ao obter estimativa de gas:', error);
    res.status(500).json({ error: 'Failed to fetch gas estimate' });
  }
});

/**
 * GET /api/infura-block
 * Obter numero do bloco atual
 */
router.get('/infura-block', async (req: Request, res: Response) => {
  try {
    const blockNumber = await infuraService.getBlockNumber();
    res.json({ blockNumber });
  } catch (error) {
    logger.error('[Infura Route] Erro ao obter bloco atual:', error);
    res.status(500).json({ error: 'Failed to fetch current block' });
  }
});

/**
 * GET /api/infura-tx-count/:address
 * Obter numero de transacoes de um endereco
 */
router.get('/infura-tx-count/:address', async (req: Request, res: Response) => {
  try {
    const { address } = req.params;

    if (!address || !address.match(/^0x[a-fA-F0-9]{40}$/)) {
      return res.status(400).json({ error: 'Invalid address format' });
    }

    const txCount = await infuraService.getTransactionCount(address);
    res.json({ address, transactionCount: txCount });
  } catch (error) {
    logger.error('[Infura Route] Erro ao obter contagem de transacoes:', error);
    res.status(500).json({ error: 'Failed to fetch transaction count' });
  }
});

export default router;
