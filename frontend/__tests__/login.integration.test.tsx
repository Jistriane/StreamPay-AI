import React from 'react';
import { render, screen } from '@testing-library/react';
import LoginPage from '../app/login/page';

jest.mock('wagmi', () => ({
  useAccount: jest.fn(() => ({ address: undefined, isConnected: false })),
  useConnect: jest.fn(() => ({ connect: jest.fn(), connectors: [] })),
}));

global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ token: 'fake-token' })
  })
) as jest.Mock;

// TODO: Implementar testes de integração Web3 quando houver provider configurado
describe.skip('LoginPage integração', () => {
  it('realiza login Web3 e exibe sucesso', async () => {
    render(<LoginPage />);
    // Web3 integration tests requerem provider mock completo
  });

  it('exibe erro de autenticação Web3', async () => {
    render(<LoginPage />);
    // Web3 integration tests requerem provider mock completo
  });

  it('exibe erro de rede', async () => {
    render(<LoginPage />);
    // Web3 integration tests requerem provider mock completo
  });
});
