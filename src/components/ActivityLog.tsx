import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, User, FileText, Edit, Trash2, Plus, Filter } from 'lucide-react';
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
  action: 'CREATE' | 'UPDATE' | 'DELETE';
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

  useEffect(() => {
    fetchActivities();
  }, [user]);

  const fetchActivities = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setActivities((data || []).map((item: any) => ({
        id: item.id,
        table_name: item.table_name,
        record_id: item.record_id,
        action: item.action as 'CREATE' | 'UPDATE' | 'DELETE',
        user_email: item.user_email,
        created_at: item.created_at,
        old_data: item.old_data,
        new_data: item.new_data
      })));
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'CREATE':
        return <Badge variant="default" className="bg-success text-success-foreground">Criado</Badge>;
      case 'UPDATE':
        return <Badge variant="default" className="bg-warning text-warning-foreground">Editado</Badge>;
      case 'DELETE':
        return <Badge variant="destructive">Excluído</Badge>;
      default:
        return <Badge variant="secondary">{action}</Badge>;
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'CREATE':
        return <Plus className="h-4 w-4 text-success" />;
      case 'UPDATE':
        return <Edit className="h-4 w-4 text-warning" />;
      case 'DELETE':
        return <Trash2 className="h-4 w-4 text-destructive" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('pt-BR'),
      time: date.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
  };

  const filteredActivities = activities.filter(activity => {
    if (filter === 'all') return true;
    return activity.table_name === filter;
  });

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-secondary rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-secondary rounded w-1/2"></div>
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
              Histórico de alterações no sistema
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="clients">Clientes</SelectItem>
              <SelectItem value="documents">Documentos</SelectItem>
              <SelectItem value="profiles">Perfis</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Activity Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{activities.length}</p>
              <p className="text-sm text-muted-foreground">Total</p>
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
              <p className="text-sm text-muted-foreground">Edições</p>
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

      {/* Activity List */}
      <div className="space-y-4">
        {filteredActivities.map((activity) => {
          const { date, time } = formatDate(activity.created_at);
          
          return (
            <Card key={activity.id} className="hover:shadow-card transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-secondary">
                      {getActionIcon(activity.action)}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        {getActionBadge(activity.action)}
                        <span className="font-medium text-foreground">
                          {getTableDisplayName(activity.table_name)}
                        </span>
                      </div>
                      
                      <p className="text-sm text-muted-foreground">
                        {activity.action === 'CREATE' && `Novo ${getTableDisplayName(activity.table_name).toLowerCase()} foi criado`}
                        {activity.action === 'UPDATE' && `${getTableDisplayName(activity.table_name)} foi atualizado`}
                        {activity.action === 'DELETE' && `${getTableDisplayName(activity.table_name)} foi excluído`}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {activity.user_email}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {date} às {time}
                        </div>
                      </div>

                      {activity.new_data && activity.table_name === 'clients' && (
                        <div className="mt-2 p-2 bg-secondary rounded text-xs">
                          <span className="font-medium">Cliente: </span>
                          {activity.new_data.name}
                        </div>
                      )}

                      {activity.new_data && activity.table_name === 'documents' && (
                        <div className="mt-2 p-2 bg-secondary rounded text-xs">
                          <span className="font-medium">Documento: </span>
                          {activity.new_data.title}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredActivities.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Nenhuma atividade encontrada
            </h3>
            <p className="text-muted-foreground">
              {filter === 'all' 
                ? 'Ainda não há atividades registradas no sistema.'
                : `Nenhuma atividade encontrada para ${getTableDisplayName(filter).toLowerCase()}.`
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}