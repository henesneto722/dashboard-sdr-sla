import { useState, useMemo, useEffect } from "react";
import { calculateSDRPerformance, Lead } from "@/lib/mockData";
import { fetchLeads, fetchSDRs } from "@/lib/api";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { SDRRanking } from "@/components/dashboard/SDRRanking";
import { LeadsTable } from "@/components/dashboard/LeadsTable";
import { PerformanceCharts } from "@/components/dashboard/PerformanceCharts";
import { Timeline } from "@/components/dashboard/Timeline";
import { DashboardFilters } from "@/components/dashboard/DashboardFilters";
import { HourlyPerformance } from "@/components/dashboard/HourlyPerformance";
import { Activity, Loader2 } from "lucide-react";

// Interface para SDR com id e nome
interface SDRInfo {
  sdr_id: string;
  sdr_name: string;
}

const Index = () => {
  // Estado dos dados
  const [allLeads, setAllLeads] = useState<Lead[]>([]);
  const [sdrsInfo, setSDRsInfo] = useState<SDRInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [selectedPeriod, setSelectedPeriod] = useState("30days");
  const [selectedSDR, setSelectedSDR] = useState("all"); // Armazena o sdr_name para exibição

  // Carregar dados da API
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);
      
      try {
        // Buscar SDRs primeiro para ter o mapeamento
        const sdrsData = await fetchSDRs();
        setSDRsInfo(sdrsData || []);
        
        // Encontrar o sdr_id correspondente ao nome selecionado
        let sdrIdToFilter: string | undefined;
        if (selectedSDR !== 'all' && sdrsData) {
          const sdrInfo = sdrsData.find((s: SDRInfo) => s.sdr_name === selectedSDR);
          sdrIdToFilter = sdrInfo?.sdr_id;
        }
        
        // Buscar leads com o filtro correto
        const leadsData = await fetchLeads({ 
          period: selectedPeriod, 
          sdr_id: sdrIdToFilter 
        });
        
        setAllLeads(leadsData || []);
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError('Não foi possível conectar ao servidor. Verifique se o backend está rodando.');
        setAllLeads([]);
        setSDRsInfo([]);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [selectedPeriod, selectedSDR]);

  // Filtrar leads localmente (caso necessário)
  const filteredLeads = useMemo(() => {
    let filtered = [...allLeads];

    // Filtro de SDR (caso não tenha sido aplicado na API)
    if (selectedSDR !== "all") {
      filtered = filtered.filter((lead) => lead.sdr_name === selectedSDR);
    }

    return filtered;
  }, [allLeads, selectedSDR]);

  // Calcular performance dos SDRs
  const sdrPerformance = useMemo(() => calculateSDRPerformance(filteredLeads), [filteredLeads]);

  // Lista única de SDRs (nomes para exibição)
  const uniqueSDRs = useMemo((): string[] => {
    if (sdrsInfo.length > 0) {
      return sdrsInfo.map(s => s.sdr_name).filter(Boolean);
    }
    // Fallback: extrair dos leads
    return Array.from(new Set(allLeads.map((l) => l.sdr_name).filter(Boolean)));
  }, [allLeads, sdrsInfo]);

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
        {/* Mensagem de erro */}
        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-destructive font-medium">{error}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Execute o backend com: <code className="bg-muted px-2 py-1 rounded">cd backend &amp;&amp; npm run dev</code>
            </p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">Carregando dados...</span>
          </div>
        )}

        {/* Conteúdo */}
        {!loading && (
          <>
            <DashboardFilters
              selectedPeriod={selectedPeriod}
              onPeriodChange={setSelectedPeriod}
              selectedSDR={selectedSDR}
              onSDRChange={setSelectedSDR}
              sdrs={uniqueSDRs}
            />

            {allLeads.length === 0 && !error ? (
              <div className="text-center py-12">
                <Activity className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground">Nenhum dado disponível</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Configure o Supabase e aguarde os leads serem registrados via webhook do Pipedrive.
                </p>
              </div>
            ) : (
              <>
                <StatsCards leads={filteredLeads} sdrPerformance={sdrPerformance} isFilteredBySDR={selectedSDR !== "all"} />
                
                <SDRRanking sdrPerformance={sdrPerformance} />
                
                <PerformanceCharts leads={filteredLeads} />
                
                <HourlyPerformance leads={allLeads} />
                
                <Timeline leads={filteredLeads} />
                
                <LeadsTable leads={filteredLeads} />
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Index;
