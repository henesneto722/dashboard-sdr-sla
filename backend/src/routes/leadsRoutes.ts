/**
 * Rotas de leads para o Dashboard
 */

import { Router, Request, Response } from 'express';
import { 
  getSlowestLeads, 
  getPendingLeads, 
  getLeadsWithFilters,
  getUniqueSDRs 
} from '../services/leadsService.js';
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



