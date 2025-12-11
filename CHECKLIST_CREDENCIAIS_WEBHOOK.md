# 📋 Checklist: Credenciais e Webhook

## 🔴 O QUE FALTA FAZER

### 1. ✅ CREDENCIAIS DO SUPABASE (Já configurado)

**Status:** ✅ Já configurado (conforme VARIAVEIS_AMBIENTE_DEPLOY.md)

- **URL**: `https://vfxqwsleorpssxzoxvcy.supabase.co`
- **Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

**Ação necessária:** Nenhuma (já está configurado)

---

### 2. ❌ ARQUIVO `.env` DO BACKEND (FALTA CRIAR)

**Status:** ❌ Arquivo não existe

**O que fazer:**

1. Copie o arquivo de exemplo:
   ```bash
   cd backend
   copy env.example.txt .env
   ```

2. Edite o arquivo `backend/.env` e preencha:

   ```env
   # Supabase Configuration
   SUPABASE_URL=https://vfxqwsleorpssxzoxvcy.supabase.co
   SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmeHF3c2xlb3Jwc3N4em94dmN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3ODMxNjAsImV4cCI6MjA4MDM1OTE2MH0.nOI1AJZTVQJUy3oJlJB_IwzzGqadTptfnGOCrsGwvuM
   
   # Pipedrive Configuration
   PIPEDRIVE_API_TOKEN=SEU_TOKEN_PIPEDRIVE_AQUI
   
   # Server Configuration
   PORT=3001
   NODE_ENV=development
   
   # CORS Configuration (Frontend URL)
   FRONTEND_URL=http://localhost:8080
   ```

**⚠️ IMPORTANTE:**
- Substitua `SEU_TOKEN_PIPEDRIVE_AQUI` pelo token real do Pipedrive (veja seção 3)

---

### 3. ❌ TOKEN DO PIPEDRIVE (FALTA OBTER E CONFIGURAR)

**Status:** ❌ Não configurado

**Como obter o token:**

1. Acesse o Pipedrive: https://app.pipedrive.com
2. Vá em **Settings** (Configurações)
3. Clique em **Personal** > **API**
4. Copie seu **Personal API Token**
5. Cole no arquivo `backend/.env` como `PIPEDRIVE_API_TOKEN`

**Exemplo:**
```env
PIPEDRIVE_API_TOKEN=abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
```

**⚠️ IMPORTANTE:**
- Mantenha este token seguro e não compartilhe
- Se perder, gere um novo no Pipedrive

---

### 4. ❌ WEBHOOK DO PIPEDRIVE (FALTA CONFIGURAR)

**Status:** ❌ Não configurado

**⚠️ IMPORTANTE:** 
O webhook só pode ser configurado **APÓS** fazer deploy do backend em produção (Render, Railway, etc.), pois precisa de uma URL pública.

**Para desenvolvimento local (testes):**
- Use **ngrok** para criar um túnel público
- Ou aguarde fazer deploy do backend

**Como configurar (APÓS DEPLOY DO BACKEND):**

1. Acesse Pipedrive > **Settings** > **Webhooks**
2. Clique em **"Add webhook"** ou **"Adicionar webhook"**
3. Configure:
   - **URL**: `https://sua-url-backend.onrender.com/api/webhook/pipedrive`
     - Substitua `sua-url-backend.onrender.com` pela URL real do seu backend
   - **HTTP Method**: `POST`
   - **Events** (Eventos):
     - ✅ `deal.added` (quando um deal é criado)
     - ✅ `deal.updated` (quando um deal é atualizado)
4. Clique em **"Save"** ou **"Salvar"**

**Exemplo de URL:**
```
https://lead-speed-monitor.onrender.com/api/webhook/pipedrive
```

**Verificar se funcionou:**
- Após configurar, teste criando ou atualizando um deal no Pipedrive
- Verifique os logs do backend para ver se recebeu o webhook
- Verifique se o lead apareceu no dashboard

