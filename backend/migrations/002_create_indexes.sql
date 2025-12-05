-- =============================================
-- ÍNDICES PARA PERFORMANCE (10.000+ leads)
-- Execute no Supabase SQL Editor
-- =============================================

-- Índice para busca por lead_id (usado em todas as buscas por deal)
CREATE INDEX IF NOT EXISTS idx_leads_sla_lead_id 
ON leads_sla (lead_id);

-- Índice para filtro por período (entered_at é muito usado)
CREATE INDEX IF NOT EXISTS idx_leads_sla_entered_at 
ON leads_sla (entered_at DESC);

-- Índice para filtro por SDR
CREATE INDEX IF NOT EXISTS idx_leads_sla_sdr_id 
ON leads_sla (sdr_id);

-- Índice para leads pendentes (attended_at IS NULL)
CREATE INDEX IF NOT EXISTS idx_leads_sla_pending 
ON leads_sla (attended_at) 
WHERE attended_at IS NULL;

-- Índice composto para queries de métricas por período e status
CREATE INDEX IF NOT EXISTS idx_leads_sla_metrics 
ON leads_sla (entered_at DESC, attended_at, sla_minutes);

-- Índice para filtro de leads importantes (stage_name)
CREATE INDEX IF NOT EXISTS idx_leads_sla_stage 
ON leads_sla (stage_name) 
WHERE stage_name IN ('Tem perfil', 'Perfil menor', 'TEM PERFIL', 'PERFIL MENOR');

-- Índice para ordenação por SLA (ranking)
CREATE INDEX IF NOT EXISTS idx_leads_sla_sla_minutes 
ON leads_sla (sla_minutes DESC NULLS LAST);

-- Índice composto para ranking de SDRs
CREATE INDEX IF NOT EXISTS idx_leads_sla_sdr_ranking 
ON leads_sla (sdr_id, sla_minutes) 
WHERE sla_minutes IS NOT NULL;

-- =============================================
-- ESTATÍSTICAS DE USO (opcional - para debug)
-- =============================================

-- Ver tamanho dos índices
-- SELECT 
--     indexname,
--     pg_size_pretty(pg_relation_size(indexrelid)) AS size
-- FROM pg_stat_user_indexes
-- WHERE schemaname = 'public'
-- ORDER BY pg_relation_size(indexrelid) DESC;

-- Ver queries mais lentas (requer extensão pg_stat_statements)
-- SELECT query, calls, mean_time, total_time
-- FROM pg_stat_statements
-- ORDER BY mean_time DESC
-- LIMIT 10;

