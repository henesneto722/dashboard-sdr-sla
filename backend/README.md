# Lead Speed Monitor - Backend

Backend para monitoramento de SLA de SDRs com integração Pipedrive + Supabase.

## 🚀 Instalação

```bash
cd backend
npm install
```

## ⚙️ Configuração

1. Copie o arquivo de exemplo e configure suas variáveis:

```bash
cp env.example.txt .env
```

2. Edite o arquivo `.env` com suas credenciais:

```env
# Supabase
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_KEY=sua-anon-key

# Pipedrive
PIPEDRIVE_API_TOKEN=seu-token-pipedrive

# Servidor
PORT=3001
FRONTEND_URL=http://localhost:5173
```

3. Execute o schema SQL no Supabase:
   - Acesse o painel do Supabase
   - Vá em SQL Editor
   - Cole e execute o conteúdo de `schema.sql`

## 🖥️ Executando

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
npm run build
npm start
```

## 📚 API Endpoints

### Health Check
```
GET /health
```

### Métricas (Dashboard)
```
GET /api/metrics/general          # KPIs gerais
GET /api/metrics/ranking          # Ranking de SDRs
GET /api/metrics/timeline         # Dados para gráfico
GET /api/metrics/hourly-performance  # Performance por hora
```

### Leads
```
GET /api/leads/slowest            # Leads com maior SLA
GET /api/leads/pending            # Leads sem atendimento
GET /api/leads/detail             # Lista com filtros
GET /api/leads/sdrs               # Lista de SDRs
GET /api/leads/:lead_id           # Lead específico
```

### Webhooks
```
POST /api/webhook/pipedrive       # Webhook do Pipedrive
POST /api/webhook/manual/lead     # Criar lead manualmente
POST /api/webhook/manual/attend   # Registrar atendimento
```

## 🔗 Configurando Webhook no Pipedrive

1. Acesse Pipedrive > Configurações > Webhooks
2. Crie um novo webhook:
   - URL: `https://seu-dominio.com/api/webhook/pipedrive`
   - Evento: `deal.added` e `deal.updated`
3. Salve e teste

## 📁 Estrutura de Arquivos

```
backend/
├── src/
│   ├── app.ts              # Servidor Express
│   ├── config/
│   │   └── database.ts     # Cliente Supabase
│   ├── routes/
│   │   ├── metricsRoutes.ts
│   │   ├── leadsRoutes.ts
│   │   └── webhookRoutes.ts
│   ├── services/
│   │   └── leadsService.ts # Lógica de negócio
│   ├── types/
│   │   └── index.ts        # TypeScript interfaces
│   ├── utils/
│   │   └── dateUtils.ts    # Funções de data
│   └── webhooks/
│       └── pipedriveHandler.ts
├── schema.sql              # Schema do banco
├── package.json
└── tsconfig.json
```

## 🧪 Testando Manualmente

### Criar um lead
```bash
curl -X POST http://localhost:3001/api/webhook/manual/lead \
  -H "Content-Type: application/json" \
  -d '{"lead_id": "test1", "lead_name": "Lead Teste"}'
```

### Registrar atendimento
```bash
curl -X POST http://localhost:3001/api/webhook/manual/attend \
  -H "Content-Type: application/json" \
  -d '{"lead_id": "test1", "sdr_id": "sdr1", "sdr_name": "Ana Silva"}'
```

## 📊 Schema do Banco (Supabase)

A tabela principal `leads_sla` contém:

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | Chave primária |
| lead_id | VARCHAR | ID do Pipedrive |
| lead_name | VARCHAR | Nome do lead |
| sdr_id | VARCHAR | ID do SDR |
| sdr_name | VARCHAR | Nome do SDR |
| entered_at | TIMESTAMPTZ | Data de entrada |
| attended_at | TIMESTAMPTZ | Data de atendimento |
| sla_minutes | INTEGER | Tempo de SLA |
| source | VARCHAR | Origem do lead |
| pipeline | VARCHAR | Pipeline |





