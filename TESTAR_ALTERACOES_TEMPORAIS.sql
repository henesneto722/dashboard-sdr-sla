-- ============================================
-- Scripts SQL para Testar Alterações Temporais
-- Execute no Supabase SQL Editor
-- ============================================

-- ============================================
-- TESTE 1: Verificar Ranking (Mês Corrente)
-- ============================================

-- Verificar quantos leads foram atendidos no mês atual
SELECT 
  sdr_id,
  sdr_name,
  COUNT(*) as total_leads,
  ROUND(AVG(sla_minutes)) as avg_sla_minutes,
  MIN(attended_at) as primeiro_atendimento,
  MAX(attended_at) as ultimo_atendimento
FROM leads_sla
WHERE attended_at >= DATE_TRUNC('month', NOW())
  AND sla_minutes IS NOT NULL
  AND sdr_id IS NOT NULL
GROUP BY sdr_id, sdr_name
ORDER BY avg_sla_minutes ASC;

-- Verificar o início do mês atual (para confirmar o filtro)
SELECT 
  DATE_TRUNC('month', NOW()) as inicio_mes_atual,
  NOW() as momento_atual,
  DATE_TRUNC('month', NOW())::date as data_inicio;

-- Verificar leads atendidos em meses anteriores (NÃO devem aparecer no ranking)
SELECT 
  DATE_TRUNC('month', attended_at) as mes,
  COUNT(*) as total_leads
FROM leads_sla
WHERE attended_at < DATE_TRUNC('month', NOW())
  AND attended_at IS NOT NULL
  AND sla_minutes IS NOT NULL
GROUP BY DATE_TRUNC('month', attended_at)
ORDER BY mes DESC
LIMIT 5;

-- ============================================
-- TESTE 2: Verificar Hourly Performance (Dia Civil)
-- ============================================

-- Verificar leads atendidos hoje por hora
SELECT 
  EXTRACT(HOUR FROM attended_at) as hora,
  COUNT(*) as total_leads,
  ROUND(AVG(sla_minutes)) as avg_sla_minutes,
  MIN(attended_at) as primeiro_atendimento_hora,
  MAX(attended_at) as ultimo_atendimento_hora
FROM leads_sla
WHERE attended_at >= DATE_TRUNC('day', NOW())
  AND attended_at IS NOT NULL
  AND sla_minutes IS NOT NULL
  AND EXTRACT(HOUR FROM attended_at) BETWEEN 6 AND 22
GROUP BY EXTRACT(HOUR FROM attended_at)
ORDER BY hora ASC;

-- Verificar o início do dia atual (para confirmar o filtro)
SELECT 
  DATE_TRUNC('day', NOW()) as inicio_dia_atual,
  NOW() as momento_atual,
  DATE_TRUNC('day', NOW())::date as data_inicio;

-- Verificar leads atendidos em dias anteriores (NÃO devem aparecer)
SELECT 
  DATE(attended_at) as data_atendimento,
  COUNT(*) as total_leads
FROM leads_sla
WHERE attended_at < DATE_TRUNC('day', NOW())
  AND attended_at IS NOT NULL
  AND sla_minutes IS NOT NULL
GROUP BY DATE(attended_at)
ORDER BY data_atendimento DESC
LIMIT 5;

-- ============================================
-- TESTE 3: Verificar Timeline (Dia Civil)
-- ============================================

-- Verificar leads atendidos hoje agrupados por data
SELECT 
  DATE(attended_at) as data,
  COUNT(*) as total_leads,
  ROUND(AVG(sla_minutes)) as avg_sla_minutes,
  MIN(attended_at) as primeiro_atendimento,
  MAX(attended_at) as ultimo_atendimento
FROM leads_sla
WHERE attended_at >= DATE_TRUNC('day', NOW())
  AND attended_at IS NOT NULL
  AND sla_minutes IS NOT NULL
GROUP BY DATE(attended_at)
ORDER BY data ASC;

-- ============================================
-- TESTE 4: Comparação entre attended_at e entered_at
-- ============================================

-- Verificar diferença entre leads filtrados por attended_at vs entered_at
-- (Para confirmar que estamos usando o campo correto)

-- Por attended_at (CORRETO - usado nas novas queries)
SELECT 
  'attended_at' as filtro,
  COUNT(*) as total_leads,
  MIN(attended_at) as data_mais_antiga,
  MAX(attended_at) as data_mais_recente
FROM leads_sla
WHERE attended_at >= DATE_TRUNC('day', NOW())
  AND attended_at IS NOT NULL
  AND sla_minutes IS NOT NULL;

-- Por entered_at (INCORRETO - não deve ser usado)
SELECT 
  'entered_at' as filtro,
  COUNT(*) as total_leads,
  MIN(entered_at) as data_mais_antiga,
  MAX(entered_at) as data_mais_recente
FROM leads_sla
WHERE entered_at >= DATE_TRUNC('day', NOW())
  AND attended_at IS NOT NULL
  AND sla_minutes IS NOT NULL;

-- ============================================
-- TESTE 5: Verificar se há dados suficientes para teste
-- ============================================

-- Resumo geral de dados disponíveis
SELECT 
  'Mês Atual' as periodo,
  COUNT(*) as total_leads,
  COUNT(DISTINCT sdr_id) as total_sdrs,
  MIN(attended_at) as primeiro_atendimento,
  MAX(attended_at) as ultimo_atendimento
FROM leads_sla
WHERE attended_at >= DATE_TRUNC('month', NOW())
  AND attended_at IS NOT NULL
  AND sla_minutes IS NOT NULL

UNION ALL

SELECT 
  'Dia Atual' as periodo,
  COUNT(*) as total_leads,
  COUNT(DISTINCT sdr_id) as total_sdrs,
  MIN(attended_at) as primeiro_atendimento,
  MAX(attended_at) as ultimo_atendimento
FROM leads_sla
WHERE attended_at >= DATE_TRUNC('day', NOW())
  AND attended_at IS NOT NULL
  AND sla_minutes IS NOT NULL;

-- ============================================
-- TESTE 6: Verificar timestamps exatos
-- ============================================

-- Verificar timestamps para debug
SELECT 
  NOW() as agora,
  DATE_TRUNC('day', NOW()) as inicio_dia,
  DATE_TRUNC('month', NOW()) as inicio_mes,
  EXTRACT(HOUR FROM NOW()) as hora_atual,
  EXTRACT(DAY FROM NOW()) as dia_atual,
  EXTRACT(MONTH FROM NOW()) as mes_atual;

