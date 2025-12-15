"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Card from "@/app/components/Card";
import Button from "@/app/components/Button";
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
  updated_at?: string;
  claimed_amount?: string;
  remaining_balance?: string;
}

export default function StreamDetailPage() {
  const router = useRouter();
  const params = useParams();
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
          throw new Error('Stream não encontrado');
        }

        const data = await response.json();
        setStream(data.data);
      } catch (err) {
        console.error('Erro ao buscar stream:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
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
        throw new Error('Erro ao reivindicar stream');
      }

      setActionMessage('✅ Stream reivindicado com sucesso!');
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      setActionMessage(`❌ Erro: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
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
        throw new Error('Erro ao pausar stream');
      }

      setActionMessage('⏸️ Stream pausado com sucesso!');
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      setActionMessage(`❌ Erro: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!stream || !confirm('Tem certeza que deseja cancelar este stream?')) return;
    
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
        throw new Error('Erro ao cancelar stream');
      }

      setActionMessage('🗑️ Stream cancelado com sucesso!');
      setTimeout(() => router.push('/dashboard'), 1500);
    } catch (err) {
      setActionMessage(`❌ Erro: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
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
          <p className="text-center">Carregando detalhes do stream...</p>
        </Card>
      </div>
    );
  }

  if (error || !stream) {
    return (
      <div className="min-h-screen py-8 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="max-w-4xl mx-auto px-4">
          <Card variant="glass" padding="lg" className="text-center">
            <p className="text-red-400 mb-4">❌ {error || 'Stream não encontrado'}</p>
            <Button onClick={() => router.push('/dashboard')} variant="neon">
              Voltar ao Dashboard
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
              Stream #{stream.id}
            </h1>
            <p className="text-secondary">Detalhes completos da transação</p>
          </div>
          <Button onClick={() => router.push('/dashboard')} variant="outlined">
            ← Voltar
          </Button>
        </div>

        <Card variant="glass" padding="lg" className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-secondary mb-2">Status</p>
              <div className={`px-4 py-2 rounded-lg ${statusBg} inline-block`}>
                <p className={`font-bold ${statusColor} uppercase`}>
                  {stream.status}
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm text-secondary mb-2">Criado em</p>
              <p className="font-mono text-sm">
                {new Date(stream.created_at).toLocaleDateString('pt-BR')}
              </p>
            </div>

            <div>
              <p className="text-sm text-secondary mb-2">Token</p>
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
            <h2 className="text-xl font-bold mb-4">Endereços</h2>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-cyan-400 uppercase tracking-wider mb-1">De (Sender)</p>
                <p className="font-mono text-sm break-all">
                  {stream.sender}
                </p>
              </div>
              <div>
                <p className="text-xs text-cyan-400 uppercase tracking-wider mb-1">Para (Recipient)</p>
                <p className="font-mono text-sm break-all">
                  {stream.recipient}
                </p>
              </div>
            </div>
          </Card>

          <Card variant="glass" padding="lg">
            <h2 className="text-xl font-bold mb-4">Valores</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-secondary mb-1">Depositado</p>
                <p className="text-2xl font-bold text-cyan-400">
                  {stream.deposit} {stream.token}
                </p>
              </div>
              {stream.claimed_amount && (
                <div>
                  <p className="text-sm text-secondary mb-1">Reivindicado</p>
                  <p className="text-lg font-semibold text-green-400">
                    {stream.claimed_amount} {stream.token}
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>

        <Card variant="glass" padding="lg" className="mb-8">
          <h2 className="text-xl font-bold mb-4">Taxa de Fluxo</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-800/50 rounded p-4">
              <p className="text-xs text-secondary mb-2">Por Segundo</p>
              <p className="text-lg font-bold text-cyan-400">{stream.rate_per_second}</p>
            </div>
            <div className="bg-slate-800/50 rounded p-4">
              <p className="text-xs text-secondary mb-2">Por Hora</p>
              <p className="text-lg font-bold text-cyan-400">{flowInfo.perHour.toFixed(2)}</p>
            </div>
            <div className="bg-slate-800/50 rounded p-4">
              <p className="text-xs text-secondary mb-2">Por Dia</p>
              <p className="text-lg font-bold text-cyan-400">{flowInfo.perDay.toFixed(2)}</p>
            </div>
            <div className="bg-slate-800/50 rounded p-4">
              <p className="text-xs text-secondary mb-2">Por Mês</p>
              <p className="text-lg font-bold text-cyan-400">{flowInfo.perMonth.toFixed(2)}</p>
            </div>
          </div>
        </Card>

        {stream.remaining_balance && (
          <Card variant="glass" padding="lg" className="mb-8">
            <h2 className="text-xl font-bold mb-4">Saldo Restante</h2>
            <p className="text-3xl font-bold text-green-400">
              {stream.remaining_balance} {stream.token}
            </p>
          </Card>
        )}

        <Card variant="glass" padding="lg">
          <h2 className="text-xl font-bold mb-4">Ações Disponíveis</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stream.status === 'active' && (
              <>
                <Button
                  variant="neon"
                  onClick={handleClaim}
                  disabled={actionLoading}
                  fullWidth
                >
                  {actionLoading ? '⏳ Processando...' : '💰 Reivindicar'}
                </Button>
                <Button
                  variant="neon"
                  onClick={handlePause}
                  disabled={actionLoading}
                  fullWidth
                >
                  {actionLoading ? '⏳ Processando...' : '⏸️ Pausar'}
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
              {actionLoading ? '⏳ Processando...' : '🗑️ Cancelar'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
