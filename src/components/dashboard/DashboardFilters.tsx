import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter } from "lucide-react";

interface DashboardFiltersProps {
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
  selectedSDR: string;
  onSDRChange: (sdr: string) => void;
  sdrs: string[];
}

export const DashboardFilters = ({
  selectedPeriod,
  onPeriodChange,
  selectedSDR,
  onSDRChange,
  sdrs,
}: DashboardFiltersProps) => {
  return (
    <Card className="mb-8 border-primary/20">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-lg">Filtros</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Período</label>
            <Select value={selectedPeriod} onValueChange={onPeriodChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="today">Hoje</SelectItem>
                <SelectItem value="7days">Últimos 7 dias</SelectItem>
                <SelectItem value="15days">Últimos 15 dias</SelectItem>
                <SelectItem value="30days">Últimos 30 dias</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">SDR</label>
            <Select value={selectedSDR} onValueChange={onSDRChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {sdrs.map((sdr) => (
                  <SelectItem key={sdr} value={sdr}>
                    {sdr}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                onPeriodChange("all");
                onSDRChange("all");
              }}
            >
              Limpar Filtros
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
