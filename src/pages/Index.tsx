import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { calculateSDRPerformance, Lead } from "@/lib/mockData";
import { fetchLeads, fetchSDRs, fetchImportantPendingLeads } from "@/lib/api";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { SDRRanking } from "@/components/dashboard/SDRRanking";
import { LeadsTable } from "@/components/dashboard/LeadsTable";
import { PerformanceCharts } from "@/components/dashboard/PerformanceCharts";
import { Timeline } from "@/components/dashboard/Timeline";
import { DashboardFilters } from "@/components/dashboard/DashboardFilters";
import { HourlyPerformance } from "@/components/dashboard/HourlyPerformance";
import { Activity, Loader2, RefreshCw, Wifi, WifiOff } from "lucide-react";
import { useRealtimeLeads } from "@/hooks/useRealtimeLeads";
import { Toaster } from "sonner";

// Interface para SDR com id e nome
interface SDRInfo {
  sdr_id: string;
  sdr_name: string;
}

const Index = () => {
  // Estado dos dados
  const [allLeads, setAllLeads] = useState<Lead[]>([]);
  const [sdrsInfo, setSDRsInfo] = useState<SDRInfo[]>([]);
  const [importantPendingCount, setImportantPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [selectedPeriod, setSelectedPeriod] = useState("30days");
  const [selectedSDR, setSelectedSDR] = useState("all"); // Armazena o sdr_name para exibição
  const [filterByImportant, setFilterByImportant] = useState(false); // filtra apenas leads importantes

  // Ref para scroll automático na tabela
  const leadsTableRef = useRef<HTMLDivElement>(null);
  
  // Ref para armazenar filtros atuais (evita dependência circular)
  const filtersRef = useRef({ selectedPeriod, selectedSDR });
  
  // Atualizar ref quando filtros mudam
  useEffect(() => {
    filtersRef.current = { selectedPeriod, selectedSDR };
  }, [selectedPeriod, selectedSDR]);

  // Função para ativar filtro e scroll
  const handleImportantClick = () => {
    const newFilterState = !filterByImportant;
    setFilterByImportant(newFilterState);
    
    if (newFilterState && leadsTableRef.current) {
      // Pequeno delay para garantir que o estado atualizou
      setTimeout(() => {
        leadsTableRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }, 100);
    }
  };

  // Função de refresh (usada pelo realtime e polling)
  const refreshData = useCallback(async () => {
    try {
      const { selectedPeriod: period, selectedSDR: sdr } = filtersRef.current;
      
      // Buscar SDRs
      const sdrsData = await fetchSDRs();
      setSDRsInfo(sdrsData || []);
      
      // Buscar leads importantes pendentes
      const importantData = await fetchImportantPendingLeads();
      setImportantPendingCount(importantData?.count || 0);
      
      // Encontrar o sdr_id correspondente ao nome selecionado
      let sdrIdToFilter: string | undefined;
      if (sdr !== 'all' && sdrsData) {
        const sdrInfo = sdrsData.find((s: SDRInfo) => s.sdr_name === sdr);
        sdrIdToFilter = sdrInfo?.sdr_id;
      }
      
      // Buscar leads com o filtro correto
      const leadsData = await fetchLeads({ 
        period: period, 
        sdr_id: sdrIdToFilter 
      });
      
      setAllLeads(leadsData || []);
      setError(null);
    } catch (err) {
      console.error('Erro ao atualizar dados:', err);
    }
  }, []);

  // Hook de Realtime + Polling
  const { isRealtimeEnabled, forceRefresh } = useRealtimeLeads({
    onRefresh: refreshData,
    pollingInterval: 60000, // 60 segundos
  });

  // Carregar dados iniciais
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);
      
      try {
        // Buscar SDRs primeiro para ter o mapeamento
        const sdrsData = await fetchSDRs();
        setSDRsInfo(sdrsData || []);
        
        // Buscar leads importantes pendentes
        const importantData = await fetchImportantPendingLeads();
        setImportantPendingCount(importantData?.count || 0);
        
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
        setImportantPendingCount(0);
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
      {/* Toast notifications */}
      <Toaster position="top-right" richColors closeButton />
      
      <header className="bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Activity className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Dashboard SDR</h1>
                <p className="text-muted-foreground">Monitoramento de Tempo de Atendimento</p>
              </div>
            </div>
            
            {/* Status Realtime + Refresh */}
            <div className="flex items-center gap-3">
              {/* Indicador de conexão */}
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${
                isRealtimeEnabled 
                  ? 'bg-green-500/10 text-green-600' 
                  : 'bg-yellow-500/10 text-yellow-600'
              }`}>
                {isRealtimeEnabled ? (
                  <>
                    <Wifi className="h-4 w-4" />
                    <span className="hidden sm:inline">Tempo real</span>
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-4 w-4" />
                    <span className="hidden sm:inline">Polling 60s</span>
                  </>
                )}
              </div>
              
              {/* Botão de refresh manual */}
              <button
                onClick={forceRefresh}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
                title="Atualizar dados"
              >
                <RefreshCw className="h-5 w-5 text-muted-foreground hover:text-foreground" />
              </button>
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
                <StatsCards 
                  leads={filteredLeads} 
                  sdrPerformance={sdrPerformance} 
                  isFilteredBySDR={selectedSDR !== "all"} 
                  importantPendingCount={importantPendingCount}
                  onImportantClick={handleImportantClick}
                />
                
                {filterByImportant && (
                  <div className="mb-4 p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg flex items-center justify-between">
                    <span className="text-orange-600 font-medium">
                      🔍 Filtrando apenas leads importantes (Tem perfil / Perfil menor)
                    </span>
                    <button 
                      onClick={() => setFilterByImportant(false)}
                      className="text-orange-600 hover:text-orange-700 text-sm underline"
                    >
                      Limpar filtro
                    </button>
                  </div>
                )}
                
                <SDRRanking sdrPerformance={sdrPerformance} />
                
                <PerformanceCharts leads={filteredLeads} />
                
                <HourlyPerformance leads={allLeads} />
                
                <Timeline leads={filteredLeads} />
                
                <div ref={leadsTableRef} data-leads-table>
                  <LeadsTable leads={filteredLeads} filterByImportant={filterByImportant} />
                </div>
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Index;
