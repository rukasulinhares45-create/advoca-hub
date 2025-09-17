import React, { useState, useEffect } from 'react';
import { ArrowLeft, Download, FileText, Users, Calendar, BarChart3, TrendingUp, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useClients } from '@/hooks/useClients';
import { useDocuments } from '@/hooks/useDocuments';

interface ReportsProps {
  onNavigate: (section: string, clientId?: string) => void;
}

export default function Reports({ onNavigate }: ReportsProps) {
  const { clients } = useClients();
  const { documents } = useDocuments();
  const [timeRange, setTimeRange] = useState('30');
  
  const getDateRange = (days: number) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    return { startDate, endDate };
  };

  const { startDate } = getDateRange(parseInt(timeRange));

  // Filter data based on time range
  const filteredClients = clients.filter(client => 
    new Date(client.created_at) >= startDate
  );

  const filteredDocuments = documents.filter(doc => 
    new Date(doc.created_at) >= startDate
  );

  // Calculate statistics
  const stats = {
    totalClients: clients.length,
    newClients: filteredClients.length,
    pfClients: clients.filter(c => c.type === 'PF').length,
    pjClients: clients.filter(c => c.type === 'PJ').length,
    totalDocuments: documents.length,
    newDocuments: filteredDocuments.length,
    pendingDocuments: documents.filter(d => d.status === 'pending').length,
    approvedDocuments: documents.filter(d => d.status === 'approved').length,
    rejectedDocuments: documents.filter(d => d.status === 'rejected').length,
  };

  // Get recent clients
  const recentClients = clients
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  // Get document types distribution
  const documentTypes = documents.reduce((acc, doc) => {
    const type = doc.file_type || 'Outros';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const exportReport = () => {
    const reportData = {
      geradoEm: new Date().toLocaleString('pt-BR'),
      periodo: `Últimos ${timeRange} dias`,
      estatisticas: stats,
      clientesRecentes: recentClients.map(client => ({
        nome: client.name,
        tipo: client.type,
        email: client.email,
        dataCadastro: new Date(client.created_at).toLocaleDateString('pt-BR')
      })),
      distribuicaoDocumentos: documentTypes
    };

    const dataStr = JSON.stringify(reportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `relatorio-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => onNavigate('dashboard')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Relatórios</h1>
            <p className="text-muted-foreground">
              Análise e estatísticas do sistema
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Últimos 7 dias</SelectItem>
              <SelectItem value="30">Últimos 30 dias</SelectItem>
              <SelectItem value="90">Últimos 90 dias</SelectItem>
              <SelectItem value="365">Último ano</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportReport} className="gap-2">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Clientes</p>
                <p className="text-2xl font-bold text-primary">{stats.totalClients}</p>
                <p className="text-xs text-muted-foreground">
                  +{stats.newClients} novos
                </p>
              </div>
              <div className="p-3 rounded-full bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-success/5 to-success/10 border-success/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Documentos</p>
                <p className="text-2xl font-bold text-success">{stats.totalDocuments}</p>
                <p className="text-xs text-muted-foreground">
                  +{stats.newDocuments} novos
                </p>
              </div>
              <div className="p-3 rounded-full bg-success/10">
                <FileText className="h-6 w-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-warning/5 to-warning/10 border-warning/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pendências</p>
                <p className="text-2xl font-bold text-warning">{stats.pendingDocuments}</p>
                <p className="text-xs text-muted-foreground">
                  Aguardando revisão
                </p>
              </div>
              <div className="p-3 rounded-full bg-warning/10">
                <Calendar className="h-6 w-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Taxa Aprovação</p>
                <p className="text-2xl font-bold text-accent">
                  {stats.totalDocuments > 0 
                    ? Math.round((stats.approvedDocuments / stats.totalDocuments) * 100)
                    : 0}%
                </p>
                <p className="text-xs text-muted-foreground">
                  {stats.approvedDocuments} aprovados
                </p>
              </div>
              <div className="p-3 rounded-full bg-accent/10">
                <TrendingUp className="h-6 w-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Client Types */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Distribuição de Clientes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-primary rounded-full"></div>
                  <span className="text-sm">Pessoa Física</span>
                </div>
                <div className="text-right">
                  <span className="font-semibold">{stats.pfClients}</span>
                  <span className="text-xs text-muted-foreground ml-1">
                    ({stats.totalClients > 0 ? Math.round((stats.pfClients / stats.totalClients) * 100) : 0}%)
                  </span>
                </div>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full" 
                  style={{ 
                    width: `${stats.totalClients > 0 ? (stats.pfClients / stats.totalClients) * 100 : 0}%` 
                  }}
                ></div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-success rounded-full"></div>
                  <span className="text-sm">Pessoa Jurídica</span>
                </div>
                <div className="text-right">
                  <span className="font-semibold">{stats.pjClients}</span>
                  <span className="text-xs text-muted-foreground ml-1">
                    ({stats.totalClients > 0 ? Math.round((stats.pjClients / stats.totalClients) * 100) : 0}%)
                  </span>
                </div>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div 
                  className="bg-success h-2 rounded-full" 
                  style={{ 
                    width: `${stats.totalClients > 0 ? (stats.pjClients / stats.totalClients) * 100 : 0}%` 
                  }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Document Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-success" />
              Status dos Documentos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="bg-success text-success-foreground">Aprovado</Badge>
                </div>
                <span className="font-semibold">{stats.approvedDocuments}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="bg-warning text-warning-foreground">Pendente</Badge>
                </div>
                <span className="font-semibold">{stats.pendingDocuments}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="destructive">Rejeitado</Badge>
                </div>
                <span className="font-semibold">{stats.rejectedDocuments}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Clients */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Clientes Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentClients.length > 0 ? (
            <div className="space-y-3">
              {recentClients.map((client) => (
                <div key={client.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
                  <div className="flex items-center gap-3">
                    <Badge variant={client.type === 'PF' ? 'default' : 'secondary'}>
                      {client.type}
                    </Badge>
                    <div>
                      <p className="font-medium text-foreground">{client.name}</p>
                      <p className="text-sm text-muted-foreground">{client.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      {new Date(client.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => onNavigate('client-details', client.id)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum cliente encontrado</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Document Types */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-accent" />
            Tipos de Documentos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {Object.keys(documentTypes).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(documentTypes).map(([type, count]) => (
                <div key={type} className="p-4 rounded-lg border">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{type}</span>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum documento encontrado</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}