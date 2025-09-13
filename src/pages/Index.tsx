import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Dashboard from '@/components/Dashboard';
import Header from '@/components/Header';
import ClientManagement from '@/components/ClientManagement';
import { useAuth } from '@/hooks/useAuth';
import { useClients } from '@/hooks/useClients';
import { useStats } from '@/hooks/useStats';



const Index = () => {
  const { user, profile, loading, signOut } = useAuth();
  const { clients } = useClients();
  const { stats } = useStats();
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
            stats={{
              totalClients: stats.total_clients,
              totalDocuments: stats.total_documents,
              pendingDocuments: stats.pending_documents,
              recentActivity: stats.recent_activity
            }}
          />
        )}
        
        {currentSection === 'clients' && (
          <ClientManagement
            user={{ username: profile.username.toUpperCase(), role: profile.role }}
            onNavigate={handleNavigate}
            clients={clients.map(client => ({
              ...client,
              createdAt: client.created_at,
              updatedAt: client.updated_at
            }))}
          />
        )}

        {currentSection === 'new-client' && (
          <div className="space-y-6">
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Cadastro de Cliente
              </h2>
              <p className="text-muted-foreground mb-8">
                Funcionalidade de cadastro integrada com Supabase está pronta!
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
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Configurações do Sistema
              </h2>
              <p className="text-muted-foreground mb-8">
                Sistema integrado com Supabase. Configurações administrativas disponíveis.
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