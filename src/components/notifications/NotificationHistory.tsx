/**
 * Componente de histórico de notificações
 * Exibe todas as notificações com filtros e controles
 */

import { useState } from 'react';
import { Bell, X, CheckCheck, Trash2, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotifications, NotificationType, Notification } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const notificationIcons: Record<NotificationType, string> = {
  lead_pending: '📋',
  lead_attended: '✅',
  lead_has_profile: '🚨',
  sdr_active: '👤',
  sdr_inactive: '👤',
};

const notificationColors: Record<NotificationType, string> = {
  lead_pending: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  lead_attended: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
  lead_has_profile: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
  sdr_active: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  sdr_inactive: 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20',
};

export function NotificationHistory() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    filterNotifications,
  } = useNotifications();

  const [filter, setFilter] = useState<NotificationType | 'all'>('all');
  const [isOpen, setIsOpen] = useState(false);

  const filteredNotifications = filter === 'all' 
    ? notifications 
    : filterNotifications(filter);

  const filteredUnreadCount = filteredNotifications.filter((n) => !n.read).length;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative p-2 rounded-lg hover:bg-muted transition-colors dark:hover:bg-white/5"
          title="Notificações"
        >
          <Bell className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="end">
        <div className="flex flex-col h-[600px]">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              <h3 className="font-semibold">Notificações</h3>
              {filteredUnreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {filteredUnreadCount} não lidas
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Filtros e Controles */}
          <div className="p-4 border-b space-y-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={filter} onValueChange={(value) => setFilter(value as NotificationType | 'all')}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Filtrar por tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="lead_pending">Leads Pendentes</SelectItem>
                  <SelectItem value="lead_attended">Leads Atendidos</SelectItem>
                  <SelectItem value="lead_has_profile">Leads Tem Perfil</SelectItem>
                  <SelectItem value="sdr_active">SDR Ativo</SelectItem>
                  <SelectItem value="sdr_inactive">SDR Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
                className="flex-1"
                disabled={filteredUnreadCount === 0}
              >
                <CheckCheck className="h-4 w-4 mr-2" />
                Marcar todas como lidas
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={clearAll}
                className="flex-1"
                disabled={notifications.length === 0}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Limpar tudo
              </Button>
            </div>
          </div>

          {/* Lista de Notificações */}
          <ScrollArea className="flex-1">
            {filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <Bell className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-sm text-muted-foreground">
                  Nenhuma notificação encontrada
                </p>
              </div>
            ) : (
              <div className="p-2 space-y-2">
                {filteredNotifications
                  .slice()
                  .reverse()
                  .map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onRead={() => markAsRead(notification.id)}
                      onDelete={() => deleteNotification(notification.id)}
                    />
                  ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function NotificationItem({
  notification,
  onRead,
  onDelete,
}: {
  notification: Notification;
  onRead: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className={`
        relative p-3 rounded-lg border transition-all cursor-pointer group
        ${notification.read 
          ? 'bg-muted/30 border-border' 
          : 'bg-primary/5 border-primary/20'
        }
        hover:bg-muted/50
      `}
      onClick={onRead}
    >
      <div className="flex items-start gap-3">
        <div className={`
          flex items-center justify-center w-10 h-10 rounded-full
          ${notificationColors[notification.type]}
        `}>
          <span className="text-lg">{notificationIcons[notification.type]}</span>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <p className={`text-sm font-medium ${notification.read ? '' : 'font-semibold'}`}>
                {notification.title}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {notification.message}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {formatDistanceToNow(notification.timestamp, {
                  addSuffix: true,
                  locale: ptBR,
                })}
              </p>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      {!notification.read && (
        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary" />
      )}
    </div>
  );
}

