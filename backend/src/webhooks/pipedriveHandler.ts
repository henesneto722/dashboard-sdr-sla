/**
 * Handler para webhooks do Pipedrive
 * Processa eventos de criação e atualização de Deals
 * 
 * REGRAS DE NEGÓCIO:
 * 
 * 1. FUNIL PRINCIPAL "SDR":
 *    - Apenas contabiliza deals nas etapas: TEM PERFIL, PERFIL MENOR, INCONCLUSIVO, SEM PERFIL
 *    - Outras etapas são IGNORADAS completamente
 *    - Prioridade: TEM PERFIL (1) > PERFIL MENOR (2) > INCONCLUSIVO (3) > SEM PERFIL (4)
 * 
 * 2. FUNIS ESPECÍFICOS "NOME - SDR":
 *    - Quando deal é movido do funil "SDR" para um funil específico → ATENDIDO
 *    - Mudanças de etapa DENTRO de funis específicos são IGNORADAS
 * 
 * 3. CÁLCULO DE SLA:
 *    - Tempo entre entrada no funil "SDR" e movimentação para funil específico
 */

// Etapas válidas do funil principal "SDR" (apenas essas são contabilizadas)
const VALID_SDR_STAGES = [
  'tem perfil',
  'perfil menor',
  'inconclusivo',
  'sem perfil',
];

// Verifica se uma etapa é válida para contabilização
function isValidSDRStage(stageName: string | null): boolean {
  if (!stageName) {
    console.log('⚠️ isValidSDRStage: stageName é null/undefined');
    return false;
  }
  const normalized = stageName.toLowerCase().trim();
  const isValid = VALID_SDR_STAGES.some(valid => normalized.includes(valid));
  console.log(`🔍 isValidSDRStage: "${stageName}" → "${normalized}" → válido: ${isValid}`);
  return isValid;
}

