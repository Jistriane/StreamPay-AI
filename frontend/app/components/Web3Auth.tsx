'use client';

import { useState } from 'react';
import { BrowserProvider } from 'ethers';
import Button from './Button';
import Card from './Card';

interface Web3AuthProps {
  onSuccess?: (token: string) => void;
  onError?: (error: string) => void;
}

export function Web3Auth({ onSuccess, onError }: Web3AuthProps) {
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const connectWallet = async () => {
    try {
      setLoading(true);
      setMessage(null);

      // Verificar se MetaMask está instalado
      if (!window.ethereum) {
        throw new Error('MetaMask não encontrado. Instale a extensão!');
      }

      // Solicitar conexão com MetaMask
      const provider = new BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      const userAddress = accounts[0];

      setAddress(userAddress);

      // Criar mensagem para assinar
      const authMessage = `
StreamPay AI Authentication
Address: ${userAddress}
Timestamp: ${Date.now()}

Assinando esta mensagem para confirmar sua identidade.
      `.trim();

      // Solicitar assinatura de mensagem
      const signer = await provider.getSigner();
      setMessage('📝 Assinando mensagem...');
      const signature = await signer.signMessage(authMessage);

      // Enviar para backend para verificação
      setMessage('🔄 Verificando assinatura...');
      const response = await fetch('http://localhost:3001/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: userAddress,
          message: authMessage,
          signature,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Falha ao verificar assinatura');
      }

      const data = await response.json();
      const token = data.token;
      const refreshToken = data.refreshToken;

      // Armazenar token e endereço
      localStorage.setItem('authToken', token);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
      localStorage.setItem('userAddress', userAddress);

      setConnected(true);
      setMessage('✅ Autenticado com sucesso!');
      onSuccess?.(token);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Erro de autenticação:', errorMessage);
      setMessage(`❌ ${errorMessage}`);
      onError?.(errorMessage);
      setConnected(false);
      setAddress(null);
    } finally {
      setLoading(false);
    }
  };

  const disconnect = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userAddress');
    setConnected(false);
    setAddress(null);
    setMessage(null);
  };

  if (connected && address) {
    return (
      <div className="flex flex-col gap-4 w-full">
        <Card variant="glass" padding="md" className="text-center">
          <p className="text-sm text-gray-600 mb-2">Carteira Conectada</p>
          <p className="font-mono text-lg">
            {address.slice(0, 6)}...{address.slice(-4)}
          </p>
        </Card>
        <Button
          onClick={disconnect}
          variant="outlined"
          fullWidth
        >
          Desconectar
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      <Button
        onClick={connectWallet}
        disabled={loading}
        variant="neon"
        size="lg"
        fullWidth
      >
        {loading ? 'Conectando...' : 'Conectar MetaMask'}
      </Button>
      
      {message && (
        <Card variant="bordered" padding="md" className="text-center">
          <p className="text-sm">
            {message}
          </p>
        </Card>
      )}

      <p className="text-xs text-center text-gray-500">
        ℹ️ Certifique-se de que MetaMask está na rede Sepolia testnet
      </p>
    </div>
  );
}
