import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

export interface ClientAddress {
  cep: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
}

export interface Client {
  id: string;
  type: 'PF' | 'PJ';
  name: string;
  document: string;
  email: string;
  phone: string;
  occupation?: string;
  activity?: string;
  address: ClientAddress;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export const useClients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchClients = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Erro ao carregar clientes:', error);
        toast({
          title: "Erro ao carregar clientes",
          description: error.message,
          variant: "destructive",
        });
      } else {
        // Transform the data to match our interface
        const transformedClients = (data || []).map(client => ({
          ...client,
          address: typeof client.address === 'string' ? JSON.parse(client.address) : client.address
        }));
        setClients(transformedClients);
      }
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao carregar os clientes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createClient = async (clientData: Omit<Client, 'id' | 'created_by' | 'created_at' | 'updated_at'>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('clients')
        .insert([{
          ...clientData,
          address: JSON.stringify(clientData.address),
          created_by: user.id
        }])
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar cliente:', error);
        toast({
          title: "Erro ao criar cliente",
          description: error.message,
          variant: "destructive",
        });
        return null;
      }

      toast({
        title: "Cliente criado com sucesso",
        description: `${clientData.name} foi adicionado ao sistema`,
      });
      
      await fetchClients(); // Recarrega a lista
      return data;
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao criar o cliente",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateClient = async (id: string, updates: Partial<Client>) => {
    if (!user) return null;

    try {
      // Transform address if it exists in updates
      const transformedUpdates: Record<string, any> = { ...updates };
      if (updates.address && typeof updates.address === 'object') {
        transformedUpdates.address = JSON.stringify(updates.address);
      }

      const { data, error } = await supabase
        .from('clients')
        .update(transformedUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar cliente:', error);
        toast({
          title: "Erro ao atualizar cliente",
          description: error.message,
          variant: "destructive",
        });
        return null;
      }

      toast({
        title: "Cliente atualizado com sucesso",
      });
      
      await fetchClients(); // Recarrega a lista
      return data;
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao atualizar o cliente",
        variant: "destructive",
      });
      return null;
    }
  };

  const deleteClient = async (id: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao deletar cliente:', error);
        toast({
          title: "Erro ao deletar cliente",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Cliente removido com sucesso",
      });
      
      await fetchClients(); // Recarrega a lista
      return true;
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao deletar o cliente",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    if (user) {
      fetchClients();
    }
  }, [user]);

  // Set up real-time subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('clients-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'clients'
        },
        () => {
          fetchClients(); // Recarrega quando há mudanças
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    clients,
    loading,
    fetchClients,
    createClient,
    updateClient,
    deleteClient
  };
};