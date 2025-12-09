-- ============================================
-- DADOS DE EXEMPLO PARA TESTE DO DASHBOARD
-- Execute este script no SQL Editor do Supabase
-- ============================================
-- 
-- Este script:
-- 1. Cria a tabela leads_sla (se não existir)
-- 2. Cria índices e triggers
-- 3. Insere dados de exemplo variados:
--    - Leads pendentes e atendidos
--    - Diferentes SDRs
--    - Diferentes stages e prioridades
--    - Diferentes tempos de SLA
--    - Dados distribuídos nos últimos 30 dias
-- ============================================

-- ============================================
-- PASSO 1: CRIAR TABELA (se não existir)
-- ============================================

-- Habilitar extensão UUID se não existir
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Criar tabela leads_sla
CREATE TABLE IF NOT EXISTS leads_sla (
    -- Identificador único do registro
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Dados do Lead (Pipedrive)
    lead_id VARCHAR(255) NOT NULL UNIQUE,
    lead_name VARCHAR(500) NOT NULL,
    
    -- Dados do SDR responsável
    sdr_id VARCHAR(255),
    sdr_name VARCHAR(500),
    
    -- Timestamps de SLA
    entered_at TIMESTAMPTZ NOT NULL,
    attended_at TIMESTAMPTZ,
    
    -- SLA calculado em minutos
    sla_minutes INTEGER,
    
    -- Campos adicionais para compatibilidade com frontend
    source VARCHAR(255) DEFAULT 'Pipedrive',
    pipeline VARCHAR(255) DEFAULT 'Default',
    
    -- Stage do lead (TEM PERFIL, PERFIL MENOR, INCONCLUSIVO, SEM PERFIL)
    stage_name VARCHAR(255),
    stage_priority INTEGER DEFAULT 99,
    
    -- Metadados
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PASSO 2: CRIAR ÍNDICES (se não existirem)
-- ============================================

CREATE INDEX IF NOT EXISTS idx_leads_sla_entered_at ON leads_sla(entered_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_sla_sdr_id ON leads_sla(sdr_id);
CREATE INDEX IF NOT EXISTS idx_leads_sla_lead_id ON leads_sla(lead_id);
CREATE INDEX IF NOT EXISTS idx_leads_sla_attended_at ON leads_sla(attended_at);
CREATE INDEX IF NOT EXISTS idx_leads_sla_stage_priority ON leads_sla(stage_priority);

-- ============================================
-- PASSO 3: CRIAR TRIGGER PARA updated_at
-- ============================================

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
-- PASSO 4: CONFIGURAR ROW LEVEL SECURITY
-- ============================================

-- Habilitar RLS na tabela
ALTER TABLE leads_sla ENABLE ROW LEVEL SECURITY;

-- Política para permitir todas as operações
DROP POLICY IF EXISTS "Allow all operations" ON leads_sla;
CREATE POLICY "Allow all operations" ON leads_sla
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- ============================================
-- PASSO 5: INSERIR DADOS DE EXEMPLO
-- ============================================

-- Limpar dados existentes (OPCIONAL - descomente se quiser limpar antes)
-- DELETE FROM leads_sla;

-- ============================================
-- SDRs de exemplo
-- ============================================
-- Vamos usar os seguintes SDRs:
-- - Ana Silva (sdr_001)
-- - Carlos Santos (sdr_002)
-- - Maria Oliveira (sdr_003)
-- - João Pereira (sdr_004)
-- - Fernanda Costa (sdr_005)

-- ============================================
-- LEADS ATENDIDOS (com SLA calculado)
-- ============================================

-- Leads atendidos rapidamente (SLA < 15 minutos) - TEM PERFIL
INSERT INTO leads_sla (lead_id, lead_name, sdr_id, sdr_name, entered_at, attended_at, sla_minutes, source, pipeline, stage_name, stage_priority) VALUES
('lead_001', 'TechCorp Solutions', 'sdr_001', 'Ana Silva', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 hour 50 minutes', 10, 'Pipedrive', 'SDR', 'TEM PERFIL', 1),
('lead_002', 'InnovaTech Ltda', 'sdr_002', 'Carlos Santos', NOW() - INTERVAL '5 hours', NOW() - INTERVAL '4 hours 55 minutes', 5, 'Pipedrive', 'SDR', 'TEM PERFIL', 1),
('lead_003', 'Digital Solutions SA', 'sdr_003', 'Maria Oliveira', NOW() - INTERVAL '1 day', NOW() - INTERVAL '23 hours 50 minutes', 10, 'Pipedrive', 'SDR', 'TEM PERFIL', 1),
('lead_004', 'Cloud Systems', 'sdr_001', 'Ana Silva', NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days 23 hours 55 minutes', 5, 'Pipedrive', 'SDR', 'TEM PERFIL', 1),
('lead_005', 'Data Analytics Corp', 'sdr_004', 'João Pereira', NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day 23 hours 50 minutes', 10, 'Pipedrive', 'SDR', 'TEM PERFIL', 1);

-- Leads atendidos em tempo moderado (15-20 minutos) - PERFIL MENOR
INSERT INTO leads_sla (lead_id, lead_name, sdr_id, sdr_name, entered_at, attended_at, sla_minutes, source, pipeline, stage_name, stage_priority) VALUES
('lead_006', 'Smart Business Inc', 'sdr_002', 'Carlos Santos', NOW() - INTERVAL '1 day', NOW() - INTERVAL '23 hours 45 minutes', 15, 'Pipedrive', 'SDR', 'PERFIL MENOR', 2),
('lead_007', 'Enterprise Solutions', 'sdr_003', 'Maria Oliveira', NOW() - INTERVAL '4 days', NOW() - INTERVAL '3 days 23 hours 50 minutes', 10, 'Pipedrive', 'SDR', 'PERFIL MENOR', 2),
('lead_008', 'Global Tech Partners', 'sdr_005', 'Fernanda Costa', NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day 23 hours 40 minutes', 20, 'Pipedrive', 'SDR', 'PERFIL MENOR', 2),
('lead_009', 'Future Systems', 'sdr_001', 'Ana Silva', NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days 23 hours 50 minutes', 10, 'Pipedrive', 'SDR', 'PERFIL MENOR', 2),
('lead_010', 'NextGen Technologies', 'sdr_004', 'João Pereira', NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days 23 hours 45 minutes', 15, 'Pipedrive', 'SDR', 'PERFIL MENOR', 2);

-- Leads atendidos com SLA crítico (> 20 minutos) - INCONCLUSIVO
INSERT INTO leads_sla (lead_id, lead_name, sdr_id, sdr_name, entered_at, attended_at, sla_minutes, source, pipeline, stage_name, stage_priority) VALUES
('lead_011', 'Mega Corp Industries', 'sdr_002', 'Carlos Santos', NOW() - INTERVAL '6 days', NOW() - INTERVAL '5 days 23 hours 30 minutes', 30, 'Pipedrive', 'SDR', 'INCONCLUSIVO', 3),
('lead_012', 'Big Data Solutions', 'sdr_003', 'Maria Oliveira', NOW() - INTERVAL '7 days', NOW() - INTERVAL '6 days 23 hours 20 minutes', 40, 'Pipedrive', 'SDR', 'INCONCLUSIVO', 3),
('lead_013', 'Advanced Systems', 'sdr_005', 'Fernanda Costa', NOW() - INTERVAL '8 days', NOW() - INTERVAL '7 days 23 hours 10 minutes', 50, 'Pipedrive', 'SDR', 'INCONCLUSIVO', 3),
('lead_014', 'Premium Services', 'sdr_001', 'Ana Silva', NOW() - INTERVAL '9 days', NOW() - INTERVAL '8 days 23 hours', 60, 'Pipedrive', 'SDR', 'INCONCLUSIVO', 3),
('lead_015', 'Elite Technologies', 'sdr_004', 'João Pereira', NOW() - INTERVAL '10 days', NOW() - INTERVAL '9 days 22 hours 50 minutes', 70, 'Pipedrive', 'SDR', 'INCONCLUSIVO', 3);

-- Leads com SLA muito alto - SEM PERFIL
INSERT INTO leads_sla (lead_id, lead_name, sdr_id, sdr_name, entered_at, attended_at, sla_minutes, source, pipeline, stage_name, stage_priority) VALUES
('lead_016', 'Standard Business', 'sdr_002', 'Carlos Santos', NOW() - INTERVAL '12 days', NOW() - INTERVAL '11 days 22 hours', 120, 'Pipedrive', 'SDR', 'SEM PERFIL', 4),
('lead_017', 'Basic Solutions', 'sdr_003', 'Maria Oliveira', NOW() - INTERVAL '15 days', NOW() - INTERVAL '14 days 20 hours', 240, 'Pipedrive', 'SDR', 'SEM PERFIL', 4),
('lead_018', 'Simple Systems', 'sdr_005', 'Fernanda Costa', NOW() - INTERVAL '18 days', NOW() - INTERVAL '17 days 18 hours', 360, 'Pipedrive', 'SDR', 'SEM PERFIL', 4),
('lead_019', 'Regular Services', 'sdr_001', 'Ana Silva', NOW() - INTERVAL '20 days', NOW() - INTERVAL '19 days 15 hours', 540, 'Pipedrive', 'SDR', 'SEM PERFIL', 4),
('lead_020', 'Common Tech', 'sdr_004', 'João Pereira', NOW() - INTERVAL '25 days', NOW() - INTERVAL '24 days 10 hours', 840, 'Pipedrive', 'SDR', 'SEM PERFIL', 4);

-- ============================================
-- LEADS PENDENTES (sem atendimento)
-- ============================================

-- Leads pendentes recentes (últimas horas) - TEM PERFIL
INSERT INTO leads_sla (lead_id, lead_name, entered_at, source, pipeline, stage_name, stage_priority) VALUES
('lead_021', 'NewTech Solutions', NOW() - INTERVAL '30 minutes', 'Pipedrive', 'SDR', 'TEM PERFIL', 1),
('lead_022', 'Startup Innovations', NOW() - INTERVAL '1 hour', 'Pipedrive', 'SDR', 'TEM PERFIL', 1),
('lead_023', 'Modern Business', NOW() - INTERVAL '2 hours', 'Pipedrive', 'SDR', 'TEM PERFIL', 1),
('lead_024', 'Agile Systems', NOW() - INTERVAL '3 hours', 'Pipedrive', 'SDR', 'TEM PERFIL', 1),
('lead_025', 'Fast Track Corp', NOW() - INTERVAL '4 hours', 'Pipedrive', 'SDR', 'TEM PERFIL', 1);

-- Leads pendentes (último dia) - PERFIL MENOR
INSERT INTO leads_sla (lead_id, lead_name, entered_at, source, pipeline, stage_name, stage_priority) VALUES
('lead_026', 'Medium Business Inc', NOW() - INTERVAL '5 hours', 'Pipedrive', 'SDR', 'PERFIL MENOR', 2),
('lead_027', 'Standard Services', NOW() - INTERVAL '6 hours', 'Pipedrive', 'SDR', 'PERFIL MENOR', 2),
('lead_028', 'Regular Solutions', NOW() - INTERVAL '8 hours', 'Pipedrive', 'SDR', 'PERFIL MENOR', 2),
('lead_029', 'Common Systems', NOW() - INTERVAL '12 hours', 'Pipedrive', 'SDR', 'PERFIL MENOR', 2),
('lead_030', 'Basic Tech', NOW() - INTERVAL '18 hours', 'Pipedrive', 'SDR', 'PERFIL MENOR', 2);

-- Leads pendentes (últimos dias) - INCONCLUSIVO
INSERT INTO leads_sla (lead_id, lead_name, entered_at, source, pipeline, stage_name, stage_priority) VALUES
('lead_031', 'Uncertain Business', NOW() - INTERVAL '1 day', 'Pipedrive', 'SDR', 'INCONCLUSIVO', 3),
('lead_032', 'Pending Solutions', NOW() - INTERVAL '2 days', 'Pipedrive', 'SDR', 'INCONCLUSIVO', 3),
('lead_033', 'Waiting Systems', NOW() - INTERVAL '3 days', 'Pipedrive', 'SDR', 'INCONCLUSIVO', 3),
('lead_034', 'Delayed Services', NOW() - INTERVAL '4 days', 'Pipedrive', 'SDR', 'INCONCLUSIVO', 3),
('lead_035', 'On Hold Corp', NOW() - INTERVAL '5 days', 'Pipedrive', 'SDR', 'INCONCLUSIVO', 3);

-- Leads pendentes (últimas semanas) - SEM PERFIL
INSERT INTO leads_sla (lead_id, lead_name, entered_at, source, pipeline, stage_name, stage_priority) VALUES
('lead_036', 'Low Priority Business', NOW() - INTERVAL '6 days', 'Pipedrive', 'SDR', 'SEM PERFIL', 4),
('lead_037', 'Backlog Solutions', NOW() - INTERVAL '8 days', 'Pipedrive', 'SDR', 'SEM PERFIL', 4),
('lead_038', 'Archive Systems', NOW() - INTERVAL '10 days', 'Pipedrive', 'SDR', 'SEM PERFIL', 4),
('lead_039', 'Old Services', NOW() - INTERVAL '12 days', 'Pipedrive', 'SDR', 'SEM PERFIL', 4),
('lead_040', 'Forgotten Tech', NOW() - INTERVAL '15 days', 'Pipedrive', 'SDR', 'SEM PERFIL', 4);

-- ============================================
-- DADOS ADICIONAIS PARA ANÁLISE TEMPORAL
-- ============================================

-- Mais leads atendidos distribuídos ao longo do tempo
INSERT INTO leads_sla (lead_id, lead_name, sdr_id, sdr_name, entered_at, attended_at, sla_minutes, source, pipeline, stage_name, stage_priority) VALUES
-- Ana Silva - Performance excelente
('lead_041', 'Alpha Corporation', 'sdr_001', 'Ana Silva', NOW() - INTERVAL '11 days', NOW() - INTERVAL '11 days 23 hours 55 minutes', 5, 'Pipedrive', 'SDR', 'TEM PERFIL', 1),
('lead_042', 'Beta Industries', 'sdr_001', 'Ana Silva', NOW() - INTERVAL '13 days', NOW() - INTERVAL '13 days 23 hours 50 minutes', 10, 'Pipedrive', 'SDR', 'TEM PERFIL', 1),
('lead_043', 'Gamma Systems', 'sdr_001', 'Ana Silva', NOW() - INTERVAL '14 days', NOW() - INTERVAL '14 days 23 hours 45 minutes', 15, 'Pipedrive', 'SDR', 'PERFIL MENOR', 2),
('lead_044', 'Delta Solutions', 'sdr_001', 'Ana Silva', NOW() - INTERVAL '16 days', NOW() - INTERVAL '16 days 23 hours 40 minutes', 20, 'Pipedrive', 'SDR', 'PERFIL MENOR', 2),

-- Carlos Santos - Performance variada
('lead_045', 'Epsilon Tech', 'sdr_002', 'Carlos Santos', NOW() - INTERVAL '11 days', NOW() - INTERVAL '11 days 23 hours 30 minutes', 30, 'Pipedrive', 'SDR', 'INCONCLUSIVO', 3),
('lead_046', 'Zeta Business', 'sdr_002', 'Carlos Santos', NOW() - INTERVAL '13 days', NOW() - INTERVAL '13 days 23 hours 20 minutes', 40, 'Pipedrive', 'SDR', 'INCONCLUSIVO', 3),
('lead_047', 'Eta Services', 'sdr_002', 'Carlos Santos', NOW() - INTERVAL '14 days', NOW() - INTERVAL '14 days 22 hours', 120, 'Pipedrive', 'SDR', 'SEM PERFIL', 4),
('lead_048', 'Theta Systems', 'sdr_002', 'Carlos Santos', NOW() - INTERVAL '16 days', NOW() - INTERVAL '16 days 20 hours', 240, 'Pipedrive', 'SDR', 'SEM PERFIL', 4),

-- Maria Oliveira - Performance boa
('lead_049', 'Iota Corporation', 'sdr_003', 'Maria Oliveira', NOW() - INTERVAL '11 days', NOW() - INTERVAL '11 days 23 hours 52 minutes', 8, 'Pipedrive', 'SDR', 'TEM PERFIL', 1),
('lead_050', 'Kappa Industries', 'sdr_003', 'Maria Oliveira', NOW() - INTERVAL '13 days', NOW() - INTERVAL '13 days 23 hours 48 minutes', 12, 'Pipedrive', 'SDR', 'TEM PERFIL', 1),
('lead_051', 'Lambda Systems', 'sdr_003', 'Maria Oliveira', NOW() - INTERVAL '14 days', NOW() - INTERVAL '14 days 23 hours 42 minutes', 18, 'Pipedrive', 'SDR', 'PERFIL MENOR', 2),
('lead_052', 'Mu Solutions', 'sdr_003', 'Maria Oliveira', NOW() - INTERVAL '16 days', NOW() - INTERVAL '16 days 23 hours 35 minutes', 25, 'Pipedrive', 'SDR', 'PERFIL MENOR', 2),

-- João Pereira - Performance moderada
('lead_053', 'Nu Tech', 'sdr_004', 'João Pereira', NOW() - INTERVAL '11 days', NOW() - INTERVAL '11 days 23 hours 25 minutes', 35, 'Pipedrive', 'SDR', 'INCONCLUSIVO', 3),
('lead_054', 'Xi Business', 'sdr_004', 'João Pereira', NOW() - INTERVAL '13 days', NOW() - INTERVAL '13 days 23 hours 15 minutes', 45, 'Pipedrive', 'SDR', 'INCONCLUSIVO', 3),
('lead_055', 'Omicron Services', 'sdr_004', 'João Pereira', NOW() - INTERVAL '14 days', NOW() - INTERVAL '14 days 22 hours 30 minutes', 90, 'Pipedrive', 'SDR', 'SEM PERFIL', 4),
('lead_056', 'Pi Systems', 'sdr_004', 'João Pereira', NOW() - INTERVAL '16 days', NOW() - INTERVAL '16 days 21 hours', 180, 'Pipedrive', 'SDR', 'SEM PERFIL', 4),

-- Fernanda Costa - Performance boa
('lead_057', 'Rho Corporation', 'sdr_005', 'Fernanda Costa', NOW() - INTERVAL '11 days', NOW() - INTERVAL '11 days 23 hours 54 minutes', 6, 'Pipedrive', 'SDR', 'TEM PERFIL', 1),
('lead_058', 'Sigma Industries', 'sdr_005', 'Fernanda Costa', NOW() - INTERVAL '13 days', NOW() - INTERVAL '13 days 23 hours 49 minutes', 11, 'Pipedrive', 'SDR', 'TEM PERFIL', 1),
('lead_059', 'Tau Systems', 'sdr_005', 'Fernanda Costa', NOW() - INTERVAL '14 days', NOW() - INTERVAL '14 days 23 hours 43 minutes', 17, 'Pipedrive', 'SDR', 'PERFIL MENOR', 2),
('lead_060', 'Upsilon Solutions', 'sdr_005', 'Fernanda Costa', NOW() - INTERVAL '16 days', NOW() - INTERVAL '16 days 23 hours 38 minutes', 22, 'Pipedrive', 'SDR', 'PERFIL MENOR', 2);

-- ============================================
-- LEADS PENDENTES ADICIONAIS
-- ============================================

-- Mais leads pendentes para diferentes stages
INSERT INTO leads_sla (lead_id, lead_name, entered_at, source, pipeline, stage_name, stage_priority) VALUES
('lead_061', 'Waiting Alpha', NOW() - INTERVAL '20 hours', 'Pipedrive', 'SDR', 'TEM PERFIL', 1),
('lead_062', 'Pending Beta', NOW() - INTERVAL '22 hours', 'Pipedrive', 'SDR', 'TEM PERFIL', 1),
('lead_063', 'Queue Gamma', NOW() - INTERVAL '1 day 2 hours', 'Pipedrive', 'SDR', 'PERFIL MENOR', 2),
('lead_064', 'Hold Delta', NOW() - INTERVAL '1 day 4 hours', 'Pipedrive', 'SDR', 'PERFIL MENOR', 2),
('lead_065', 'Delayed Epsilon', NOW() - INTERVAL '1 day 6 hours', 'Pipedrive', 'SDR', 'INCONCLUSIVO', 3),
('lead_066', 'Stuck Zeta', NOW() - INTERVAL '1 day 8 hours', 'Pipedrive', 'SDR', 'INCONCLUSIVO', 3),
('lead_067', 'Backlog Eta', NOW() - INTERVAL '1 day 10 hours', 'Pipedrive', 'SDR', 'SEM PERFIL', 4),
('lead_068', 'Archive Theta', NOW() - INTERVAL '1 day 12 hours', 'Pipedrive', 'SDR', 'SEM PERFIL', 4);

-- ============================================
-- VERIFICAÇÃO DOS DADOS INSERIDOS
-- ============================================

-- Contar total de leads
SELECT 
    'Total de leads' AS metric,
    COUNT(*) AS value
FROM leads_sla;

-- Contar leads por status
SELECT 
    'Leads atendidos' AS metric,
    COUNT(*) AS value
FROM leads_sla
WHERE attended_at IS NOT NULL
UNION ALL
SELECT 
    'Leads pendentes' AS metric,
    COUNT(*) AS value
FROM leads_sla
WHERE attended_at IS NULL;

-- Contar leads por stage
SELECT 
    stage_name,
    stage_priority,
    COUNT(*) AS total,
    COUNT(attended_at) AS atendidos,
    COUNT(*) FILTER (WHERE attended_at IS NULL) AS pendentes
FROM leads_sla
GROUP BY stage_name, stage_priority
ORDER BY stage_priority;

-- Performance por SDR
SELECT 
    sdr_name,
    COUNT(*) AS total_leads,
    ROUND(AVG(sla_minutes), 2) AS avg_sla_minutes,
    MIN(sla_minutes) AS min_sla,
    MAX(sla_minutes) AS max_sla
FROM leads_sla
WHERE sdr_id IS NOT NULL
GROUP BY sdr_name
ORDER BY avg_sla_minutes;

-- ============================================
-- FIM DO SCRIPT
-- ============================================
-- Total de registros inseridos: ~68 leads
-- - ~40 leads atendidos
-- - ~28 leads pendentes
-- - Distribuídos nos últimos 30 dias
-- - 5 SDRs diferentes
-- - 4 stages diferentes
-- ============================================

