import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lead, getPerformanceColor } from "@/lib/mockData";
import { Clock } from "lucide-react";

interface TimelineProps {
  leads: Lead[];
}

export const Timeline = ({ leads }: TimelineProps) => {
  const attendedLeads = leads
    .filter(l => l.sla_minutes !== null)
    .slice(0, 15)
    .sort((a, b) => (b.sla_minutes || 0) - (a.sla_minutes || 0));

  const maxTime = Math.max(...attendedLeads.map(l => l.sla_minutes || 0));

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Timeline de Atendimentos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {attendedLeads.map((lead) => {
            const widthPercentage = ((lead.sla_minutes || 0) / maxTime) * 100;
            const colorClass = getPerformanceColor(lead.sla_minutes || 0);
            
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
            
            return (
              <div key={lead.lead_id} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{lead.lead_name}</span>
                  <div className="flex items-center gap-4 text-muted-foreground">
                    <span>{lead.sdr_name}</span>
                    <span className={`font-semibold ${getTextColor()}`}>
                      {lead.sla_minutes}min
                    </span>
                  </div>
                </div>
                <div className="relative h-6 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`absolute inset-y-0 left-0 ${getBarColor()} rounded-full transition-all duration-500`}
                    style={{ width: `${widthPercentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
