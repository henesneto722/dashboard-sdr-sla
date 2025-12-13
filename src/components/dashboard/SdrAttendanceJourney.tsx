/**
 * Componente para exibir a Jornada de Atendimento dos SDRs
 * Mostra métricas de turnos (manhã e tarde) por SDR e data
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { fetchSdrAttendance, SdrDailyMetrics } from "@/lib/api";
import { Loader2, Clock, Sunrise, Sunset, Calendar, Users, Activity } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

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
 * Ordena timestamps e retorna o primeiro e último
 */
function getOrderedTimes(first: string | null, last: string | null): { first: string | null; last: string | null } {
  if (!first || !last) return { first, last };
  
  try {
    const firstDate = new Date(first);
    const lastDate = new Date(last);
    
    // Garantir que first seja o menor e last seja o maior
    if (firstDate.getTime() > lastDate.getTime()) {
      return { first: last, last: first };
    }
    
    return { first, last };
  } catch {
    return { first, last };
  }
}

/**
 * Calcula duração do turno em minutos
 */
function calculateDuration(first: string | null, last: string | null): number | null {
  if (!first || !last) return null;
  
  try {
    const { first: orderedFirst, last: orderedLast } = getOrderedTimes(first, last);
    const firstDate = new Date(orderedFirst!);
    const lastDate = new Date(orderedLast!);
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

export const SdrAttendanceJourney = ({ sdrId, date: initialDate }: SdrAttendanceJourneyProps) => {
  // Função auxiliar para obter a data atual em horário de São Paulo
  const getTodayInSaoPaulo = () => {
    const now = new Date();
    const saoPauloDate = new Date(now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
    return new Date(saoPauloDate.getFullYear(), saoPauloDate.getMonth(), saoPauloDate.getDate());
  };

  // Por padrão, mostrar apenas o dia atual
  // Se houver initialDate, usar ela; caso contrário, usar a data atual
  const getInitialDate = () => {
    if (initialDate) {
      return new Date(initialDate + 'T00:00:00');
    }
    return getTodayInSaoPaulo();
  };

  const [selectedDate, setSelectedDate] = useState<Date>(getInitialDate());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Função auxiliar para voltar ao dia atual
  const goToToday = () => {
    setSelectedDate(getTodayInSaoPaulo());
  };

  // Converter Date para string YYYY-MM-DD para a API
  // Sempre passar uma data (dia atual por padrão ou data selecionada)
  const dateString = format(selectedDate, 'yyyy-MM-dd');

  const { data: metrics, isLoading, error } = useQuery<SdrDailyMetrics[]>({
    queryKey: ['sdr-attendance', sdrId, dateString],
    queryFn: () => fetchSdrAttendance({ sdr_id: sdrId, date: dateString }),
    refetchInterval: 60000, // Atualiza a cada 60 segundos
  });

  if (isLoading) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="p-2 bg-primary/10 rounded-lg dark:bg-primary/20 hover:bg-primary/20 dark:hover:bg-primary/30"
                  >
                    <Calendar className="h-5 w-5 text-primary" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      setSelectedDate(date);
                      setIsCalendarOpen(false);
                    }}
                    disabled={(date) => {
                      return date > new Date();
                    }}
                    locale={ptBR}
                    className="rounded-md border"
                  />
                  <div className="p-3 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        // Voltar para o dia atual
                        goToToday();
                        setIsCalendarOpen(false);
                      }}
                    >
                      Ver dia atual
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
              <div>
                <CardTitle>Jornada de Atendimento dos SDRs</CardTitle>
                <CardDescription>
                  Métricas de turnos (Manhã: 06h-12h | Tarde: 13h-18h) - Horário de São Paulo
                </CardDescription>
              </div>
            </div>
            {(() => {
              const now = new Date();
              const saoPauloDate = new Date(now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
              const today = new Date(saoPauloDate.getFullYear(), saoPauloDate.getMonth(), saoPauloDate.getDate());
              const isToday = selectedDate.getTime() === today.getTime();
              
              if (!isToday) {
                return (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Filtrado: {format(selectedDate, "dd/MM/yyyy", { locale: ptBR })}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={goToToday}
                      className="text-xs"
                    >
                      Ver hoje
                    </Button>
                  </div>
                );
              }
              return null;
            })()}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-[300px] gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Carregando dados de jornada...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="p-2 bg-primary/10 rounded-lg dark:bg-primary/20 hover:bg-primary/20 dark:hover:bg-primary/30"
                  >
                    <Calendar className="h-5 w-5 text-primary" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      setSelectedDate(date);
                      setIsCalendarOpen(false);
                    }}
                    disabled={(date) => {
                      return date > new Date();
                    }}
                    locale={ptBR}
                    className="rounded-md border"
                  />
                  <div className="p-3 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        // Voltar para o dia atual
                        goToToday();
                        setIsCalendarOpen(false);
                      }}
                    >
                      Ver dia atual
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
              <div>
                <CardTitle>Jornada de Atendimento dos SDRs</CardTitle>
                <CardDescription>
                  Métricas de turnos (Manhã: 06h-12h | Tarde: 13h-18h) - Horário de São Paulo
                </CardDescription>
              </div>
            </div>
            {(() => {
              const now = new Date();
              const saoPauloDate = new Date(now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
              const today = new Date(saoPauloDate.getFullYear(), saoPauloDate.getMonth(), saoPauloDate.getDate());
              const isToday = selectedDate.getTime() === today.getTime();
              
              if (!isToday) {
                return (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Filtrado: {format(selectedDate, "dd/MM/yyyy", { locale: ptBR })}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={goToToday}
                      className="text-xs"
                    >
                      Ver hoje
                    </Button>
                  </div>
                );
              }
              return null;
            })()}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-[300px] gap-3 text-center">
            <div className="p-4 bg-destructive/10 rounded-full">
              <Activity className="h-8 w-8 text-destructive" />
            </div>
            <p className="text-destructive font-medium">Erro ao carregar dados de jornada</p>
            <p className="text-sm text-muted-foreground max-w-md">
              Verifique se o backend está rodando e se a tabela de eventos foi criada corretamente.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!metrics || metrics.length === 0) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="p-2 bg-primary/10 rounded-lg dark:bg-primary/20 hover:bg-primary/20 dark:hover:bg-primary/30"
                  >
                    <Calendar className="h-5 w-5 text-primary" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      setSelectedDate(date);
                      setIsCalendarOpen(false);
                    }}
                    disabled={(date) => {
                      return date > new Date();
                    }}
                    locale={ptBR}
                    className="rounded-md border"
                  />
                  <div className="p-3 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        goToToday();
                        setIsCalendarOpen(false);
                      }}
                    >
                      Ver dia atual
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
              <div>
                <CardTitle>Jornada de Atendimento dos SDRs</CardTitle>
                <CardDescription>
                  Métricas de turnos (Manhã: 06h-12h | Tarde: 13h-18h) - Horário de São Paulo
                </CardDescription>
              </div>
            </div>
            {(() => {
              const now = new Date();
              const saoPauloDate = new Date(now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
              const today = new Date(saoPauloDate.getFullYear(), saoPauloDate.getMonth(), saoPauloDate.getDate());
              const isToday = selectedDate && selectedDate.getTime() === today.getTime();
              
              if (!isToday) {
                return (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Filtrado: {format(selectedDate!, "dd/MM/yyyy", { locale: ptBR })}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={goToToday}
                      className="text-xs"
                    >
                      Ver hoje
                    </Button>
                  </div>
                );
              }
              return null;
            })()}
          </div>
        </CardHeader>
        <CardContent>
          {/* Mostrar cards de estatísticas mesmo sem dados, especialmente o calendário */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-muted/30 rounded-lg p-3 border border-border">
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">SDRs Ativos</span>
              </div>
              <p className="text-2xl font-bold text-foreground">0</p>
            </div>
            <div className="bg-muted/30 rounded-lg p-3 border border-border">
              <div className="flex items-center gap-2 mb-1">
                <Activity className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Total de Ações</span>
              </div>
              <p className="text-2xl font-bold text-foreground">0</p>
            </div>
            <div className="bg-muted/30 rounded-lg p-3 border border-border">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Dias Registrados</span>
              </div>
              <p className="text-2xl font-bold text-foreground">0</p>
            </div>
          </div>

          {/* Mensagem de estado vazio com ações */}
          <div className="flex flex-col items-center justify-center h-[300px] gap-4 text-center px-4">
            <div className="p-4 bg-muted/50 rounded-full">
              <Users className="h-12 w-12 text-muted-foreground/50" />
            </div>
            <div className="space-y-3">
              <p className="text-lg font-medium text-foreground">
                {(() => {
                  const now = new Date();
                  const saoPauloDate = new Date(now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
                  const today = new Date(saoPauloDate.getFullYear(), saoPauloDate.getMonth(), saoPauloDate.getDate());
                  const isToday = selectedDate && selectedDate.getTime() === today.getTime();
                  
                  if (isToday) {
                    return "Nenhum dado disponível para hoje";
                  }
                  return `Nenhum dado disponível para ${format(selectedDate!, "dd/MM/yyyy", { locale: ptBR })}`;
                })()}
              </p>
              <p className="text-sm text-muted-foreground max-w-md">
                {(() => {
                  const now = new Date();
                  const saoPauloDate = new Date(now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
                  const today = new Date(saoPauloDate.getFullYear(), saoPauloDate.getMonth(), saoPauloDate.getDate());
                  const isToday = selectedDate && selectedDate.getTime() === today.getTime();
                  
                  if (isToday) {
                    return "Os eventos são registrados quando leads são movidos do pipeline principal \"SDR\" para pipelines individuais \"NOME - SDR\". Selecione outra data no calendário para ver dados anteriores.";
                  }
                  return "Não há eventos registrados para esta data. Tente selecionar outra data no calendário ou voltar para o dia atual.";
                })()}
              </p>
              
              {/* Botão para voltar ao dia atual quando não estiver no dia atual */}
              {(() => {
                const now = new Date();
                const saoPauloDate = new Date(now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
                const today = new Date(saoPauloDate.getFullYear(), saoPauloDate.getMonth(), saoPauloDate.getDate());
                const isToday = selectedDate && selectedDate.getTime() === today.getTime();
                
                if (!isToday) {
                  return (
                    <div className="flex items-center justify-center mt-4">
                      <Button 
                        variant="default" 
                        size="sm"
                        onClick={goToToday}
                      >
                        Ver dia atual
                      </Button>
                    </div>
                  );
                }
                return null;
              })()}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calcular estatísticas gerais
  const totalSDRs = new Set(metrics.map(m => m.sdr_id)).size;
  const totalActions = metrics.reduce((sum, m) => sum + m.total_actions, 0);
  const totalDays = new Set(metrics.map(m => m.date)).size;

  return (
    <Card className="mb-8 border-border hover:shadow-lg transition-all duration-300 dark:bg-gradient-to-br dark:from-slate-800/90 dark:to-slate-900/90 dark:border-slate-700/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="p-2 bg-primary/10 rounded-lg dark:bg-primary/20 hover:bg-primary/20 dark:hover:bg-primary/30"
                >
                  <Calendar className="h-5 w-5 text-primary" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    setSelectedDate(date);
                    setIsCalendarOpen(false);
                  }}
                  disabled={(date) => {
                    // Desabilitar datas futuras
                    return date > new Date();
                  }}
                  locale={ptBR}
                  className="rounded-md border"
                />
                <div className="p-3 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      // Voltar para o dia atual
                      const now = new Date();
                      const saoPauloDate = new Date(now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
                      setSelectedDate(new Date(saoPauloDate.getFullYear(), saoPauloDate.getMonth(), saoPauloDate.getDate()));
                      setIsCalendarOpen(false);
                    }}
                  >
                    Ver dia atual
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
            <div>
              <CardTitle className="flex items-center gap-3">
                Jornada de Atendimento dos SDRs
              </CardTitle>
              <CardDescription>
                Métricas de turnos (Manhã: 06h-12h | Tarde: 13h-18h) - Horário de São Paulo
              </CardDescription>
            </div>
          </div>
          {(() => {
            const now = new Date();
            const saoPauloDate = new Date(now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
            const today = new Date(saoPauloDate.getFullYear(), saoPauloDate.getMonth(), saoPauloDate.getDate());
            const isToday = selectedDate && selectedDate.getTime() === today.getTime();
            
            if (!isToday) {
              return (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Filtrado: {format(selectedDate!, "dd/MM/yyyy", { locale: ptBR })}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                      onClick={goToToday}
                    className="text-xs"
                  >
                    Ver hoje
                  </Button>
                </div>
              );
            }
            return null;
          })()}
        </div>
      </CardHeader>
      <CardContent>
        {/* Estatísticas rápidas */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-muted/30 rounded-lg p-3 border border-border">
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">SDRs Ativos</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{totalSDRs}</p>
          </div>
          <div className="bg-muted/30 rounded-lg p-3 border border-border">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Total de Ações</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{totalActions}</p>
          </div>
            <div className="bg-muted/30 rounded-lg p-3 border border-border">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Dias Registrados</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{totalDays}</p>
            </div>
        </div>

        {/* Tabela */}
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="text-left p-4 font-semibold text-foreground">SDR</th>
                <th className="text-left p-4 font-semibold text-foreground">Data</th>
                <th className="text-center p-4 font-semibold text-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <Sunrise className="h-4 w-4 text-yellow-500" />
                    <span>Manhã</span>
                  </div>
                </th>
                <th className="text-center p-4 font-semibold text-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <Sunset className="h-4 w-4 text-orange-500" />
                    <span>Tarde</span>
                  </div>
                </th>
                <th className="text-center p-4 font-semibold text-foreground">Total</th>
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
                    className="border-b border-border hover:bg-muted/30 transition-colors last:border-b-0"
                  >
                    <td className="p-4">
                      <div className="font-semibold text-foreground">
                        {metric.sdr_name || metric.sdr_id}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-muted-foreground font-medium">
                          {formatDate(metric.date)}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      {metric.morning.action_count > 0 ? (
                        <div className="space-y-1.5">
                          {(() => {
                            const { first, last } = getOrderedTimes(
                              metric.morning.first_action,
                              metric.morning.last_action
                            );
                            return (
                              <div className="flex items-center justify-center gap-1.5 bg-yellow-500/10 rounded-md px-2 py-1 border border-yellow-500/20">
                                <Sunrise className="h-3 w-3 text-yellow-500" />
                                <Clock className="h-2.5 w-2.5 text-muted-foreground" />
                                <span className="text-xs font-medium text-foreground">
                                  {formatTime(first)} - {formatTime(last)}
                                </span>
                              </div>
                            );
                          })()}
                          <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                            <span className="bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 px-1.5 py-0.5 rounded-full font-medium">
                              {metric.morning.action_count} ações
                            </span>
                            <span>•</span>
                            <span className="font-medium">{formatDuration(morningDuration)}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center">
                          <span className="text-muted-foreground/50 text-sm">-</span>
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      {metric.afternoon.action_count > 0 ? (
                        <div className="space-y-1.5">
                          {(() => {
                            const { first, last } = getOrderedTimes(
                              metric.afternoon.first_action,
                              metric.afternoon.last_action
                            );
                            return (
                              <div className="flex items-center justify-center gap-1.5 bg-orange-500/10 rounded-md px-2 py-1 border border-orange-500/20">
                                <Sunset className="h-3 w-3 text-orange-500" />
                                <Clock className="h-2.5 w-2.5 text-muted-foreground" />
                                <span className="text-xs font-medium text-foreground">
                                  {formatTime(first)} - {formatTime(last)}
                                </span>
                              </div>
                            );
                          })()}
                          <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                            <span className="bg-orange-500/10 text-orange-600 dark:text-orange-400 px-1.5 py-0.5 rounded-full font-medium">
                              {metric.afternoon.action_count} ações
                            </span>
                            <span>•</span>
                            <span className="font-medium">{formatDuration(afternoonDuration)}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center">
                          <span className="text-muted-foreground/50 text-sm">-</span>
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center">
                        <span className="bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary font-bold px-3 py-1.5 rounded-full text-sm">
                          {metric.total_actions}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer com informações */}
        <div className="mt-6 pt-4 border-t border-border">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              <span>
                <span className="font-medium text-foreground">{metrics.length}</span> registro{metrics.length !== 1 ? 's' : ''} encontrado{metrics.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Clock className="h-3.5 w-3.5" />
              <span>Atualiza automaticamente a cada 60 segundos</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

