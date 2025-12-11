import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { BarChart3 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchDailyAverage } from "@/lib/api";
import { Loader2 } from "lucide-react";

interface DailyAverageData {
  date: string;
  avg_sla: number;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
        <p className="font-medium text-sm text-foreground">
          Tempo Médio: <span className="text-primary font-bold">{payload[0].value} min</span>
        </p>
      </div>
    );
  }
  return null;
};

export const AverageTimeChart = () => {
  const { data, isLoading, error } = useQuery<DailyAverageData[]>({
    queryKey: ['daily-average'],
    queryFn: fetchDailyAverage,
    refetchInterval: 60000, // Atualiza a cada 60 segundos
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Tempo Médio por Dia (Últimos 7 dias)
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
            <BarChart3 className="h-5 w-5 text-primary" />
            Tempo Médio por Dia (Últimos 7 dias)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            Erro ao carregar dados
          </div>
        </CardContent>
      </Card>
    );
  }

  // Garantir que sempre temos dados mesmo que vazios
  const chartData = data && data.length > 0 ? data : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          Tempo Médio por Dia (Últimos 7 dias)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            Nenhum dado disponível nos últimos 7 dias
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis 
                dataKey="date" 
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis 
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                label={{ 
                  value: 'Minutos', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { fill: 'hsl(var(--muted-foreground))' }
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="avg_sla" 
                fill="#3b82f6" 
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

