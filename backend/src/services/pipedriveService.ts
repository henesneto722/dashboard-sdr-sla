/**
 * Serviço de integração com a API do Pipedrive
 * Busca automaticamente nomes de pipelines e stages
 */

const PIPEDRIVE_API_TOKEN = process.env.PIPEDRIVE_API_TOKEN;
const PIPEDRIVE_API_URL = 'https://api.pipedrive.com/v1';

// Tipos para resposta da API do Pipedrive
interface PipedriveApiResponse {
  success: boolean;
  data: any[] | null;
}

// Cache para evitar múltiplas requisições
let pipelinesCache: Map<string, PipelineInfo> | null = null;
let stagesCache: Map<string, StageInfo> | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

interface PipelineInfo {
  id: number;
  name: string;
  isSDR: boolean; // true se é relacionado a SDR
  isMainSDR: boolean; // true se é o funil principal "SDR" (leads pendentes)
  isIndividualCloser: boolean; // true se é funil individual "CLOSER - NOME" ou "NOME - CLOSER JUNIOR" (leads atendidos)
}

interface StageInfo {
  id: number;
  name: string;
  pipeline_id: number;
  order_nr: number;
}

/**
 * Verifica se o cache ainda é válido
 */
function isCacheValid(): boolean {
  return cacheTimestamp > 0 && (Date.now() - cacheTimestamp) < CACHE_TTL;
}

/**
 * Busca todos os pipelines do Pipedrive
 */
async function fetchPipelines(): Promise<PipelineInfo[]> {
  if (!PIPEDRIVE_API_TOKEN) {
    console.error('❌ PIPEDRIVE_API_TOKEN não configurado');
    console.error('   Configure a variável de ambiente PIPEDRIVE_API_TOKEN no arquivo .env');
    return [];
  }

  try {
    console.log(`🔍 [fetchPipelines] Buscando pipelines do Pipedrive...`);
    const response = await fetch(
      `${PIPEDRIVE_API_URL}/pipelines?api_token=${PIPEDRIVE_API_TOKEN}`
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ [fetchPipelines] HTTP error! status: ${response.status}`);
      console.error(`   Resposta: ${errorText}`);
      throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`);
    }
    
    const data = await response.json() as PipedriveApiResponse;
    
    if (!data.success) {
      console.error('❌ [fetchPipelines] Erro na resposta da API:', data);
      return [];
    }
    
    if (!data.data || data.data.length === 0) {
      console.warn('⚠️ [fetchPipelines] Nenhum pipeline encontrado na resposta da API');
      return [];
    }
    
    console.log(`✅ [fetchPipelines] ${data.data.length} pipelines encontrados`);

    return data.data.map((p: any) => {
      const nameLower = p.name.toLowerCase().trim();
      // Lógica mais flexível: 
      // - Pipeline principal é aquele que contém "sdr" mas NÃO contém "-" (não é individual)
      // - Ou é exatamente "sdr"
      const isMainSDR = (nameLower === 'sdr') || 
                       (nameLower.includes('sdr') && !nameLower.includes('-') && !nameLower.includes('individual'));
      // Detecta funis individuais de CLOSER:
      // - "CLOSER - NOME" ou "CLOSER-NOME"
      // - "NOME - CLOSER JUNIOR" ou "NOME-CLOSER JUNIOR"
      const isIndividualCloser = 
        nameLower.includes('closer -') || 
        nameLower.includes('closer-') ||
        (nameLower.includes('closer junior') && nameLower.includes('-'));
      
      return {
        id: p.id,
        name: p.name,
        isSDR: isMainSDR, // Apenas o funil principal SDR
        isMainSDR,
        isIndividualCloser
      };
    });
  } catch (error) {
    console.error('❌ Erro ao buscar pipelines do Pipedrive:', error);
    return [];
  }
}

/**
 * Busca todos os stages do Pipedrive
 */
