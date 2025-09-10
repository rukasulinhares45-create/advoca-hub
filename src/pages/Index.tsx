import React, { useState } from 'react';
import LoginScreen from '@/components/LoginScreen';
import Dashboard from '@/components/Dashboard';
import Header from '@/components/Header';
import ClientManagement from '@/components/ClientManagement';
import SupabaseNotice from '@/components/SupabaseNotice';

interface User {
  username: string;
  role: 'admin' | 'user';
}

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
  const [user, setUser] = useState<User | null>(null);
  const [currentSection, setCurrentSection] = useState('dashboard');
  const [selectedClientId, setSelectedClientId] = useState<string | undefined>();
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Mock authentication - Em produção, isso seria integrado com Supabase
  const handleLogin = async (username: string, password: string) => {
    setLoginLoading(true);
    setLoginError(null);

    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock users - Em produção, isso viria do Supabase
    const mockUsers = {
      'admin': { password: 'admin123', role: 'admin' as const },
      'user': { password: 'user123', role: 'user' as const },
      'marcia': { password: 'marcia2024', role: 'admin' as const }
    };

    const mockUser = mockUsers[username as keyof typeof mockUsers];
    
    if (mockUser && mockUser.password === password) {
      setUser({ username: username.toUpperCase(), role: mockUser.role });
      setCurrentSection('dashboard');
    } else {
      setLoginError('Usuário ou senha inválidos');
    }

    setLoginLoading(false);
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentSection('dashboard');
    setSelectedClientId(undefined);
    setLoginError(null);
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

  if (!user) {
    return (
      <LoginScreen
        onLogin={handleLogin}
        isLoading={loginLoading}
        error={loginError}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        user={user}
        onLogout={handleLogout}
        onNavigate={handleNavigate}
      />
      
      <main className="container mx-auto px-6 py-8">
        {currentSection === 'dashboard' && (
          <Dashboard
            user={user}
            onNavigate={handleNavigate}
            stats={stats}
          />
        )}
        
        {currentSection === 'clients' && (
          <ClientManagement
            user={user}
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

        {currentSection === 'settings' && user.role === 'admin' && (
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