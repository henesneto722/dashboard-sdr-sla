import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SDRPerformance, getPerformanceColor, getPerformanceLabel, formatTime } from "@/lib/mockData";
import { Trophy } from "lucide-react";

interface SDRRankingProps {
  sdrPerformance: SDRPerformance[];
}

export const SDRRanking = ({ sdrPerformance }: SDRRankingProps) => {
  const maxTime = Math.max(...sdrPerformance.map(s => s.average_time));

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          Ranking de Performance - SDRs
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sdrPerformance.map((sdr, index) => {
            const widthPercentage = (sdr.average_time / maxTime) * 100;
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
      </CardContent>
    </Card>
  );
};
