/**
 * EXEMPLO DE USO DO MÓDULO SdrAttendanceCalculator
 * 
 * Este arquivo demonstra como integrar o módulo de cálculo de jornada
 * de atendimento no sistema existente.
 * 
 * ⚠️ ATENÇÃO: Este é apenas um arquivo de exemplo/documentação.
 * Não importe este arquivo diretamente no código de produção.
 */

import { 
  calculateSdrAttendance,
  calculateSdrAttendanceForSdr,
  calculateSdrAttendanceForDate,
  calculateSdrAttendanceForSdrAndDate,
  formatTimestampToSaoPaulo,
  calculateShiftDuration,
  type PipedriveFlowEvent,
  type SdrDailyMetrics
} from './SdrAttendanceCalculator.js';

// ============================================
// EXEMPLO 1: Uso Básico com Dados Simulados
// ============================================

/**
 * Exemplo básico de como usar o calculador com eventos simulados
 */
export function exemploBasico() {
  // Simular eventos de movimentação de leads
  const eventos: PipedriveFlowEvent[] = [
    {
      user_id: 123,
      user_name: 'João Silva',
      timestamp: '2024-01-15T11:00:00Z', // 08:00 em SP (manhã)
      deal_id: 456,
      event_type: 'stage_change'
    },
    {
      user_id: 123,
      user_name: 'João Silva',
      timestamp: '2024-01-15T14:30:00Z', // 11:30 em SP (manhã - última)
      deal_id: 789,
      event_type: 'stage_change'
    },
    {
      user_id: 123,
      user_name: 'João Silva',
      timestamp: '2024-01-15T16:00:00Z', // 13:00 em SP (tarde - primeira)
      deal_id: 101,
      event_type: 'stage_change'
    },
    {
      user_id: 123,
      user_name: 'João Silva',
      timestamp: '2024-01-15T21:00:00Z', // 18:00 em SP (tarde - última)
      deal_id: 202,
      event_type: 'stage_change'
    },
    {
      user_id: 456,
      user_name: 'Maria Santos',
      timestamp: '2024-01-15T13:00:00Z', // 10:00 em SP (manhã)
      deal_id: 303,
      event_type: 'stage_change'
    },
  ];

  // Calcular métricas
  const metricas = calculateSdrAttendance(eventos);

  console.log('📊 Métricas calculadas:', JSON.stringify(metricas, null, 2));

  return metricas;
}

// ============================================
// EXEMPLO 2: Integração com Handler de Webhook
// ============================================

/**
 * Exemplo de como integrar no handler de webhook do Pipedrive
 * 
 * Este exemplo mostra como você poderia acumular eventos e calcular
 * métricas periodicamente ou sob demanda.
 */
export class SdrAttendanceTracker {
  private eventos: PipedriveFlowEvent[] = [];

  /**
   * Adiciona um evento quando um deal é atualizado
   */
  adicionarEvento(
    userId: number | string,
    userName: string | undefined,
    timestamp: string,
    dealId: number | string
  ): void {
    const evento: PipedriveFlowEvent = {
      user_id: userId,
      user_name: userName,
      timestamp: timestamp,
      deal_id: dealId,
      event_type: 'stage_change',
    };

    this.eventos.push(evento);
  }

  /**
   * Calcula métricas para todos os SDRs
   */
  calcularMetricasGerais(): SdrDailyMetrics[] {
    return calculateSdrAttendance(this.eventos);
  }

  /**
   * Calcula métricas para um SDR específico
   */
  calcularMetricasPorSdr(sdrId: string | number): SdrDailyMetrics[] {
    return calculateSdrAttendanceForSdr(this.eventos, sdrId);
  }

  /**
   * Limpa eventos antigos (ex: mais de 30 dias)
   */
  limparEventosAntigos(dias: number = 30): void {
    const limite = new Date();
    limite.setDate(limite.getDate() - dias);
    
    this.eventos = this.eventos.filter(evento => {
      const eventDate = new Date(evento.timestamp);
      return eventDate >= limite;
    });
  }
}

// Exemplo de uso do tracker:
export function exemploComTracker() {
  const tracker = new SdrAttendanceTracker();

  // Simular eventos sendo adicionados ao longo do dia
  tracker.adicionarEvento(123, 'João Silva', '2024-01-15T11:00:00Z', 456);
  tracker.adicionarEvento(123, 'João Silva', '2024-01-15T16:00:00Z', 789);
  tracker.adicionarEvento(456, 'Maria Santos', '2024-01-15T13:00:00Z', 101);

  // Calcular métricas
  const metricas = tracker.calcularMetricasGerais();
  console.log('📊 Métricas do tracker:', metricas);

  return metricas;
}

// ============================================
// EXEMPLO 3: Integração com Endpoint de API
// ============================================

