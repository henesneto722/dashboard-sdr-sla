/**
 * Hook para gerenciar notificações do dashboard
 */

import { useState, useEffect, useCallback, useRef } from 'react';

export type NotificationType = 
  | 'lead_pending' 
  | 'lead_attended' 
  | 'lead_has_profile' 
  | 'sdr_active' 
  | 'sdr_inactive';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  data?: {
    lead_id?: string;
    lead_name?: string;
    sdr_id?: string;
    sdr_name?: string;
  };
}

const STORAGE_KEY = 'dashboard_notifications';
const MAX_NOTIFICATIONS = 1000; // Limite de notificações no histórico

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const previousLeadsRef = useRef<Set<string>>(new Set());
  const previousAttendedLeadsRef = useRef<Set<string>>(new Set());
  const isPendingLeadsInitializedRef = useRef<boolean>(false); // Flag para ignorar primeira carga de leads pendentes
  const isAttendedLeadsInitializedRef = useRef<boolean>(false); // Flag para ignorar primeira carga de leads atendidos

  // Carregar notificações do localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setNotifications(
          parsed.map((n: any) => ({
            ...n,
            timestamp: new Date(n.timestamp),
          }))
        );
      }
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    }
  }, []);

  // Salvar notificações no localStorage
  const saveNotifications = useCallback((newNotifications: Notification[]) => {
    try {
      // Limitar quantidade de notificações
      const limited = newNotifications.slice(-MAX_NOTIFICATIONS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(limited));
      setNotifications(limited);
    } catch (error) {
      console.error('Erro ao salvar notificações:', error);
    }
  }, []);

  // Adicionar notificação
  const addNotification = useCallback((
    type: NotificationType,
    title: string,
    message: string,
    data?: Notification['data']
  ) => {
    const notification: Notification = {
      id: `${Date.now()}-${Math.random()}`,
      type,
      title,
      message,
      timestamp: new Date(),
      read: false,
      data,
    };

    setNotifications((prev) => {
      const updated = [...prev, notification];
      saveNotifications(updated);
      return updated;
    });

    return notification;
  }, [saveNotifications]);

  // Marcar como lida
  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) => {
      const updated = prev.map((n) =>
        n.id === id ? { ...n, read: true } : n
      );
      saveNotifications(updated);
      return updated;
    });
  }, [saveNotifications]);

  // Marcar todas como lidas
  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }));
      saveNotifications(updated);
      return updated;
    });
  }, [saveNotifications]);

  // Deletar notificação
  const deleteNotification = useCallback((id: string) => {
    setNotifications((prev) => {
      const updated = prev.filter((n) => n.id !== id);
      saveNotifications(updated);
      return updated;
    });
  }, [saveNotifications]);

  // Limpar todas as notificações
  const clearAll = useCallback(() => {
    setNotifications([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Filtrar notificações
  const filterNotifications = useCallback((type?: NotificationType) => {
    if (!type) return notifications;
    return notifications.filter((n) => n.type === type);
  }, [notifications]);

  // Contar não lidas
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Detectar novos leads pendentes
  const detectNewPendingLeads = useCallback((leads: any[]) => {
    const currentPendingLeads = new Set(
      leads
        .filter((lead) => lead.sla_minutes === null)
        .map((lead) => lead.lead_id)
    );

    // Na primeira carga, apenas inicializar o ref sem criar notificações
    if (!isPendingLeadsInitializedRef.current) {
      previousLeadsRef.current = currentPendingLeads;
      isPendingLeadsInitializedRef.current = true;
      console.log('🔔 [Notificações] Inicialização: leads pendentes carregados, aguardando novos leads...');
      return;
    }

    // Encontrar novos leads pendentes (que não estavam no ref anterior)
    const newPendingLeads = leads.filter(
      (lead) =>
        lead.sla_minutes === null &&
        lead.lead_id &&
        !previousLeadsRef.current.has(lead.lead_id)
    );

    if (newPendingLeads.length > 0) {
      console.log(`🔔 [Notificações] ${newPendingLeads.length} novo(s) lead(s) pendente(s) detectado(s)`);
    }

    newPendingLeads.forEach((lead) => {
      const stageName = (lead.stage_name || '').toLowerCase();
      const isImportant = stageName.includes('tem perfil') || stageName.includes('perfil menor');

      if (isImportant) {
        // Lead "Tem Perfil" - notificação mais chamativa
        console.log(`🚨 [Notificações] Lead importante detectado: ${lead.lead_name}`);
        addNotification(
          'lead_has_profile',
          '🚨 Lead Importante Pendente!',
          `${lead.lead_name || 'Lead sem nome'} está aguardando atendimento`,
          {
            lead_id: lead.lead_id,
            lead_name: lead.lead_name,
          }
        );
      } else {
        // Lead pendente normal
        console.log(`📋 [Notificações] Lead pendente detectado: ${lead.lead_name}`);
        addNotification(
          'lead_pending',
          'Novo Lead Pendente',
          `${lead.lead_name || 'Lead sem nome'} aguardando atendimento`,
          {
            lead_id: lead.lead_id,
            lead_name: lead.lead_name,
          }
        );
      }
    });

    previousLeadsRef.current = currentPendingLeads;
  }, [addNotification]);

  // Detectar leads atendidos
  const detectAttendedLeads = useCallback((leads: any[]) => {
    const currentAttendedLeads = new Set(
      leads
        .filter((lead) => lead.sla_minutes !== null && lead.attended_at)
        .map((lead) => lead.lead_id)
    );

    // Na primeira carga, apenas inicializar o ref sem criar notificações
    if (!isAttendedLeadsInitializedRef.current) {
      previousAttendedLeadsRef.current = currentAttendedLeads;
      isAttendedLeadsInitializedRef.current = true;
      console.log('✅ [Notificações] Inicialização: leads atendidos carregados, aguardando novos atendimentos...');
      return;
    }

    // Encontrar novos leads atendidos (que não estavam no ref anterior)
    const newAttendedLeads = leads.filter(
      (lead) =>
        lead.sla_minutes !== null &&
        lead.attended_at &&
        lead.lead_id &&
        !previousAttendedLeadsRef.current.has(lead.lead_id)
    );

    if (newAttendedLeads.length > 0) {
      console.log(`✅ [Notificações] ${newAttendedLeads.length} lead(s) atendido(s) detectado(s)`);
    }

    newAttendedLeads.forEach((lead) => {
      console.log(`✅ [Notificações] Lead atendido: ${lead.lead_name} por ${lead.sdr_name}`);
      addNotification(
        'lead_attended',
        'Lead Atendido',
        `${lead.lead_name || 'Lead sem nome'} foi atendido por ${lead.sdr_name || 'SDR'}`,
        {
          lead_id: lead.lead_id,
          lead_name: lead.lead_name,
          sdr_id: lead.sdr_id,
          sdr_name: lead.sdr_name,
        }
      );
    });

    previousAttendedLeadsRef.current = currentAttendedLeads;
  }, [addNotification]);

  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    filterNotifications,
    detectNewPendingLeads,
    detectAttendedLeads,
  };
}

