"use client";
import React, { useState } from "react";
import Card from "./Card";
import Button from "./Button";
import { fetchWithAuth } from "@/app/lib/api";
import { useToast } from "./ToastProvider";

interface CreateStreamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStreamCreated?: () => void;
}

export default function CreateStreamModal({
  isOpen,
  onClose,
  onStreamCreated,
}: CreateStreamModalProps) {
  const { addToast } = useToast();
  const [formData, setFormData] = useState({
    recipient: "",
    token: "USDC",
    deposit: "",
    rate_per_second: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const calculateMonthly = () => {
    const ratePerSecond = parseFloat(formData.rate_per_second) || 0;
    return (ratePerSecond * 3600 * 24 * 30).toFixed(2);
  };

  const validateForm = () => {
    if (!formData.recipient.trim()) {
      setError("Endereço do destinatário é obrigatório");
      return false;
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(formData.recipient)) {
      setError("Endereço Ethereum inválido (deve começar com 0x)");
      return false;
    }

    if (!formData.deposit || parseFloat(formData.deposit) <= 0) {
      setError("Valor de depósito deve ser maior que zero");
      return false;
    }

    if (!formData.rate_per_second || parseFloat(formData.rate_per_second) <= 0) {
      setError("Taxa por segundo deve ser maior que zero");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/streams`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            recipient: formData.recipient,
            token: formData.token,
            deposit: formData.deposit,
            rate_per_second: formData.rate_per_second,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Erro ao criar stream"
        );
      }

      setSuccess(true);
      addToast("✅ Stream criado com sucesso!", "success", 3000);
      setFormData({
        recipient: "",
        token: "USDC",
        deposit: "",
        rate_per_second: "",
      });

      setTimeout(() => {
        onStreamCreated?.();
        onClose();
      }, 1500);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Erro desconhecido";
      setError(errorMsg);
      addToast(`❌ Erro ao criar stream: ${errorMsg}`, "error", 4000);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card variant="glass" padding="lg" className="max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Criar Novo Stream</h2>
          <button
            onClick={onClose}
            className="text-secondary hover:text-white text-2xl"
            disabled={loading}
          >
            ✕
          </button>
        </div>

        {success ? (
          <div className="text-center py-8">
            <p className="text-4xl mb-4">✅</p>
            <p className="text-green-400 font-bold mb-2">Stream criado com sucesso!</p>
            <p className="text-secondary text-sm">Redirecionando...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded p-3">
                <p className="text-red-400 text-sm">❌ {error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm text-secondary mb-2">
                Endereço do Destinatário
              </label>
              <input
                type="text"
                name="recipient"
                value={formData.recipient}
                onChange={handleInputChange}
                placeholder="0x..."
                className="w-full bg-slate-800/50 border border-slate-700 rounded px-4 py-2 text-white placeholder-secondary focus:outline-none focus:border-cyan-400 font-mono text-sm"
                disabled={loading}
              />
              <p className="text-xs text-secondary mt-1">
                Endereço Ethereum de 42 caracteres
              </p>
            </div>

            <div>
              <label className="block text-sm text-secondary mb-2">Token</label>
              <select
                name="token"
                value={formData.token}
                onChange={handleInputChange}
                className="w-full bg-slate-800/50 border border-slate-700 rounded px-4 py-2 text-white focus:outline-none focus:border-cyan-400"
                disabled={loading}
              >
                <option value="USDC">USDC</option>
                <option value="USDT">USDT</option>
                <option value="ETH">ETH</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-secondary mb-2">
                Valor de Depósito ({formData.token})
              </label>
              <input
                type="number"
                name="deposit"
                value={formData.deposit}
                onChange={handleInputChange}
                placeholder="100.00"
                step="0.01"
                className="w-full bg-slate-800/50 border border-slate-700 rounded px-4 py-2 text-white placeholder-secondary focus:outline-none focus:border-cyan-400"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm text-secondary mb-2">
                Taxa por Segundo ({formData.token})
              </label>
              <input
                type="number"
                name="rate_per_second"
                value={formData.rate_per_second}
                onChange={handleInputChange}
                placeholder="0.01"
                step="0.0001"
                className="w-full bg-slate-800/50 border border-slate-700 rounded px-4 py-2 text-white placeholder-secondary focus:outline-none focus:border-cyan-400"
                disabled={loading}
              />
              {formData.rate_per_second && (
                <div className="mt-2 p-3 bg-slate-800/50 rounded text-sm">
                  <p className="text-secondary mb-1">Estimativa mensal:</p>
                  <p className="text-cyan-400 font-bold">
                    {calculateMonthly()} {formData.token}
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-4">
              <Button
                variant="ghost"
                onClick={onClose}
                disabled={loading}
                fullWidth
              >
                Cancelar
              </Button>
              <Button
                variant="neon"
                type="submit"
                disabled={loading}
                fullWidth
              >
                {loading ? "⏳ Criando..." : "✓ Criar"}
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}
