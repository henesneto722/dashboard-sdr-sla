/**
 * Rotas de métricas para o Dashboard
 */

import { Router, Request, Response } from 'express';
import { 
  getGeneralMetrics, 
  getSDRRanking, 
  getTimelineData,
  getHourlyPerformance,
  getDailyAverage
} from '../services/leadsService.js';
import {
  calculateAttendanceMetrics,
  calculateAttendanceMetricsForSdr,
  calculateAttendanceMetricsForDate,
  calculateAttendanceMetricsForSdrAndDate,
} from '../services/sdrAttendanceService.js';
import { ApiResponse, GeneralMetrics, SDRPerformance, HourlyPerformance, DailyAverage, SdrDailyMetrics } from '../types/index.js';

const router = Router();

/**
 * GET /api/metrics/general
 * Retorna métricas gerais da operação (últimos 30 dias)
 */
router.get('/general', async (req: Request, res: Response) => {
  try {
    const metrics = await getGeneralMetrics();
    
    const response: ApiResponse<GeneralMetrics> = {
      success: true,
      data: metrics,
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error) {
    console.error('Erro em /metrics/general:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar métricas gerais',
      message: error instanceof Error ? error.message : 'Erro desconhecido',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /api/metrics/ranking
 * Retorna ranking de SDRs ordenado por menor tempo médio de SLA
 */
router.get('/ranking', async (req: Request, res: Response) => {
  try {
    const ranking = await getSDRRanking();
    
    const response: ApiResponse<SDRPerformance[]> = {
      success: true,
      data: ranking,
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error) {
    console.error('Erro em /metrics/ranking:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar ranking',
      message: error instanceof Error ? error.message : 'Erro desconhecido',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /api/metrics/timeline
 * Retorna dados para gráfico de linha do tempo de atendimentos
 */
router.get('/timeline', async (req: Request, res: Response) => {
  try {
    const timeline = await getTimelineData();
    
    const response: ApiResponse<{ date: string; average: number; count: number }[]> = {
      success: true,
      data: timeline,
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error) {
    console.error('Erro em /metrics/timeline:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar timeline',
      message: error instanceof Error ? error.message : 'Erro desconhecido',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /api/metrics/hourly-performance
 * Retorna análise de desempenho por faixa horária
 */
router.get('/hourly-performance', async (req: Request, res: Response) => {
  try {
    const hourlyData = await getHourlyPerformance();
    
    const response: ApiResponse<HourlyPerformance[]> = {
      success: true,
      data: hourlyData,
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error) {
    console.error('Erro em /metrics/hourly-performance:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar performance por hora',
      message: error instanceof Error ? error.message : 'Erro desconhecido',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /api/metrics/sdr-attendance
 * Retorna jornada de atendimento dos SDRs
 * Query params: sdr_id (opcional), date (opcional, formato YYYY-MM-DD), start_date, end_date
 * 
 * IMPORTANTE: Registra eventos APENAS quando um lead é movido do pipeline principal "SDR"
 * para um pipeline individual "NOME - SDR" (pendente → atendido)
 */
router.get('/sdr-attendance', async (req: Request, res: Response) => {
  console.log('📥 [ROTA] GET /api/metrics/sdr-attendance - Requisição recebida');
  try {
    const { sdr_id, date, start_date, end_date } = req.query;

    let metrics: SdrDailyMetrics[] | SdrDailyMetrics | null;

    if (sdr_id && date) {
      // Buscar métricas para um SDR específico em uma data específica
      console.log(`🔍 Buscando métricas para SDR ${sdr_id} na data ${date}`);
      metrics = await calculateAttendanceMetricsForSdrAndDate(
        sdr_id as string,
        date as string
      );

      if (!metrics) {
        return res.status(404).json({
          success: false,
          error: 'Nenhuma métrica encontrada para o SDR e data especificados',
          timestamp: new Date().toISOString(),
        });
      }

      const response: ApiResponse<SdrDailyMetrics> = {
        success: true,
        data: metrics,
        timestamp: new Date().toISOString(),
      };

      console.log(`✅ Métricas retornadas com sucesso para SDR ${sdr_id} na data ${date}`);
      return res.json(response);
    }

    if (sdr_id) {
      // Buscar métricas para um SDR específico
      console.log(`🔍 Buscando métricas para SDR ${sdr_id}`);
      metrics = await calculateAttendanceMetricsForSdr(sdr_id as string, {
        start_date: start_date as string,
        end_date: end_date as string,
      });
    } else if (date) {
      // Buscar métricas para uma data específica
      console.log(`🔍 Buscando métricas para data ${date}`);
      metrics = await calculateAttendanceMetricsForDate(date as string);
    } else {
      // Buscar todas as métricas
      console.log('🔍 Buscando todas as métricas de jornada');
      metrics = await calculateAttendanceMetrics({
        start_date: start_date as string,
        end_date: end_date as string,
      });
    }

    const response: ApiResponse<SdrDailyMetrics[]> = {
      success: true,
      data: Array.isArray(metrics) ? metrics : metrics ? [metrics] : [],
      timestamp: new Date().toISOString(),
    };

    console.log(`✅ Métricas retornadas com sucesso: ${Array.isArray(metrics) ? metrics.length : metrics ? 1 : 0} registros`);
    res.json(response);
  } catch (error) {
    console.error('❌ [ROTA] Erro em /metrics/sdr-attendance:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar jornada de atendimento',
      message: error instanceof Error ? error.message : 'Erro desconhecido',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /api/metrics/daily-average
 * Retorna tempo médio por dia dos últimos 7 dias (janela deslizante)
 */
router.get('/daily-average', async (req: Request, res: Response) => {
  console.log('\n📥 [ROTA] GET /api/metrics/daily-average - Requisição recebida');
  
  try {
    const dailyData = await getDailyAverage();
    
    console.log(`✅ [ROTA] Dados retornados com sucesso: ${dailyData.length} dias`);
    
    const response: ApiResponse<DailyAverage[]> = {
      success: true,
      data: dailyData,
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error) {
    console.error('\n❌ [ROTA] Erro em /metrics/daily-average:');
    console.error('   Tipo:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('   Mensagem:', error instanceof Error ? error.message : String(error));
    
    if (error instanceof Error) {
      console.error('   Stack:', error.stack);
      
      // Verificar tipo específico de erro
      if (error.message.includes('fetch failed')) {
        console.error('   🔴 ERRO DE CONEXÃO: Não foi possível conectar ao Supabase');
      } else if (error.message.includes('Invalid API key')) {
        console.error('   🔴 ERRO DE AUTENTICAÇÃO: Chave API inválida');
      } else if (error.message.includes('relation') && error.message.includes('does not exist')) {
        console.error('   🔴 ERRO DE TABELA: Tabela não existe no banco de dados');
      }
    }
    
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar média diária',
      message: error instanceof Error ? error.message : 'Erro desconhecido',
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;