import { Request, Response } from 'express';
import { createLead, attendLead, findLeadByPipedriveId, updateLeadStage, updateLeadStatus } from '../services/leadsService.js';
import { createAttendanceEvent } from '../services/sdrAttendanceService.js';
import { 
  isSDRPipeline,
  isMainSDRPipeline,
  isIndividualSDRPipeline,
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
    const dealStatus = dealData?.status || payload.status || 'open'; // Status do Pipedrive (lost, open, won)
    const lostTime = dealData?.lost_time || payload.lost_time || null; // Tempo em que o deal foi perdido

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

    // Verificar se é o funil principal "SDR" ou um funil individual "NOME - SDR"
    const isMain = await isMainSDRPipeline(pipelineId);
    const isIndividual = await isIndividualSDRPipeline(pipelineId);

    // Buscar nome do SDR e do stage
    const sdrName = await getSDRNameFromPipelineId(pipelineId);
    const stageName = stageId ? await getStageName(stageId) : 'Desconhecido';
    const stagePriority = getStagePriority(stageName);
    
    // Se lost_time não é nulo, o deal foi perdido
    const isLost = lostTime !== null && lostTime !== undefined;
    const finalStatus = isLost ? 'lost' : dealStatus;

    console.log(`📊 Pipeline: ${isMain ? 'PRINCIPAL (SDR)' : 'INDIVIDUAL (' + sdrName + ')'}`);
    console.log(`👤 SDR: ${sdrName}, Stage: ${stageName} (prioridade: ${stagePriority})`);

    // Normalizar ação
    const normalizedAction = normalizeAction(action);
    console.log(`📥 Ação: ${normalizedAction}`);

    // Processar com base na ação
    switch (normalizedAction) {
      case 'added':
        await handleDealAdded(
          dealId, dealTitle, addTime, pipelineId, sdrName, 
          stageId, stageName, stagePriority, isMain, isIndividual, updateTime, userId, finalStatus, res
        );
        break;

      case 'updated':
        await handleDealUpdated(
          dealId, dealTitle, addTime, pipelineId, sdrName,
          stageId, stageName, stagePriority, isMain, isIndividual, updateTime, userId, finalStatus, res
        );
        break;

      default:
        console.log(`Ação ${action} - criando lead por padrão`);
        await handleDealAdded(
          dealId, dealTitle, addTime, pipelineId, sdrName,
          stageId, stageName, stagePriority, isMain, isIndividual, updateTime, userId, finalStatus, res
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
 * Fluxo A: Deal criado
 * - Se no funil "SDR" principal COM etapa válida → Lead PENDENTE
 * - Se no funil "SDR" principal COM etapa inválida → IGNORAR
 * - Se no funil "NOME - SDR" individual → Lead ATENDIDO (SDR já pegou)
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
  isMainPipeline: boolean,
  isIndividualPipeline: boolean,
  updateTime: string,
  userId: string | number | undefined,
  dealStatus: string,
  res: Response
): Promise<void> {
  try {
    const dealIdStr = dealId.toString();
    
    // Se está no funil principal "SDR", verificar se a etapa é válida
    if (isMainPipeline && !isValidSDRStage(stageName)) {
      console.log(`⏭️ Deal ${dealIdStr} em etapa "${stageName}" não válida. Ignorando.`);
      res.status(200).json({ 
        success: true, 
        message: `Etapa "${stageName}" não é contabilizada. Ignorado.`
      });
      return;
    }
    
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

    // Se está no funil individual "NOME - SDR", já foi atendido pelo SDR
    const isAttended = isIndividualPipeline;
    
    // Criar novo lead
    const leadData: any = {
      lead_id: dealIdStr,
      lead_name: dealTitle,
      entered_at: addTime,
      source: 'Pipedrive',
      pipeline: pipelineId.toString(),
      stage_name: stageName,
      stage_priority: stagePriority,
      status: dealStatus, // Status do Pipedrive (lost, open, won)
    };

    // Se está no funil individual (SDR já pegou), marcar como atendido
    if (isAttended) {
      leadData.sdr_id = pipelineId.toString();
      leadData.sdr_name = sdrName;
      leadData.attended_at = updateTime;
      
      // Registrar evento de atendimento APENAS quando lead é criado já no pipeline individual
      // Isso significa que o SDR pegou o lead diretamente (sem passar pelo pipeline principal)
      if (userId) {
        try {
          await createAttendanceEvent({
            user_id: userId.toString(),
            user_name: sdrName,
            timestamp: updateTime,
            deal_id: dealIdStr,
            event_type: 'attended',
            pipeline_id: pipelineId.toString(),
            stage_id: stageId?.toString(),
            metadata: {
              action: 'added',
              is_attended: true,
              is_main_pipeline: false,
              source: 'individual_pipeline_direct',
            },
          });
          console.log(`📝 Evento de atendimento registrado para SDR ${userId} (deal ${dealIdStr}) - Criado já atendido`);
        } catch (error) {
          console.warn('⚠️ Erro ao registrar evento de atendimento (não crítico):', error);
        }
      }
    }

    const lead = await createLead(leadData);

    const status = isMainPipeline ? 'PENDENTE' : 'ATENDIDO por ' + sdrName;
    console.log(`✅ Lead ${dealIdStr} criado - Status: ${status}`);
    res.status(201).json({ 
      success: true, 
      message: isAttended ? `Lead atendido por ${sdrName}` : 'Lead pendente',
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
 * - Se no funil "SDR" com etapa inválida → IGNORAR
 * - Se movido do funil "SDR" para "NOME - SDR" → ATENDIDO (SDR pegou)
 * - Se já está em funil específico e muda de etapa → IGNORAR (não faz parte do sistema)
 * - Se não existia e está em etapa válida, cria
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
  isMainPipeline: boolean,
  isIndividualPipeline: boolean,
  updateTime: string,
  userId: string | number | undefined,
  dealStatus: string,
  res: Response
): Promise<void> {
  try {
    const dealIdStr = dealId.toString();
    
    // Verificar se o lead existe
    let existingLead = await findLeadByPipedriveId(dealIdStr);
    
    // Se está em funil específico e o lead JÁ FOI ATENDIDO, ignorar mudanças de etapa
    if (existingLead && existingLead.attended_at && isIndividualPipeline) {
      console.log(`⏭️ Lead ${dealIdStr} já atendido. Mudança de etapa em funil específico ignorada.`);
      res.status(200).json({ 
        success: true, 
        message: 'Lead já atendido. Mudanças em funil específico são ignoradas.'
      });
      return;
    }
    
    if (!existingLead) {
      // Lead não existe
      
      // Se está no funil principal "SDR", verificar se a etapa é válida
      if (isMainPipeline && !isValidSDRStage(stageName)) {
        console.log(`⏭️ Deal ${dealIdStr} em etapa "${stageName}" não válida. Ignorando.`);
        res.status(200).json({ 
          success: true, 
          message: `Etapa "${stageName}" não é contabilizada. Ignorado.`
        });
        return;
      }
      
      console.log(`Lead ${dealIdStr} não encontrado. Criando...`);
      
      const isAttended = isIndividualPipeline;
      
      const leadData: any = {
        lead_id: dealIdStr,
        lead_name: dealTitle,
        entered_at: addTime,
        source: 'Pipedrive',
        pipeline: pipelineId.toString(),
        stage_name: stageName,
        stage_priority: stagePriority,
        status: dealStatus, // Status do Pipedrive (lost, open, won)
      };

      if (isAttended) {
        leadData.sdr_id = pipelineId.toString();
        leadData.sdr_name = sdrName;
        leadData.attended_at = updateTime;
        
        // Registrar evento de atendimento APENAS quando lead é criado já atendido (pipeline individual)
        // Isso significa que o SDR pegou o lead diretamente do pipeline individual
        if (userId) {
          try {
            await createAttendanceEvent({
              user_id: userId.toString(),
              user_name: sdrName,
              timestamp: updateTime,
              deal_id: dealIdStr,
              event_type: 'attended',
              pipeline_id: pipelineId.toString(),
              stage_id: stageId?.toString(),
              metadata: {
                action: 'added',
                is_attended: true,
                is_main_pipeline: false,
                source: 'individual_pipeline',
              },
            });
            console.log(`📝 Evento de atendimento registrado para SDR ${userId} (deal ${dealIdStr}) - Criado já atendido`);
          } catch (error) {
            console.warn('⚠️ Erro ao registrar evento de atendimento (não crítico):', error);
          }
        }
      }

      existingLead = await createLead(leadData);
      
      const status = isMainPipeline ? 'PENDENTE' : 'ATENDIDO por ' + sdrName;
      console.log(`✅ Lead ${dealIdStr} criado via update - Status: ${status}`);
      res.status(201).json({ 
        success: true, 
        message: isAttended ? `Lead atendido por ${sdrName}` : 'Lead pendente',
        lead: existingLead 
      });
      return;
    }

    // Lead existe e ainda NÃO foi atendido
    
    // Se agora está em um funil individual, marcar como atendido
    if (!existingLead.attended_at && isIndividualPipeline) {
      const updatedLead = await attendLead(
        dealIdStr,
        pipelineId.toString(),
        sdrName,
        updateTime
      );

      // Registrar evento de atendimento
      if (userId) {
        try {
          await createAttendanceEvent({
            user_id: userId.toString(),
            user_name: sdrName,
            timestamp: updateTime,
            deal_id: dealIdStr,
            event_type: 'attended',
            pipeline_id: pipelineId.toString(),
            stage_id: stageId?.toString(),
            metadata: {
              action: 'updated',
              is_attended: true,
              is_main_pipeline: false,
            },
          });
          console.log(`📝 Evento de atendimento registrado para SDR ${userId} (deal ${dealIdStr})`);
        } catch (error) {
          console.warn('⚠️ Erro ao registrar evento de atendimento (não crítico):', error);
        }
      }

      console.log(`✅ Lead ${dealIdStr} ATENDIDO por ${sdrName} - SLA calculado!`);
      res.status(200).json({ 
        success: true, 
        message: `Lead atendido por ${sdrName}`,
        lead: updatedLead 
      });
      return;
    }
    
    // Atualizar status do lead (se mudou)
    if (existingLead.status !== dealStatus) {
      await updateLeadStatus(dealIdStr, dealStatus);
      console.log(`🔄 Lead ${dealIdStr} - Status atualizado para: ${dealStatus}`);
    }
    
    // Se está no funil principal e mudou para uma etapa válida, atualizar
    // NÃO registrar evento aqui - apenas mudanças dentro do pipeline principal não contam como jornada
    if (isMainPipeline && isValidSDRStage(stageName)) {
      if (existingLead.stage_name !== stageName) {
        await updateLeadStage(dealIdStr, stageName, stagePriority);
        console.log(`🔄 Lead ${dealIdStr} - Stage atualizado para: ${stageName}`);
      }
      res.status(200).json({ 
        success: true, 
        message: 'Lead atualizado',
        lead: existingLead 
      });
      return;
    }
    
    // Etapa inválida no funil principal - ignorar
    if (isMainPipeline && !isValidSDRStage(stageName)) {
      console.log(`⏭️ Lead ${dealIdStr} movido para etapa "${stageName}" não válida. Ignorando.`);
      res.status(200).json({ 
        success: true, 
        message: `Etapa "${stageName}" não é contabilizada. Ignorado.`
      });
      return;
    }

    console.log(`ℹ️ Lead ${dealIdStr} - nenhuma ação necessária`);
    res.status(200).json({ 
      success: true, 
      message: 'Nenhuma ação necessária',
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
