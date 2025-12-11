# 🧪 Como Testar o Card "Atendidos Hoje"

## 📋 Objetivo do Teste

Verificar se o card "Atendidos Hoje" está contando corretamente os leads atendidos no dia civil atual (00:00:00 até 23:59:59).

---

## ✅ Checklist de Validação

### 1. **Teste: Contador Inicia em 0 à Meia-Noite**

**Como Testar:**
1. Aguarde até próximo da meia-noite (23:59)
2. Anote o valor atual do card "Atendidos Hoje"
3. Aguarde até passar das 00:00
4. Verifique se o contador zerou

**Resultado Esperado:**
- ✅ Contador deve zerar automaticamente após 00:00
- ✅ Deve começar a contar novamente a partir de 0

---

### 2. **Teste: Acumulação Durante o Dia**

**Como Testar:**
1. Verifique o valor atual do card "Atendidos Hoje"
2. Crie um lead de teste no Pipedrive que seja atendido AGORA
3. Aguarde alguns segundos para o webhook processar
4. Verifique se o contador aumentou em +1

**Resultado Esperado:**
- ✅ Contador deve aumentar quando um lead é atendido hoje
- ✅ Deve refletir em tempo real (ou após refresh)

---

### 3. **Teste: Leads de Ontem Não Contam**

**Como Testar Manualmente:**

**Opção A: Via SQL no Supabase**
```sql
-- Verificar leads atendidos hoje
SELECT 
  COUNT(*) as atendidos_hoje,
  MIN(attended_at) as primeiro_atendimento_hoje,
  MAX(attended_at) as ultimo_atendimento_hoje
FROM leads_sla
WHERE 
  attended_at >= DATE_TRUNC('day', NOW())
  AND attended_at < DATE_TRUNC('day', NOW()) + INTERVAL '1 day'
  AND sla_minutes IS NOT NULL;

-- Verificar leads atendidos ontem (não devem contar)
SELECT 
  COUNT(*) as atendidos_ontem
FROM leads_sla
WHERE 
  attended_at >= DATE_TRUNC('day', NOW()) - INTERVAL '1 day'
  AND attended_at < DATE_TRUNC('day', NOW())
  AND sla_minutes IS NOT NULL;
```

**Opção B: Via Console do Navegador**
1. Abra o DevTools (F12)
2. Vá na aba Console
3. Cole e execute:

```javascript
// Pegar dados do dashboard
const leads = window.__LEADS_DATA__ || []; // Se disponível

// Ou via API
fetch('http://localhost:3001/api/leads/detail?period=all')
  .then(r => r.json())
  .then(data => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayLeads = data.data.filter(l => {
      if (!l.attended_at) return false;
      const leadDate = new Date(l.attended_at);
      leadDate.setHours(0, 0, 0, 0);
      return leadDate.getTime() === today.getTime();
    });
    
    console.log('✅ Atendidos HOJE:', todayLeads.length);
    console.log('📊 Leads:', todayLeads);
  });
```

**Resultado Esperado:**
- ✅ Apenas leads com `attended_at` de hoje devem contar
- ✅ Leads de ontem não devem aparecer no contador

---

### 4. **Teste: Comparação com Dados Reais**

**Como Testar:**

1. **Verificar no Banco de Dados:**
```sql
-- No Supabase SQL Editor
SELECT 
  DATE(attended_at) as dia,
  COUNT(*) as total_atendidos
FROM leads_sla
WHERE 
  attended_at >= DATE_TRUNC('day', NOW()) - INTERVAL '2 days'
  AND attended_at < DATE_TRUNC('day', NOW()) + INTERVAL '1 day'
  AND sla_minutes IS NOT NULL
GROUP BY DATE(attended_at)
ORDER BY dia DESC;
```

2. **Comparar com o Dashboard:**
   - O valor do card "Atendidos Hoje" deve corresponder ao `total_atendidos` do dia atual na query acima

---

### 5. **Teste: Criar Lead de Teste para Hoje**

**Como Testar:**

**Via Webhook Manual (Backend):**
```bash
# Criar lead atendido hoje
curl -X POST http://localhost:3001/api/webhook/manual/lead \
  -H "Content-Type: application/json" \
  -d '{
    "lead_id": "teste-hoje-' + Date.now() + '",
    "lead_name": "Teste Atendido Hoje",
    "source": "Teste",
    "pipeline": "Teste",
    "stage_name": "TEM PERFIL"
  }'

# Atender o lead (marcar como atendido AGORA)
curl -X POST http://localhost:3001/api/webhook/manual/attend \
  -H "Content-Type: application/json" \
  -d '{
    "lead_id": "teste-hoje-' + Date.now() + '",
    "sdr_id": "sdr_teste",
    "sdr_name": "SDR Teste"
  }'
```

**Resultado Esperado:**
- ✅ Após criar e atender o lead, o contador deve aumentar em +1
- ✅ O lead deve aparecer no card "Atendidos Hoje"

