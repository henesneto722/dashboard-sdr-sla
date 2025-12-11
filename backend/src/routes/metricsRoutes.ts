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
import { ApiResponse, GeneralMetrics, SDRPerformance, HourlyPerformance, DailyAverage } from '../types/index.js';

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





