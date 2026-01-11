"use client";

import { useState, useCallback } from "react";
import { useAccount, useDisconnect } from "wagmi";
import { BrowserProvider } from "ethers";
import { useI18n } from "../i18n";

interface UseWalletAuthReturn {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  authenticate: () => Promise<string | null>;
  logout: () => void;
}

export function useWalletAuth(): UseWalletAuthReturn {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { t } = useI18n();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Check localStorage on mount/render to set initial state if needed, 
  // but for reactivity we might want a state. For now simple check.
  const [token, setToken] = useState<string | null>(
    typeof window !== "undefined" ? localStorage.getItem("authToken") : null
  );

  const logout = useCallback(() => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userAddress");
    setToken(null);
    disconnect();
  }, [disconnect]);

  const authenticate = useCallback(async (): Promise<string | null> => {
    if (!isConnected || !address) {
      setError("Wallet not connected");
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);

      // 1. Check for existing valid token (optional: verify with backend /me endpoint)
      const existingToken = localStorage.getItem("authToken");
      const storedAddress = localStorage.getItem("userAddress");

      if (existingToken && storedAddress?.toLowerCase() === address.toLowerCase()) {
        // We could verify token validity here, but for now assume it's okay 
        // until we hit a 401. Or we can do a quick check if desired.
        // For this refactor, let's keep it simple: if token exists for this address, done.
        setToken(existingToken);
        setIsLoading(false);
        return existingToken;
      }

      // 2. Prepare for signing
      const eth = (window as any).ethereum;
      if (!eth) {
        throw new Error(t("web3auth.metamaskMissing"));
      }

      const provider = new BrowserProvider(eth);
      const signer = await provider.getSigner();

      // 3. Create message
      const authMessage = `
StreamPay AI Authentication
Address: ${address}
Timestamp: ${Date.now()}

Signing this message to confirm your identity.
      `.trim();

      // 4. Sign message
      const signature = await signer.signMessage(authMessage);

      // 5. Verify with backend
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
      const response = await fetch(`${backendUrl}/api/auth/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address,
          message: authMessage,
          signature,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || t("web3auth.verifyFailed"));
      }

      const data = await response.json();
      const newToken = data.token;
      
      // 6. Store session
      localStorage.setItem("authToken", newToken);
      if (data.refreshToken) {
        localStorage.setItem("refreshToken", data.refreshToken);
      }
      localStorage.setItem("userAddress", address);
      
      setToken(newToken);
      return newToken;

    } catch (err: any) {
      console.error("Authentication error:", err);
      const msg = err.message || "Failed to authenticate";
      setError(msg);
      // Don't auto-disconnect here, let user retry
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [address, isConnected, t]);

  return {
    isAuthenticated: !!token,
    isLoading,
    error,
    authenticate,
    logout
  };
}
