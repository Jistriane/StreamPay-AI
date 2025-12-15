import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CadastroPage from '../app/cadastro/page';

describe('CadastroPage', () => {
  it('renderiza formulário de cadastro', () => {
    render(<CadastroPage />);
    expect(screen.getByLabelText('Nome')).toBeInTheDocument();
    expect(screen.getByLabelText('E-mail')).toBeInTheDocument();
    expect(screen.getByLabelText('Senha')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('exibe status ao tentar cadastro', async () => {
    global.fetch = jest.fn(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ sucesso: true })
    })) as jest.Mock;
    render(<CadastroPage />);
    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'Usuário Teste' } });
    fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'user@email.com' } });
    fireEvent.change(screen.getByLabelText('Senha'), { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button'));
    expect(await screen.findByText(/Registro realizado com sucesso!/)).toBeInTheDocument();
  });

  it('exibe erro de cadastro (API retorna erro)', async () => {
    global.fetch = jest.fn(() => Promise.resolve({
      ok: false,
      json: () => Promise.resolve({ error: 'E-mail já cadastrado' })
    })) as jest.Mock;
    render(<CadastroPage />);
    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'Usuário Teste' } });
    fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'user@email.com' } });
    fireEvent.change(screen.getByLabelText('Senha'), { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button'));
    expect(await screen.findByText(/Erro: E-mail já cadastrado/)).toBeInTheDocument();
  });

  it('exibe erro de rede ao cadastrar', async () => {
    global.fetch = jest.fn(() => Promise.reject(new Error('Falha de rede'))) as jest.Mock;
    render(<CadastroPage />);
    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'Usuário Teste' } });
    fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'user@email.com' } });
    fireEvent.change(screen.getByLabelText('Senha'), { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button'));
    expect(await screen.findByText(/Erro: Falha de rede/)).toBeInTheDocument();
  });
});
