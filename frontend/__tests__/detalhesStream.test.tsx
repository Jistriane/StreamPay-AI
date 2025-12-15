import React from 'react';
import { render, screen } from '@testing-library/react';
import StreamDetalhePage from '../app/stream/[id]/page';
import { useParams, useRouter } from 'next/navigation';

jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
  useRouter: jest.fn(() => ({ query: { id: '1' }, push: jest.fn() })),
}));

describe('StreamDetalhePage', () => {
  it('renderiza título e detalhes do stream', () => {
    (useParams as jest.Mock).mockReturnValue({ id: '1' });
    render(<StreamDetalhePage />);
    expect(screen.getByText('Detalhes do Stream')).toBeInTheDocument();
    expect(screen.getByText(/Carregando detalhes|Stream não encontrado/)).toBeInTheDocument();
  });
});
