# Como Funciona a Jornada de Atendimento dos SDRs

## 📋 Visão Geral

A **Jornada de Atendimento** registra quando e como os SDRs trabalham, baseado na movimentação de leads do Pipedrive. Ela calcula os turnos de trabalho (manhã e tarde) e mostra quando cada SDR iniciou e finalizou suas atividades.

---

## 🔄 Fluxo de Funcionamento

### 1. **Quando um Evento é Registrado?**

Um evento de jornada é registrado **APENAS** quando:

✅ **Lead é movido do pipeline principal "SDR" → Pipeline individual "NOME - SDR"**
- Isso significa que o lead estava **PENDENTE** e foi **ATENDIDO** por um SDR
- O evento é registrado no momento exato dessa movimentação

### 2. **O que NÃO é registrado?**

❌ Mudanças de stage dentro do pipeline principal "SDR"
- Exemplo: Lead mudando de "TEM PERFIL" para "PERFIL MENOR" dentro do pipeline "SDR"
- **Motivo:** O lead ainda está pendente, não foi atendido

❌ Mudanças dentro de pipelines individuais
- Exemplo: Lead mudando de stage dentro do pipeline "JOÃO - SDR"
- **Motivo:** O lead já foi atendido, mudanças internas não contam

❌ Leads criados diretamente em pipelines individuais (caso raro)
- Se um lead for criado já no pipeline individual, também é registrado

---

## 📊 Como os Dados São Calculados

### Turnos de Trabalho

A jornada divide o dia em **2 turnos** (horário de São Paulo):

#### 🌅 **Turno da Manhã: 06:00 às 12:00**
- **Primeira ação:** Timestamp da primeira movimentação de lead neste horário
- **Última ação:** Timestamp da última movimentação neste horário
- **Total de ações:** Quantidade de leads atendidos neste turno

#### 🌇 **Turno da Tarde: 13:00 às 18:00**
- **Primeira ação:** Timestamp da primeira movimentação de lead neste horário
- **Última ação:** Timestamp da última movimentação neste horário
- **Total de ações:** Quantidade de leads atendidos neste turno

### Agrupamento

Os dados são agrupados por:
- **SDR** (`user_id` do Pipedrive)
- **Data** (dia civil em horário de São Paulo)

---

## 🔍 Exemplo Prático

### Cenário:

1. **08:30 (SP)** - SDR João move lead #123 do pipeline "SDR" → "JOÃO - SDR"
   - ✅ **Evento registrado:** Turno Manhã, primeira ação = 08:30

2. **10:15 (SP)** - SDR João move lead #456 do pipeline "SDR" → "JOÃO - SDR"
   - ✅ **Evento registrado:** Turno Manhã, última ação = 10:15

3. **14:30 (SP)** - SDR João move lead #789 do pipeline "SDR" → "JOÃO - SDR"
   - ✅ **Evento registrado:** Turno Tarde, primeira ação = 14:30

4. **17:45 (SP)** - SDR João move lead #101 do pipeline "SDR" → "JOÃO - SDR"
   - ✅ **Evento registrado:** Turno Tarde, última ação = 17:45

### Resultado na Tabela:

| SDR | Data | Manhã | Tarde | Total |
|-----|------|-------|-------|-------|
| João | 11/12/2024 | 08:30 - 10:15 (2 ações) | 14:30 - 17:45 (2 ações) | 4 |

---

## ⚙️ Requisitos Técnicos

### 1. **Migração SQL Executada**
A tabela `sdr_attendance_events` deve existir no Supabase:
```sql
-- Execute: backend/migrations/003_create_sdr_attendance_events.sql
```

### 2. **Webhook do Pipedrive Configurado**
- Webhook deve estar apontando para o backend
- Eventos `added` e `updated` devem estar habilitados

### 3. **Payload do Webhook Deve Conter**
- `user_id` ou `owner_id` (ID do SDR que fez a ação)
- `pipeline_id` (para identificar pipeline principal vs individual)
- `update_time` ou `updated_at` (timestamp da ação)

---

## 🧪 Como Verificar se Está Funcionando

### 1. **Verificar se Eventos Estão Sendo Registrados**

