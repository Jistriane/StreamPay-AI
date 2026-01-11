"use client";
import React, { useState } from "react";
import Card from "../components/Card";
import Button from "../components/Button";
import Input from "../components/Input";
import { useI18n } from "../i18n";

export default function CadastroPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { t } = useI18n();

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(`⏳ ${t("register.registering")}`);
    
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setStatus(`✅ ${t("register.success")}\n` + JSON.stringify(data, null, 2));
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      } else {
        setStatus(`❌ ${t("register.errorPrefix")}: ${data.error || "Registration failed"}\n${JSON.stringify(data, null, 2)}`);
      }
    } catch (err: any) {
      setStatus(`❌ ${t("register.errorPrefix")}: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center animate-fade-in">
      <Card variant="glass" padding="lg" className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 text-gradient" style={{ 
            fontFamily: "var(--font-family-display)"
          }}>
            StreamPay Registration
          </h1>
          <p className="text-secondary" style={{ color: "var(--text-secondary)" }}>
            {t("register.subtitle")}
          </p>
        </div>

        <form onSubmit={handleCadastro}>
          <Input
            label={t("register.name")}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your full name"
            icon="👤"
            required
          />

          <Input
            label={t("register.email")}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            icon="📧"
            required
          />

          <Input
            label={t("register.password")}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            icon="🔒"
            required
          />

          <Button
            type="submit"
            variant="neon"
            size="lg"
            fullWidth
            loading={loading}
            className="mt-4"
          >
            {t("register.submit")}
          </Button>
        </form>

        {status && (
          <Card variant="bordered" padding="md" className="mt-6">
            <p 
              className="text-sm whitespace-pre-wrap break-words text-left"
              style={{ 
                color: "var(--text-primary)",
                maxHeight: "300px",
                overflowY: "auto"
              }}
            >
              {status}
            </p>
          </Card>
        )}

        <div className="mt-6 text-center">
          <p className="text-sm text-secondary" style={{ color: "var(--text-secondary)" }}>
            {t("register.alreadyHave")} {" "}
            <a 
              href="/login" 
              className="text-primary hover:underline"
              style={{ color: "var(--color-primary)" }}
            >
              {t("register.login")}
            </a>
          </p>
        </div>
      </Card>
    </div>
  );
}
