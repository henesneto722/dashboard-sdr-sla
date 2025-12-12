/**
 * Tipos e funções utilitárias para o Dashboard de SLA
 * Sem dados de exemplo - pronto para consumir API real
 */

export interface Lead {
  lead_id: string;
  lead_name: string;
  sdr_id: string;
  sdr_name: string;
  entered_at: string;
  attended_at: string | null;
  sla_minutes: number | null;
  source: string;
  pipeline: string;
  stage_name: string | null;
  stage_priority: number | null;
}

export interface SDRPerformance {
  sdr_id: string;
  sdr_name: string;
  average_time: number;
  leads_attended: number;
  performance_score?: number; // Score combinado (tempo + quantidade)
}

/**
 * Calcula a performance de cada SDR baseado nos leads
 * NOVA LÓGICA: Considera tanto tempo médio quanto quantidade de leads atendidos
 * 
 * Fórmula de Score:
 * - Normaliza tempo médio (menor é melhor) e quantidade (maior é melhor)
 * - Dá peso maior para quantidade (60%) vs tempo (40%)
 * - Score final: quanto maior, melhor
 */
export const calculateSDRPerformance = (leads: Lead[]): SDRPerformance[] => {
  const sdrMap = new Map<string, { total: number; count: number; name: string }>();
  
  leads.forEach(lead => {
    if (lead.sla_minutes !== null) {
      const current = sdrMap.get(lead.sdr_id) || { total: 0, count: 0, name: lead.sdr_name };
      current.total += lead.sla_minutes;
      current.count += 1;
      sdrMap.set(lead.sdr_id, current);
    }
  });
  
  const performances = Array.from(sdrMap.entries())
    .map(([sdr_id, data]) => ({
      sdr_id,
      sdr_name: data.name,
      average_time: data.count > 0 ? Math.round(data.total / data.count) : 0,
      leads_attended: data.count,
    }));

  // Calcular scores combinados
  if (performances.length === 0) return [];

  // Encontrar valores máximos para normalização
  const maxTime = Math.max(...performances.map(p => p.average_time), 1);
  const maxLeads = Math.max(...performances.map(p => p.leads_attended), 1);

  // Calcular score para cada SDR
  const performancesWithScore = performances.map(perf => {
    // Normalizar tempo (0-100, onde 0 = melhor tempo, 100 = pior tempo)
    // Inverter para que menor tempo = maior score
    const normalizedTime = maxTime > 0 ? (1 - (perf.average_time / maxTime)) * 100 : 0;
    
    // Normalizar quantidade (0-100, onde 100 = mais leads)
    const normalizedLeads = maxLeads > 0 ? (perf.leads_attended / maxLeads) * 100 : 0;
    
    // Score combinado: 40% tempo + 60% quantidade
    // Peso maior para quantidade porque é mais importante atender muitos leads
    const performance_score = (normalizedTime * 0.4) + (normalizedLeads * 0.6);
    
    return {
      ...perf,
      performance_score: Math.round(performance_score * 100) / 100, // 2 casas decimais
    };
  });

  // Ordenar por score (maior = melhor)
  return performancesWithScore.sort((a, b) => {
    const scoreA = a.performance_score || 0;
    const scoreB = b.performance_score || 0;
    
    // Se scores iguais, desempata por quantidade de leads
    if (Math.abs(scoreA - scoreB) < 0.01) {
      return b.leads_attended - a.leads_attended;
    }
    
    return scoreB - scoreA;
  });
};

/**
 * Interface para thresholds dinâmicos
 */
export interface PerformanceThresholds {
  good: number;      // Limite para "Bom" (percentil 33)
  moderate: number;  // Limite para "Moderado" (percentil 66)
}

// Thresholds padrão (usados quando não há dados suficientes)
const DEFAULT_THRESHOLDS: PerformanceThresholds = {
  good: 15,
  moderate: 30,
};

// Cache dos thresholds calculados
let cachedThresholds: PerformanceThresholds | null = null;

/**
 * Calcula thresholds dinâmicos baseados nos percentis dos dados reais
 * Percentil 33 = Bom, Percentil 66 = Moderado, Acima = Crítico
 */
export const calculateThresholds = (leads: Lead[]): PerformanceThresholds => {
  const times = leads
    .filter(l => l.sla_minutes !== null && l.sla_minutes > 0)
    .map(l => l.sla_minutes as number)
    .sort((a, b) => a - b);
  
  // Mínimo de 5 leads para calcular thresholds dinâmicos
  if (times.length < 5) {
    return DEFAULT_THRESHOLDS;
  }
  
  // Calcula percentis
  const percentile = (arr: number[], p: number): number => {
    const index = Math.ceil((p / 100) * arr.length) - 1;
    return arr[Math.max(0, index)];
  };
  
  const good = percentile(times, 33);
  const moderate = percentile(times, 66);
  
  // Garante valores mínimos razoáveis
  return {
    good: Math.max(1, Math.round(good)),
    moderate: Math.max(good + 1, Math.round(moderate)),
  };
};

/**
 * Define os thresholds globais (chamado quando os leads são carregados)
 */
export const setThresholds = (leads: Lead[]): PerformanceThresholds => {
  cachedThresholds = calculateThresholds(leads);
  return cachedThresholds;
};

/**
 * Retorna os thresholds atuais
 */
export const getThresholds = (): PerformanceThresholds => {
  return cachedThresholds || DEFAULT_THRESHOLDS;
};

/**
 * Retorna a cor de performance baseada no tempo em minutos (dinâmico)
 */
export const getPerformanceColor = (minutes: number): string => {
  const thresholds = getThresholds();
  if (minutes <= thresholds.good) return "success";
  if (minutes <= thresholds.moderate) return "warning";
  return "danger";
};

/**
 * Retorna o label de performance baseado no tempo em minutos (dinâmico)
 */
export const getPerformanceLabel = (minutes: number): string => {
  const thresholds = getThresholds();
  if (minutes <= thresholds.good) return "Bom";
  if (minutes <= thresholds.moderate) return "Moderado";
  return "Crítico";
};

/**
 * Formata minutos para exibição amigável
 * Ex: 45 → "45min", 70 → "1h10min", 3700 → "2d13h40min"
 */
export const formatTime = (minutes: number | null): string => {
  if (minutes === null || minutes === undefined) return "-";
  
  // Menos de 60 minutos: mostrar apenas minutos
  if (minutes < 60) {
    return `${minutes}min`;
  }
  
  const totalHours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  // Mais de 60 horas (3600 minutos): mostrar apenas dias
  if (totalHours >= 60) {
    const days = Math.floor(totalHours / 24);
    return days === 1 ? `${days} dia` : `${days} dias`;
  }
  
  // Entre 60 minutos e 60 horas: mostrar horas e minutos
  if (mins === 0) {
    return `${totalHours}h`;
  }
  
  return `${totalHours}h${mins.toString().padStart(2, '0')}min`;
};
