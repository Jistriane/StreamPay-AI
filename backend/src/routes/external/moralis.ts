import { Router, Request, Response } from 'express';
import { moralisService } from '../../services/external/moralis.service';
import { logger } from '../../utils/logger';

const router = Router();

/**
 * GET /api/moralis-streams/:address
 * Obter streams de um usuário
 */
router.get('/moralis-streams/:address', async (req: Request, res: Response) => {
  try {
    const { address } = req.params;

    if (!address || !address.match(/^0x[a-fA-F0-9]{40}$/)) {
      return res.status(400).json({ error: 'Invalid address format' });
    }

    const streams = await moralisService.getStreams(address);
    res.json({ address, streams, count: streams.length });
  } catch (error) {
    logger.error('[Moralis Route] Erro ao obter streams:', error);
    res.status(500).json({ error: 'Failed to fetch streams' });
  }
});

/**
 * GET /api/moralis-nft/:address
 * Obter NFTs de um usuário
 */
router.get('/moralis-nft/:address', async (req: Request, res: Response) => {
  try {
    const { address } = req.params;

    if (!address || !address.match(/^0x[a-fA-F0-9]{40}$/)) {
      return res.status(400).json({ error: 'Invalid address format' });
    }

    const nfts = await moralisService.getNFTs(address);
    res.json({ address, nfts, count: nfts.length });
  } catch (error) {
    logger.error('[Moralis Route] Erro ao obter NFTs:', error);
    res.status(500).json({ error: 'Failed to fetch NFTs' });
  }
});

/**
 * GET /api/moralis-balance/:address/token/:tokenAddress
 * Obter saldo de um token ERC20
 */
router.get('/moralis-balance/:address/token/:tokenAddress', async (req: Request, res: Response) => {
  try {
    const { address, tokenAddress } = req.params;

    if (!address || !address.match(/^0x[a-fA-F0-9]{40}$/)) {
      return res.status(400).json({ error: 'Invalid address format' });
    }
    if (!tokenAddress || !tokenAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      return res.status(400).json({ error: 'Invalid token address format' });
    }

    const balance = await moralisService.getTokenBalance(address, tokenAddress);
    res.json({ address, tokenAddress, balance });
  } catch (error) {
    logger.error('[Moralis Route] Erro ao obter balance:', error);
    res.status(500).json({ error: 'Failed to fetch token balance' });
  }
});

/**
 * GET /api/moralis-native-balance/:address
 * Obter saldo nativo (ETH)
 */
router.get('/moralis-native-balance/:address', async (req: Request, res: Response) => {
  try {
    const { address } = req.params;

    if (!address || !address.match(/^0x[a-fA-F0-9]{40}$/)) {
      return res.status(400).json({ error: 'Invalid address format' });
    }

    const balance = await moralisService.getNativeBalance(address);
    res.json({ address, balance, currency: 'ETH' });
  } catch (error) {
    logger.error('[Moralis Route] Erro ao obter saldo nativo:', error);
    res.status(500).json({ error: 'Failed to fetch native balance' });
  }
});

export default router;
