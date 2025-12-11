# 🚀 Guia de Deploy - Lead Speed Monitor

## 📋 Pré-requisitos

### Frontend (Netlify)
- Conta no Netlify
- Repositório conectado ao GitHub/GitLab
- Variáveis de ambiente configuradas

### Backend (Render/Railway/Heroku)
- Conta no serviço de hospedagem escolhido
- Banco de dados Supabase configurado
- Token do Pipedrive

---

## 🎨 Deploy do Frontend (Netlify)

### Opção 1: Deploy Automático via Git

1. **Conectar Repositório:**
   - Acesse [Netlify Dashboard](https://app.netlify.com)
   - Clique em "Add new site" → "Import an existing project"
   - Conecte seu repositório GitHub/GitLab

2. **Configurações de Build:**
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
   - **Node version:** 18 (já configurado no `netlify.toml`)

3. **Variáveis de Ambiente:**
   - Vá em Site settings → Environment variables
   - Adicione:
     ```
     VITE_API_URL=https://seu-backend.onrender.com
     ```

4. **Deploy:**
   - O Netlify fará deploy automático a cada push na branch `main`
   - Ou clique em "Trigger deploy" → "Deploy site"

### Opção 2: Deploy Manual via Netlify CLI

```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Fazer login
netlify login

# Build do projeto
npm run build

# Deploy
netlify deploy --prod
```

---

## ⚙️ Deploy do Backend

### Opção A: Render.com (Recomendado)

1. **Criar Novo Serviço:**
   - Acesse [Render Dashboard](https://dashboard.render.com)
   - Clique em "New" → "Web Service"
   - Conecte seu repositório

2. **Configurações:**
   - **Name:** `lead-speed-monitor-backend`
   - **Environment:** `Node`
   - **Build Command:** `cd backend && npm install && npm run build`
   - **Start Command:** `cd backend && npm start`
   - **Root Directory:** `backend` (se necessário)

3. **Variáveis de Ambiente:**
   ```
   NODE_ENV=production
   PORT=10000
   FRONTEND_URL=https://seu-app.netlify.app
   SUPABASE_URL=https://xxxxx.supabase.co
   SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   PIPEDRIVE_API_TOKEN=seu-token-aqui
   ADMIN_KEY=chave-secreta-forte
   ```

4. **Deploy:**
   - Render fará deploy automático
   - Aguarde o build completar
   - Copie a URL do serviço (ex: `https://lead-speed-monitor.onrender.com`)

### Opção B: Railway.app

1. **Criar Projeto:**
   - Acesse [Railway Dashboard](https://railway.app)
   - Clique em "New Project" → "Deploy from GitHub repo"
   - Selecione o repositório

2. **Configurações:**
   - **Root Directory:** `backend`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`

3. **Variáveis de Ambiente:**
   - Adicione as mesmas variáveis do Render

### Opção C: Heroku

```bash
# Instalar Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# Login
heroku login

# Criar app
heroku create lead-speed-monitor-backend

# Configurar buildpack
heroku buildpacks:set heroku/nodejs

# Adicionar variáveis de ambiente
heroku config:set NODE_ENV=production
heroku config:set SUPABASE_URL=https://xxxxx.supabase.co
heroku config:set SUPABASE_KEY=eyJ...
heroku config:set PIPEDRIVE_API_TOKEN=seu-token
heroku config:set FRONTEND_URL=https://seu-app.netlify.app

# Deploy
git push heroku main
```

---

## ✅ Checklist de Deploy

### Antes do Deploy

- [ ] Arquivos faltantes criados (`cacheService.ts`, `metricsRoutes.ts`)
- [ ] Variáveis de ambiente configuradas
- [ ] Banco de dados Supabase configurado
- [ ] Schema SQL executado no Supabase
- [ ] Token do Pipedrive obtido
- [ ] Testes locais passando

### Frontend

- [ ] Build local funciona (`npm run build`)
- [ ] Variável `VITE_API_URL` configurada
- [ ] Netlify conectado ao repositório
- [ ] Deploy automático configurado

### Backend

- [ ] Build do backend funciona (`cd backend && npm run build`)
- [ ] Todas as variáveis de ambiente configuradas
- [ ] Serviço de hospedagem configurado
- [ ] Health check funcionando (`/health`)
- [ ] CORS configurado corretamente

### Pós-Deploy

- [ ] Frontend acessível
- [ ] Backend respondendo (`/health`)
- [ ] API funcionando (`/api/metrics/general`)
- [ ] Webhook do Pipedrive configurado
- [ ] Testes end-to-end passando

---

## 🔧 Troubleshooting

### Frontend não conecta ao backend
- Verificar `VITE_API_URL` no Netlify
- Verificar CORS no backend
- Verificar se backend está online

### Backend não inicia
- Verificar logs no serviço de hospedagem
- Verificar variáveis de ambiente
- Verificar se `npm run build` funciona localmente

### Erro de conexão com Supabase
- Verificar `SUPABASE_URL` e `SUPABASE_KEY`
- Verificar se tabela `leads_sla` existe
- Verificar RLS (Row Level Security) no Supabase

### Webhook do Pipedrive não funciona
- Verificar URL do webhook no Pipedrive
- Verificar se backend está acessível publicamente
- Verificar logs do backend

---

## 📝 URLs de Exemplo

Após o deploy, você terá:

- **Frontend:** `https://lead-speed-monitor.netlify.app`
- **Backend:** `https://lead-speed-monitor.onrender.com`
- **API Health:** `https://lead-speed-monitor.onrender.com/health`
- **API Metrics:** `https://lead-speed-monitor.onrender.com/api/metrics/general`

---

## 🔄 Atualizações Futuras

Para atualizar o deploy:

1. **Frontend:** Push para `main` → Deploy automático no Netlify
2. **Backend:** Push para `main` → Deploy automático no Render/Railway

---

**Última atualização:** 2025-01-27
