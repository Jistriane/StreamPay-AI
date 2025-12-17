'use client';

import { ReactNode } from 'react';
import { WagmiConfig } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { createConfig, http } from 'wagmi';
import { injected } from 'wagmi/connectors';

interface Web3ProviderProps {
  children: ReactNode;
}

// Criar configuração do Wagmi
const wagmiConfig = createConfig({
  autoConnect: true,
  chains: [sepolia],
  connectors: [injected()],
  transports: {
    [sepolia.id]: http('https://ethereum-sepolia-rpc.publicnode.com'),
  },
});

/**
 * Web3Provider Component
 * Configura Wagmi com suporte a Sepolia testnet
 * Pode ser expandido para incluir Web3Modal com Reown AppKit
 */
export function Web3Provider({ children }: Web3ProviderProps) {
  return (
    <WagmiConfig config={wagmiConfig}>
      {children}
    </WagmiConfig>
  );
}
