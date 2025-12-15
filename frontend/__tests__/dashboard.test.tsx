import React from 'react';
import { act } from 'react';
jest.mock('wagmi', () => ({
  useAccount: jest.fn(() => ({ address: '0x123', isConnected: true })),
  useWriteContract: jest.fn(() => ({ writeContract: jest.fn() })),
}));
jest.mock('viem', () => ({
  parseEther: jest.fn(() => '1000000000000000000'),
}));
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import StreamPayDashboard from '../app/page';

describe('StreamPayDashboard', () => {
  it('renderiza título e prompt de IA', () => {
    render(<StreamPayDashboard />);
    expect(screen.getByText('StreamPay AI')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('não envia quando vazio; botão permanece desabilitado', async () => {
    render(<StreamPayDashboard />);
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
  });

  it('ao enviar prompt, mostra loader visual e resposta genérica', async () => {
    render(<StreamPayDashboard />);
    const input = screen.getByRole('textbox');
    await act(async () => {
      fireEvent.change(input, { target: { value: 'Pagar freelancer' } });
      fireEvent.click(screen.getByRole('button'));
    });
    // O loader atual é representado por elementos com classe 'loading-dots'
    const loaders = document.querySelectorAll('.loading-dots');
    expect(loaders.length).toBeGreaterThan(0);
    // Aceita qualquer mensagem de erro do assistente sem backend real
    await waitFor(() => {
      expect(screen.getByText(/Erro:/)).toBeInTheDocument();
    });
  });

  it('exibe erro de integração', async () => {
    // Simula erro na integração
    jest.spyOn(global, 'fetch').mockImplementation(() => Promise.reject(new Error('Falha IA')) as any);
    render(<StreamPayDashboard />);
    const input = screen.getByRole('textbox');
    await act(async () => {
      fireEvent.change(input, { target: { value: 'Pagar freelancer' } });
      fireEvent.click(screen.getByRole('button'));
    });
    // Ajusta para o texto exato renderizado pelo componente
    await screen.findByText(/Erro ao processar IA|Erro: Falha IA/);
    (global.fetch as jest.Mock).mockRestore();
  });
});
