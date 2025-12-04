-- Migração: Adicionar colunas stage_name e stage_priority
-- Execute este SQL no Supabase SQL Editor

-- Adicionar coluna stage_name
ALTER TABLE leads_sla 
ADD COLUMN IF NOT EXISTS stage_name VARCHAR(100);

-- Adicionar coluna stage_priority
ALTER TABLE leads_sla 
ADD COLUMN IF NOT EXISTS stage_priority INTEGER DEFAULT 99;

-- Criar índice para ordenação por prioridade
CREATE INDEX IF NOT EXISTS idx_leads_sla_stage_priority ON leads_sla(stage_priority);

-- Verificar se as colunas foram criadas
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'leads_sla';

