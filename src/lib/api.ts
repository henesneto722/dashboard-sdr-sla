/**
 * Serviço de API para comunicação com o Backend
 */

import { Lead, SDRPerformance } from './mockData';

// URL base da API (configurável via variável de ambiente)
// Em desenvolvimento, usa localhost:3001 por padrão
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.DEV ? 'http://localhost:3001' : 'https://lead-speed-monitor.onrender.com');

/**
 * Interface de resposta padrão da API
 */
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

/**
 * Busca métricas gerais
 */
export async function fetchGeneralMetrics() {
  const response = await fetch(`${API_BASE_URL}/api/metrics/general`);
  const json: ApiResponse<{
    total_leads: number;
    attended_leads: number;
    pending_leads: number;
    avg_sla_minutes: number;
    max_sla_minutes: number;
    min_sla_minutes: number;
  }> = await response.json();
  return json.data;
}

/**
 * Busca ranking de SDRs
 */
export async function fetchSDRRanking(): Promise<SDRPerformance[]> {
  const response = await fetch(`${API_BASE_URL}/api/metrics/ranking`);
  const json: ApiResponse<SDRPerformance[]> = await response.json();
  return json.data;
}

/**
 * Busca TODOS os leads do mês atual (sem limite) para filtragem client-side
 */
export async function fetchAllMonthLeads(): Promise<Lead[]> {
  const response = await fetch(`${API_BASE_URL}/api/leads/monthly`);
  const json: ApiResponse<Lead[]> = await response.json();
  return json.data;
}

/**
 * Busca dados de timeline
 */
export async function fetchTimeline() {
  const response = await fetch(`${API_BASE_URL}/api/metrics/timeline`);
  const json: ApiResponse<{ date: string; average: number; count: number }[]> = await response.json();
  return json.data;
}

/**
 * Busca performance por hora
 */
export async function fetchHourlyPerformance() {
  const response = await fetch(`${API_BASE_URL}/api/metrics/hourly-performance`);
  const json: ApiResponse<{
    hour: number;
    label: string;
    avg_sla: number;
    count: number;
    status: string;
  }[]> = await response.json();
  return json.data;
}

/**
 * Busca tempo médio por dia (últimos 7 dias)
 */
export async function fetchDailyAverage() {
  const response = await fetch(`${API_BASE_URL}/api/metrics/daily-average`);
  const json: ApiResponse<{
    date: string;
    avg_sla: number;
  }[]> = await response.json();
  return json.data;
}

/**
 * Busca leads com filtros
 */
export async function fetchLeads(filters?: {
  period?: string;
  sdr_id?: string;
  limit?: number;
}): Promise<Lead[]> {
  const params = new URLSearchParams();
  if (filters?.period) params.append('period', filters.period);
  if (filters?.sdr_id) params.append('sdr_id', filters.sdr_id);
  if (filters?.limit) params.append('limit', filters.limit.toString());
  
  const response = await fetch(`${API_BASE_URL}/api/leads/detail?${params}`);
  const json: ApiResponse<Lead[]> = await response.json();
  return json.data;
}

/**
 * Busca leads pendentes
 */
export async function fetchPendingLeads(limit: number = 50): Promise<Lead[]> {
  const response = await fetch(`${API_BASE_URL}/api/leads/pending?limit=${limit}`);
  const json: ApiResponse<Lead[]> = await response.json();
  return json.data;
}

/**
 * Busca leads mais lentos
 */
export async function fetchSlowestLeads(limit: number = 20): Promise<Lead[]> {
  const response = await fetch(`${API_BASE_URL}/api/leads/slowest?limit=${limit}`);
  const json: ApiResponse<Lead[]> = await response.json();
  return json.data;
}

/**
 * Busca lista de SDRs
 */
export async function fetchSDRs(): Promise<{ sdr_id: string; sdr_name: string }[]> {
  const response = await fetch(`${API_BASE_URL}/api/leads/sdrs`);
  const json: ApiResponse<{ sdr_id: string; sdr_name: string }[]> = await response.json();
  return json.data;
}

/**
 * Busca TODOS os leads pendentes (sem limite e sem filtro de data)
 */
export async function fetchAllPendingLeads(): Promise<{ count: number; leads: Lead[] }> {
  const response = await fetch(`${API_BASE_URL}/api/leads/all-pending`);
  const json: ApiResponse<{ count: number; leads: Lead[] }> = await response.json();
  return json.data;
}

/**
 * Busca leads importantes pendentes (Tem perfil ou Perfil menor, não atendidos)
 */
export async function fetchImportantPendingLeads(): Promise<{ count: number; leads: Lead[] }> {
  const response = await fetch(`${API_BASE_URL}/api/leads/important-pending`);
  const json: ApiResponse<{ count: number; leads: Lead[] }> = await response.json();
  return json.data;
}

/**
 * Busca leads atendidos hoje (independente de quando foram criados)
 */
export async function fetchTodayAttendedLeads(): Promise<Lead[]> {
  const response = await fetch(`${API_BASE_URL}/api/leads/today-attended`);
  const json: ApiResponse<Lead[]> = await response.json();
  return json.data;
}

/**
 * Interface para métricas de jornada de atendimento dos SDRs
 */
export interface SdrDailyMetrics {
  sdr_id: string;
  sdr_name?: string;
  date: string; // YYYY-MM-DD
  morning: {
    first_action: string | null; // ISO 8601 UTC
    last_action: string | null; // ISO 8601 UTC
    action_count: number;
  };
  afternoon: {
    first_action: string | null; // ISO 8601 UTC
    last_action: string | null; // ISO 8601 UTC
    action_count: number;
  };
  total_actions: number;
}

/**
 * Busca jornada de atendimento dos SDRs
 */
export async function fetchSdrAttendance(filters?: {
  sdr_id?: string;
  date?: string;
  start_date?: string;
  end_date?: string;
}): Promise<SdrDailyMetrics[]> {
  const params = new URLSearchParams();
  if (filters?.sdr_id) params.append('sdr_id', filters.sdr_id);
  if (filters?.date) params.append('date', filters.date);
  if (filters?.start_date) params.append('start_date', filters.start_date);
  if (filters?.end_date) params.append('end_date', filters.end_date);

  const url = `${API_BASE_URL}/api/metrics/sdr-attendance${params.toString() ? `?${params.toString()}` : ''}`;
  const response = await fetch(url);
  const json: ApiResponse<SdrDailyMetrics[]> = await response.json();
  return json.data;
}