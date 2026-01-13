/**
 * Rotas de leads para o Dashboard
 */

import { Router, Request, Response } from 'express';
import { 
  getSlowestLeads, 
  getPendingLeads,
  getAllPendingLeads,
  getImportantPendingLeads,
  getLeadsWithFilters,
  getLeadsPaginated,
  getUniqueSDRs,
  getTodayAttendedLeads,
  getAllMonthLeads,
  deleteImportantPendingLeads,
  syncPipedriveDeals
} from '../services/leadsService.js';
import { listAllPipelines, getMainSDRPipelineId } from '../services/pipedriveService.js';
import { ApiResponse, LeadSLA, LeadsQueryFilters } from '../types/index.js';

const router = Router();

/**
 * GET /api/leads/slowest
 * Retorna leads com maior tempo de SLA (piores casos)
 */
router.get('/slowest', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const leads = await getSlowestLeads(limit);
    
    const response: ApiResponse<LeadSLA[]> = {
      success: true,
      data: leads,
      message: `${leads.length} leads com maior tempo de SLA`,
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error) {
    console.error('Erro em /leads/slowest:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar leads mais lentos',
      message: error instanceof Error ? error.message : 'Erro desconhecido',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /api/leads/pending
 * Retorna leads pendentes (fila de espera)
 */
router.get('/pending', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const leads = await getPendingLeads(limit);
    
    const response: ApiResponse<LeadSLA[]> = {
      success: true,
      data: leads,
      message: `${leads.length} leads aguardando atendimento`,
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error) {
    console.error('Erro em /leads/pending:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar leads pendentes',
      message: error instanceof Error ? error.message : 'Erro desconhecido',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /api/leads/all-pending
 * Retorna TODOS os leads pendentes (sem limite e sem filtro de data)
 */
router.get('/all-pending', async (req: Request, res: Response) => {
  try {
    const result = await getAllPendingLeads();
    
    const response: ApiResponse<{ count: number; leads: LeadSLA[] }> = {
      success: true,
      data: result,
      message: `${result.count} leads pendentes no total`,
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error) {
    console.error('Erro em /leads/all-pending:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar todos os leads pendentes',
      message: error instanceof Error ? error.message : 'Erro desconhecido',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /api/leads/important-pending
 * Retorna leads importantes pendentes (Tem perfil ou Perfil menor, não atendidos)
 */
router.get('/important-pending', async (req: Request, res: Response) => {
  try {
    console.log('📥 [ROUTE] /api/leads/important-pending - Requisição recebida');
    const result = await getImportantPendingLeads();
    
    const response: ApiResponse<{ count: number; leads: LeadSLA[] }> = {
      success: true,
      data: result,
      message: `${result.count} leads importantes aguardando atendimento`,
      timestamp: new Date().toISOString(),
    };

    console.log(`✅ [ROUTE] /api/leads/important-pending - Retornando ${result.count} leads importantes`);
    res.json(response);
  } catch (error) {
    console.error('❌ [ROUTE] Erro em /leads/important-pending:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar leads importantes pendentes',
      message: error instanceof Error ? error.message : 'Erro desconhecido',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /api/leads/detail
 * Retorna lista detalhada de leads com filtros
 * Query params: period, sdr_id, limit, offset
 */
router.get('/detail', async (req: Request, res: Response) => {
  try {
    const filters: LeadsQueryFilters = {
      period: (req.query.period as string) as LeadsQueryFilters['period'] || '30days',
      sdr_id: req.query.sdr_id as string,
      limit: parseInt(req.query.limit as string) || 100,
      offset: parseInt(req.query.offset as string) || 0,
    };

    const leads = await getLeadsWithFilters(filters);
    
    const response: ApiResponse<LeadSLA[]> = {
      success: true,
      data: leads,
      message: `${leads.length} leads encontrados`,
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error) {
    console.error('Erro em /leads/detail:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar leads',
      message: error instanceof Error ? error.message : 'Erro desconhecido',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /api/leads/paginated
 * Retorna leads com paginação real (otimizado para 10k+ leads)
 * Query params: period, sdr_id, page, limit
 */
router.get('/paginated', async (req: Request, res: Response) => {
  try {
    const filters: LeadsQueryFilters = {
      period: (req.query.period as string) as LeadsQueryFilters['period'] || '30days',
      sdr_id: req.query.sdr_id as string,
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 50,
    };

    const result = await getLeadsPaginated(filters);
    
    res.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Erro em /leads/paginated:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar leads paginados',
      message: error instanceof Error ? error.message : 'Erro desconhecido',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /api/leads/today-attended
 * Retorna leads atendidos hoje (independente de quando foram criados)
 */
router.get('/today-attended', async (req: Request, res: Response) => {
  try {
    const leads = await getTodayAttendedLeads();
    
    const response: ApiResponse<LeadSLA[]> = {
      success: true,
      data: leads,
      message: `${leads.length} leads atendidos hoje`,
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error) {
    console.error('Erro em /leads/today-attended:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar leads atendidos hoje',
      message: error instanceof Error ? error.message : 'Erro desconhecido',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /api/leads/monthly
 * Retorna TODOS os leads do mês atual (sem limite) para filtragem client-side
 */
router.get('/monthly', async (req: Request, res: Response) => {
  try {
    const leads = await getAllMonthLeads();
    
    const response: ApiResponse<LeadSLA[]> = {
      success: true,
      data: leads,
      message: `${leads.length} leads do mês atual`,
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error) {
    console.error('Erro em /leads/monthly:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar leads do mês',
      message: error instanceof Error ? error.message : 'Erro desconhecido',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /api/leads/sdrs
 * Retorna lista de SDRs únicos
 */
router.get('/sdrs', async (req: Request, res: Response) => {
  try {
    const sdrs = await getUniqueSDRs();
    
    const response: ApiResponse<{ sdr_id: string; sdr_name: string }[]> = {
      success: true,
      data: sdrs,
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error) {
    console.error('Erro em /leads/sdrs:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar SDRs',
      message: error instanceof Error ? error.message : 'Erro desconhecido',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /api/leads/debug/important-stages
 * Lista todos os leads pendentes com stages "Tem Perfil" ou "Perfil Menor" para debug
 */
router.get('/debug/important-stages', async (req: Request, res: Response) => {
  try {
    console.log('🔍 [ROUTE] GET /api/leads/debug/important-stages - Requisição recebida');
    const allPending = await getAllPendingLeads();
    
    // Filtrar leads importantes manualmente para debug
    const importantLeads = allPending.leads.filter(lead => {
      if (lead.status && lead.status.toLowerCase() === 'lost') {
        return false;
      }
      const stageName = (lead.stage_name || '').toLowerCase().trim();
      const isTemPerfil = stageName.includes('tem perfil') && !stageName.includes('sem perfil');
      const isPerfilMenor = stageName.includes('perfil menor');
      return isTemPerfil || isPerfilMenor;
    });
    
    const response: ApiResponse<{ 
      totalPending: number;
      importantCount: number;
      importantLeads: any[];
      allStages: string[];
    }> = {
      success: true,
      data: {
        totalPending: allPending.count,
        importantCount: importantLeads.length,
        importantLeads: importantLeads.map(l => ({
          lead_id: l.lead_id,
          lead_name: l.lead_name,
          stage_name: l.stage_name,
          stage_name_normalized: (l.stage_name || '').toLowerCase().trim(),
          status: l.status,
          pipeline: l.pipeline,
          attended_at: l.attended_at
        })),
        allStages: Array.from(new Set(allPending.leads.map(l => l.stage_name).filter(Boolean)))
      },
      message: `${importantLeads.length} leads importantes encontrados de ${allPending.count} pendentes`,
      timestamp: new Date().toISOString(),
    };

    console.log(`✅ [ROUTE] GET /api/leads/debug/important-stages - ${importantLeads.length} leads importantes retornados`);
    res.json(response);
  } catch (error) {
    console.error('❌ [ROUTE] Erro em GET /leads/debug/important-stages:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar leads importantes para debug',
      message: error instanceof Error ? error.message : 'Erro desconhecido',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * DELETE /api/leads/important-pending
 * Exclui todos os leads importantes pendentes do banco de dados
 */
router.delete('/important-pending', async (req: Request, res: Response) => {
  try {
    console.log('🗑️ [ROUTE] DELETE /api/leads/important-pending - Requisição recebida');
    const count = await deleteImportantPendingLeads();
    
    const response: ApiResponse<{ deleted: number }> = {
      success: true,
      data: { deleted: count },
      message: `${count} leads importantes pendentes excluídos`,
      timestamp: new Date().toISOString(),
    };

    console.log(`✅ [ROUTE] DELETE /api/leads/important-pending - ${count} leads excluídos`);
    res.json(response);
  } catch (error) {
    console.error('❌ [ROUTE] Erro em DELETE /leads/important-pending:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao excluir leads importantes pendentes',
      message: error instanceof Error ? error.message : 'Erro desconhecido',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /api/leads/debug/pipelines
 * Lista todos os pipelines do Pipedrive (para debug)
 */
router.get('/debug/pipelines', async (req: Request, res: Response) => {
  try {
    console.log('🔍 [ROUTE] GET /api/leads/debug/pipelines - Requisição recebida');
    const pipelines = await listAllPipelines();
    const mainPipelineId = await getMainSDRPipelineId();
    
    const response: ApiResponse<{ 
      pipelines: any[]; 
      mainPipelineId: string | null;
      mainPipeline: any | null;
    }> = {
      success: true,
      data: {
        pipelines: pipelines.map(p => ({
          id: p.id,
          name: p.name,
          isSDR: p.isSDR,
          isMainSDR: p.isMainSDR,
          isIndividualCloser: p.isIndividualCloser
        })),
        mainPipelineId,
        mainPipeline: mainPipelineId ? pipelines.find(p => p.id.toString() === mainPipelineId) : null
      },
      message: `${pipelines.length} pipelines encontrados`,
      timestamp: new Date().toISOString(),
    };

    console.log(`✅ [ROUTE] GET /api/leads/debug/pipelines - ${pipelines.length} pipelines retornados`);
    res.json(response);
  } catch (error) {
    console.error('❌ [ROUTE] Erro em GET /leads/debug/pipelines:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao listar pipelines',
      message: error instanceof Error ? error.message : 'Erro desconhecido',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * POST /api/leads/sync-pipedrive
 * Sincroniza todos os deals do pipeline principal "SDR" do Pipedrive
 */
router.post('/sync-pipedrive', async (req: Request, res: Response) => {
  try {
    console.log('🔄 [ROUTE] POST /api/leads/sync-pipedrive - Requisição recebida');
    const result = await syncPipedriveDeals();
    
    const response: ApiResponse<{ inserted: number; updated: number; errors: number }> = {
      success: true,
      data: result,
      message: `Sincronização concluída: ${result.inserted} inseridos, ${result.updated} atualizados, ${result.errors} erros`,
      timestamp: new Date().toISOString(),
    };

    console.log(`✅ [ROUTE] POST /api/leads/sync-pipedrive - Sincronização concluída`);
    res.json(response);
  } catch (error) {
    console.error('❌ [ROUTE] Erro em POST /leads/sync-pipedrive:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao sincronizar com Pipedrive',
      message: error instanceof Error ? error.message : 'Erro desconhecido',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /api/leads/:lead_id
 * Retorna detalhes de um lead específico
 */
router.get('/:lead_id', async (req: Request, res: Response) => {
  try {
    const { lead_id } = req.params;
    const leads = await getLeadsWithFilters({ period: 'all', limit: 1 });
    const lead = leads.find(l => l.lead_id === lead_id);
    
    if (!lead) {
      res.status(404).json({
        success: false,
        error: 'Lead não encontrado',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const response: ApiResponse<LeadSLA> = {
      success: true,
      data: lead,
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error) {
    console.error('Erro em /leads/:lead_id:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar lead',
      message: error instanceof Error ? error.message : 'Erro desconhecido',
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;





