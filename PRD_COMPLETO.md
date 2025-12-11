# 📋 PRD (Product Requirements Document) - Lead Speed Monitor

**Versão:** 1.0.0  
**Data:** 2024  
**Status:** ✅ Em Produção  
**Última Atualização:** 2024

---

## 📑 Índice

1. [Visão Geral](#visão-geral)
2. [Objetivos do Produto](#objetivos-do-produto)
3. [Público-Alvo](#público-alvo)
4. [Arquitetura do Sistema](#arquitetura-do-sistema)
5. [Stack Tecnológica](#stack-tecnológica)
6. [Regras de Negócio](#regras-de-negócio)
7. [Funcionalidades Detalhadas](#funcionalidades-detalhadas)
8. [Estrutura de Dados](#estrutura-de-dados)
9. [APIs e Endpoints](#apis-e-endpoints)
10. [Integrações](#integrações)
11. [Interface do Usuário](#interface-do-usuário)
12. [Fluxos de Dados](#fluxos-de-dados)
13. [Performance e Escalabilidade](#performance-e-escalabilidade)
14. [Segurança](#segurança)
15. [Deploy e Infraestrutura](#deploy-e-infraestrutura)
16. [Configuração e Variáveis de Ambiente](#configuração-e-variáveis-de-ambiente)
17. [Scripts e Ferramentas](#scripts-e-ferramentas)
18. [Documentação Técnica](#documentação-técnica)
19. [Testes](#testes)
20. [Roadmap e Melhorias Futuras](#roadmap-e-melhorias-futuras)

---

## 1. Visão Geral

### 1.1 Descrição do Produto

**Lead Speed Monitor** é um sistema de monitoramento de SLA (Service Level Agreement) para equipes de SDR (Sales Development Representatives). O sistema integra-se com o Pipedrive para capturar leads automaticamente e calcular o tempo de atendimento, fornecendo métricas em tempo real através de um dashboard interativo.

### 1.2 Problema que Resolve

- **Falta de visibilidade:** Não havia forma de monitorar o tempo de resposta dos SDRs aos leads
- **Métricas manuais:** Cálculo de SLA era feito manualmente, sujeito a erros
- **Falta de priorização:** Não havia forma de identificar leads importantes pendentes
- **Análise limitada:** Dificuldade em analisar performance por horário, SDR ou período

### 1.3 Solução Proposta

Sistema automatizado que:
- Captura leads do Pipedrive via webhooks
- Calcula SLA automaticamente baseado em regras de negócio
- Exibe métricas em tempo real no dashboard
- Prioriza leads importantes (TEM PERFIL, PERFIL MENOR)
- Fornece análises detalhadas de performance

---

## 2. Objetivos do Produto

### 2.1 Objetivos Principais

1. **Monitoramento Automatizado:** Capturar leads automaticamente do Pipedrive
2. **Cálculo de SLA:** Calcular tempo de atendimento com precisão
3. **Dashboard em Tempo Real:** Visualizar métricas atualizadas instantaneamente
4. **Priorização:** Identificar leads importantes pendentes
5. **Análise de Performance:** Avaliar desempenho por SDR, horário e período

### 2.2 Métricas de Sucesso

- ✅ 100% dos leads do Pipedrive capturados automaticamente
- ✅ Cálculo de SLA com precisão de minutos
- ✅ Dashboard atualizado em tempo real (< 1 segundo de latência)
- ✅ Identificação automática de leads importantes pendentes
- ✅ Análise de performance por múltiplas dimensões

---

## 3. Público-Alvo

### 3.1 Usuários Principais

- **Gerentes de Vendas:** Monitorar performance da equipe
- **SDRs:** Verificar seus próprios indicadores
- **Analistas:** Analisar dados históricos e tendências

### 3.2 Casos de Uso

1. **Monitoramento Diário:** Verificar leads pendentes e SLA médio
2. **Análise Semanal:** Avaliar performance da equipe
3. **Identificação de Problemas:** Encontrar leads com SLA alto
4. **Otimização:** Identificar horários de melhor performance

---

## 4. Arquitetura do Sistema

### 4.1 Arquitetura Geral

```
┌─────────────────┐
│   Pipedrive     │
│   (Webhooks)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Backend API   │
│   (Node.js)     │
│   Render.com    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    Supabase     │
│   (PostgreSQL)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Frontend      │
│   (React)       │
│   Netlify       │
└─────────────────┘
```

### 4.2 Componentes Principais

1. **Frontend (React + TypeScript)**
   - Dashboard interativo
   - Visualizações de dados
   - Filtros e busca

2. **Backend (Node.js + Express)**
   - API REST
   - Processamento de webhooks
   - Cálculo de métricas

3. **Banco de Dados (Supabase/PostgreSQL)**
   - Armazenamento de leads
   - Views e índices otimizados
   - Realtime subscriptions

4. **Integrações**
   - Pipedrive (webhooks + API)
   - Supabase (banco + realtime)

---

## 5. Stack Tecnológica

### 5.1 Frontend

**Framework e Bibliotecas:**
- **React 18.3.1** - Framework principal
- **TypeScript 5.8.3** - Tipagem estática
- **Vite 7.2.6** - Build tool e dev server
- **React Router DOM 6.30.1** - Roteamento
- **TanStack Query 5.83.0** - Gerenciamento de estado servidor
- **Recharts 2.15.4** - Gráficos e visualizações
- **date-fns 3.6.0** - Manipulação de datas
- **Lucide React 0.462.0** - Ícones
- **Sonner 1.7.4** - Notificações toast
- **next-themes 0.3.0** - Tema claro/escuro

**UI Components:**
- **Radix UI** - Componentes acessíveis
  - Accordion, Alert Dialog, Avatar, Checkbox, Dialog, Dropdown Menu, Label, Popover, Progress, Radio Group, Select, Separator, Slider, Switch, Tabs, Toast, Tooltip
- **shadcn/ui** - Componentes customizados
- **Tailwind CSS 3.4.17** - Estilização
- **tailwindcss-animate 1.0.7** - Animações

**Outras Dependências:**
- **@supabase/supabase-js 2.86.2** - Cliente Supabase
- **class-variance-authority 0.7.1** - Variantes de componentes
- **clsx 2.1.1** - Utilitário de classes CSS
- **cmdk 1.1.1** - Command menu
- **embla-carousel-react 8.6.0** - Carrossel
- **input-otp 1.4.2** - Input OTP
- **react-day-picker 8.10.1** - Seletor de data
- **react-hook-form 7.61.1** - Formulários
- **react-resizable-panels 2.1.9** - Painéis redimensionáveis
- **vaul 0.9.9** - Drawer component
- **zod 3.25.76** - Validação de schemas

**DevDependencies:**
- **@vitejs/plugin-react-swc 3.11.0** - Plugin React com SWC
- **TypeScript ESLint 8.38.0** - Linting
- **ESLint 9.32.0** - Linter
- **PostCSS 8.5.6** - Processamento CSS
- **Autoprefixer 10.4.21** - Prefixos CSS
- **@tailwindcss/typography 0.5.16** - Tipografia Tailwind

### 5.2 Backend

**Runtime e Framework:**
- **Node.js >= 18.0.0** - Runtime
- **Express 4.18.2** - Framework web
- **TypeScript 5.3.2** - Tipagem estática
- **tsx 4.6.0** - Execução TypeScript em desenvolvimento

**Dependências Principais:**
- **@supabase/supabase-js 2.39.0** - Cliente Supabase
- **cors 2.8.5** - CORS middleware
- **dotenv 16.3.1** - Variáveis de ambiente
- **zod 3.22.4** - Validação de schemas

**Tipos:**
- **@types/express 4.17.21** - Tipos Express
- **@types/node 20.10.0** - Tipos Node.js
- **@types/cors 2.8.17** - Tipos CORS

### 5.3 Banco de Dados

- **Supabase (PostgreSQL)** - Banco de dados principal
- **Extensões:** uuid-ossp (geração de UUIDs)
- **Realtime:** Subscriptions para atualizações em tempo real

### 5.4 Infraestrutura

- **Backend:** Render.com (Node.js Web Service)
- **Frontend:** Netlify (Static Site Hosting)
- **Banco de Dados:** Supabase (PostgreSQL gerenciado)

---

## 6. Regras de Negócio

### 6.1 Pipeline "SDR" (Funil Principal)

**Stages Válidos (apenas estes são contabilizados):**
- ✅ **TEM PERFIL** (prioridade 1) - Maior prioridade
- ✅ **PERFIL MENOR** (prioridade 2)
- ✅ **INCONCLUSIVO** (prioridade 3)
- ✅ **SEM PERFIL** (prioridade 4) - Menor prioridade

**Comportamento:**
- ✅ Lead em stage válido → **PENDENTE** no dashboard
- ❌ Lead em stage inválido → **IGNORADO completamente** (não aparece no sistema)
- ✅ Mudança entre stages válidos → Atualiza o stage no dashboard
- ❌ Mudança para stage inválido → Ignora a mudança

**Exemplos:**
- Lead em "TEM PERFIL" → Aparece como pendente ✅
- Lead em "Outro Stage" → Não aparece (ignorado) ❌
- Lead muda de "TEM PERFIL" para "PERFIL MENOR" → Atualiza stage ✅
- Lead muda de "TEM PERFIL" para "Outro Stage" → Ignora mudança ❌

### 6.2 Pipelines Individuais "NOME - SDR"

**Formato:**
- "JOÃO - SDR"
- "MARIA - SDR"
- "CARLOS - SDR"
- Qualquer nome seguido de " - SDR" ou "-SDR"

**Comportamento:**
- ✅ Lead movido de "SDR" para "NOME - SDR" → **ATENDIDO** (SLA calculado)
- ✅ Lead criado diretamente em "NOME - SDR" → **ATENDIDO** imediatamente
- ❌ Mudanças de stage DENTRO de pipelines individuais → **IGNORADAS** (não afetam o sistema)
- ❌ Lead já atendido em pipeline individual → Mudanças são ignoradas

**Exemplos:**
- Lead em "SDR" → Movido para "JOÃO - SDR" → **ATENDIDO** ✅
- Lead em "JOÃO - SDR" → Muda de stage → **IGNORADO** (já está atendido) ❌
- Lead criado em "MARIA - SDR" → **ATENDIDO** imediatamente ✅

### 6.3 Cálculo de SLA

**Fórmula:**
```
SLA (minutos) = Tempo entre entrada no pipeline "SDR" e movimentação para pipeline individual "NOME - SDR"
```

**Exemplo:**
- Lead criado em "SDR" às 10:00
- Movido para "JOÃO - SDR" às 10:15
- **SLA = 15 minutos**

**Casos Especiais:**
- Lead criado diretamente em pipeline individual: SLA = 0 (ou tempo desde criação)
- Lead já atendido: Mudanças subsequentes não alteram o SLA

### 6.4 Priorização de Leads

**Leads Importantes:**
- **TEM PERFIL** (prioridade 1)
- **PERFIL MENOR** (prioridade 2)

**Comportamento:**
- Leads importantes pendentes aparecem destacados no dashboard
- Contador separado de leads importantes pendentes
- Filtro específico para leads importantes

### 6.5 Status de Performance

**Classificação por SLA Médio:**
- **Bom:** SLA médio < 15 minutos
- **Moderado:** SLA médio entre 15 e 20 minutos
- **Crítico:** SLA médio > 20 minutos

**Aplicação:**
- Por SDR (ranking)
- Por horário (performance horária)
- Por lead individual

---

## 7. Funcionalidades Detalhadas

### 7.1 Dashboard Principal

**Componentes:**

1. **StatsCards (Cards de Métricas)**
   - Total de Leads (últimos 30 dias)
   - Leads Atendidos
   - Leads Pendentes
   - SLA Médio (minutos)
   - Leads Importantes Pendentes (clique para filtrar)

2. **SDRRanking (Ranking de SDRs)**
   - Lista de SDRs ordenada por menor SLA médio
   - Exibe: Nome, SLA médio, quantidade de leads atendidos
   - Badges de status (Bom/Moderado/Crítico)

3. **PerformanceCharts (Gráficos de Performance)**
   - Gráfico de linha: SLA médio ao longo do tempo
   - Gráfico de barras: Distribuição de SLA
   - Gráfico de pizza: Distribuição por stage

4. **HourlyPerformance (Performance por Hora)**
   - Análise de desempenho por faixa horária (6h às 22h)
   - Exibe: Hora, SLA médio, quantidade, status

5. **Timeline (Linha do Tempo)**
   - Visualização temporal de leads
   - Agrupamento por data
   - Indicadores de volume e SLA médio

6. **LeadsTable (Tabela de Leads)**
   - Lista completa de leads
   - Colunas: Nome, SDR, Data entrada, Data atendimento, SLA, Stage, Status
   - Paginação: 20 leads por página
   - Ordenação por qualquer coluna
   - Filtros: Período, SDR, Leads importantes

7. **DashboardFilters (Filtros)**
   - Filtro por período: Hoje, 7 dias, 15 dias, 30 dias, Todos
   - Filtro por SDR: Dropdown com lista de SDRs
   - Botão para limpar filtros

### 7.2 Funcionalidades de Tempo Real

**Supabase Realtime:**
- Atualizações instantâneas quando há novos leads
- Atualizações quando leads são atendidos
- Notificações toast para eventos importantes

**Polling (Backup):**
- Atualização automática a cada 60 segundos
- Ativado quando Realtime não está disponível
- Indicador visual do modo de atualização

**Notificações:**
- 🔔 Novo lead importante recebido
- ✅ Lead atendido
- 🔴 Conectado em tempo real

### 7.3 Tema Claro/Escuro

- Toggle para alternar entre temas
- Persistência da preferência do usuário
- Suporte completo a dark mode em todos os componentes

### 7.4 Refresh Manual

- Botão para forçar atualização dos dados
- Útil quando Realtime não está funcionando
- Feedback visual ao atualizar

---

## 8. Estrutura de Dados

### 8.1 Tabela: `leads_sla`

**Schema Completo:**

```sql
CREATE TABLE leads_sla (
    -- Identificador único do registro
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Dados do Lead (Pipedrive)
    lead_id VARCHAR(100) NOT NULL UNIQUE,
    lead_name VARCHAR(255) NOT NULL,
    
    -- Dados do SDR responsável
    sdr_id VARCHAR(100),
    sdr_name VARCHAR(255),
    
    -- Timestamps de SLA
    entered_at TIMESTAMPTZ NOT NULL,
    attended_at TIMESTAMPTZ,
    
    -- SLA calculado em minutos
    sla_minutes INTEGER,
    
    -- Campos adicionais para compatibilidade com frontend
    source VARCHAR(100) DEFAULT 'Pipedrive',
    pipeline VARCHAR(100) DEFAULT 'Default',
    
    -- Stage do lead (TEM PERFIL, PERFIL MENOR, INCONCLUSIVO, SEM PERFIL)
    stage_name VARCHAR(100),
    stage_priority INTEGER DEFAULT 99,
    
    -- Metadados
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Índices:**

```sql
CREATE INDEX idx_leads_sla_entered_at ON leads_sla(entered_at DESC);
CREATE INDEX idx_leads_sla_sdr_id ON leads_sla(sdr_id);
CREATE INDEX idx_leads_sla_lead_id ON leads_sla(lead_id);
CREATE INDEX idx_leads_sla_attended_at ON leads_sla(attended_at);
CREATE INDEX idx_leads_sla_stage_priority ON leads_sla(stage_priority);
```

**Triggers:**

```sql
-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER trigger_update_leads_sla_updated_at
    BEFORE UPDATE ON leads_sla
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

**Row Level Security (RLS):**

```sql
ALTER TABLE leads_sla ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations" ON leads_sla
    FOR ALL
    USING (true)
    WITH CHECK (true);
```

### 8.2 Views Úteis

**v_metrics_general:**
```sql
SELECT 
    COUNT(*) AS total_leads,
    COUNT(attended_at) AS attended_leads,
    COUNT(*) FILTER (WHERE attended_at IS NULL) AS pending_leads,
    ROUND(AVG(sla_minutes) FILTER (WHERE sla_minutes IS NOT NULL), 2) AS avg_sla_minutes,
    MAX(sla_minutes) AS max_sla_minutes,
    MIN(sla_minutes) FILTER (WHERE sla_minutes IS NOT NULL) AS min_sla_minutes
FROM leads_sla
WHERE entered_at >= NOW() - INTERVAL '30 days';
```

**v_sdr_ranking:**
```sql
SELECT 
    sdr_id,
    sdr_name,
    COUNT(*) AS leads_attended,
    ROUND(AVG(sla_minutes), 2) AS average_time
FROM leads_sla
WHERE 
    entered_at >= NOW() - INTERVAL '30 days'
    AND sla_minutes IS NOT NULL
    AND sdr_id IS NOT NULL
GROUP BY sdr_id, sdr_name
ORDER BY average_time ASC;
```

**v_hourly_performance:**
```sql
SELECT 
    EXTRACT(HOUR FROM attended_at) AS hour,
    COUNT(*) AS count,
    ROUND(AVG(sla_minutes), 2) AS avg_sla,
    CASE 
        WHEN AVG(sla_minutes) < 15 THEN 'Bom'
        WHEN AVG(sla_minutes) < 20 THEN 'Moderado'
        ELSE 'Crítico'
    END AS status
FROM leads_sla
WHERE 
    entered_at >= NOW() - INTERVAL '30 days'
    AND attended_at IS NOT NULL
    AND sla_minutes IS NOT NULL
GROUP BY EXTRACT(HOUR FROM attended_at)
ORDER BY hour;
```

### 8.3 Tipos TypeScript

**LeadSLA:**
```typescript
interface LeadSLA {
  id: string;
  lead_id: string;
  lead_name: string;
  sdr_id: string | null;
  sdr_name: string | null;
  entered_at: string;
  attended_at: string | null;
  sla_minutes: number | null;
  source: string;
  pipeline: string;
  stage_name: string | null;
  stage_priority: number | null;
  created_at: string;
  updated_at: string;
}
```

**SDRPerformance:**
```typescript
interface SDRPerformance {
  sdr_id: string;
  sdr_name: string;
  average_time: number;
  leads_attended: number;
}
```

**GeneralMetrics:**
```typescript
interface GeneralMetrics {
  total_leads: number;
  attended_leads: number;
  pending_leads: number;
  avg_sla_minutes: number;
  max_sla_minutes: number;
  min_sla_minutes: number;
}
```

**HourlyPerformance:**
```typescript
interface HourlyPerformance {
  hour: number;
  label: string;
  avg_sla: number;
  count: number;
  status: 'Bom' | 'Moderado' | 'Crítico';
}
```

---

## 9. APIs e Endpoints

### 9.1 Health Check

**GET /health**
- **Descrição:** Verifica se o backend está funcionando
- **Resposta:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0",
  "service": "lead-speed-monitor-backend"
}
```

### 9.2 Métricas

**GET /api/metrics/general**
- **Descrição:** Retorna métricas gerais (últimos 30 dias)
- **Resposta:**
```json
{
  "success": true,
  "data": {
    "total_leads": 100,
    "attended_leads": 80,
    "pending_leads": 20,
    "avg_sla_minutes": 15,
    "max_sla_minutes": 120,
    "min_sla_minutes": 5
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**GET /api/metrics/ranking**
- **Descrição:** Retorna ranking de SDRs ordenado por menor SLA médio
- **Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "sdr_id": "sdr_001",
      "sdr_name": "Ana Silva",
      "average_time": 10,
      "leads_attended": 25
    }
  ],
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**GET /api/metrics/timeline**
- **Descrição:** Retorna dados para gráfico de linha do tempo
- **Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "date": "2024-01-01",
      "average": 15,
      "count": 10
    }
  ],
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**GET /api/metrics/hourly-performance**
- **Descrição:** Retorna análise de desempenho por faixa horária
- **Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "hour": 9,
      "label": "09h–10h",
      "avg_sla": 12,
      "count": 5,
      "status": "Bom"
    }
  ],
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 9.3 Leads

**GET /api/leads/detail**
- **Descrição:** Retorna lista detalhada de leads com filtros
- **Query Params:**
  - `period`: 'today' | '7days' | '15days' | '30days' | 'all'
  - `sdr_id`: string (opcional)
  - `limit`: number (padrão: 100)
  - `offset`: number (padrão: 0)
- **Resposta:**
```json
{
  "success": true,
  "data": [/* array de LeadSLA */],
  "message": "100 leads encontrados",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**GET /api/leads/pending**
- **Descrição:** Retorna leads pendentes (sem atendimento)
- **Query Params:**
  - `limit`: number (padrão: 50)
- **Resposta:**
```json
{
  "success": true,
  "data": [/* array de LeadSLA */],
  "message": "20 leads aguardando atendimento",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**GET /api/leads/important-pending**
- **Descrição:** Retorna leads importantes pendentes (TEM PERFIL ou PERFIL MENOR)
- **Resposta:**
```json
{
  "success": true,
  "data": {
    "count": 5,
    "leads": [/* array de LeadSLA */]
  },
  "message": "5 leads importantes aguardando atendimento",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**GET /api/leads/slowest**
- **Descrição:** Retorna leads com maior tempo de SLA
- **Query Params:**
  - `limit`: number (padrão: 20)
- **Resposta:**
```json
{
  "success": true,
  "data": [/* array de LeadSLA */],
  "message": "20 leads com maior tempo de SLA",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**GET /api/leads/sdrs**
- **Descrição:** Retorna lista de SDRs únicos
- **Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "sdr_id": "sdr_001",
      "sdr_name": "Ana Silva"
    }
  ],
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**GET /api/leads/:lead_id**
- **Descrição:** Retorna detalhes de um lead específico
- **Resposta:**
```json
{
  "success": true,
  "data": {/* LeadSLA */},
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**GET /api/leads/paginated**
- **Descrição:** Retorna leads com paginação real (otimizado para 10k+ leads)
- **Query Params:**
  - `period`: string
  - `sdr_id`: string (opcional)
  - `page`: number (padrão: 1)
  - `limit`: number (padrão: 50)
- **Resposta:**
```json
{
  "success": true,
  "data": [/* array de LeadSLA */],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 1000,
    "totalPages": 20,
    "hasNext": true,
    "hasPrev": false
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 9.4 Webhooks

**POST /api/webhook/pipedrive**
- **Descrição:** Recebe eventos do Pipedrive (criação e atualização de deals)
- **Body:** Payload do webhook do Pipedrive
- **Resposta:**
```json
{
  "success": true,
  "message": "Lead pendente",
  "lead": {/* LeadSLA */}
}
```

**POST /api/webhook/manual/lead**
- **Descrição:** Cria um lead manualmente (para testes)
- **Body:**
```json
{
  "lead_id": "lead_001",
  "lead_name": "Teste Lead",
  "source": "Manual",
  "pipeline": "Default",
  "stage_name": "TEM PERFIL"
}
```

**POST /api/webhook/manual/attend**
- **Descrição:** Registra atendimento manualmente (para testes)
- **Body:**
```json
{
  "lead_id": "lead_001",
  "sdr_id": "sdr_001",
  "sdr_name": "Ana Silva"
}
```

### 9.5 Admin (Endpoints Administrativos)

**DELETE /api/webhook/admin/clear-all**
- **Descrição:** Limpa todos os dados de teste
- **Headers:**
  - `X-Admin-Key`: string (chave de admin)
- **Resposta:**
```json
{
  "success": true,
  "message": "100 leads removidos com sucesso",
  "deleted_count": 100
}
```

**GET /api/webhook/admin/pipelines**
- **Descrição:** Lista os pipelines SDR encontrados no Pipedrive
- **Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "SDR",
      "isSDR": true,
      "isMainSDR": true,
      "isIndividualSDR": false
    }
  ],
  "message": "3 pipelines SDR encontrados"
}
```

**POST /api/webhook/admin/refresh-cache**
- **Descrição:** Força a recarga do cache do Pipedrive
- **Resposta:**
```json
{
  "success": true,
  "message": "Cache atualizado",
  "pipelines_sdr": 3
}
```

---

## 10. Integrações

### 10.1 Pipedrive

**Tipo:** Webhook + API REST

**Configuração:**

1. **Webhook URL:**
   ```
   https://dashboard-sdr-sla.onrender.com/api/webhook/pipedrive
   ```

2. **Eventos Configurados:**
   - `deal.added` - Quando um deal é criado
   - `deal.updated` - Quando um deal é atualizado

3. **API Token:**
   - Configurado via variável de ambiente `PIPEDRIVE_API_TOKEN`
   - Usado para buscar informações de pipelines e stages

**Funcionalidades:**
- Captura automática de leads via webhooks
- Busca de informações de pipelines e stages
- Cache de dados do Pipedrive (5 minutos TTL)
- Identificação automática de pipelines SDR

**Estrutura Esperada no Pipedrive:**

- **Pipeline Principal:** "SDR" (case-insensitive)
  - Stages válidos: TEM PERFIL, PERFIL MENOR, INCONCLUSIVO, SEM PERFIL
  
- **Pipelines Individuais:** "NOME - SDR" (ex: "JOÃO - SDR")
  - Qualquer stage dentro desses pipelines marca como atendido

### 10.2 Supabase

**Tipo:** Banco de Dados PostgreSQL + Realtime

**Configuração:**

1. **URL:** Configurada via `SUPABASE_URL`
2. **API Key:** Configurada via `SUPABASE_KEY` (anon public key)

**Funcionalidades:**

1. **Banco de Dados:**
   - Armazenamento de leads
   - Views otimizadas para métricas
   - Índices para performance
   - Triggers para atualização automática

2. **Realtime:**
   - Subscriptions para mudanças na tabela `leads_sla`
   - Eventos: INSERT, UPDATE
   - Atualizações instantâneas no frontend

**Estrutura:**
- Tabela: `leads_sla`
- Views: `v_metrics_general`, `v_sdr_ranking`, `v_hourly_performance`
- RLS: Habilitado com política permissiva

---

## 11. Interface do Usuário

### 11.1 Layout Principal

**Estrutura:**
```
┌─────────────────────────────────────────┐
│ Header (Logo + Título + Status + Toggle) │
├─────────────────────────────────────────┤
│ Filtros (Período + SDR + Limpar)        │
├─────────────────────────────────────────┤
│ StatsCards (Métricas Principais)        │
├─────────────────────────────────────────┤
│ SDRRanking (Ranking de SDRs)            │
├─────────────────────────────────────────┤
│ PerformanceCharts (Gráficos)            │
├─────────────────────────────────────────┤
│ HourlyPerformance (Performance Horária) │
├─────────────────────────────────────────┤
│ Timeline (Linha do Tempo)               │
├─────────────────────────────────────────┤
│ LeadsTable (Tabela de Leads)            │
└─────────────────────────────────────────┘
```

### 11.2 Componentes Visuais

**StatsCards:**
- Cards com métricas principais
- Cores diferentes por tipo de métrica
- Clique no card de leads importantes filtra a tabela

**SDRRanking:**
- Tabela ordenada por SLA médio
- Badges de status (Bom/Moderado/Crítico)
- Cores indicativas de performance

**PerformanceCharts:**
- Gráfico de linha: SLA ao longo do tempo
- Gráfico de barras: Distribuição de SLA
- Gráfico de pizza: Distribuição por stage

**HourlyPerformance:**
- Gráfico de barras por hora
- Cores indicativas de status
- Labels formatadas (ex: "09h–10h")

**Timeline:**
- Visualização temporal
- Agrupamento por data
- Indicadores de volume

**LeadsTable:**
- Tabela completa com paginação
- Ordenação por colunas
- Filtros integrados
- Cores por stage (vermelho=TEM PERFIL, laranja=PERFIL MENOR, etc.)

### 11.3 Responsividade

- **Desktop:** Layout completo com todos os componentes
- **Tablet:** Componentes reorganizados verticalmente
- **Mobile:** Componentes empilhados, tabela com scroll horizontal

### 11.4 Tema Claro/Escuro

- **Claro:** Fundo branco, texto escuro
- **Escuro:** Fundo escuro, texto claro
- **Persistência:** Preferência salva no localStorage

---

## 12. Fluxos de Dados

### 12.1 Fluxo: Lead Criado no Pipedrive

```
1. Usuário cria deal no Pipedrive
   └─> Pipeline: "SDR"
   └─> Stage: "TEM PERFIL"

2. Pipedrive envia webhook
   └─> POST /api/webhook/pipedrive
   └─> Event: deal.added

3. Backend processa webhook
   └─> Verifica se pipeline é "SDR"
   └─> Verifica se stage é válido
   └─> Cria lead no Supabase
   └─> Status: PENDENTE

4. Supabase Realtime notifica frontend
   └─> Event: INSERT
   └─> Frontend atualiza dashboard
   └─> Notificação toast (se lead importante)

5. Dashboard atualizado
   └─> Contador de pendentes aumenta
   └─> Lead aparece na tabela
```

### 12.2 Fluxo: Lead Atendido

```
1. Usuário move deal no Pipedrive
   └─> De: Pipeline "SDR"
   └─> Para: Pipeline "JOÃO - SDR"

2. Pipedrive envia webhook
   └─> POST /api/webhook/pipedrive
   └─> Event: deal.updated

3. Backend processa webhook
   └─> Detecta mudança para pipeline individual
   └─> Busca lead existente
   └─> Calcula SLA (entered_at → agora)
   └─> Atualiza lead no Supabase
   └─> Status: ATENDIDO

4. Supabase Realtime notifica frontend
   └─> Event: UPDATE
   └─> Frontend atualiza dashboard
   └─> Notificação toast: "Lead atendido!"

5. Dashboard atualizado
   └─> Contador de atendidos aumenta
   └─> Contador de pendentes diminui
   └─> SLA aparece na tabela
   └─> Ranking de SDRs atualizado
```

### 12.3 Fluxo: Mudança de Stage (Dentro do "SDR")

```
1. Usuário muda stage do deal
   └─> De: "TEM PERFIL"
   └─> Para: "PERFIL MENOR"

2. Pipedrive envia webhook
   └─> POST /api/webhook/pipedrive
   └─> Event: deal.updated

3. Backend processa webhook
   └─> Verifica se ainda está no pipeline "SDR"
   └─> Verifica se novo stage é válido
   └─> Atualiza stage_name e stage_priority
   └─> Status: Continua PENDENTE

4. Supabase Realtime notifica frontend
   └─> Event: UPDATE
   └─> Frontend atualiza dashboard

5. Dashboard atualizado
   └─> Stage atualizado na tabela
   └─> Cor do badge atualizada
```

### 12.4 Fluxo: Lead Ignorado

```
1. Usuário cria deal em stage inválido
   └─> Pipeline: "SDR"
   └─> Stage: "Outro Stage"

2. Pipedrive envia webhook
   └─> POST /api/webhook/pipedrive

3. Backend processa webhook
   └─> Verifica se stage é válido
   └─> Stage inválido → IGNORA
   └─> Retorna 200 OK (sem criar lead)

4. Nenhuma atualização no dashboard
   └─> Lead não aparece no sistema
```

---

## 13. Performance e Escalabilidade

### 13.1 Cache

**Backend:**
- Cache em memória para métricas frequentes
- TTL configurável por tipo de métrica:
  - Métricas gerais: 30 segundos
  - Ranking de SDRs: 60 segundos
  - Lista de leads: 15 segundos
  - Lista de SDRs: 5 minutos

**Cache Keys:**
- `metrics:general` - Métricas gerais
- `metrics:ranking` - Ranking de SDRs
- `leads:important-pending` - Leads importantes pendentes
- `leads:sdrs` - Lista de SDRs

**Invalidação:**
- Automática após criação/atualização de leads
- Manual via endpoint admin

**Pipedrive:**
- Cache de pipelines e stages: 5 minutos
- Reduz chamadas à API do Pipedrive

### 13.2 Otimizações de Banco de Dados

**Índices:**
- `idx_leads_sla_entered_at` - Ordenação por data de entrada
- `idx_leads_sla_sdr_id` - Filtros por SDR
- `idx_leads_sla_lead_id` - Busca por lead_id
- `idx_leads_sla_attended_at` - Filtros de atendimento
- `idx_leads_sla_stage_priority` - Ordenação por prioridade

**Views:**
- Views pré-calculadas para métricas comuns
- Reduz complexidade de queries

**Queries Otimizadas:**
- Seleção apenas de campos necessários
- Filtros aplicados no banco
- Limites e offsets para paginação

### 13.3 Paginação

**Frontend:**
- Tabela de leads com paginação de 20 itens
- Scroll infinito (futuro)

**Backend:**
- Endpoint `/api/leads/paginated` otimizado para grandes volumes
- Suporta 10.000+ leads sem degradação

### 13.4 Realtime vs Polling

**Realtime (Preferencial):**
- Atualizações instantâneas (< 1 segundo)
- Menor carga no servidor
- Melhor experiência do usuário

**Polling (Backup):**
- Atualização a cada 60 segundos
- Ativado quando Realtime não está disponível
- Indicador visual do modo

### 13.5 Escalabilidade

**Backend:**
- Stateless (pode escalar horizontalmente)
- Cache em memória (pode migrar para Redis em produção)
- Suporta múltiplas instâncias

**Frontend:**
- Static site (CDN do Netlify)
- Escala automaticamente

**Banco de Dados:**
- Supabase PostgreSQL escalável
- Índices otimizados
- Views para reduzir carga

---

## 14. Segurança

### 14.1 Autenticação

**Atual:** Não implementado (acesso público)

**Futuro:**
- Autenticação via Supabase Auth
- Controle de acesso por usuário
- Roles e permissões

### 14.2 Autorização

**Endpoints Admin:**
- Requer header `X-Admin-Key`
- Chave configurável via `ADMIN_KEY`

**RLS (Row Level Security):**
- Habilitado no Supabase
- Política permissiva atual (permite tudo)
- Pode ser restringida por usuário no futuro

### 14.3 Validação de Dados

**Backend:**
- Validação de payloads de webhook
- Sanitização de inputs
- Validação de tipos com Zod

**Frontend:**
- Validação de formulários
- Sanitização de inputs do usuário

### 14.4 CORS

**Configuração:**
- Permite origens específicas
- Suporta subdomínios do Netlify/Vercel
- Headers permitidos: Content-Type, Authorization

### 14.5 Variáveis de Ambiente

**Backend:**
- Credenciais sensíveis em variáveis de ambiente
- Não commitadas no repositório
- Configuradas no Render

**Frontend:**
- API URL configurável
- Não expõe credenciais

---

## 15. Deploy e Infraestrutura

### 15.1 Backend (Render.com)

**Configuração:**

**Arquivo:** `render.yaml`
```yaml
services:
  - type: web
    name: lead-speed-monitor-backend
    env: node
    region: oregon
    plan: starter
    buildCommand: cd backend && npm install && npm run build
    startCommand: cd backend && npm start
    healthCheckPath: /health
```

**Variáveis de Ambiente:**
- `NODE_ENV`: production
- `PORT`: 10000 (padrão do Render)
- `SUPABASE_URL`: URL do projeto Supabase
- `SUPABASE_KEY`: Anon public key do Supabase
- `PIPEDRIVE_API_TOKEN`: Token da API do Pipedrive
- `FRONTEND_URL`: URL do frontend no Netlify

**URL de Produção:**
```
https://dashboard-sdr-sla.onrender.com
```

**Health Check:**
```
https://dashboard-sdr-sla.onrender.com/health
```

### 15.2 Frontend (Netlify)

**Configuração:**

**Arquivo:** `netlify.toml`
```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

[[headers]]
  for = "/*"
  [headers.values]
    Cache-Control = "no-cache, no-store, must-revalidate"
    Pragma = "no-cache"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**Variáveis de Ambiente:**
- `VITE_API_URL`: URL do backend (opcional, padrão: localhost em dev)

**Deploy:**
- Conectado ao repositório GitHub
- Deploy automático em push para `main`
- Preview deployments para PRs

### 15.3 Banco de Dados (Supabase)

**Configuração:**
- Projeto criado no Supabase
- PostgreSQL gerenciado
- Realtime habilitado
- RLS configurado

**Schema:**
- Executado via SQL Editor
- Arquivo: `backend/schema.sql`

**Backup:**
- Automático pelo Supabase
- Retenção configurável

---

## 16. Configuração e Variáveis de Ambiente

### 16.1 Backend (.env)

**Arquivo:** `backend/.env`

```env
# Supabase
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_KEY=sua-anon-key-aqui

# Pipedrive
PIPEDRIVE_API_TOKEN=seu-token-pipedrive

# Servidor
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Admin (opcional)
ADMIN_KEY=dev-admin-key-2024
```

**Como Obter:**

1. **SUPABASE_URL:**
   - Acesse: https://app.supabase.com
   - Vá em: Settings > API
   - Copie: Project URL

2. **SUPABASE_KEY:**
   - Acesse: https://app.supabase.com
   - Vá em: Settings > API
   - Copie: anon public key

3. **PIPEDRIVE_API_TOKEN:**
   - Acesse: https://app.pipedrive.com
   - Vá em: Settings > Personal > API
   - Gere ou copie: API Token

### 16.2 Frontend (.env)

**Arquivo:** `.env` (raiz do projeto)

```env
VITE_API_URL=http://localhost:3001
```

**Nota:** Em desenvolvimento, se não configurado, usa `http://localhost:3001` por padrão.

### 16.3 Render (Variáveis de Ambiente)

**Configuração no Painel:**
1. Acesse: https://render.com
2. Vá em: Seu serviço > Environment
3. Adicione as variáveis:
   - `SUPABASE_URL`
   - `SUPABASE_KEY`
   - `PIPEDRIVE_API_TOKEN`
   - `FRONTEND_URL`
   - `NODE_ENV=production`
   - `PORT=10000`

### 16.4 Netlify (Variáveis de Ambiente)

**Configuração no Painel:**
1. Acesse: https://app.netlify.com
2. Vá em: Site settings > Environment variables
3. Adicione (se necessário):
   - `VITE_API_URL` (URL do backend)

---

## 17. Scripts e Ferramentas

### 17.1 Frontend

**package.json scripts:**
```json
{
  "dev": "vite",
  "build": "vite build",
  "build:dev": "vite build --mode development",
  "lint": "eslint .",
  "preview": "vite preview"
}
```

**Comandos:**
- `npm run dev` - Inicia servidor de desenvolvimento (porta 8080)
- `npm run build` - Build para produção
- `npm run lint` - Executa linter
- `npm run preview` - Preview do build

### 17.2 Backend

**package.json scripts:**
```json
{
  "dev": "tsx watch src/app.ts",
  "build": "npm install --include=dev && tsc",
  "start": "node dist/app.js",
  "lint": "eslint src/**/*.ts",
  "seed": "tsx src/scripts/seedExampleData.ts"
}
```

**Comandos:**
- `npm run dev` - Inicia servidor de desenvolvimento com hot reload
- `npm run build` - Compila TypeScript para JavaScript
- `npm start` - Inicia servidor em produção
- `npm run lint` - Executa linter
- `npm run seed` - Executa script de seed de dados de exemplo

### 17.3 Scripts de Seed

**SQL:** `backend/seed_example_data.sql`
- Cria tabela (se não existir)
- Insere dados de exemplo
- Distribuídos ao longo dos últimos 30 dias

**TypeScript:** `backend/src/scripts/seedExampleData.ts`
- Mesma funcionalidade do SQL
- Executável via `npm run seed`

**Uso:**
```bash
# Via SQL (no Supabase SQL Editor)
# Cole e execute o conteúdo de backend/seed_example_data.sql

# Via TypeScript
cd backend
npm run seed
```

### 17.4 Scripts de Limpeza

**SQL:** `backend/limpar_dados_teste.sql`
- Remove todos os dados da tabela `leads_sla`
- Mantém estrutura da tabela

**Uso:**
```sql
-- No Supabase SQL Editor
-- Cole e execute o conteúdo de backend/limpar_dados_teste.sql
```

---

## 18. Documentação Técnica

### 18.1 Documentos Disponíveis

1. **README.md** - Documentação geral do projeto
2. **backend/README.md** - Documentação do backend
3. **LOGICA_NEGOCIO_SLA.md** - Regras de negócio detalhadas
4. **CONFIGURACAO_WEBHOOK_COMPLETA.md** - Guia de configuração do webhook
5. **GUIA_DEPLOY_PASSO_A_PASSO.md** - Guia completo de deploy
6. **TROUBLESHOOTING_DADOS_NAO_CHEGAM.md** - Guia de troubleshooting
7. **DIAGNOSTICO_RAPIDO.md** - Checklist rápido de problemas
8. **CORRIGIR_API_KEY_SUPABASE.md** - Como corrigir erro de API key
9. **backend/SEED_DATA.md** - Como usar scripts de seed

### 18.2 Estrutura de Arquivos

```
lead-speed-monitor/
├── backend/
│   ├── src/
│   │   ├── app.ts                 # Servidor Express
│   │   ├── config/
│   │   │   └── database.ts       # Configuração Supabase
│   │   ├── routes/
│   │   │   ├── metricsRoutes.ts  # Rotas de métricas
│   │   │   ├── leadsRoutes.ts    # Rotas de leads
│   │   │   └── webhookRoutes.ts  # Rotas de webhook
│   │   ├── services/
│   │   │   ├── leadsService.ts   # Lógica de negócio de leads
│   │   │   ├── pipedriveService.ts # Integração Pipedrive
│   │   │   └── cacheService.ts   # Cache em memória
│   │   ├── types/
│   │   │   └── index.ts          # Tipos TypeScript
│   │   ├── utils/
│   │   │   └── dateUtils.ts      # Utilitários de data
│   │   ├── webhooks/
│   │   │   └── pipedriveHandler.ts # Handler de webhooks
│   │   └── scripts/
│   │       └── seedExampleData.ts # Script de seed
│   ├── schema.sql                # Schema do banco
│   ├── seed_example_data.sql    # Dados de exemplo (SQL)
│   ├── limpar_dados_teste.sql   # Script de limpeza
│   ├── package.json
│   └── tsconfig.json
├── src/
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── StatsCards.tsx
│   │   │   ├── SDRRanking.tsx
│   │   │   ├── PerformanceCharts.tsx
│   │   │   ├── HourlyPerformance.tsx
│   │   │   ├── Timeline.tsx
│   │   │   ├── LeadsTable.tsx
│   │   │   └── DashboardFilters.tsx
│   │   ├── ui/                   # Componentes shadcn/ui
│   │   ├── ThemeToggle.tsx
│   │   └── NavLink.tsx
│   ├── hooks/
│   │   └── useRealtimeLeads.ts  # Hook de realtime
│   ├── lib/
│   │   ├── api.ts               # Cliente API
│   │   ├── mockData.ts          # Tipos e utilitários
│   │   └── supabase.ts          # Cliente Supabase
│   ├── pages/
│   │   ├── Index.tsx            # Página principal
│   │   └── NotFound.tsx
│   ├── App.tsx
│   └── main.tsx
├── public/
├── package.json
├── vite.config.ts
├── tsconfig.json
└── netlify.toml
```

### 18.3 Convenções de Código

**TypeScript:**
- Tipos explícitos
- Interfaces para estruturas de dados
- Enums para constantes

**Nomenclatura:**
- Componentes: PascalCase (ex: `StatsCards.tsx`)
- Funções: camelCase (ex: `getGeneralMetrics`)
- Constantes: UPPER_SNAKE_CASE (ex: `CACHE_TTL`)
- Arquivos: camelCase para utilitários, PascalCase para componentes

**Estrutura:**
- Um componente por arquivo
- Serviços separados por responsabilidade
- Utilitários em arquivos separados

---

## 19. Testes

### 19.1 Testes Manuais

**Checklist:**

1. **Webhook do Pipedrive:**
   - [ ] Criar deal no pipeline "SDR" com stage válido
   - [ ] Verificar se aparece no dashboard
   - [ ] Mover deal para pipeline individual
   - [ ] Verificar se SLA é calculado
   - [ ] Verificar se aparece como atendido

2. **Dashboard:**
   - [ ] Verificar se métricas são exibidas corretamente
   - [ ] Testar filtros (período, SDR)
   - [ ] Testar ordenação na tabela
   - [ ] Testar paginação
   - [ ] Verificar tema claro/escuro
   - [ ] Verificar refresh manual

3. **Realtime:**
   - [ ] Verificar se atualiza automaticamente
   - [ ] Verificar notificações toast
   - [ ] Verificar indicador de conexão

### 19.2 Testes de API

**Endpoints para Testar:**

1. `GET /health` - Deve retornar status OK
2. `GET /api/metrics/general` - Deve retornar métricas
3. `GET /api/metrics/ranking` - Deve retornar ranking
4. `GET /api/leads/pending` - Deve retornar leads pendentes
5. `POST /api/webhook/pipedrive` - Deve processar webhook

**Ferramentas:**
- Postman
- curl
- Insomnia

### 19.3 Testes Futuros

**Planejado:**
- Testes unitários (Jest)
- Testes de integração
- Testes E2E (Playwright/Cypress)

---

## 20. Roadmap e Melhorias Futuras

### 20.1 Melhorias Planejadas

1. **Autenticação e Autorização**
   - Login via Supabase Auth
   - Controle de acesso por usuário
   - Roles e permissões

2. **Notificações**
   - Email quando lead importante pendente
   - Notificações push
   - Alertas de SLA crítico

3. **Relatórios**
   - Exportação para PDF/Excel
   - Relatórios agendados
   - Análises avançadas

4. **Dashboard Avançado**
   - Filtros mais complexos
   - Gráficos interativos
   - Comparações de períodos

5. **Performance**
   - Migração de cache para Redis
   - Otimizações de queries
   - CDN para assets estáticos

6. **Testes**
   - Cobertura de testes unitários
   - Testes de integração
   - Testes E2E

### 20.2 Funcionalidades Futuras

1. **Multi-tenant**
   - Suporte a múltiplas empresas
   - Isolamento de dados

2. **Integrações Adicionais**
   - Outros CRMs além do Pipedrive
   - Integração com Slack
   - Integração com WhatsApp

3. **IA/ML**
   - Previsão de SLA
   - Recomendações de priorização
   - Detecção de anomalias

4. **Mobile**
   - App mobile nativo
   - Notificações push
   - Acesso offline

---

## 21. Contatos e Suporte

### 21.1 Repositório

**GitHub:**
```
https://github.com/henesneto722/dashboard-sdr-sla
```

### 21.2 URLs de Produção

**Backend:**
```
https://dashboard-sdr-sla.onrender.com
```

**Frontend:**
```
(URL do Netlify após deploy)
```

**Health Check:**
```
https://dashboard-sdr-sla.onrender.com/health
```

### 21.3 Documentação Adicional

- **Supabase:** https://supabase.com/docs
- **Pipedrive API:** https://developers.pipedrive.com/docs/api/v1
- **Render:** https://render.com/docs
- **Netlify:** https://docs.netlify.com

---

## 22. Changelog

### Versão 1.0.0 (2024)

**Funcionalidades Iniciais:**
- ✅ Integração com Pipedrive via webhooks
- ✅ Cálculo automático de SLA
- ✅ Dashboard com métricas em tempo real
- ✅ Ranking de SDRs
- ✅ Análise de performance por horário
- ✅ Filtros e busca
- ✅ Tema claro/escuro
- ✅ Notificações toast
- ✅ Realtime via Supabase

**Deploy:**
- ✅ Backend no Render
- ✅ Frontend no Netlify
- ✅ Banco de dados no Supabase

---

## 23. Glossário

**SLA (Service Level Agreement):** Tempo entre entrada do lead no funil e atendimento pelo SDR.

**SDR (Sales Development Representative):** Representante de desenvolvimento de vendas responsável por qualificar leads.

**Pipeline:** Funil de vendas no Pipedrive onde os deals são organizados por estágio.

**Stage:** Etapa específica dentro de um pipeline.

**Lead:** Potencial cliente que entrou no funil de vendas.

**Webhook:** Callback HTTP que permite integrações em tempo real entre sistemas.

**Realtime:** Atualizações instantâneas via Supabase Realtime subscriptions.

**Polling:** Atualização periódica de dados como backup quando Realtime não está disponível.

---

## 24. Anexos

### 24.1 Exemplo de Payload do Webhook Pipedrive

```json
{
  "v": 1,
  "matches_filters": {
    "current": []
  },
  "meta": {
    "action": "added",
    "change_source": "app",
    "company_id": 12345,
    "host": "app.pipedrive.com",
    "id": 123456,
    "is_bulk_update": false,
    "matches_filters": {
      "current": []
    },
    "object": "deal",
    "permitted_user_ids": [123],
    "pipedrive_service_name": "pipedrive",
    "timestamp": 1704067200,
    "timestamp_micro": 1704067200000000,
    "trans_pending": false,
    "user_id": 123,
    "v": 1,
    "webhook_id": "abc123"
  },
  "current": {
    "id": 123,
    "title": "TechCorp Solutions",
    "person_id": 456,
    "person_name": "João Silva",
    "org_id": 789,
    "org_name": "TechCorp",
    "user_id": 123,
    "stage_id": 1,
    "pipeline_id": 1,
    "status": "open",
    "add_time": "2024-01-01T10:00:00.000Z",
    "update_time": "2024-01-01T10:00:00.000Z",
    "stage_change_time": null,
    "owner_name": "Ana Silva"
  },
  "previous": null,
  "event": "added.deal",
  "retry": 0
}
```

### 24.2 Exemplo de Resposta da API

**GET /api/metrics/general:**
```json
{
  "success": true,
  "data": {
    "total_leads": 150,
    "attended_leads": 120,
    "pending_leads": 30,
    "avg_sla_minutes": 18,
    "max_sla_minutes": 120,
    "min_sla_minutes": 5
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### 24.3 Exemplo de Query SQL

**Buscar leads pendentes importantes:**
```sql
SELECT *
FROM leads_sla
WHERE 
  attended_at IS NULL
  AND stage_priority IN (1, 2)
  AND entered_at >= NOW() - INTERVAL '30 days'
ORDER BY stage_priority ASC, entered_at ASC
LIMIT 50;
```

---

## ✅ FIM DO PRD

Este documento contém TODAS as informações do projeto Lead Speed Monitor. Para dúvidas ou atualizações, consulte a documentação técnica ou entre em contato com a equipe de desenvolvimento.

**Última atualização:** 2024  
**Versão do documento:** 1.0.0  
**Status:** ✅ Completo e Atualizado

