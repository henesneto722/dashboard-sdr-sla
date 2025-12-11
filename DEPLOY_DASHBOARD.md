# 🚀 Deploy via Dashboard - Passo a Passo

## ✅ Sim! Você pode fazer deploy pelo dashboard

Tanto o Render quanto o Netlify permitem deploy completo via dashboard web, sem precisar usar linha de comando.

---

## 🎨 Deploy do Frontend no Netlify (Dashboard)

### Passo 1: Acessar o Netlify
1. Acesse [https://app.netlify.com](https://app.netlify.com)
2. Faça login com sua conta (GitHub, GitLab, Bitbucket ou email)

### Passo 2: Conectar Repositório
1. Clique no botão **"Add new site"** (canto superior direito)
2. Selecione **"Import an existing project"**
3. Escolha seu provedor (GitHub, GitLab, etc.)
4. Autorize o Netlify a acessar seus repositórios
5. Selecione o repositório `lead-speed-monitor`

### Passo 3: Configurar Build Settings
O Netlify detectará automaticamente as configurações do `netlify.toml`, mas você pode verificar:

- **Branch to deploy:** `main` (ou sua branch principal)
- **Build command:** `npm run build`
- **Publish directory:** `dist`
- **Node version:** 18 (já configurado)

### Passo 4: Adicionar Variáveis de Ambiente
1. Antes de fazer deploy, clique em **"Show advanced"** ou vá em **"Site settings"** → **"Environment variables"**
2. Clique em **"Add variable"**
3. Adicione:
   - **Key:** `VITE_API_URL`
   - **Value:** `https://seu-backend.onrender.com` (você vai atualizar isso depois com a URL real do backend)

### Passo 5: Fazer Deploy
1. Clique em **"Deploy site"**
2. Aguarde o build completar (2-5 minutos)
3. Quando terminar, você verá a URL do seu site (ex: `https://lead-speed-monitor-123.netlify.app`)

### Passo 6: Atualizar URL do Backend (Depois)
Após fazer deploy do backend, volte aqui e atualize a variável `VITE_API_URL` com a URL real do backend.

---

## ⚙️ Deploy do Backend no Render (Dashboard)

### Passo 1: Acessar o Render
1. Acesse [https://dashboard.render.com](https://dashboard.render.com)
2. Faça login (pode usar GitHub, Google, etc.)
3. Se for a primeira vez, crie uma conta gratuita

### Passo 2: Criar Novo Web Service
1. No dashboard, clique no botão **"New +"** (canto superior direito)
2. Selecione **"Web Service"**
3. Clique em **"Connect account"** se ainda não conectou seu GitHub/GitLab
4. Selecione o repositório `lead-speed-monitor`

### Passo 3: Configurar o Serviço

Preencha os campos:

- **Name:** `lead-speed-monitor-backend`
- **Environment:** `Node`
- **Region:** Escolha a mais próxima (ex: `Oregon (US West)`)
- **Branch:** `main` (ou sua branch principal)
- **Root Directory:** Deixe vazio (ou `backend` se o Render não detectar automaticamente)
- **Runtime:** `Node`
- **Build Command:** `cd backend && npm install && npm run build`
- **Start Command:** `cd backend && npm start`

### Passo 4: Adicionar Variáveis de Ambiente

Antes de fazer deploy, role para baixo até **"Environment Variables"** e clique em **"Add Environment Variable"**:

Adicione uma por uma:

1. **NODE_ENV**
   - Key: `NODE_ENV`
   - Value: `production`

2. **PORT** (Render define automaticamente, mas você pode adicionar)
   - Key: `PORT`
   - Value: `10000`

3. **FRONTEND_URL**
   - Key: `FRONTEND_URL`
   - Value: `https://seu-app.netlify.app` (atualize depois com a URL real do Netlify)

4. **SUPABASE_URL**
   - Key: `SUPABASE_URL`
   - Value: `https://xxxxx.supabase.co` (sua URL do Supabase)

5. **SUPABASE_KEY**
   - Key: `SUPABASE_KEY`
   - Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (sua chave anon do Supabase)

6. **PIPEDRIVE_API_TOKEN**
   - Key: `PIPEDRIVE_API_TOKEN`
   - Value: `seu-token-pipedrive-aqui`

7. **ADMIN_KEY** (opcional, mas recomendado)
   - Key: `ADMIN_KEY`
   - Value: `chave-secreta-forte-aqui` (gere uma chave forte)

### Passo 5: Configurar Plano
- Selecione **"Free"** (plano gratuito) ou **"Starter"** se quiser mais recursos
- O plano gratuito é suficiente para começar

### Passo 6: Fazer Deploy
1. Clique em **"Create Web Service"**
2. O Render começará a fazer build automaticamente
3. Aguarde 5-10 minutos para o build e deploy completarem
4. Quando terminar, você verá a URL do seu backend (ex: `https://lead-speed-monitor.onrender.com`)

### Passo 7: Verificar Deploy
1. Após o deploy, clique na URL do serviço
2. Você deve ver: `{"message":"Lead Speed Monitor - Backend API",...}`
3. Teste o health check: `https://seu-backend.onrender.com/health`

---

## 🔄 Ordem Recomendada de Deploy

### Opção 1: Backend Primeiro (Recomendado)
1. ✅ Deploy do Backend no Render
2. ✅ Copiar URL do backend
3. ✅ Deploy do Frontend no Netlify
4. ✅ Atualizar `VITE_API_URL` no Netlify com a URL do backend
5. ✅ Atualizar `FRONTEND_URL` no Render com a URL do Netlify

### Opção 2: Frontend Primeiro
1. ✅ Deploy do Frontend no Netlify
2. ✅ Copiar URL do frontend
3. ✅ Deploy do Backend no Render
4. ✅ Atualizar `FRONTEND_URL` no Render
5. ✅ Atualizar `VITE_API_URL` no Netlify

---

## 📝 Checklist Rápido

### Antes de Começar:
- [ ] Conta no Netlify criada
- [ ] Conta no Render criada
- [ ] Repositório no GitHub/GitLab
- [ ] Supabase configurado
- [ ] Token do Pipedrive obtido
- [ ] Schema SQL executado no Supabase

### Durante o Deploy:
- [ ] Backend: Variáveis de ambiente adicionadas
- [ ] Backend: Build command correto
- [ ] Backend: Start command correto
- [ ] Frontend: Variável `VITE_API_URL` adicionada
- [ ] Frontend: Build command correto

### Após o Deploy:
- [ ] Backend respondendo em `/health`
- [ ] Frontend acessível
- [ ] Frontend conectando ao backend
- [ ] URLs atualizadas nas variáveis de ambiente

---

## 🔧 Atualizar Variáveis Após Deploy

### No Netlify:
1. Vá em **Site settings** → **Environment variables**
2. Edite `VITE_API_URL`
3. Clique em **"Save"**
4. Vá em **Deploys** → **Trigger deploy** → **Deploy site** (para aplicar as mudanças)

### No Render:
1. Vá em **Environment** (no menu lateral do serviço)
2. Edite `FRONTEND_URL`
3. Clique em **"Save Changes"**
4. O Render fará redeploy automaticamente

---

## ⚠️ Dicas Importantes

1. **Primeira vez no Render:** O build pode demorar mais (10-15 minutos)
2. **Plano Gratuito:** Render "dorme" após 15 minutos de inatividade. A primeira requisição pode demorar ~30 segundos
3. **Logs:** Use os logs do Render e Netlify para debugar problemas
4. **CORS:** Já configurado no backend para aceitar requisições do Netlify
5. **Webhook Pipedrive:** Configure após o backend estar online

---

## 🆘 Problemas Comuns

### Backend não inicia no Render
- Verifique os logs no dashboard do Render
- Verifique se todas as variáveis de ambiente estão corretas
- Verifique se o build command está correto

### Frontend não conecta ao backend
- Verifique se `VITE_API_URL` está correto no Netlify
- Verifique se o backend está online (acesse `/health`)
- Verifique os logs do Netlify para erros de build

### Erro 404 no backend
- Verifique se o start command está correto: `cd backend && npm start`
- Verifique se o build gerou o arquivo `dist/app.js`

---

## ✅ Pronto!

Após seguir esses passos, você terá:
- ✅ Frontend rodando no Netlify
- ✅ Backend rodando no Render
- ✅ Tudo conectado e funcionando

**Tempo estimado:** 15-20 minutos para ambos os deploys

---

**Última atualização:** 2025-01-27
