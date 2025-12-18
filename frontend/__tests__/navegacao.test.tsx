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
    const { container: loginContainer } = render(<LoginPage />);
    // Login agora usa Web3Auth com título "StreamPay AI"
    expect(loginContainer.textContent).toContain('StreamPay AI');

    const { container: dashboardContainer } = render(<StreamPayDashboard />);
    expect(dashboardContainer.textContent).toMatch(/StreamPay AI|Dashboard/i);
  });

  it('renderiza cadastro', () => {
    render(<CadastroPage />);
    // Procura por elementos que existem na página de cadastro
    expect(screen.getByPlaceholderText(/nome|name/i)).toBeInTheDocument();
  });
});
