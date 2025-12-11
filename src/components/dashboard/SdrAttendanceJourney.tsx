/**
 * Componente para exibir a Jornada de Atendimento dos SDRs
 * Mostra métricas de turnos (manhã e tarde) por SDR e data
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { fetchSdrAttendance, SdrDailyMetrics } from "@/lib/api";
import { Loader2, Clock, Sunrise, Sunset, Calendar } from "lucide-react";

/**
 * Formata timestamp UTC para horário de São Paulo
 */
function formatTime(timestamp: string | null): string {
  if (!timestamp) return '-';
  
  try {
    const date = new Date(timestamp);
    const formatter = new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      hour: '2-digit',
      minute: '2-digit',
    });
    return formatter.format(date);
  } catch {
    return '-';
  }
}

/**
 * Formata data para exibição
 */
function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

/**
 * Calcula duração do turno em minutos
 */
function calculateDuration(first: string | null, last: string | null): number | null {
  if (!first || !last) return null;
  
  try {
    const firstDate = new Date(first);
    const lastDate = new Date(last);
    const diffMs = lastDate.getTime() - firstDate.getTime();
    return Math.round(diffMs / 60000); // minutos
  } catch {
    return null;
  }
}

/**
 * Formata duração em horas e minutos
 */
function formatDuration(minutes: number | null): string {
  if (minutes === null) return '-';
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) return `${mins}min`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}min`;
}

interface SdrAttendanceJourneyProps {
  sdrId?: string;
  date?: string;
}

export const SdrAttendanceJourney = ({ sdrId, date }: SdrAttendanceJourneyProps) => {
  const { data: metrics, isLoading, error } = useQuery<SdrDailyMetrics[]>({
    queryKey: ['sdr-attendance', sdrId, date],
    queryFn: () => fetchSdrAttendance({ sdr_id: sdrId, date }),
    refetchInterval: 60000, // Atualiza a cada 60 segundos
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Jornada de Atendimento dos SDRs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Jornada de Atendimento dos SDRs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            Erro ao carregar dados de jornada
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!metrics || metrics.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Jornada de Atendimento dos SDRs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            Nenhum dado de jornada disponível
            <br />
            <span className="text-sm mt-2">
              Os eventos são registrados quando leads são movidos do pipeline principal para pipelines individuais
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Jornada de Atendimento dos SDRs
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Métricas de turnos (Manhã: 06h-12h | Tarde: 13h-18h) - Horário de São Paulo
        </p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3 font-medium">SDR</th>
                <th className="text-left p-3 font-medium">Data</th>
                <th className="text-center p-3 font-medium">
                  <Sunrise className="h-4 w-4 inline-block mr-1 text-yellow-500" />
                  Manhã
                </th>
                <th className="text-center p-3 font-medium">
                  <Sunset className="h-4 w-4 inline-block mr-1 text-orange-500" />
                  Tarde
                </th>
                <th className="text-center p-3 font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {metrics.map((metric, index) => {
                const morningDuration = calculateDuration(
                  metric.morning.first_action,
                  metric.morning.last_action
                );
                const afternoonDuration = calculateDuration(
                  metric.afternoon.first_action,
                  metric.afternoon.last_action
                );

                return (
                  <tr
                    key={`${metric.sdr_id}-${metric.date}-${index}`}
                    className="border-b border-border hover:bg-muted/50 transition-colors"
                  >
                    <td className="p-3 font-medium">
                      {metric.sdr_name || metric.sdr_id}
                    </td>
                    <td className="p-3 text-muted-foreground">
                      {formatDate(metric.date)}
                    </td>
                    <td className="p-3">
                      {metric.morning.action_count > 0 ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 justify-center">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs">
                              {formatTime(metric.morning.first_action)} - {formatTime(metric.morning.last_action)}
                            </span>
                          </div>
                          <div className="text-xs text-center text-muted-foreground">
                            {metric.morning.action_count} ação(ões) • {formatDuration(morningDuration)}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-center block">-</span>
                      )}
                    </td>
                    <td className="p-3">
                      {metric.afternoon.action_count > 0 ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 justify-center">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs">
                              {formatTime(metric.afternoon.first_action)} - {formatTime(metric.afternoon.last_action)}
                            </span>
                          </div>
                          <div className="text-xs text-center text-muted-foreground">
                            {metric.afternoon.action_count} ação(ões) • {formatDuration(afternoonDuration)}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-center block">-</span>
                      )}
                    </td>
                    <td className="p-3 text-center font-medium">
                      {metric.total_actions}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {metrics.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Total de registros: {metrics.length}</span>
              <span className="text-xs">
                Atualiza automaticamente a cada 60 segundos
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

