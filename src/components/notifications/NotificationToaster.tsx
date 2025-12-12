/**
 * Componente para exibir notificações toast no canto superior direito
 * Integra com o sistema de notificações
 * 
 * COMPORTAMENTO:
 * - Quando uma nova notificação é criada, ela aparece IMEDIATAMENTE como toast (se popupEnabled = true)
 * - E também é adicionada ao histórico automaticamente
 */

import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useNotifications } from '@/hooks/useNotifications';

export function NotificationToaster() {
  const { notifications, popupEnabled, markAsRead } = useNotifications();
  const displayedNotificationsRef = useRef<Set<string>>(new Set());
  const previousNotificationsLengthRef = useRef<number>(0);

  useEffect(() => {
    if (!popupEnabled) {
      // Mesmo se popup estiver desativado, atualizar o ref para não perder sincronização
      previousNotificationsLengthRef.current = notifications.length;
      return;
    }

    // Detectar novas notificações comparando o tamanho do array
    // Se o array cresceu, significa que há novas notificações
    const hasNewNotifications = notifications.length > previousNotificationsLengthRef.current;

    if (hasNewNotifications) {
      // Pegar apenas as notificações que ainda não foram exibidas
      const newNotifications = notifications.filter((n) => {
        // Verificar se já foi exibida
        if (displayedNotificationsRef.current.has(n.id)) {
          return false;
        }

        // Verificar se é muito recente (últimos 30 segundos) para evitar exibir notificações antigas ao carregar
        const timeDiff = Date.now() - n.timestamp.getTime();
        return timeDiff < 30000 && timeDiff >= 0;
      });

      // Exibir cada nova notificação como toast
      newNotifications.forEach((notification) => {
        // Marcar como exibida
        displayedNotificationsRef.current.add(notification.id);
        
        if (notification.type === 'lead_has_profile') {
          // Notificação mais chamativa para leads "Tem Perfil"
          toast.error(notification.title, {
            description: notification.message,
            duration: 8000, // 8 segundos
            action: {
              label: 'Ver',
              onClick: () => markAsRead(notification.id),
            },
            className: 'border-red-500 bg-red-50 dark:bg-red-950/20',
          });
        } else if (notification.type === 'lead_pending') {
          toast.info(notification.title, {
            description: notification.message,
            duration: 5000,
            action: {
              label: 'Ver',
              onClick: () => markAsRead(notification.id),
            },
          });
        } else if (notification.type === 'lead_attended') {
          toast.success(notification.title, {
            description: notification.message,
            duration: 4000,
            action: {
              label: 'Ver',
              onClick: () => markAsRead(notification.id),
            },
          });
        } else if (notification.type === 'sdr_active') {
          toast.success(notification.title, {
            description: notification.message,
            duration: 4000,
          });
        } else if (notification.type === 'sdr_inactive') {
          toast.warning(notification.title, {
            description: notification.message,
            duration: 4000,
          });
        }
      });
    }

    // Atualizar referência do tamanho
    previousNotificationsLengthRef.current = notifications.length;

    // Limpar notificações antigas do ref (mais de 1 minuto)
    const now = Date.now();
    displayedNotificationsRef.current.forEach((id) => {
      const notification = notifications.find((n) => n.id === id);
      if (notification) {
        const timeDiff = now - notification.timestamp.getTime();
        if (timeDiff > 60000) {
          displayedNotificationsRef.current.delete(id);
        }
      } else {
        // Se a notificação não existe mais, remover do ref
        displayedNotificationsRef.current.delete(id);
      }
    });
  }, [notifications, popupEnabled, markAsRead]);

  return null;
}

