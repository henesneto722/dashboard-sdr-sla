/**
 * Handler para webhooks do Pipedrive
 * Processa eventos de criação e atualização de Deals
 * 
 * Regras:
 * - Apenas processa deals de pipelines que contêm "- SDR" no nome
 * - O nome do SDR é extraído automaticamente do nome do pipeline
 * - Deal é considerado "atendido" quando é atribuído a um usuário (owner)
 * - Stages de prioridade: TEM PERFIL > PERFIL MENOR > INCONCLUSIVO > SEM PERFIL
 */

import { Request, Response } from 'express';
import { createLead, attendLead, findLeadByPipedriveId, updateLeadStage } from '../services/leadsService.js';
import { 
  isSDRPipeline, 
  getSDRNameFromPipelineId, 
  getStageName,
  getStagePriority 
} from '../services/pipedriveService.js';

/**
 * Processa webhook de Deal do Pipedrive
 */
export async function handlePipedriveWebhook(req: Request, res: Response): Promise<void> {
  try {
    const payload = req.body;
    
    // Log do payload para debug
    console.log('📥 Webhook recebido');

    // Extrair dados do payload (suporta diferentes formatos do Pipedrive)
    let action = payload.meta?.action || payload.event || payload.action;
    let dealData = payload.current || payload.data || payload;
    
    if (payload.data?.current) {
      dealData = payload.data.current;
    }
    
    // Extrair informações do deal
    const dealId = dealData?.id || payload.id || payload.deal_id;
    const dealTitle = dealData?.title || dealData?.name || payload.title || `Lead #${dealId}`;
    const addTime = dealData?.add_time || dealData?.created_at || new Date().toISOString();
    const pipelineId = dealData?.pipeline_id || payload.pipeline_id;
    const stageId = dealData?.stage_id || payload.stage_id;
    const userId = dealData?.user_id || dealData?.owner_id || payload.user_id;
    const updateTime = dealData?.update_time || dealData?.updated_at || new Date().toISOString();

    console.log(`📥 Deal: id=${dealId}, title=${dealTitle}, pipeline=${pipelineId}, stage=${stageId}`);

    // Validação básica
    if (!dealId) {
      console.log('⚠️ Webhook sem deal_id válido');
      res.status(200).json({ 
        success: true, 
        message: 'Webhook recebido mas sem deal_id válido' 
      });
      return;
    }

    // Verificar se é um pipeline de SDR
    if (!pipelineId) {
      console.log('⚠️ Webhook sem pipeline_id');
      res.status(200).json({ 
        success: true, 
        message: 'Webhook recebido mas sem pipeline_id' 
      });
      return;
    }

    const isSDR = await isSDRPipeline(pipelineId);
    
    if (!isSDR) {
      console.log(`⏭️ Pipeline ${pipelineId} não é de SDR. Ignorando.`);
      res.status(200).json({ 
        success: true, 
        message: 'Pipeline não é de SDR. Ignorado.' 
      });
      return;
    }

    // Buscar nome do SDR e do stage
    const sdrName = await getSDRNameFromPipelineId(pipelineId);
    const stageName = stageId ? await getStageName(stageId) : 'Desconhecido';
    const stagePriority = getStagePriority(stageName);

    console.log(`👤 SDR: ${sdrName}, Stage: ${stageName} (prioridade: ${stagePriority})`);

    // Normalizar ação
    const normalizedAction = normalizeAction(action);
    console.log(`📥 Ação: ${normalizedAction}`);

    // Processar com base na ação
    switch (normalizedAction) {
      case 'added':
        await handleDealAdded(
          dealId, dealTitle, addTime, pipelineId, sdrName, 
          stageId, stageName, stagePriority, userId, updateTime, res
        );
        break;

      case 'updated':
        await handleDealUpdated(
          dealId, dealTitle, addTime, pipelineId, sdrName,
          stageId, stageName, stagePriority, userId, updateTime, res
        );
        break;

      default:
        console.log(`Ação ${action} - criando lead por padrão`);
        await handleDealAdded(
          dealId, dealTitle, addTime, pipelineId, sdrName,
          stageId, stageName, stagePriority, userId, updateTime, res
        );
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
  
  return 'added';
}

/**
 * Fluxo A: Deal criado - Cria registro do lead
 * Se o deal já tem um owner (user_id), considera como atendido
 */
async function handleDealAdded(
  dealId: string | number,
  dealTitle: string,
  addTime: string,
  pipelineId: string | number,
  sdrName: string,
  stageId: string | number | undefined,
  stageName: string,
  stagePriority: number,
  userId: string | number | undefined,
  updateTime: string,
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

    // Se o deal já tem um owner, já está atendido
    const isAttended = !!userId;
    
    // Criar novo lead
    const leadData: any = {
      lead_id: dealIdStr,
      lead_name: dealTitle,
      entered_at: addTime,
      source: 'Pipedrive',
      pipeline: pipelineId.toString(),
      sdr_id: pipelineId.toString(),
      sdr_name: sdrName,
      stage_name: stageName,
      stage_priority: stagePriority,
    };

    // Se já tem owner, marcar como atendido
    if (isAttended) {
      leadData.attended_at = updateTime;
      // SLA será calculado no serviço
    }

    const lead = await createLead(leadData);

    console.log(`✅ Lead ${dealIdStr} criado - SDR: ${sdrName}, Atendido: ${isAttended}`);
    res.status(201).json({ 
      success: true, 
      message: isAttended ? 'Lead criado e atendido' : 'Lead criado',
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
 * Fluxo B: Deal atualizado
 * - Se não existia, cria
 * - Se recebeu um owner (user_id), marca como atendido
 * - Atualiza o stage se mudou
 */
async function handleDealUpdated(
  dealId: string | number,
  dealTitle: string,
  addTime: string,
  pipelineId: string | number,
  sdrName: string,
  stageId: string | number | undefined,
  stageName: string,
  stagePriority: number,
  userId: string | number | undefined,
  updateTime: string,
  res: Response
): Promise<void> {
  try {
    const dealIdStr = dealId.toString();
    
    // Verificar se o lead existe
    let existingLead = await findLeadByPipedriveId(dealIdStr);
    
    if (!existingLead) {
      // Lead não existe, criar
      console.log(`Lead ${dealIdStr} não encontrado. Criando...`);
      
      const isAttended = !!userId;
      
      const leadData: any = {
        lead_id: dealIdStr,
        lead_name: dealTitle,
        entered_at: addTime,
        source: 'Pipedrive',
        pipeline: pipelineId.toString(),
        sdr_id: pipelineId.toString(),
        sdr_name: sdrName,
        stage_name: stageName,
        stage_priority: stagePriority,
      };

      if (isAttended) {
        leadData.attended_at = updateTime;
      }

      existingLead = await createLead(leadData);
      
      console.log(`✅ Lead ${dealIdStr} criado via update - SDR: ${sdrName}`);
      res.status(201).json({ 
        success: true, 
        message: 'Lead criado via update',
        lead: existingLead 
      });
      return;
    }

    // Lead existe - verificar se precisa atualizar
    
    // Se ainda não foi atendido e agora tem um owner, marcar como atendido
    if (!existingLead.attended_at && userId) {
      const updatedLead = await attendLead(
        dealIdStr,
        pipelineId.toString(),
        sdrName,
        updateTime
      );

      // Atualizar stage também
      if (stageId) {
        await updateLeadStage(dealIdStr, stageName, stagePriority);
      }

      console.log(`✅ Lead ${dealIdStr} marcado como atendido - SDR: ${sdrName}`);
      res.status(200).json({ 
        success: true, 
        message: 'Lead atendido',
        lead: updatedLead 
      });
      return;
    }

    // Só atualizar o stage se mudou
    if (stageId && existingLead.stage_name !== stageName) {
      await updateLeadStage(dealIdStr, stageName, stagePriority);
      console.log(`🔄 Lead ${dealIdStr} - Stage atualizado para: ${stageName}`);
    }

    console.log(`ℹ️ Lead ${dealIdStr} atualizado sem mudanças significativas`);
    res.status(200).json({ 
      success: true, 
      message: 'Lead atualizado',
      lead: existingLead 
    });
  } catch (error) {
    console.error('Erro ao processar atualização:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro ao processar atualização' 
    });
  }
}

/**
 * Endpoint para registro manual de lead (útil para testes)
 */
export async function handleManualLeadEntry(req: Request, res: Response): Promise<void> {
  try {
    const { lead_id, lead_name, source, pipeline, sdr_name, stage_name } = req.body;

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
      sdr_name: sdr_name || 'Manual',
      stage_name: stage_name || 'Manual',
      stage_priority: 99,
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
