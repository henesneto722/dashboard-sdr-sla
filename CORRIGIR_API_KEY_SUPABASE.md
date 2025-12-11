# 🔧 Corrigir API Key do Supabase no Render

## 🚨 PROBLEMA IDENTIFICADO

Os logs mostram:
```
Erro ao criar lead: Invalid API key
hint: 'Double check your Supabase 'anon' or 'service_role API key.'
```

**Causa:** A chave da API do Supabase está incorreta ou não está configurada no Render.

---

## ✅ SOLUÇÃO: Atualizar SUPABASE_KEY no Render

### Passo 1: Obter a Chave Correta do Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Faça login
3. Selecione seu projeto: `vfxqwsleorpssxzoxvcy`
4. Vá em **Settings** > **API**
5. Você verá duas chaves:
   - **anon public key** - Use esta para operações básicas
   - **service_role key** - Use esta se precisar de permissões administrativas

**⚠️ IMPORTANTE:**
- Para este sistema, use a **anon public key** (mais segura)
- A **service_role key** tem acesso total (use apenas se necessário)

### Passo 2: Copiar a Chave

Copie a chave **anon public key** completa. Ela deve começar com `eyJhbGc...` e ser bem longa.

**Chave que deve estar configurada:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmeHF3c2xlb3Jwc3N4em94dmN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3ODMxNjAsImV4cCI6MjA4MDM1OTE2MH0.nOI1AJZTVQJUy3oJlJB_IwzzGqadTptfnGOCrsGwvuM
```

### Passo 3: Atualizar no Render

1. Acesse o painel do [Render](https://render.com)
2. Vá no seu serviço (backend)
3. No menu lateral, clique em **Environment**
4. Encontre a variável `SUPABASE_KEY`
5. Clique em **Edit** (ou o ícone de edição)
6. **Cole a chave completa** (certifique-se de copiar tudo, sem espaços)
7. Clique em **Save**

### Passo 4: Verificar Outras Variáveis

Enquanto estiver nas variáveis de ambiente, verifique também:

**SUPABASE_URL:**
```
https://vfxqwsleorpssxzoxvcy.supabase.co
```

**PIPEDRIVE_API_TOKEN:**
- Deve estar preenchido com seu token do Pipedrive

**FRONTEND_URL:**
- Deve estar com a URL do Netlify (ou `https://seu-site.netlify.app` temporariamente)

### Passo 5: Render Fará Redeploy Automático

Após salvar, o Render fará redeploy automaticamente. Aguarde alguns minutos.

### Passo 6: Verificar se Funcionou

1. Após o redeploy, vá em **Logs**
2. Crie um novo deal no Pipedrive
3. Verifique os logs:
   - ✅ **Sucesso:** `✅ Lead criado com sucesso`
   - ❌ **Erro:** Se ainda aparecer "Invalid API key", verifique se copiou a chave completa

---

## 🔍 VERIFICAÇÕES ADICIONAIS

### Verificar se a Chave Está Completa

A chave do Supabase é muito longa. Certifique-se de:
- ✅ Copiar do início ao fim
- ✅ Não ter espaços no início ou fim
- ✅ Não ter quebras de linha
- ✅ Estar tudo em uma única linha

### Verificar se Está Usando a Chave Correta

**anon key:**
- Começa com `eyJhbGc...`
- Funciona com RLS (Row Level Security) habilitado
- Mais segura

**service_role key:**
- Também começa com `eyJhbGc...`
- Bypassa RLS
- Use apenas se necessário

**Para este sistema:** Use a **anon key** (a primeira que aparece no Supabase)

---

## 🧪 TESTE APÓS CORRIGIR

### Teste 1: Verificar Health
```
https://seu-backend.onrender.com/health
```

### Teste 2: Criar Deal no Pipedrive
1. Crie um deal no pipeline "SDR"
2. Verifique os logs do Render
3. Deve aparecer: `✅ Lead criado com sucesso`

### Teste 3: Verificar no Supabase
```sql
SELECT * FROM leads_sla ORDER BY created_at DESC LIMIT 1;
```

---

## ✅ CHECKLIST

- [ ] Acessei o Supabase e copiei a chave **anon public key**
- [ ] Atualizei `SUPABASE_KEY` no Render
- [ ] Verifiquei que `SUPABASE_URL` está correto
- [ ] Render fez redeploy
- [ ] Testei criando um deal no Pipedrive
- [ ] Verifiquei os logs (não deve mais aparecer "Invalid API key")
- [ ] Verifiquei no Supabase se o lead foi criado

---

## 🚨 SE AINDA NÃO FUNCIONAR

1. **Verifique se copiou a chave completa:**
   - A chave deve ter mais de 200 caracteres
   - Deve começar com `eyJ` e terminar com vários caracteres

2. **Tente usar a service_role key:**
   - Se a anon key não funcionar, tente a service_role
   - Mas verifique se o RLS está configurado corretamente

3. **Verifique se o projeto Supabase está ativo:**
   - Acesse o dashboard do Supabase
   - Verifique se o projeto não está pausado

4. **Verifique os logs completos:**
   - Procure por outros erros além do "Invalid API key"
   - Pode haver outros problemas

---

## 📝 NOTA IMPORTANTE

A chave do Supabase é sensível. Certifique-se de:
- ✅ Não compartilhar publicamente
- ✅ Não commitar no Git (já está no .gitignore)
- ✅ Usar variáveis de ambiente sempre
- ✅ Atualizar se suspeitar de comprometimento

---

## 🎯 PRÓXIMOS PASSOS

Após corrigir a chave:

1. ✅ Aguarde o redeploy do Render
2. ✅ Teste criando um deal no Pipedrive
3. ✅ Verifique os logs
4. ✅ Verifique se o lead aparece no dashboard



