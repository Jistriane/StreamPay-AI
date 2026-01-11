"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Card from "@/app/components/Card";
import Button from "@/app/components/Button";
import { fetchWithAuth } from "@/app/lib/api";
import { useToast } from "@/app/components/ToastProvider";
import { useI18n } from "../../i18n";

interface Stream {
  id: string | number;
  sender: string;
  recipient: string;
  token: string;
  deposit: string;
  rate_per_second: string;
  status: string;
  created_at: string;
  updated_at?: string;
  claimed_amount?: string;
  remaining_balance?: string;
}

export default function StreamDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { addToast } = useToast();
  const { t } = useI18n();
  const streamId = params?.id as string;

  const [stream, setStream] = useState<Stream | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Fetch stream details
  useEffect(() => {
    if (!streamId) return;
    
    const fetchStream = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchWithAuth(
          `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/streams/${streamId}`
        );

        if (!response.ok) {
          throw new Error(t("stream.notFound"));
        }

        const data = await response.json();
        setStream(data.data);
      } catch (err) {
        console.error('Error fetching stream:', err);
        setError(err instanceof Error ? err.message : t("history.unknownError"));
      } finally {
        setLoading(false);
      }
    };

    fetchStream();
  }, [streamId]);

  const handleClaim = async () => {
    if (!stream) return;
    
    setActionLoading(true);
    setActionMessage(null);
    try {
      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/streams/${streamId}/claim`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        }
      );

      if (!response.ok) {
        throw new Error(t("stream.claimError"));
      }

      addToast(`✅ ${t("stream.claimSuccess")}`, 'success', 3000);
      setActionMessage(`✅ ${t("stream.claimSuccess")}`);
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : t("history.unknownError");
      setActionMessage(`❌ ${t("chat.errorPrefix")}: ${errorMsg}`);
      addToast(`❌ ${t("stream.claimError")}: ${errorMsg}`, 'error', 4000);
    } finally {
      setActionLoading(false);
    }
  };

  const handlePause = async () => {
    if (!stream) return;
    
    setActionLoading(true);
    setActionMessage(null);
    try {
      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/streams/${streamId}/pause`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      if (!response.ok) {
        throw new Error(t("stream.pauseError"));
      }

      addToast(`⏸️ ${t("stream.pauseSuccess")}`, 'success', 3000);
      setActionMessage(`⏸️ ${t("stream.pauseSuccess")}`);
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : t("history.unknownError");
      setActionMessage(`❌ ${t("chat.errorPrefix")}: ${errorMsg}`);
      addToast(`❌ ${t("stream.pauseError")}: ${errorMsg}`, 'error', 4000);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!stream || !confirm(t("stream.confirmCancel"))) return;
    
    setActionLoading(true);
    setActionMessage(null);
    try {
      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/streams/${streamId}`,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      if (!response.ok) {
        throw new Error(t("stream.cancelError"));
      }

      addToast(`🗑️ ${t("stream.cancelSuccess")}`, 'success', 3000);
      setActionMessage(`🗑️ ${t("stream.cancelSuccess")}`);
      setTimeout(() => router.push('/dashboard'), 1500);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : t("history.unknownError");
      setActionMessage(`❌ ${t("chat.errorPrefix")}: ${errorMsg}`);
      addToast(`❌ ${t("stream.cancelError")}: ${errorMsg}`, 'error', 4000);
    } finally {
      setActionLoading(false);
    }
  };

  const calculateFlowInfo = () => {
    if (!stream) return { perHour: 0, perDay: 0, perMonth: 0 };
    
    const ratePerSecond = parseFloat(stream.rate_per_second || '0');
    const perHour = ratePerSecond * 3600;
    const perDay = perHour * 24;
    const perMonth = perDay * 30;

    return { perHour, perDay, perMonth };
  };

  const flowInfo = calculateFlowInfo();
  const statusColor = stream?.status === 'active' ? 'text-green-400' : stream?.status === 'paused' ? 'text-yellow-400' : 'text-red-400';
  const statusBg = stream?.status === 'active' ? 'bg-green-500/20' : stream?.status === 'paused' ? 'bg-yellow-500/20' : 'bg-red-500/20';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <Card variant="glass" padding="lg">
          <p className="text-center">{t("stream.loading")}</p>
        </Card>
      </div>
    );
  }

  if (error || !stream) {
    return (
      <div className="min-h-screen py-8 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="max-w-4xl mx-auto px-4">
          <Card variant="glass" padding="lg" className="text-center">
            <p className="text-red-400 mb-4">❌ {error || t("stream.notFound")}</p>
            <Button onClick={() => router.push('/dashboard')} variant="neon">
              {t("stream.backDashboard")}
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-gradient mb-2">
              {t("stream.detailTitle")} {stream.id}
            </h1>
            <p className="text-secondary">{t("stream.subtitle")}</p>
          </div>
          <Button onClick={() => router.push('/dashboard')} variant="ghost">
            ← {t("stream.back")}
          </Button>
        </div>

        <Card variant="glass" padding="lg" className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-secondary mb-2">{t("common.status")}</p>
              <div className={`px-4 py-2 rounded-lg ${statusBg} inline-block`}>
                <p className={`font-bold ${statusColor} uppercase`}>
                  {stream.status}
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm text-secondary mb-2">{t("history.createdAt")}</p>
              <p className="font-mono text-sm">
                {new Date(stream.created_at).toLocaleDateString('en-US')}
              </p>
            </div>

            <div>
              <p className="text-sm text-secondary mb-2">{t("common.token")}</p>
              <p className="text-xl font-bold text-cyan-400">{stream.token}</p>
            </div>
          </div>

          {actionMessage && (
            <div className={`mt-6 p-4 rounded-lg ${actionMessage.includes('❌') ? 'bg-red-500/20 border border-red-500/50' : 'bg-green-500/20 border border-green-500/50'}`}>
              <p className={actionMessage.includes('❌') ? 'text-red-400' : 'text-green-400'}>
                {actionMessage}
              </p>
            </div>
          )}
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card variant="glass" padding="lg">
            <h2 className="text-xl font-bold mb-4">{t("stream.addresses")}</h2>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-cyan-400 uppercase tracking-wider mb-1">{t("stream.from")}</p>
                <p className="font-mono text-sm break-all">
                  {stream.sender}
                </p>
              </div>
              <div>
                <p className="text-xs text-cyan-400 uppercase tracking-wider mb-1">{t("stream.to")}</p>
                <p className="font-mono text-sm break-all">
                  {stream.recipient}
                </p>
              </div>
            </div>
          </Card>

          <Card variant="glass" padding="lg">
            <h2 className="text-xl font-bold mb-4">{t("stream.values")}</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-secondary mb-1">{t("stream.deposited")}</p>
                <p className="text-2xl font-bold text-cyan-400">
                  {stream.deposit} {stream.token}
                </p>
              </div>
              {stream.claimed_amount && (
                <div>
                  <p className="text-sm text-secondary mb-1">{t("stream.claimed")}</p>
                  <p className="text-lg font-semibold text-green-400">
                    {stream.claimed_amount} {stream.token}
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>

        <Card variant="glass" padding="lg" className="mb-8">
          <h2 className="text-xl font-bold mb-4">{t("stream.flowRate")}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-800/50 rounded p-4">
              <p className="text-xs text-secondary mb-2">{t("stream.perSecond")}</p>
              <p className="text-lg font-bold text-cyan-400">{stream.rate_per_second}</p>
            </div>
            <div className="bg-slate-800/50 rounded p-4">
              <p className="text-xs text-secondary mb-2">{t("stream.perHour")}</p>
              <p className="text-lg font-bold text-cyan-400">{flowInfo.perHour.toFixed(2)}</p>
            </div>
            <div className="bg-slate-800/50 rounded p-4">
              <p className="text-xs text-secondary mb-2">{t("stream.perDay")}</p>
              <p className="text-lg font-bold text-cyan-400">{flowInfo.perDay.toFixed(2)}</p>
            </div>
            <div className="bg-slate-800/50 rounded p-4">
              <p className="text-xs text-secondary mb-2">{t("stream.perMonth")}</p>
              <p className="text-lg font-bold text-cyan-400">{flowInfo.perMonth.toFixed(2)}</p>
            </div>
          </div>
        </Card>

        {stream.remaining_balance && (
          <Card variant="glass" padding="lg" className="mb-8">
            <h2 className="text-xl font-bold mb-4">{t("stream.remainingBalance")}</h2>
            <p className="text-3xl font-bold text-green-400">
              {stream.remaining_balance} {stream.token}
            </p>
          </Card>
        )}

        <Card variant="glass" padding="lg">
          <h2 className="text-xl font-bold mb-4">{t("stream.actions")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stream.status === 'active' && (
              <>
                <Button
                  variant="neon"
                  onClick={handleClaim}
                  disabled={actionLoading}
                  fullWidth
                >
                  {actionLoading ? `⏳ ${t("stream.processing")}` : `💰 ${t("stream.claim")}`}
                </Button>
                <Button
                  variant="neon"
                  onClick={handlePause}
                  disabled={actionLoading}
                  fullWidth
                >
                  {actionLoading ? `⏳ ${t("stream.processing")}` : `⏸️ ${t("stream.pause")}`}
                </Button>
              </>
            )}
            <Button
              variant="neon"
              onClick={handleCancel}
              disabled={actionLoading || stream.status === 'cancelled'}
              fullWidth
              className={stream.status === 'cancelled' ? 'opacity-50 cursor-not-allowed' : ''}
            >
              {actionLoading ? `⏳ ${t("stream.processing")}` : `🗑️ ${t("stream.cancel")}`}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
