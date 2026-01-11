"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Card from "@/app/components/Card";
import Button from "@/app/components/Button";
import CreateStreamModal from "@/app/components/CreateStreamModal";
import { useAuth } from "@/app/hooks/useAuth";
import { fetchWithAuth } from "@/app/lib/api";
import { useToast } from "@/app/components/ToastProvider";
import { useI18n } from "@/app/i18n";

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
  const { addToast } = useToast();
  const { t } = useI18n();
  const [streams, setStreams] = useState<Stream[]>([]);
  const [streamsLoading, setStreamsLoading] = useState(false);
  const [streamsError, setStreamsError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    if (isAuthenticated && address) {
      fetchStreams();
    }
  }, [isAuthenticated, address]);

  const fetchStreams = async () => {
    setStreamsLoading(true);
    setStreamsError(null);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetchWithAuth('/streams');
      
      if (!response.ok) {
        if (response.status === 401) {
          // fetchWithAuth já redireciona para login
          return;
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || t("dashboard.errorLoading"));
      }

      const data = await response.json();
      setStreams(data.data || []);
      if (data.data && data.data.length > 0) {
        addToast(`✅ ${data.data.length} stream(s) loaded`, 'info', 2000);
      }
    } catch (error) {
      console.error('Error fetching streams:', error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setStreamsError(errorMsg);
      addToast(`❌ ${t("dashboard.errorLoading")}: ${errorMsg}`, 'error', 4000);
      setStreams([]);
    } finally {
      setStreamsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card variant="glass" padding="lg">
          <p className="text-center">{t("common.loading")}</p>
          {/* loading text */}
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
              {t("dashboard.title")}
            </h1>
            <p className="text-secondary">
              {t("dashboard.welcome")}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              variant="neon"
            >
              ✨ {t("dashboard.createStream")}
            </Button>
            <Button
              onClick={logout}
              variant="ghost"
            >
              {t("dashboard.disconnect")}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card variant="glass" padding="lg">
            <h2 className="text-xl font-bold mb-4">{t("dashboard.accountInfo")}</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-secondary">{t("dashboard.wallet")}</p>
                <p className="font-mono text-lg">
                  {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : t("dashboard.notConnected")}
                </p>
              </div>
              <div>
                <p className="text-sm text-secondary">{t("dashboard.email")}</p>
                <p className="font-mono text-sm">
                  {user?.email || t("common.loading")}
                </p>
              </div>
              <div>
                <p className="text-sm text-secondary">{t("dashboard.role")}</p>
                <p className="capitalize">
                  {user?.role || t("common.loading")}
                </p>
              </div>
            </div>
          </Card>

          <Card variant="glass" padding="lg">
            <h2 className="text-xl font-bold mb-4">{t("dashboard.stats")}</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-secondary">{t("dashboard.activeStreams")}</p>
                <p className="text-2xl font-bold text-gradient">{activeStreams.length}</p>
              </div>
              <div>
                <p className="text-sm text-secondary">{t("dashboard.totalDeposited")}</p>
                <p className="text-2xl font-bold">${totalDeposited.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-secondary">{t("common.status")}:</p>
                <p className="text-green-500">✅ {t("dashboard.statusActive")}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Streams Ativos */}
        <Card variant="glass" padding="lg" className="mb-8">
          <h2 className="text-2xl font-bold mb-6">{t("dashboard.activeListTitle")} ({activeStreams.length})</h2>
          
          {streamsLoading ? (
            <div className="text-center py-8">
              <p className="text-secondary">{t("dashboard.loadingStreams")}</p>
            </div>
          ) : streamsError ? (
            <div className="bg-red-500/10 border border-red-500 rounded p-4 mb-4">
              <p className="text-red-400">⚠️ {t("dashboard.errorLoading")}: {streamsError}</p>
              <Button onClick={fetchStreams} variant="ghost" className="mt-2">
                {t("dashboard.retry")}
              </Button>
            </div>
          ) : activeStreams.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-secondary mb-4">{t("dashboard.noActive")}</p>
              <Button variant="neon" onClick={() => setIsCreateModalOpen(true)}>
                {t("dashboard.createStream")}
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
                      To: {`${String(stream.recipient).slice(0, 6)}...${String(stream.recipient).slice(-4)}`}
                    </p>
                  </div>
                  
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex justify-between">
                      <span className="text-secondary">{t("common.token")}:</span>
                      <span className="font-semibold">{stream.token}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary">{t("dashboard.totalDeposited")}:</span>
                      <span className="font-semibold">{stream.deposit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary">{t("history.rate")}</span>
                      <span className="font-semibold text-cyan-400">{stream.rate_per_second}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary">{t("common.status")}:</span>
                      <span className="px-2 py-0.5 rounded text-xs bg-green-500/20 text-green-400">
                        {stream.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="neon" className="flex-1">
                      {t("dashboard.claim")}
                    </Button>
                    <Button variant="neon" className="flex-1">
                      {t("dashboard.details")}
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
            <h2 className="text-2xl font-bold mb-6">{t("dashboard.historyTitle")} ({completedStreams.length})</h2>
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
                      <span className="text-secondary">{t("common.token")}:</span>
                      <span className="font-semibold">{stream.token}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary">{t("dashboard.totalDeposited")}:</span>
                      <span className="font-semibold">{stream.deposit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary">{t("common.status")}:</span>
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
          <h2 className="text-xl font-bold mb-4">{t("dashboard.actionsTitle")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="neon"
              fullWidth
              onClick={() => setIsCreateModalOpen(true)}
            >
              {t("dashboard.createStream")}
            </Button>
            <Button
              variant="neon"
              fullWidth
              onClick={fetchStreams}
            >
              {t("dashboard.refresh")}
            </Button>
            <Button
              variant="neon"
              fullWidth
              onClick={() => router.push("/historico")}
            >
              {t("dashboard.fullHistory")}
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
