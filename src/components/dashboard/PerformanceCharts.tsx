import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lead } from "@/lib/mockData";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { BarChart3, LineChart as LineChartIcon } from "lucide-react";

interface PerformanceChartsProps {
  leads: Lead[];
}

export const PerformanceCharts = ({ leads }: PerformanceChartsProps) => {
  // Dados para gráfico de barras (tempo médio por dia)
  const dailyData = leads
    .filter(l => l.sla_minutes !== null)
    .reduce((acc, lead) => {
      const date = new Date(lead.entered_at).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
      });
      if (!acc[date]) {
        acc[date] = { date, total: 0, count: 0 };
      }
      acc[date].total += lead.sla_minutes || 0;
      acc[date].count += 1;
      return acc;
    }, {} as Record<string, { date: string; total: number; count: number }>);

  const barChartData = Object.values(dailyData)
    .map(({ date, total, count }) => ({
      date,
      average: Math.round(total / count),
    }))
    .slice(-14)
    .sort((a, b) => {
      const [dayA, monthA] = a.date.split("/").map(Number);
      const [dayB, monthB] = b.date.split("/").map(Number);
      return monthA === monthB ? dayA - dayB : monthA - monthB;
    });

  // Dados para gráfico de linha (evolução semanal)
  const weeklyData = leads
    .filter(l => l.sla_minutes !== null)
    .reduce((acc, lead) => {
      const date = new Date(lead.entered_at);
      const weekNumber = Math.ceil(date.getDate() / 7);
      const key = `Semana ${weekNumber}`;
      if (!acc[key]) {
        acc[key] = { week: key, total: 0, count: 0 };
      }
      acc[key].total += lead.sla_minutes || 0;
      acc[key].count += 1;
      return acc;
    }, {} as Record<string, { week: string; total: number; count: number }>);

  const lineChartData = Object.values(weeklyData).map(({ week, total, count }) => ({
    week,
    average: Math.round(total / count),
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-sm">{label}</p>
          <p className="text-primary font-bold">
            {payload[0].value} minutos
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Tempo Médio por Dia
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barChartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="date" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="average" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LineChartIcon className="h-5 w-5 text-primary" />
            Evolução Semanal do SLA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={lineChartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="week" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="average"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                dot={{ fill: "hsl(var(--primary))", r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