---

### 5. ✅ ESTRUTURA DO PIPEDRIVE (VERIFICAR)

**Status:** ⚠️ Verificar se está correto

**O sistema espera esta estrutura no Pipedrive:**

#### 5.1 Funil Principal "SDR"
- **Nome exato**: "SDR" (case-insensitive, mas recomendado exatamente "SDR")
- **Stages necessários**:
  - ✅ TEM PERFIL
  - ✅ PERFIL MENOR
  - ✅ INCONCLUSIVO
  - ✅ SEM PERFIL

#### 5.2 Funis Individuais
- **Formato**: "NOME - SDR"
- **Exemplos**:
  - "João - SDR"
  - "Maria - SDR"
  - "Carlos - SDR"

**Como verificar:**
1. Acesse Pipedrive > **Settings** > **Pipelines**
2. Verifique se existe um pipeline chamado "SDR"
3. Verifique se os stages estão corretos
4. Verifique se existem funis individuais no formato "NOME - SDR"

**Se não existir:**
- Crie o pipeline "SDR" com os stages necessários
- Crie funis individuais para cada SDR no formato "NOME - SDR"

---

## 📊 RESUMO DO STATUS

| Item | Status | Prioridade |
|------|--------|------------|
| Supabase URL/Key | ✅ Configurado | - |
| Arquivo `.env` backend | ❌ Falta criar | 🔴 Alta |
| Token Pipedrive | ❌ Falta obter | 🔴 Alta |
| Webhook Pipedrive | ❌ Falta configurar | 🟡 Média (após deploy) |
| Estrutura Pipedrive | ⚠️ Verificar | 🟡 Média |

---

## 🚀 ORDEM DE EXECUÇÃO RECOMENDADA

1. **Agora (desenvolvimento local):**
   - [ ] Criar arquivo `backend/.env`
   - [ ] Obter token do Pipedrive
   - [ ] Configurar token no `.env`
   - [ ] Verificar estrutura do Pipedrive

2. **Após deploy do backend:**
   - [ ] Configurar webhook no Pipedrive com URL de produção
   - [ ] Testar webhook criando/atualizando um deal

3. **Opcional (testes locais):**
   - [ ] Usar ngrok para testar webhook localmente
   - [ ] Configurar webhook temporário apontando para ngrok

---

## 🔧 COMANDOS ÚTEIS

### Criar arquivo .env
```bash
cd backend
copy env.example.txt .env
# Depois edite o arquivo .env com suas credenciais
```

### Testar conexão com Supabase
```bash
cd backend
npm run dev
# Verifique se aparece "✅ Conexão com Supabase estabelecida!"
```

### Testar API do Pipedrive (após configurar token)
```bash
# O backend tentará conectar automaticamente ao iniciar
# Verifique os logs para erros de autenticação
```

---

## 📝 NOTAS IMPORTANTES

1. **Arquivo `.env` não deve ser commitado no Git**
   - Já está no `.gitignore`
   - Mantenha suas credenciais seguras

2. **Token do Pipedrive**
   - Cada usuário tem seu próprio token
   - Tokens não expiram automaticamente
   - Se suspeitar de comprometimento, gere um novo

3. **Webhook**
   - Só funciona com URLs públicas (HTTPS)
   - Para testes locais, use ngrok ou similar
   - Após deploy, atualize a URL do webhook

4. **Estrutura do Pipedrive**
   - O sistema é case-insensitive para o nome "SDR"
   - Os stages devem conter as palavras-chave (ex: "TEM PERFIL")
   - Funis individuais devem seguir o formato "NOME - SDR"

---

## ✅ PRÓXIMOS PASSOS

Após completar este checklist:

1. ✅ Testar backend localmente
2. ✅ Fazer deploy do backend (Render/Railway)
3. ✅ Fazer deploy do frontend (Netlify/Vercel)
4. ✅ Configurar webhook com URL de produção
5. ✅ Testar sistema completo



