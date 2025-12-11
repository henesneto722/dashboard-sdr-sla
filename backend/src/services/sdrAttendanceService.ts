/**
 * Serviço para gerenciar eventos de jornada de atendimento dos SDRs
 * Integra com o módulo SdrAttendanceCalculator
 */

import { supabase } from '../config/database.js';
import {
  calculateSdrAttendance,
  calculateSdrAttendanceForSdr,
  calculateSdrAttendanceForDate,
  calculateSdrAttendanceForSdrAndDate,
  type PipedriveFlowEvent,
  type SdrDailyMetrics,
} from '../modules/SdrAttendanceCalculator.js';

// ============================================
// Interfaces
// ============================================

export interface SdrAttendanceEventInsert {
  user_id: string;
  user_name?: string;
  timestamp: string; // ISO 8601 UTC
  deal_id: string;
  event_type?: string;
  pipeline_id?: string;
  stage_id?: string;
  metadata?: Record<string, unknown>;
}

export interface SdrAttendanceEvent {
  id: string;
  user_id: string;
  user_name: string | null;
  timestamp: string;
  deal_id: string;
  event_type: string;
  pipeline_id: string | null;
  stage_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

// ============================================
// Funções CRUD
// ============================================

/**
 * Registra um novo evento de movimentação de lead
 */
export async function createAttendanceEvent(
  event: SdrAttendanceEventInsert
): Promise<SdrAttendanceEvent | null> {
  try {
    const { data, error } = await supabase
      .from('sdr_attendance_events')
      .insert({
        user_id: event.user_id,
        user_name: event.user_name || null,
        timestamp: event.timestamp,
        deal_id: event.deal_id,
        event_type: event.event_type || 'stage_change',
        pipeline_id: event.pipeline_id || null,
        stage_id: event.stage_id || null,
        metadata: event.metadata || null,
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao criar evento de atendimento:', error);
      throw new Error(`Erro ao criar evento: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('❌ Erro inesperado ao criar evento:', error);
    return null;
  }
}

/**
 * Busca eventos de atendimento com filtros opcionais
 */
export async function getAttendanceEvents(filters?: {
  user_id?: string;
  start_date?: string;
  end_date?: string;
  deal_id?: string;
  limit?: number;
}): Promise<SdrAttendanceEvent[]> {
  try {
    let query = supabase
      .from('sdr_attendance_events')
      .select('*')
      .order('timestamp', { ascending: false });

    if (filters?.user_id) {
      query = query.eq('user_id', filters.user_id);
    }

    if (filters?.deal_id) {
      query = query.eq('deal_id', filters.deal_id);
    }

    if (filters?.start_date) {
      query = query.gte('timestamp', filters.start_date);
    }

    if (filters?.end_date) {
      query = query.lte('timestamp', filters.end_date);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('❌ Erro ao buscar eventos:', error);
      throw new Error(`Erro ao buscar eventos: ${error.message}`);
    }

    // Log para debug: mostrar quantos eventos por SDR foram encontrados
    if (data && data.length > 0) {
      const eventsBySdr = new Map<string, number>();
      data.forEach(e => {
        const count = eventsBySdr.get(e.user_id) || 0;
        eventsBySdr.set(e.user_id, count + 1);
      });
      
      console.log(`📋 [getAttendanceEvents] Eventos encontrados: ${data.length} total`);
      eventsBySdr.forEach((count, sdrId) => {
        const sdrName = data.find(e => e.user_id === sdrId)?.user_name || 'Sem nome';
        console.log(`   - SDR ${sdrId} (${sdrName}): ${count} eventos`);
      });
    } else {
      console.log(`📋 [getAttendanceEvents] Nenhum evento encontrado`);
    }

    return data || [];
  } catch (error) {
    console.error('❌ Erro inesperado ao buscar eventos:', error);
    return [];
  }
}

/**
 * Converte eventos do banco para formato esperado pelo calculador
 */
function convertToPipedriveFlowEvents(events: SdrAttendanceEvent[]): PipedriveFlowEvent[] {
  const converted = events.map(event => ({
    user_id: event.user_id,
    user_name: event.user_name || undefined,
    timestamp: event.timestamp,
    deal_id: event.deal_id,
    event_type: event.event_type,
    metadata: event.metadata || undefined,
  }));
  
  // Log para debug: mostrar quantos eventos por SDR
  const eventsBySdr = new Map<string, number>();
  converted.forEach(e => {
    const count = eventsBySdr.get(e.user_id) || 0;
    eventsBySdr.set(e.user_id, count + 1);
  });
  
  console.log(`📊 Eventos convertidos: ${converted.length} total`);
  eventsBySdr.forEach((count, sdrId) => {
    const sdrName = converted.find(e => e.user_id === sdrId)?.user_name || 'Sem nome';
    console.log(`   - SDR ${sdrId} (${sdrName}): ${count} eventos`);
  });
  
  return converted;
}

// ============================================
// Funções de Cálculo de Métricas
// ============================================

/**
 * Calcula métricas de jornada de atendimento para todos os SDRs
 */
export async function calculateAttendanceMetrics(filters?: {
  start_date?: string;
  end_date?: string;
  user_id?: string;
}): Promise<SdrDailyMetrics[]> {
  try {
    console.log(`🔍 [calculateAttendanceMetrics] Buscando eventos com filtros:`, filters);
    const events = await getAttendanceEvents({
      user_id: filters?.user_id,
      start_date: filters?.start_date,
      end_date: filters?.end_date,
    });

    console.log(`📥 [calculateAttendanceMetrics] Eventos encontrados: ${events.length}`);
    const flowEvents = convertToPipedriveFlowEvents(events);
    const metrics = calculateSdrAttendance(flowEvents);
    console.log(`✅ [calculateAttendanceMetrics] Métricas calculadas: ${metrics.length} registros`);
    return metrics;
  } catch (error) {
    console.error('❌ Erro ao calcular métricas:', error);
    return [];
  }
}

/**
 * Calcula métricas para um SDR específico
 */
export async function calculateAttendanceMetricsForSdr(
  sdrId: string,
  filters?: {
    start_date?: string;
    end_date?: string;
  }
): Promise<SdrDailyMetrics[]> {
  try {
    const events = await getAttendanceEvents({
      user_id: sdrId,
      start_date: filters?.start_date,
      end_date: filters?.end_date,
    });

    const flowEvents = convertToPipedriveFlowEvents(events);
    return calculateSdrAttendanceForSdr(flowEvents, sdrId);
  } catch (error) {
    console.error('❌ Erro ao calcular métricas do SDR:', error);
    return [];
  }
}

/**
 * Converte uma data em São Paulo para range UTC
 * São Paulo está UTC-3 (padrão) ou UTC-2 (horário de verão)
 * Para garantir que capturamos todo o dia, usamos um range que cobre ambos os casos
 */
function convertSaoPauloDateToUtcRange(dateStr: string): { start: string; end: string } {
  // São Paulo pode estar UTC-3 ou UTC-2
  // 00:00 SP = 03:00 UTC (UTC-3) ou 02:00 UTC (UTC-2)
  // 23:59 SP = 02:59 UTC do dia seguinte (UTC-3) ou 01:59 UTC do dia seguinte (UTC-2)
  // Para garantir, buscamos desde 01:00 UTC do dia até 06:00 UTC do dia seguinte
  const [year, month, day] = dateStr.split('-').map(Number);
  const startUTC = new Date(Date.UTC(year, month - 1, day, 1, 0, 0));
  const endUTC = new Date(Date.UTC(year, month - 1, day + 1, 6, 0, 0));
  
  return {
    start: startUTC.toISOString(),
    end: endUTC.toISOString(),
  };
}

/**
 * Calcula métricas para uma data específica
 */
export async function calculateAttendanceMetricsForDate(
  date: string, // YYYY-MM-DD (timezone São Paulo)
  filters?: {
    user_id?: string;
  }
): Promise<SdrDailyMetrics[]> {
  try {
    // Converter data de São Paulo para range UTC
    const { start, end } = convertSaoPauloDateToUtcRange(date);
    
    console.log(`📅 Buscando eventos para data ${date} (SP): ${start} até ${end} (UTC)`);

    const events = await getAttendanceEvents({
      user_id: filters?.user_id,
      start_date: start,
      end_date: end,
    });

    const flowEvents = convertToPipedriveFlowEvents(events);
    return calculateSdrAttendanceForDate(flowEvents, date);
  } catch (error) {
    console.error('❌ Erro ao calcular métricas da data:', error);
    return [];
  }
}

/**
 * Calcula métricas para um SDR em uma data específica
 */
export async function calculateAttendanceMetricsForSdrAndDate(
  sdrId: string,
  date: string // YYYY-MM-DD (timezone São Paulo)
): Promise<SdrDailyMetrics | null> {
  try {
    // Converter data de São Paulo para range UTC
    const { start, end } = convertSaoPauloDateToUtcRange(date);
    
    console.log(`📅 Buscando eventos para SDR ${sdrId} na data ${date} (SP): ${start} até ${end} (UTC)`);

    const events = await getAttendanceEvents({
      user_id: sdrId,
      start_date: start,
      end_date: end,
    });

    const flowEvents = convertToPipedriveFlowEvents(events);
    return calculateSdrAttendanceForSdrAndDate(flowEvents, sdrId, date);
  } catch (error) {
    console.error('❌ Erro ao calcular métricas do SDR e data:', error);
    return null;
  }
}

/**
 * Limpa eventos antigos (útil para manutenção)
 */
export async function cleanOldEvents(daysToKeep: number = 90): Promise<number> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    const cutoffISO = cutoffDate.toISOString();

    const { data, error } = await supabase
      .from('sdr_attendance_events')
      .delete()
      .lt('timestamp', cutoffISO)
      .select();

    if (error) {
      console.error('❌ Erro ao limpar eventos antigos:', error);
      throw new Error(`Erro ao limpar eventos: ${error.message}`);
    }

    const count = data?.length || 0;
    console.log(`🗑️ ${count} eventos antigos removidos (anteriores a ${cutoffISO})`);
    return count;
  } catch (error) {
    console.error('❌ Erro inesperado ao limpar eventos:', error);
    return 0;
  }
}

