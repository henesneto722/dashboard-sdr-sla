/**
 * Função utilitária para exportar dados do dashboard para Excel
 */

import * as XLSX from 'xlsx';
import { Lead, SDRPerformance } from './mockData';

/**
 * Formata uma data para exibição em português
 */
function formatDate(dateString: string | null): string {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Formata tempo em minutos para formato legível
 */
function formatTime(minutes: number | null): string {
  if (minutes === null) return '-';
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
}

/**
 * Exporta dados do dashboard para Excel
 * @param leads - Lista de leads para exportar
 * @param ranking - Lista de ranking de SDRs
 * @param metrics - Métricas gerais (opcional)
 */
export function exportToExcel(
  leads: Lead[],
  ranking: SDRPerformance[],
  metrics?: {
    averageTime: number;
    worstTime: number;
    todayLeads: number;
    pendingCount: number;
  }
): void {
  // Criar workbook
  const wb = XLSX.utils.book_new();

  // ============================================
  // Aba 1: Leads
  // ============================================
  const leadsData = [
    [
      'Lead',
      'Closer',
      'Etapa',
      'Tempo (min)',
      'Data Entrada',
      'Data Atendimento',
      'Status',
      'Pipeline',
      'Fonte',
    ],
    ...leads.map((lead) => [
      lead.lead_name || '-',
      lead.sdr_name || '-',
      lead.stage_name || '-',
      lead.sla_minutes !== null ? lead.sla_minutes : '-',
      formatDate(lead.entered_at),
      formatDate(lead.attended_at),
      lead.status || '-',
      lead.pipeline || '-',
      lead.source || '-',
    ]),
  ];

  const wsLeads = XLSX.utils.aoa_to_sheet(leadsData);
  
  // Ajustar largura das colunas
  wsLeads['!cols'] = [
    { wch: 30 }, // Lead
    { wch: 20 }, // Closer
    { wch: 25 }, // Etapa
    { wch: 15 }, // Tempo
    { wch: 20 }, // Data Entrada
    { wch: 20 }, // Data Atendimento
    { wch: 12 }, // Status
    { wch: 15 }, // Pipeline
    { wch: 15 }, // Fonte
  ];

  XLSX.utils.book_append_sheet(wb, wsLeads, 'Leads');

  // ============================================
  // Aba 2: Ranking de SDRs
  // ============================================
  const rankingData = [
    ['Posição', 'Closer', 'Tempo Médio', 'Leads Atendidos', 'Score de Performance'],
    ...ranking.map((sdr, index) => [
      index + 1,
      sdr.sdr_name || '-',
      formatTime(sdr.average_time),
      sdr.leads_attended,
      sdr.performance_score ? sdr.performance_score.toFixed(2) : '-',
    ]),
  ];

  const wsRanking = XLSX.utils.aoa_to_sheet(rankingData);
  
  // Ajustar largura das colunas
  wsRanking['!cols'] = [
    { wch: 10 }, // Posição
    { wch: 25 }, // Closer
    { wch: 15 }, // Tempo Médio
    { wch: 18 }, // Leads Atendidos
    { wch: 20 }, // Score
  ];

  XLSX.utils.book_append_sheet(wb, wsRanking, 'Ranking');

  // ============================================
  // Aba 3: Métricas (se fornecidas)
  // ============================================
  if (metrics) {
    const metricsData = [
      ['Métrica', 'Valor'],
      ['Tempo Médio', formatTime(metrics.averageTime)],
      ['Pior Tempo', formatTime(metrics.worstTime)],
      ['Atendidos Hoje', metrics.todayLeads],
      ['Leads Pendentes', metrics.pendingCount],
      ['Total de Leads', leads.length],
      ['Leads Atendidos', leads.filter(l => l.sla_minutes !== null).length],
    ];

    const wsMetrics = XLSX.utils.aoa_to_sheet(metricsData);
    
    // Ajustar largura das colunas
    wsMetrics['!cols'] = [
      { wch: 20 }, // Métrica
      { wch: 20 }, // Valor
    ];

    XLSX.utils.book_append_sheet(wb, wsMetrics, 'Métricas');
  }

  // ============================================
  // Gerar nome do arquivo com data
  // ============================================
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
  const fileName = `dashboard-leads-${dateStr}.xlsx`;

  // Fazer download
  XLSX.writeFile(wb, fileName);
}
