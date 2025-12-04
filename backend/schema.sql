-- ============================================
-- Schema SQL para Supabase
-- Tabela: leads_sla
-- Sistema de Monitoramento de SLA para SDRs
-- ============================================

-- Habilitar extensão UUID se não existir
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Criar tabela leads_sla
CREATE TABLE IF NOT EXISTS leads_sla (
    -- Identificador único do registro
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Dados do Lead (Pipedrive)
    lead_id VARCHAR(100) NOT NULL UNIQUE,
    lead_name VARCHAR(255) NOT NULL,
    
    -- Dados do SDR responsável
    sdr_id VARCHAR(100),
    sdr_name VARCHAR(255),
    
    -- Timestamps de SLA
    entered_at TIMESTAMPTZ NOT NULL,
    attended_at TIMESTAMPTZ,
    
    -- SLA calculado em minutos
    sla_minutes INTEGER,
    
    -- Campos adicionais para compatibilidade com frontend
    source VARCHAR(100) DEFAULT 'Pipedrive',
    pipeline VARCHAR(100) DEFAULT 'Default',
    
    -- Metadados
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para otimização de queries
CREATE INDEX IF NOT EXISTS idx_leads_sla_entered_at ON leads_sla(entered_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_sla_sdr_id ON leads_sla(sdr_id);
CREATE INDEX IF NOT EXISTS idx_leads_sla_lead_id ON leads_sla(lead_id);
CREATE INDEX IF NOT EXISTS idx_leads_sla_attended_at ON leads_sla(attended_at);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para updated_at
DROP TRIGGER IF EXISTS trigger_update_leads_sla_updated_at ON leads_sla;
CREATE TRIGGER trigger_update_leads_sla_updated_at
    BEFORE UPDATE ON leads_sla
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Row Level Security (RLS) - Opcional
-- ============================================

-- Habilitar RLS na tabela
ALTER TABLE leads_sla ENABLE ROW LEVEL SECURITY;

-- Política para permitir todas as operações (ajuste conforme necessidade)
CREATE POLICY "Allow all operations" ON leads_sla
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- ============================================
-- Views úteis para o Dashboard
-- ============================================

-- View: Métricas gerais dos últimos 30 dias
CREATE OR REPLACE VIEW v_metrics_general AS
SELECT 
    COUNT(*) AS total_leads,
    COUNT(attended_at) AS attended_leads,
    COUNT(*) FILTER (WHERE attended_at IS NULL) AS pending_leads,
    ROUND(AVG(sla_minutes) FILTER (WHERE sla_minutes IS NOT NULL), 2) AS avg_sla_minutes,
    MAX(sla_minutes) AS max_sla_minutes,
    MIN(sla_minutes) FILTER (WHERE sla_minutes IS NOT NULL) AS min_sla_minutes
FROM leads_sla
WHERE entered_at >= NOW() - INTERVAL '30 days';

-- View: Ranking de SDRs
CREATE OR REPLACE VIEW v_sdr_ranking AS
SELECT 
    sdr_id,
    sdr_name,
    COUNT(*) AS leads_attended,
    ROUND(AVG(sla_minutes), 2) AS average_time
FROM leads_sla
WHERE 
    entered_at >= NOW() - INTERVAL '30 days'
    AND sla_minutes IS NOT NULL
    AND sdr_id IS NOT NULL
GROUP BY sdr_id, sdr_name
ORDER BY average_time ASC;

-- View: Performance por hora
CREATE OR REPLACE VIEW v_hourly_performance AS
SELECT 
    EXTRACT(HOUR FROM attended_at) AS hour,
    COUNT(*) AS count,
    ROUND(AVG(sla_minutes), 2) AS avg_sla,
    CASE 
        WHEN AVG(sla_minutes) < 15 THEN 'Bom'
        WHEN AVG(sla_minutes) < 20 THEN 'Moderado'
        ELSE 'Crítico'
    END AS status
FROM leads_sla
WHERE 
    entered_at >= NOW() - INTERVAL '30 days'
    AND attended_at IS NOT NULL
    AND sla_minutes IS NOT NULL
GROUP BY EXTRACT(HOUR FROM attended_at)
ORDER BY hour;

-- ============================================
-- Comentários nas colunas
-- ============================================

COMMENT ON TABLE leads_sla IS 'Tabela principal para monitoramento de SLA de SDRs';
COMMENT ON COLUMN leads_sla.id IS 'UUID único do registro';
COMMENT ON COLUMN leads_sla.lead_id IS 'ID original do lead no Pipedrive';
COMMENT ON COLUMN leads_sla.lead_name IS 'Nome do lead';
COMMENT ON COLUMN leads_sla.sdr_id IS 'ID do SDR responsável pelo atendimento';
COMMENT ON COLUMN leads_sla.sdr_name IS 'Nome do SDR responsável';
COMMENT ON COLUMN leads_sla.entered_at IS 'Timestamp de entrada do lead no funil';
COMMENT ON COLUMN leads_sla.attended_at IS 'Timestamp do primeiro atendimento';
COMMENT ON COLUMN leads_sla.sla_minutes IS 'Tempo de atendimento calculado em minutos';
COMMENT ON COLUMN leads_sla.source IS 'Fonte de origem do lead';
COMMENT ON COLUMN leads_sla.pipeline IS 'Pipeline do Pipedrive';



