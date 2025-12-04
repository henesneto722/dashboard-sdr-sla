/**
 * Handler para webhooks do Pipedrive
 * Processa eventos de criação e atualização de Deals
 */

import { Request, Response } from 'express';
import { createLead, attendLead, findLeadByPipedriveId } from '../services/leadsService.js';

/**
 * Processa webhook de Deal do Pipedrive
 */
export async function handlePipedriveWebhook(req: Request, res: Response): Promise<void> {
  try {
    const payload = req.body;
    
    // Log do payload completo para debug
    console.log('📥 Webhook recebido - Payload:', JSON.stringify(payload, null, 2));

    // Tentar extrair dados de diferentes formatos do Pipedrive
    let action = payload.meta?.action || payload.event || payload.action;
    let dealData = payload.current || payload.data || payload;
    
    // Se o deal está dentro de 'data'
    if (payload.data?.current) {
      dealData = payload.data.current;
    }
    
    // Extrair ID do deal de diferentes lugares
    const dealId = dealData?.id || payload.id || payload.deal_id;
    const dealTitle = dealData?.title || dealData?.name || payload.title || `Lead #${dealId}`;
    const addTime = dealData?.add_time || dealData?.created_at || new Date().toISOString();
    const pipelineId = dealData?.pipeline_id || payload.pipeline_id || 'Default';
    const userId = dealData?.user_id || dealData?.owner_id || dealData?.creator_user_id || payload.user_id;
    
    // Capturar nome do SDR de várias fontes possíveis do Pipedrive
    const ownerName = dealData?.owner_name 
      || dealData?.user_name 
      || dealData?.person_name
      || dealData?.creator_user_id?.name
      || payload.meta?.user_name
      || payload.owner_name
      || (dealData?.user_id ? `SDR #${dealData.user_id}` : null)
      || 'SDR Desconhecido';
    
    const stageId = dealData?.stage_id || payload.stage_id;
    const updateTime = dealData?.update_time || dealData?.updated_at || new Date().toISOString();
    
    // Log detalhado para debug do SDR
    console.log(`👤 SDR Info: owner_name=${dealData?.owner_name}, user_name=${dealData?.user_name}, user_id=${userId}`);

    console.log(`📥 Webhook processado: action=${action}, deal_id=${dealId}, title=${dealTitle}`);

    // Validação básica
    if (!dealId) {
      console.log('⚠️ Webhook sem deal_id válido');
      res.status(200).json({ 
        success: true, 
        message: 'Webhook recebido mas sem deal_id válido' 
      });
      return;
    }

    // Normalizar ação
    const normalizedAction = normalizeAction(action);
    console.log(`📥 Ação normalizada: ${normalizedAction}`);

    // Processar com base na ação
    switch (normalizedAction) {
      case 'added':
        await handleDealAdded(dealId, dealTitle, addTime, pipelineId, res);
        break;

      case 'updated':
        await handleDealUpdated(dealId, dealTitle, addTime, pipelineId, userId, ownerName, stageId, updateTime, res);
        break;

      default:
        console.log(`Ação ${action} (${normalizedAction}) - criando lead por padrão`);
        await handleDealAdded(dealId, dealTitle, addTime, pipelineId, res);
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
 * Normaliza diferentes nomes de ação para um padrão
 */
function normalizeAction(action: string | undefined): string {
  if (!action) return 'added';
  
  const actionLower = action.toLowerCase();
  
  if (actionLower.includes('add') || actionLower.includes('create') || actionLower.includes('new')) {
    return 'added';
  }
  if (actionLower.includes('update') || actionLower.includes('change') || actionLower.includes('edit')) {
    return 'updated';
  }
  if (actionLower.includes('delete') || actionLower.includes('remove')) {
    return 'deleted';
  }
  
  return 'added'; // Default para criar o lead
}

/**
 * Fluxo A: Entrada de Lead - Deal criado
 */
async function handleDealAdded(
  dealId: string | number,
  dealTitle: string,
  addTime: string,
  pipelineId: string | number,
  res: Response
): Promise<void> {
  try {
    const dealIdStr = dealId.toString();
    
    // Verificar se já existe (idempotência)
    const existing = await findLeadByPipedriveId(dealIdStr);
    if (existing) {
      console.log(`Lead ${dealIdStr} já existe. Ignorando criação.`);
      res.status(200).json({ 
        success: true, 
        message: 'Lead já existe',
        lead_id: existing.id 
      });
      return;
    }

    // Criar novo lead
    const lead = await createLead({
      lead_id: dealIdStr,
      lead_name: dealTitle,
      entered_at: addTime,
      source: 'Pipedrive',
      pipeline: pipelineId.toString(),
    });

    console.log(`✅ Lead ${dealIdStr} criado com sucesso`);
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
 * Fluxo B: Atendimento do Lead - Deal atualizado
 */
async function handleDealUpdated(
  dealId: string | number,
  dealTitle: string,
  addTime: string,
  pipelineId: string | number,
  userId: string | number | undefined,
  ownerName: string,
  stageId: string | number | undefined,
  updateTime: string,
  res: Response
): Promise<void> {
  try {
    const dealIdStr = dealId.toString();
    
    // Primeiro, garantir que o lead existe no banco
    let existingLead = await findLeadByPipedriveId(dealIdStr);
    
    if (!existingLead) {
      // Lead não existe, criar primeiro
      console.log(`Lead ${dealIdStr} não encontrado. Criando...`);
      existingLead = await createLead({
        lead_id: dealIdStr,
        lead_name: dealTitle,
        entered_at: addTime,
        source: 'Pipedrive',
        pipeline: pipelineId.toString(),
      });
    }

    // Verificar idempotência (já atendido?)
    if (existingLead?.attended_at) {
      console.log(`Lead ${dealIdStr} já foi atendido. SLA já calculado.`);
      res.status(200).json({ 
        success: true, 
        message: 'Lead já foi atendido anteriormente',
        lead: existingLead 
      });
      return;
    }

    // Registrar atendimento
    const updatedLead = await attendLead(
      dealIdStr,
      userId?.toString() || 'unknown',
      ownerName,
      updateTime
    );

    console.log(`✅ Lead ${dealIdStr} marcado como atendido`);
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
