/**
 * Service para operações CRUD de leads no Supabase
 */

import { supabase } from '../config/database.js';
import { 
  LeadSLA, 
  LeadSLAInsert, 
  SDRPerformance,
  GeneralMetrics,
  HourlyPerformance,
  LeadsQueryFilters 
} from '../types/index.js';
import { 
  calculateMinutesDiff, 
  getThirtyDaysAgo, 
  periodToDate,
  formatHourRange,
  getSLAStatus 
} from '../utils/dateUtils.js';

// ============================================
// Operações CRUD básicas
// ============================================

/**
 * Cria um novo registro de lead (Fluxo A: Entrada de Lead)
 * Se attended_at for fornecido, calcula o SLA automaticamente
 */
export async function createLead(data: LeadSLAInsert): Promise<LeadSLA | null> {
  // Se já vem com attended_at, calcular o SLA
  let insertData: any = { ...data };
  
  if (data.attended_at && data.entered_at && !data.sla_minutes) {
    insertData.sla_minutes = calculateMinutesDiff(data.entered_at, data.attended_at);
  }

  const { data: lead, error } = await supabase
    .from('leads_sla')
    .insert(insertData)
    .select()
    .single();

  if (error) {
    console.error('Erro ao criar lead:', error);
    throw new Error(`Erro ao criar lead: ${error.message}`);
  }

  return lead;
}

/**
 * Busca um lead pelo lead_id do Pipedrive
 */
export async function findLeadByPipedriveId(leadId: string): Promise<LeadSLA | null> {
  const { data: lead, error } = await supabase
    .from('leads_sla')
    .select('*')
    .eq('lead_id', leadId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Erro ao buscar lead:', error);
    return null;
  }

  return lead;
}

/**
 * Atualiza um lead com dados de atendimento (Fluxo B: Atendimento)
 * Inclui verificação de idempotência
 */
export async function attendLead(
  leadId: string, 
  sdrId: string, 
  sdrName: string, 
  attendedAt: string
): Promise<LeadSLA | null> {
  // Buscar o lead
  const existingLead = await findLeadByPipedriveId(leadId);
  
  if (!existingLead) {
    console.warn(`Lead ${leadId} não encontrado para atendimento`);
    return null;
  }

  // Verificação de idempotência: se já foi atendido, ignorar
  if (existingLead.attended_at !== null) {
    console.log(`Lead ${leadId} já foi atendido anteriormente. Ignorando.`);
    return existingLead;
  }

  // Calcular SLA
  const slaMinutes = calculateMinutesDiff(existingLead.entered_at, attendedAt);

  // Atualizar o lead
  const { data: updatedLead, error } = await supabase
    .from('leads_sla')
    .update({
      sdr_id: sdrId,
      sdr_name: sdrName,
      attended_at: attendedAt,
      sla_minutes: slaMinutes,
    })
    .eq('lead_id', leadId)
    .select()
    .single();

  if (error) {
    console.error('Erro ao atualizar lead:', error);
    throw new Error(`Erro ao atualizar lead: ${error.message}`);
  }

  console.log(`✅ Lead ${leadId} atendido com SLA de ${slaMinutes} minutos`);
  return updatedLead;
}

/**
 * Atualiza o stage de um lead
 */
export async function updateLeadStage(
  leadId: string,
  stageName: string,
  stagePriority: number
): Promise<LeadSLA | null> {
  const { data: updatedLead, error } = await supabase
    .from('leads_sla')
    .update({
      stage_name: stageName,
      stage_priority: stagePriority,
    })
    .eq('lead_id', leadId)
    .select()
    .single();

  if (error) {
    console.error('Erro ao atualizar stage do lead:', error);
    return null;
  }

  return updatedLead;
}

// ============================================
// Queries para o Dashboard
// ============================================

/**
 * GET /metrics/general - Métricas gerais da operação
 */
