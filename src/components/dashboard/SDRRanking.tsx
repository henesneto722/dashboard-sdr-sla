import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SDRPerformance, getPerformanceColor, getPerformanceLabel, formatTime, Lead, calculateSDRPerformance } from "@/lib/mockData";
import { Trophy } from "lucide-react";
import { fetchAllMonthLeads } from "@/lib/api";
import { startOfDay, startOfWeek, endOfWeek, isSameDay, isWithinInterval } from "date-fns";
import { ptBR } from "date-fns/locale";

type TimeFilter = 'daily' | 'weekly' | 'monthly';

interface SDRRankingProps {
  onMonthlyRankingChange?: (ranking: SDRPerformance[]) => void; // Callback para passar ranking mensal
}

export const SDRRanking = ({ onMonthlyRankingChange }: SDRRankingProps) => {
  const [allMonthLeads, setAllMonthLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('monthly');

  // Buscar todos os leads do mês ao montar o componente
  useEffect(() => {
    async function loadMonthLeads() {
      try {
        setLoading(true);
        setError(null);
        const leads = await fetchAllMonthLeads();
        console.log('📊 [SDRRanking] Leads carregados do mês:', leads.length);
        console.log('📊 [SDRRanking] Detalhes dos leads:', {
          total: leads.length,
          com_sla: leads.filter(l => l.sla_minutes !== null).length,
          sem_sla: leads.filter(l => l.sla_minutes === null).length,
          por_sdr: leads.reduce((acc, lead) => {
            const sdr = lead.sdr_name || 'Sem SDR';
            acc[sdr] = (acc[sdr] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)
        });
        setAllMonthLeads(leads);
      } catch (err) {
        console.error('Erro ao carregar leads do mês:', err);
        setError('Erro ao carregar dados do ranking');
      } finally {
        setLoading(false);
      }
    }

    loadMonthLeads();
  }, []);

  // Filtrar leads baseado no período selecionado
  // IMPORTANTE: Usa a mesma métrica do card "Atendidos Hoje" - filtra por attended_at
  // Isso garante que os números batam entre o card e o ranking
  const filteredLeads = useMemo(() => {
    if (!allMonthLeads.length) return [];

    const now = new Date();
    
    switch (timeFilter) {
      case 'daily': {
        const todayStart = startOfDay(now);
        // Filtrar por attended_at (quando foi atendido) para o dia de hoje
        // MESMA LÓGICA do card "Atendidos Hoje"
        return allMonthLeads.filter(lead => {
          if (!lead.attended_at || lead.sla_minutes === null) return false;
          const attendedDate = new Date(lead.attended_at);
          return isSameDay(attendedDate, todayStart);
        });
      }
      
      case 'weekly': {
        const weekStart = startOfWeek(now, { locale: ptBR });
        const weekEnd = endOfWeek(now, { locale: ptBR });
        // Filtrar por attended_at (quando foi atendido) para a semana atual
        return allMonthLeads.filter(lead => {
          if (!lead.attended_at || lead.sla_minutes === null) return false;
          const attendedDate = new Date(lead.attended_at);
          return isWithinInterval(attendedDate, { start: weekStart, end: weekEnd });
        });
      }
      
      case 'monthly':
      default: {
        // Para mensal, filtra por attended_at do mês atual (não entered_at)
        // Isso garante consistência com a métrica de "atendidos"
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        monthStart.setHours(0, 0, 0, 0);
        
        return allMonthLeads.filter(lead => {
          if (!lead.attended_at || lead.sla_minutes === null) return false;
          const attendedDate = new Date(lead.attended_at);
          return attendedDate >= monthStart && attendedDate <= now;
        });
      }
    }
  }, [allMonthLeads, timeFilter]);

  // Recalcular performance baseado nos leads filtrados
  const sdrPerformance = useMemo(() => {
    if (!filteredLeads.length) return [];
    const performance = calculateSDRPerformance(filteredLeads);
    console.log(`📊 [SDRRanking] Período: ${timeFilter}, Leads filtrados: ${filteredLeads.length}, SDRs: ${performance.length}`);
    console.log('📊 [SDRRanking] Performance calculada:', performance);
    return performance;
  }, [filteredLeads, timeFilter]);

  // Calcular ranking mensal separadamente para passar ao card "Melhor SDR"
  const monthlyRanking = useMemo(() => {
    if (!allMonthLeads.length) return [];
    
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    monthStart.setHours(0, 0, 0, 0);
    
    const monthlyLeads = allMonthLeads.filter(lead => {
      if (!lead.attended_at || lead.sla_minutes === null) return false;
      const attendedDate = new Date(lead.attended_at);
      return attendedDate >= monthStart && attendedDate <= now;
    });
    
    return calculateSDRPerformance(monthlyLeads);
  }, [allMonthLeads]);

  // Notificar mudanças no ranking mensal
  useEffect(() => {
    if (onMonthlyRankingChange && monthlyRanking.length > 0) {
      onMonthlyRankingChange(monthlyRanking);
    }
  }, [monthlyRanking, onMonthlyRankingChange]);

  const maxTime = sdrPerformance.length > 0 
    ? Math.max(...sdrPerformance.map(s => s.average_time))
    : 0;

  if (loading) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Ranking de Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Carregando dados...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Ranking de Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <p className="text-destructive">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          Ranking de Performance
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-2">
          💡 Conta <strong>leads únicos atendidos</strong>. Diferente da Jornada que conta <strong>ações/movimentações</strong>.
        </p>
      </CardHeader>
      <CardContent>
        <Tabs value={timeFilter} onValueChange={(value) => setTimeFilter(value as TimeFilter)} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="daily">Hoje</TabsTrigger>
            <TabsTrigger value="weekly">Esta Semana</TabsTrigger>
            <TabsTrigger value="monthly">Este Mês</TabsTrigger>
          </TabsList>
          
          <TabsContent value={timeFilter} className="mt-0">
            {sdrPerformance.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-muted-foreground">
                  Nenhum dado disponível para o período selecionado
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {sdrPerformance.map((sdr, index) => {
                  const widthPercentage = maxTime > 0 ? (sdr.average_time / maxTime) * 100 : 0;
                  const colorClass = getPerformanceColor(sdr.average_time);
                  const label = getPerformanceLabel(sdr.average_time);
                  
                  const getBarColor = () => {
                    if (colorClass === "success") return "bg-success";
                    if (colorClass === "warning") return "bg-warning";
                    return "bg-danger";
                  };

                  const getTextColor = () => {
                    if (colorClass === "success") return "text-success";
                    if (colorClass === "warning") return "text-warning";
                    return "text-danger";
                  };

                  const getTextOnBarColor = () => {
                    if (colorClass === "success") return "text-success-foreground";
                    if (colorClass === "warning") return "text-warning-foreground";
                    return "text-danger-foreground";
                  };
                  
                  return (
                    <div key={sdr.sdr_id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-sm font-semibold">
                            {index + 1}
                          </span>
                          <div>
                            <p className="font-medium">{sdr.sdr_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {sdr.leads_attended} leads atendidos
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-lg font-bold ${getTextColor()}`}>
                            {formatTime(sdr.average_time)}
                          </p>
                          <p className={`text-xs font-medium ${getTextColor()}`}>
                            {label}
                          </p>
                        </div>
                      </div>
                      <div className="relative h-8 bg-muted rounded-lg overflow-hidden">
                        <div
                          className={`absolute inset-y-0 left-0 ${getBarColor()} transition-all duration-500 flex items-center justify-end pr-3`}
                          style={{ width: `${widthPercentage}%` }}
                        >
                          <span className={`text-xs font-semibold ${getTextOnBarColor()}`}>
                            {formatTime(sdr.average_time)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
