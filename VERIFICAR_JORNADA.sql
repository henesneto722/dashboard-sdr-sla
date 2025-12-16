-- ============================================
-- Script de Verificação - Jornada de Atendimento
-- Execute no Supabase SQL Editor para verificar se está funcionando
-- ============================================

-- 1. Verificar se a tabela existe e quantos eventos foram registrados
SELECT 
    COUNT(*) as total_eventos,
    COUNT(DISTINCT user_id) as total_sdrs,
    MIN(timestamp) as primeiro_evento,
    MAX(timestamp) as ultimo_evento
FROM sdr_attendance_events;

-- 2. Ver os últimos 10 eventos registrados
SELECT 
    id,
    user_id,
    user_name,
    deal_id,
    event_type,
    timestamp,
    created_at
FROM sdr_attendance_events
ORDER BY timestamp DESC
LIMIT 10;

-- 3. Contar eventos por SDR
SELECT 
    user_id,
    user_name,
    COUNT(*) as total_eventos,
    MIN(timestamp) as primeira_acao,
    MAX(timestamp) as ultima_acao
FROM sdr_attendance_events
GROUP BY user_id, user_name
ORDER BY total_eventos DESC;

-- 4. Verificar eventos de hoje (horário de São Paulo)
SELECT 
    user_id,
    user_name,
    COUNT(*) as eventos_hoje,
    MIN(timestamp) as primeira_acao_hoje,
    MAX(timestamp) as ultima_acao_hoje
FROM sdr_attendance_events
WHERE timestamp >= CURRENT_DATE AT TIME ZONE 'America/Sao_Paulo'
GROUP BY user_id, user_name
ORDER BY eventos_hoje DESC;


