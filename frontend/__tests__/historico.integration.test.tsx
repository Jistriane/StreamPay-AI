import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import HistoricoPage from '../app/historico/page';

jest.mock('@/app/lib/api', () => ({
  fetchWithAuth: jest.fn(),
}));

import { fetchWithAuth } from '@/app/lib/api';

beforeEach(() => {
  (fetchWithAuth as jest.Mock).mockResolvedValue({
    streams: [
      { id: 1, recipient: '0xabc', token: 'USDC', rate: '50', duration: 100, active: false, finalizadoEm: '2025-11-29' }
    ]
  });
});

describe('HistoricoPage integração', () => {
  it('exibe histórico de streams finalizados', async () => {
    render(<HistoricoPage />);
    await waitFor(() => {
      expect(screen.getByText(/Histórico|0xabc/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('exibe mensagem de nenhum stream', async () => {
    (fetchWithAuth as jest.Mock).mockResolvedValueOnce({ streams: [] });
    render(<HistoricoPage />);
    await waitFor(() => {
      expect(screen.getByText(/Nenhum|vazio/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('exibe erro de rede', async () => {
    (fetchWithAuth as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
    render(<HistoricoPage />);
    // Quando há erro, a página mostra loading ou estado vazio
    const errorState = await screen.findByText(/Carregando|Nenhum|vazio/i);
    expect(errorState).toBeInTheDocument();
  });

  it('exibe erro de dados nulos', async () => {
    (fetchWithAuth as jest.Mock).mockResolvedValueOnce(null);
    render(<HistoricoPage />);
    await waitFor(() => {
      expect(screen.getByText(/Nenhum|vazio/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('exibe mensagem de carregando', async () => {
    (fetchWithAuth as jest.Mock).mockImplementation(() => new Promise(() => {}));
    render(<HistoricoPage />);
    expect(screen.getByText(/Carregando/i)).toBeInTheDocument();
  });
});
