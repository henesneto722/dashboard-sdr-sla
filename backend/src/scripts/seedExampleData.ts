/**
 * Script para inserir dados de exemplo no banco de dados
 * Execute com: npm run seed ou ts-node src/scripts/seedExampleData.ts
 */

import { supabase } from '../config/database.js';
import { LeadSLAInsert } from '../types/index.js';

// SDRs de exemplo
const SDRS = [
  { id: 'sdr_001', name: 'Ana Silva' },
  { id: 'sdr_002', name: 'Carlos Santos' },
  { id: 'sdr_003', name: 'Maria Oliveira' },
  { id: 'sdr_004', name: 'João Pereira' },
  { id: 'sdr_005', name: 'Fernanda Costa' },
];

// Stages e prioridades
const STAGES = [
  { name: 'TEM PERFIL', priority: 1 },
  { name: 'PERFIL MENOR', priority: 2 },
  { name: 'INCONCLUSIVO', priority: 3 },
  { name: 'SEM PERFIL', priority: 4 },
];

/**
 * Gera um timestamp relativo ao agora
 * Suporta expressões como: "2 hours", "1 day", "2 hours - 10 minutes"
 */
function getRelativeTime(interval: string): string {
  const now = new Date();
  const result = new Date(now);
  
  // Processar adições e subtrações
  const parts = interval.split(/\s*-\s*/);
  
  // Processar cada parte
  parts.forEach((part, index) => {
    const isSubtraction = index > 0;
    const match = part.match(/(\d+)\s*(hour|hours|day|days|minute|minutes)/);
    
    if (match) {
      const value = parseInt(match[1]);
      const unit = match[2];
      const multiplier = isSubtraction ? -1 : -1; // Sempre subtrai do agora
      
      if (unit.includes('hour')) {
        result.setHours(result.getHours() + multiplier * value);
      } else if (unit.includes('day')) {
        result.setDate(result.getDate() + multiplier * value);
      } else if (unit.includes('minute')) {
        result.setMinutes(result.getMinutes() + multiplier * value);
      }
    }
  });
  
  return result.toISOString();
}

/**
 * Calcula minutos entre duas datas
 */
function calculateMinutes(enteredAt: string, attendedAt: string): number {
  const entered = new Date(enteredAt);
  const attended = new Date(attendedAt);
  return Math.round((attended.getTime() - entered.getTime()) / (1000 * 60));
}

/**
 * Gera dados de exemplo
 */