async function fetchStages(): Promise<StageInfo[]> {
  if (!PIPEDRIVE_API_TOKEN) {
    console.error('❌ PIPEDRIVE_API_TOKEN não configurado');
    return [];
  }

  try {
    const response = await fetch(
      `${PIPEDRIVE_API_URL}/stages?api_token=${PIPEDRIVE_API_TOKEN}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json() as PipedriveApiResponse;
    
    if (!data.success || !data.data) {
      console.error('❌ Erro ao buscar stages:', data);
      return [];
    }

    return data.data.map((s: any) => ({
      id: s.id,
      name: s.name,
      pipeline_id: s.pipeline_id,
      order_nr: s.order_nr
    }));
  } catch (error) {
    console.error('❌ Erro ao buscar stages do Pipedrive:', error);
    return [];
  }
}

/**
 * Carrega e cacheia os dados do Pipedrive
 */
async function loadPipedriveData(): Promise<void> {
  if (isCacheValid() && pipelinesCache && stagesCache) {
    return;
  }

  console.log('🔄 Carregando dados do Pipedrive...');
  
  const [pipelines, stages] = await Promise.all([
    fetchPipelines(),
    fetchStages()
  ]);

  pipelinesCache = new Map();
  stagesCache = new Map();

  for (const pipeline of pipelines) {
    pipelinesCache.set(pipeline.id.toString(), pipeline);
  }

  for (const stage of stages) {
    stagesCache.set(stage.id.toString(), stage);
  }

  cacheTimestamp = Date.now();
  
  console.log(`✅ Carregados ${pipelines.length} pipelines e ${stages.length} stages`);
  
  // Log dos pipelines SDR encontrados
  const sdrPipelines = pipelines.filter(p => p.isSDR);
  if (sdrPipelines.length > 0) {
    console.log('📋 Pipelines SDR (principal) encontrados:');
    sdrPipelines.forEach(p => console.log(`   - ${p.name} (ID: ${p.id})`));
  }
  
  // Log dos pipelines CLOSER encontrados
  const closerPipelines = pipelines.filter(p => p.isIndividualCloser);
  if (closerPipelines.length > 0) {
    console.log('📋 Pipelines CLOSER encontrados:');
    closerPipelines.forEach(p => console.log(`   - ${p.name} (ID: ${p.id})`));
  }
}

/**
 * Obtém informações de um pipeline pelo ID
 */
export async function getPipelineInfo(pipelineId: string | number): Promise<PipelineInfo | null> {
  await loadPipedriveData();
  return pipelinesCache?.get(pipelineId.toString()) || null;
}

/**
 * Obtém informações de um stage pelo ID
 */
export async function getStageInfo(stageId: string | number): Promise<StageInfo | null> {
  await loadPipedriveData();
  return stagesCache?.get(stageId.toString()) || null;
}

/**
 * Verifica se um pipeline é de SDR (funil principal)
 */
export async function isSDRPipeline(pipelineId: string | number): Promise<boolean> {
  const pipeline = await getPipelineInfo(pipelineId);
  return pipeline?.isSDR || false;
}

/**
 * Verifica se é o funil principal "SDR" (leads entram aqui como pendentes)
 */
export async function isMainSDRPipeline(pipelineId: string | number): Promise<boolean> {
  const pipeline = await getPipelineInfo(pipelineId);
  return pipeline?.isMainSDR || false;
}

/**
 * Obtém o ID do pipeline principal "SDR"
 */
export async function getMainSDRPipelineId(): Promise<string | null> {
  await loadPipedriveData();
  
  if (!pipelinesCache) {
    console.log('⚠️ [getMainSDRPipelineId] Cache de pipelines não disponível');
    return null;
  }
  
  const allPipelines = Array.from(pipelinesCache.values());
  console.log(`📋 [getMainSDRPipelineId] Total de pipelines no cache: ${allPipelines.length}`);
  
  const sdrPipelines = allPipelines.filter(p => p.isSDR);
  console.log(`📋 [getMainSDRPipelineId] Pipelines SDR encontrados (${sdrPipelines.length}):`, 
    sdrPipelines.map(p => ({ id: p.id, name: p.name, isMainSDR: p.isMainSDR })));
  
  const mainPipeline = allPipelines.find(p => p.isMainSDR);
  
  if (mainPipeline) {
    console.log(`✅ [getMainSDRPipelineId] Pipeline principal SDR encontrado: "${mainPipeline.name}" (ID: ${mainPipeline.id})`);
    return mainPipeline.id.toString();
  } else {
    console.log(`⚠️ [getMainSDRPipelineId] Pipeline principal SDR NÃO encontrado!`);
    return null;
  }
}

/**
 * Verifica se é um funil individual de CLOSER "CLOSER - NOME" ou "NOME - CLOSER JUNIOR" (leads atendidos)
 */
export async function isIndividualCloserPipeline(pipelineId: string | number): Promise<boolean> {
  const pipeline = await getPipelineInfo(pipelineId);
  return pipeline?.isIndividualCloser || false;
}

/**
 * Extrai o nome do SDR do nome do pipeline
 * Ex: "CLOSER - João" → "João"
 * Se for o funil "SDR" principal, retorna "SDR Geral"
 */
export async function getSDRNameFromPipelineId(pipelineId: string | number): Promise<string> {
  const pipeline = await getPipelineInfo(pipelineId);
  
  if (!pipeline) {
    return `SDR Pipeline ${pipelineId}`;
  }



  // Se for o funil "SDR" principal
  if (pipeline.isMainSDR) {
    return 'SDR Geral';
  }

  // Se for um funil individual de CLOSER, extrai o nome
  if (pipeline.isIndividualCloser) {
    const nameLower = pipeline.name.toLowerCase();
    
    // Se for padrão "NOME - CLOSER JUNIOR", extrai o nome antes do "-"
    if (nameLower.includes('closer junior') && nameLower.includes('-')) {
      const parts = pipeline.name.split('-');
      if (parts.length > 0) {
        return parts[0].trim();
      }
    }
    
    // Se for padrão "CLOSER - NOME", extrai o nome removendo "CLOSER -" ou "CLOSER-"
    const name = pipeline.name
      .replace(/\s*CLOSER\s*-\s*/i, '')
      .trim();
    
    return name || pipeline.name;
  }

  return pipeline.name;
}

/**
 * Obtém o nome do stage pelo ID
 */
export async function getStageName(stageId: string | number): Promise<string> {
  const stage = await getStageInfo(stageId);
  return stage?.name || `Stage ${stageId}`;
}

/**
 * Obtém a prioridade do stage baseado no nome
 * LEAD FORMULÁRIO = 1 (maior prioridade)
 * LEAD CHATBOX = 2
 * LEAD INSTAGRAM = 3
 * ÁUREA FINAL = 4
 * FABIO FINAL = 5 (menor prioridade)
 */
export function getStagePriority(stageName: string): number {
  const name = stageName.toUpperCase().trim();
  
  if (name.includes('LEAD FORMULÁRIO') || name.includes('LEAD FORMULARIO')) return 1;
  if (name.includes('LEAD CHATBOX')) return 2;
  if (name.includes('LEAD INSTAGRAM')) return 3;
  if (name.includes('ÁUREA FINAL') || name.includes('AUREA FINAL')) return 4;
  if (name.includes('FABIO FINAL')) return 5;
  
  return 99; // Outros stages
}

/**
 * Força a recarga do cache
 */
export function invalidateCache(): void {
  cacheTimestamp = 0;
  pipelinesCache = null;
  stagesCache = null;
  console.log('🔄 Cache do Pipedrive invalidado');
}

/**
 * Lista todos os pipelines SDR (principal) (principal)
 */
export async function listSDRPipelines(): Promise<PipelineInfo[]> {
  await loadPipedriveData();
  
  if (!pipelinesCache) return [];
  
  return Array.from(pipelinesCache.values()).filter(p => p.isSDR);
}

/**
 * Lista todos os pipelines CLOSER (individuais)
 */
export async function listCloserPipelines(): Promise<PipelineInfo[]> {
  await loadPipedriveData();
  
  if (!pipelinesCache) return [];
  
  return Array.from(pipelinesCache.values()).filter(p => p.isIndividualCloser);
}

/**
 * Lista TODOS os pipelines (para debug)
 */
export async function listAllPipelines(): Promise<PipelineInfo[]> {
  await loadPipedriveData();
  
  if (!pipelinesCache) return [];
  
  return Array.from(pipelinesCache.values());
}
