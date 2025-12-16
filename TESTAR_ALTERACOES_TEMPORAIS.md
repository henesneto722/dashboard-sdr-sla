# Guia de Testes - Alterações Temporais (Ranking, Hourly, Timeline)

Este documento descreve como testar se as alterações de lógica temporal estão funcionando corretamente.

## 📋 Pré-requisitos

1. Backend rodando em `http://localhost:3001`
2. Frontend rodando (opcional, para visualização)
3. Acesso ao Supabase (para verificar dados no banco)

---

## 🧪 Teste 1: Ranking de SDRs (Mês Corrente)

### Objetivo
Verificar se o ranking está contabilizando apenas leads atendidos no **mês atual** (Month-to-Date).

### Passos

1. **Testar via API:**
```bash
curl http://localhost:3001/api/metrics/ranking
```

2. **Verificar no banco de dados (Supabase SQL Editor):**
```sql
-- Verificar quantos leads foram atendidos no mês atual
SELECT 
  sdr_id,
  sdr_name,
  COUNT(*) as total_leads,
  AVG(sla_minutes) as avg_sla_minutes
FROM leads_sla
WHERE attended_at >= DATE_TRUNC('month', NOW())
  AND sla_minutes IS NOT NULL
  AND sdr_id IS NOT NULL
GROUP BY sdr_id, sdr_name
ORDER BY avg_sla_minutes ASC;
```

3. **Comparar resultados:**
   - O resultado da API deve corresponder ao resultado do SQL
   - Leads atendidos em meses anteriores **NÃO** devem aparecer
   - A contagem deve incluir apenas leads do dia 1 do mês até agora

### ✅ Critérios de Sucesso
- [ ] Apenas leads com `attended_at >= primeiro dia do mês atual` aparecem
- [ ] A média de tempo está correta
- [ ] A contagem de leads está correta
- [ ] Leads de meses anteriores não aparecem

---

## 🧪 Teste 2: Hourly Performance (Dia Civil)

### Objetivo
Verificar se o gráfico de performance por hora está mostrando apenas dados do **dia atual** (desde 00:00:00).

### Passos

1. **Testar via API:**
```bash
curl http://localhost:3001/api/metrics/hourly-performance
```

2. **Verificar no banco de dados:**
```sql
-- Verificar leads atendidos hoje por hora
SELECT 
  EXTRACT(HOUR FROM attended_at) as hora,
  COUNT(*) as total_leads,
  AVG(sla_minutes) as avg_sla_minutes
FROM leads_sla
WHERE attended_at >= DATE_TRUNC('day', NOW())
  AND attended_at IS NOT NULL
  AND sla_minutes IS NOT NULL
  AND EXTRACT(HOUR FROM attended_at) BETWEEN 6 AND 22
GROUP BY EXTRACT(HOUR FROM attended_at)
ORDER BY hora ASC;
```

3. **Testar comportamento ao longo do dia:**
   - **Manhã (08:00):** Verificar se dados de 06h-07h ainda aparecem
   - **Tarde (15:00):** Verificar se dados da manhã ainda aparecem
   - **Noite (23:00):** Verificar se todos os dados do dia ainda aparecem
   - **Meia-noite (00:01):** Verificar se os dados zeraram

### ✅ Critérios de Sucesso
- [ ] Apenas leads com `attended_at >= início do dia atual (00:00:00)` aparecem
- [ ] Dados de horas passadas permanecem visíveis até a meia-noite
- [ ] Não há dados de dias anteriores
- [ ] Após meia-noite, os dados devem zerar (ou mostrar apenas dados do novo dia)

---

## 🧪 Teste 3: Timeline (Dia Civil)

### Objetivo
Verificar se a timeline está mostrando apenas dados do **dia atual** (desde 00:00:00).

### Passos

1. **Testar via API:**
```bash
curl http://localhost:3001/api/metrics/timeline
```

2. **Verificar no banco de dados:**
```sql
-- Verificar leads atendidos hoje agrupados por data
SELECT 
  DATE(attended_at) as data,
  COUNT(*) as total_leads,
  AVG(sla_minutes) as avg_sla_minutes
FROM leads_sla
WHERE attended_at >= DATE_TRUNC('day', NOW())
  AND attended_at IS NOT NULL
  AND sla_minutes IS NOT NULL
GROUP BY DATE(attended_at)
ORDER BY data ASC;
```

