# 🔗 Configuração Completa do Webhook - Pipedrive

## ✅ URL DO SEU BACKEND

**Backend no Render:**
```
https://dashboard-sdr-sla.onrender.com
```

---

## 🔗 URL COMPLETA DO WEBHOOK

**Use esta URL no Pipedrive:**
```
https://dashboard-sdr-sla.onrender.com/api/webhook/pipedrive
```

---

## 📋 CONFIGURAÇÃO NO PIPEDRIVE

### Passo 1: Acessar Webhooks

1. Acesse [app.pipedrive.com](https://app.pipedrive.com)
2. Clique no seu **avatar** (canto superior direito)
3. Clique em **Settings** (Configurações)
4. No menu lateral, clique em **Webhooks**

### Passo 2: Criar Webhook 1 - Deal Added

1. Clique em **"Add webhook"** ou **"Adicionar webhook"**
2. Preencha:

**Webhook name:**
```
Lead Monitor - Deal Added
```

**Event action:**
```
added
```

**Event object:**
```
deal
```

**User permission level:**
```
Henes Neto (you) (ou seu usuário)
```

**Endpoint URL:**
```
https://dashboard-sdr-sla.onrender.com/api/webhook/pipedrive
```

**HTTP Auth username:**
```
(deixe vazio)
```

**HTTP Auth password:**
```
(deixe vazio)
```

3. Clique em **Save**

### Passo 3: Criar Webhook 2 - Deal Updated

1. Clique em **"Add webhook"** novamente
2. Preencha:

**Webhook name:**
```
Lead Monitor - Deal Updated
```

**Event action:**
```
updated
```

**Event object:**
```
deal
```

**User permission level:**
```
Henes Neto (you) (ou seu usuário)
```

**Endpoint URL:**
```
https://dashboard-sdr-sla.onrender.com/api/webhook/pipedrive
```
⚠️ **Mesma URL do webhook anterior!**

**HTTP Auth username:**
```
(deixe vazio)
```

**HTTP Auth password:**
```
(deixe vazio)
```

3. Clique em **Save**

---

## ✅ VERIFICAÇÃO

Após criar os webhooks, você deve ter:

1. ✅ **Webhook 1:** "Lead Monitor - Deal Added"
   - Event: `added` + `deal`
   - URL: `https://dashboard-sdr-sla.onrender.com/api/webhook/pipedrive`
   - Status: **Active**

2. ✅ **Webhook 2:** "Lead Monitor - Deal Updated"
   - Event: `updated` + `deal`
   - URL: `https://dashboard-sdr-sla.onrender.com/api/webhook/pipedrive`
   - Status: **Active**

---

## 🧪 TESTAR O WEBHOOK

### Teste 1: Verificar Backend

Abra no navegador:
```
https://dashboard-sdr-sla.onrender.com/health
```

**Deve retornar:**
```json
{"status":"ok","message":"Backend is running"}
```

### Teste 2: Criar Deal de Teste

1. No Pipedrive, vá em **Deals** (Negócios)
2. Clique em **Add deal** (Adicionar negócio)
3. Preencha:
   - **Title:** "Teste Webhook - [sua data]"
   - **Pipeline:** Selecione **"SDR"**
   - **Stage:** Selecione qualquer stage válido:
     - TEM PERFIL
     - PERFIL MENOR
     - INCONCLUSIVO
     - SEM PERFIL
4. Clique em **Save**

### Teste 3: Verificar Logs do Render

1. Acesse o painel do [Render](https://render.com)
2. Vá no seu serviço
3. Clique em **Logs**
4. Procure por:
   - `📥 Webhook recebido`
   - `📥 Deal: id=..., title=...`
   - `✅ Lead criado com sucesso`

### Teste 4: Verificar no Supabase

Execute no SQL Editor do Supabase:
```sql
SELECT * FROM leads_sla 
ORDER BY created_at DESC 
LIMIT 5;
```

O lead de teste deve aparecer na lista!

---

## 🔍 ESTRUTURA ESPERADA NO PIPEDRIVE

Para o webhook funcionar, você precisa ter:

### Pipeline Principal "SDR"
- **Nome exato:** "SDR" (case-insensitive)
- **Stages válidos:**
  - ✅ TEM PERFIL
  - ✅ PERFIL MENOR
  - ✅ INCONCLUSIVO
  - ✅ SEM PERFIL

### Pipelines Individuais (para atendimento)
- **Formato:** "NOME - SDR"
- **Exemplos:**
  - "João - SDR"
  - "Maria - SDR"
  - "Carlos - SDR"

**Como funciona:**
- Deal no pipeline "SDR" → Lead **pendente**
- Deal movido para "NOME - SDR" → Lead **atendido** (SLA calculado)

---

## 🐛 SE NÃO FUNCIONAR

### Verificar Logs do Render

1. Acesse o Render
2. Vá em **Logs**
3. Procure por erros:
   - `❌ Invalid API key` → Verifique `SUPABASE_KEY`
   - `❌ Pipeline não é SDR` → Verifique nome do pipeline
   - `❌ Etapa não válida` → Verifique o stage

### Verificar Variáveis de Ambiente no Render

Certifique-se de que estão configuradas:

```env
SUPABASE_URL=https://vfxqwsleorpssxzoxvcy.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmeHF3c2xlb3Jwc3N4em94dmN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3ODMxNjAsImV4cCI6MjA4MDM1OTE2MH0.nOI1AJZTVQJUy3oJlJB_IwzzGqadTptfnGOCrsGwvuM
PIPEDRIVE_API_TOKEN=seu-token-pipedrive
FRONTEND_URL=https://seu-site.netlify.app
```

---

## ✅ CHECKLIST FINAL

- [ ] Webhook 1 criado (deal.added)
- [ ] Webhook 2 criado (deal.updated)
- [ ] URLs estão corretas
- [ ] Status dos webhooks está "Active"
- [ ] Pipeline "SDR" existe no Pipedrive
- [ ] Stages válidos configurados
- [ ] Backend está rodando (`/health` funciona)
- [ ] Variáveis de ambiente configuradas no Render
- [ ] Teste criado e verificado nos logs
- [ ] Lead apareceu no Supabase

---

## 🎉 PRONTO!

Após configurar os webhooks, o sistema estará funcionando:

1. ✅ Novos deals no Pipedrive aparecerão automaticamente no dashboard
2. ✅ Quando um deal for atendido (movido para pipeline individual), o SLA será calculado
3. ✅ O dashboard mostrará métricas em tempo real

**URLs importantes:**
- **Backend:** https://dashboard-sdr-sla.onrender.com
- **Health Check:** https://dashboard-sdr-sdr-sla.onrender.com/health
- **Webhook:** https://dashboard-sdr-sla.onrender.com/api/webhook/pipedrive

