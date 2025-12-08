"use client";
import React, { useState, useEffect } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleConnectWallet = () => {
    if (connectors && connectors.length > 0) {
      connect({ connector: connectors[0] });
    }
  };

  const navLinks = [
    { href: "/", label: "Dashboard", icon: "📊" },
    { href: "/cadastro", label: "Cadastro", icon: "✍️" },
    { href: "/historico", label: "Histórico", icon: "📜" },
    { href: "/compliance", label: "Compliance", icon: "✅" },
    { href: "/configuracoes", label: "Configurações", icon: "⚙️" },
    { href: "/monitoramento", label: "Monitoramento", icon: "📡" },
    { href: "/notificacoes", label: "Notificações", icon: "🔔" },
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
              <div className="wallet-status">
                <div className="wallet-indicator"></div>
                <span className="wallet-address-text">{formatAddress(address)}</span>
              </div>
              <button
                onClick={disconnect}
                className="btn-wallet btn-disconnect"
                title="Desconectar Wallet"
              >
                Desconectar
              </button>
            </div>
          ) : (
            <button
              onClick={handleConnectWallet}
              className="btn-wallet btn-connect"
            >
              <span className="wallet-icon">🔗</span>
              Conectar Wallet
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

