/**
 * Módulo para calcular a Jornada de Atendimento dos SDRs
 * Baseado na movimentação de leads no Pipedrive
 * 
 * Este módulo processa eventos de atualização de etapa (stage_change)
 * e calcula os timestamps de primeira e última ação em cada turno do dia.
 */

// ============================================
// Interfaces e Tipos
// ============================================

/**
 * Evento de movimentação de lead no Pipedrive
 * Representa uma mudança de etapa (stage_change) realizada por um usuário
 */
export interface PipedriveFlowEvent {
  /** ID do usuário que realizou a ação (SDR) */
  user_id: number | string;
  
  /** Nome do usuário (opcional, para facilitar debug) */
  user_name?: string;
  
  /** Timestamp da ação em UTC (ISO 8601) */
  timestamp: string;
  
  /** ID do deal/lead que foi movimentado */
  deal_id: number | string;
  
  /** Tipo de evento (ex: 'stage_change', 'updated', etc.) */
  event_type?: string;
  
  /** Dados adicionais do evento (opcional) */
  metadata?: Record<string, unknown>;
}

/**
 * Métricas diárias de atendimento de um SDR
 */
export interface SdrDailyMetrics {
  /** ID do SDR */
  sdr_id: string;
  
  /** Nome do SDR (se disponível) */
  sdr_name?: string;
  
  /** Data no formato YYYY-MM-DD (timezone America/Sao_Paulo) */
  date: string;
  
  /** Turno da Manhã (06:00 às 12:00) */
  morning: {
    /** Timestamp da primeira ação do turno (ISO 8601 UTC) */
    first_action: string | null;
    
    /** Timestamp da última ação do turno (ISO 8601 UTC) */
    last_action: string | null;
    
    /** Total de ações realizadas no turno */
    action_count: number;
  };
  
  /** Turno da Tarde (13:00 às 18:00) */
  afternoon: {
    /** Timestamp da primeira ação do turno (ISO 8601 UTC) */
    first_action: string | null;
    
    /** Timestamp da última ação do turno (ISO 8601 UTC) */
    last_action: string | null;
    
    /** Total de ações realizadas no turno */
    action_count: number;
  };
  
  /** Total de ações do dia */
  total_actions: number;
}

/**
 * Resultado agregado por SDR e Data
 */
export type SdrAttendanceResult = SdrDailyMetrics[];

// ============================================
// Constantes e Configurações
// ============================================

const TIMEZONE_SP = 'America/Sao_Paulo';

// Horários dos turnos (em horário local de São Paulo)
const MORNING_START_HOUR = 6;
const MORNING_END_HOUR = 12;
const AFTERNOON_START_HOUR = 13;
const AFTERNOON_END_HOUR = 18;

// ============================================
// Funções Auxiliares de Data/Hora
// ============================================

/**
 * Converte um timestamp UTC para o timezone de São Paulo
 * Retorna um objeto Date ajustado para o timezone local
 * 
 * NOTA: Esta função não é mais usada diretamente, mas mantida para referência.
 * A conversão de timezone é feita através das funções extractDateInSaoPaulo
 * e extractHourInSaoPaulo que usam Intl.DateTimeFormat.
 */
function convertToSaoPauloTime(utcTimestamp: string): Date {
  // Esta função não é mais necessária, mas mantida para compatibilidade
  // A conversão é feita diretamente nas funções extractDateInSaoPaulo e extractHourInSaoPaulo
  return new Date(utcTimestamp);
}

/**
 * Extrai a data (YYYY-MM-DD) de um timestamp em timezone de São Paulo
 */
function extractDateInSaoPaulo(utcTimestamp: string): string {
  const date = new Date(utcTimestamp);
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIMEZONE_SP,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  
  return formatter.format(date); // Retorna YYYY-MM-DD
}

/**
 * Extrai a hora (0-23) de um timestamp em timezone de São Paulo
 */
function extractHourInSaoPaulo(utcTimestamp: string): number {
  const date = new Date(utcTimestamp);
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: TIMEZONE_SP,
    hour: '2-digit',
    hour12: false,
  });
  
  const hourStr = formatter.format(date);
  return parseInt(hourStr);
}

