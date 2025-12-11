# 🔍 Troubleshooting: Dados Não Chegam no Dashboard

Guia para diagnosticar e resolver problemas quando os dados não aparecem no dashboard.

---

## 🔴 CHECKLIST DE VERIFICAÇÃO

### 1. Backend está rodando?

**Teste:**
```
https://seu-backend.onrender.com/health
```

**Deve retornar:**
```json
{"status":"ok","message":"Backend is running"}
```

**Se não funcionar:**
- Verifique se o deploy foi concluído no Render
- Verifique os logs do Render para erros
- Verifique se as variáveis de ambiente estão configuradas

---

### 2. Webhook está configurado corretamente?

**Verifique no Pipedrive:**
1. Settings > Webhooks
2. O webhook deve estar:
   - ✅ Status: **Active**
   - ✅ URL: `https://seu-backend.onrender.com/api/webhook/pipedrive`
   - ✅ Events: `deal.added` e `deal.updated`
   - ✅ Event object: `deal`

**Se não estiver correto:**
- Corrija a URL
- Verifique se os eventos estão marcados
- Reative o webhook se estiver inativo

---

### 3. Backend está recebendo webhooks?

**Verifique os logs do Render:**
1. Acesse o painel do Render
2. Vá em **Logs**
3. Procure por:
   - `POST /api/webhook/pipedrive` - Requisições recebidas
   - `📥 Webhook recebido do Pipedrive` - Confirmação
   - `❌ Erro` - Se houver problemas

**Se não aparecer nada:**
- O webhook pode não estar sendo acionado
- Verifique se criou um deal no Pipedrive
- Verifique se o deal está no pipeline "SDR"

**Se aparecer erro:**
- Anote a mensagem de erro
- Verifique as variáveis de ambiente
- Verifique se o Supabase está acessível

---

### 4. Deal está no pipeline correto?

**Verifique no Pipedrive:**
- O deal deve estar no pipeline **"SDR"** (nome exato)
- O stage deve ser um dos válidos:
  - ✅ TEM PERFIL
  - ✅ PERFIL MENOR
  - ✅ INCONCLUSIVO
  - ✅ SEM PERFIL

**Se não estiver:**
- Mova o deal para o pipeline "SDR"
- Selecione um stage válido
- O webhook será acionado automaticamente

---

### 5. Frontend está conectado ao backend correto?

**Verifique no Netlify:**
1. Site settings > Build & deploy > Environment variables
2. Verifique se `VITE_API_URL` está correto:
   ```
   VITE_API_URL=https://seu-backend.onrender.com
   ```
3. ⚠️ **IMPORTANTE:** Não deve ter `/api` no final!

**Se estiver errado:**
- Atualize a variável
- Faça um novo deploy no Netlify

---

### 6. Dados estão no Supabase?

**Verifique no Supabase:**
1. Acesse o SQL Editor
2. Execute:
   ```sql
   SELECT * FROM leads_sla ORDER BY created_at DESC LIMIT 10;
   ```
3. Verifique se há registros

**Se não houver registros:**
- O webhook não está salvando dados
- Verifique os logs do backend para erros
- Verifique se as credenciais do Supabase estão corretas

**Se houver registros:**
- O problema pode ser no frontend
- Verifique se o frontend está buscando dados corretamente

---

## 🐛 PROBLEMAS COMUNS E SOLUÇÕES

### Problema 1: Webhook não está sendo acionado

**Sintomas:**
- Nenhum log no Render
- Nenhum dado no Supabase

**Soluções:**
1. Verifique se o webhook está ativo no Pipedrive
2. Verifique se a URL está correta
3. Teste criando um novo deal no Pipedrive
4. Verifique se o deal está no pipeline "SDR"

---

### Problema 2: Erro 404 no webhook

**Sintomas:**
- Logs mostram `404 Not Found`
- Webhook não encontra o endpoint

**Soluções:**
1. Verifique se a URL termina com `/api/webhook/pipedrive`
2. Verifique se o backend está rodando
3. Teste a URL manualmente no navegador (deve dar erro, mas confirma que está acessível)

---

### Problema 3: Erro 500 no webhook

**Sintomas:**
- Logs mostram `500 Internal Server Error`
- Backend recebe mas não processa

**Soluções:**
1. Verifique os logs do Render para o erro específico
2. Verifique se as variáveis de ambiente estão configuradas:
   - `SUPABASE_URL`
   - `SUPABASE_KEY`
   - `PIPEDRIVE_API_TOKEN`
3. Verifique se o Supabase está acessível
4. Verifique se a tabela `leads_sla` existe

---

### Problema 4: Deal não está no pipeline "SDR"

**Sintomas:**
- Webhook é acionado mas não processa
- Logs mostram "Pipeline não é SDR"

