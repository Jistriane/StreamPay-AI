"use client";

import React, { useMemo, useState } from "react";
import Card from "./Card";
import Button from "./Button";

type TxRequest = {
  label: string;
  tx: {
    to: string;
    data: string;
    value?: string;
  };
};

export interface SignatureRequestPayload {
  version: "1";
  requestId: string;
  intent: string;
  userAddress: string;
  network: "sepolia" | "localhost";
  chainId: number;
  parameters: Record<string, any>;
  issuedAt: number;
  expiresAt: number;
}

export interface SignatureRequest {
  pendingSignature: true;
  messageToSign: string;
  payload: SignatureRequestPayload;
}

interface TransactionConfirmProps {
  isOpen: boolean;
  onClose: () => void;
  request: SignatureRequest | null;
  backendUrl?: string; // default http://localhost:3001
  onSuccess?: (txHashes: string[]) => void;
}

export default function TransactionConfirm({
  isOpen,
  onClose,
  request,
  backendUrl,
  onSuccess,
}: TransactionConfirmProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<string>("idle");
  const [txHashes, setTxHashes] = useState<string[]>([]);
  const [txStatuses, setTxStatuses] = useState<
    Record<string, "sent" | "confirmed" | "failed">
  >({});

  const effectiveBackendUrl =
    backendUrl ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    "http://localhost:3001";

  const summary = useMemo(() => {
    if (!request) return null;
    return {
      intent: request.payload.intent,
      userAddress: request.payload.userAddress,
      expiresAt: new Date(request.payload.expiresAt).toLocaleString(),
      network: request.payload.network,
    };
  }, [request]);

  if (!isOpen || !request) return null;

  const signAndExecute = async () => {
    setError(null);
    setLoading(true);
    setTxHashes([]);
    setTxStatuses({});

    try {
      const eth = (window as any).ethereum;
      if (!eth) throw new Error("MetaMask não encontrado. Instale a extensão.");

      // Lazy import to avoid SSR issues
      const { BrowserProvider } = await import("ethers");
      const provider = new BrowserProvider(eth);
      const signer = await provider.getSigner();

      setStep("signing");
      const signature = await signer.signMessage(request.messageToSign);

      const token = localStorage.getItem("authToken");
      if (!token)
        throw new Error(
          "Você precisa estar autenticado (token ausente). Faça login novamente."
        );

      setStep("preparing");
      const r = await fetch(
        `${effectiveBackendUrl}/api/agent/execute-contract`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            signature,
            payload: request.payload,
          }),
        }
      );

      if (!r.ok) {
        const data = await r.json().catch(() => ({}));
        throw new Error(
          data?.message ||
            data?.error ||
            "Falha ao preparar transação no backend."
        );
      }

      const data = (await r.json()) as {
        success: boolean;
        txRequests: TxRequest[];
      };
      const txs = data.txRequests || [];
      if (!txs.length)
        throw new Error("Nenhuma transação retornada para executar.");

      setStep("sending");
      const hashes: string[] = [];
      for (const item of txs) {
        const txResp = await signer.sendTransaction({
          to: item.tx.to,
          data: item.tx.data,
          value: item.tx.value ? BigInt(item.tx.value) : undefined,
        });
        hashes.push(txResp.hash);
        setTxHashes([...hashes]);
        setTxStatuses((prev) => ({ ...prev, [txResp.hash]: "sent" }));
        // Espera confirmação para manter ordem (approve -> create, etc.)
        const receipt = await txResp.wait();
        setTxStatuses((prev) => ({
          ...prev,
          [txResp.hash]: receipt?.status === 1 ? "confirmed" : "failed",
        }));
        if (receipt?.status !== 1) {
          throw new Error(`Transação falhou (revert): ${txResp.hash}`);
        }
      }

      setStep("done");
      onSuccess?.(hashes);
      // Mantém o modal aberto por padrão para o usuário copiar hashes; fechar via botão.
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      setStep("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card variant="glass" padding="lg" className="max-w-lg w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Confirmar transação</h2>
          <button
            onClick={onClose}
            className="text-secondary hover:text-white text-2xl"
            disabled={loading}
          >
            ✕
          </button>
        </div>

        {summary && (
          <div className="bg-slate-800/50 border border-slate-700 rounded p-3 mb-4 text-sm">
            <div className="flex flex-col gap-1">
              <div>
                <span className="text-secondary">Ação:</span>{" "}
                <span className="text-white">{summary.intent}</span>
              </div>
              <div className="font-mono break-all">
                <span className="text-secondary">Wallet:</span>{" "}
                <span className="text-white">{summary.userAddress}</span>
              </div>
              <div>
                <span className="text-secondary">Expira em:</span>{" "}
                <span className="text-white">{summary.expiresAt}</span>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded p-3 mb-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {txHashes.length > 0 && (
          <div className="bg-slate-800/50 border border-slate-700 rounded p-3 mb-4">
            <p className="text-secondary text-sm mb-2">Transações enviadas:</p>
            <ul className="text-xs font-mono break-all space-y-1">
              {txHashes.map((h) => {
                const st = txStatuses[h] || "sent";
                const label =
                  st === "confirmed"
                    ? "confirmada"
                    : st === "failed"
                    ? "falhou"
                    : "pendente";
                const explorerBase =
                  summary?.network === "sepolia"
                    ? "https://sepolia.etherscan.io/tx/"
                    : undefined;
                return (
                  <li key={h}>
                    <span className="text-secondary">[{label}]</span>{" "}
                    {explorerBase ? (
                      <a
                        className="text-cyan-400 hover:underline"
                        href={`${explorerBase}${h}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {h}
                      </a>
                    ) : (
                      h
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        <div className="flex items-center justify-between gap-3 pt-2">
          <div className="text-xs text-secondary">
            Status:{" "}
            <span className="text-white">
              {step === "idle"
                ? "pronto"
                : step === "signing"
                ? "assinando"
                : step === "preparing"
                ? "preparando"
                : step === "sending"
                ? "enviando"
                : step === "done"
                ? "concluído"
                : "erro"}
            </span>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={onClose} disabled={loading}>
              Fechar
            </Button>
            <Button variant="neon" onClick={signAndExecute} disabled={loading}>
              {loading ? "Processando..." : "Assinar e enviar"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
