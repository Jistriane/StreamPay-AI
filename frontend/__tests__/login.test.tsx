import React from 'react';
import { render, screen } from '@testing-library/react';
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn(), refresh: jest.fn() }),
}));
jest.mock('wagmi', () => ({
  useAccount: jest.fn(() => ({ address: undefined, isConnected: false })),
  useConnect: jest.fn(() => ({ connect: jest.fn(), connectors: [] })),
}));
import LoginPage from '../app/login/page';

describe('LoginPage', () => {
  it('renderiza autenticação Web3', () => {
    render(<LoginPage />);
    expect(screen.getByText('StreamPay AI')).toBeInTheDocument();
    expect(screen.getByText('Autenticação Web3 com MetaMask')).toBeInTheDocument();
    expect(screen.getByText(/Conecte sua carteira MetaMask/)).toBeInTheDocument();
  });

  it('exibe instruções de uso', () => {
    render(<LoginPage />);
    expect(screen.getByText('Como funciona:')).toBeInTheDocument();
  });
});