3. **Verificar no frontend:**
   - A timeline deve mostrar apenas o dia atual
   - Não deve haver dados de dias anteriores

### ✅ Critérios de Sucesso
- [ ] Apenas leads com `attended_at >= início do dia atual (00:00:00)` aparecem
- [ ] Apenas uma data aparece (hoje)
- [ ] Não há dados de dias anteriores
- [ ] Após meia-noite, os dados devem zerar

---

## 🔍 Teste 4: Verificação de Dados no Banco

### Verificar se há dados de teste suficientes

```sql
-- Verificar leads atendidos no mês atual
SELECT 
  DATE(attended_at) as data_atendimento,
  COUNT(*) as total,
  MIN(attended_at) as primeiro_atendimento,
  MAX(attended_at) as ultimo_atendimento
FROM leads_sla
WHERE attended_at >= DATE_TRUNC('month', NOW())
  AND attended_at IS NOT NULL
  AND sla_minutes IS NOT NULL
GROUP BY DATE(attended_at)
ORDER BY data_atendimento DESC;
```

```sql
-- Verificar leads atendidos hoje
SELECT 
  EXTRACT(HOUR FROM attended_at) as hora,
  COUNT(*) as total,
  AVG(sla_minutes) as avg_sla
FROM leads_sla
WHERE attended_at >= DATE_TRUNC('day', NOW())
  AND attended_at IS NOT NULL
  AND sla_minutes IS NOT NULL
GROUP BY EXTRACT(HOUR FROM attended_at)
ORDER BY hora ASC;
```

---

## 🧪 Teste 5: Teste Manual no Frontend

### Passos

1. **Abrir o dashboard no navegador:**
   - `http://localhost:5173` (ou porta do Vite)

2. **Verificar Ranking de SDRs:**
   - Verificar se mostra apenas dados do mês atual
   - Verificar se a contagem e média estão corretas
   - Verificar se não há dados de meses anteriores

3. **Verificar Hourly Performance:**
   - Verificar se mostra apenas dados do dia atual
   - Verificar se dados de horas passadas permanecem visíveis
   - Verificar se a descrição diz "dia atual" e não "últimos 30 dias"

4. **Verificar Timeline:**
   - Verificar se mostra apenas dados do dia atual
   - Verificar se não há dados de dias anteriores

---

## 🐛 Troubleshooting

### Problema: Ranking mostra dados de meses anteriores

**Solução:**
1. Verificar se o cache foi invalidado:
   ```bash
   # Reiniciar o backend para limpar o cache
   ```
2. Verificar a query no banco:
   ```sql
   SELECT DATE_TRUNC('month', NOW()) as inicio_mes;
   ```

### Problema: Hourly/Timeline mostra dados de dias anteriores

**Solução:**
1. Verificar se está usando `attended_at` e não `entered_at`
2. Verificar se está usando `DATE_TRUNC('day', NOW())` e não `NOW() - INTERVAL '24 hours'`
3. Verificar no banco:
   ```sql
   SELECT DATE_TRUNC('day', NOW()) as inicio_dia;
   ```

### Problema: Dados não aparecem

**Solução:**
1. Verificar se há dados no banco para o período correto
2. Verificar logs do backend para erros
3. Verificar se o Supabase está acessível

---

## 📝 Checklist Final

- [ ] Ranking mostra apenas dados do mês atual
- [ ] Hourly Performance mostra apenas dados do dia atual
- [ ] Timeline mostra apenas dados do dia atual
- [ ] Dados de horas passadas permanecem visíveis até meia-noite
- [ ] Após meia-noite, os dados zeram corretamente
- [ ] Todas as queries usam `attended_at` e não `entered_at`
- [ ] Não há uso de janelas móveis (ex: `NOW() - 24 hours`)

---

## 🚀 Próximos Passos

Após validar todos os testes:
1. Verificar se o comportamento está correto no ambiente de produção
2. Monitorar os logs do backend para garantir que não há erros
3. Documentar qualquer comportamento inesperado


