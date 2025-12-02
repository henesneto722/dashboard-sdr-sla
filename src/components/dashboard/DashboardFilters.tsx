import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter, Calendar } from "lucide-react";

interface DashboardFiltersProps {
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
  selectedSDR: string;
  onSDRChange: (sdr: string) => void;
  selectedSource: string;
  onSourceChange: (source: string) => void;
  selectedPipeline: string;
  onPipelineChange: (pipeline: string) => void;
  sdrs: string[];
  sources: string[];
  pipelines: string[];
}

export const DashboardFilters = ({
  selectedPeriod,
  onPeriodChange,
  selectedSDR,
  onSDRChange,
  selectedSource,
  onSourceChange,
  selectedPipeline,
  onPipelineChange,
  sdrs,
  sources,
  pipelines,
}: DashboardFiltersProps) => {
  return (
    <Card className="mb-8 border-primary/20">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-lg">Filtros</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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

          <div>
            <label className="text-sm font-medium mb-2 block">Origem</label>
            <Select value={selectedSource} onValueChange={onSourceChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {sources.map((source) => (
                  <SelectItem key={source} value={source}>
                    {source}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Pipeline</label>
            <Select value={selectedPipeline} onValueChange={onPipelineChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {pipelines.map((pipeline) => (
                  <SelectItem key={pipeline} value={pipeline}>
                    {pipeline}
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
                onSourceChange("all");
                onPipelineChange("all");
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
