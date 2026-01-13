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
import { getMainSDRPipelineId, getStageName, getStagePriority } from './pipedriveService.js';

// ============================================
// Operações CRUD básicas
// ============================================

/**
 * Cria um novo registro de lead (Fluxo A: Entrada de Lead)
 * Se attended_at for fornecido, calcula o SLA automaticamente
 * Invalida o cache após criação
 */
export async function createLead(data: LeadSLAInsert): Promise<LeadSLA | null> {
  // Verificar se o lead já existe (idempotência - evita erro de duplicata)
  const existingLead = await findLeadByPipedriveId(data.lead_id);
  if (existingLead) {
    console.log(`Lead ${data.lead_id} já existe. Retornando lead existente.`);
    return existingLead;
  }

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
    // Se o erro for de duplicata (pode acontecer em race conditions), buscar o lead existente
    if (error.code === '23505' || error.message.includes('duplicate key') || error.message.includes('unique constraint')) {
      console.log(`Lead ${data.lead_id} já existe (erro de duplicata detectado). Buscando lead existente...`);
      const existing = await findLeadByPipedriveId(data.lead_id);
      if (existing) {
        return existing;
      }
    }
    
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
 * Atualiza o status de um lead
 */
export async function updateLeadStatus(
  leadId: string,
  status: string | null
): Promise<LeadSLA | null> {
  const { data: updatedLead, error } = await supabase
    .from('leads_sla')
    .update({ status })
    .eq('lead_id', leadId)
    .select()
    .single();

  if (error) {
    console.error('Erro ao atualizar status do lead:', error);
    throw new Error(`Erro ao atualizar status: ${error.message}`);
  }

  // Invalidar cache
  cache.invalidate(CACHE_KEYS.GENERAL_METRICS);
  cache.invalidate(CACHE_KEYS.IMPORTANT_PENDING);

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
  // Seleciona todos os campos (*) para garantir compatibilidade com o tipo LeadSLA
  const { data: leads, error } = await supabase
    .from('leads_sla')
    .select('*') // Seleciona todos os campos para garantir compatibilidade com LeadSLA
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
 * GET /leads/pending - Leads pendentes (sem atendimento e sem status 'lost')
 * Com limite e filtro de data (últimos 30 dias)
 */
export async function getPendingLeads(limit: number = 50): Promise<LeadSLA[]> {
  const thirtyDaysAgo = getThirtyDaysAgo();

  const { data: leads, error } = await supabase
    .from('leads_sla')
    .select('*')
    .gte('entered_at', thirtyDaysAgo)
    .is('attended_at', null)
    .not('status', 'eq', 'lost') // Excluir leads com status 'lost'
    .order('entered_at', { ascending: true })
    .limit(limit);

  if (error) {
    throw new Error(`Erro ao buscar leads pendentes: ${error.message}`);
  }

  return leads || [];
}

/**
 * GET /leads/all-pending - TODOS os leads pendentes (sem limite e sem filtro de data)
 * Exclui apenas leads atendidos e com status 'lost'
 * IMPORTANTE: Filtra apenas leads que estão no pipeline principal "SDR"
 */
export async function getAllPendingLeads(): Promise<{ count: number; leads: LeadSLA[] }> {
  console.log('🔍 [getAllPendingLeads] Iniciando busca de todos os leads pendentes...');
  
  // Obter ID do pipeline principal "SDR"
  const mainSDRPipelineId = await getMainSDRPipelineId();
  console.log(`📋 [getAllPendingLeads] Pipeline principal SDR ID: ${mainSDRPipelineId || '(não encontrado)'} (tipo: ${typeof mainSDRPipelineId})`);
  
  // Buscar leads não atendidos que estão no pipeline principal "SDR"
  let query = supabase
    .from('leads_sla')
    .select('*')
    .is('attended_at', null); // Não foi atendido
  
  // Se encontrou o pipeline principal, filtrar por ele
  // IMPORTANTE: O pipeline no banco é salvo como string, então comparamos como string
  if (mainSDRPipelineId) {
    const pipelineIdStr = mainSDRPipelineId.toString();
    query = query.eq('pipeline', pipelineIdStr);
    console.log(`🔍 [getAllPendingLeads] Filtrando por pipeline: "${pipelineIdStr}" (como string)`);
  } else {
    console.log(`⚠️ [getAllPendingLeads] Pipeline principal não encontrado, buscando todos os leads pendentes`);
  }
  
  const { data: leads, error } = await query
    .order('entered_at', { ascending: true });
  
  console.log(`📊 [getAllPendingLeads] Leads encontrados após filtro de pipeline: ${leads?.length || 0}`);

  if (error) {
    console.error('❌ [getAllPendingLeads] Erro ao buscar leads:', error);
    throw new Error(`Erro ao buscar todos os leads pendentes: ${error.message}`);
  }

  console.log(`📊 [getAllPendingLeads] Total de leads não atendidos encontrados: ${leads?.length || 0}`);

  // Filtrar em memória:
  // 1. Excluir leads com status 'lost' (lost_time não nulo no Pipedrive)
  // 2. Filtrar apenas leads em stages válidos
  const validStages = ['lead formulário', 'lead formularío', 'lead chatbox', 'lead instagram', 'áurea final', 'aurea final', 'fabio final'];
  const validPendingLeads = (leads || []).filter(lead => {
    // Excluir apenas se status for explicitamente 'lost' (permitir NULL/undefined)
    // Isso garante compatibilidade com leads antigos que não têm o campo status
    // Se lost_time não é nulo no Pipedrive, o status será 'lost'
    if (lead.status && lead.status.toLowerCase() === 'lost') {
      return false;
    }
    
    // Verificar se está em stage válido
    const stageName = (lead.stage_name || '').toLowerCase().trim();
    if (!stageName) {
      return false; // Sem stage, não é válido
    }
    
    const isValidStage = validStages.some(valid => stageName.includes(valid));
    
    return isValidStage;
  });

  console.log(`✅ [getAllPendingLeads] Leads pendentes válidos: ${validPendingLeads.length}`);
  console.log(`📋 [getAllPendingLeads] Detalhes:`, validPendingLeads.map(l => ({
    lead_id: l.lead_id,
    stage: l.stage_name,
    status: l.status,
    attended_at: l.attended_at
  })));

  return {
    count: validPendingLeads.length,
    leads: validPendingLeads,
  };
}

/**
 * GET /leads/important-pending - Leads importantes pendentes
 * 
 * LÓGICA CORRIGIDA:
 * 1. Buscar leads não atendidos (attended_at IS NULL)
 * 2. Filtrar apenas leads que estão no pipeline principal "SDR" (não em pipelines individuais)
 * 3. Filtrar: Se stage_name contém "Tem Perfil" OU "Perfil Menor" → CONTA
 * 4. Isso garante que só conta leads que estão realmente pendentes no Pipedrive
 */
export async function getImportantPendingLeads(): Promise<{ count: number; leads: LeadSLA[] }> {
  console.log('🔍 [getImportantPendingLeads] Iniciando busca de leads importantes pendentes...');
  
  // Obter ID do pipeline principal "SDR"
  const mainSDRPipelineId = await getMainSDRPipelineId();
  console.log(`📋 [getImportantPendingLeads] Pipeline principal SDR ID: ${mainSDRPipelineId || '(não encontrado)'} (tipo: ${typeof mainSDRPipelineId})`);
  
  // Buscar leads não atendidos que estão no pipeline principal "SDR"
  let query = supabase
    .from('leads_sla')
    .select('*')
    .is('attended_at', null); // Não foi atendido
  
  // Se encontrou o pipeline principal, filtrar por ele
  // IMPORTANTE: O pipeline no banco é salvo como string, então comparamos como string
  if (mainSDRPipelineId) {
    const pipelineIdStr = mainSDRPipelineId.toString();
    query = query.eq('pipeline', pipelineIdStr);
    console.log(`🔍 [getImportantPendingLeads] Filtrando por pipeline: "${pipelineIdStr}" (como string)`);
  } else {
    console.log(`⚠️ [getImportantPendingLeads] Pipeline principal não encontrado, buscando todos os leads pendentes`);
  }
  
  const { data: allPending, error } = await query
    .order('stage_priority', { ascending: true })
    .order('entered_at', { ascending: true });
  
  console.log(`📊 [getImportantPendingLeads] Leads encontrados após filtro de pipeline: ${allPending?.length || 0}`);

  if (error) {
    console.error('❌ [getImportantPendingLeads] Erro ao buscar leads:', error);
    throw new Error(`Erro ao buscar leads importantes pendentes: ${error.message}`);
  }

  console.log(`📊 [getImportantPendingLeads] Total de leads não atendidos no banco: ${allPending?.length || 0}`);
  
  // DEBUG: Mostrar todos os stages únicos encontrados
  const uniqueStages = new Set((allPending || []).map(l => l.stage_name).filter(Boolean));
  console.log(`📋 [getImportantPendingLeads] Stages únicos encontrados (${uniqueStages.size}):`, Array.from(uniqueStages).sort());
  
  // DEBUG: Contar por stage
  const stageCounts: Record<string, number> = {};
  (allPending || []).forEach(lead => {
    const stage = lead.stage_name || '(sem stage)';
    stageCounts[stage] = (stageCounts[stage] || 0) + 1;
  });
  console.log(`📊 [getImportantPendingLeads] Contagem por stage:`, stageCounts);

  // LÓGICA ESTRITA: Verificar se o stage é EXATAMENTE "Tem Perfil" ou "Perfil Menor"
  // E se o lead NÃO está com status "lost" ou lost_time não nulo
  const importantLeads = (allPending || []).filter(lead => {
    // 1. Excluir leads com status "lost" (lost_time não nulo no Pipedrive)
    if (lead.status && lead.status.toLowerCase() === 'lost') {
      console.log(`🚫 [getImportantPendingLeads] Lead ${lead.lead_id} excluído - Status: "lost"`);
      return false;
    }
    
    // 2. Verificar stage
    const stageNameRaw = lead.stage_name || '';
    const stageName = stageNameRaw.toLowerCase().trim();
    
    if (!stageName) {
      console.log(`⏭️ [getImportantPendingLeads] Lead ${lead.lead_id} ignorado - Sem stage`);
      return false; // Sem stage, não é válido
    }
    
    // 3. Verificação ESTRITA com comparação EXATA:
    // Stage deve ser uma das etapas válidas: Lead Formulário, Lead Chatbox, Lead Instagram, ÁUREA FINAL, FABIO FINAL
    // Usar includes() para capturar variações
    const validStages = ['lead formulário', 'lead formularío', 'lead chatbox', 'lead instagram', 'áurea final', 'aurea final', 'fabio final'];
    const isImportant = validStages.some(valid => stageName.includes(valid));
    
    if (isImportant) {
      console.log(`✅ [getImportantPendingLeads] Lead ${lead.lead_id} ("${lead.lead_name}") incluído - Stage: "${lead.stage_name}" (normalizado: "${stageName}"), Status: "${lead.status || '(null)'}"`);
    } else {
      // Log apenas os primeiros 20 para debug
      if (allPending && allPending.indexOf(lead) < 20) {
        console.log(`⏭️ [getImportantPendingLeads] Lead ${lead.lead_id} ("${lead.lead_name}") ignorado - Stage: "${lead.stage_name}" (normalizado: "${stageName}"), Status: "${lead.status || '(null)'}"`);
      }
    }
    
    return isImportant;
  });

  console.log(`\n🎯 [getImportantPendingLeads] RESULTADO FINAL: ${importantLeads.length} leads importantes pendentes`);
  console.log(`📋 [getImportantPendingLeads] Lista completa:`, importantLeads.map((l, idx) => ({
    index: idx + 1,
    lead_id: l.lead_id,
    lead_name: l.lead_name,
    stage: l.stage_name,
    status: l.status || '(null)',
    attended_at: l.attended_at || '(null)',
    entered_at: l.entered_at
  })));

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

/**
 * Exclui todos os leads importantes pendentes do banco de dados
 * Leads importantes = stage "Tem Perfil" ou "Perfil Menor" que estão pendentes (não atendidos)
 */
export async function deleteImportantPendingLeads(): Promise<number> {
  console.log('🗑️ [deleteImportantPendingLeads] Iniciando exclusão de leads importantes pendentes...');
  
  // Obter ID do pipeline principal "SDR"
  const mainSDRPipelineId = await getMainSDRPipelineId();
  console.log(`📋 [deleteImportantPendingLeads] Pipeline principal SDR ID: ${mainSDRPipelineId || '(não encontrado)'}`);
  
  // Buscar leads importantes pendentes
  const importantPending = await getImportantPendingLeads();
  console.log(`📊 [deleteImportantPendingLeads] Encontrados ${importantPending.leads.length} leads importantes pendentes para excluir`);
  
  if (importantPending.leads.length === 0) {
    console.log('✅ [deleteImportantPendingLeads] Nenhum lead importante pendente para excluir');
    return 0;
  }
  
  // Extrair lead_ids
  const leadIds = importantPending.leads.map(l => l.lead_id);
  console.log(`🗑️ [deleteImportantPendingLeads] Excluindo ${leadIds.length} leads:`, leadIds);
  
  // Excluir por lead_id
  const { data, error } = await supabase
    .from('leads_sla')
    .delete()
    .in('lead_id', leadIds)
    .select();
  
  if (error) {
    console.error('❌ [deleteImportantPendingLeads] Erro ao excluir leads:', error);
    throw new Error(`Erro ao excluir leads importantes pendentes: ${error.message}`);
  }
  
  const count = data?.length || 0;
  console.log(`✅ [deleteImportantPendingLeads] ${count} leads importantes pendentes excluídos do banco de dados`);
  
  // Invalidar cache
  cache.invalidate(CACHE_KEYS.GENERAL_METRICS);
  cache.invalidate(CACHE_KEYS.IMPORTANT_PENDING);
  
  return count;
}

/**
 * Sincroniza todos os deals do pipeline principal "SDR" do Pipedrive
 * Busca todos os deals ativos e atualiza/cria no banco de dados
 */
export async function syncPipedriveDeals(): Promise<{ inserted: number; updated: number; errors: number }> {
  console.log('🔄 [syncPipedriveDeals] Iniciando sincronização com Pipedrive...');
  
  const PIPEDRIVE_API_TOKEN = process.env.PIPEDRIVE_API_TOKEN;
  const PIPEDRIVE_API_URL = 'https://api.pipedrive.com/v1';
  
  if (!PIPEDRIVE_API_TOKEN) {
    throw new Error('PIPEDRIVE_API_TOKEN não configurado');
  }
  
  // Invalidar cache do Pipedrive para forçar recarga
  const { invalidateCache } = await import('./pipedriveService.js');
  invalidateCache();
  
  // Obter ID do pipeline principal "SDR" (após invalidar cache)
  let mainSDRPipelineId = await getMainSDRPipelineId();
  if (!mainSDRPipelineId) {
    // Tentar buscar diretamente da API se não encontrou no cache
    console.log('⚠️ [syncPipedriveDeals] Pipeline não encontrado no cache. Buscando diretamente da API...');
    const pipelinesResponse = await fetch(
      `${PIPEDRIVE_API_URL}/pipelines?api_token=${PIPEDRIVE_API_TOKEN}`
    );
    const pipelinesData: any = await pipelinesResponse.json();
    
    if (pipelinesData.success && pipelinesData.data) {
      // Listar todos os pipelines para debug
      console.log(`📋 [syncPipedriveDeals] Pipelines disponíveis:`, pipelinesData.data.map((p: any) => ({
        id: p.id,
        name: p.name
      })));
      
      // Buscar pipeline principal com lógica mais flexível
      const mainPipeline = pipelinesData.data.find((p: any) => {
        const nameLower = p.name.toLowerCase().trim();
        // Pipeline principal: contém "sdr" mas não contém "-" (não é individual)
        return (nameLower === 'sdr') || 
               (nameLower.includes('sdr') && !nameLower.includes('-') && !nameLower.includes('individual'));
      });
      
      if (mainPipeline) {
        console.log(`✅ [syncPipedriveDeals] Pipeline encontrado diretamente: "${mainPipeline.name}" (ID: ${mainPipeline.id})`);
        mainSDRPipelineId = mainPipeline.id.toString();
      } else {
        // Se não encontrou, listar todos os pipelines SDR encontrados
        const sdrPipelines = pipelinesData.data.filter((p: any) => {
          const nameLower = p.name.toLowerCase().trim();
          return nameLower.includes('sdr');
        });
        throw new Error(`Pipeline principal "SDR" não encontrado. Pipelines SDR disponíveis: ${sdrPipelines.map((p: any) => `${p.name} (ID: ${p.id})`).join(', ')}`);
      }
    } else {
      throw new Error('Pipeline principal "SDR" não encontrado e não foi possível buscar da API');
    }
  }
  
  console.log(`📋 [syncPipedriveDeals] Pipeline principal SDR ID: ${mainSDRPipelineId}`);
  
  let inserted = 0;
  let updated = 0;
  let errors = 0;
  
  // Buscar todos os deals do pipeline principal "SDR"
  let start = 0;
  const limit = 100;
  
  while (true) {
    const dealsResponse = await fetch(
      `${PIPEDRIVE_API_URL}/deals?pipeline_id=${mainSDRPipelineId}&start=${start}&limit=${limit}&status=open&api_token=${PIPEDRIVE_API_TOKEN}`
    );
    
    if (!dealsResponse.ok) {
      throw new Error(`Erro ao buscar deals do Pipedrive: ${dealsResponse.status}`);
    }
    
    const dealsData: any = await dealsResponse.json();
    
    if (!dealsData.success || !dealsData.data || dealsData.data.length === 0) {
      break;
    }
    
    console.log(`📊 [syncPipedriveDeals] Processando ${dealsData.data.length} deals (start=${start})...`);
    
    for (const deal of dealsData.data) {
      try {
        const dealId = deal.id?.toString();
        if (!dealId) {
          console.log(`⚠️ [syncPipedriveDeals] Deal sem ID. Ignorando.`);
          continue;
        }
        
        const dealTitle = deal.title || deal.name || `Lead #${dealId}`;
        const addTime = deal.add_time || deal.created_at || new Date().toISOString();
        const stageId = deal.stage_id;
        const dealStatus = deal.status || 'open';
        const lostTime = deal.lost_time || null; // Tempo em que o deal foi perdido
        const updateTime = deal.update_time || deal.updated_at || new Date().toISOString();
        
        // Se lost_time não é nulo, o deal foi perdido
        const isLost = lostTime !== null && lostTime !== undefined;
        const finalStatus = isLost ? 'lost' : dealStatus;
        
        // Verificar se stageId existe
        if (!stageId) {
          console.log(`⚠️ [syncPipedriveDeals] Deal ${dealId} sem stage_id. Ignorando.`);
          continue;
        }
        
        // Obter informações do stage
        let stageName: string;
        try {
          stageName = await getStageName(stageId);
        } catch (error) {
          console.error(`❌ [syncPipedriveDeals] Erro ao buscar stage ${stageId} para deal ${dealId}:`, error);
          errors++;
          continue;
        }
        
        const stagePriority = getStagePriority(stageName);
        
        // Verificar se é um stage válido
        if (!isValidSDRStage(stageName)) {
          console.log(`⏭️ [syncPipedriveDeals] Deal ${dealId} em stage "${stageName}" não válido. Ignorando.`);
          continue;
        }
        
        // Verificar se o lead já existe
        const existing = await findLeadByPipedriveId(dealId);
        
        if (existing) {
          // Atualizar lead existente
          const updateData: any = {
            lead_name: dealTitle,
            stage_name: stageName,
            stage_priority: stagePriority,
            status: finalStatus, // Usar finalStatus que considera lost_time
            updated_at: updateTime,
          };
          
          // Se o deal foi perdido (lost_time não nulo), garantir que não seja contado como pendente
          if (isLost) {
            // Não atualizar attended_at, mas o status 'lost' já será suficiente para excluir da contagem
            console.log(`🚫 [syncPipedriveDeals] Deal ${dealId} marcado como perdido (lost_time: ${lostTime})`);
          }
          
          // Se o lead foi movido para um pipeline individual (atendido), atualizar
          // Por enquanto, só atualizamos se ainda estiver no pipeline principal
          if (deal.pipeline_id?.toString() === mainSDRPipelineId) {
            // Se não foi atendido, garantir que attended_at seja null
            if (!existing.attended_at) {
              updateData.attended_at = null;
            }
          }
          
          const { data: updatedLead, error: updateError } = await supabase
            .from('leads_sla')
            .update(updateData)
            .eq('lead_id', dealId)
            .select()
            .single();
          
          if (updateError) {
            console.error(`❌ [syncPipedriveDeals] Erro ao atualizar lead ${dealId}:`, updateError);
            errors++;
          } else {
            updated++;
            console.log(`✅ [syncPipedriveDeals] Lead ${dealId} atualizado`);
          }
        } else {
          // Criar novo lead
          const leadData: LeadSLAInsert = {
            lead_id: dealId,
            lead_name: dealTitle,
            entered_at: addTime,
            source: 'Pipedrive',
            pipeline: mainSDRPipelineId,
            stage_name: stageName,
            stage_priority: stagePriority,
            status: finalStatus, // Usar finalStatus que considera lost_time
          };
          
          // Se o deal foi perdido, não criar como pendente
          if (isLost) {
            console.log(`🚫 [syncPipedriveDeals] Deal ${dealId} não será criado como pendente (lost_time: ${lostTime})`);
            continue;
          }
          
          const newLead = await createLead(leadData);
          if (newLead) {
            inserted++;
            console.log(`✅ [syncPipedriveDeals] Lead ${dealId} criado`);
          } else {
            errors++;
            console.error(`❌ [syncPipedriveDeals] Erro ao criar lead ${dealId}`);
          }
        }
      } catch (error) {
        console.error(`❌ [syncPipedriveDeals] Erro ao processar deal ${deal.id}:`, error);
        errors++;
      }
    }
    
    if (dealsData.data.length < limit) {
      break;
    }
    
    start += limit;
  }
  
  console.log(`✅ [syncPipedriveDeals] Sincronização concluída: ${inserted} inseridos, ${updated} atualizados, ${errors} erros`);
  
  // Invalidar cache
  cache.invalidate(CACHE_KEYS.GENERAL_METRICS);
  cache.invalidate(CACHE_KEYS.IMPORTANT_PENDING);
  
  return { inserted, updated, errors };
}

// Função auxiliar para validar stage (mesma lógica do pipedriveHandler)
function isValidSDRStage(stageName: string | null): boolean {
  if (!stageName) return false;
  const name = stageName.toLowerCase().trim();
  return name.includes('tem perfil') || 
         name.includes('perfil menor') || 
         name.includes('inconclusivo') || 
         name.includes('sem perfil');
}