export async function getGeneralMetrics(): Promise<GeneralMetrics> {
  const thirtyDaysAgo = getThirtyDaysAgo();

  const { data: leads, error } = await supabase
    .from('leads_sla')
    .select('sla_minutes, attended_at')
    .gte('entered_at', thirtyDaysAgo);

  if (error) {
    throw new Error(`Erro ao buscar métricas: ${error.message}`);
  }

  const attendedLeads = leads?.filter(l => l.sla_minutes !== null) || [];
  const slaValues = attendedLeads.map(l => l.sla_minutes as number);

  return {
    total_leads: leads?.length || 0,
    attended_leads: attendedLeads.length,
    pending_leads: (leads?.length || 0) - attendedLeads.length,
    avg_sla_minutes: slaValues.length > 0 
      ? Math.round(slaValues.reduce((a, b) => a + b, 0) / slaValues.length) 
      : 0,
    max_sla_minutes: slaValues.length > 0 ? Math.max(...slaValues) : 0,
    min_sla_minutes: slaValues.length > 0 ? Math.min(...slaValues) : 0,
  };
}

/**
 * GET /metrics/ranking - Ranking de SDRs por tempo médio
 */
export async function getSDRRanking(): Promise<SDRPerformance[]> {
  const thirtyDaysAgo = getThirtyDaysAgo();

  const { data: leads, error } = await supabase
    .from('leads_sla')
    .select('sdr_id, sdr_name, sla_minutes')
    .gte('entered_at', thirtyDaysAgo)
    .not('sla_minutes', 'is', null)
    .not('sdr_id', 'is', null);

  if (error) {
    throw new Error(`Erro ao buscar ranking: ${error.message}`);
  }

  // Agrupar por SDR
  const sdrMap = new Map<string, { name: string; total: number; count: number }>();

  leads?.forEach(lead => {
    if (lead.sdr_id && lead.sla_minutes !== null) {
      const current = sdrMap.get(lead.sdr_id) || { 
        name: lead.sdr_name || 'Desconhecido', 
        total: 0, 
        count: 0 
      };
      current.total += lead.sla_minutes;
      current.count += 1;
      sdrMap.set(lead.sdr_id, current);
    }
  });

  // Converter para array e ordenar por menor tempo
  const ranking: SDRPerformance[] = Array.from(sdrMap.entries())
    .map(([sdr_id, data]) => ({
      sdr_id,
      sdr_name: data.name,
      average_time: Math.round(data.total / data.count),
      leads_attended: data.count,
    }))
    .sort((a, b) => a.average_time - b.average_time);

  return ranking;
}

/**
 * GET /metrics/timeline - Dados para gráfico de linha do tempo
 */