function generateExampleData(): LeadSLAInsert[] {
  const data: LeadSLAInsert[] = [];
  let leadCounter = 1;

  // ============================================
  // LEADS ATENDIDOS (com SLA calculado)
  // ============================================

  // Leads atendidos rapidamente (SLA < 15 minutos) - TEM PERFIL
  for (let i = 0; i < 5; i++) {
    const enteredAt = getRelativeTime(`${i + 2} hours`);
    // attended_at deve ser depois de entered_at (10 minutos depois)
    const enteredDate = new Date(enteredAt);
    const attendedAt = new Date(enteredDate.getTime() + 10 * 60000).toISOString();
    const sdr = SDRS[i % SDRS.length];
    
    data.push({
      lead_id: `lead_${String(leadCounter++).padStart(3, '0')}`,
      lead_name: `TechCorp Solutions ${i + 1}`,
      sdr_id: sdr.id,
      sdr_name: sdr.name,
      entered_at: enteredAt,
      attended_at: attendedAt,
      sla_minutes: calculateMinutes(enteredAt, attendedAt),
      source: 'Pipedrive',
      pipeline: 'SDR',
      stage_name: STAGES[0].name,
      stage_priority: STAGES[0].priority,
    });
  }

  // Leads atendidos em tempo moderado (15-20 minutos) - PERFIL MENOR
  for (let i = 0; i < 5; i++) {
    const enteredAt = getRelativeTime(`${i + 1} days`);
    // attended_at deve ser depois de entered_at (18 minutos depois)
    const enteredDate = new Date(enteredAt);
    const attendedAt = new Date(enteredDate.getTime() + 18 * 60000).toISOString();
    const sdr = SDRS[i % SDRS.length];
    
    data.push({
      lead_id: `lead_${String(leadCounter++).padStart(3, '0')}`,
      lead_name: `Smart Business ${i + 1}`,
      sdr_id: sdr.id,
      sdr_name: sdr.name,
      entered_at: enteredAt,
      attended_at: attendedAt,
      sla_minutes: calculateMinutes(enteredAt, attendedAt),
      source: 'Pipedrive',
      pipeline: 'SDR',
      stage_name: STAGES[1].name,
      stage_priority: STAGES[1].priority,
    });
  }

  // Leads atendidos com SLA crítico (> 20 minutos) - INCONCLUSIVO
  for (let i = 0; i < 5; i++) {
    const enteredAt = getRelativeTime(`${i + 6} days`);
    // attended_at deve ser depois de entered_at (30-70 minutos depois)
    const enteredDate = new Date(enteredAt);
    const slaMinutes = 30 + i * 10;
    const attendedAt = new Date(enteredDate.getTime() + slaMinutes * 60000).toISOString();
    const sdr = SDRS[i % SDRS.length];
    
    data.push({
      lead_id: `lead_${String(leadCounter++).padStart(3, '0')}`,
      lead_name: `Mega Corp ${i + 1}`,
      sdr_id: sdr.id,
      sdr_name: sdr.name,
      entered_at: enteredAt,
      attended_at: attendedAt,
      sla_minutes: slaMinutes,
      source: 'Pipedrive',
      pipeline: 'SDR',
      stage_name: STAGES[2].name,
      stage_priority: STAGES[2].priority,
    });
  }

  // Leads com SLA muito alto - SEM PERFIL
  for (let i = 0; i < 5; i++) {
    const enteredAt = getRelativeTime(`${12 + i * 3} days`);
    // attended_at deve ser depois de entered_at (2-6 horas depois)
    const enteredDate = new Date(enteredAt);
    const slaMinutes = 120 + i * 60;
    const attendedAt = new Date(enteredDate.getTime() + slaMinutes * 60000).toISOString();
    const sdr = SDRS[i % SDRS.length];
    
    data.push({
      lead_id: `lead_${String(leadCounter++).padStart(3, '0')}`,
      lead_name: `Standard Business ${i + 1}`,
      sdr_id: sdr.id,
      sdr_name: sdr.name,
      entered_at: enteredAt,
      attended_at: attendedAt,
      sla_minutes: slaMinutes,
      source: 'Pipedrive',
      pipeline: 'SDR',
      stage_name: STAGES[3].name,
      stage_priority: STAGES[3].priority,
    });
  }

  // ============================================
  // LEADS PENDENTES (sem atendimento)
  // ============================================

  // Leads pendentes recentes (últimas horas) - TEM PERFIL
  for (let i = 0; i < 5; i++) {
    const enteredAt = getRelativeTime(`${i * 30} minutes`);
    
    data.push({
      lead_id: `lead_${String(leadCounter++).padStart(3, '0')}`,
      lead_name: `NewTech Solutions ${i + 1}`,
      entered_at: enteredAt,
      source: 'Pipedrive',
      pipeline: 'SDR',
      stage_name: STAGES[0].name,
      stage_priority: STAGES[0].priority,
    });
  }

  // Leads pendentes (último dia) - PERFIL MENOR
  for (let i = 0; i < 5; i++) {
    const enteredAt = getRelativeTime(`${5 + i * 2} hours`);
    
    data.push({
      lead_id: `lead_${String(leadCounter++).padStart(3, '0')}`,
      lead_name: `Medium Business ${i + 1}`,
      entered_at: enteredAt,
      source: 'Pipedrive',
      pipeline: 'SDR',
      stage_name: STAGES[1].name,
      stage_priority: STAGES[1].priority,
    });
  }

  // Leads pendentes (últimos dias) - INCONCLUSIVO
  for (let i = 0; i < 5; i++) {
    const enteredAt = getRelativeTime(`${i + 1} days`);
    
    data.push({
      lead_id: `lead_${String(leadCounter++).padStart(3, '0')}`,
      lead_name: `Uncertain Business ${i + 1}`,
      entered_at: enteredAt,
      source: 'Pipedrive',
      pipeline: 'SDR',
      stage_name: STAGES[2].name,
      stage_priority: STAGES[2].priority,
    });
  }

  // Leads pendentes (últimas semanas) - SEM PERFIL
  for (let i = 0; i < 5; i++) {
    const enteredAt = getRelativeTime(`${6 + i * 2} days`);
    
    data.push({
      lead_id: `lead_${String(leadCounter++).padStart(3, '0')}`,
      lead_name: `Low Priority Business ${i + 1}`,
      entered_at: enteredAt,
      source: 'Pipedrive',
      pipeline: 'SDR',
      stage_name: STAGES[3].name,
      stage_priority: STAGES[3].priority,
    });
  }

  // ============================================
  // DADOS ADICIONAIS PARA ANÁLISE TEMPORAL
  // ============================================

  // Mais leads atendidos distribuídos ao longo do tempo
  for (let sdrIndex = 0; sdrIndex < SDRS.length; sdrIndex++) {
    const sdr = SDRS[sdrIndex];
    
    // Performance variada para cada SDR
    for (let i = 0; i < 4; i++) {
      const daysAgo = 11 + i * 2;
      const enteredAt = getRelativeTime(`${daysAgo} days`);
      const slaMinutes = [5, 10, 15, 20, 30, 40, 50, 60, 120, 240][i + sdrIndex * 2] || 30;
      const attendedAt = new Date(new Date(enteredAt).getTime() + slaMinutes * 60000).toISOString();
      const stageIndex = Math.floor(i / 2) % STAGES.length;
      
      data.push({
        lead_id: `lead_${String(leadCounter++).padStart(3, '0')}`,
        lead_name: `${sdr.name.split(' ')[0]} Lead ${i + 1}`,
        sdr_id: sdr.id,
        sdr_name: sdr.name,
        entered_at: enteredAt,
        attended_at: attendedAt,
        sla_minutes: slaMinutes,
        source: 'Pipedrive',
        pipeline: 'SDR',
        stage_name: STAGES[stageIndex].name,
        stage_priority: STAGES[stageIndex].priority,
      });
    }
  }

  // Mais leads pendentes
  for (let i = 0; i < 8; i++) {
    const enteredAt = getRelativeTime(`${20 + i * 2} hours`);
    const stageIndex = i % STAGES.length;
    
    data.push({
      lead_id: `lead_${String(leadCounter++).padStart(3, '0')}`,
      lead_name: `Waiting Lead ${i + 1}`,
      entered_at: enteredAt,
      source: 'Pipedrive',
      pipeline: 'SDR',
      stage_name: STAGES[stageIndex].name,
      stage_priority: STAGES[stageIndex].priority,
    });
  }

  return data;
}

