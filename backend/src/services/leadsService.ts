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
  DailyAverage,
  LeadsQueryFilters 
} from '../types/index.js';
import { 
  calculateMinutesDiff, 
  getThirtyDaysAgo, 
  getTodayStart,
  getMonthStart,
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
 * Invalida o cache após criação
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

  // Invalidar cache para forçar atualização imediata
  cache.invalidate(CACHE_KEYS.GENERAL_METRICS);
  cache.invalidate(CACHE_KEYS.SDR_RANKING);
  cache.invalidate(CACHE_KEYS.IMPORTANT_PENDING);
  
  console.log('🗑️ Cache invalidado após criar lead');

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
 * Invalida o cache após atendimento
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

  // Invalidar cache para forçar atualização imediata
  cache.invalidate(CACHE_KEYS.GENERAL_METRICS);
  cache.invalidate(CACHE_KEYS.SDR_RANKING);
  cache.invalidate(CACHE_KEYS.IMPORTANT_PENDING);
  
  console.log('🗑️ Cache invalidado após atender lead');

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
 * 
 * REGRA: Contabiliza dados acumulados do Mês Atual (Month-to-Date)
 * - Início: 1º dia do mês atual às 00:00:00
 * - Fim: Momento presente (NOW())
 * - Baseado em attended_at (quando o lead foi atendido)
 */
export async function getSDRRanking(): Promise<SDRPerformance[]> {
  // Verificar cache
  const cached = cache.get<SDRPerformance[]>(CACHE_KEYS.SDR_RANKING);
  if (cached) {
    console.log('📦 Cache hit: SDR ranking');
    return cached;
  }

  // Usar início do mês atual (Month-to-Date)
  const monthStart = getMonthStart();

  const { data: leads, error } = await supabase
    .from('leads_sla')
    .select('sdr_id, sdr_name, sla_minutes')
    .gte('attended_at', monthStart) // Filtrar por attended_at (mês atual)
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
 * GET /api/leads/monthly - Busca TODOS os leads do mês atual (sem limite)
 * Usado para filtragem client-side no ranking de SDRs
 * 
 * REGRA: Retorna todos os leads que foram ATENDIDOS desde o primeiro dia do mês atual
 * - Início: 1º dia do mês atual às 00:00:00
 * - Fim: Momento presente (NOW())
 * - Filtra por attended_at (quando foi atendido) para garantir consistência com o card "Atendidos Hoje"
 * - Sem limite de linhas (usa range 0-10000 para garantir todos os dados)
 */
export async function getAllMonthLeads(): Promise<LeadSLA[]> {
  const monthStart = getMonthStart();

  // Buscar todos os leads ATENDIDOS do mês (sem limite, usando range grande)
  // IMPORTANTE: Filtra por attended_at para garantir que o ranking use a mesma métrica do card "Atendidos Hoje"
  const { data: leads, error } = await supabase
    .from('leads_sla')
    .select('lead_id, sdr_id, sdr_name, entered_at, attended_at, sla_minutes')
    .gte('attended_at', monthStart) // Filtrar por attended_at (quando foi atendido)
    .not('attended_at', 'is', null) // Apenas leads que foram atendidos
    .not('sla_minutes', 'is', null) // Apenas leads com SLA calculado
    .not('sdr_id', 'is', null)
    .order('attended_at', { ascending: false })
    .range(0, 10000); // Limite alto para garantir que pegamos todos os leads

  if (error) {
    throw new Error(`Erro ao buscar leads do mês: ${error.message}`);
  }

  return leads || [];
}

/**
 * GET /metrics/timeline - Dados para gráfico de linha do tempo
 * 
 * REGRA: Acúmulo Diário (Dia Civil)
 * - Início: 00:00:00 do dia atual
 * - Fim: Momento presente, acumulando sem descartar até a virada do dia
 * - Reset: À meia-noite, os dados zeram
 * - Baseado em attended_at (quando o lead foi atendido)
 */
export async function getTimelineData(): Promise<{ date: string; average: number; count: number }[]> {
  // Usar início do dia atual (Dia Civil)
  const todayStart = getTodayStart();

  const { data: leads, error } = await supabase
    .from('leads_sla')
    .select('attended_at, sla_minutes')
    .gte('attended_at', todayStart) // Filtrar por attended_at (dia atual)
    .not('sla_minutes', 'is', null)
    .not('attended_at', 'is', null)
    .order('attended_at', { ascending: true });

  if (error) {
    throw new Error(`Erro ao buscar timeline: ${error.message}`);
  }

  // Agrupar por dia de atendimento
  const dailyMap = new Map<string, { total: number; count: number }>();

  leads?.forEach(lead => {
    const date = new Date(lead.attended_at!).toISOString().split('T')[0];
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
 * GET /metrics/daily-average - Tempo médio por dia (últimos 7 dias)
 * Janela deslizante: sempre mostra os últimos 7 dias incluindo o dia atual
 */
export async function getDailyAverage(): Promise<DailyAverage[]> {
  try {
    console.log('📊 [getDailyAverage] Iniciando busca de média diária...');
    
    // Calcular data de 6 dias atrás (hoje + 6 dias = 7 dias total)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);
    const sevenDaysAgoISO = sevenDaysAgo.toISOString();
    
    console.log('📅 [getDailyAverage] Buscando leads desde:', sevenDaysAgoISO);

    // Query SQL otimizada usando RPC ou query direta
    // Como Supabase não suporta TO_CHAR diretamente, vamos buscar os dados e processar
    console.log('🔍 [getDailyAverage] Executando query no Supabase...');
    const { data: leads, error } = await supabase
      .from('leads_sla')
      .select('attended_at, sla_minutes')
      .gte('attended_at', sevenDaysAgoISO)
      .not('attended_at', 'is', null)
      .not('sla_minutes', 'is', null)
      .order('attended_at', { ascending: true });

    if (error) {
      console.error('❌ [getDailyAverage] Erro do Supabase:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      throw new Error(`Erro ao buscar média diária: ${error.message} (Código: ${error.code})`);
    }

    console.log(`✅ [getDailyAverage] Query executada com sucesso. ${leads?.length || 0} leads encontrados.`);

  // Agrupar por data (DD/MM)
  const dailyMap = new Map<string, { total: number; count: number; date: Date }>();

  leads?.forEach(lead => {
    const attendedDate = new Date(lead.attended_at!);
    const dateKey = attendedDate.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
    });
    
    // Usar a data completa para ordenação posterior
    const dateOnly = new Date(attendedDate);
    dateOnly.setHours(0, 0, 0, 0);
    
    const current = dailyMap.get(dateKey) || { total: 0, count: 0, date: dateOnly };
    current.total += lead.sla_minutes!;
    current.count += 1;
    dailyMap.set(dateKey, current);
  });

    // Converter para array e ordenar por data
    const result: DailyAverage[] = Array.from(dailyMap.entries())
      .map(([dateFormatted, data]) => ({
        date: dateFormatted,
        avg_sla: Math.round(data.total / data.count),
        _sortDate: data.date, // Manter data completa para ordenação
      }))
      .sort((a, b) => {
        // Ordenar por data completa
        return a._sortDate.getTime() - b._sortDate.getTime();
      })
      .map(({ date, avg_sla }) => ({ date, avg_sla })); // Remover campo auxiliar

    console.log(`✅ [getDailyAverage] Processamento concluído. ${result.length} dias retornados.`);
    return result;
  } catch (error) {
    console.error('❌ [getDailyAverage] Erro completo:', error);
    
    // Log detalhado do erro
    if (error instanceof Error) {
      console.error('   Tipo:', error.constructor.name);
      console.error('   Mensagem:', error.message);
      console.error('   Stack:', error.stack);
    }
    
    // Verificar se é erro de conexão
    if (error instanceof Error && error.message.includes('fetch failed')) {
      console.error('🔴 [getDailyAverage] ERRO DE CONEXÃO detectado!');
      console.error('   Possíveis causas:');
      console.error('   1. SUPABASE_URL incorreto ou inacessível');
      console.error('   2. Problema de rede/DNS');
      console.error('   3. Supabase temporariamente indisponível');
      console.error('   4. Firewall bloqueando conexão');
    }
    
    throw error;
  }
}

/**
 * GET /metrics/hourly-performance - Análise de desempenho por horário
 * 
 * REGRA: Acúmulo Diário (Dia Civil)
 * - Início: 00:00:00 do dia atual
 * - Fim: Momento presente, acumulando sem descartar até a virada do dia
 * - Reset: À meia-noite, os dados zeram
 * - As barras de horas passadas (ex: 08h, 09h) devem permanecer estáticas e visíveis até a meia-noite
 * - Baseado em attended_at (quando o lead foi atendido)
 */
export async function getHourlyPerformance(): Promise<HourlyPerformance[]> {
  // Usar início do dia atual (Dia Civil)
  const todayStart = getTodayStart();

  const { data: leads, error } = await supabase
    .from('leads_sla')
    .select('attended_at, sla_minutes')
    .gte('attended_at', todayStart) // Filtrar por attended_at (dia atual)
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
 * GET /leads/today-attended - Leads atendidos hoje (independente de quando foram criados)
 * Usa attended_at para filtrar, não entered_at
 */
export async function getTodayAttendedLeads(): Promise<LeadSLA[]> {
  // Início do dia atual (00:00:00)
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayStartISO = todayStart.toISOString();
  
  // Fim do dia atual (23:59:59)
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);
  const todayEndISO = todayEnd.toISOString();

  const { data: leads, error } = await supabase
    .from('leads_sla')
    .select('*')
    .gte('attended_at', todayStartISO)
    .lte('attended_at', todayEndISO)
    .not('attended_at', 'is', null)
    .not('sla_minutes', 'is', null)
    .order('attended_at', { ascending: false });

  if (error) {
    throw new Error(`Erro ao buscar leads atendidos hoje: ${error.message}`);
  }

  return leads || [];
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
 * Busca case-insensitive para pegar todas variações
 */
export async function getImportantPendingLeads(): Promise<{ count: number; leads: LeadSLA[] }> {
  const thirtyDaysAgo = getThirtyDaysAgo();

  // Buscar todos os leads pendentes e filtrar em memória (case-insensitive)
  const { data: allPending, error } = await supabase
    .from('leads_sla')
    .select('*')
    .gte('entered_at', thirtyDaysAgo)
    .is('attended_at', null)
    .order('stage_priority', { ascending: true })
    .order('entered_at', { ascending: true });

  if (error) {
    throw new Error(`Erro ao buscar leads importantes pendentes: ${error.message}`);
  }

  // Filtrar em memória (case-insensitive) para "Tem Perfil" e "Perfil Menor"
  const importantLeads = (allPending || []).filter(lead => {
    const stageName = (lead.stage_name || '').toLowerCase().trim();
    return stageName.includes('tem perfil') || stageName.includes('perfil menor');
  });

  return {
    count: importantLeads.length,
    leads: importantLeads,
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