---

### 6. **Teste: Verificar Filtro de Período**

**Como Testar:**

1. No dashboard, altere o filtro de período:
   - "Hoje" → Deve mostrar apenas leads de hoje
   - "7 dias" → Deve mostrar leads dos últimos 7 dias (incluindo hoje)
   - "30 dias" → Deve mostrar leads dos últimos 30 dias (incluindo hoje)

2. Verifique se o card "Atendidos Hoje" sempre mostra apenas os leads de HOJE, independente do filtro de período selecionado

**Resultado Esperado:**
- ✅ O card "Atendidos Hoje" sempre mostra apenas leads de hoje
- ✅ Não é afetado pelo filtro de período (é sempre "hoje")

---

## 🔍 Verificação Técnica no Código

### Verificar a Lógica Implementada

**Arquivo:** `src/components/dashboard/StatsCards.tsx`

**Código Esperado:**
```typescript
import { startOfDay, isSameDay } from "date-fns";

const todayLeads = attendedLeads.filter(l => {
  if (!l.attended_at) return false;
  
  const todayStart = startOfDay(new Date()); // Início do dia atual (00:00:00)
  const leadDate = new Date(l.attended_at);
  
  // Verifica se o lead foi atendido no mesmo dia civil (ignorando horário)
  return isSameDay(leadDate, todayStart);
}).length;
```

**Verificações:**
- ✅ Usa `startOfDay()` do `date-fns`
- ✅ Usa `isSameDay()` para comparação
- ✅ Verifica se `attended_at` existe antes de processar
- ✅ Não usa `toDateString()` (que pode ter problemas de timezone)

---

## 🧪 Teste Automatizado (Opcional)

### Criar Script de Teste

**Arquivo:** `test-atendidos-hoje.js` (criar na raiz)

```javascript
// Teste automatizado para validar lógica de "Atendidos Hoje"
const { startOfDay, isSameDay } = require('date-fns');

function testAtendidosHoje() {
  console.log('🧪 Testando lógica de "Atendidos Hoje"...\n');
  
  // Dados de teste
  const now = new Date();
  const todayStart = startOfDay(now);
  
  const testLeads = [
    {
      id: 1,
      attended_at: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 30, 0), // Hoje 10:30
      sla_minutes: 15
    },
    {
      id: 2,
      attended_at: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 14, 15, 0), // Hoje 14:15
      sla_minutes: 20
    },
    {
      id: 3,
      attended_at: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 30, 0), // Ontem 23:30
      sla_minutes: 25
    },
    {
      id: 4,
      attended_at: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 10, 0, 0), // Ontem 10:00
      sla_minutes: 30
    },
    {
      id: 5,
      attended_at: null, // Não atendido
      sla_minutes: null
    }
  ];
  
  // Filtrar leads atendidos hoje
  const todayLeads = testLeads.filter(l => {
    if (!l.attended_at || l.sla_minutes === null) return false;
    return isSameDay(l.attended_at, todayStart);
  });
  
  console.log('📊 Resultados:');
  console.log(`   Total de leads de teste: ${testLeads.length}`);
  console.log(`   Leads atendidos HOJE: ${todayLeads.length}`);
  console.log(`   IDs dos leads de hoje: ${todayLeads.map(l => l.id).join(', ')}`);
  console.log(`   IDs dos leads de ontem: ${testLeads.filter(l => l.attended_at && !isSameDay(l.attended_at, todayStart)).map(l => l.id).join(', ')}`);
  
  // Validações
  const expectedToday = 2; // IDs 1 e 2
  const actualToday = todayLeads.length;
  
  if (actualToday === expectedToday) {
    console.log('\n✅ TESTE PASSOU: Contagem correta!');
  } else {
    console.log(`\n❌ TESTE FALHOU: Esperado ${expectedToday}, obtido ${actualToday}`);
  }
  
  // Verificar se leads de ontem não contam
  const yesterdayLeads = testLeads.filter(l => {
    if (!l.attended_at || l.sla_minutes === null) return false;
    const yesterday = new Date(todayStart);
    yesterday.setDate(yesterday.getDate() - 1);
    return isSameDay(l.attended_at, yesterday);
  });
  
  if (yesterdayLeads.length === 2) { // IDs 3 e 4
    console.log('✅ TESTE PASSOU: Leads de ontem não contam para hoje!');
  } else {
    console.log(`❌ TESTE FALHOU: Leads de ontem estão sendo contados incorretamente`);
  }
}

testAtendidosHoje();
```

**Executar:**
```bash
node test-atendidos-hoje.js
```

---

## 📊 Teste Visual no Dashboard

### Passo a Passo:

1. **Abrir o Dashboard:**
   ```
   http://localhost:8080
   ```

2. **Observar o Card "Atendidos Hoje":**
   - Anote o valor atual
   - Verifique se faz sentido com os dados do banco