/**
 * Exemplo de como criar um endpoint de API para expor as métricas
 * 
 * Este código pode ser adicionado em src/routes/metricsRoutes.ts
 */
export function exemploEndpointAPI() {
  // Código que você adicionaria em metricsRoutes.ts:
  /*
  
  import { calculateSdrAttendance, PipedriveFlowEvent } from '../modules/SdrAttendanceCalculator.js';
  
  // Endpoint para buscar jornada de atendimento
  router.get('/sdr-attendance', async (req: Request, res: Response) => {
    try {
      const { sdr_id, date } = req.query;
      
      // Buscar eventos do banco de dados ou API do Pipedrive
      // Assumindo que você tem uma função para buscar histórico
      const eventos: PipedriveFlowEvent[] = await buscarEventosPipedrive();
      
      let metricas;
      
      if (sdr_id && date) {
        // Filtrar por SDR e data específicos
        metricas = calculateSdrAttendanceForSdrAndDate(
          eventos,
          sdr_id as string,
          date as string
        );
        
        if (!metricas) {
          return res.status(404).json({
            success: false,
            error: 'Nenhuma métrica encontrada para o SDR e data especificados',
          });
        }
        
        return res.json({
          success: true,
          data: metricas,
          timestamp: new Date().toISOString(),
        });
      }
      
      if (sdr_id) {
        // Filtrar apenas por SDR
        metricas = calculateSdrAttendanceForSdr(eventos, sdr_id as string);
      } else if (date) {
        // Filtrar apenas por data
        metricas = calculateSdrAttendanceForDate(eventos, date as string);
      } else {
        // Retornar todas as métricas
        metricas = calculateSdrAttendance(eventos);
      }
      
      res.json({
        success: true,
        data: metricas,
        count: Array.isArray(metricas) ? metricas.length : 1,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Erro ao buscar jornada de atendimento:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        timestamp: new Date().toISOString(),
      });
    }
  });
  
  */
}

// ============================================
// EXEMPLO 4: Formatação e Cálculos Auxiliares
// ============================================

/**
 * Exemplo de como usar funções auxiliares de formatação
 */
export function exemploFormatacao() {
  const timestamp = '2024-01-15T14:00:00Z';
  
  // Formatar timestamp para exibição
  const formatado = formatTimestampToSaoPaulo(timestamp);
  console.log('Timestamp formatado:', formatado);
  // Output: "15/01/2024 11:00"
  
  // Calcular duração de um turno
  const primeiraAcao = '2024-01-15T14:00:00Z';
  const ultimaAcao = '2024-01-15T21:00:00Z';
  
  const duracaoMinutos = calculateShiftDuration(primeiraAcao, ultimaAcao);
  console.log('Duração do turno:', duracaoMinutos, 'minutos');
  // Output: 420 minutos = 7 horas
  
  return { formatado, duracaoMinutos };
}

// ============================================
// EXEMPLO 5: Integração com Dados do Banco
// ============================================

/**
 * Exemplo de como buscar eventos do banco de dados e calcular métricas
 * 
 * Este exemplo assume que você tem uma tabela ou função que retorna
 * histórico de movimentações de leads.
 */
export async function exemploComBancoDeDados() {
  // Código que você adicionaria em um service:
  /*
  
  import { supabase } from '../config/database.js';
  import { calculateSdrAttendance, PipedriveFlowEvent } from '../modules/SdrAttendanceCalculator.js';
  
  export async function buscarJornadaAtendimento(
    sdrId?: string,
    data?: string
  ): Promise<SdrDailyMetrics[]> {
    // Buscar histórico de movimentações do banco
    // Assumindo que você tem uma tabela 'lead_movements' ou similar
    let query = supabase
      .from('lead_movements')
      .select('user_id, user_name, timestamp, deal_id, event_type')
      .order('timestamp', { ascending: true });
    
    if (sdrId) {
      query = query.eq('user_id', sdrId);
    }
    
    if (data) {
      // Filtrar por data (ajustar conforme necessário)
      const inicioDia = new Date(data);
      inicioDia.setHours(0, 0, 0, 0);
      const fimDia = new Date(data);
      fimDia.setHours(23, 59, 59, 999);
      
      query = query
        .gte('timestamp', inicioDia.toISOString())
        .lte('timestamp', fimDia.toISOString());
    }
    
    const { data: movimentos, error } = await query;
    
    if (error) {
      throw new Error(`Erro ao buscar movimentações: ${error.message}`);
    }
    
    // Converter para formato esperado pelo calculador
    const eventos: PipedriveFlowEvent[] = (movimentos || []).map(mov => ({
      user_id: mov.user_id,
      user_name: mov.user_name,
      timestamp: mov.timestamp,
      deal_id: mov.deal_id,
      event_type: mov.event_type || 'stage_change',
    }));
    
    // Calcular métricas
    return calculateSdrAttendance(eventos);
  }
  
  */
}


