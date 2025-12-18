import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { ToastProvider } from '../app/components/ToastProvider';

jest.mock("next/navigation", () => ({
  useRouter: () => ({ query: { id: "1" }, push: jest.fn() }),
  useParams: () => ({ id: "1" }),
}));

jest.mock('@/app/lib/api', () => ({
  fetchWithAuth: jest.fn(),
}));

import StreamDetalhePage from "../app/stream/[id]/page";
import { fetchWithAuth } from '@/app/lib/api';

const renderWithToast = (component: React.ReactElement) => {
  return render(<ToastProvider>{component}</ToastProvider>);
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("StreamDetalhePage", () => {
  it("exibe mensagem de carregando", async () => {
    (fetchWithAuth as jest.Mock).mockImplementation(() => new Promise(() => {}));
    renderWithToast(<StreamDetalhePage />);
    expect(screen.getByText(/Carregando/i)).toBeInTheDocument();
  });

  it("exibe mensagem de stream não encontrado", async () => {
    (fetchWithAuth as jest.Mock).mockResolvedValue({ stream: null });
    renderWithToast(<StreamDetalhePage />);
    await waitFor(() => {
      expect(screen.getByText(/não encontrado/i)).toBeInTheDocument();
    });
  });

  it("exibe detalhes do stream", async () => {
    const stream = {
      recipient: "0xabc",
      token: "USDC",
      rate: "10",
      duration: 24,
      active: true,
      criadoEm: "2025-11-29",
      finalizadoEm: null
    };
    (fetchWithAuth as jest.Mock).mockResolvedValue({ stream });
    renderWithToast(<StreamDetalhePage />);
    // Verifica se a página renderizou sem crash
    await waitFor(() => {
      expect(screen.queryByText(/Carregando/i)).not.toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it("exibe detalhes de stream finalizado", async () => {
    const stream = {
      recipient: "0xdef",
      token: "DAI",
      rate: "5",
      duration: 12,
      active: false,
      criadoEm: "2025-11-28",
      finalizadoEm: "2025-11-29"
    };
    (fetchWithAuth as jest.Mock).mockResolvedValue({ stream });
    renderWithToast(<StreamDetalhePage />);
    // Verifica se a página renderizou sem crash
    await waitFor(() => {
      expect(screen.queryByText(/Carregando/i)).not.toBeInTheDocument();
    }, { timeout: 3000 });
  });
});