/**
 * Função principal
 */
async function main() {
  console.log('🌱 Iniciando inserção de dados de exemplo...\n');

  try {
    // Testar conexão
    console.log('🔍 Testando conexão com Supabase...');
    const { error: testError } = await supabase.from('leads_sla').select('id').limit(1);
    
    if (testError && testError.code !== 'PGRST116') {
      console.error('❌ Erro ao conectar:', testError.message);
      process.exit(1);
    }
    
    console.log('✅ Conexão estabelecida!\n');

    // Gerar dados
    console.log('📊 Gerando dados de exemplo...');
    const data = generateExampleData();
    console.log(`✅ ${data.length} registros gerados\n`);

    // Inserir em lotes de 50 para evitar timeout
    const batchSize = 50;
    let inserted = 0;
    let errors = 0;

    console.log('💾 Inserindo dados no banco...\n');

    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      const batchNum = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(data.length / batchSize);

      console.log(`   Processando lote ${batchNum}/${totalBatches} (${batch.length} registros)...`);

      const { error } = await supabase
        .from('leads_sla')
        .insert(batch);

      if (error) {
        console.error(`   ❌ Erro no lote ${batchNum}:`, error.message);
        errors += batch.length;
      } else {
        inserted += batch.length;
        console.log(`   ✅ Lote ${batchNum} inserido com sucesso`);
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('📊 RESUMO DA INSERÇÃO');
    console.log('='.repeat(50));
    console.log(`✅ Registros inseridos: ${inserted}`);
    console.log(`❌ Erros: ${errors}`);
    console.log(`📈 Total processado: ${data.length}`);
    console.log('='.repeat(50) + '\n');

    // Verificar dados inseridos
    console.log('🔍 Verificando dados inseridos...\n');

    const { data: stats, error: statsError } = await supabase
      .from('leads_sla')
      .select('*', { count: 'exact', head: false });

    if (!statsError && stats) {
      const total = stats.length;
      const atendidos = stats.filter((s: any) => s.attended_at).length;
      const pendentes = total - atendidos;

      console.log(`📊 Estatísticas:`);
      console.log(`   Total de leads: ${total}`);
      console.log(`   Leads atendidos: ${atendidos}`);
      console.log(`   Leads pendentes: ${pendentes}\n`);

      // Contar por stage
      const byStage = stats.reduce((acc: any, s: any) => {
        const stage = s.stage_name || 'Sem stage';
        acc[stage] = (acc[stage] || 0) + 1;
        return acc;
      }, {});

      console.log('📋 Leads por stage:');
      Object.entries(byStage).forEach(([stage, count]) => {
        console.log(`   ${stage}: ${count}`);
      });
    }

    console.log('\n✅ Dados de exemplo inseridos com sucesso!');
    console.log('🎉 Agora você pode testar o dashboard!\n');

  } catch (error: any) {
    console.error('\n❌ Erro ao inserir dados:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Executar se chamado diretamente
main().catch(console.error);

export { main as seedExampleData };

