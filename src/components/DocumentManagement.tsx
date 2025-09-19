import React, { useState } from 'react';
import { ArrowLeft, Plus, Search, FileText, Download, Upload, Eye, Edit, Trash2, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDocuments } from '@/hooks/useDocuments';
import { useClients } from '@/hooks/useClients';
import { useToast } from '@/hooks/use-toast';

interface DocumentManagementProps {
  user: { username: string; role: 'admin' | 'user' };
  onNavigate: (section: string, documentId?: string) => void;
  clientId?: string;
}

export default function DocumentManagement({ user, onNavigate, clientId }: DocumentManagementProps) {
  const { documents, downloadDocument, deleteDocument } = useDocuments();
  const { clients } = useClients();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const isAdmin = user.role === 'admin';

  // Filter documents by client if clientId is provided
  const filteredByClient = clientId 
    ? documents.filter(doc => doc.client_id === clientId)
    : documents;

  // Apply search and filters
  const filteredDocuments = filteredByClient.filter(doc => {
    const client = clients.find(c => c.id === doc.client_id);
    const clientName = client?.name || '';
    
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (doc.description && doc.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    const matchesType = typeFilter === 'all' || doc.file_type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-success text-success-foreground">Aprovado</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejeitado</Badge>;
      default:
        return <Badge variant="secondary">Pendente</Badge>;
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return '-';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  const getFileTypeIcon = (type: string | null) => {
    if (!type) return <FileText className="h-4 w-4" />;
    
    if (type.includes('pdf')) return <FileText className="h-4 w-4 text-red-500" />;
    if (type.includes('image')) return <FileText className="h-4 w-4 text-blue-500" />;
    if (type.includes('word') || type.includes('doc')) return <FileText className="h-4 w-4 text-blue-600" />;
    
    return <FileText className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onNavigate(clientId ? 'client-details' : 'dashboard', clientId)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {clientId ? 'Documentos do Cliente' : 'Gestão de Documentos'}
            </h1>
            <p className="text-muted-foreground">
              {clientId ? 
                'Gerencie os documentos deste cliente específico' :
                'Gerencie todos os documentos do sistema'
              }
            </p>
          </div>
        </div>
        <Button onClick={() => onNavigate('new-document', clientId)} className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Documento
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por título, cliente ou descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="approved">Aprovado</SelectItem>
                <SelectItem value="rejected">Rejeitado</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="application/pdf">PDF</SelectItem>
                <SelectItem value="image/jpeg">JPEG</SelectItem>
                <SelectItem value="image/png">PNG</SelectItem>
                <SelectItem value="application/msword">Word</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{filteredDocuments.length}</p>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-warning">
                {filteredDocuments.filter(d => d.status === 'pending').length}
              </p>
              <p className="text-sm text-muted-foreground">Pendentes</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-success">
                {filteredDocuments.filter(d => d.status === 'approved').length}
              </p>
              <p className="text-sm text-muted-foreground">Aprovados</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-destructive">
                {filteredDocuments.filter(d => d.status === 'rejected').length}
              </p>
              <p className="text-sm text-muted-foreground">Rejeitados</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Documents List */}
      <div className="space-y-4">
        {filteredDocuments.map((doc) => {
          const client = clients.find(c => c.id === doc.client_id);
          
          return (
            <Card key={doc.id} className="hover:shadow-elevated transition-all duration-300">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex-shrink-0">
                      {getFileTypeIcon(doc.file_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate">
                        {doc.title}
                      </h3>
                      {doc.description && (
                        <p className="text-sm text-muted-foreground truncate">
                          {doc.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2">
                        {client && (
                          <span className="text-sm text-muted-foreground">
                            Cliente: {client.name}
                          </span>
                        )}
                        <span className="text-sm text-muted-foreground">
                          {new Date(doc.created_at).toLocaleDateString('pt-BR')}
                        </span>
                        {doc.file_size && (
                          <span className="text-sm text-muted-foreground">
                            {formatFileSize(doc.file_size)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {getStatusBadge(doc.status)}
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onNavigate('document-details', doc.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      
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
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onNavigate('edit-document', doc.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      {isAdmin && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={async () => {
                            if (confirm('Tem certeza que deseja deletar este documento?')) {
                              const success = await deleteDocument(doc.id);
                              if (success) {
                                toast({
                                  title: "Documento removido",
                                  description: "O documento foi removido com sucesso.",
                                });
                              }
                            }
                          }}
                          title="Deletar documento"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredDocuments.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Nenhum documento encontrado
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' 
                ? 'Tente ajustar os filtros de busca' 
                : 'Comece adicionando um novo documento'
              }
            </p>
            <Button onClick={() => onNavigate('new-document', clientId)}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Documento
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}