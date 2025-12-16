-- ============================================
-- ⚠️ IMPORTANTE: Execute este SQL no Supabase SQL Editor
-- ============================================
-- Este script cria a tabela necessária para a Jornada de Atendimento dos SDRs
-- Copie e cole todo o conteúdo abaixo no SQL Editor do Supabase e execute

-- Criar tabela para armazenar eventos de movimentação de leads
CREATE TABLE IF NOT EXISTS sdr_attendance_events (
    -- Identificador único do evento
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- ID do usuário/SDR que realizou a ação
    user_id VARCHAR(100) NOT NULL,
    
    -- Nome do SDR (opcional, para facilitar consultas)
    user_name VARCHAR(255),
    
    -- Timestamp da ação em UTC (ISO 8601)
    timestamp TIMESTAMPTZ NOT NULL,
    
    -- ID do deal/lead que foi movimentado
    deal_id VARCHAR(100) NOT NULL,
    
    -- Tipo de evento (ex: 'stage_change', 'updated', 'attended')
    event_type VARCHAR(50) DEFAULT 'attended',
    
    -- Pipeline ID (opcional)
    pipeline_id VARCHAR(100),
    
    -- Stage ID (opcional)
    stage_id VARCHAR(100),
    
    -- Metadados adicionais (JSON)
    metadata JSONB,
    
    -- Metadados de auditoria
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para otimização de queries
CREATE INDEX IF NOT EXISTS idx_sdr_attendance_user_id ON sdr_attendance_events(user_id);
CREATE INDEX IF NOT EXISTS idx_sdr_attendance_timestamp ON sdr_attendance_events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_sdr_attendance_deal_id ON sdr_attendance_events(deal_id);
CREATE INDEX IF NOT EXISTS idx_sdr_attendance_user_date ON sdr_attendance_events(user_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_sdr_attendance_user_timestamp ON sdr_attendance_events(user_id, timestamp);

-- Row Level Security (RLS) - Permitir todas as operações
ALTER TABLE sdr_attendance_events ENABLE ROW LEVEL SECURITY;

-- Política para permitir todas as operações
DROP POLICY IF EXISTS "Allow all operations on sdr_attendance_events" ON sdr_attendance_events;
CREATE POLICY "Allow all operations on sdr_attendance_events" ON sdr_attendance_events
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Comentários nas colunas para documentação
COMMENT ON TABLE sdr_attendance_events IS 'Armazena eventos de movimentação de leads para cálculo de jornada de atendimento dos SDRs';
COMMENT ON COLUMN sdr_attendance_events.user_id IS 'ID do usuário/SDR que realizou a ação';
COMMENT ON COLUMN sdr_attendance_events.timestamp IS 'Timestamp da ação em UTC (ISO 8601)';
COMMENT ON COLUMN sdr_attendance_events.deal_id IS 'ID do deal/lead que foi movimentado';
COMMENT ON COLUMN sdr_attendance_events.event_type IS 'Tipo de evento (stage_change, updated, attended, etc)';

-- Verificar se a tabela foi criada corretamente
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'sdr_attendance_events'
ORDER BY ordinal_position;


