import { Router, Request, Response } from 'express';
import { etherscanService } from '../../services/external/etherscan.service';
import { logger } from '../../utils/logger';

const router = Router();

/**
 * GET /api/etherscan-tx/:txHash
 * Verificar status de transação no Etherscan
 */
router.get('/etherscan-tx/:txHash', async (req: Request, res: Response) => {
  try {
    const { txHash } = req.params;

    if (!txHash || !txHash.match(/^0x[a-fA-F0-9]{64}$/)) {
      return res.status(400).json({ error: 'Invalid transaction hash format' });
    }

    const status = await etherscanService.getTransactionStatus(txHash);
    res.json({ txHash, status });
  } catch (error) {
    logger.error('[Etherscan Route] Erro:', error);
    res.status(500).json({ error: 'Failed to fetch transaction status' });
  }
});

/**
 * GET /api/etherscan-gas
 * Obter gas price atual
 */
router.get('/etherscan-gas', async (req: Request, res: Response) => {
  try {
    const gasPrice = await etherscanService.getGasPrice();
    res.json({ gasPrice });
  } catch (error) {
    logger.error('[Etherscan Route] Erro ao obter gas:', error);
    res.status(500).json({ error: 'Failed to fetch gas price' });
  }
});

/**
 * GET /api/etherscan-address/:address/txs
 * Obter transações de um endereço
 */
router.get('/etherscan-address/:address/txs', async (req: Request, res: Response) => {
  try {
    const { address } = req.params;
    const limit = parseInt(req.query.limit as string) || 10;

    if (!address || !address.match(/^0x[a-fA-F0-9]{40}$/)) {
      return res.status(400).json({ error: 'Invalid address format' });
    }

    const transactions = await etherscanService.getAddressTransactions(address, limit);
    res.json({ address, transactions, count: transactions.length });
  } catch (error) {
    logger.error('[Etherscan Route] Erro ao obter txs:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

export default router;
