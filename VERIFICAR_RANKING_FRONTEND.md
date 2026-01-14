# Como Verificar se os Dados do Ranking Estão Batendo

## 1. Verificar no Console do Navegador

1. Abra o dashboard no navegador
2. Pressione `F12` para abrir o DevTools
3. Vá na aba **Console**
4. Procure por logs que começam com `📊 [SDRRanking]`

Você verá:
- **Total de leads carregados** do mês
- **Leads com SLA** (atendidos)
- **Leads sem SLA** (pendentes)
- **Distribuição por SDR** (objeto com contagem por SDR)
- **Leads filtrados** por período (quando mudar as tabs)
- **Performance calculada** (ranking final)

### Exemplo de Log Esperado:
```
📊 [SDRRanking] Leads carregados do mês: 150
📊 [SDRRanking] Detalhes dos leads: {
  total: 150,
  com_sla: 120,
  sem_sla: 30,
  por_sdr: {
    "ALEXANDRE": 50,
    "LUCAS": 30,
    "LUANA": 25,
    "THAIS": 20,
    ...
  }
}
📊 [SDRRanking] Período: monthly, Leads filtrados: 150, SDRs: 4
📊 [SDRRanking] Performance calculada: [
  { sdr_id: "...", sdr_name: "LUCAS", average_time: 86, leads_attended: 15 },
  ...
]
```

## 2. Verificar no Supabase SQL Editor

1. Acesse o Supabase Dashboard
2. Vá em **SQL Editor**
3. Execute as queries do arquivo `VERIFICAR_RANKING_SUPABASE.sql`

### Queries Principais:

#### Total de Leads do Mês
```sql
SELECT COUNT(*) as total_leads
FROM leads_sla
WHERE entered_at >= DATE_TRUNC('month', NOW())
  AND sdr_id IS NOT NULL;
```

**Compare com:** O número que aparece no log `📊 [SDRRanking] Leads carregados do mês: X`

#### Leads por SDR
```sql
SELECT 
  sdr_name,
  COUNT(*) as total_leads,
  COUNT(CASE WHEN sla_minutes IS NOT NULL THEN 1 END) as leads_atendidos,
  ROUND(AVG(CASE WHEN sla_minutes IS NOT NULL THEN sla_minutes END)) as tempo_medio
FROM leads_sla
WHERE entered_at >= DATE_TRUNC('month', NOW())
  AND sdr_id IS NOT NULL
GROUP BY sdr_id, sdr_name
ORDER BY tempo_medio ASC;
```

**Compare com:** O objeto `por_sdr` no console e o ranking exibido no componente

## 3. Verificar Filtros por Período

### Hoje (Daily)
No console, quando selecionar "Hoje", você verá:
```
📊 [SDRRanking] Período: daily, Leads filtrados: X
```

No Supabase, execute:
```sql
SELECT COUNT(*) as total_hoje
FROM leads_sla
WHERE DATE(entered_at) = CURRENT_DATE
  AND sdr_id IS NOT NULL;
```

### Esta Semana (Weekly)
No console:
```
📊 [SDRRanking] Período: weekly, Leads filtrados: X
```

No Supabase:
```sql
SELECT COUNT(*) as total_semana
FROM leads_sla
WHERE entered_at >= DATE_TRUNC('week', NOW())
  AND entered_at < DATE_TRUNC('week', NOW()) + INTERVAL '1 week'
  AND sdr_id IS NOT NULL;
```

### Este Mês (Monthly)
No console:
```
📊 [SDRRanking] Período: monthly, Leads filtrados: X
```

No Supabase:
```sql
SELECT COUNT(*) as total_mes
FROM leads_sla
WHERE entered_at >= DATE_TRUNC('month', NOW())
  AND sdr_id IS NOT NULL;
```

## 4. Verificar Performance Calculada

O ranking exibido no componente deve bater com:

```sql
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
```

**Compare:**
- `leads_attended` com o número exibido no componente
- `average_time` com o tempo médio exibido (convertido para horas/minutos)

## 5. Possíveis Discrepâncias

### Se os números não baterem:

1. **Verificar timezone:**
   - O backend usa UTC para `getMonthStart()`
   - O Supabase também usa UTC por padrão
   - Verifique se há diferença de timezone

2. **Verificar limite de 10000:**
   - Se você tiver mais de 10000 leads no mês, alguns podem não ser carregados
   - Execute a query #6 do arquivo SQL para verificar

3. **Verificar filtros:**
   - O ranking usa `entered_at` (quando o lead foi criado)
   - Outros componentes podem usar `attended_at` (quando foi atendido)
   - Execute a query #7 para comparar

4. **Verificar cache:**
   - O backend pode estar usando cache
   - Tente limpar o cache ou aguardar 1 minuto (TTL do cache)

## 6. Debug Adicional

Se ainda houver discrepâncias, adicione este código temporário no componente para ver os dados brutos:

```typescript
// No componente SDRRanking.tsx, adicione antes do return:
console.log('🔍 DEBUG - Todos os leads:', allMonthLeads);
console.log('🔍 DEBUG - Leads filtrados:', filteredLeads);
console.log('🔍 DEBUG - Performance:', sdrPerformance);
```



