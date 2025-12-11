/**
 * Configuração do cliente Supabase
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// Logs de diagnóstico
console.log('\n🔍 [DIAGNÓSTICO SUPABASE] Verificando configuração...');
console.log('📋 SUPABASE_URL:', supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : '❌ NÃO DEFINIDO');
console.log('📋 SUPABASE_KEY:', supabaseKey ? `${supabaseKey.substring(0, 5)}...` : '❌ NÃO DEFINIDO');

if (supabaseUrl) {
  const hasHttps = supabaseUrl.startsWith('https://');
  console.log('🔒 URL usa HTTPS:', hasHttps ? '✅ Sim' : '❌ Não');
  
  if (!hasHttps) {
    console.warn('⚠️  AVISO: URL do Supabase deve começar com https://');
  }
}

if (!supabaseUrl || !supabaseKey) {
  console.error('\n❌ Erro: SUPABASE_URL e SUPABASE_KEY são obrigatórios!');
  console.error('   Certifique-se de criar um arquivo .env com essas variáveis.');
  console.error('   Exemplo de .env:');
  console.error('   SUPABASE_URL=https://seu-projeto.supabase.co');
  console.error('   SUPABASE_KEY=sua-anon-key-aqui\n');
  process.exit(1);
}

// Criar cliente Supabase
console.log('🔌 Criando cliente Supabase...');
let supabase: SupabaseClient;
try {
  supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
    },
  });
  console.log('✅ Cliente Supabase criado com sucesso!\n');
} catch (error) {
  console.error('❌ Erro ao criar cliente Supabase:', error);
  if (error instanceof Error) {
    console.error('   Mensagem:', error.message);
    console.error('   Stack:', error.stack);
  }
  throw error;
}

export { supabase };

/**
 * Testa a conexão com o Supabase
 */
export async function testConnection(): Promise<boolean> {
  try {
    const { error } = await supabase.from('leads_sla').select('id').limit(1);
    
    if (error && error.code !== 'PGRST116') {
      // PGRST116 = tabela não existe ainda (ok durante setup inicial)
      console.error('❌ Erro ao conectar com Supabase:', error.message);
      return false;
    }
    
    console.log('✅ Conexão com Supabase estabelecida!');
    return true;
  } catch (err) {
    console.error('❌ Erro ao testar conexão:', err);
    return false;
  }
}

export default supabase;
