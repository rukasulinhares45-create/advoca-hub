import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, Save, Upload, FileText, User, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useDocuments } from '@/hooks/useDocuments';
import { useClients } from '@/hooks/useClients';
import { toast } from '@/hooks/use-toast';

const documentSchema = z.object({
  title: z.string().min(3, 'Título deve ter pelo menos 3 caracteres'),
  description: z.string().optional(),
  client_id: z.string().min(1, 'Cliente é obrigatório'),
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
});

type DocumentFormData = z.infer<typeof documentSchema>;

interface DocumentFormProps {
  documentId?: string;
  clientId?: string;
  onNavigate: (section: string, id?: string) => void;
}

export default function DocumentForm({ documentId, clientId, onNavigate }: DocumentFormProps) {
  const { documents, uploadDocument, updateDocumentStatus } = useDocuments();
  const { clients } = useClients();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isEditing, setIsEditing] = useState(!!documentId);

  const existingDocument = documentId ? documents.find(d => d.id === documentId) : null;

  const form = useForm<DocumentFormData>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      title: '',
      description: '',
      client_id: clientId || '',
      status: 'pending',
    },
  });

  useEffect(() => {
    if (existingDocument) {
      form.reset({
        title: existingDocument.title,
        description: existingDocument.description || '',
        client_id: existingDocument.client_id,
        status: existingDocument.status as 'pending' | 'approved' | 'rejected',
      });
    }
  }, [existingDocument, form]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Verificar tamanho do arquivo (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: "O arquivo deve ter no máximo 10MB",
          variant: "destructive",
        });
        return;
      }
      
      // Verificar tipo de arquivo
      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/jpg',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Tipo de arquivo não suportado",
          description: "Apenas PDF, JPG, PNG e DOC são aceitos",
          variant: "destructive",
        });
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const onSubmit = async (data: DocumentFormData) => {
    setIsSubmitting(true);
    
    try {
      if (!selectedFile && !isEditing) {
        toast({
          title: "Arquivo obrigatório",
          description: "Selecione um arquivo para fazer upload.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      if (isEditing && documentId) {
        // Para edição, apenas atualiza o status se necessário
        if (data.status && existingDocument?.status !== data.status) {
          await updateDocumentStatus(documentId, data.status as 'pending' | 'approved' | 'rejected');
        }
        toast({
          title: "Documento atualizado",
          description: "As informações do documento foram atualizadas com sucesso.",
        });
      } else if (selectedFile) {
        // Para criação, faz upload do documento
        const documentData = {
          title: data.title,
          description: data.description || undefined,
          client_id: data.client_id,
          status: (data.status as 'pending' | 'approved' | 'rejected') || 'pending',
          tags: [], // Tags vazias por padrão
        };
        
        await uploadDocument(selectedFile, documentData);
        toast({
          title: "Documento criado",
          description: "O documento foi criado com sucesso.",
        });
      }
      
      if (clientId) {
        onNavigate('client-documents', clientId);
      } else {
        onNavigate('documents');
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar o documento. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedClient = clients.find(c => c.id === form.watch('client_id'));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            if (clientId) {
              onNavigate('client-documents', clientId);
            } else {
              onNavigate('documents');
            }
          }}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {isEditing ? 'Editar Documento' : 'Novo Documento'}
          </h1>
          <p className="text-muted-foreground">
            {isEditing ? 'Atualize as informações do documento' : 'Adicione um novo documento ao sistema'}
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Informações do Documento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="client_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cliente</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o cliente" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            <div className="flex items-center gap-2">
                              {client.type === 'PF' ? <User className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                              {client.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {selectedClient && (
                <div className="p-3 bg-secondary rounded-lg">
                  <p className="text-sm font-medium">Cliente selecionado:</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={selectedClient.type === 'PF' ? 'default' : 'secondary'}>
                      {selectedClient.type}
                    </Badge>
                    <span className="text-sm">{selectedClient.name}</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título do Documento</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: Contrato de Prestação de Serviços"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pending">Pendente</SelectItem>
                          <SelectItem value="approved">Aprovado</SelectItem>
                          <SelectItem value="rejected">Rejeitado</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição (opcional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descreva o documento ou adicione observações..."
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Upload de Arquivo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload de Arquivo
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedFile ? (
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Selecione um arquivo</h3>
                  <p className="text-muted-foreground mb-4">
                    PDF, JPG, PNG ou DOC até 10MB
                  </p>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Button type="button" variant="outline">
                      Escolher Arquivo
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-primary" />
                      <div>
                        <p className="font-medium">{selectedFile.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatFileSize(selectedFile.size)}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={removeFile}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {existingDocument?.file_path && !selectedFile && (
                <div className="mt-4 p-4 bg-secondary rounded-lg">
                  <p className="text-sm font-medium mb-2">Arquivo atual:</p>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span className="text-sm">{existingDocument.file_name || 'Documento existente'}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Selecione um novo arquivo para substituir o atual
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (clientId) {
                  onNavigate('client-documents', clientId);
                } else {
                  onNavigate('documents');
                }
              }}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || (!selectedFile && !isEditing)}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {isEditing ? 'Atualizar' : 'Criar Documento'}
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}