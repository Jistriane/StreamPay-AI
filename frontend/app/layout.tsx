"use client";

import './globals.css';

import { WagmiConfig, createConfig } from "wagmi";
import { mainnet } from "wagmi/chains";
import { createPublicClient, http } from "viem";
import Header from "./components/Header";
import BackgroundEffects from "./components/BackgroundEffects";

const wagmiConfig = createConfig({
  autoConnect: true,
  publicClient: createPublicClient({
    chain: mainnet,
    transport: http(),
  }),
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>StreamPay AI - Pagamentos em Stream Blockchain</title>
      </head>
      <body>
        <BackgroundEffects />
        <WagmiConfig config={wagmiConfig}>
          <div className="app-container">
            <Header />
            <main className="main-content">
              <div className="content-wrapper">
                {children}
              </div>
            </main>
            <footer className="app-footer">
              <div className="footer-content">
                <p className="footer-text">
                  © 2024 StreamPay AI. Todos os direitos reservados.
                </p>
                <div className="footer-links">
                  <a href="#" className="footer-link">Documentação</a>
                  <a href="#" className="footer-link">Suporte</a>
                  <a href="#" className="footer-link">Termos</a>
                </div>
              </div>
            </footer>
          </div>
        </WagmiConfig>
      </body>
    </html>
  );
}
