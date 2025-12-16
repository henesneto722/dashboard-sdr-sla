# 🗑️ Como Limpar Dados de Teste do Supabase

## ⚠️ ATENÇÃO

Este script apaga **TODOS os dados** da tabela `leads_sla`. Use apenas se quiser limpar dados de teste antes de receber dados reais do Pipedrive.

---

## 📋 Passo a Passo

### 1. Acessar o SQL Editor do Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Faça login
3. Selecione seu projeto: `vfxqwsleorpssxzoxvcy`
4. No menu lateral, clique em **SQL Editor**
5. Clique em **"New query"** (ou use o botão `+`)

### 2. Executar o Script

1. Abra o arquivo `backend/limpar_dados_teste.sql` do projeto
2. **Copie TODO o conteúdo** do arquivo (Ctrl+A, Ctrl+C)
3. Cole no SQL Editor do Supabase
4. Clique em **"Run"** ou pressione `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac)
5. Aguarde alguns segundos até aparecer "Success"

### 3. Verificar Resultado

O script mostrará:
- Quantos registros existiam antes de apagar
- Quantos registros restam após apagar (deve ser 0)
- Estrutura da tabela (deve estar intacta)

---

## ✅ O Que Acontece

- ✅ **Todos os dados são apagados** da tabela `leads_sla`
- ✅ **A estrutura da tabela é mantida** (colunas, índices, triggers)
- ✅ **A tabela fica pronta** para receber dados reais do Pipedrive

---

## 🔄 Após Limpar os Dados

1. ✅ Configure o webhook do Pipedrive
2. ✅ Teste criando um deal no Pipedrive
3. ✅ Verifique se o lead aparece no dashboard
4. ✅ Os dados agora serão reais do Pipedrive

---

## 📝 Alternativa: Limpar Apenas Dados de Teste

Se você quiser apagar apenas os dados de teste (que começam com `lead_`), use este SQL:

```sql
-- Apagar apenas leads de teste (que começam com 'lead_')
DELETE FROM leads_sla 
WHERE lead_id LIKE 'lead_%';

-- Verificar quantos restam
SELECT COUNT(*) AS total_restantes FROM leads_sla;
```

---

## 🚨 Se Algo Der Errado

Se você apagou dados por engano e precisa recuperar:

1. **Verifique se há backup automático no Supabase:**
   - Vá em **Database** > **Backups**
   - Veja se há backups disponíveis

2. **Se não houver backup:**
   - Os dados de teste podem ser recriados usando `backend/seed_example_data.sql`
   - Dados reais do Pipedrive serão recebidos novamente via webhook

---

## ✅ Pronto!

Após executar o script, sua tabela estará limpa e pronta para receber dados reais do Pipedrive!




