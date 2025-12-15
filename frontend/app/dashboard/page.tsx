"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Card from "@/app/components/Card";
import Button from "@/app/components/Button";
import CreateStreamModal from "@/app/components/CreateStreamModal";
import { useAuth } from "@/app/hooks/useAuth";
import { fetchWithAuth } from "@/app/lib/api";

interface Stream {
  id: string | number;
  sender: string;
  recipient: string;
  token: string;
  deposit: string;
  rate_per_second: string;
  status: string;
  created_at: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, loading, user, address, logout } = useAuth();
  const [streams, setStreams] = useState<Stream[]>([]);
  const [streamsLoading, setStreamsLoading] = useState(false);
  const [streamsError, setStreamsError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Redirecionar se não autenticado
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, loading, router]);

  // Buscar streams quando usuário está autenticado
  useEffect(() => {
    if (isAuthenticated && address) {
      fetchStreams();
    }
  }, [isAuthenticated, address]);

  const fetchStreams = async () => {
    setStreamsLoading(true);
    setStreamsError(null);
    try {
      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/streams`
      );
      
      if (!response.ok) {
        throw new Error('Falha ao buscar streams');
      }

      const data = await response.json();
      setStreams(data.data || []);
    } catch (error) {
      console.error('Erro ao buscar streams:', error);
      setStreamsError(error instanceof Error ? error.message : 'Erro desconhecido');
      setStreams([]);
    } finally {
      setStreamsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card variant="glass" padding="lg">
          <p className="text-center">Carregando...</p>
        </Card>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const activeStreams = streams.filter((s) => s.status === "active" || s.status === "pending");
  const completedStreams = streams.filter((s) => s.status === "completed" || s.status === "cancelled");

  // Calcular estatísticas
  const totalDeposited = activeStreams.reduce((sum, s) => {
    const amount = parseFloat(s.deposit || "0");
    return sum + (isNaN(amount) ? 0 : amount);
  }, 0);

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gradient mb-2">
              Dashboard
            </h1>
            <p className="text-secondary">
              Bem-vindo ao StreamPay AI
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              variant="neon"
            >
              ✨ Criar Stream
            </Button>
            <Button
              onClick={logout}
              variant="outlined"
            >
              Desconectar
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card variant="glass" padding="lg">
            <h2 className="text-xl font-bold mb-4">Informações da Conta</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-secondary">Carteira:</p>
                <p className="font-mono text-lg">
                  {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Não conectada"}
                </p>
              </div>
              <div>
                <p className="text-sm text-secondary">Email:</p>
                <p className="font-mono text-sm">
                  {user?.email || "Carregando..."}
                </p>
              </div>
              <div>
                <p className="text-sm text-secondary">Função:</p>
                <p className="capitalize">
                  {user?.role || "Carregando..."}
                </p>
              </div>
            </div>
          </Card>

          <Card variant="glass" padding="lg">
            <h2 className="text-xl font-bold mb-4">Estatísticas</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-secondary">Streams Ativas:</p>
                <p className="text-2xl font-bold text-gradient">{activeStreams.length}</p>
              </div>
              <div>
                <p className="text-sm text-secondary">Total Depositado:</p>
                <p className="text-2xl font-bold">${totalDeposited.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-secondary">Status:</p>
                <p className="text-green-500">✅ Ativa</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Streams Ativos */}
        <Card variant="glass" padding="lg" className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Streams Ativos ({activeStreams.length})</h2>
          
          {streamsLoading ? (
            <div className="text-center py-8">
              <p className="text-secondary">Carregando streams...</p>
            </div>
          ) : streamsError ? (
            <div className="bg-red-500/10 border border-red-500 rounded p-4 mb-4">
              <p className="text-red-400">⚠️ Erro: {streamsError}</p>
              <Button onClick={fetchStreams} variant="outlined" className="mt-2">
                Tentar Novamente
              </Button>
            </div>
          ) : activeStreams.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-secondary mb-4">Nenhum stream ativo no momento</p>
              <Button variant="neon" onClick={() => router.push("/streams")}>
                Criar Stream
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeStreams.map((stream) => (
                <div
                  key={stream.id}
                  className="bg-gradient-to-br from-slate-800/50 to-blue-900/50 rounded-lg p-4 border border-cyan-500/30"
                >
                  <div className="mb-3">
                    <p className="text-xs text-cyan-400 uppercase tracking-wider">Stream {stream.id}</p>
                    <p className="text-sm text-secondary mt-1">
                      Para: {`${String(stream.recipient).slice(0, 6)}...${String(stream.recipient).slice(-4)}`}
                    </p>
                  </div>
                  
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex justify-between">
                      <span className="text-secondary">Token:</span>
                      <span className="font-semibold">{stream.token}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary">Depositado:</span>
                      <span className="font-semibold">{stream.deposit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary">Taxa/s:</span>
                      <span className="font-semibold text-cyan-400">{stream.rate_per_second}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary">Status:</span>
                      <span className="px-2 py-0.5 rounded text-xs bg-green-500/20 text-green-400">
                        {stream.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="small" className="flex-1">
                      Reivindicar
                    </Button>
                    <Button variant="small" className="flex-1">
                      Detalhes
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Streams Completos */}
        {completedStreams.length > 0 && (
          <Card variant="glass" padding="lg" className="mb-8">
            <h2 className="text-2xl font-bold mb-6">Histórico ({completedStreams.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {completedStreams.map((stream) => (
                <div
                  key={stream.id}
                  className="bg-slate-800/30 rounded-lg p-4 border border-slate-700"
                >
                  <div className="mb-3">
                    <p className="text-xs text-slate-400 uppercase tracking-wider">Stream {stream.id}</p>
                    <p className="text-sm text-secondary mt-1">
                      Para: {`${String(stream.recipient).slice(0, 6)}...${String(stream.recipient).slice(-4)}`}
                    </p>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-secondary">Token:</span>
                      <span className="font-semibold">{stream.token}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary">Total:</span>
                      <span className="font-semibold">{stream.deposit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary">Status:</span>
                      <span className="px-2 py-0.5 rounded text-xs bg-slate-700 text-slate-300">
                        {stream.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Ações */}
        <Card variant="glass" padding="lg">
          <h2 className="text-xl font-bold mb-4">Ações Disponíveis</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="neon"
              fullWidth
              onClick={() => router.push("/streams")}
            >
              Criar Stream
            </Button>
            <Button
              variant="neon"
              fullWidth
              onClick={fetchStreams}
            >
              Atualizar
            </Button>
            <Button
              variant="neon"
              fullWidth
              onClick={() => router.push("/historico")}
            >
              Histórico Completo
            </Button>
          </div>
        </Card>
      </div>

      <CreateStreamModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onStreamCreated={fetchStreams}
      />
    </div>
  );
}
