import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn(), refresh: jest.fn() }),
}));
import CadastroPage from '../app/cadastro/page';

global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ sucesso: true })
  })
) as jest.Mock;

describe('CadastroPage integração', () => {
  it('realiza cadastro e exibe sucesso', async () => {
    render(<CadastroPage />);
    // Usar labels presentes no DOM gerado
    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'Usuário Teste' } });
    fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'user@email.com' } });
    fireEvent.change(screen.getByLabelText('Senha'), { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => {
      expect(screen.getByText(/Registro realizado com sucesso/)).toBeInTheDocument();
    });
  });
});
