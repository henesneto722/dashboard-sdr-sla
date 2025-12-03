/**
 * Handler para webhooks do Pipedrive
 * Processa eventos de criação e atualização de Deals
 */

import { Request, Response } from 'express';
import { PipedriveWebhookPayload, PipedriveDeal } from '../types/index.js';
import { createLead, attendLead, findLeadByPipedriveId } from '../services/leadsService.js';

/**
 * Processa webhook de Deal do Pipedrive
 */
export async function handlePipedriveWebhook(req: Request, res: Response): Promise<void> {
  try {
    const payload = req.body as PipedriveWebhookPayload;
    
    // Validação básica do payload
    if (!payload || !payload.meta) {
      res.status(400).json({ 
        success: false, 
        error: 'Payload inválido' 
      });
      return;
    }

    const { action } = payload.meta;
    const currentDeal = payload.current;

    console.log(`📥 Webhook recebido: action=${action}, deal_id=${currentDeal?.id}`);

    // Ignorar se não houver deal atual
    if (!currentDeal) {
      res.status(200).json({ 
        success: true, 
        message: 'Nenhum deal para processar' 
      });
      return;
    }

    // Processar com base na ação
    switch (action) {
      case 'added':
        await handleDealAdded(currentDeal, res);
        break;

      case 'updated':
        await handleDealUpdated(currentDeal, payload.previous, res);
        break;

      default:
        console.log(`Ação ${action} ignorada`);
        res.status(200).json({ 
          success: true, 
          message: `Ação ${action} ignorada` 
        });
    }
  } catch (error) {
    console.error('❌ Erro ao processar webhook:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno ao processar webhook' 
    });
  }
}

/**
 * Fluxo A: Entrada de Lead - Deal criado
 */
async function handleDealAdded(deal: PipedriveDeal, res: Response): Promise<void> {
  try {
    // Verificar se já existe (idempotência)
    const existing = await findLeadByPipedriveId(deal.id.toString());
    if (existing) {
      console.log(`Lead ${deal.id} já existe. Ignorando criação.`);
      res.status(200).json({ 
        success: true, 
        message: 'Lead já existe',
        lead_id: existing.id 
      });
      return;
    }

    // Criar novo lead
    const lead = await createLead({
      lead_id: deal.id.toString(),
      lead_name: deal.title || `Lead #${deal.id}`,
      entered_at: deal.add_time,
      source: 'Pipedrive',
      pipeline: deal.pipeline_id?.toString() || 'Default',
    });

    console.log(`✅ Lead ${deal.id} criado com sucesso`);
    res.status(201).json({ 
      success: true, 
      message: 'Lead criado com sucesso',
      lead 
    });
  } catch (error) {
    console.error('Erro ao criar lead:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro ao criar lead' 
    });
  }
}

/**
 * Fluxo B: Atendimento do Lead - Deal atualizado (movimentação de etapa)
 */
async function handleDealUpdated(
  currentDeal: PipedriveDeal, 
  previousDeal: PipedriveDeal | null, 
  res: Response
): Promise<void> {
  try {
    // Verificar se houve mudança de etapa
    const stageChanged = previousDeal && currentDeal.stage_id !== previousDeal.stage_id;
    
    if (!stageChanged) {
      console.log(`Deal ${currentDeal.id} atualizado sem mudança de etapa. Ignorando.`);
      res.status(200).json({ 
        success: true, 
        message: 'Atualização sem mudança de etapa ignorada' 
      });
      return;
    }

    console.log(`🔄 Deal ${currentDeal.id} mudou de etapa: ${previousDeal?.stage_id} -> ${currentDeal.stage_id}`);

    // Primeiro, garantir que o lead existe no banco
    let existingLead = await findLeadByPipedriveId(currentDeal.id.toString());
    
    if (!existingLead) {
      // Lead não existe, criar primeiro
      console.log(`Lead ${currentDeal.id} não encontrado. Criando...`);
      existingLead = await createLead({
        lead_id: currentDeal.id.toString(),
        lead_name: currentDeal.title || `Lead #${currentDeal.id}`,
        entered_at: currentDeal.add_time,
        source: 'Pipedrive',
        pipeline: currentDeal.pipeline_id?.toString() || 'Default',
      });
    }

    // Verificar idempotência (já atendido?)
    if (existingLead?.attended_at) {
      console.log(`Lead ${currentDeal.id} já foi atendido. SLA já calculado.`);
      res.status(200).json({ 
        success: true, 
        message: 'Lead já foi atendido anteriormente',
        lead: existingLead 
      });
      return;
    }

    // Registrar atendimento
    const attendedAt = currentDeal.stage_change_time || currentDeal.update_time;
    const updatedLead = await attendLead(
      currentDeal.id.toString(),
      currentDeal.user_id.toString(),
      currentDeal.owner_name || 'SDR Desconhecido',
      attendedAt
    );

    console.log(`✅ Lead ${currentDeal.id} marcado como atendido`);
    res.status(200).json({ 
      success: true, 
      message: 'Lead atendido com sucesso',
      lead: updatedLead 
    });
  } catch (error) {
    console.error('Erro ao processar atualização de deal:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro ao processar atendimento' 
    });
  }
}

/**
 * Endpoint para registro manual de lead (útil para testes)
 */
export async function handleManualLeadEntry(req: Request, res: Response): Promise<void> {
  try {
    const { lead_id, lead_name, source, pipeline } = req.body;

    if (!lead_id || !lead_name) {
      res.status(400).json({ 
        success: false, 
        error: 'lead_id e lead_name são obrigatórios' 
      });
      return;
    }

    const lead = await createLead({
      lead_id,
      lead_name,
      entered_at: new Date().toISOString(),
      source: source || 'Manual',
      pipeline: pipeline || 'Default',
    });

    res.status(201).json({ 
      success: true, 
      message: 'Lead criado manualmente',
      lead 
    });
  } catch (error) {
    console.error('Erro ao criar lead manualmente:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro ao criar lead' 
    });
  }
}

/**
 * Endpoint para registro manual de atendimento (útil para testes)
 */
export async function handleManualAttendance(req: Request, res: Response): Promise<void> {
  try {
    const { lead_id, sdr_id, sdr_name } = req.body;

    if (!lead_id || !sdr_id || !sdr_name) {
      res.status(400).json({ 
        success: false, 
        error: 'lead_id, sdr_id e sdr_name são obrigatórios' 
      });
      return;
    }

    const lead = await attendLead(
      lead_id,
      sdr_id,
      sdr_name,
      new Date().toISOString()
    );

    if (!lead) {
      res.status(404).json({ 
        success: false, 
        error: 'Lead não encontrado' 
      });
      return;
    }

    res.status(200).json({ 
      success: true, 
      message: 'Atendimento registrado',
      lead 
    });
  } catch (error) {
    console.error('Erro ao registrar atendimento:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro ao registrar atendimento' 
    });
  }
}

