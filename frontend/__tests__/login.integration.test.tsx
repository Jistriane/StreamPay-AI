import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginPage from '../app/login/page';

global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ token: 'fake-token' })
  })
) as jest.Mock;

describe('LoginPage integração', () => {
  it('realiza login e exibe sucesso', async () => {
    render(<LoginPage />);
    fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'user@email.com' } });
    fireEvent.change(screen.getByLabelText('Senha'), { target: { value: '123456' } });
    fireEvent.click(screen.getByText('Entrar'));
    await waitFor(() => {
      expect(screen.getByText(/Login realizado/)).toBeInTheDocument();
    });
  });

  it('exibe erro de autenticação', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ error: 'Credenciais inválidas' }) }));
    render(<LoginPage />);
    fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'user@email.com' } });
    fireEvent.change(screen.getByLabelText('Senha'), { target: { value: '123456' } });
    fireEvent.click(screen.getByText('Entrar'));
    await waitFor(() => {
      expect(screen.getByText(/Erro: Credenciais inválidas/)).toBeInTheDocument();
    });
  });

  it('exibe erro de rede', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() => Promise.reject(new Error('Network error')));
    render(<LoginPage />);
    fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'user@email.com' } });
    fireEvent.change(screen.getByLabelText('Senha'), { target: { value: '123456' } });
    fireEvent.click(screen.getByText('Entrar'));
    await waitFor(() => {
      expect(screen.getByText(/Erro: Network error/)).toBeInTheDocument();
    });
  });
});