Execute no Supabase SQL Editor:
```sql
-- Ver todos os eventos registrados
SELECT * FROM sdr_attendance_events 
ORDER BY timestamp DESC 
LIMIT 10;

-- Contar eventos por SDR
SELECT 
  user_id, 
  user_name, 
  COUNT(*) as total_eventos,
  MIN(timestamp) as primeira_acao,
  MAX(timestamp) as ultima_acao
FROM sdr_attendance_events
GROUP BY user_id, user_name
ORDER BY total_eventos DESC;
```

### 2. **Testar o Endpoint da API**

```bash
# Buscar todas as métricas
curl https://seu-backend.onrender.com/api/metrics/sdr-attendance

# Buscar métricas de um SDR específico
curl https://seu-backend.onrender.com/api/metrics/sdr-attendance?sdr_id=123

# Buscar métricas de uma data específica
curl https://seu-backend.onrender.com/api/metrics/sdr-attendance?date=2024-12-11
```

### 3. **Verificar Logs do Backend**

Quando um evento é registrado, você verá nos logs:
```
📝 Evento de atendimento registrado para SDR {userId} (deal {dealId})
```

---

## ❓ Por Que Pode Estar Vazio?

### Possíveis Motivos:

1. **Nenhum lead foi movido ainda**
   - A jornada só registra quando leads são **atendidos** (movidos para pipeline individual)
   - Se todos os leads ainda estão no pipeline principal "SDR", não há eventos

2. **Migração SQL não foi executada**
   - A tabela `sdr_attendance_events` não existe
   - Execute a migração SQL no Supabase

3. **Webhook não está configurado corretamente**
   - Verifique se o webhook está apontando para o backend correto
   - Verifique se os eventos estão sendo recebidos

4. **userId não está presente no payload**
   - O webhook precisa conter `user_id` ou `owner_id`
   - Sem isso, o evento não é registrado

---

## 🎯 Como Gerar Dados para Teste

### Opção 1: Mover Leads Manualmente no Pipedrive

1. Acesse o Pipedrive
2. Encontre um lead no pipeline principal "SDR"
3. Mova o lead para um pipeline individual (ex: "JOÃO - SDR")
4. O evento será registrado automaticamente

### Opção 2: Verificar Leads Já Atendidos

Se você já tem leads atendidos no sistema, eles não gerarão eventos retroativos. Apenas **novas movimentações** geram eventos.

---

## 📈 O Que a Jornada Mostra?

### Informações Exibidas:

1. **SDR:** Nome ou ID do SDR
2. **Data:** Dia em que as ações ocorreram
3. **Manhã:**
   - Horário da primeira ação
   - Horário da última ação
   - Quantidade de ações
   - Duração do turno
4. **Tarde:**
   - Horário da primeira ação
   - Horário da última ação
   - Quantidade de ações
   - Duração do turno
5. **Total:** Soma de todas as ações do dia

---

## 🔄 Atualização Automática

- O componente atualiza automaticamente a cada **60 segundos**
- Novos eventos aparecem automaticamente na tabela
- Não é necessário recarregar a página

---

## 💡 Dicas

1. **Aguarde movimentações reais:** A jornada só funciona com dados reais do Pipedrive
2. **Verifique os logs:** Se não houver eventos, verifique os logs do backend
3. **Teste com um lead:** Mova um lead manualmente para ver o evento sendo registrado
4. **Horário de São Paulo:** Todos os horários são convertidos para America/Sao_Paulo

---

## 🆘 Troubleshooting

### Problema: "Nenhum dado de jornada disponível"

**Soluções:**
1. Execute a migração SQL no Supabase
2. Verifique se há eventos na tabela `sdr_attendance_events`
3. Mova um lead do pipeline principal para um individual no Pipedrive
4. Verifique os logs do backend para erros

### Problema: Eventos não aparecem

**Verifique:**
1. Se o `user_id` está presente no payload do webhook
2. Se a tabela foi criada corretamente
3. Se o backend está processando os webhooks
4. Se há erros nos logs do backend

---

**Resumo:** A jornada de atendimento registra **apenas quando leads são atendidos** (movidos do pipeline principal para pipelines individuais), calculando os turnos de trabalho de cada SDR.



