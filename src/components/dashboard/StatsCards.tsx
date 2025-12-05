import { Card, CardContent } from "@/components/ui/card";
import { Clock, TrendingUp, AlertCircle, Users, Award, AlertTriangle } from "lucide-react";
import { Lead, SDRPerformance, formatTime } from "@/lib/mockData";

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
  const attendedLeads = leads.filter(l => l.sla_minutes !== null);
  const pendingLeads = leads.filter(l => l.sla_minutes === null);
  
  const averageTime = attendedLeads.length > 0
    ? Math.round(attendedLeads.reduce((sum, l) => sum + (l.sla_minutes || 0), 0) / attendedLeads.length)
    : 0;
  
  const worstTime = attendedLeads.length > 0
    ? Math.max(...attendedLeads.map(l => l.sla_minutes || 0))
    : 0;
  
  const todayLeads = attendedLeads.filter(l => {
    const today = new Date();
    const leadDate = new Date(l.attended_at || "");
    return leadDate.toDateString() === today.toDateString();
  }).length;

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
      bgColor: averageTime <= 30 ? "bg-success/10" : averageTime <= 60 ? "bg-warning/10" : "bg-danger/10",
    },
    {
      title: "Atendidos Hoje",
      value: todayLeads.toString(),
      icon: TrendingUp,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Pior Tempo",
      value: formatTime(worstTime),
      icon: AlertCircle,
      color: "text-danger",
      bgColor: "bg-danger/10",
    },
    {
      title: "Leads Pendentes",
      value: pendingLeads.length.toString(),
      icon: Users,
      color: pendingLeads.length > 10 ? "text-danger" : "text-muted-foreground",
      bgColor: pendingLeads.length > 10 ? "bg-danger/10" : "bg-muted/30",
    },
    {
      title: "Leads Importantes",
      value: importantPendingCount.toString(),
      icon: AlertTriangle,
      color: importantPendingCount > 0 ? "text-orange-500" : "text-muted-foreground",
      bgColor: importantPendingCount > 0 ? "bg-orange-500/10" : "bg-muted/30",
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
      color: "text-success",
      bgColor: "bg-success/10",
      subtitle: sdrPerformance[0] ? formatTime(sdrPerformance[0].average_time) : "",
    },
  ];

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 ${isFilteredBySDR ? 'lg:grid-cols-5' : 'lg:grid-cols-6'}`}>
      {stats.map((stat, index) => (
        <Card 
          key={index} 
          className={`
            border-border hover:shadow-lg transition-all duration-300
            dark:bg-card/80 dark:backdrop-blur-sm dark:hover-glow
            ${stat.clickable ? 'cursor-pointer hover:border-orange-500/50 dark:hover:border-orange-400/50' : ''}
          `}
          onClick={stat.clickable ? stat.onClick : undefined}
        >
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">{stat.title}</p>
                <p className={`text-3xl font-bold ${stat.color} dark:drop-shadow-[0_0_8px_currentColor]`}>{stat.value}</p>
                {stat.subtitle && (
                  <p className="text-xs text-muted-foreground mt-1">{stat.subtitle}</p>
                )}
              </div>
              <div className={`p-3 rounded-xl ${stat.bgColor} dark:${stat.bgColor.replace('/10', '/20')} transition-colors`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
