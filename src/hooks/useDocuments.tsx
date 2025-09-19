import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

export interface Document {
  id: string;
  client_id: string;
  title: string;
  description?: string;
  file_path?: string;
  file_name?: string;
  file_size?: number;
  file_type?: string;
  status: 'pending' | 'review' | 'approved' | 'rejected';
  tags: string[];
  created_by: string;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
  client?: {
    name: string;
    type: 'PF' | 'PJ';
  };
}

export const useDocuments = (clientId?: string) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchDocuments = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      let query = supabase
        .from('documents')
        .select(`
          *,
          client:clients(name, type)
        `)
        .order('created_at', { ascending: false });

      if (clientId) {
        query = query.eq('client_id', clientId);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Erro ao carregar documentos:', error);
        toast({
          title: "Erro ao carregar documentos",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setDocuments(data || []);
      }
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao carregar os documentos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadDocument = async (
    file: File,
    documentData: Omit<Document, 'id' | 'file_path' | 'file_name' | 'file_size' | 'file_type' | 'created_by' | 'created_at' | 'updated_at' | 'client'>
  ) => {
    if (!user) return null;

    try {
      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, file);

      if (uploadError) {
        console.error('Erro ao fazer upload:', uploadError);
        toast({
          title: "Erro no upload",
          description: uploadError.message,
          variant: "destructive",
        });
        return null;
      }

      // Create document record
      const { data, error } = await supabase
        .from('documents')
        .insert([{
          ...documentData,
          file_path: fileName,
          file_name: file.name,
          file_size: file.size,
          file_type: file.type,
          created_by: user.id
        }])
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar documento:', error);
        // Remove uploaded file if document creation fails
        await supabase.storage
          .from('documents')
          .remove([fileName]);
        
        toast({
          title: "Erro ao criar documento",
          description: error.message,
          variant: "destructive",
        });
        return null;
      }

      toast({
        title: "Documento enviado com sucesso",
        description: `${file.name} foi adicionado ao sistema`,
      });
      
      await fetchDocuments();
      return data;
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao enviar o documento",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateDocumentStatus = async (id: string, status: Document['status'], reviewedBy?: string) => {
    if (!user) return null;

    try {
      const updates: { 
        status: Document['status']; 
        reviewed_at: string; 
        reviewed_by?: string; 
      } = { 
        status,
        reviewed_at: new Date().toISOString()
      };
      
      if (reviewedBy) {
        updates.reviewed_by = reviewedBy;
      }

      const { data, error } = await supabase
        .from('documents')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar status:', error);
        toast({
          title: "Erro ao atualizar status",
          description: error.message,
          variant: "destructive",
        });
        return null;
      }

      toast({
        title: "Status atualizado com sucesso",
      });
      
      await fetchDocuments();
      return data;
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao atualizar o status",
        variant: "destructive",
      });
      return null;
    }
  };

  const downloadDocument = async (document: Document) => {
    if (!document.file_path) return;

    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .download(document.file_path);

      if (error) {
        console.error('Erro ao baixar documento:', error);
        toast({
          title: "Erro ao baixar documento",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      // Create download link
      const url = URL.createObjectURL(data);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = document.file_name || 'documento';
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Log download action
      await supabase
        .from('audit_logs')
        .insert([{
          table_name: 'documents',
          record_id: document.id,
          action: 'DOWNLOAD',
          user_id: user.id,
          user_email: user.email || '',
          created_at: new Date().toISOString()
        }]);

    } catch (error) {
      console.error('Erro inesperado:', error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao baixar o documento",
        variant: "destructive",
      });
    }
  };

  const deleteDocument = async (id: string) => {
    if (!user) return false;

    try {
      // Get document details first
      const { data: doc } = await supabase
        .from('documents')
        .select('file_path')
        .eq('id', id)
        .single();

      // Delete from database
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao deletar documento:', error);
        toast({
          title: "Erro ao deletar documento",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }

      // Delete file from storage
      if (doc?.file_path) {
        await supabase.storage
          .from('documents')
          .remove([doc.file_path]);
      }

      toast({
        title: "Documento removido com sucesso",
      });
      
      await fetchDocuments();
      return true;
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao deletar o documento",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    if (user) {
      fetchDocuments();
    }
  }, [user, clientId]);

  // Set up real-time subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('documents-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'documents'
        },
        () => {
          fetchDocuments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, clientId]);

  return {
    documents,
    loading,
    fetchDocuments,
    uploadDocument,
    updateDocumentStatus,
    downloadDocument,
    deleteDocument
  };
};