/**
 * Verifica se uma hora está no turno da manhã (06:00 às 12:00)
 */
function isMorningShift(hour: number): boolean {
  return hour >= MORNING_START_HOUR && hour <= MORNING_END_HOUR;
}

/**
 * Verifica se uma hora está no turno da tarde (13:00 às 18:00)
 */
function isAfternoonShift(hour: number): boolean {
  return hour >= AFTERNOON_START_HOUR && hour <= AFTERNOON_END_HOUR;
}

// ============================================
// Função Principal de Cálculo
// ============================================

/**
 * Calcula a jornada de atendimento dos SDRs baseada nos eventos de movimentação
 * 
 * @param events Lista de eventos de movimentação de leads do Pipedrive
 * @returns Array de métricas diárias agrupadas por SDR e Data
 * 
 * @example
 * ```typescript
 * const events: PipedriveFlowEvent[] = [
 *   {
 *     user_id: 123,
 *     user_name: 'João Silva',
 *     timestamp: '2024-01-15T08:30:00Z',
 *     deal_id: 456,
 *     event_type: 'stage_change'
 *   },
 *   // ... mais eventos
 * ];
 * 
 * const metrics = calculateSdrAttendance(events);
 * // Retorna: SdrDailyMetrics[]
 * ```
 */
export function calculateSdrAttendance(
  events: PipedriveFlowEvent[]
): SdrAttendanceResult {
  if (!events || events.length === 0) {
    return [];
  }

  // Map para agrupar por SDR e Data
  // Chave: "sdr_id|date" (ex: "123|2024-01-15")
  const metricsMap = new Map<string, SdrDailyMetrics>();

  // Processar cada evento
  for (const event of events) {
    // Validar evento
    if (!event.user_id || !event.timestamp) {
      console.warn('⚠️ Evento inválido ignorado:', event);
      continue;
    }

    const sdrId = String(event.user_id);
    const sdrName = event.user_name;
    
    // Extrair data e hora em timezone de São Paulo
    const date = extractDateInSaoPaulo(event.timestamp);
    const hour = extractHourInSaoPaulo(event.timestamp);
    
    // Chave única para o grupo (SDR + Data)
    const key = `${sdrId}|${date}`;
    
    // Obter ou criar métricas para este SDR nesta data
    let metrics = metricsMap.get(key);
    if (!metrics) {
      metrics = {
        sdr_id: sdrId,
        sdr_name: sdrName,
        date: date,
        morning: {
          first_action: null,
          last_action: null,
          action_count: 0,
        },
        afternoon: {
          first_action: null,
          last_action: null,
          action_count: 0,
        },
        total_actions: 0,
      };
      metricsMap.set(key, metrics);
    }

    // Classificar evento por turno
    if (isMorningShift(hour)) {
      // Turno da Manhã
      if (!metrics.morning.first_action) {
        metrics.morning.first_action = event.timestamp;
      } else {
        // Garantir que first_action seja sempre o menor timestamp
        const currentFirst = new Date(metrics.morning.first_action);
        const eventTime = new Date(event.timestamp);
        if (eventTime.getTime() < currentFirst.getTime()) {
          metrics.morning.first_action = event.timestamp;
        }
      }
      
      // Garantir que last_action seja sempre o maior timestamp
      if (!metrics.morning.last_action) {
        metrics.morning.last_action = event.timestamp;
      } else {
        const currentLast = new Date(metrics.morning.last_action);
        const eventTime = new Date(event.timestamp);
        if (eventTime.getTime() > currentLast.getTime()) {
          metrics.morning.last_action = event.timestamp;
        }
      }
      metrics.morning.action_count++;
    } else if (isAfternoonShift(hour)) {
      // Turno da Tarde
      if (!metrics.afternoon.first_action) {
        metrics.afternoon.first_action = event.timestamp;
      } else {
        // Garantir que first_action seja sempre o menor timestamp
        const currentFirst = new Date(metrics.afternoon.first_action);
        const eventTime = new Date(event.timestamp);
        if (eventTime.getTime() < currentFirst.getTime()) {
          metrics.afternoon.first_action = event.timestamp;
        }
      }
      
      // Garantir que last_action seja sempre o maior timestamp
      if (!metrics.afternoon.last_action) {
        metrics.afternoon.last_action = event.timestamp;
      } else {
        const currentLast = new Date(metrics.afternoon.last_action);
        const eventTime = new Date(event.timestamp);
        if (eventTime.getTime() > currentLast.getTime()) {
          metrics.afternoon.last_action = event.timestamp;
        }
      }
      metrics.afternoon.action_count++;
    }
    // Se não está em nenhum turno (fora de 06-12h e 13-18h), não contabiliza
    
    metrics.total_actions++;
  }

  // Converter Map para Array e ordenar por data e SDR
  const result: SdrDailyMetrics[] = Array.from(metricsMap.values())
    .sort((a, b) => {
      // Ordenar por data (mais recente primeiro), depois por SDR
      const dateCompare = b.date.localeCompare(a.date);
      if (dateCompare !== 0) return dateCompare;
      return (a.sdr_name || a.sdr_id).localeCompare(b.sdr_name || b.sdr_id);
    });

  return result;
}

