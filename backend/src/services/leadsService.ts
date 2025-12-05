/**
 * Service para operações CRUD de leads no Supabase
 * Otimizado para 10.000+ leads com cache e paginação
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
import { cache, CACHE_KEYS, CACHE_TTL } from './cacheService.js';

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
 * Com cache de 30 segundos para evitar recálculos frequentes
 */
export async function getGeneralMetrics(): Promise<GeneralMetrics> {
  // Verificar cache
  const cached = cache.get<GeneralMetrics>(CACHE_KEYS.GENERAL_METRICS);
  if (cached) {
    console.log('📦 Cache hit: general metrics');
    return cached;
  }

  const thirtyDaysAgo = getThirtyDaysAgo();

  // Query otimizada: seleciona apenas campos necessários
  const { data: leads, error } = await supabase
    .from('leads_sla')
    .select('sla_minutes, attended_at')
    .gte('entered_at', thirtyDaysAgo);

  if (error) {
    throw new Error(`Erro ao buscar métricas: ${error.message}`);
  }

  const attendedLeads = leads?.filter(l => l.sla_minutes !== null) || [];
  const slaValues = attendedLeads.map(l => l.sla_minutes as number);

  const metrics: GeneralMetrics = {
    total_leads: leads?.length || 0,
    attended_leads: attendedLeads.length,
    pending_leads: (leads?.length || 0) - attendedLeads.length,
    avg_sla_minutes: slaValues.length > 0 
      ? Math.round(slaValues.reduce((a, b) => a + b, 0) / slaValues.length) 
      : 0,
    max_sla_minutes: slaValues.length > 0 ? Math.max(...slaValues) : 0,
    min_sla_minutes: slaValues.length > 0 ? Math.min(...slaValues) : 0,
  };

  // Salvar no cache
  cache.set(CACHE_KEYS.GENERAL_METRICS, metrics, CACHE_TTL.METRICS);
  
  return metrics;
}

/**
 * GET /metrics/ranking - Ranking de SDRs por tempo médio
 * Com cache de 60 segundos
 */
export async function getSDRRanking(): Promise<SDRPerformance[]> {
  // Verificar cache
  const cached = cache.get<SDRPerformance[]>(CACHE_KEYS.SDR_RANKING);
  if (cached) {
    console.log('📦 Cache hit: SDR ranking');
    return cached;
  }

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

  // Salvar no cache
  cache.set(CACHE_KEYS.SDR_RANKING, ranking, CACHE_TTL.RANKING);

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
 * GET /leads/important-pending - Leads importantes pendentes
 * (Tem perfil ou Perfil menor, sem attended_at, últimos 30 dias)
 */
export async function getImportantPendingLeads(): Promise<{ count: number; leads: LeadSLA[] }> {
  const thirtyDaysAgo = getThirtyDaysAgo();

  const { data: leads, error } = await supabase
    .from('leads_sla')
    .select('*')
    .gte('entered_at', thirtyDaysAgo)
    .is('attended_at', null)
    .in('stage_name', ['Tem perfil', 'Perfil menor', 'TEM PERFIL', 'PERFIL MENOR'])
    .order('stage_priority', { ascending: true })
    .order('entered_at', { ascending: true });

  if (error) {
    throw new Error(`Erro ao buscar leads importantes pendentes: ${error.message}`);
  }

  return {
    count: leads?.length || 0,
    leads: leads || [],
  };
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
 * GET /leads/paginated - Leads com paginação real (otimizado para 10k+ leads)
 */
export async function getLeadsPaginated(filters: LeadsQueryFilters): Promise<{
  data: LeadSLA[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}> {
  const page = filters.page || 1;
  const limit = Math.min(filters.limit || 50, 100); // Max 100 por página
  const offset = (page - 1) * limit;

  // Aplicar filtro de período
  const startDate = periodToDate(filters.period || '30days');

  // Query para contar total (usa índice)
  let countQuery = supabase
    .from('leads_sla')
    .select('id', { count: 'exact', head: true });

  if (startDate) {
    countQuery = countQuery.gte('entered_at', startDate);
  }
  if (filters.sdr_id && filters.sdr_id !== 'all') {
    countQuery = countQuery.eq('sdr_id', filters.sdr_id);
  }

  const { count: total, error: countError } = await countQuery;

  if (countError) {
    throw new Error(`Erro ao contar leads: ${countError.message}`);
  }

  // Query para buscar dados paginados
  let dataQuery = supabase
    .from('leads_sla')
    .select('*');

  if (startDate) {
    dataQuery = dataQuery.gte('entered_at', startDate);
  }
  if (filters.sdr_id && filters.sdr_id !== 'all') {
    dataQuery = dataQuery.eq('sdr_id', filters.sdr_id);
  }

  dataQuery = dataQuery
    .order('entered_at', { ascending: false })
    .range(offset, offset + limit - 1);

  const { data: leads, error: dataError } = await dataQuery;

  if (dataError) {
    throw new Error(`Erro ao buscar leads: ${dataError.message}`);
  }

  const totalPages = Math.ceil((total || 0) / limit);

  return {
    data: leads || [],
    pagination: {
      page,
      limit,
      total: total || 0,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
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
