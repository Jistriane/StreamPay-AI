import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import StreamPayDashboard from '../app/page';

describe('StreamPayDashboard integração (sem mocks)', () => {
  it('envia prompt e exibe resposta da IA genérica', async () => {
    render(<StreamPayDashboard />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Pagar 0xabc 50 USDC/hora por 100 horas' } });
    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => {
      expect(screen.getByText(/Erro:/i)).toBeInTheDocument();
    });
  });

  it('renderiza área de chat inicial', () => {
    render(<StreamPayDashboard />);
    expect(screen.getByText('StreamPay AI')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('mantém interação mínima: exibe mensagem do usuário', async () => {
    render(<StreamPayDashboard />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Teste' } });
    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => {
      expect(screen.getByText('Você')).toBeInTheDocument();
      expect(screen.getByText('Teste')).toBeInTheDocument();
    });
  });
});
