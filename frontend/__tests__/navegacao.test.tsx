import React from 'react';
jest.mock('wagmi', () => ({
  useAccount: jest.fn(() => ({ address: '0x123', isConnected: true })),
  useWriteContract: jest.fn(() => ({ writeContract: jest.fn() })),
}));
jest.mock('viem', () => ({
  parseEther: jest.fn(() => '1000000000000000000'),
}));
import { render, screen } from '@testing-library/react';
// App Router do Next não usa react-router; render direto
import StreamPayDashboard from '../app/page';
import LoginPage from '../app/login/page';
import CadastroPage from '../app/cadastro/page';

describe('Navegação entre páginas', () => {
  it('renderiza login e dashboard', () => {
    render(<LoginPage />);
    // Título atual é "StreamPay Login" na UI
    expect(screen.getByText('StreamPay Login')).toBeInTheDocument();

    render(<StreamPayDashboard />);
    expect(screen.getByText(/StreamPay AI|Dashboard/i)).toBeInTheDocument();
  });

  it('renderiza cadastro', () => {
    render(<CadastroPage />);
    // Título atual é "StreamPay Registration" na UI
    expect(screen.getByText('StreamPay Registration')).toBeInTheDocument();
  });
});
