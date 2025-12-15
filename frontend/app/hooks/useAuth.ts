'use client';

import { useEffect, useState } from 'react';

export interface AuthUser {
  id: string;
  address: string;
  email: string;
  role: string;
}

export interface UseAuthReturn {
  token: string | null;
  address: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [token, setToken] = useState<string | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    const savedToken = localStorage.getItem('authToken');
    if (!savedToken) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/auth/me', {
        headers: {
          Authorization: `Bearer ${savedToken}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        // Token inválido
        logout();
      }
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Carregar token e endereço do localStorage
    const savedToken = localStorage.getItem('authToken');
    const savedRefresh = localStorage.getItem('refreshToken');
    const savedAddress = localStorage.getItem('userAddress');

    if (savedToken && savedAddress) {
      setToken(savedToken);
      setAddress(savedAddress);
    }

    // Carregar dados do usuário
    refreshUser();
  }, []);

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userAddress');
    setToken(null);
    setAddress(null);
    setUser(null);
  };

  return {
    token,
    address,
    user,
    isAuthenticated: !!token,
    loading,
    logout,
    refreshUser,
  };
}
