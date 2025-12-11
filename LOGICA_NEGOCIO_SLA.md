# 📋 Lógica de Negócio - Sistema de SLA

## ✅ COMO FUNCIONA

### 1. Pipeline "SDR" (Funil Principal)

**Stages válidos (apenas estes são contabilizados):**
- ✅ **TEM PERFIL** (prioridade 1)
- ✅ **PERFIL MENOR** (prioridade 2)
- ✅ **INCONCLUSIVO** (prioridade 3)
- ✅ **SEM PERFIL** (prioridade 4)

**Comportamento:**
- ✅ Lead em stage válido → **PENDENTE** no dashboard
- ❌ Lead em stage inválido → **IGNORADO completamente** (não aparece no sistema)
- ✅ Mudança entre stages válidos → Atualiza o stage no dashboard
- ❌ Mudança para stage inválido → Ignora a mudança

**Exemplo:**
- Lead em "TEM PERFIL" → Aparece como pendente ✅
- Lead em "Outro Stage" → Não aparece (ignorado) ❌
- Lead muda de "TEM PERFIL" para "PERFIL MENOR" → Atualiza stage ✅
- Lead muda de "TEM PERFIL" para "Outro Stage" → Ignora mudança ❌

---

### 2. Pipelines Individuais "NOME - SDR"

**Formato:**
- "JOÃO - SDR"
- "MARIA - SDR"
- "CARLOS - SDR"
- Qualquer nome seguido de " - SDR" ou "-SDR"

**Comportamento:**
- ✅ Lead movido de "SDR" para "NOME - SDR" → **ATENDIDO** (SLA calculado)
- ✅ Lead criado diretamente em "NOME - SDR" → **ATENDIDO** imediatamente
- ❌ Mudanças de stage DENTRO de pipelines individuais → **IGNORADAS** (não afetam o sistema)
- ❌ Lead já atendido em pipeline individual → Mudanças são ignoradas

**Exemplo:**
- Lead em "SDR" → Movido para "JOÃO - SDR" → **ATENDIDO** ✅
- Lead em "JOÃO - SDR" → Muda de stage → **IGNORADO** (já está atendido) ❌
- Lead criado em "MARIA - SDR" → **ATENDIDO** imediatamente ✅

---

## 🔄 FLUXO COMPLETO

### Cenário 1: Lead Criado no Pipeline "SDR"

1. **Criação:**
   - Lead criado no pipeline "SDR"
   - Stage: "TEM PERFIL" (válido)
   - **Resultado:** Lead aparece como **PENDENTE** no dashboard

2. **Mudança de Stage (dentro do "SDR"):**
   - Lead muda de "TEM PERFIL" para "PERFIL MENOR"
   - **Resultado:** Stage atualizado no dashboard (continua pendente)

3. **Atendimento:**
   - Lead movido de "SDR" para "JOÃO - SDR"
   - **Resultado:** Lead marcado como **ATENDIDO**, SLA calculado

4. **Após Atendimento:**
   - Lead em "JOÃO - SDR" muda de stage
   - **Resultado:** Mudança **IGNORADA** (já está atendido)

---

### Cenário 2: Lead Criado em Stage Inválido

1. **Criação:**
   - Lead criado no pipeline "SDR"
   - Stage: "Outro Stage" (inválido)
   - **Resultado:** Lead **IGNORADO** (não aparece no sistema)

2. **Mudança para Stage Válido:**
   - Lead muda para "TEM PERFIL"
   - **Resultado:** Lead **CRIADO** e aparece como pendente

---

### Cenário 3: Lead Criado Diretamente em Pipeline Individual

1. **Criação:**
   - Lead criado em "MARIA - SDR"
   - **Resultado:** Lead marcado como **ATENDIDO** imediatamente
   - SLA = 0 (ou tempo desde criação até agora)

---

## 📊 CÁLCULO DE SLA

**SLA = Tempo entre:**
- **Entrada:** Quando o lead entrou no pipeline "SDR" (em stage válido)
- **Atendimento:** Quando o lead foi movido para um pipeline individual "NOME - SDR"

**Exemplo:**
- Lead criado em "SDR" às 10:00
- Movido para "JOÃO - SDR" às 10:15
- **SLA = 15 minutos**

---

## ⚠️ REGRAS IMPORTANTES

### O que é IGNORADO:

1. ❌ Stages inválidos no pipeline "SDR"
2. ❌ Mudanças de stage dentro de pipelines individuais (após atendimento)
3. ❌ Pipelines que não são "SDR" ou "NOME - SDR"
4. ❌ Deals que não estão em pipelines de SDR

### O que é CONTABILIZADO:

1. ✅ Leads em stages válidos no pipeline "SDR" → Pendentes
2. ✅ Movimento de "SDR" para "NOME - SDR" → Atendido
3. ✅ Mudanças entre stages válidos no "SDR" → Atualiza stage
4. ✅ Leads criados diretamente em "NOME - SDR" → Atendido

---

## 🔍 VERIFICAÇÃO NO CÓDIGO

A lógica está implementada em:
- `backend/src/webhooks/pipedriveHandler.ts` - Processa webhooks
- `backend/src/services/pipedriveService.ts` - Identifica pipelines e stages

**Funções principais:**
- `isValidSDRStage()` - Verifica se stage é válido
- `isMainSDRPipeline()` - Verifica se é pipeline "SDR"
- `isIndividualSDRPipeline()` - Verifica se é pipeline "NOME - SDR"
- `handleDealAdded()` - Processa criação de deals
- `handleDealUpdated()` - Processa atualização de deals

---

## ✅ CONFIRMAÇÃO

**Sua lógica está corretamente implementada!**

O código já faz exatamente o que você descreveu:
- ✅ Apenas stages válidos no "SDR" são contabilizados
- ✅ Stages inválidos são ignorados completamente
- ✅ Movimento para "NOME - SDR" marca como atendido
- ✅ Mudanças dentro de pipelines individuais são ignoradas

**Não é necessário fazer alterações no código!**



