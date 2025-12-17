import React from 'react';
import { render, screen } from '@testing-library/react';
import StreamDetalhePage from '../app/stream/[id]/page';
import { ToastProvider } from '../app/components/ToastProvider';

jest.mock('next/navigation', () => ({
  useParams: jest.fn(() => ({ id: '1' })),
  useRouter: jest.fn(() => ({ query: { id: '1' }, push: jest.fn() })),
}));

jest.mock('@/app/lib/api', () => ({
  fetchWithAuth: jest.fn(() => Promise.resolve({ stream: null })),
}));

describe('StreamDetalhePage', () => {
  it('renderiza estado de carregamento ou não encontrado', async () => {
    render(
      <ToastProvider>
        <StreamDetalhePage />
      </ToastProvider>
    );
    // Página inicia em loading ou mostra não encontrado após fetch
    const loadingOrNotFound = await screen.findByText(/Carregando|não encontrado/i);
    expect(loadingOrNotFound).toBeInTheDocument();
  });
});
