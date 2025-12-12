-- ============================================
-- QUERIES PARA VERIFICAR DADOS DO RANKING
-- Execute estas queries no Supabase SQL Editor
-- ============================================

-- 1. TOTAL DE LEADS DO MÊS ATUAL (baseado em entered_at)
-- Esta query deve retornar o mesmo número que aparece no console do frontend
SELECT 
  COUNT(*) as total_leads,
  COUNT(CASE WHEN sla_minutes IS NOT NULL THEN 1 END) as leads_com_sla,
  COUNT(CASE WHEN sla_minutes IS NULL THEN 1 END) as leads_sem_sla
FROM leads_sla
WHERE entered_at >= DATE_TRUNC('month', NOW())
  AND sdr_id IS NOT NULL;

-- 2. LEADS POR SDR NO MÊS ATUAL
-- Compare com o objeto "por_sdr" que aparece no console
SELECT 
  sdr_name,
  sdr_id,
  COUNT(*) as total_leads,
  COUNT(CASE WHEN sla_minutes IS NOT NULL THEN 1 END) as leads_atendidos,
  COUNT(CASE WHEN sla_minutes IS NULL THEN 1 END) as leads_pendentes,
  ROUND(AVG(CASE WHEN sla_minutes IS NOT NULL THEN sla_minutes END)) as tempo_medio_minutos
FROM leads_sla
WHERE entered_at >= DATE_TRUNC('month', NOW())
  AND sdr_id IS NOT NULL
GROUP BY sdr_id, sdr_name
ORDER BY tempo_medio_minutos ASC NULLS LAST;

-- 3. LEADS DO DIA ATUAL (para verificar filtro "Hoje")
SELECT 
  COUNT(*) as total_hoje,
  COUNT(CASE WHEN sla_minutes IS NOT NULL THEN 1 END) as atendidos_hoje
FROM leads_sla
WHERE DATE(entered_at) = CURRENT_DATE
  AND sdr_id IS NOT NULL;

-- 4. LEADS DA SEMANA ATUAL (para verificar filtro "Esta Semana")
SELECT 
  COUNT(*) as total_semana,
  COUNT(CASE WHEN sla_minutes IS NOT NULL THEN 1 END) as atendidos_semana
FROM leads_sla
WHERE entered_at >= DATE_TRUNC('week', NOW())
  AND entered_at < DATE_TRUNC('week', NOW()) + INTERVAL '1 week'
  AND sdr_id IS NOT NULL;

-- 5. RANKING DETALHADO (igual ao que aparece no componente)
-- Esta query deve retornar os mesmos dados que aparecem no ranking
SELECT 
  sdr_id,
  sdr_name,
  COUNT(CASE WHEN sla_minutes IS NOT NULL THEN 1 END) as leads_attended,
  ROUND(AVG(CASE WHEN sla_minutes IS NOT NULL THEN sla_minutes END)) as average_time
FROM leads_sla
WHERE entered_at >= DATE_TRUNC('month', NOW())
  AND sdr_id IS NOT NULL
  AND sla_minutes IS NOT NULL
GROUP BY sdr_id, sdr_name
ORDER BY average_time ASC;

-- 6. VERIFICAR SE HÁ LEADS FORA DO RANGE (mais de 10000)
-- Se esta query retornar mais de 10000, precisamos aumentar o range
SELECT COUNT(*) as total_leads_mes
FROM leads_sla
WHERE entered_at >= DATE_TRUNC('month', NOW())
  AND sdr_id IS NOT NULL;

-- 7. COMPARAÇÃO: LEADS COM entered_at vs attended_at
-- Para entender a diferença entre os dois campos
SELECT 
  'Por entered_at (usado no ranking)' as tipo,
  COUNT(*) as total
FROM leads_sla
WHERE entered_at >= DATE_TRUNC('month', NOW())
  AND sdr_id IS NOT NULL
UNION ALL
SELECT 
  'Por attended_at (usado em outros componentes)' as tipo,
  COUNT(*) as total
FROM leads_sla
WHERE attended_at >= DATE_TRUNC('month', NOW())
  AND sdr_id IS NOT NULL;

