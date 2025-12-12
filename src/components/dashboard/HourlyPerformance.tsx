import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lead, formatTime, getThresholds } from "@/lib/mockData";
import { Clock } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface HourlyPerformanceProps {
  leads: Lead[];
}

interface HourlyData {
  hour: number;
  label: string;
  avgSLA: number;
  count: number;
}

const getHourlyPerformanceColor = (avgMinutes: number): string => {
  const thresholds = getThresholds();
  if (avgMinutes <= thresholds.good) return "bg-success";
  if (avgMinutes <= thresholds.moderate) return "bg-warning";
  return "bg-danger";
};

const getHourlyPerformanceLabel = (avgMinutes: number): string => {
  const thresholds = getThresholds();
  if (avgMinutes <= thresholds.good) return "Bom";
  if (avgMinutes <= thresholds.moderate) return "Moderado";
  return "Crítico";
};

export const HourlyPerformance = ({ leads }: HourlyPerformanceProps) => {
  // Pegar thresholds dinâmicos
  const thresholds = getThresholds();
  
  const hourlyData = useMemo(() => {
    // Início do dia atual (00:00:00) - Dia Civil
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    // Filter leads atendidos hoje (Dia Civil)
    // Acumula desde 00:00:00 até o momento presente
    const recentLeads = leads.filter((lead) => {
      if (!lead.attended_at || lead.sla_minutes === null) return false;
      const attendedDate = new Date(lead.attended_at);
      return attendedDate >= todayStart;
    });

    // Group by hour
    const hourMap = new Map<number, { total: number; count: number }>();

    // Initialize all hours (6h to 22h for business hours)
    for (let h = 6; h <= 22; h++) {
      hourMap.set(h, { total: 0, count: 0 });
    }

    recentLeads.forEach((lead) => {
      const hour = new Date(lead.attended_at!).getHours();
      if (hour >= 6 && hour <= 22) {
        const current = hourMap.get(hour) || { total: 0, count: 0 };
        current.total += lead.sla_minutes!;
        current.count += 1;
        hourMap.set(hour, current);
      }
    });

    const result: HourlyData[] = [];
    for (let h = 6; h <= 22; h++) {
      const data = hourMap.get(h)!;
      result.push({
        hour: h,
        label: `${h.toString().padStart(2, "0")}h–${(h + 1).toString().padStart(2, "0")}h`,
        avgSLA: data.count > 0 ? Math.round(data.total / data.count) : 0,
        count: data.count,
      });
    }

    return result;
  }, [leads]);

  const maxSLA = Math.max(...hourlyData.map((d) => d.avgSLA), 1);

  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          <CardTitle>Análise de Desempenho por Horário</CardTitle>
        </div>
        <CardDescription>
          SLA médio por faixa de horário no dia atual (acumulado desde 00:00:00)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Legend - valores dinâmicos baseados nos dados */}
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-success" />
              <span className="text-muted-foreground">Bom (≤{thresholds.good} min)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-warning" />
              <span className="text-muted-foreground">Moderado ({thresholds.good + 1}-{thresholds.moderate} min)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-danger" />
              <span className="text-muted-foreground">Crítico (&gt;{thresholds.moderate} min)</span>
            </div>
          </div>

          {/* Hourly bars */}
          <div className="space-y-2">
            {hourlyData.map((data) => (
              <Tooltip key={data.hour}>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-3 cursor-pointer group">
                    <span className="text-sm font-medium text-muted-foreground w-20 shrink-0">
                      {data.label}
                    </span>
                    <div className="flex-1 h-7 bg-muted rounded-md overflow-hidden relative">
                      {data.count > 0 ? (
                        <div
                          className={`h-full ${getHourlyPerformanceColor(data.avgSLA)} transition-all group-hover:opacity-80 flex items-center`}
                          style={{
                            width: `${Math.max((data.avgSLA / maxSLA) * 100, 5)}%`,
                          }}
                        >
                          <span className="text-xs font-semibold text-white ml-2 whitespace-nowrap">
                            {formatTime(data.avgSLA)}
                          </span>
                        </div>
                      ) : (
                        <div className="h-full flex items-center justify-center">
                          <span className="text-xs text-muted-foreground">
                            Sem dados
                          </span>
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground w-16 text-right shrink-0">
                      {data.count} leads
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-sm">
                    <p className="font-semibold">{data.label}</p>
                    <p>SLA Médio: {data.avgSLA > 0 ? formatTime(data.avgSLA) : "N/A"}</p>
                    <p>Leads atendidos: {data.count}</p>
                    <p>Status: {data.count > 0 ? getHourlyPerformanceLabel(data.avgSLA) : "Sem dados"}</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
