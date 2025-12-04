/**
 * Rotas de webhook para integração com Pipedrive
 */

import { Router, Request, Response } from 'express';
import { 
  handlePipedriveWebhook, 
  handleManualLeadEntry, 
  handleManualAttendance 
} from '../webhooks/pipedriveHandler.js';
import { clearAllLeads } from '../services/leadsService.js';
import { listSDRPipelines, invalidateCache } from '../services/pipedriveService.js';

const router = Router();

/**
 * POST /api/webhook/pipedrive
 * Recebe eventos do Pipedrive (criação e atualização de deals)
 */
router.post('/pipedrive', handlePipedriveWebhook);

// Também aceitar com barra no final (Pipedrive pode enviar assim)
router.post('/pipedrive/', handlePipedriveWebhook);

/**
 * POST /api/webhook/manual/lead
 * Cria um lead manualmente (para testes)
 * Body: { lead_id, lead_name, source?, pipeline? }
 */
router.post('/manual/lead', handleManualLeadEntry);

/**
 * POST /api/webhook/manual/attend
 * Registra atendimento manualmente (para testes)
 * Body: { lead_id, sdr_id, sdr_name }
 */
router.post('/manual/attend', handleManualAttendance);

/**
 * DELETE /api/webhook/admin/clear-all
 * Limpa todos os dados de teste (usar com cuidado!)
 * Requer header: X-Admin-Key
 */
router.delete('/admin/clear-all', async (req: Request, res: Response) => {
  try {
    const adminKey = req.headers['x-admin-key'];
    
    // Verificar chave de admin (use a variável de ambiente ou uma chave fixa para dev)
    const expectedKey = process.env.ADMIN_KEY || 'dev-admin-key-2024';
    
    if (adminKey !== expectedKey) {
      res.status(401).json({ 
        success: false, 
        error: 'Não autorizado' 
      });
      return;
    }

    const count = await clearAllLeads();
    
    res.status(200).json({ 
      success: true, 
      message: `${count} leads removidos com sucesso`,
      deleted_count: count
    });
  } catch (error) {
    console.error('Erro ao limpar dados:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro ao limpar dados' 
    });
  }
});

/**
 * GET /api/webhook/admin/pipelines
 * Lista os pipelines SDR encontrados no Pipedrive
 */
router.get('/admin/pipelines', async (req: Request, res: Response) => {
  try {
    const pipelines = await listSDRPipelines();
    
    res.status(200).json({ 
      success: true, 
      data: pipelines,
      message: `${pipelines.length} pipelines SDR encontrados`
    });
  } catch (error) {
    console.error('Erro ao buscar pipelines:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro ao buscar pipelines' 
    });
  }
});

/**
 * POST /api/webhook/admin/refresh-cache
 * Força a recarga do cache do Pipedrive
 */
router.post('/admin/refresh-cache', async (req: Request, res: Response) => {
  try {
    invalidateCache();
    const pipelines = await listSDRPipelines();
    
    res.status(200).json({ 
      success: true, 
      message: 'Cache atualizado',
      pipelines_sdr: pipelines.length
    });
  } catch (error) {
    console.error('Erro ao atualizar cache:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro ao atualizar cache' 
    });
  }
});

export default router;



