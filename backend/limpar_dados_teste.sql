-- ============================================
-- LIMPAR DADOS DE TESTE DO SUPABASE
-- Execute este script no SQL Editor do Supabase
-- ============================================
-- 
-- ⚠️ ATENÇÃO: Este script apaga TODOS os dados da tabela leads_sla
-- Use apenas se quiser limpar dados de teste antes de receber dados reais
-- ============================================

-- Verificar quantos registros existem antes de apagar
SELECT 
    'Registros antes de apagar' AS info,
    COUNT(*) AS total
FROM leads_sla;

-- ============================================
-- APAGAR TODOS OS DADOS
-- ============================================

-- Apagar todos os registros da tabela
DELETE FROM leads_sla;

-- ============================================
-- VERIFICAR SE FOI APAGADO
-- ============================================

-- Verificar quantos registros restam (deve ser 0)
SELECT 
    'Registros após apagar' AS info,
    COUNT(*) AS total
FROM leads_sla;

-- ============================================
-- RESETAR SEQUÊNCIAS (se houver)
-- ============================================

-- Se houver alguma sequência relacionada, resetar (geralmente não necessário para UUID)
-- RESET SEQUENCE IF EXISTS leads_sla_id_seq RESTART WITH 1;

-- ============================================
-- VERIFICAÇÃO FINAL
-- ============================================

-- Verificar estrutura da tabela (deve estar intacta)
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'leads_sla'
ORDER BY ordinal_position;

-- ============================================
-- FIM DO SCRIPT
-- ============================================
-- ✅ Dados de teste apagados com sucesso!
-- ✅ Tabela pronta para receber dados reais do Pipedrive
-- ============================================





