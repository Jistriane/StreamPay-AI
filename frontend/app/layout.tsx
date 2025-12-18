"use client";

import './globals.css';

import Header from "./components/Header";
import BackgroundEffects from "./components/BackgroundEffects";
import { ToastProvider } from "./components/ToastProvider";
import { Web3Provider } from "./components/Web3Provider";

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
        <ToastProvider>
          <Web3Provider>
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
          </Web3Provider>
        </ToastProvider>
      </body>
    </html>
  );
}
