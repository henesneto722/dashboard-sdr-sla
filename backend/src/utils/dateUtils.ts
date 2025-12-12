/**
 * Funções utilitárias para manipulação de datas e cálculos de SLA
 */

/**
 * Calcula a diferença em minutos entre duas datas
 * @param startDate - Data inicial (entrada do lead)
 * @param endDate - Data final (atendimento do lead)
 * @returns Diferença em minutos (arredondado)
 */
export function calculateMinutesDiff(startDate: string | Date, endDate: string | Date): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const diffMs = end.getTime() - start.getTime();
  const diffMinutes = Math.round(diffMs / (1000 * 60));
  
  return Math.max(0, diffMinutes); // Garantir que não seja negativo
}

/**
 * Retorna a data de 30 dias atrás em formato ISO
 * @returns Data ISO string
 */
export function getThirtyDaysAgo(): string {
  const date = new Date();
  date.setDate(date.getDate() - 30);
  date.setHours(0, 0, 0, 0);
  return date.toISOString();
}

/**
 * Retorna o início do dia atual em formato ISO
 * @returns Data ISO string
 */
export function getTodayStart(): string {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date.toISOString();
}

/**
 * Retorna o início do mês atual em formato ISO
 * @returns Data ISO string (1º dia do mês atual às 00:00:00)
 */
export function getMonthStart(): string {
  const date = new Date();
  date.setDate(1); // Primeiro dia do mês
  date.setHours(0, 0, 0, 0);
  return date.toISOString();
}

/**
 * Retorna a data de X dias atrás em formato ISO
 * @param days - Número de dias
 * @returns Data ISO string
 */
export function getDaysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(0, 0, 0, 0);
  return date.toISOString();
}

/**
 * Converte período string para data inicial
 * @param period - Período ('today', '7days', '15days', '30days', 'all')
 * @returns Data ISO string ou null para 'all'
 */
export function periodToDate(period: string): string | null {
  switch (period) {
    case 'today':
      return getTodayStart();
    case '7days':
      return getDaysAgo(7);
    case '15days':
      return getDaysAgo(15);
    case '30days':
      return getThirtyDaysAgo();
    case 'all':
    default:
      return null;
  }
}

/**
 * Formata faixa horária
 * @param hour - Hora (0-23)
 * @returns String formatada (ex: "08h–09h")
 */
export function formatHourRange(hour: number): string {
  const startHour = hour.toString().padStart(2, '0');
  const endHour = ((hour + 1) % 24).toString().padStart(2, '0');
  return `${startHour}h–${endHour}h`;
}

/**
 * Determina o status com base no SLA médio
 * @param avgMinutes - Média de minutos
 * @returns Status ('Bom', 'Moderado', 'Crítico')
 */
export function getSLAStatus(avgMinutes: number): 'Bom' | 'Moderado' | 'Crítico' {
  if (avgMinutes < 15) return 'Bom';
  if (avgMinutes < 20) return 'Moderado';
  return 'Crítico';
}

/**
 * Verifica se uma data está dentro dos últimos N dias
 * @param date - Data a verificar
 * @param days - Número de dias
 * @returns boolean
 */
export function isWithinDays(date: string | Date, days: number): boolean {
  const checkDate = new Date(date);
  const limitDate = new Date();
  limitDate.setDate(limitDate.getDate() - days);
  return checkDate >= limitDate;
}





