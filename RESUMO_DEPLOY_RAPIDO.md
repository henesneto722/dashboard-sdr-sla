# ⚡ Resumo Rápido de Deploy

## 🚀 BACKEND NO RENDER (5 minutos)

1. **Acesse:** https://render.com
2. **New +** > **Web Service**
3. **Conecte repositório** Git
4. **Configure:**
   - Name: `lead-speed-monitor-backend`
   - Root Directory: `backend` ⚠️
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
5. **Variáveis de Ambiente:**
   ```env
   NODE_ENV=production
   PORT=10000
   SUPABASE_URL=https://vfxqwsleorpssxzoxvcy.supabase.co
   SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmeHF3c2xlb3Jwc3N4em94dmN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3ODMxNjAsImV4cCI6MjA4MDM1OTE2MH0.nOI1AJZTVQJUy3oJlJB_IwzzGqadTptfnGOCrsGwvuM
   PIPEDRIVE_API_TOKEN=SEU_TOKEN_AQUI
   FRONTEND_URL=https://seu-site.netlify.app
   ```
6. **Create Web Service**
7. **Anote a URL:** `https://seu-backend.onrender.com`

---

## 🌐 FRONTEND NO NETLIFY (5 minutos)

1. **Acesse:** https://netlify.com
2. **Add new site** > **Import an existing project**
3. **Conecte repositório** Git
4. **Configure:**
   - Build command: `npm run build`
   - Publish directory: `dist`
5. **Variáveis de Ambiente:**
   ```env
   VITE_SUPABASE_URL=https://vfxqwsleorpssxzoxvcy.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmeHF3c2xlb3Jwc3N4em94dmN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3ODMxNjAsImV4cCI6MjA4MDM1OTE2MH0.nOI1AJZTVQJUy3oJlJB_IwzzGqadTptfnGOCrsGwvuM
   VITE_API_URL=https://seu-backend.onrender.com
   ```
   ⚠️ Use a URL real do Render aqui!
6. **Deploy site**
7. **Anote a URL:** `https://seu-site.netlify.app`

---

## 🔄 ATUALIZAR CONFIGURAÇÕES

1. **No Render:** Atualize `FRONTEND_URL` com a URL do Netlify
2. **No Netlify:** Verifique se `VITE_API_URL` está correto

---

## 🔗 CONFIGURAR WEBHOOK PIPEDRIVE

1. **Pipedrive** > **Settings** > **Webhooks**
2. **Add webhook:**
   - URL: `https://seu-backend.onrender.com/api/webhook/pipedrive`
   - Method: `POST`
   - Events: `deal.added`, `deal.updated`
3. **Save**

---

## ✅ TESTAR

- Backend: `https://seu-backend.onrender.com/health`
- Frontend: `https://seu-site.netlify.app`
- Criar deal no Pipedrive e verificar no dashboard

---

📖 **Guia completo:** Veja `GUIA_DEPLOY_PASSO_A_PASSO.md`



