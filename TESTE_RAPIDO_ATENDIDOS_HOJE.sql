-- ============================================
-- TESTE RÁPIDO: Verificar "Atendidos Hoje"
-- Execute no Supabase SQL Editor
-- ============================================

-- 1. Verificar leads atendidos HOJE (deve corresponder ao card)
SELECT 
  COUNT(*) as atendidos_hoje,
  MIN(attended_at) as primeiro_atendimento_hoje,
  MAX(attended_at) as ultimo_atendimento_hoje
FROM leads_sla
WHERE 
  attended_at >= DATE_TRUNC('day', NOW())
  AND attended_at < DATE_TRUNC('day', NOW()) + INTERVAL '1 day'
  AND sla_minutes IS NOT NULL;

-- 2. Verificar leads atendidos ONTEM (NÃO devem contar para hoje)
SELECT 
  COUNT(*) as atendidos_ontem
FROM leads_sla
WHERE 
  attended_at >= DATE_TRUNC('day', NOW()) - INTERVAL '1 day'
  AND attended_at < DATE_TRUNC('day', NOW())
  AND sla_minutes IS NOT NULL;

-- 3. Verificar distribuição por dia (últimos 3 dias)
SELECT 
  DATE(attended_at) as dia,
  COUNT(*) as total_atendidos,
  CASE 
    WHEN DATE(attended_at) = CURRENT_DATE THEN '✅ HOJE'
    WHEN DATE(attended_at) = CURRENT_DATE - INTERVAL '1 day' THEN '📅 ONTEM'
    ELSE '📆 OUTROS'
  END as status
FROM leads_sla
WHERE 
  attended_at >= DATE_TRUNC('day', NOW()) - INTERVAL '2 days'
  AND attended_at < DATE_TRUNC('day', NOW()) + INTERVAL '1 day'
  AND sla_minutes IS NOT NULL
GROUP BY DATE(attended_at)
ORDER BY dia DESC;

-- 4. Ver detalhes dos leads atendidos HOJE
SELECT 
  lead_id,
  lead_name,
  sdr_name,
  attended_at,
  sla_minutes,
  EXTRACT(HOUR FROM attended_at) as hora_atendimento
FROM leads_sla
WHERE 
  attended_at >= DATE_TRUNC('day', NOW())
  AND attended_at < DATE_TRUNC('day', NOW()) + INTERVAL '1 day'
  AND sla_minutes IS NOT NULL
ORDER BY attended_at DESC;


