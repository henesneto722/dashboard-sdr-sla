/**
 * Handler para webhooks do Pipedrive
 * Processa eventos de criação e atualização de Deals
 * 
 * REGRAS DE NEGÓCIO:
 * 
 * 1. FUNIL PRINCIPAL "SDR":
 *    - Apenas contabiliza deals nas etapas: Lead Formulário, Lead Chatbox, Lead Instagram, ÁUREA FINAL, FABIO FINAL
 *    - Outras etapas são IGNORADAS completamente
 *    - Prioridade: Lead Formulário (1) > Lead Chatbox (2) > Lead Instagram (3) > ÁUREA FINAL (4) > FABIO FINAL (5)
 * 
 * 2. FUNIS ESPECÍFICOS "CLOSER - NOME":
 *    - Quando deal é movido do funil "SDR" para um funil específico → ATENDIDO
 *    - Mudanças de etapa DENTRO de funis específicos são IGNORADAS
 * 
 * 3. CÁLCULO DE SLA:
 *    - Tempo entre entrada no funil "SDR" e movimentação para funil específico
 */

// Etapas válidas do funil principal "SDR" (EXTREMA IMPORTÂNCIA: apenas essas são contabilizadas)
const VALID_SDR_STAGES = [
  'lead formulário',
  'lead formulario',
  'lead chatbot',
  'leads instagram',
  'áurea finalizou',
  'aurea finalizou',
  'fabio finalizou',
];

// Etapas válidas dos funis específicos "CLOSER - NOME" ou "NOME - CLOSER JUNIOR" (EXTREMA IMPORTÂNCIA: apenas essas são contabilizadas)
const VALID_CLOSER_STAGES = [
  'sdr',
  'sdr com perfil',
];

// Verifica se uma etapa é válida para contabilização no funil principal "SDR"
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

// Verifica se uma etapa é válida para contabilização em funis específicos CLOSER
function isValidCloserStage(stageName: string | null): boolean {
  if (!stageName) {
    console.log('⚠️ isValidCloserStage: stageName é null/undefined');
    return false;
  }
  const normalized = stageName.toLowerCase().trim();
  const isValid = VALID_CLOSER_STAGES.some(valid => normalized === valid || normalized.includes(valid));
  console.log(`🔍 isValidCloserStage: "${stageName}" → "${normalized}" → válido: ${isValid}`);
  return isValid;
}

