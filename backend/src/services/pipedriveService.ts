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
  isSDR: boolean; // true se o nome contém "- SDR"
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
    return [];
  }

  try {
    const response = await fetch(
      `${PIPEDRIVE_API_URL}/pipelines?api_token=${PIPEDRIVE_API_TOKEN}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json() as PipedriveApiResponse;
    
    if (!data.success || !data.data) {
      console.error('❌ Erro ao buscar pipelines:', data);
      return [];
    }

    return data.data.map((p: any) => ({
      id: p.id,
      name: p.name,
      // Detecta funis SDR: contém "- SDR", "-SDR", ou é exatamente "SDR"
      isSDR: p.name.toLowerCase().includes('- sdr') 
        || p.name.toLowerCase().includes('-sdr')
        || p.name.toLowerCase().trim() === 'sdr'
    }));
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
    console.log('📋 Pipelines SDR encontrados:');
    sdrPipelines.forEach(p => console.log(`   - ${p.name} (ID: ${p.id})`));
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
 * Verifica se um pipeline é de SDR (nome contém "- SDR")
 */
export async function isSDRPipeline(pipelineId: string | number): Promise<boolean> {
  const pipeline = await getPipelineInfo(pipelineId);
  return pipeline?.isSDR || false;
}

/**
 * Extrai o nome do SDR do nome do pipeline
 * Ex: "João - SDR" → "João"
 * Se for o funil "SDR" principal, retorna "SDR Geral"
 */
export async function getSDRNameFromPipelineId(pipelineId: string | number): Promise<string> {
  const pipeline = await getPipelineInfo(pipelineId);
  
  if (!pipeline) {
    return `SDR Pipeline ${pipelineId}`;
  }

  if (!pipeline.isSDR) {
    return pipeline.name;
  }

  // Se for o funil "SDR" principal (nome é exatamente "SDR")
  if (pipeline.name.toLowerCase().trim() === 'sdr') {
    return 'SDR Geral';
  }

  // Extrai o nome do SDR removendo "- SDR" ou "-SDR"
  const name = pipeline.name
    .replace(/\s*-\s*SDR\s*/i, '')
    .trim();
  
  return name || pipeline.name;
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
 * TEM PERFIL = 1 (maior prioridade)
 * PERFIL MENOR = 2
 * INCONCLUSIVO = 3
 * SEM PERFIL = 4 (menor prioridade)
 */
export function getStagePriority(stageName: string): number {
  const name = stageName.toUpperCase().trim();
  
  if (name.includes('TEM PERFIL')) return 1;
  if (name.includes('PERFIL MENOR')) return 2;
  if (name.includes('INCONCLUSIVO')) return 3;
  if (name.includes('SEM PERFIL')) return 4;
  
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
 * Lista todos os pipelines SDR
 */
export async function listSDRPipelines(): Promise<PipelineInfo[]> {
  await loadPipedriveData();
  
  if (!pipelinesCache) return [];
  
  return Array.from(pipelinesCache.values()).filter(p => p.isSDR);
}

