# 🌱 Dados de Exemplo para Teste do Dashboard

Este documento explica como inserir dados de exemplo no banco de dados para testar o dashboard.

## 📋 Opções Disponíveis

Existem duas formas de inserir dados de exemplo:

### 1. **Script SQL** (Recomendado para Supabase)

Execute o arquivo SQL diretamente no SQL Editor do Supabase.

**Arquivo:** `backend/seed_example_data.sql`

**Como usar:**
1. Acesse o [Supabase Dashboard](https://supabase.com)
2. Vá em **SQL Editor**
3. Clique em **New query**
4. Copie e cole o conteúdo de `seed_example_data.sql`
5. Clique em **Run** (ou `Ctrl+Enter` / `Cmd+Enter`)

**Vantagens:**
- ✅ Execução rápida
- ✅ Não requer configuração local
- ✅ Pode ser executado diretamente no Supabase

### 2. **Script TypeScript** (Para desenvolvimento local)

Execute o script Node.js/TypeScript que insere os dados programaticamente.

**Arquivo:** `backend/src/scripts/seedExampleData.ts`

**Como usar:**
```bash
cd backend
npm run seed
```

**Pré-requisitos:**
- Arquivo `.env` configurado com `SUPABASE_URL` e `SUPABASE_KEY`
- Dependências instaladas (`npm install`)

**Vantagens:**
- ✅ Pode ser integrado em pipelines de CI/CD
- ✅ Mais fácil de modificar e estender
- ✅ Validação automática de erros

## 📊 Dados Inseridos

Ambos os scripts inserem aproximadamente **68 leads** com as seguintes características:

### Leads Atendidos (~40 leads)
- ✅ Leads com SLA rápido (< 15 minutos) - Stage: TEM PERFIL
- ✅ Leads com SLA moderado (15-20 minutos) - Stage: PERFIL MENOR
- ✅ Leads com SLA crítico (> 20 minutos) - Stage: INCONCLUSIVO
- ✅ Leads com SLA muito alto (> 2 horas) - Stage: SEM PERFIL

### Leads Pendentes (~28 leads)
- ⏳ Leads recentes (últimas horas) - Stage: TEM PERFIL
- ⏳ Leads do último dia - Stage: PERFIL MENOR
- ⏳ Leads dos últimos dias - Stage: INCONCLUSIVO
- ⏳ Leads antigos (últimas semanas) - Stage: SEM PERFIL

### SDRs de Exemplo
- Ana Silva (sdr_001)
- Carlos Santos (sdr_002)
- Maria Oliveira (sdr_003)
- João Pereira (sdr_004)
- Fernanda Costa (sdr_005)

### Distribuição Temporal
- Dados distribuídos nos **últimos 30 dias**
- Diferentes horários do dia
- Variação de tempos de SLA

## 🔍 Verificar Dados Inseridos

Após inserir os dados, você pode verificar no Supabase:

1. Acesse **Table Editor** no Supabase
2. Selecione a tabela `leads_sla`
3. Você deve ver os registros inseridos

Ou execute esta query no SQL Editor:

```sql
SELECT 
    COUNT(*) AS total_leads,
    COUNT(attended_at) AS leads_atendidos,
    COUNT(*) FILTER (WHERE attended_at IS NULL) AS leads_pendentes
FROM leads_sla;
```

## 🗑️ Limpar Dados (Opcional)

Se quiser limpar os dados antes de inserir novos:

**No SQL Editor do Supabase:**
```sql
DELETE FROM leads_sla;
```

**⚠️ ATENÇÃO:** Isso apagará TODOS os dados da tabela!

## 🎯 Próximos Passos

Após inserir os dados de exemplo:

1. ✅ Acesse o dashboard
2. ✅ Verifique as métricas gerais
3. ✅ Teste os filtros por período
4. ✅ Visualize o ranking de SDRs
5. ✅ Analise os leads pendentes por prioridade
6. ✅ Teste os gráficos e visualizações

## 📝 Personalizar Dados

Se quiser criar seus próprios dados de exemplo:

1. **SQL:** Edite `backend/seed_example_data.sql`
2. **TypeScript:** Edite `backend/src/scripts/seedExampleData.ts`

Ambos os arquivos contêm comentários explicativos sobre a estrutura dos dados.

## ❓ Problemas Comuns

### Erro: "relation does not exist"
- Execute primeiro o `schema.sql` para criar a tabela

### Erro: "permission denied"
- Verifique se as credenciais do Supabase estão corretas no `.env`
- Use a `service_role key` se precisar de permissões administrativas

### Dados não aparecem no dashboard
- Verifique se o backend está rodando
- Verifique se as variáveis de ambiente estão configuradas
- Limpe o cache do navegador

## 🚀 Pronto!

Agora você tem dados de exemplo para testar todas as funcionalidades do dashboard!





