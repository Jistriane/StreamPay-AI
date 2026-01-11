"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Card from "@/app/components/Card";
import Button from "@/app/components/Button";
import { fetchWithAuth } from "@/app/lib/api";
import { useI18n } from "../i18n";

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
  const { t } = useI18n();
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
    // Verificar autenticação antes de buscar
    const token = localStorage.getItem('authToken');
    if (!token) {
      setLoading(false);
      setError(t("history.needAuth"));
      return;
    }
    fetchStreams();
  }, []);

  const fetchStreams = async () => {
    setLoading(true);
    setError(null);
    try {
      // Verificar se o usuário está autenticado
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
        throw new Error(errorData.message || t("history.error"));
      }

      const data = await response.json();
      setStreams(data.data || []);
    } catch (err) {
      console.error("Error fetching streams:", err);
      setError(err instanceof Error ? err.message : t("history.unknownError"));
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
            <p>{t("history.loading")}</p>
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
            <h1 className="text-4xl font-bold text-gradient mb-2">{t("history.title")}</h1>
            <p className="text-secondary">
              {t("history.subtitle")}
            </p>
          </div>
          <Button onClick={() => router.push("/dashboard")} variant="ghost">
            ← {t("history.back")}
          </Button>
        </div>

        {/* Filters */}
        <Card variant="glass" padding="lg" className="mb-8">
          <h2 className="text-xl font-bold mb-4">🔍 {t("history.filters")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm text-secondary mb-2">{t("history.status")}</label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="w-full bg-slate-800/50 border border-slate-700 rounded px-4 py-2 text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="all">{t("history.all")}</option>
                <option value="active">{t("common.active")}</option>
                <option value="pending">{t("common.pending")}</option>
                <option value="paused">{t("common.paused")}</option>
                <option value="completed">{t("common.completed")}</option>
                <option value="cancelled">{t("common.cancelled")}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-secondary mb-2">{t("history.token")}</label>
              <select
                name="token"
                value={filters.token}
                onChange={handleFilterChange}
                className="w-full bg-slate-800/50 border border-slate-700 rounded px-4 py-2 text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="all">{t("history.all")}</option>
                <option value="USDC">USDC</option>
                <option value="USDT">USDT</option>
                <option value="ETH">ETH</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-secondary mb-2">{t("history.from")}</label>
              <input
                type="date"
                name="dateFrom"
                value={filters.dateFrom}
                onChange={handleFilterChange}
                className="w-full bg-slate-800/50 border border-slate-700 rounded px-4 py-2 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-sm text-secondary mb-2">{t("history.to")}</label>
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
                variant="ghost"
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
                {t("history.clear")}
              </Button>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-700">
            <p className="text-secondary">
              {t("history.showing")} <span className="text-cyan-400 font-bold">{filteredCount}</span> {t("history.of")} {" "}
              <span className="text-cyan-400 font-bold">{totalCount}</span> {t("history.items")}
            </p>
          </div>
        </Card>

        {error && (
          <Card variant="glass" padding="lg" className="mb-8 border-red-500/50">
            <div className="text-center">
              <p className="text-red-400 mb-4">❌ {error}</p>
              <Button
                variant="neon"
                onClick={fetchStreams}
                className="mr-2"
              >
                🔄 {t("history.retry")}
              </Button>
              <Button
                variant="ghost"
                onClick={() => router.push('/login')}
              >
                🔐 {t("register.login")}
              </Button>
            </div>
          </Card>
        )}

        {/* Streams Grid */}
        {filteredStreams.length === 0 ? (
          <Card variant="glass" padding="lg" className="text-center">
            <p className="text-secondary mb-4">
              {t("history.none")}
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
              {t("history.clear")}
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredStreams.map((stream) => (
              <div
                key={stream.id}
                onClick={() => router.push(`/stream/${stream.id}`)}
                className="cursor-pointer"
              >
                <Card
                  variant="glass"
                  padding="lg"
                  className="hover:border-cyan-400/50 transition"
                >
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                  {/* Stream ID */}
                  <div>
                    <p className="text-xs text-secondary mb-1">ID</p>
                    <p className="font-bold">#{stream.id}</p>
                  </div>

                  {/* Status */}
                  <div>
                    <p className="text-xs text-secondary mb-1">{t("history.status")}</p>
                    <div className={`px-3 py-1 rounded inline-block ${getStatusBg(stream.status)}`}>
                      <p className={`text-sm font-bold uppercase ${getStatusColor(stream.status)}`}>
                        {stream.status}
                      </p>
                    </div>
                  </div>

                  {/* Token & Amount */}
                  <div>
                    <p className="text-xs text-secondary mb-1">{t("history.amount")}</p>
                    <p className="font-bold text-cyan-400">
                      {stream.deposit} {stream.token}
                    </p>
                  </div>

                  {/* Taxa */}
                  <div>
                    <p className="text-xs text-secondary mb-1">{t("history.rate")}</p>
                    <p className="font-mono text-sm">{stream.rate_per_second}</p>
                  </div>

                  {/* Data */}
                  <div>
                    <p className="text-xs text-secondary mb-1">{t("history.createdAt")}</p>
                    <p className="text-sm">
                      {new Date(stream.created_at).toLocaleDateString("en-US")}
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
                      {t("dashboard.details")} →
                    </Button>
                  </div>
                </div>
                </Card>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}