3. **Criar Lead de Teste:**
   - Crie um lead no Pipedrive
   - Atenda o lead (mova para pipeline individual)
   - Aguarde alguns segundos

4. **Verificar Atualização:**
   - O card deve atualizar automaticamente (se Realtime estiver ativo)
   - Ou clique no botão de refresh
   - O contador deve aumentar em +1

5. **Verificar na Tabela:**
   - Vá até a tabela de leads
   - Filtre por "Hoje" se disponível
   - Verifique se o lead de teste aparece
   - Verifique se o `attended_at` é de hoje

---

## 🔍 Verificação no Console do Navegador

**Abra o DevTools (F12) → Console e execute:**

```javascript
// Função para testar a lógica
function testarAtendidosHoje() {
  // Simular dados de leads
  const leads = [
    {
      attended_at: new Date().toISOString(), // Hoje agora
      sla_minutes: 15
    },
    {
      attended_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // Hoje há 2 horas
      sla_minutes: 20
    },
    {
      attended_at: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(), // Ontem há 1 hora
      sla_minutes: 25
    }
  ];
  
  // Importar date-fns (se disponível) ou usar lógica similar
  const startOfDay = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  };
  
  const isSameDay = (date1, date2) => {
    const d1 = startOfDay(date1);
    const d2 = startOfDay(date2);
    return d1.getTime() === d2.getTime();
  };
  
  const todayStart = startOfDay(new Date());
  
  const todayLeads = leads.filter(l => {
    if (!l.attended_at || l.sla_minutes === null) return false;
    return isSameDay(new Date(l.attended_at), todayStart);
  });
  
  console.log('📊 Teste de "Atendidos Hoje":');
  console.log(`   Total de leads: ${leads.length}`);
  console.log(`   Atendidos HOJE: ${todayLeads.length}`);
  console.log(`   Leads de hoje:`, todayLeads);
  
  return todayLeads.length;
}

testarAtendidosHoje();
```

---

## ✅ Critérios de Sucesso

O card "Atendidos Hoje" está funcionando corretamente se:

1. ✅ **Zera à meia-noite:** O contador volta para 0 após 00:00:00
2. ✅ **Acumula durante o dia:** Aumenta quando leads são atendidos hoje
3. ✅ **Não conta leads de ontem:** Leads com `attended_at` de ontem não aparecem
4. ✅ **Não conta leads futuros:** Leads com `attended_at` futuro não aparecem
5. ✅ **Atualiza em tempo real:** Reflete mudanças automaticamente (ou após refresh)
6. ✅ **Independente do filtro:** Sempre mostra apenas leads de hoje, independente do filtro de período

---

## 🐛 Se Algo Estiver Errado

### Problema: Contador não zera à meia-noite

**Possível Causa:** Cache ou dados não atualizados

**Solução:**
1. Recarregue a página após 00:00
2. Verifique se os dados estão sendo buscados corretamente
3. Verifique se há cache no frontend

### Problema: Conta leads de ontem

**Possível Causa:** Lógica de comparação incorreta

**Solução:**
1. Verifique se está usando `isSameDay()` corretamente
2. Verifique se `startOfDay()` está sendo usado
3. Verifique timezone do servidor vs cliente

### Problema: Não atualiza em tempo real

**Possível Causa:** Realtime não está funcionando ou dados não estão sendo recarregados

**Solução:**
1. Verifique conexão com Supabase Realtime
2. Use o botão de refresh manual
3. Verifique logs do backend para ver se webhooks estão chegando

---

## 📝 Exemplo de Teste Completo

### Cenário de Teste:

1. **Às 23:55:** Anote o valor do card (ex: 15)
2. **Às 00:05:** Verifique se zerou (deve ser 0)
3. **Às 10:00:** Crie e atenda um lead → Deve mostrar 1
4. **Às 14:00:** Crie e atenda outro lead → Deve mostrar 2
5. **Às 23:59:** Verifique o valor final (ex: 2)
6. **Às 00:01:** Verifique se zerou novamente

---

## 🎯 Resumo Rápido

**Teste Mais Simples:**
1. Anote o valor atual do card "Atendidos Hoje"
2. Crie um lead de teste e atenda agora
3. Verifique se o contador aumentou em +1
4. Verifique no banco se o lead tem `attended_at` de hoje

**Teste de Validação:**
```sql
-- No Supabase SQL Editor
SELECT COUNT(*) 
FROM leads_sla 
WHERE DATE(attended_at) = CURRENT_DATE 
  AND sla_minutes IS NOT NULL;
```

O resultado deve corresponder ao valor do card "Atendidos Hoje" no dashboard!

---

## ✅ Pronto!

Use estes testes para validar se a funcionalidade está funcionando corretamente. Se encontrar algum problema, os logs de diagnóstico ajudarão a identificar a causa.

