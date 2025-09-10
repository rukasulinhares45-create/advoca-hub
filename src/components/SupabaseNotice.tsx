import React from 'react';
import { Database, AlertCircle, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function SupabaseNotice() {
  return (
    <Card className="border-accent/20 bg-accent-light">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-accent">
          <Database className="h-5 w-5" />
          Integração com Backend Necessária
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
          <div className="space-y-2">
            <p className="text-sm text-foreground">
              Para implementar todas as funcionalidades solicitadas (autenticação, banco de dados, upload de arquivos), 
              é necessário conectar este projeto ao <strong>Supabase</strong> através da integração nativa do Lovable.
            </p>
            <p className="text-sm text-muted-foreground">
              Atualmente, o sistema está funcionando com dados de demonstração (mock). 
              Após a integração, teremos:
            </p>
            <ul className="text-sm text-muted-foreground ml-4 space-y-1">
              <li>• Autenticação real de usuários</li>
              <li>• Banco de dados para clientes e documentos</li>
              <li>• Upload seguro de arquivos</li>
              <li>• Sistema de permissões</li>
              <li>• Log de auditoria completo</li>
            </ul>
          </div>
        </div>
        
        <div className="pt-4 border-t border-accent/20">
          <p className="text-sm font-medium text-foreground mb-2">
            Como ativar a integração:
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            Clique no botão verde "Supabase" no canto superior direito da interface do Lovable 
            e siga as instruções para conectar seu projeto.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}