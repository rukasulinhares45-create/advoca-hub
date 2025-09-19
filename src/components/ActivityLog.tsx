import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Clock, User, FileText, Edit, Trash2, Plus, Filter, Eye, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface ActivityLogEntry {
  id: string;
  table_name: string;
  record_id: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW' | 'DOWNLOAD';
  user_email: string;
  created_at: string;
  old_data?: any;
  new_data?: any;
}

interface ActivityLogProps {
  onNavigate: (section: string) => void;
}

export default function ActivityLog({ onNavigate }: ActivityLogProps) {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  const fetchActivities = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setActivities((data || []).map((item): ActivityLogEntry => ({
        id: item.id,
        table_name: item.table_name,
        record_id: item.record_id,
        action: item.action,
        user_email: item.user_email,
        created_at: item.created_at,
        old_data: item.old_data,
        new_data: item.new_data,
      })));
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'CREATE':
        return <Plus className="h-4 w-4 text-success" />;
      case 'UPDATE':
        return <Edit className="h-4 w-4 text-warning" />;
      case 'DELETE':
        return <Trash2 className="h-4 w-4 text-destructive" />;
      case 'DOWNLOAD':
        return <Download className="h-4 w-4 text-primary" />;
      case 'VIEW':
        return <Eye className="h-4 w-4 text-muted-foreground" />;
      default:
        return <FileText className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'CREATE':
        return <Badge className="bg-success text-success-foreground">Criado</Badge>;
      case 'UPDATE':
        return <Badge className="bg-warning text-warning-foreground">Atualizado</Badge>;
      case 'DELETE':
        return <Badge variant="destructive">Excluído</Badge>;
      case 'DOWNLOAD':
        return <Badge variant="outline">Download</Badge>;
      case 'VIEW':
        return <Badge variant="secondary">Visualizado</Badge>;
      default:
        return <Badge variant="secondary">{action}</Badge>;
    }
  };

  const getTableDisplayName = (tableName: string) => {
    switch (tableName) {
      case 'clients':
        return 'Cliente';
      case 'documents':
        return 'Documento';
      case 'profiles':
        return 'Perfil';
      default:
        return tableName;
    }
  };

  const filteredActivities = filter === 'all' 
    ? activities 
    : activities.filter(activity => activity.table_name === filter);

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => onNavigate('dashboard')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Log de Atividades</h1>
            <p className="text-muted-foreground">Carregando atividades...</p>
          </div>
        </div>
        <div className="grid gap-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => onNavigate('dashboard')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Log de Atividades</h1>
            <p className="text-muted-foreground">
              Acompanhe todas as ações realizadas no sistema
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filtrar por tabela" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as tabelas</SelectItem>
                <SelectItem value="clients">Clientes</SelectItem>
                <SelectItem value="documents">Documentos</SelectItem>
                <SelectItem value="profiles">Perfis</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={fetchActivities}
              disabled={loading}
            >
              Atualizar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{activities.length}</p>
              <p className="text-sm text-muted-foreground">Total de Atividades</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-success">
                {activities.filter(a => a.action === 'CREATE').length}
              </p>
              <p className="text-sm text-muted-foreground">Criações</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-warning">
                {activities.filter(a => a.action === 'UPDATE').length}
              </p>
              <p className="text-sm text-muted-foreground">Atualizações</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-destructive">
                {activities.filter(a => a.action === 'DELETE').length}
              </p>
              <p className="text-sm text-muted-foreground">Exclusões</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activities List */}
      <div className="space-y-4">
        {filteredActivities.map((activity) => (
          <Card key={activity.id} className="hover:shadow-elevated transition-all duration-300">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="flex-shrink-0 mt-1">
                    {getActionIcon(activity.action)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      {getActionBadge(activity.action)}
                      <span className="text-sm font-medium text-foreground">
                        {getTableDisplayName(activity.table_name)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      <User className="h-3 w-3 inline mr-1" />
                      {activity.user_email}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 inline mr-1" />
                      {new Date(activity.created_at).toLocaleString('pt-BR')}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      ID: {activity.record_id}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredActivities.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Nenhuma atividade encontrada
            </h3>
            <p className="text-muted-foreground mb-4">
              {filter === 'all' 
                ? 'Não há atividades registradas ainda' 
                : 'Tente selecionar um filtro diferente'
              }
            </p>
            <Button onClick={() => setFilter('all')} variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Limpar Filtros
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}