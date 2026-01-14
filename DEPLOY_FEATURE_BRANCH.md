# Guia de Deploy da Branch de Feature

## ✅ Branch Criada

**Branch:** `feature/sdr-attendance-journey`  
**Status:** ✅ Criada e enviada para o GitHub  
**Link do PR:** https://github.com/henesneto722/dashboard-sdr-sla/pull/new/feature/sdr-attendance-journey

---

## 🚀 Como Fazer Deploy no Render (Backend)

### Opção 1: Deploy Temporário da Branch (Recomendado para Teste)

1. **Acesse o Render Dashboard:**
   - Vá em https://dashboard.render.com
   - Encontre seu serviço de backend

2. **Configure Deploy da Branch:**
   - Vá em **Settings** → **Build & Deploy**
   - Em **Branch**, altere de `main` para `feature/sdr-attendance-journey`
   - Clique em **Save Changes**

3. **Disparar Deploy:**
   - Vá em **Manual Deploy** → **Deploy latest commit**
   - Aguarde o deploy completar

4. **Verificar Logs:**
   - Monitore os logs para garantir que não há erros
   - Verifique se a tabela `sdr_attendance_events` existe (se não, execute a migração SQL)

### Opção 2: Criar Serviço de Preview (Alternativa)

1. **Criar Novo Serviço:**
   - No Render, clique em **New** → **Web Service**
   - Conecte o mesmo repositório
   - Configure:
     - **Branch:** `feature/sdr-attendance-journey`
     - **Name:** `dashboard-sdr-sla-preview` (ou outro nome)
     - **Environment:** Use as mesmas variáveis de ambiente do serviço principal

2. **Deploy:**
   - O Render fará deploy automático
   - Você terá uma URL temporária para testar

---

## 🌐 Como Fazer Deploy no Netlify (Frontend)

### Opção 1: Deploy de Branch (Recomendado)

1. **Acesse o Netlify Dashboard:**
   - Vá em https://app.netlify.com
   - Encontre seu site

2. **Configurar Branch de Deploy:**
   - Vá em **Site settings** → **Build & deploy** → **Continuous Deployment**
   - Em **Production branch**, mantenha `main`
   - Em **Branch deploys**, adicione `feature/sdr-attendance-journey`
   - Salve as alterações

3. **Deploy Manual:**
   - Vá em **Deploys**
   - Clique em **Trigger deploy** → **Deploy branch**
   - Selecione `feature/sdr-attendance-journey`
   - Aguarde o deploy

4. **Acessar Preview:**
   - Após o deploy, você terá um link de preview
   - Exemplo: `https://deploy-preview-123--seu-site.netlify.app`

### Opção 2: Deploy via Pull Request (Automático)

1. **Criar Pull Request:**
   - Acesse: https://github.com/henesneto722/dashboard-sdr-sla/pull/new/feature/sdr-attendance-journey
   - Crie o PR de `feature/sdr-attendance-journey` para `main`

2. **Netlify Criará Preview Automaticamente:**
   - O Netlify detectará o PR
   - Criará um deploy preview automaticamente
   - Você verá o link no PR do GitHub

---

## 📋 Checklist Antes do Deploy

### Backend (Render):
- [ ] Executar migração SQL no Supabase:
  ```sql
  -- backend/migrations/003_create_sdr_attendance_events.sql
  ```
- [ ] Verificar variáveis de ambiente no Render:
  - `SUPABASE_URL`
  - `SUPABASE_KEY`
  - `PIPEDRIVE_API_TOKEN`
- [ ] Verificar se a branch está correta no Render

### Frontend (Netlify):
- [ ] Verificar variável de ambiente:
  - `VITE_API_URL` (deve apontar para o backend no Render)
- [ ] Verificar se a branch está configurada

---

## 🧪 Como Testar Após o Deploy

### 1. Verificar Backend:
```bash
# Testar endpoint de jornada
curl https://seu-backend.onrender.com/api/metrics/sdr-attendance

# Deve retornar JSON com métricas (pode estar vazio se não houver eventos ainda)
```

### 2. Verificar Frontend:
- Acesse o link de preview do Netlify
- Verifique se o componente "Jornada de Atendimento dos SDRs" aparece
- Verifique se não há erros no console do navegador

### 3. Testar Funcionalidade:
- Aguarde um lead ser movido do pipeline principal para um pipeline individual
- Verifique se o evento é registrado
- Verifique se aparece na tabela de jornada

---

## 🔄 Após Testar e Validar

### Se Tudo Estiver OK:

1. **Fazer Merge na Main:**
   ```bash
   git checkout main
   git pull origin main
   git merge feature/sdr-attendance-journey
   git push origin main
   ```

2. **Reverter Deploy para Main:**
   - **Render:** Voltar branch para `main` e fazer deploy
   - **Netlify:** O deploy de produção voltará para `main` automaticamente

### Se Houver Problemas:

1. **Corrigir na Branch:**
   ```bash
   git checkout feature/sdr-attendance-journey
   # Fazer correções
   git add .
   git commit -m "fix: correção de problema X"
   git push origin feature/sdr-attendance-journey
   ```

2. **Deploy Automático:**
   - Render e Netlify farão deploy automático das correções

3. **Testar Novamente:**
   - Repetir o processo de teste

---

## 🗑️ Limpeza Após Merge

Depois de fazer merge e validar em produção:

```bash
# Deletar branch local
git branch -d feature/sdr-attendance-journey

# Deletar branch remota (opcional)
git push origin --delete feature/sdr-attendance-journey
```

---

## 📝 Notas Importantes

1. **Migração SQL:** Não esqueça de executar a migração SQL no Supabase antes de testar
2. **Variáveis de Ambiente:** Certifique-se de que todas as variáveis estão configuradas
3. **Logs:** Monitore os logs durante o deploy para identificar problemas rapidamente
4. **Backup:** Se algo der errado, você pode voltar para `main` facilmente

---

## 🆘 Troubleshooting

### Erro: "Endpoint não encontrado"
- Verifique se o backend foi deployado corretamente
- Verifique se a rota `/api/metrics/sdr-attendance` existe
- Verifique os logs do Render

### Erro: "Tabela não existe"
- Execute a migração SQL no Supabase
- Verifique se a tabela `sdr_attendance_events` foi criada

### Frontend não carrega dados
- Verifique se `VITE_API_URL` está correto
- Verifique o console do navegador para erros
- Verifique se o backend está acessível

---

**Boa sorte com o deploy! 🚀**



