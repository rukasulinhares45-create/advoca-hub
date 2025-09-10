import React from 'react';
import { Users, FileText, Settings, BarChart3, Clock, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface DashboardProps {
  user: { username: string; role: 'admin' | 'user' };
  onNavigate: (section: string) => void;
  stats: {
    totalClients: number;
    totalDocuments: number;
    pendingDocuments: number;
    recentActivity: number;
  };
}

export default function Dashboard({ user, onNavigate, stats }: DashboardProps) {
  const isAdmin = user.role === 'admin';

  const dashboardCards = [
    {
      title: 'Total de Clientes',
      value: stats.totalClients,
      icon: Users,
      color: 'text-primary',
      bg: 'bg-primary-light',
      onClick: () => onNavigate('clients'),
    },
    {
      title: 'Documentos',
      value: stats.totalDocuments,
      icon: FileText,
      color: 'text-accent',
      bg: 'bg-accent-light',
      onClick: () => onNavigate('clients'),
    },
    {
      title: 'Pendências',
      value: stats.pendingDocuments,
      icon: Clock,
      color: 'text-warning',
      bg: 'bg-warning-light',
      onClick: () => onNavigate('clients'),
    },
    {
      title: 'Atividade Recente',
      value: stats.recentActivity,
      icon: BarChart3,
      color: 'text-success',
      bg: 'bg-success-light',
      onClick: () => onNavigate('activity'),
    },
  ];

  const quickActions = [
    {
      title: 'Novo Cliente',
      description: 'Cadastrar pessoa física ou jurídica',
      icon: Users,
      onClick: () => onNavigate('new-client'),
      color: 'primary',
    },
    {
      title: 'Buscar Cliente',
      description: 'Localizar cliente existente',
      icon: FileText,
      onClick: () => onNavigate('clients'),
      color: 'secondary',
    },
  ];

  if (isAdmin) {
    quickActions.push({
      title: 'Configurações',
      description: 'Gerenciar sistema e usuários',
      icon: Settings,
      onClick: () => onNavigate('settings'),
      color: 'accent',
    });
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary to-primary-hover rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              Bem-vindo, {user.username}
            </h1>
            <p className="text-primary-light opacity-90">
              Sistema de Gestão - Márcia Suzana Advocacia
            </p>
            <div className="flex items-center gap-2 mt-3">
              <Shield className="h-4 w-4" />
              <span className="text-sm font-medium">
                {isAdmin ? 'Administrador' : 'Usuário Padrão'}
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm opacity-90">
              {new Date().toLocaleDateString('pt-BR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardCards.map((card, index) => (
          <Card
            key={card.title}
            className="cursor-pointer hover:shadow-elevated transition-all duration-300 hover:-translate-y-1"
            onClick={card.onClick}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {card.title}
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {card.value}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${card.bg}`}>
                  <card.icon className={`h-6 w-6 ${card.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickActions.map((action, index) => (
            <Card
              key={action.title}
              className="cursor-pointer hover:shadow-elevated transition-all duration-300 hover:-translate-y-1"
              onClick={action.onClick}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-${action.color}-light`}>
                    <action.icon className={`h-5 w-5 text-${action.color}`} />
                  </div>
                  <CardTitle className="text-lg">{action.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {action.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Atividade Recente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-sm">Cliente atualizado recentemente</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {item} hora{item > 1 ? 's' : ''} atrás
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}