# 🔍 Diagnóstico Rápido - Dados Não Chegam

## ✅ CHECKLIST RÁPIDO (5 minutos)

### 1. Backend está rodando?
```
Teste: https://seu-backend.onrender.com/health
Deve retornar: {"status":"ok","message":"Backend is running"}
```
❌ **Se não funcionar:** Backend não está rodando ou URL está errada

---

### 2. Webhook está recebendo requisições?

**No Render:**
1. Vá em **Logs**
2. Procure por: `📥 Webhook recebido` ou `POST /api/webhook/pipedrive`
3. Se aparecer → Webhook está sendo acionado ✅
4. Se não aparecer → Webhook não está sendo acionado ❌

**Se não aparecer:**
- Verifique se o webhook está ativo no Pipedrive
- Verifique se a URL está correta
- Crie um novo deal no Pipedrive para testar

---

### 3. Deal está no pipeline correto?

**No Pipedrive:**
- Pipeline deve ser exatamente **"SDR"** (case-insensitive)
- Stage deve ser um dos válidos:
  - ✅ TEM PERFIL
  - ✅ PERFIL MENOR
  - ✅ INCONCLUSIVO
  - ✅ SEM PERFIL

**Se não estiver:**
- Mova o deal para o pipeline "SDR"
- Selecione um stage válido

---

### 4. Dados estão no Supabase?

**Execute no SQL Editor do Supabase:**
```sql
SELECT COUNT(*) FROM leads_sla;
```

**Se retornar 0:**
- Dados não estão sendo salvos
- Verifique os logs do Render para erros
- Verifique se as credenciais do Supabase estão corretas

**Se retornar > 0:**
- Dados estão sendo salvos ✅
- Problema pode ser no frontend

---

### 5. Frontend está conectado ao backend?

**No Netlify:**
1. Site settings > Environment variables
2. Verifique `VITE_API_URL`:
   ```
   VITE_API_URL=https://seu-backend.onrender.com
   ```
   ⚠️ **NÃO deve ter `/api` no final!**

**Teste no navegador:**
1. Abra o console (F12)
2. Vá em Network
3. Recarregue a página
4. Procure por requisições para `/api/metrics/general`
5. Se aparecer erro → Frontend não está conectado

---

## 🚨 PROBLEMAS MAIS COMUNS

### Problema 1: Webhook não está sendo acionado

**Sintoma:** Nenhum log no Render

**Soluções:**
1. Verifique se o webhook está **Active** no Pipedrive
2. Verifique se a URL está correta
3. Teste criando um novo deal no Pipedrive
4. Verifique se o deal está no pipeline "SDR"

---

### Problema 2: Pipeline não é reconhecido como "SDR"

**Sintoma:** Logs mostram "Pipeline não é SDR"

**Soluções:**
1. Verifique se o pipeline se chama exatamente **"SDR"**
2. Verifique se o `PIPEDRIVE_API_TOKEN` está correto no Render
3. O backend precisa consultar a API do Pipedrive para verificar o nome do pipeline

---

### Problema 3: Stage não é válido

**Sintoma:** Logs mostram "Etapa não válida"

**Soluções:**
1. Verifique se o stage contém uma das palavras:
   - TEM PERFIL
   - PERFIL MENOR
   - INCONCLUSIVO
   - SEM PERFIL
2. O sistema é case-insensitive, mas precisa conter essas palavras

---

### Problema 4: Erro ao salvar no Supabase

**Sintoma:** Logs mostram erro ao salvar

**Soluções:**
1. Verifique `SUPABASE_URL` no Render
2. Verifique `SUPABASE_KEY` no Render
3. Verifique se a tabela `leads_sla` existe
4. Verifique se o RLS está configurado corretamente

---

## 🔧 TESTE RÁPIDO

### Teste 1: Verificar Backend
```bash
curl https://seu-backend.onrender.com/health
```

### Teste 2: Verificar API
```bash
curl https://seu-backend.onrender.com/api/metrics/general
```

### Teste 3: Verificar Supabase
```sql
SELECT * FROM leads_sla ORDER BY created_at DESC LIMIT 5;
```

---

## 📊 INFORMAÇÕES PARA DEBUG

Me envie estas informações:

1. **URL do backend:** `https://...`
2. **Últimos 20-30 linhas dos logs do Render**
3. **Resultado do teste `/health`**
4. **Resultado da query SQL no Supabase**
5. **Nome exato do pipeline no Pipedrive**
6. **Nome exato do stage do deal**

Com essas informações, consigo identificar o problema exato!



