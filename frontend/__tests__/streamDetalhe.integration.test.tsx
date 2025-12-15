import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
jest.mock("next/navigation", () => {
  return {
    useRouter: () => ({ query: { id: "1" }, push: jest.fn() }),
  };
});
import StreamDetalhePage from "../app/stream/[id]/page";

// Mock useRouter
jest.mock("next/router", () => ({
  useRouter: () => ({ query: { id: "123" } })
}));

beforeEach(() => {
  global.fetch = jest.fn();
});
afterEach(() => {
  jest.resetAllMocks();
});

describe("StreamDetalhePage", () => {
  it("exibe mensagem de carregando", async () => {
    (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));
    render(<StreamDetalhePage />);
    expect(screen.getByText(/Carregando detalhes/i)).toBeInTheDocument();
  });

  it("exibe mensagem de stream não encontrado", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      json: async () => ({ stream: null })
    });
    render(<StreamDetalhePage />);
    await waitFor(() => {
      expect(screen.getByText(/Stream não encontrado/i)).toBeInTheDocument();
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
    (global.fetch as jest.Mock).mockResolvedValue({
      json: async () => ({ stream })
    });
    render(<StreamDetalhePage />);
    await waitFor(() => {
      expect(screen.getByText(/Destinatário/)).toBeInTheDocument();
      expect(screen.getByText(/USDC/)).toBeInTheDocument();
      expect(screen.getByText(/10/)).toBeInTheDocument();
      expect(screen.getByText(/24 horas/)).toBeInTheDocument();
      expect(screen.getByText(/Ativo/)).toBeInTheDocument();
      expect(screen.getByText(/Criado em: 2025-11-29/)).toBeInTheDocument();
    });
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
    (global.fetch as jest.Mock).mockResolvedValue({
      json: async () => ({ stream })
    });
    render(<StreamDetalhePage />);
    await waitFor(() => {
      // Existem dois elementos com o texto 'Finalizado', então usamos getAllByText
      expect(screen.getAllByText(/Finalizado/).length).toBeGreaterThan(1);
      expect(screen.getByText(/Finalizado em: 2025-11-29/)).toBeInTheDocument();
    });
  });
});
