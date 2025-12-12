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
  const [popupEnabled, setPopupEnabled] = useState(true);
  const previousLeadsRef = useRef<Set<string>>(new Set());
  const previousAttendedLeadsRef = useRef<Set<string>>(new Set());

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

      const popupStored = localStorage.getItem('notifications_popup_enabled');
      if (popupStored !== null) {
        setPopupEnabled(JSON.parse(popupStored));
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

  // Toggle popup
  const togglePopup = useCallback(() => {
    setPopupEnabled((prev) => {
      const newValue = !prev;
      localStorage.setItem('notifications_popup_enabled', JSON.stringify(newValue));
      return newValue;
    });
  }, []);

  // Detectar novos leads pendentes
  const detectNewPendingLeads = useCallback((leads: any[]) => {
    const currentPendingLeads = new Set(
      leads
        .filter((lead) => lead.sla_minutes === null)
        .map((lead) => lead.lead_id)
    );

    // Encontrar novos leads pendentes
    const newPendingLeads = leads.filter(
      (lead) =>
        lead.sla_minutes === null &&
        !previousLeadsRef.current.has(lead.lead_id)
    );

    newPendingLeads.forEach((lead) => {
      const stageName = (lead.stage_name || '').toLowerCase();
      const isImportant = stageName.includes('tem perfil') || stageName.includes('perfil menor');

      if (isImportant) {
        // Lead "Tem Perfil" - notificação mais chamativa
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

    // Encontrar novos leads atendidos
    const newAttendedLeads = leads.filter(
      (lead) =>
        lead.sla_minutes !== null &&
        lead.attended_at &&
        !previousAttendedLeadsRef.current.has(lead.lead_id)
    );

    newAttendedLeads.forEach((lead) => {
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
    popupEnabled,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    filterNotifications,
    togglePopup,
    detectNewPendingLeads,
    detectAttendedLeads,
  };
}