**Soluções:**
1. Verifique se o pipeline se chama exatamente "SDR"
2. Mova o deal para o pipeline "SDR"
3. Verifique se o stage é válido

---

### Problema 5: Frontend não mostra dados

**Sintomas:**
- Dados estão no Supabase
- Frontend não carrega

**Soluções:**
1. Verifique se `VITE_API_URL` está correto no Netlify
2. Abra o console do navegador (F12) e verifique erros
3. Verifique se o backend está acessível
4. Limpe o cache do navegador
5. Verifique a Network tab no DevTools para ver requisições

---

### Problema 6: CORS Error

**Sintomas:**
- Console mostra erro de CORS
- Frontend não consegue fazer requisições

**Soluções:**
1. Verifique se `FRONTEND_URL` está configurado no Render
2. Verifique se a URL do Netlify está correta
3. Verifique se o CORS está habilitado no backend

---

## 🔧 TESTES PASSO A PASSO

### Teste 1: Verificar Backend

```bash
# Teste no navegador ou curl
curl https://seu-backend.onrender.com/health
```

**Resultado esperado:**
```json
{"status":"ok","message":"Backend is running"}
```

---

### Teste 2: Verificar Webhook Manualmente

```bash
# Teste enviando um webhook de teste (substitua pela URL real)
curl -X POST https://seu-backend.onrender.com/api/webhook/pipedrive \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

**Resultado esperado:**
- Deve retornar algum erro (pois não é um webhook válido)
- Mas confirma que o endpoint está acessível

---

### Teste 3: Verificar API de Métricas

```bash
# Teste no navegador
https://seu-backend.onrender.com/api/metrics/general
```

**Resultado esperado:**
```json
{
  "success": true,
  "data": {
    "total_leads": 0,
    "attended_leads": 0,
    ...
  }
}
```

---

### Teste 4: Criar Deal de Teste

1. No Pipedrive, crie um deal:
   - Title: "Teste Debug"
   - Pipeline: "SDR"
   - Stage: "TEM PERFIL"
2. Salve
3. Verifique os logs do Render imediatamente
4. Verifique no Supabase se o registro foi criado

---

## 📊 VERIFICAÇÃO NO SUPABASE

### Verificar se há dados:

```sql
-- Contar total de leads
SELECT COUNT(*) FROM leads_sla;

-- Ver últimos 10 leads
SELECT * FROM leads_sla 
ORDER BY created_at DESC 
LIMIT 10;

-- Ver leads pendentes
SELECT * FROM leads_sla 
WHERE attended_at IS NULL 
ORDER BY entered_at DESC;
```

---

## 🔍 LOGS IMPORTANTES

### No Render, procure por:

**Sucesso:**
- `📥 Webhook recebido do Pipedrive`
- `✅ Lead criado com sucesso`
- `✅ Lead atualizado com sucesso`

**Erros:**
- `❌ Erro ao processar webhook`
- `❌ Pipeline não é SDR`
- `❌ Stage inválido`
- `❌ Erro ao salvar no Supabase`

---

## ✅ CHECKLIST COMPLETO

- [ ] Backend está rodando (`/health` funciona)
- [ ] Webhook está ativo no Pipedrive
- [ ] URL do webhook está correta
- [ ] Eventos `deal.added` e `deal.updated` estão marcados
- [ ] Deal está no pipeline "SDR"
- [ ] Stage é válido (TEM PERFIL, PERFIL MENOR, etc.)
- [ ] Variáveis de ambiente estão configuradas no Render
- [ ] Supabase está acessível
- [ ] Tabela `leads_sla` existe
- [ ] Frontend está conectado ao backend correto
- [ ] `VITE_API_URL` está correto no Netlify
- [ ] Logs do Render mostram requisições recebidas

---

## 🆘 SE NADA FUNCIONAR

1. **Verifique os logs do Render** - Procure por erros específicos
2. **Teste o webhook manualmente** - Use curl ou Postman
3. **Verifique o Supabase** - Execute queries SQL para ver se há dados
4. **Verifique o console do navegador** - Procure por erros JavaScript
5. **Teste endpoints individualmente** - `/health`, `/api/metrics/general`, etc.

---

## 📞 INFORMAÇÕES PARA DEBUG

Quando pedir ajuda, forneça:

1. **URL do backend:** `https://...`
2. **URL do frontend:** `https://...`
3. **Últimos logs do Render:** (copie os últimos 20-30 linhas)
4. **Erros no console do navegador:** (se houver)
5. **Resultado do teste `/health`:** (copie a resposta)
6. **Configuração do webhook:** (URL e eventos)
7. **Pipeline do deal:** (nome e stage)

---

## 🎯 PRÓXIMOS PASSOS

Após identificar o problema:

1. ✅ Corrija a configuração
2. ✅ Teste novamente
3. ✅ Verifique os logs
4. ✅ Confirme que os dados aparecem



