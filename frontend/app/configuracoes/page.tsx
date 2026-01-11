"use client";
import React, { useState, useEffect } from "react";
import { useI18n } from "../i18n";

export default function ConfiguracoesPage() {
  const [perfil, setPerfil] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const { t } = useI18n();

  useEffect(() => {
    fetch("/api/usuario/perfil")
      .then(res => res.json())
      .then(data => {
        setPerfil(data);
        setNome(data.nome || "");
        setEmail(data.email || "");
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(t("settings.saving"));
    try {
      const res = await fetch("/api/usuario/perfil", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email })
      });
      const data = await res.json();
      if (res.ok && data.sucesso) {
        setStatus(t("settings.updated"));
      } else {
        setStatus(`${t("settings.failure")}: ${data.error || "Failed to update profile"}`);
      }
    } catch (err: any) {
      setStatus(`${t("settings.failure")}: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 to-blue-900 p-8">
      <h1 className="text-3xl font-bold text-cyan-400 mb-8">{t("settings.title")}</h1>
      <div className="bg-slate-800/50 rounded-lg p-6">
        {loading && <p className="text-cyan-300">{t("settings.loading")}</p>}
        {!loading && perfil && (
          <form onSubmit={handleSalvar}>
            <label className="block mb-2 text-cyan-300">{t("settings.name")}</label>
            <input type="text" value={nome} onChange={e => setNome(e.target.value)} placeholder="Name" className="w-full mb-4 p-3 rounded bg-slate-700 text-white" />
            <label className="block mb-2 text-cyan-300">{t("settings.email")}</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="w-full mb-6 p-3 rounded bg-slate-700 text-white" />
            <button type="submit" className="w-full py-3 bg-cyan-500 rounded-lg hover:bg-cyan-600">{t("settings.save")}</button>
          </form>
        )}
        {status && <div className="mt-4 text-cyan-300">{status}</div>}
        {!loading && !perfil && <p className="text-red-400">{t("settings.failure")}</p>}
      </div>
    </div>
  );
}