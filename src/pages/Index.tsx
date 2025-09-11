import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Dashboard from '@/components/Dashboard';
import Header from '@/components/Header';
import ClientManagement from '@/components/ClientManagement';
import SupabaseNotice from '@/components/SupabaseNotice';
import { useAuth } from '@/hooks/useAuth';


interface Client {
  id: string;
  type: 'PF' | 'PJ';
  name: string;
  document: string;
  email: string;
  phone: string;
  occupation?: string;
  activity?: string;
  address: {
    cep: string;
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Mock data - Em produção, isso viria do Supabase
const mockClients: Client[] = [
  {
    id: '1',
    type: 'PF',
    name: 'JOÃO SILVA SANTOS',
    document: '12345678901',
    email: 'joao.silva@email.com',
    phone: '(11) 99999-9999',
    occupation: 'Engenheiro',
    address: {
      cep: '01310-100',
      street: 'Av. Paulista',
      number: '1000',
      neighborhood: 'Bela Vista',
      city: 'São Paulo',
      state: 'SP'
    },
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T14:30:00Z'
  },
  {
    id: '2',
    type: 'PJ',
    name: 'TECH SOLUTIONS LTDA',
    document: '12345678000195',
    email: 'contato@techsolutions.com.br',
    phone: '(11) 3333-4444',
    activity: 'Tecnologia da Informação',
    address: {
      cep: '04038-001',
      street: 'Av. Brigadeiro Faria Lima',
      number: '2000',
      neighborhood: 'Itaim Bibi',
      city: 'São Paulo',
      state: 'SP'
    },
    createdAt: '2024-01-10T09:00:00Z',
    updatedAt: '2024-01-25T16:45:00Z'
  },
  {
    id: '3',
    type: 'PF',
    name: 'MARIA OLIVEIRA COSTA',
    document: '98765432100',
    email: 'maria.oliveira@email.com',
    phone: '(11) 88888-7777',
    occupation: 'Médica',
    address: {
      cep: '01419-001',
      street: 'R. Augusta',
      number: '500',
      neighborhood: 'Consolação',
      city: 'São Paulo',
      state: 'SP'
    },
    createdAt: '2024-01-08T11:00:00Z',
    updatedAt: '2024-01-22T10:15:00Z'
  }
];

const Index = () => {
  const { user, profile, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [currentSection, setCurrentSection] = useState('dashboard');
  const [selectedClientId, setSelectedClientId] = useState<string | undefined>();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const handleLogout = async () => {
    await signOut();
    setCurrentSection('dashboard');
    setSelectedClientId(undefined);
    navigate('/auth');
  };

  const handleNavigate = (section: string, clientId?: string) => {
    setCurrentSection(section);
    setSelectedClientId(clientId);
  };

  // Mock stats - Em produção, isso seria calculado do Supabase
  const stats = {
    totalClients: mockClients.length,
    totalDocuments: 45,
    pendingDocuments: 8,
    recentActivity: 12
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <img
            src="https://i.ibb.co/LzWD2mM/Logo-papel-timbrado-1.png"
            alt="Márcia Suzana Advocacia"
            className="h-20 mx-auto object-contain mb-4"
          />
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        user={{ username: profile.username.toUpperCase(), role: profile.role }}
        onLogout={handleLogout}
        onNavigate={handleNavigate}
      />
      
      <main className="container mx-auto px-6 py-8">
        {currentSection === 'dashboard' && (
          <Dashboard
            user={{ username: profile.username.toUpperCase(), role: profile.role }}
            onNavigate={handleNavigate}
            stats={stats}
          />
        )}
        
        {currentSection === 'clients' && (
          <ClientManagement
            user={{ username: profile.username.toUpperCase(), role: profile.role }}
            onNavigate={handleNavigate}
            clients={mockClients}
          />
        )}

        {currentSection === 'new-client' && (
          <div className="space-y-6">
            <SupabaseNotice />
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Cadastro de Cliente
              </h2>
              <p className="text-muted-foreground mb-8">
                Esta funcionalidade será implementada após a integração com Supabase
              </p>
              <button 
                onClick={() => handleNavigate('clients')}
                className="text-primary hover:underline"
              >
                Voltar para lista de clientes
              </button>
            </div>
          </div>
        )}

        {currentSection === 'settings' && profile.role === 'admin' && (
          <div className="space-y-6">
            <SupabaseNotice />
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Configurações do Sistema
              </h2>
              <p className="text-muted-foreground mb-8">
                Painel administrativo será implementado após a integração com Supabase
              </p>
              <button 
                onClick={() => handleNavigate('dashboard')}
                className="text-primary hover:underline"
              >
                Voltar ao dashboard
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;