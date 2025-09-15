import React, { useState } from 'react';
import { Plus, Search, User, Building, Edit, Trash2, Eye, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useClients } from '@/hooks/useClients';
import { toast } from '@/hooks/use-toast';

interface Client {
  id: string;
  type: 'PF' | 'PJ';
  name: string;
  document: string; // CPF or CNPJ
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

interface ClientManagementProps {
  user: { username: string; role: 'admin' | 'user' };
  onNavigate: (section: string, clientId?: string) => void;
  clients: Client[];
}

export default function ClientManagement({ user, onNavigate, clients }: ClientManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredClients, setFilteredClients] = useState(clients);
  const [deletingClient, setDeletingClient] = useState<string | null>(null);
  const { deleteClient } = useClients();

  React.useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredClients(clients);
    } else {
      const filtered = clients.filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.document.includes(searchTerm) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredClients(filtered);
    }
  }, [searchTerm, clients]);

  const handleDeleteClient = async (clientId: string, clientName: string) => {
    setDeletingClient(clientId);
    
    try {
      const success = await deleteClient(clientId);
      
      if (success) {
        toast({
          title: "Cliente removido",
          description: `${clientName} foi removido do sistema com sucesso.`,
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível remover o cliente. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setDeletingClient(null);
    }
  };

  const formatDocument = (document: string, type: 'PF' | 'PJ') => {
    if (type === 'PF') {
      return document.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else {
      return document.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
  };

  const isAdmin = user.role === 'admin';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onNavigate('dashboard')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Gestão de Clientes</h1>
            <p className="text-muted-foreground">
              Gerencie os clientes do escritório
            </p>
          </div>
        </div>
        <Button onClick={() => onNavigate('new-client')} className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Cliente
        </Button>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, CPF, CNPJ ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{clients.length}</p>
              <p className="text-sm text-muted-foreground">Total de Clientes</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-accent">
                {clients.filter(c => c.type === 'PF').length}
              </p>
              <p className="text-sm text-muted-foreground">Pessoas Físicas</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-success">
                {clients.filter(c => c.type === 'PJ').length}
              </p>
              <p className="text-sm text-muted-foreground">Pessoas Jurídicas</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map((client) => (
          <Card
            key={client.id}
            className="hover:shadow-elevated transition-all duration-300 hover:-translate-y-1"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    client.type === 'PF' ? 'bg-primary-light' : 'bg-success-light'
                  }`}>
                    {client.type === 'PF' ? 
                      <User className="h-5 w-5 text-primary" /> :
                      <Building className="h-5 w-5 text-success" />
                    }
                  </div>
                  <div>
                    <Badge variant={client.type === 'PF' ? 'default' : 'secondary'}>
                      {client.type}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-foreground truncate">
                  {client.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {formatDocument(client.document, client.type)}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground truncate">
                  📧 {client.email}
                </p>
                <p className="text-sm text-muted-foreground">
                  📱 {client.phone}
                </p>
                {client.occupation && (
                  <p className="text-sm text-muted-foreground">
                    💼 {client.occupation}
                  </p>
                )}
                {client.activity && (
                  <p className="text-sm text-muted-foreground">
                    🏢 {client.activity}
                  </p>
                )}
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <span className="text-xs text-muted-foreground">
                  Atualizado em {new Date(client.updatedAt).toLocaleDateString('pt-BR')}
                </span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onNavigate('client-details', client.id)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onNavigate('edit-client', client.id)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  {isAdmin && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          disabled={deletingClient === client.id}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir o cliente "{client.name}"? 
                            Esta ação não pode ser desfeita e todos os documentos associados também serão removidos.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteClient(client.id, client.name)}
                            disabled={deletingClient === client.id}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            {deletingClient === client.id ? 'Excluindo...' : 'Excluir Cliente'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredClients.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Nenhum cliente encontrado
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? 'Tente uma busca diferente' : 'Comece cadastrando seu primeiro cliente'}
            </p>
            <Button onClick={() => onNavigate('new-client')}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Cliente
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}