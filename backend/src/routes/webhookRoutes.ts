/**
 * Rotas de webhook para integração com Pipedrive
 */

import { Router } from 'express';
import { 
  handlePipedriveWebhook, 
  handleManualLeadEntry, 
  handleManualAttendance 
} from '../webhooks/pipedriveHandler.js';

const router = Router();

/**
 * POST /api/webhook/pipedrive
 * Recebe eventos do Pipedrive (criação e atualização de deals)
 */
router.post('/pipedrive', handlePipedriveWebhook);

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

export default router;

