"use client";
import React, { useState, useEffect } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "../i18n";
import { useWalletAuth } from "../hooks/useWalletAuth";

export default function Header() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  // We use our custom auth hook for logout to clear storage too
  const { authenticate, isAuthenticated, isLoading, error: authError, logout } = useWalletAuth(); 
  const pathname = usePathname();
  const { t } = useI18n();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Effect to trigger authentication if connected but not authenticated
  useEffect(() => {
    if (mounted && isConnected && address && !isAuthenticated && !isLoading) {
       // Optional: Add a small delay or check if we haven't tried recently
       // For now, let's trigger it. User can cancel signature in wallet.
       authenticate();
    }
  }, [mounted, isConnected, address, isAuthenticated]); // Removed isLoading to avoid loop if it changes

  const handleConnectWallet = () => {
    if (connectors && connectors.length > 0) {
      connect({ connector: connectors[0] });
    }
  };

  const navLinks = [
    { href: "/", label: t("header.dashboard"), icon: "📊" },
    { href: "/cadastro", label: t("header.register"), icon: "✍️" },
    { href: "/historico", label: t("header.history"), icon: "📜" },
    { href: "/compliance", label: t("header.compliance"), icon: "✅" },
    { href: "/configuracoes", label: t("header.settings"), icon: "⚙️" },
    { href: "/monitoramento", label: t("header.monitoring"), icon: "📡" },
    { href: "/notificacoes", label: t("header.notifications"), icon: "🔔" },
  ];

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (!mounted) return null;

  return (
    <header className="header-modern">
      <div className="header-container">
        <div className="header-brand">
          <Link href="/" className="brand-link">
            <img 
              src="/logo-streampay.png" 
              alt="StreamPay AI" 
              className="brand-logo"
            />
            <span className="brand-text">StreamPay AI</span>
          </Link>
        </div>

        <nav className={`header-nav ${isMobileMenuOpen ? "nav-open" : ""}`}>
          <ul className="nav-list">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`nav-item ${pathname === link.href ? "active" : ""}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="nav-icon">{link.icon}</span>
                  <span className="nav-label">{link.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="header-actions">
          {isConnected && address ? (
            <div className="wallet-info">
              {authError && (
                 <span className="text-xs text-red-500 mr-2" title={authError}>⚠️ Auth Failed</span>
              )}
              <div className={`wallet-status ${isAuthenticated ? 'verified' : 'pending'}`}>
                <div className={`wallet-indicator ${isAuthenticated ? 'bg-green-500' : 'bg-yellow-500'}`} 
                     title={isAuthenticated ? "Authenticated" : "Wallet Connected (Not Authenticated)"}></div>
                <span className="wallet-address-text">{formatAddress(address)}</span>
              </div>
              <button
                onClick={logout}
                className="btn-wallet btn-disconnect"
                title={t("header.disconnectWallet")}
              >
                {t("header.disconnectWallet")}
              </button>
            </div>
          ) : (
            <button
              onClick={handleConnectWallet}
              className="btn-wallet btn-connect"
            >
              <span className="wallet-icon">🔗</span>
              {t("header.connectWallet")}
            </button>
          )}

          <button
            className="mobile-menu-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span className={`hamburger ${isMobileMenuOpen ? "open" : ""}`}>
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}