import { Request, Response } from 'express';
import { createLead, attendLead, findLeadByPipedriveId, updateLeadStage, updateLeadStatus, deleteLeadByPipedriveId } from '../services/leadsService.js';
import { createAttendanceEvent } from '../services/sdrAttendanceService.js';
import { 
  isSDRPipeline,
  isMainSDRPipeline,
  isIndividualCloserPipeline,
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

    // Verificar se é um pipeline relevante (SDR principal ou CLOSER individual)
    if (!pipelineId) {
      console.log('⚠️ Webhook sem pipeline_id');
      res.status(200).json({ 
        success: true, 
        message: 'Webhook recebido mas sem pipeline_id' 
      });
      return;
    }

    // Verificar se é o funil principal "SDR" ou um funil individual CLOSER
    const isMain = await isMainSDRPipeline(pipelineId);
    const isIndividual = await isIndividualCloserPipeline(pipelineId);
    
    // Se não é nem funil principal SDR nem funil CLOSER individual, ignorar
    if (!isMain && !isIndividual) {
      console.log(`⏭️ Pipeline ${pipelineId} não é relevante (não é SDR principal nem CLOSER individual). Ignorando.`);
      res.status(200).json({ 
        success: true, 
        message: 'Pipeline não é relevante. Ignorado.' 
      });
      return;
    }

    // Buscar nome do SDR e do stage
    const sdrName = await getSDRNameFromPipelineId(pipelineId);
    const stageName = stageId ? await getStageName(stageId) : 'Desconhecido';
    const stagePriority = getStagePriority(stageName);
    
    // Se lost_time não é nulo, o deal foi perdido
    const isLost = lostTime !== null && lostTime !== undefined;
    const finalStatus = isLost ? 'lost' : dealStatus;

    console.log(`📊 Pipeline: ${isMain ? 'PRINCIPAL (SDR)' : isIndividual ? 'CLOSER INDIVIDUAL (' + sdrName + ')' : 'OUTRO'}`);
    console.log(`👤 Closer/SDR: ${sdrName}, Stage: ${stageName} (prioridade: ${stagePriority})`);
    console.log(`🔍 isMain: ${isMain}, isIndividual: ${isIndividual}`);

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

    // Se está no funil individual CLOSER, validar etapa antes de marcar como atendido
    let isAttended = false;
    if (isIndividualPipeline) {
      // EXTREMA IMPORTÂNCIA: Apenas etapas válidas nas pipelines específicas contam como atendido
      if (isValidCloserStage(stageName)) {
        isAttended = true;
      } else {
        console.log(`⏭️ Deal ${dealIdStr} criado em pipeline CLOSER mas etapa "${stageName}" não é válida. Ignorando.`);
        res.status(200).json({ 
          success: true, 
          message: `Etapa "${stageName}" não é válida em pipeline CLOSER. Ignorado.`
        });
        return;
      }
    }
    
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

    // Se está no funil individual CLOSER com etapa válida, marcar como atendido
    if (isAttended) {
      leadData.sdr_id = pipelineId.toString();
      leadData.sdr_name = sdrName;
      leadData.attended_at = updateTime;
      
      // Registrar evento de atendimento APENAS quando lead é criado já no pipeline individual CLOSER
      // Isso significa que o Closer pegou o lead diretamente (sem passar pelo pipeline principal)
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
          console.log(`📝 Evento de atendimento registrado para Closer ${userId} (deal ${dealIdStr}) - Criado já atendido`);
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
      
      // Se está no funil individual CLOSER, validar etapa antes de marcar como atendido
      let isAttended = false;
      if (isIndividualPipeline) {
        // EXTREMA IMPORTÂNCIA: Apenas etapas válidas nas pipelines específicas contam como atendido
        if (isValidCloserStage(stageName)) {
          isAttended = true;
        } else {
          console.log(`⏭️ Deal ${dealIdStr} criado em pipeline CLOSER mas etapa "${stageName}" não é válida. Ignorando.`);
          res.status(200).json({ 
            success: true, 
            message: `Etapa "${stageName}" não é válida em pipeline CLOSER. Ignorado.`
          });
          return;
        }
      }
      
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
        
        // Registrar evento de atendimento APENAS quando lead é criado já atendido (pipeline individual CLOSER)
        // Isso significa que o Closer pegou o lead diretamente do pipeline individual
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
            console.log(`📝 Evento de atendimento registrado para Closer ${userId} (deal ${dealIdStr}) - Criado já atendido`);
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

    // REGRA CRÍTICA: Se lead já foi atendido, IGNORAR COMPLETAMENTE qualquer movimentação
    if (existingLead.attended_at) {
      console.log(`⏭️ Lead ${dealIdStr} já foi atendido. Ignorando completamente qualquer movimentação.`);
      res.status(200).json({ 
        success: true, 
        message: 'Lead já atendido. Movimentações são ignoradas.'
      });
      return;
    }

    // Lead existe e ainda NÃO foi atendido
    
    // Se agora está em um funil individual CLOSER, validar etapa antes de marcar como atendido
    if (isIndividualPipeline) {
      // EXTREMA IMPORTÂNCIA: Apenas etapas válidas nas pipelines específicas contam como atendido
      if (!isValidCloserStage(stageName)) {
        console.log(`⏭️ Lead ${dealIdStr} em pipeline CLOSER mas etapa "${stageName}" não é válida. Ignorando.`);
        res.status(200).json({ 
          success: true, 
          message: `Etapa "${stageName}" não é válida em pipeline CLOSER. Ignorado.`
        });
        return;
      }
      
      // Etapa válida em pipeline CLOSER → ATENDIDO
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
          console.log(`📝 Evento de atendimento registrado para Closer ${userId} (deal ${dealIdStr})`);
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
    
    // Se está no funil principal "SDR"
    if (isMainPipeline) {
      // Se mudou para uma etapa válida, apenas atualizar stage
      if (isValidSDRStage(stageName)) {
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
      
      // Se estava em etapa válida e agora está em etapa inválida → MARCAR COMO INVALIDO
      const wasInValidStage = existingLead.stage_name && isValidSDRStage(existingLead.stage_name);
      if (wasInValidStage && !isValidSDRStage(stageName)) {
        console.log(`⚠️ Lead ${dealIdStr} saiu da etapa válida "${existingLead.stage_name}" para etapa inválida "${stageName}". Marcando como INVALIDO.`);
        
        await updateLeadStatus(dealIdStr, 'INVALIDO');
        res.status(200).json({ 
          success: true, 
          message: `Lead marcado como INVALIDO - saiu das etapas contabilizadas`
        });
        return;
      }
      
      // Se não estava em etapa válida antes, apenas ignorar
      console.log(`⏭️ Lead ${dealIdStr} em etapa "${stageName}" não válida. Ignorando.`);
      res.status(200).json({ 
        success: true, 
        message: `Etapa "${stageName}" não é contabilizada. Ignorado.`
      });
      return;
    }
    
    // Se não é nem pipeline principal nem pipeline específica CLOSER → IGNORAR
    console.log(`⏭️ Pipeline ${pipelineId} não é relevante. Ignorando.`);
    res.status(200).json({ 
      success: true, 
      message: 'Pipeline não é relevante. Ignorado.'
    });
    return;

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
