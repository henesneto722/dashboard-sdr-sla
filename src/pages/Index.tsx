import { useState, useMemo } from "react";
import { generateMockLeads, calculateSDRPerformance, Lead } from "@/lib/mockData";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { SDRRanking } from "@/components/dashboard/SDRRanking";
import { LeadsTable } from "@/components/dashboard/LeadsTable";
import { PerformanceCharts } from "@/components/dashboard/PerformanceCharts";
import { Timeline } from "@/components/dashboard/Timeline";
import { DashboardFilters } from "@/components/dashboard/DashboardFilters";
import { Activity } from "lucide-react";

const Index = () => {
  const allLeads = useMemo(() => generateMockLeads(150), []);
  
  const [selectedPeriod, setSelectedPeriod] = useState("all");
  const [selectedSDR, setSelectedSDR] = useState("all");
  const [selectedSource, setSelectedSource] = useState("all");
  const [selectedPipeline, setSelectedPipeline] = useState("all");

  const filteredLeads = useMemo(() => {
    let filtered = [...allLeads];

    // Filtro de período
    if (selectedPeriod !== "all") {
      const now = new Date();
      const daysMap: Record<string, number> = {
        today: 0,
        "7days": 7,
        "15days": 15,
        "30days": 30,
      };
      const days = daysMap[selectedPeriod];
      filtered = filtered.filter((lead) => {
        const leadDate = new Date(lead.entered_at);
        const diffTime = Math.abs(now.getTime() - leadDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return days === 0 ? leadDate.toDateString() === now.toDateString() : diffDays <= days;
      });
    }

    // Filtro de SDR
    if (selectedSDR !== "all") {
      filtered = filtered.filter((lead) => lead.sdr_name === selectedSDR);
    }

    // Filtro de origem
    if (selectedSource !== "all") {
      filtered = filtered.filter((lead) => lead.source === selectedSource);
    }

    // Filtro de pipeline
    if (selectedPipeline !== "all") {
      filtered = filtered.filter((lead) => lead.pipeline === selectedPipeline);
    }

    return filtered;
  }, [allLeads, selectedPeriod, selectedSDR, selectedSource, selectedPipeline]);

  const sdrPerformance = useMemo(() => calculateSDRPerformance(filteredLeads), [filteredLeads]);

  const uniqueSDRs = useMemo(() => Array.from(new Set(allLeads.map((l) => l.sdr_name))), [allLeads]);
  const uniqueSources = useMemo(() => Array.from(new Set(allLeads.map((l) => l.source))), [allLeads]);
  const uniquePipelines = useMemo(() => Array.from(new Set(allLeads.map((l) => l.pipeline))), [allLeads]);

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Activity className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Dashboard SDR</h1>
              <p className="text-muted-foreground">Monitoramento de Tempo de Atendimento</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <DashboardFilters
          selectedPeriod={selectedPeriod}
          onPeriodChange={setSelectedPeriod}
          selectedSDR={selectedSDR}
          onSDRChange={setSelectedSDR}
          selectedSource={selectedSource}
          onSourceChange={setSelectedSource}
          selectedPipeline={selectedPipeline}
          onPipelineChange={setSelectedPipeline}
          sdrs={uniqueSDRs}
          sources={uniqueSources}
          pipelines={uniquePipelines}
        />

        <StatsCards leads={filteredLeads} sdrPerformance={sdrPerformance} />
        
        <SDRRanking sdrPerformance={sdrPerformance} />
        
        <PerformanceCharts leads={filteredLeads} />
        
        <Timeline leads={filteredLeads} />
        
        <LeadsTable leads={filteredLeads} />
      </main>
    </div>
  );
};

export default Index;
