import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, BarChart3, Shield } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Dashboard from '@/components/Dashboard';
import Header from '@/components/Header';
import ClientManagement from '@/components/ClientManagement';
import ClientForm from '@/components/ClientForm';
import ClientDetails from '@/components/ClientDetails';
import DocumentManagement from '@/components/DocumentManagement';
import DocumentForm from '@/components/DocumentForm';
import ActivityLog from '@/components/ActivityLog';
import Reports from '@/components/Reports';
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
          <ClientForm onNavigate={handleNavigate} />
        )}

        {currentSection === 'edit-client' && selectedClientId && (
          <ClientForm clientId={selectedClientId} onNavigate={handleNavigate} />
        )}

        {currentSection === 'client-details' && selectedClientId && (
          <ClientDetails
            clientId={selectedClientId}
            user={{ username: profile.username.toUpperCase(), role: profile.role }}
            onNavigate={handleNavigate}
          />
        )}

        {currentSection === 'documents' && (
          <DocumentManagement
            user={{ username: profile.username.toUpperCase(), role: profile.role }}
            onNavigate={handleNavigate}
          />
        )}

        {currentSection === 'client-documents' && selectedClientId && (
          <DocumentManagement
            user={{ username: profile.username.toUpperCase(), role: profile.role }}
            onNavigate={handleNavigate}
            clientId={selectedClientId}
          />
        )}

        {currentSection === 'new-document' && (
          <DocumentForm
            onNavigate={handleNavigate}
            clientId={selectedClientId}
          />
        )}

        {currentSection === 'edit-document' && selectedClientId && (
          <DocumentForm
            documentId={selectedClientId}
            onNavigate={handleNavigate}
          />
        )}

        {currentSection === 'activity' && (
          <ActivityLog onNavigate={handleNavigate} />
        )}

        {currentSection === 'reports' && (
          <Reports onNavigate={handleNavigate} />
        )}

        {currentSection === 'settings' && profile.role === 'admin' && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 mb-8">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleNavigate('dashboard')}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  Configurações do Sistema
                </h2>
                <p className="text-muted-foreground">
                  Configurações administrativas do sistema
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="cursor-pointer hover:shadow-elevated transition-shadow" onClick={() => handleNavigate('activity')}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Log de Atividades
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Visualizar histórico de alterações no sistema
                  </p>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-elevated transition-shadow" onClick={() => handleNavigate('reports')}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-success" />
                    Relatórios
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Análises e estatísticas do sistema
                  </p>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-elevated transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-accent" />
                    Permissões
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Gerenciar usuários e permissões
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;