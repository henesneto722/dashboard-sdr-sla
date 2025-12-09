# 🔗 Guia: Configurar Webhook do Pipedrive

Este guia vai te ajudar a configurar o webhook do Pipedrive para enviar dados automaticamente para o backend.

---

## 📋 PRÉ-REQUISITOS

Antes de configurar o webhook, você precisa ter:

- ✅ Backend deployado no Render (ou outro serviço com URL pública)
- ✅ URL do backend anotada (ex: `https://lead-speed-monitor-backend.onrender.com`)
- ✅ Conta no Pipedrive com acesso administrativo
- ✅ Pipeline "SDR" criado no Pipedrive
- ✅ Stages configurados: TEM PERFIL, PERFIL MENOR, INCONCLUSIVO, SEM PERFIL

---

## 🚀 PASSO A PASSO

### Passo 1: Obter URL do Backend

Você precisa da URL pública do seu backend. Exemplos:
- Render: `https://lead-speed-monitor-backend.onrender.com`
- Railway: `https://seu-backend.railway.app`
- Outro serviço: `https://seu-dominio.com`

**URL completa do webhook:**
```
https://seu-backend.onrender.com/api/webhook/pipedrive
```

⚠️ **IMPORTANTE:** 
- A URL deve ser pública (HTTPS)
- Não funciona com `localhost` ou `127.0.0.1`
- Deve terminar com `/api/webhook/pipedrive`

---

### Passo 2: Acessar Configurações do Pipedrive

