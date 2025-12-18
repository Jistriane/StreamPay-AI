"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Card from "../components/Card";
import { Web3Auth } from "../components/Web3Auth";
import { useAuth } from "../hooks/useAuth";

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();

  // Se já está autenticado, redirecionar para dashboard
  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, loading, router]);

  const handleAuthSuccess = () => {
    // Dar um tempo para o token ser armazenado
    setTimeout(() => {
      router.push("/dashboard");
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center animate-fade-in bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Card variant="glass" padding="lg" className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 
            className="text-4xl font-bold mb-2 text-gradient" 
            style={{ fontFamily: "var(--font-family-display)" }}
          >
            StreamPay AI
          </h1>
          <p 
            className="text-secondary" 
            style={{ color: "var(--text-secondary)" }}
          >
            Autenticação Web3 com MetaMask
          </p>
        </div>

        <div className="mb-6">
          <p className="text-sm text-center mb-4" style={{ color: "var(--text-secondary)" }}>
            Conecte sua carteira MetaMask para acessar o StreamPay AI
          </p>
          <Web3Auth
            onSuccess={handleAuthSuccess}
            onError={(error) => {
              console.error("Erro na autenticação:", error);
            }}
          />
        </div>

        <div className="border-t border-gray-300 dark:border-gray-700 pt-6">
          <h2 className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
            Como funciona:
          </h2>
          <ul className="text-xs space-y-2" style={{ color: "var(--text-secondary)" }}>
            <li>✅ Clique em "Conectar MetaMask"</li>
            <li>✅ Selecione sua carteira</li>
            <li>✅ Assine a mensagem para verificar identidade</li>
            <li>✅ Receba seu JWT para acessar a plataforma</li>
          </ul>
        </div>

        <div className="mt-6 text-center text-xs" style={{ color: "var(--text-secondary)" }}>
          <p>
            ℹ️ Certifique-se de estar na rede{" "}
            <strong>Sepolia Testnet</strong>
          </p>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
            Não tem MetaMask?{" "}
            <a
              href="https://metamask.io/download/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
              style={{ color: "var(--color-primary)" }}
            >
              Instale aqui
            </a>
          </p>
        </div>
      </Card>
    </div>
  );
}
