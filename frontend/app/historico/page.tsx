"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
}

interface Filters {
  status: "all" | "active" | "pending" | "completed" | "cancelled" | "paused";
  token: "all" | "USDC" | "USDT" | "ETH";
  dateFrom: string;
  dateTo: string;
}

export default function HistoricoPage() {
  const router = useRouter();
  const [streams, setStreams] = useState<Stream[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({
    status: "all",
    token: "all",
    dateFrom: "",
    dateTo: "",
  });

  // Buscar streams
  useEffect(() => {
    fetchStreams();
  }, []);

  const fetchStreams = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/streams`
      );

      if (!response.ok) {
        throw new Error("Erro ao buscar histórico");
      }

      const data = await response.json();
      setStreams(data.data || []);
    } catch (err) {
      console.error("Erro ao buscar streams:", err);
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value as any }));
  };

  const getFilteredStreams = () => {
    return streams.filter((stream) => {
      // Filter by status
      if (filters.status !== "all" && stream.status !== filters.status) {
        return false;
      }

      // Filter by token
      if (filters.token !== "all" && stream.token !== filters.token) {
        return false;
      }

      // Filter by date range
      const streamDate = new Date(stream.created_at);
      if (filters.dateFrom) {
        const fromDate = new Date(filters.dateFrom);
        if (streamDate < fromDate) return false;
      }

      if (filters.dateTo) {
        const toDate = new Date(filters.dateTo);
        toDate.setHours(23, 59, 59, 999);
        if (streamDate > toDate) return false;
      }

      return true;
    });
  };

  const filteredStreams = getFilteredStreams();
  const totalCount = streams.length;
  const filteredCount = filteredStreams.length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
      case "pending":
        return "text-green-400";
      case "paused":
        return "text-yellow-400";
      case "completed":
      case "cancelled":
        return "text-red-400";
      default:
        return "text-secondary";
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case "active":
      case "pending":
        return "bg-green-500/20";
      case "paused":
        return "bg-yellow-500/20";
      case "completed":
      case "cancelled":
        return "bg-red-500/20";
      default:
        return "bg-slate-800/50";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-8 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="max-w-6xl mx-auto px-4">
          <Card variant="glass" padding="lg" className="text-center">
            <p>Carregando histórico...</p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-gradient mb-2">Histórico</h1>
            <p className="text-secondary">
              Todos os seus streams e transações
            </p>
          </div>
          <Button onClick={() => router.push("/dashboard")} variant="outlined">
            ← Voltar
          </Button>
        </div>

        {/* Filters */}
        <Card variant="glass" padding="lg" className="mb-8">
          <h2 className="text-xl font-bold mb-4">🔍 Filtros</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm text-secondary mb-2">Status</label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="w-full bg-slate-800/50 border border-slate-700 rounded px-4 py-2 text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="all">Todos</option>
                <option value="active">Ativo</option>
                <option value="pending">Pendente</option>
                <option value="paused">Pausado</option>
                <option value="completed">Concluído</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-secondary mb-2">Token</label>
              <select
                name="token"
                value={filters.token}
                onChange={handleFilterChange}
                className="w-full bg-slate-800/50 border border-slate-700 rounded px-4 py-2 text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="all">Todos</option>
                <option value="USDC">USDC</option>
                <option value="USDT">USDT</option>
                <option value="ETH">ETH</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-secondary mb-2">De</label>
              <input
                type="date"
                name="dateFrom"
                value={filters.dateFrom}
                onChange={handleFilterChange}
                className="w-full bg-slate-800/50 border border-slate-700 rounded px-4 py-2 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-sm text-secondary mb-2">Até</label>
              <input
                type="date"
                name="dateTo"
                value={filters.dateTo}
                onChange={handleFilterChange}
                className="w-full bg-slate-800/50 border border-slate-700 rounded px-4 py-2 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="flex items-end">
              <Button
                variant="outlined"
                onClick={() =>
                  setFilters({
                    status: "all",
                    token: "all",
                    dateFrom: "",
                    dateTo: "",
                  })
                }
                fullWidth
              >
                Limpar Filtros
              </Button>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-700">
            <p className="text-secondary">
              Mostrando <span className="text-cyan-400 font-bold">{filteredCount}</span> de{" "}
              <span className="text-cyan-400 font-bold">{totalCount}</span> streams
            </p>
          </div>
        </Card>

        {error && (
          <Card variant="glass" padding="lg" className="mb-8 border-red-500/50">
            <p className="text-red-400">❌ {error}</p>
          </Card>
        )}

        {/* Streams Grid */}
        {filteredStreams.length === 0 ? (
          <Card variant="glass" padding="lg" className="text-center">
            <p className="text-secondary mb-4">
              Nenhum stream encontrado com os filtros selecionados
            </p>
            <Button
              variant="neon"
              onClick={() =>
                setFilters({
                  status: "all",
                  token: "all",
                  dateFrom: "",
                  dateTo: "",
                })
              }
            >
              Limpar Filtros
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredStreams.map((stream) => (
              <Card
                key={stream.id}
                variant="glass"
                padding="lg"
                className="cursor-pointer hover:border-cyan-400/50 transition"
                onClick={() => router.push(`/stream/${stream.id}`)}
              >
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                  {/* Stream ID */}
                  <div>
                    <p className="text-xs text-secondary mb-1">ID</p>
                    <p className="font-bold">#{stream.id}</p>
                  </div>

                  {/* Status */}
                  <div>
                    <p className="text-xs text-secondary mb-1">Status</p>
                    <div className={`px-3 py-1 rounded inline-block ${getStatusBg(stream.status)}`}>
                      <p className={`text-sm font-bold uppercase ${getStatusColor(stream.status)}`}>
                        {stream.status}
                      </p>
                    </div>
                  </div>

                  {/* Token & Amount */}
                  <div>
                    <p className="text-xs text-secondary mb-1">Valor</p>
                    <p className="font-bold text-cyan-400">
                      {stream.deposit} {stream.token}
                    </p>
                  </div>

                  {/* Taxa */}
                  <div>
                    <p className="text-xs text-secondary mb-1">Taxa/seg</p>
                    <p className="font-mono text-sm">{stream.rate_per_second}</p>
                  </div>

                  {/* Data */}
                  <div>
                    <p className="text-xs text-secondary mb-1">Criado em</p>
                    <p className="text-sm">
                      {new Date(stream.created_at).toLocaleDateString("pt-BR")}
                    </p>
                  </div>

                  {/* Action */}
                  <div className="flex justify-end">
                    <Button
                      variant="neon"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/stream/${stream.id}`);
                      }}
                    >
                      Ver Detalhes →
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}