1. Acesse [app.pipedrive.com](https://app.pipedrive.com)
2. Faça login na sua conta
3. No canto superior direito, clique no seu **avatar/perfil**
4. Clique em **"Settings"** ou **"Configurações"**

---

### Passo 3: Navegar até Webhooks

1. No menu lateral esquerdo, procure por **"Webhooks"**
2. Clique em **"Webhooks"**
3. Você verá a lista de webhooks existentes (pode estar vazia)

---

### Passo 4: Criar Novo Webhook

1. Clique no botão **"Add webhook"** ou **"Adicionar webhook"**
2. Você verá um formulário para configurar o webhook

---

### Passo 5: Preencher Configuração

Preencha os seguintes campos:

#### **URL do Webhook:**
```
https://seu-backend.onrender.com/api/webhook/pipedrive
```
⚠️ **Substitua `seu-backend.onrender.com` pela URL real do seu backend!**

#### **HTTP Method:**
Selecione: **POST**

#### **Events (Eventos):**
Marque os seguintes eventos:
- ✅ **`deal.added`** - Quando um deal é criado
- ✅ **`deal.updated`** - Quando um deal é atualizado

**Não marque outros eventos** (como `deal.deleted`, `deal.stage_changed`, etc.), pois o sistema só processa `deal.added` e `deal.updated`.

---

### Passo 6: Salvar Webhook

1. Revise as configurações
2. Clique em **"Save"** ou **"Salvar"**
3. O webhook será criado e aparecerá na lista

---

### Passo 7: Verificar Status

Após criar, você verá:
- ✅ Status: **Active** (Ativo)
- ✅ URL do webhook
- ✅ Eventos configurados
- ✅ Data de criação

---

## 🧪 TESTAR O WEBHOOK

### Teste 1: Criar um Deal no Pipedrive

1. No Pipedrive, vá em **"Deals"** ou **"Negócios"**
2. Clique em **"Add deal"** ou **"Adicionar negócio"**
3. Preencha:
   - **Title**: "Teste Webhook"
   - **Pipeline**: Selecione o pipeline **"SDR"**
   - **Stage**: Selecione qualquer stage (TEM PERFIL, PERFIL MENOR, etc.)
4. Clique em **"Save"** ou **"Salvar"**

### Teste 2: Verificar se Funcionou

**No Backend (Render):**
1. Acesse o painel do Render
2. Vá em **Logs**
3. Procure por mensagens como:
   - `📥 Webhook recebido do Pipedrive`
   - `✅ Lead criado/atualizado`
   - `🔍 Processando deal...`

**No Dashboard (Netlify):**
1. Acesse o frontend no Netlify
2. O lead deve aparecer na lista de pendentes
3. Verifique se os dados estão corretos

### Teste 3: Atender um Lead

1. No Pipedrive, mova o deal do pipeline **"SDR"** para um pipeline individual (ex: "João - SDR")
2. No dashboard, o lead deve aparecer como **atendido**
3. Verifique se o SLA foi calculado corretamente

---

## 🔍 VERIFICAR LOGS DO WEBHOOK

### No Render (Backend)

1. Acesse o painel do Render
2. Vá em **Logs** (no menu lateral)
3. Você verá logs em tempo real
4. Procure por:
   - `POST /api/webhook/pipedrive` - Requisições recebidas
   - `📥 Webhook recebido` - Confirmação de recebimento
   - `✅ Lead processado` - Confirmação de processamento
   - `❌ Erro` - Se houver algum problema

### No Pipedrive

1. Vá em **Settings** > **Webhooks**
2. Clique no webhook criado
3. Você verá informações sobre:
   - Última execução
   - Status (Active/Inactive)
   - Histórico de eventos

---

## ⚠️ PROBLEMAS COMUNS E SOLUÇÕES

### Problema 1: Webhook não está recebendo eventos

**Soluções:**
- Verifique se a URL está correta (deve terminar com `/api/webhook/pipedrive`)
- Verifique se o backend está rodando (teste `/health`)
- Verifique se a URL é pública (HTTPS, não localhost)
- Verifique os logs do Render para ver se há requisições chegando

### Problema 2: Erro 404 Not Found

**Soluções:**
- Verifique se a URL está correta
- Verifique se o backend está deployado corretamente
- Teste a URL manualmente: `https://seu-backend.onrender.com/health`

### Problema 3: Erro 500 Internal Server Error

**Soluções:**
- Verifique os logs do Render para ver o erro específico
- Verifique se as variáveis de ambiente estão configuradas
- Verifique se o Supabase está acessível
- Verifique se o token do Pipedrive está correto

### Problema 4: Leads não aparecem no dashboard

**Soluções:**
- Verifique se o deal está no pipeline "SDR"
- Verifique se o stage é válido (TEM PERFIL, PERFIL MENOR, INCONCLUSIVO, SEM PERFIL)
- Verifique se o webhook está processando corretamente (veja logs)
- Verifique se o frontend está conectado ao backend correto

### Problema 5: Webhook está inativo

**Soluções:**
- Verifique se o webhook está marcado como "Active" no Pipedrive
- Tente desativar e reativar o webhook
- Crie um novo webhook se necessário

---

## 📝 ESTRUTURA ESPERADA NO PIPEDRIVE

Para o webhook funcionar corretamente, o Pipedrive deve ter:

### Pipeline Principal "SDR"
- **Nome**: Exatamente "SDR" (case-insensitive, mas recomendado exatamente "SDR")
- **Stages**:
  - ✅ TEM PERFIL
  - ✅ PERFIL MENOR
  - ✅ INCONCLUSIVO
  - ✅ SEM PERFIL

### Pipelines Individuais
- **Formato**: "NOME - SDR"
- **Exemplos**:
  - "João - SDR"
  - "Maria - SDR"
  - "Carlos - SDR"

**Como funciona:**
- Quando um deal é criado/atualizado no pipeline "SDR" → Sistema registra como **lead pendente**
- Quando um deal é movido do pipeline "SDR" para um pipeline individual → Sistema registra como **lead atendido** e calcula o SLA

---

## 🔄 ATUALIZAR WEBHOOK

Se você precisar atualizar a URL do webhook:

1. Vá em **Settings** > **Webhooks**
2. Clique no webhook existente
3. Clique em **"Edit"** ou **"Editar"**
4. Atualize a URL
5. Salve

---

## 🗑️ REMOVER WEBHOOK

Se você precisar remover o webhook:

1. Vá em **Settings** > **Webhooks**
2. Clique no webhook
3. Clique em **"Delete"** ou **"Deletar"**
4. Confirme a exclusão

---

## ✅ CHECKLIST FINAL

Após configurar o webhook, verifique:

- [ ] Webhook criado no Pipedrive
- [ ] URL está correta (termina com `/api/webhook/pipedrive`)
- [ ] HTTP Method é POST
- [ ] Eventos `deal.added` e `deal.updated` estão marcados
- [ ] Status está como "Active"
- [ ] Backend está rodando e acessível
- [ ] Teste de criação de deal funcionou
- [ ] Lead apareceu no dashboard
- [ ] Logs do Render mostram requisições recebidas

---

## 📞 SUPORTE

Se tiver problemas:

1. Verifique os logs do Render
2. Verifique os logs do Pipedrive (se disponível)
3. Teste a URL do backend manualmente
4. Verifique se todas as configurações estão corretas

---

## 🎉 PRONTO!

Seu webhook está configurado! Agora os dados do Pipedrive serão enviados automaticamente para o backend e aparecerão no dashboard.

**Próximos passos:**
- Teste criando deals no Pipedrive
- Monitore os logs para garantir que está funcionando
- Ajuste conforme necessário

