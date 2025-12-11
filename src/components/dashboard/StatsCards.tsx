import { Card, CardContent } from "@/components/ui/card";
import { Clock, TrendingUp, AlertCircle, Users, Award, AlertTriangle } from "lucide-react";
import { Lead, SDRPerformance, formatTime } from "@/lib/mockData";
import { useQuery } from "@tanstack/react-query";
import { fetchTodayAttendedLeads } from "@/lib/api";

interface StatsCardsProps {
  leads: Lead[];
  sdrPerformance: SDRPerformance[];
  isFilteredBySDR?: boolean; // true quando um SDR específico está selecionado
  importantPendingCount?: number; // número de leads importantes pendentes
  onImportantClick?: () => void; // callback ao clicar no card de leads importantes
}

export const StatsCards = ({ 
  leads, 
  sdrPerformance, 
  isFilteredBySDR = false,
  importantPendingCount = 0,
  onImportantClick
}: StatsCardsProps) => {
  // Buscar leads atendidos hoje diretamente do backend (independente do filtro de período)
  const { data: todayAttendedLeads = [] } = useQuery({
    queryKey: ['today-attended-leads'],
    queryFn: fetchTodayAttendedLeads,
    refetchInterval: 60000, // Atualiza a cada 60 segundos
  });

  const attendedLeads = leads.filter(l => l.sla_minutes !== null);
  const pendingLeads = leads.filter(l => l.sla_minutes === null);
  
  const averageTime = attendedLeads.length > 0
    ? Math.round(attendedLeads.reduce((sum, l) => sum + (l.sla_minutes || 0), 0) / attendedLeads.length)
    : 0;
  
  const worstTime = attendedLeads.length > 0
    ? Math.max(...attendedLeads.map(l => l.sla_minutes || 0))
    : 0;
  
  // Contar leads atendidos hoje (busca direta do backend, independente do filtro de período)
  const todayLeads = todayAttendedLeads.length;

  const getColorClass = (minutes: number) => {
    if (minutes <= 30) return "text-success";
    if (minutes <= 60) return "text-warning";
    return "text-danger";
  };

  // Cards base (sempre visíveis)
  const baseStats = [
    {
      title: "Tempo Médio",
      value: formatTime(averageTime),
      icon: Clock,
      color: getColorClass(averageTime),
      bgColor: averageTime <= 30 ? "bg-emerald-500/15" : averageTime <= 60 ? "bg-amber-500/15" : "bg-red-500/15",
      iconColor: averageTime <= 30 ? "text-emerald-500" : averageTime <= 60 ? "text-amber-500" : "text-red-500",
    },
    {
      title: "Atendidos Hoje",
      value: todayLeads.toString(),
      icon: TrendingUp,
      color: "text-blue-500",
      bgColor: "bg-blue-500/15",
      iconColor: "text-blue-500",
    },
    {
      title: "Pior Tempo",
      value: formatTime(worstTime),
      icon: AlertCircle,
      color: "text-red-500",
      bgColor: "bg-red-500/15",
      iconColor: "text-red-500",
    },
    {
      title: "Leads Pendentes",
      value: pendingLeads.length.toString(),
      icon: Users,
      color: "text-slate-400",
      bgColor: "bg-slate-500/15",
      iconColor: "text-slate-400",
    },
    {
      title: "Leads Importantes",
      value: importantPendingCount.toString(),
      icon: AlertTriangle,
      color: importantPendingCount > 0 ? "text-orange-500" : "text-slate-400",
      bgColor: importantPendingCount > 0 ? "bg-orange-500/15" : "bg-slate-500/15",
      iconColor: importantPendingCount > 0 ? "text-orange-500" : "text-slate-400",
      subtitle: importantPendingCount > 0 ? "Aguardando atendimento" : "Nenhum pendente",
      clickable: importantPendingCount > 0,
      onClick: onImportantClick,
    },
  ];

  // Card "Melhor SDR" só aparece quando NÃO está filtrado por SDR individual
  const stats = isFilteredBySDR ? baseStats : [
    ...baseStats,
    {
      title: "Melhor SDR",
      value: sdrPerformance[0]?.sdr_name.split(" ")[0] || "N/A",
      icon: Award,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/15",
      iconColor: "text-emerald-500",
      subtitle: sdrPerformance[0] ? formatTime(sdrPerformance[0].average_time) : "",
    },
  ];

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 ${isFilteredBySDR ? 'lg:grid-cols-5' : 'lg:grid-cols-6'}`}>
      {stats.map((stat, index) => (
        <Card 
          key={index} 
          className={`
            relative overflow-hidden
            border-border hover:shadow-lg transition-all duration-300
            dark:bg-gradient-to-br dark:from-slate-800/90 dark:to-slate-900/90
            dark:border-slate-700/50 dark:hover:border-slate-600/50
            ${stat.clickable ? 'cursor-pointer hover:border-orange-500/50 dark:hover:border-orange-400/50' : ''}
          `}
          onClick={stat.clickable ? stat.onClick : undefined}
        >
          <CardContent className="p-5">
            {/* Layout principal */}
            <div className="flex items-center justify-between gap-4">
              {/* Texto */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-muted-foreground mb-1 truncate">
                  {stat.title}
                </p>
                <p className={`text-2xl font-bold ${stat.color} truncate`}>
                  {stat.value}
                </p>
                {stat.subtitle && (
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    {stat.subtitle}
                  </p>
                )}
              </div>
              
              {/* Ícone */}
              <div className={`
                flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-xl
                ${stat.bgColor}
              `}>
                <stat.icon className={`h-6 w-6 ${stat.iconColor || stat.color}`} strokeWidth={2} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
