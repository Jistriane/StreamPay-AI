import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn(), refresh: jest.fn() }),
}));
import LoginPage from '../app/login/page';

describe('LoginPage', () => {
  it('renderiza formulário de login', () => {
    render(<LoginPage />);
    // Usar labels para estabilidade com placeholders dinâmicos
    expect(screen.getByLabelText('E-mail')).toBeInTheDocument();
    expect(screen.getByLabelText('Senha')).toBeInTheDocument();
    expect(screen.getByText('Entrar')).toBeInTheDocument();
  });

  it('exibe status ao tentar login', async () => {
    render(<LoginPage />);
    // Alinha com inputs reais: usar label ao invés do placeholder
    fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'user@email.com' } });
    fireEvent.change(screen.getByLabelText('Senha'), { target: { value: '123456' } });
    fireEvent.click(screen.getByText('Entrar'));
    expect(await screen.findByText(/Autenticando|Login realizado|Erro/)).toBeInTheDocument();
  });
});
