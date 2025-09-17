import React from 'react';
import { LogOut, Settings, User, Shield, FileText, Users, BarChart3, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface HeaderProps {
  user: { username: string; role: 'admin' | 'user' };
  onLogout: () => void;
  onNavigate: (section: string) => void;
}

export default function Header({ user, onLogout, onNavigate }: HeaderProps) {
  const isAdmin = user.role === 'admin';

  return (
    <header className="bg-white border-b border-border shadow-card sticky top-0 z-50">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Logo and Title */}
        <div 
          className="flex items-center gap-4 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => onNavigate('dashboard')}
        >
          <img
            src="https://i.ibb.co/LzWD2mM/Logo-papel-timbrado-1.png"
            alt="Márcia Suzana Advocacia"
            className="h-10 object-contain"
          />
          <div>
            <h1 className="text-lg font-bold text-primary">MÁRCIA SUZANA</h1>
            <p className="text-xs text-muted-foreground font-medium tracking-wider">
              ADVOCACIA • CONSULTORIA • ASSESSORIA
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="hidden lg:flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={() => onNavigate('dashboard')}
            className="gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </Button>
          <Button
            variant="ghost"
            onClick={() => onNavigate('clients')}
            className="gap-2"
          >
            <Users className="h-4 w-4" />
            Clientes
          </Button>
          <Button
            variant="ghost"
            onClick={() => onNavigate('documents')}
            className="gap-2"
          >
            <FileText className="h-4 w-4" />
            Documentos
          </Button>
          <Button
            variant="ghost"
            onClick={() => onNavigate('reports')}
            className="gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            Relatórios
          </Button>
        </nav>

        {/* User Menu */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 text-sm">
            <div className="flex items-center gap-2 px-3 py-2 bg-secondary rounded-lg">
              <Shield className={`h-4 w-4 ${isAdmin ? 'text-accent' : 'text-primary'}`} />
              <span className="font-medium">{user.username}</span>
              <span className="text-xs text-muted-foreground">
                ({isAdmin ? 'Admin' : 'Usuário'})
              </span>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{user.username}</p>
                <p className="text-xs text-muted-foreground">
                  {isAdmin ? 'Administrador' : 'Usuário Padrão'}
                </p>
              </div>
              <DropdownMenuSeparator />
              
              <DropdownMenuItem onClick={() => onNavigate('dashboard')}>
                <BarChart3 className="mr-2 h-4 w-4" />
                Dashboard
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={() => onNavigate('clients')}>
                <Users className="mr-2 h-4 w-4" />
                Clientes
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={() => onNavigate('documents')}>
                <FileText className="mr-2 h-4 w-4" />
                Documentos
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={() => onNavigate('reports')}>
                <BarChart3 className="mr-2 h-4 w-4" />
                Relatórios
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={() => onNavigate('activity')}>
                <Clock className="mr-2 h-4 w-4" />
                Atividades
              </DropdownMenuItem>
              
              {isAdmin && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onNavigate('settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    Configurações
                  </DropdownMenuItem>
                </>
              )}
              
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}