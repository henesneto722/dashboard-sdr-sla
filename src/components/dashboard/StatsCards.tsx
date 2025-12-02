import { Card, CardContent } from "@/components/ui/card";
import { Clock, TrendingUp, AlertCircle, Users, Award } from "lucide-react";
import { Lead, SDRPerformance } from "@/lib/mockData";

interface StatsCardsProps {
  leads: Lead[];
  sdrPerformance: SDRPerformance[];
}

export const StatsCards = ({ leads, sdrPerformance }: StatsCardsProps) => {
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

  const stats = [
    {
      title: "Tempo Médio",
      value: `${averageTime}min`,
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
      value: `${worstTime}min`,
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
      title: "Melhor SDR",
      value: sdrPerformance[0]?.sdr_name.split(" ")[0] || "N/A",
      icon: Award,
      color: "text-success",
      bgColor: "bg-success/10",
      subtitle: sdrPerformance[0] ? `${sdrPerformance[0].average_time}min` : "",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
      {stats.map((stat, index) => (
        <Card key={index} className="border-border hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">{stat.title}</p>
                <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                {stat.subtitle && (
                  <p className="text-xs text-muted-foreground mt-1">{stat.subtitle}</p>
                )}
              </div>
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