/**
 * Calcula métricas para um SDR específico
 * 
 * @param events Lista de eventos
 * @param sdrId ID do SDR
 * @returns Array de métricas diárias apenas para o SDR especificado
 */
export function calculateSdrAttendanceForSdr(
  events: PipedriveFlowEvent[],
  sdrId: string | number
): SdrDailyMetrics[] {
  const filteredEvents = events.filter(e => String(e.user_id) === String(sdrId));
  return calculateSdrAttendance(filteredEvents);
}

/**
 * Calcula métricas para uma data específica
 * 
 * @param events Lista de eventos
 * @param date Data no formato YYYY-MM-DD (timezone São Paulo)
 * @returns Array de métricas apenas para a data especificada
 */
export function calculateSdrAttendanceForDate(
  events: PipedriveFlowEvent[],
  date: string
): SdrDailyMetrics[] {
  const allMetrics = calculateSdrAttendance(events);
  return allMetrics.filter(m => m.date === date);
}

/**
 * Calcula métricas para um SDR em uma data específica
 * 
 * @param events Lista de eventos
 * @param sdrId ID do SDR
 * @param date Data no formato YYYY-MM-DD (timezone São Paulo)
 * @returns Métricas do SDR na data especificada, ou null se não houver dados
 */
export function calculateSdrAttendanceForSdrAndDate(
  events: PipedriveFlowEvent[],
  sdrId: string | number,
  date: string
): SdrDailyMetrics | null {
  const metrics = calculateSdrAttendanceForSdr(events, sdrId);
  return metrics.find(m => m.date === date) || null;
}

// ============================================
// Funções de Utilidade para Formatação
// ============================================

/**
 * Formata um timestamp UTC para exibição em horário de São Paulo
 * 
 * @param utcTimestamp Timestamp em UTC (ISO 8601)
 * @param includeSeconds Se deve incluir segundos na formatação
 * @returns String formatada (ex: "15/01/2024 08:30" ou "15/01/2024 08:30:45")
 */
export function formatTimestampToSaoPaulo(
  utcTimestamp: string,
  includeSeconds: boolean = false
): string {
  if (!utcTimestamp) return 'N/A';
  
  const date = new Date(utcTimestamp);
  const formatter = new Intl.DateTimeFormat('pt-BR', {
    timeZone: TIMEZONE_SP,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: includeSeconds ? '2-digit' : undefined,
    hour12: false,
  });
  
  return formatter.format(date);
}

/**
 * Calcula a duração do turno em minutos
 * 
 * @param firstAction Timestamp da primeira ação (ISO 8601 UTC)
 * @param lastAction Timestamp da última ação (ISO 8601 UTC)
 * @returns Duração em minutos, ou null se algum timestamp for inválido
 */
export function calculateShiftDuration(
  firstAction: string | null,
  lastAction: string | null
): number | null {
  if (!firstAction || !lastAction) return null;
  
  const first = new Date(firstAction);
  const last = new Date(lastAction);
  
  if (isNaN(first.getTime()) || isNaN(last.getTime())) return null;
  
  const diffMs = last.getTime() - first.getTime();
  return Math.round(diffMs / 60000); // Converter para minutos
}

