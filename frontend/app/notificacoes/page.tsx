"use client";
import React, { useState, useEffect } from "react";
import { useI18n } from "../i18n";

export default function NotificacoesPage() {
  const [notificacoes, setNotificacoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useI18n();

  useEffect(() => {
    fetch("/api/notificacoes")
      .then(res => res.json())
      .then(data => {
        setNotificacoes(data.notificacoes || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 to-blue-900 p-8">
      <h1 className="text-3xl font-bold text-cyan-400 mb-8">{t("notifications.title")}</h1>
      <div className="bg-slate-800/50 rounded-lg p-6">
        {loading && <p className="text-cyan-300">{t("notifications.loading")}</p>}
        {!loading && notificacoes.length === 0 && <p className="text-gray-400">{t("notifications.none")}</p>}
        {!loading && notificacoes.length > 0 && (
          <ul>
            {notificacoes.map((n, idx) => (
              <li key={idx} className="mb-4 p-3 border-b border-slate-700">
                <div className="text-cyan-300 font-bold">{n.titulo}</div>
                <div className="text-white">{n.mensagem}</div>
                <div className="text-xs text-gray-400 mt-1">{n.data}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}