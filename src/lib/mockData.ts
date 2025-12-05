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
}

/**
 * Calcula a performance de cada SDR baseado nos leads
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
  
  return Array.from(sdrMap.entries())
    .map(([sdr_id, data]) => ({
      sdr_id,
      sdr_name: data.name,
      average_time: data.count > 0 ? Math.round(data.total / data.count) : 0,
      leads_attended: data.count,
    }))
    .sort((a, b) => a.average_time - b.average_time);
};

/**
 * Retorna a cor de performance baseada no tempo em minutos
 */
export const getPerformanceColor = (minutes: number): string => {
  if (minutes < 20) return "success";
  return "danger";
};

/**
 * Retorna o label de performance baseado no tempo em minutos
 */
export const getPerformanceLabel = (minutes: number): string => {
  if (minutes < 20) return "Rápido";
  return "Lento";
};

/**
 * Formata minutos para exibição amigável
 * Ex: 45 → "45min", 70 → "1h10min", 125 → "2h05min"
 */
export const formatTime = (minutes: number | null): string => {
  if (minutes === null || minutes === undefined) return "-";
  
  if (minutes < 60) {
    return `${minutes}min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (mins === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h${mins.toString().padStart(2, '0')}min`;
};
