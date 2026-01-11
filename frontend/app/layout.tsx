"use client";

import './globals.css';

import Header from "./components/Header";
import BackgroundEffects from "./components/BackgroundEffects";
import { ToastProvider } from "./components/ToastProvider";
import { Web3Provider } from "./components/Web3Provider";
import { I18nProvider, useI18n } from "./i18n";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = "en";

  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>StreamPay AI - Blockchain Streaming Payments</title>
      </head>
      <body>
        <I18nProvider locale={locale}>
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
                <Footer />
              </div>
            </Web3Provider>
          </ToastProvider>
        </I18nProvider>
      </body>
    </html>
  );
}

function Footer() {
  const { t } = useI18n();
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <p className="footer-text">
          {t("layout.copyright")}
        </p>
        <div className="footer-links">
          <a href="#" className="footer-link">{t("layout.documentation")}</a>
          <a href="#" className="footer-link">{t("layout.support")}</a>
          <a href="#" className="footer-link">{t("layout.terms")}</a>
        </div>
      </div>
    </footer>
  );
}
