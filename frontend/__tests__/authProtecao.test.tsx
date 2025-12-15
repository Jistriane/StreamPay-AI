import React from 'react';
import '@testing-library/jest-dom';
jest.mock('wagmi', () => ({
  useAccount: jest.fn(() => ({ address: undefined, isConnected: false })),
  useWriteContract: jest.fn(() => ({ writeContract: jest.fn() })),
}));
jest.mock('viem', () => ({
  parseEther: jest.fn(() => '1000000000000000000'),
}));
import { render, screen } from '@testing-library/react';
import StreamPayDashboard from '../app/page';

describe('Proteção de rotas', () => {
  it('exibe mensagem para usuário não autenticado', () => {
    // Simula ausência de autenticação
    render(<StreamPayDashboard />);
    expect(screen.getByText(/Conecte sua wallet para usar todas as funcionalidades/)).toBeInTheDocument();
  });
});
