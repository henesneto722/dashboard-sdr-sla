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
 * Busca leads importantes pendentes (Tem perfil ou Perfil menor, não atendidos)
 */
export async function fetchImportantPendingLeads(): Promise<{ count: number; leads: Lead[] }> {
  const response = await fetch(`${API_BASE_URL}/api/leads/important-pending`);
  const json: ApiResponse<{ count: number; leads: Lead[] }> = await response.json();
  return json.data;
}

