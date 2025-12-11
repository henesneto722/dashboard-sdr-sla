import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lead } from "@/lib/mockData";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { LineChart as LineChartIcon } from "lucide-react";

interface PerformanceChartsProps {
  leads: Lead[];
}

export const PerformanceCharts = ({ leads }: PerformanceChartsProps) => {
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
    <div className="mb-8">
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
