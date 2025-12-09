# 🚀 Guia de Deploy Passo a Passo - Render + Netlify

Este guia vai te ajudar a fazer o deploy completo do sistema.

---

## 📋 PRÉ-REQUISITOS

Antes de começar, certifique-se de ter:

- ✅ Conta no [Render](https://render.com) (gratuito)
- ✅ Conta no [Netlify](https://netlify.com) (gratuito)
- ✅ Repositório Git (GitHub, GitLab, Bitbucket)
- ✅ Código commitado e enviado para o repositório
- ✅ Credenciais do Supabase (já configuradas)
- ✅ Token do Pipedrive (se já tiver)

---

## 1️⃣ DEPLOY DO BACKEND NO RENDER

### Passo 1: Acessar o Render

1. Acesse [render.com](https://render.com)
2. Faça login (ou crie uma conta gratuita)
3. Clique em **"New +"** no canto superior direito
4. Selecione **"Web Service"**

### Passo 2: Conectar Repositório

1. Se for a primeira vez, conecte sua conta do GitHub/GitLab
2. Selecione o repositório: `dashboard-sdr-sla` (ou o nome do seu repositório)
3. Clique em **"Connect"**

### Passo 3: Configurar o Serviço

Preencha os seguintes campos:

**Informações Básicas:**
- **Name**: `lead-speed-monitor-backend` (ou o nome que preferir)
- **Region**: Escolha a região mais próxima (ex: `Oregon (US West)`)
- **Branch**: `main` (ou sua branch principal)
- **Root Directory**: `backend` ⚠️ **IMPORTANTE: Coloque `backend` aqui**

**Build & Deploy:**
- **Runtime**: `Node`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

**Plan:**
- Escolha **Free** (gratuito)

### Passo 4: Configurar Variáveis de Ambiente

Antes de fazer deploy, configure as variáveis de ambiente:

1. Role a página até a seção **"Environment Variables"**
2. Clique em **"Add Environment Variable"**
3. Adicione uma por uma:

```env
NODE_ENV=production
PORT=10000
SUPABASE_URL=https://vfxqwsleorpssxzoxvcy.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmeHF3c2xlb3Jwc3N4em94dmN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3ODMxNjAsImV4cCI6MjA4MDM1OTE2MH0.nOI1AJZTVQJUy3oJlJB_IwzzGqadTptfnGOCrsGwvuM
PIPEDRIVE_API_TOKEN=SEU_TOKEN_PIPEDRIVE_AQUI
FRONTEND_URL=https://seu-site.netlify.app
```

**⚠️ IMPORTANTE:**
- Substitua `SEU_TOKEN_PIPEDRIVE_AQUI` pelo token real do Pipedrive
- Deixe `FRONTEND_URL` temporariamente como `https://seu-site.netlify.app` (vamos atualizar depois)

### Passo 5: Fazer Deploy

1. Clique em **"Create Web Service"**
2. Aguarde o build e deploy (pode levar 5-10 minutos)
3. Você verá os logs em tempo real
4. Quando terminar, você verá uma mensagem de sucesso

### Passo 6: Anotar URL do Backend

1. Após o deploy, você verá a URL do serviço
2. Será algo como: `https://lead-speed-monitor-backend.onrender.com`
3. **ANOTE ESTA URL** - você vai precisar dela!

### Passo 7: Testar o Backend

1. Abra a URL do backend no navegador
2. Adicione `/health` no final: `https://seu-backend.onrender.com/health`
3. Deve retornar: `{"status":"ok","message":"Backend is running"}`
4. Se funcionar, o backend está rodando! ✅

---

## 2️⃣ DEPLOY DO FRONTEND NO NETLIFY

### Passo 1: Acessar o Netlify

1. Acesse [netlify.com](https://netlify.com)
2. Faça login (ou crie uma conta gratuita)
3. Clique em **"Add new site"** > **"Import an existing project"**

### Passo 2: Conectar Repositório

1. Selecione seu provedor Git (GitHub, GitLab, etc.)
2. Autorize o Netlify a acessar seus repositórios
3. Selecione o repositório: `dashboard-sdr-sla` (ou o nome do seu)

### Passo 3: Configurar Build Settings

Preencha os seguintes campos:

**Build settings:**
- **Branch to deploy**: `main` (ou sua branch principal)
- **Base directory**: Deixe vazio (ou `/` se necessário)
- **Build command**: `npm run build`
- **Publish directory**: `dist`

**⚠️ IMPORTANTE:**
- O Netlify detecta automaticamente o Vite, mas verifique se está correto
- Se não detectar, preencha manualmente

### Passo 4: Configurar Variáveis de Ambiente

**ANTES de clicar em "Deploy site"**, configure as variáveis:

1. Clique em **"Show advanced"** ou **"Environment variables"**
2. Clique em **"New variable"**
3. Adicione uma por uma:

```env
VITE_SUPABASE_URL=https://vfxqwsleorpssxzoxvcy.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmeHF3c2xlb3Jwc3N4em94dmN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3ODMxNjAsImV4cCI6MjA4MDM1OTE2MH0.nOI1AJZTVQJUy3oJlJB_IwzzGqadTptfnGOCrsGwvuM
VITE_API_URL=https://seu-backend.onrender.com
```

**⚠️ IMPORTANTE:**
- Substitua `https://seu-backend.onrender.com` pela URL real do backend no Render (que você anotou no Passo 6 da seção anterior)

### Passo 5: Fazer Deploy

1. Clique em **"Deploy site"**
2. Aguarde o build (pode levar 3-5 minutos)
3. Você verá os logs em tempo real
4. Quando terminar, você verá uma mensagem de sucesso

### Passo 6: Anotar URL do Frontend

1. Após o deploy, você verá a URL do site
2. Será algo como: `https://dashboard-sdr-sla.netlify.app`
3. **ANOTE ESTA URL** - você vai precisar dela!

### Passo 7: Testar o Frontend

1. Abra a URL do frontend no navegador
2. O dashboard deve carregar
3. Se aparecer dados ou a interface, está funcionando! ✅

---

## 3️⃣ ATUALIZAR CONFIGURAÇÕES

### Atualizar Render com URL do Frontend

1. Volte no Render
2. Vá em **Environment** (no menu lateral)
3. Encontre a variável `FRONTEND_URL`
4. Clique em **"Edit"**
5. Atualize com a URL do Netlify: `https://seu-site.netlify.app`
6. Salve
7. O Render fará redeploy automaticamente

### Atualizar Netlify com URL do Backend (se necessário)

Se você já configurou antes do deploy do backend:

1. Vá no Netlify
2. Vá em **Site settings** > **Build & deploy** > **Environment variables**
3. Encontre `VITE_API_URL`
4. Atualize com a URL real do backend
5. Vá em **Deploys** e faça um novo deploy manual (ou aguarde o próximo commit)

---

## 4️⃣ CONFIGURAR WEBHOOK DO PIPEDRIVE

Agora que o backend está deployado, você pode configurar o webhook:

### Passo 1: Acessar Pipedrive

1. Acesse [app.pipedrive.com](https://app.pipedrive.com)
2. Faça login

### Passo 2: Ir em Webhooks

1. Clique em **Settings** (Configurações)
2. No menu lateral, clique em **Webhooks**

### Passo 3: Criar Webhook

1. Clique em **"Add webhook"** ou **"Adicionar webhook"**
2. Preencha:
   - **URL**: `https://seu-backend.onrender.com/api/webhook/pipedrive`
     - Substitua `seu-backend.onrender.com` pela URL real do Render
   - **HTTP Method**: `POST`
   - **Events** (Eventos):
     - ✅ Marque `deal.added` (quando um deal é criado)
     - ✅ Marque `deal.updated` (quando um deal é atualizado)
3. Clique em **"Save"** ou **"Salvar"**

### Passo 4: Testar Webhook

1. No Pipedrive, crie um novo deal no funil "SDR"
2. Verifique os logs do Render para ver se recebeu o webhook
3. Verifique se o lead apareceu no dashboard do Netlify

---

## 5️⃣ VERIFICAÇÃO FINAL

### Checklist de Verificação

- [ ] Backend deployado no Render e acessível
- [ ] Frontend deployado no Netlify e acessível
- [ ] Backend retorna `/health` corretamente
- [ ] Frontend carrega o dashboard
- [ ] Variáveis de ambiente configuradas em ambos
- [ ] `FRONTEND_URL` no Render aponta para Netlify
- [ ] `VITE_API_URL` no Netlify aponta para Render
- [ ] Webhook do Pipedrive configurado
- [ ] Teste de criação de deal funciona

### Testar Sistema Completo

1. **Criar um deal no Pipedrive:**
   - Acesse Pipedrive
   - Crie um novo deal no funil "SDR"
   - Coloque em um dos stages: TEM PERFIL, PERFIL MENOR, INCONCLUSIVO, SEM PERFIL

2. **Verificar no Dashboard:**
   - Acesse o frontend no Netlify
   - O lead deve aparecer na lista de pendentes
   - Verifique se os dados estão corretos

3. **Atender um lead:**
   - No Pipedrive, mova o deal do funil "SDR" para um funil individual (ex: "João - SDR")
   - No dashboard, o lead deve aparecer como atendido
   - Verifique se o SLA foi calculado

---

## 🐛 TROUBLESHOOTING

### Backend não inicia

**Problema:** Erro ao iniciar o backend no Render

**Soluções:**
- Verifique se o `Root Directory` está como `backend`
- Verifique se o `Start Command` está como `npm start`
- Verifique os logs do Render para ver o erro específico
- Certifique-se de que todas as variáveis de ambiente estão configuradas

### Frontend não conecta ao backend

**Problema:** Frontend mostra erro de conexão

**Soluções:**
- Verifique se `VITE_API_URL` está correto no Netlify
- Verifique se o backend está rodando (teste `/health`)
- Verifique se o CORS está configurado no backend
- Limpe o cache do navegador

### Webhook não funciona

**Problema:** Pipedrive não envia webhooks

**Soluções:**
- Verifique se a URL do webhook está correta
- Verifique se o backend está acessível publicamente
- Verifique os logs do Render para ver se está recebendo requisições
- Teste manualmente com curl ou Postman

### Build falha

**Problema:** Build falha no Render ou Netlify

**Soluções:**
- Verifique os logs de build para ver o erro específico
- Certifique-se de que todas as dependências estão no `package.json`
- Verifique se o Node.js está na versão correta (>=18)
- Verifique se não há erros de sintaxe no código

---

## 📝 NOTAS IMPORTANTES

1. **Plano Gratuito:**
   - Render: Pode "dormir" após 15 minutos de inatividade (primeira requisição pode ser lenta)
   - Netlify: Sempre ativo, sem limitações de "dormir"

2. **Variáveis de Ambiente:**
   - Nunca commite arquivos `.env` no Git
   - Sempre configure variáveis no painel do serviço

3. **URLs:**
   - Render gera URLs aleatórias (ex: `lead-speed-monitor-backend-xyz.onrender.com`)
   - Netlify permite URLs customizadas (ex: `seu-site.netlify.app`)

4. **Deploy Automático:**
   - Ambos fazem deploy automático a cada push no Git
   - Você pode desabilitar isso nas configurações

---

## ✅ PRONTO!

Seu sistema está deployado e funcionando! 🎉

**URLs importantes:**
- Backend: `https://seu-backend.onrender.com`
- Frontend: `https://seu-site.netlify.app`
- Supabase: `https://vfxqwsleorpssxzoxvcy.supabase.co`

**Próximos passos:**
- Configurar domínio customizado (opcional)
- Monitorar logs e performance
- Adicionar mais funcionalidades

