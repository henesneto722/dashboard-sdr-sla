import { useState, useMemo } from "react";
import { generateMockLeads, calculateSDRPerformance, Lead } from "@/lib/mockData";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { SDRRanking } from "@/components/dashboard/SDRRanking";
import { LeadsTable } from "@/components/dashboard/LeadsTable";
import { PerformanceCharts } from "@/components/dashboard/PerformanceCharts";
import { Timeline } from "@/components/dashboard/Timeline";
import { DashboardFilters } from "@/components/dashboard/DashboardFilters";
import { HourlyPerformance } from "@/components/dashboard/HourlyPerformance";
import { Activity } from "lucide-react";

const Index = () => {
  const allLeads = useMemo(() => generateMockLeads(150), []);
  
  const [selectedPeriod, setSelectedPeriod] = useState("all");
  const [selectedSDR, setSelectedSDR] = useState("all");

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

    return filtered;
  }, [allLeads, selectedPeriod, selectedSDR]);

  const sdrPerformance = useMemo(() => calculateSDRPerformance(filteredLeads), [filteredLeads]);

  const uniqueSDRs = useMemo(() => Array.from(new Set(allLeads.map((l) => l.sdr_name))), [allLeads]);

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
          sdrs={uniqueSDRs}
        />

        <StatsCards leads={filteredLeads} sdrPerformance={sdrPerformance} />
        
        <SDRRanking sdrPerformance={sdrPerformance} />
        
        <PerformanceCharts leads={filteredLeads} />
        
        <HourlyPerformance leads={allLeads} />
        
        <Timeline leads={filteredLeads} />
        
        <LeadsTable leads={filteredLeads} />
      </main>
    </div>
  );
};

export default Index;