export async function getTimelineData(): Promise<{ date: string; average: number; count: number }[]> {
  const thirtyDaysAgo = getThirtyDaysAgo();

  const { data: leads, error } = await supabase
    .from('leads_sla')
    .select('entered_at, sla_minutes')
    .gte('entered_at', thirtyDaysAgo)
    .not('sla_minutes', 'is', null)
    .order('entered_at', { ascending: true });

  if (error) {
    throw new Error(`Erro ao buscar timeline: ${error.message}`);
  }

  // Agrupar por dia
  const dailyMap = new Map<string, { total: number; count: number }>();

  leads?.forEach(lead => {
    const date = new Date(lead.entered_at).toISOString().split('T')[0];
    const current = dailyMap.get(date) || { total: 0, count: 0 };
    current.total += lead.sla_minutes || 0;
    current.count += 1;
    dailyMap.set(date, current);
  });

  return Array.from(dailyMap.entries())
    .map(([date, data]) => ({
      date,
      average: Math.round(data.total / data.count),
      count: data.count,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * GET /metrics/hourly-performance - Análise de desempenho por horário
 */
export async function getHourlyPerformance(): Promise<HourlyPerformance[]> {
  const thirtyDaysAgo = getThirtyDaysAgo();

  const { data: leads, error } = await supabase
    .from('leads_sla')
    .select('attended_at, sla_minutes')
    .gte('entered_at', thirtyDaysAgo)
    .not('attended_at', 'is', null)
    .not('sla_minutes', 'is', null);

  if (error) {
    throw new Error(`Erro ao buscar performance por hora: ${error.message}`);
  }

  // Inicializar todas as horas do horário comercial (6h às 22h)
  const hourMap = new Map<number, { total: number; count: number }>();
  for (let h = 6; h <= 22; h++) {
    hourMap.set(h, { total: 0, count: 0 });
  }

  // Agrupar por hora
  leads?.forEach(lead => {
    const hour = new Date(lead.attended_at!).getHours();
    if (hour >= 6 && hour <= 22) {
      const current = hourMap.get(hour)!;
      current.total += lead.sla_minutes!;
      current.count += 1;
    }
  });

  // Converter para array
  const result: HourlyPerformance[] = [];
  for (let h = 6; h <= 22; h++) {
    const data = hourMap.get(h)!;
    const avgSla = data.count > 0 ? Math.round(data.total / data.count) : 0;
    result.push({
      hour: h,
      label: formatHourRange(h),
      avg_sla: avgSla,
      count: data.count,
      status: getSLAStatus(avgSla),
    });
  }

  return result;
}

/**
 * GET /leads/slowest - Leads com maior tempo de SLA
 */
export async function getSlowestLeads(limit: number = 20): Promise<LeadSLA[]> {
  const thirtyDaysAgo = getThirtyDaysAgo();

  const { data: leads, error } = await supabase
    .from('leads_sla')
    .select('*')
    .gte('entered_at', thirtyDaysAgo)
    .not('sla_minutes', 'is', null)
    .order('sla_minutes', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Erro ao buscar leads mais lentos: ${error.message}`);
  }

  return leads || [];
}

/**
 * GET /leads/pending - Leads pendentes (sem atendimento)
 */
export async function getPendingLeads(limit: number = 50): Promise<LeadSLA[]> {
  const thirtyDaysAgo = getThirtyDaysAgo();

  const { data: leads, error } = await supabase
    .from('leads_sla')
    .select('*')
    .gte('entered_at', thirtyDaysAgo)
    .is('attended_at', null)
    .order('entered_at', { ascending: true })
    .limit(limit);

  if (error) {
    throw new Error(`Erro ao buscar leads pendentes: ${error.message}`);
  }

  return leads || [];
}

/**
 * GET /leads/detail - Detalhes de leads com filtros
 */
export async function getLeadsWithFilters(filters: LeadsQueryFilters): Promise<LeadSLA[]> {
  let query = supabase
    .from('leads_sla')
    .select('*');

  // Aplicar filtro de período
  const startDate = periodToDate(filters.period || '30days');
  if (startDate) {
    query = query.gte('entered_at', startDate);
  }

  // Aplicar filtro de SDR
  if (filters.sdr_id && filters.sdr_id !== 'all') {
    query = query.eq('sdr_id', filters.sdr_id);
  }

  // Ordenar por data de entrada (mais recente primeiro)
  query = query.order('entered_at', { ascending: false });

  // Aplicar limit e offset
  if (filters.limit) {
    query = query.limit(filters.limit);
  }
  if (filters.offset) {
    query = query.range(filters.offset, (filters.offset + (filters.limit || 50)) - 1);
  }

  const { data: leads, error } = await query;

  if (error) {
    throw new Error(`Erro ao buscar leads: ${error.message}`);
  }

  return leads || [];
}

/**
 * Lista todos os SDRs únicos
 */
export async function getUniqueSDRs(): Promise<{ sdr_id: string; sdr_name: string }[]> {
  const { data, error } = await supabase
    .from('leads_sla')
    .select('sdr_id, sdr_name')
    .not('sdr_id', 'is', null);

  if (error) {
    throw new Error(`Erro ao buscar SDRs: ${error.message}`);
  }

  // Remover duplicatas
  const sdrMap = new Map<string, string>();
  data?.forEach(row => {
    if (row.sdr_id && !sdrMap.has(row.sdr_id)) {
      sdrMap.set(row.sdr_id, row.sdr_name || 'Desconhecido');
    }
  });

  return Array.from(sdrMap.entries()).map(([sdr_id, sdr_name]) => ({
    sdr_id,
    sdr_name,
  }));
}

/**
 * Limpa todos os dados de teste (usar com cuidado!)
 */
export async function clearAllLeads(): Promise<number> {
  const { data, error } = await supabase
    .from('leads_sla')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000') // Deleta tudo
    .select();

  if (error) {
    console.error('Erro ao limpar leads:', error);
    throw new Error(`Erro ao limpar leads: ${error.message}`);
  }

  const count = data?.length || 0;
  console.log(`🗑️ ${count} leads removidos do banco de dados`);
  return count;
}
