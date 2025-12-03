/**
 * Configuração do cliente Supabase
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Erro: SUPABASE_URL e SUPABASE_KEY são obrigatórios!');
  console.error('   Certifique-se de criar um arquivo .env com essas variáveis.');
  process.exit(1);
}

// Criar cliente Supabase
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
  },
});

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
