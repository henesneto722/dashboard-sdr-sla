/**
 * Hook para atualização em tempo real dos leads
 * Combina Supabase Realtime + Polling como backup
 */

import { useEffect, useCallback, useRef } from 'react';
import { supabase, isRealtimeEnabled } from '@/lib/supabase';
import { toast } from 'sonner';

interface RealtimeOptions {
  onNewLead?: (lead: any) => void;
  onLeadUpdated?: (lead: any) => void;
  onRefresh: () => void;
  pollingInterval?: number; // em milissegundos
}

export function useRealtimeLeads({
  onNewLead,
  onLeadUpdated,
  onRefresh,
  pollingInterval = 60000, // 60 segundos default
}: RealtimeOptions) {
  const channelRef = useRef<any>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const lastLeadCountRef = useRef<number>(0);
  const realtimeFailedRef = useRef<boolean>(false); // Flag para evitar tentativas infinitas

  // Função para mostrar notificação de novo lead
  const showNewLeadNotification = useCallback((lead: any) => {
    const isImportant = lead.stage_name?.toLowerCase().includes('tem perfil') ||
                       lead.stage_name?.toLowerCase().includes('perfil menor');
    
    if (isImportant) {
      toast.warning('🔔 Novo lead importante!', {
        description: `${lead.lead_name} - ${lead.stage_name || 'Aguardando classificação'}`,
        duration: 8000,
        action: {
          label: 'Ver',
          onClick: () => {
            // Scroll para tabela
            document.querySelector('[data-leads-table]')?.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'start' 
            });
          },
        },
      });
    } else {
      toast.info('📥 Novo lead recebido', {
        description: lead.lead_name,
        duration: 5000,
      });
    }
  }, []);

  // Função para mostrar notificação de lead atendido
  const showLeadAttendedNotification = useCallback((lead: any) => {
    toast.success('✅ Lead atendido!', {
      description: `${lead.lead_name} - ${lead.sdr_name || 'SDR'} (${lead.sla_minutes}min)`,
      duration: 5000,
    });
  }, []);

  // Setup Supabase Realtime
  useEffect(() => {
    // Se já falhou antes, não tentar novamente
    if (realtimeFailedRef.current) {
      return;
    }

    if (!isRealtimeEnabled || !supabase) {
      console.log('📡 Realtime não configurado, usando apenas polling');
      return;
    }

    console.log('📡 Conectando ao Supabase Realtime...');

    // Criar canal para escutar mudanças na tabela leads_sla
    const channel = supabase
      .channel('leads-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'leads_sla',
        },
        (payload) => {
          console.log('🆕 Novo lead recebido via Realtime:', payload.new);
          showNewLeadNotification(payload.new);
          onNewLead?.(payload.new);
          onRefresh();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'leads_sla',
        },
        (payload) => {
          console.log('📝 Lead atualizado via Realtime:', payload.new);
          
          // Se foi atendido (tinha attended_at null e agora tem valor)
          const oldLead = payload.old as any;
          const newLead = payload.new as any;
          
          if (!oldLead?.attended_at && newLead?.attended_at) {
            showLeadAttendedNotification(newLead);
          }
          
          onLeadUpdated?.(payload.new);
          onRefresh();
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Conectado ao Realtime com sucesso');
          realtimeFailedRef.current = false; // Reset flag em caso de reconexão
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          // Se falhar, marcar como falho e não tentar mais
          if (!realtimeFailedRef.current) {
            console.warn('⚠️ Realtime falhou, usando apenas polling. Status:', status);
            realtimeFailedRef.current = true;
            // Limpar canal em caso de erro
            if (channelRef.current) {
              supabase.removeChannel(channelRef.current);
              channelRef.current = null;
            }
          }
        } else {
          // Outros status (SUBSCRIBING, etc) - apenas logar sem erro
          console.log('📡 Status do Realtime:', status);
        }
      });

    channelRef.current = channel;

    // Cleanup
    return () => {
      if (channelRef.current) {
        console.log('📡 Desconectando do Realtime...');
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [onNewLead, onLeadUpdated, onRefresh, showNewLeadNotification, showLeadAttendedNotification]);

  // Setup Polling como backup
  useEffect(() => {
    console.log(`🔄 Iniciando polling a cada ${pollingInterval / 1000} segundos`);

    pollingRef.current = setInterval(() => {
      console.log('🔄 Polling: atualizando dados...');
      onRefresh();
    }, pollingInterval);

    // Cleanup
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [pollingInterval, onRefresh]);

  // Função para forçar refresh manual
  const forceRefresh = useCallback(() => {
    console.log('🔄 Refresh manual solicitado');
    onRefresh();
    toast.info('🔄 Dados atualizados', { duration: 2000 });
  }, [onRefresh]);

  return {
    isRealtimeEnabled,
    forceRefresh,
  };
}

