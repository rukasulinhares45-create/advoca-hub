import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface UserStats {
  total_clients: number;
  total_documents: number;
  pending_documents: number;
  recent_activity: number;
}

export const useStats = () => {
  const [stats, setStats] = useState<UserStats>({
    total_clients: 0,
    total_documents: 0,
    pending_documents: 0,
    recent_activity: 0
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchStats = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Call the database function to get user stats
      const { data, error } = await supabase
        .rpc('get_user_stats');
      
      if (error) {
        console.error('Erro ao carregar estatísticas:', error);
      } else if (data && data.length > 0) {
        const statsData = data[0];
        setStats({
          total_clients: Number(statsData.total_clients) || 0,
          total_documents: Number(statsData.total_documents) || 0,
          pending_documents: Number(statsData.pending_documents) || 0,
          recent_activity: Number(statsData.recent_activity) || 0
        });
      }
    } catch (error) {
      console.error('Erro inesperado ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  // Set up real-time subscription to refresh stats when data changes
  useEffect(() => {
    if (!user) return;

    const clientsChannel = supabase
      .channel('stats-clients-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'clients'
        },
        () => {
          fetchStats();
        }
      )
      .subscribe();

    const documentsChannel = supabase
      .channel('stats-documents-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'documents'
        },
        () => {
          fetchStats();
        }
      )
      .subscribe();

    const auditChannel = supabase
      .channel('stats-audit-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'audit_logs'
        },
        () => {
          fetchStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(clientsChannel);
      supabase.removeChannel(documentsChannel);
      supabase.removeChannel(auditChannel);
    };
  }, [user]);

  return {
    stats,
    loading,
    fetchStats
  };
};