'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import CreateStreamForm from '@/components/CreateStreamForm';
import PoolManager from '@/components/PoolManager';

type TabType = 'streams' | 'pools' | 'forms';

export default function StreamsPage() {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('streams');

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-800 mb-4">🔐 Acesso Restrito</p>
          <p className="text-gray-600">Por favor, conecte sua carteira para acessar esta página</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            💰 Gerenciar Streams e Pools
          </h1>
          <p className="text-gray-600">
            Crie streams de pagamento e gerencie liquidez em pools de negociação
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-4 border-b border-gray-200">
          <TabButton
            active={activeTab === 'streams'}
            onClick={() => setActiveTab('streams')}
            icon="💸"
            label="Streams"
          />
          <TabButton
            active={activeTab === 'pools'}
            onClick={() => setActiveTab('pools')}
            icon="🏊"
            label="Pools de Liquidez"
          />
          <TabButton
            active={activeTab === 'forms'}
            onClick={() => setActiveTab('forms')}
            icon="📋"
            label="Criar Stream"
          />
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'forms' && (
            <div className="bg-white rounded-lg shadow p-6">
              <CreateStreamForm />
            </div>
          )}

          {activeTab === 'pools' && <PoolManager />}

          {activeTab === 'streams' && (
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-center py-8">
                📊 Ver seus streams em curso no Dashboard
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: string;
  label: string;
}

function TabButton({ active, onClick, icon, label }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
        active
          ? 'text-blue-600 border-blue-600'
          : 'text-gray-600 border-transparent hover:text-gray-800'
      }`}
    >
      <span className="mr-1">{icon}</span>
      {label}
    </button>
  );
}
