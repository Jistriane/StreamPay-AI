'use client';

import { ReactNode } from 'react';
import { WagmiProvider } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { createConfig, http } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

interface Web3ProviderProps {
  children: ReactNode;
}

// Criar instância do QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      gcTime: 1000 * 60 * 10, // 10 minutos (anterior: cacheTime)
    },
  },
});

// Criar configuração do Wagmi (v2)
const wagmiConfig = createConfig({
  chains: [sepolia],
  connectors: [injected()],
  transports: {
    [sepolia.id]: http('https://ethereum-sepolia-rpc.publicnode.com'),
  },
});

/**
 * Web3Provider Component
 * Configura Wagmi v2 com QueryClient para react-query
 * Suporte a Sepolia testnet
 */
export function Web3Provider({ children }: Web3ProviderProps) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
