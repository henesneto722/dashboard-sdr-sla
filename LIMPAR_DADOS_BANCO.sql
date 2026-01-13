-- Script para limpar TODOS os dados do banco de dados
-- ATENÇÃO: Este script irá DELETAR TODOS os dados das tabelas
-- Execute apenas se tiver certeza de que deseja limpar todos os dados

-- 1. Limpar tabela de eventos de atendimento SDR
DELETE FROM sdr_attendance_events;

-- 2. Limpar tabela de leads SLA
DELETE FROM leads_sla;

-- Verificar se as tabelas foram limpas
SELECT 
  'sdr_attendance_events' as tabela,
  COUNT(*) as registros_restantes
FROM sdr_attendance_events
UNION ALL
SELECT 
  'leads_sla' as tabela,
  COUNT(*) as registros_restantes
FROM leads_sla;

-- Se os registros_restantes forem 0, as tabelas foram limpas com sucesso
