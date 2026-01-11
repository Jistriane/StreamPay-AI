"use client";

import { useEffect, useState } from "react";
import Button from "./Button";
import Card from "./Card";
import { useI18n } from "../i18n";
import { useWalletAuth } from "../hooks/useWalletAuth";
import { useConnect, useAccount } from "wagmi";

interface Web3AuthProps {
  onSuccess?: (token: string) => void;
  onError?: (error: string) => void;
}

export function Web3Auth({ onSuccess, onError }: Web3AuthProps) {
  const { t } = useI18n();
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  
  // Use our centralized auth hook
  const { 
    authenticate, 
    isAuthenticated, 
    isLoading: isAuthLoading, 
    error: authError,
    logout 
  } = useWalletAuth();

  const [localError, setLocalError] = useState<string | null>(null);

  // Trigger onSuccess when authenticated
  useEffect(() => {
    if (isAuthenticated && !authError) {
       // We can get the token from localStorage since the hook stores it
       const token = localStorage.getItem("authToken");
       if (token) onSuccess?.(token);
    }
  }, [isAuthenticated, authError, onSuccess]);

  // Propagate errors
  useEffect(() => {
    if (authError) {
      setLocalError(authError);
      onError?.(authError);
    }
  }, [authError, onError]);

  const handleConnect = () => {
    setLocalError(null);
    if (!isConnected) {
      // Connect first - the Header (or a listener) will likely trigger auth,
      // but here we want to hold the user's hand through the process.
      // However, wagmi connect is async. 
      // The simplest way with our new hook architecture is:
      // 1. Connect wallet
      // 2. Watch for connection
      // 3. Trigger authenticate()
      if (connectors?.[0]) {
        connect({ connector: connectors[0] });
      } else {
        setLocalError("No wallet connector found");
      }
    } else {
      // Already connected, just authenticate
      authenticate();
    }
  };

  // Watch for connection to trigger auth if we are in this specific flow
  const [waitingForConnection, setWaitingForConnection] = useState(false);
  useEffect(() => {
     if (waitingForConnection && isConnected && address) {
        setWaitingForConnection(false);
        authenticate();
     }
  }, [isConnected, address, waitingForConnection, authenticate]);

  // Intercept connect click
  const onClickConnect = () => {
    setLocalError(null);
    if (!isConnected) {
        setWaitingForConnection(true);
        if (connectors?.[0]) {
            connect({ connector: connectors[0] });
        }
    } else {
        authenticate();
    }
  };

  if (isConnected && isAuthenticated && address) {
    return (
      <div className="flex flex-col gap-4 w-full">
        <Card variant="glass" padding="md" className="text-center">
          <p className="text-sm text-gray-600 mb-2">{t("web3auth.walletConnected")}</p>
          <p className="font-mono text-lg">
            {address.slice(0, 6)}...{address.slice(-4)}
          </p>
        </Card>
        <Button
          onClick={logout}
          variant="ghost"
          fullWidth
        >
          {t("web3auth.disconnect")}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      <Button
        onClick={onClickConnect}
        disabled={isAuthLoading}
        variant="neon"
        size="lg"
        fullWidth
      >
        {isAuthLoading ? (isConnected ? t("web3auth.verifying") : t("web3auth.connecting")) : (isConnected ? "Sign In with Ethereum" : t("web3auth.connect"))}
      </Button>
      
      {(localError || authError) && (
        <Card variant="bordered" padding="md" className="text-center border-red-500/50 bg-red-500/10">
          <p className="text-sm text-red-200">
            {localError || authError}
          </p>
        </Card>
      )}

      <p className="text-xs text-center text-gray-500">
        ℹ️ {t("web3auth.ensureNetwork")}
      </p>
    </div>
  );
}
