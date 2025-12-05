/**
 * Tipos e interfaces para o sistema de monitoramento de SLA
 */

// ============================================
// Tipos do Banco de Dados (Supabase)
// ============================================

export interface LeadSLA {
  id: string;
  lead_id: string;
  lead_name: string;
  sdr_id: string | null;
  sdr_name: string | null;
  entered_at: string;
  attended_at: string | null;
  sla_minutes: number | null;
  source: string;
  pipeline: string;
  stage_name: string | null;
  stage_priority: number | null;
  created_at: string;
  updated_at: string;
}

export interface LeadSLAInsert {
  lead_id: string;
  lead_name: string;
  entered_at: string;
  source?: string;
  pipeline?: string;
  sdr_id?: string;
  sdr_name?: string;
  stage_name?: string;
  stage_priority?: number;
  attended_at?: string;
  sla_minutes?: number;
}

export interface LeadSLAUpdate {
  sdr_id?: string;
  sdr_name?: string;
  attended_at?: string;
  sla_minutes?: number;
  stage_name?: string;
  stage_priority?: number;
}

// ============================================
// Tipos para API Responses
// ============================================

export interface SDRPerformance {
  sdr_id: string;
  sdr_name: string;
  average_time: number;
  leads_attended: number;
}

export interface GeneralMetrics {
  total_leads: number;
  attended_leads: number;
  pending_leads: number;
  avg_sla_minutes: number;
  max_sla_minutes: number;
  min_sla_minutes: number;
}

export interface HourlyPerformance {
  hour: number;
  label: string;
  avg_sla: number;
  count: number;
  status: 'Bom' | 'Moderado' | 'Crítico';
}

export interface TimelineData {
  date: string;
  leads: LeadSLA[];
}

// ============================================
// Tipos do Pipedrive Webhook
// ============================================

export interface PipedriveWebhookPayload {
  v: number;
  matches_filters: { current: unknown[] };
  meta: {
    action: 'added' | 'updated' | 'deleted' | 'merged';
    change_source: string;
    company_id: number;
    host: string;
    id: number;
    is_bulk_update: boolean;
    matches_filters: { current: unknown[] };
    object: string;
    permitted_user_ids: number[];
    pipedrive_service_name: string;
    timestamp: number;
    timestamp_micro: number;
    trans_pending: boolean;
    user_id: number;
    v: number;
    webhook_id: string;
  };
  current: PipedriveDeal | null;
  previous: PipedriveDeal | null;
  event: string;
  retry: number;
}

export interface PipedriveDeal {
  id: number;
  title: string;
  person_id: number | null;
  person_name: string | null;
  org_id: number | null;
  org_name: string | null;
  user_id: number;
  stage_id: number;
  pipeline_id: number;
  status: string;
  add_time: string;
  update_time: string;
  stage_change_time: string | null;
  owner_name: string;
  [key: string]: unknown;
}

// ============================================
// Tipos de Resposta da API
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

export interface ApiError {
  success: false;
  error: string;
  message: string;
  timestamp: string;
}

// ============================================
// Filtros de Query
// ============================================

export interface LeadsQueryFilters {
  period?: 'today' | '7days' | '15days' | '30days' | 'all';
  sdr_id?: string;
  limit?: number;
  offset?: number;
  page?: number;
}

// ============================================
// Resposta Paginada
// ============================================

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// ============================================
// Cache de Métricas
// ============================================

export interface CachedMetrics {
  data: GeneralMetrics;
  cachedAt: number;
  expiresAt: number;
}



