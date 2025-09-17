import React, { useState } from 'react';
import { ArrowLeft, Edit, Trash2, User, Building, MapPin, Phone, Mail, Calendar, FileText, Upload, Download, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useClients } from '@/hooks/useClients';
import { useDocuments } from '@/hooks/useDocuments';
import { toast } from '@/hooks/use-toast';

interface ClientDetailsProps {
  clientId: string;
  user: { username: string; role: 'admin' | 'user' };
  onNavigate: (section: string, clientId?: string) => void;
}

export default function ClientDetails({ clientId, user, onNavigate }: ClientDetailsProps) {
  const { clients, deleteClient } = useClients();
  const { documents, downloadDocument } = useDocuments();
  const [isDeleting, setIsDeleting] = useState(false);

  const client = clients.find(c => c.id === clientId);
  const clientDocuments = documents.filter(doc => doc.client_id === clientId);
  
  const isAdmin = user.role === 'admin';

  if (!client) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onNavigate('clients')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Cliente não encontrado</h1>
            <p className="text-muted-foreground">
              O cliente solicitado não foi encontrado no sistema
            </p>
          </div>
        </div>
      </div>
    );
  }

  const formatDocument = (document: string, type: 'PF' | 'PJ') => {
    if (type === 'PF') {
      return document.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else {
      return document.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    
    try {
      const success = await deleteClient(clientId);
      
      if (success) {
        toast({
          title: "Cliente removido",
          description: "O cliente foi removido com sucesso do sistema.",
        });
        onNavigate('clients');
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível remover o cliente. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const formatAddress = (address: any) => {
    return `${address.street}, ${address.number}${address.complement ? `, ${address.complement}` : ''}, ${address.neighborhood}, ${address.city} - ${address.state}, ${address.cep}`;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onNavigate('clients')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Detalhes do Cliente</h1>
            <p className="text-muted-foreground">
              Visualize e gerencie as informações do cliente
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => onNavigate('edit-client', clientId)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
          {isAdmin && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir
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
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {isDeleting ? 'Excluindo...' : 'Excluir Cliente'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Client Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {client.type === 'PF' ? <User className="h-5 w-5" /> : <Building className="h-5 w-5" />}
                Informações {client.type === 'PF' ? 'Pessoais' : 'Empresariais'}
                <Badge variant={client.type === 'PF' ? 'default' : 'secondary'}>
                  {client.type}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {client.type === 'PF' ? 'Nome Completo' : 'Razão Social'}
                  </p>
                  <p className="text-lg font-semibold">{client.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {client.type === 'PF' ? 'CPF' : 'CNPJ'}
                  </p>
                  <p className="text-lg font-mono">{formatDocument(client.document, client.type)}</p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <p>{client.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Telefone</p>
                    <p>{client.phone}</p>
                  </div>
                </div>
              </div>

              {(client.occupation || client.activity) && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {client.type === 'PF' ? 'Profissão' : 'Atividade Principal'}
                    </p>
                    <p>{client.occupation || client.activity}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Endereço
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base">{formatAddress(client.address)}</p>
            </CardContent>
          </Card>

          {/* Documents */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Documentos ({clientDocuments.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {clientDocuments.length > 0 ? (
                <div className="space-y-3">
                  {clientDocuments.slice(0, 5).map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{doc.title}</p>
                          {doc.description && (
                            <p className="text-sm text-muted-foreground">{doc.description}</p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {new Date(doc.created_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant={
                          doc.status === 'approved' ? 'default' : 
                          doc.status === 'rejected' ? 'destructive' : 
                          'secondary'
                        }>
                          {doc.status === 'approved' ? 'Aprovado' : 
                           doc.status === 'rejected' ? 'Rejeitado' : 
                           'Pendente'}
                        </Badge>
                        {doc.file_path && (
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => downloadDocument(doc)}
                            title="Baixar documento"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  {clientDocuments.length > 5 && (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => onNavigate('client-documents', clientId)}
                    >
                      Ver todos os documentos ({clientDocuments.length})
                    </Button>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhum documento</h3>
                  <p className="text-muted-foreground mb-4">
                    Este cliente ainda não possui documentos cadastrados
                  </p>
                  <Button onClick={() => onNavigate('new-document', clientId)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Documento
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Resumo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Documentos</span>
                <span className="font-semibold">{clientDocuments.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pendentes</span>
                <span className="font-semibold text-warning">
                  {clientDocuments.filter(d => d.status === 'pending').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Aprovados</span>
                <span className="font-semibold text-success">
                  {clientDocuments.filter(d => d.status === 'approved').length}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Timestamps */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Datas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cadastrado em</p>
                <p>{new Date(client.created_at).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Última atualização</p>
                <p>{new Date(client.updated_at).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => onNavigate('new-document', clientId)}
              >
                <Upload className="h-4 w-4 mr-2" />
                Adicionar Documento
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => onNavigate('client-documents', clientId)}
              >
                <FileText className="h-4 w-4 mr-2" />
                Ver Documentos
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => {
                  toast({
                    title: "Funcionalidade em desenvolvimento",
                    description: "A função de enviar email será implementada em breve.",
                  });
                }}
              >
                <Mail className="h-4 w-4 mr-2" />
                Enviar Email
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}