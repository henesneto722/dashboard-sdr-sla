-- ============================================
-- Migração: Adicionar coluna 'status' à tabela leads_sla
-- Data: Dezembro 2024
-- Descrição: Adiciona campo para armazenar status do Pipedrive (lost, open, won)
-- ============================================

-- Adicionar coluna status se não existir
ALTER TABLE leads_sla
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT NULL;

-- Criar índice para otimizar queries que filtram por status
CREATE INDEX IF NOT EXISTS idx_leads_sla_status ON leads_sla(status);

-- Comentário na coluna
COMMENT ON COLUMN leads_sla.status IS 'Status do lead no Pipedrive (lost, open, won)';


