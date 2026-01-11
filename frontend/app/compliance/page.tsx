"use client";
import React from 'react';
import { useEffect, useState } from "react";
import { useI18n } from "../i18n";

export default function CompliancePage() {
  const [kyc, setKyc] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { t } = useI18n();

  useEffect(() => {
    fetch("/api/kyc-status")
      .then(res => res.json())
      .then(data => {
        setKyc(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const statusLabel = (status: string) => {
    if (status === "aprovado" || status === "approved") return t("compliance.approved");
    if (status === "pendente" || status === "pending") return t("compliance.pending");
    return status;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f2027] via-[#2c5364] to-[#00eaff] p-8 animate-fade-in">
      <h1 className="text-4xl font-bold text-cyan-400 mb-8 neon-glow">{t("compliance.title")}</h1>
      <div className="bg-slate-900/80 rounded-2xl p-8 shadow-2xl border border-cyan-500/30">
        {loading && <p className="text-cyan-300 animate-pulse">{t("compliance.loading")}</p>}
        {!loading && kyc && (
          <div>
            <div className="mb-4"><strong className="text-cyan-300">{t("compliance.status")}:</strong> <span className={(kyc.status === 'aprovado' || kyc.status === 'approved') ? 'text-green-400' : 'text-yellow-400'}>{statusLabel(kyc.status)}</span></div>
            {kyc.motivo && <div className="mb-4 text-red-400">{t("compliance.reason")}: {kyc.motivo}</div>}
            {kyc.data && <div className="text-xs text-gray-400">{t("compliance.lastCheck")}: {kyc.data}</div>}
          </div>
        )}
        {!loading && !kyc && <p className="text-red-400">{t("compliance.failure")}</p>}
      </div>
    </div>
  );
}