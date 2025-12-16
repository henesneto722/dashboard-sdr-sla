# 📋 PRD (Product Requirements Document) - Lead Speed Monitor

**Versão:** 1.3.0  
**Data:** 2024  
**Status:** ✅ Em Produção  
**Última Atualização:** Dezembro 2024

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
   - Leads Atendidos Hoje (filtra por `attended_at` do dia atual)
   - Leads Pendentes (TODOS os leads pendentes, sem filtro de data)
   - SLA Médio (minutos)
   - Leads Importantes Pendentes (apenas "Tem Perfil" e "Perfil Menor" pendentes) - clicável para filtrar
   - Melhor SDR (usa ranking mensal com score combinado: tempo médio + quantidade de leads)

2. **SDRRanking (Ranking de SDRs)**
   - Lista de SDRs ordenada por score combinado de performance
   - Filtros temporais: Diário, Semanal, Mensal (via Tabs)
   - Score combinado: 40% tempo médio + 60% quantidade de leads atendidos
   - Exibe: Nome, SLA médio, quantidade de leads atendidos, score de performance
   - Badges de status (Bom/Moderado/Crítico)
   - Usa mesma métrica do card "Atendidos Hoje" (filtra por `attended_at`)
   - Otimizado: busca todos os leads do mês uma vez e filtra client-side
   - Callback para passar ranking mensal ao componente StatsCards

3. **AverageTimeChart (Tempo Médio por Dia - Últimos 7 dias)**
   - Gráfico de barras mostrando evolução do SLA médio
   - Janela deslizante: sempre mostra últimos 7 dias
   - Dados do backend via API `/api/metrics/daily-average`
   - Atualização automática a cada 60 segundos
   - Estados de loading e erro tratados
   - Tooltip: "Tempo Médio: X min"
   - Layout responsivo

4. **PerformanceCharts (Evolução Semanal do SLA)**
   - Gráfico de linha: Evolução semanal do SLA
   - Dados calculados localmente dos leads filtrados
   - Agrupamento por semana do mês

5. **HourlyPerformance (Performance por Hora)**
   - Análise de desempenho por faixa horária (6h às 22h)
   - Exibe: Hora, SLA médio, quantidade, status

6. **Timeline (Linha do Tempo)**
   - Visualização temporal de leads
   - Agrupamento por data
   - Indicadores de volume e SLA médio
   - Badges coloridos indicando perfil do lead:
     - 🔴 "Tem Perfil" (vermelho)
     - 🟡 "Perfil Menor" (amarelo)
     - ⚪ "Inconclusivo" (outline)
     - ⚪ "Sem Perfil" (outline)

7. **LeadsTable (Tabela de Leads)**
   - Lista completa de leads
   - Colunas: Nome, SDR, Data entrada, Data atendimento, SLA, Stage, Status
   - Paginação: 20 leads por página
   - Ordenação por qualquer coluna
   - Filtros: Período, SDR, Leads importantes

8. **DashboardFilters (Filtros)**
   - Filtro por período: Hoje, 7 dias, 15 dias, 30 dias, Todos
   - Filtro por SDR: Dropdown com lista de SDRs
   - Botão para limpar filtros

9. **SdrAttendanceJourney (Jornada de Atendimento dos SDRs)**
   - Monitora jornada de trabalho dos SDRs baseado em movimentação de leads
   - Divide o dia em turnos: Manhã (06h-12h) e Tarde (13h-18h) - Horário de São Paulo
   - Cards de estatísticas: SDRs Ativos, Total de Ações, Dias Registrados
   - Tabela detalhada: SDR, Data, Primeira/Última ação por turno, Quantidade de ações, Duração
   - Seletor de data: Calendário sempre acessível (mesmo em estados vazios)
   - Filtro por SDR específico (quando aplicável)
   - Estados: Loading, Erro, Sem dados, Com dados
   - Atualização automática a cada 60 segundos

10. **NotificationHistory (Histórico de Notificações)**
    - Popover com lista completa de notificações
    - Filtros por tipo (pendente, atendido, importante, SDR ativo/inativo)
    - Ações: marcar como lida, marcar todas, deletar, limpar todas
    - Contador de não lidas
    - Persistência no localStorage

### 7.2 Funcionalidades de Tempo Real

**Supabase Realtime:**
- Atualizações instantâneas quando há novos leads
- Atualizações quando leads são atendidos
- Notificações toast para eventos importantes

**Polling (Backup):**
- Atualização automática a cada 60 segundos
- Ativado quando Realtime não está disponível
- Indicador visual do modo de atualização

**Sistema de Notificações Completo:**

**Notificações Toast (Sempre Ativas):**
- 🔔 Novo lead pendente recebido (notificação padrão)
- 🚨 Novo lead importante ("Tem Perfil" ou "Perfil Menor") recebido (notificação destacada em vermelho)
- ✅ Lead atendido (notificação de sucesso)
- Exibidas no canto superior direito usando Sonner
- Persistência: notificações salvas no localStorage
- Prevenção de duplicatas: não mostra notificações antigas no carregamento inicial

**Histórico de Notificações:**
- Acessível via ícone de sino ao lado do toggle de tema
- Exibe todas as notificações: pendentes, atendidos, importantes, SDR ativo/inativo
- Filtros por tipo de notificação
- Ações: marcar como lida, marcar todas como lidas, deletar, limpar todas
- Contador de não lidas exibido no badge
- Persistência completa no localStorage

### 7.3 Tema Claro/Escuro

- Toggle para alternar entre temas
- Persistência da preferência do usuário
- Suporte completo a dark mode em todos os componentes

### 7.4 Refresh Manual

- Botão para forçar atualização dos dados
- Útil quando Realtime não está funcionando
- Feedback visual ao atualizar

### 7.5 Sistema de Notificações

**Componentes:**
- `NotificationToaster`: Exibe toasts no canto superior direito
- `NotificationHistory`: Histórico completo de notificações
- `useNotifications`: Hook para gerenciar estado de notificações

**Tipos de Notificações:**
- `lead_pending`: Novo lead pendente recebido
- `lead_attended`: Lead foi atendido
- `lead_has_profile`: Lead importante ("Tem Perfil" ou "Perfil Menor") recebido
- `sdr_active`: SDR ficou ativo
- `sdr_inactive`: SDR ficou inativo

**Funcionalidades:**
- Toasts sempre ativos (não podem ser desabilitados)
- Detecção automática de novos leads pendentes e atendidos
- Prevenção de notificações duplicadas no carregamento inicial
- Persistência completa no localStorage
- Histórico com filtros por tipo
- Ações: marcar como lida, marcar todas, deletar, limpar todas
- Contador de não lidas exibido no badge

**Lógica de Detecção:**
- Compara leads atuais com leads anteriores (usando refs)
- Só notifica quando há novos leads (não no carregamento inicial)
- Flags de inicialização (`isPendingLeadsInitializedRef`, `isAttendedLeadsInitializedRef`)
- Logs de debug para rastreamento

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
  performance_score?: number; // Score combinado (40% tempo + 60% leads)
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

**DailyAverage:**
```typescript
interface DailyAverage {
  date: string; // Formato "DD/MM"
  avg_sla: number; // Média arredondada em minutos
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

**GET /api/metrics/daily-average**
- **Descrição:** Retorna tempo médio por dia dos últimos 7 dias (janela deslizante)
- **Regras de Negócio:**
  - Sempre mostra os últimos 7 dias incluindo o dia atual
  - Janela deslizante: dias só desaparecem quando ficam mais velhos que 7 dias
  - Dados calculados dinamicamente do Supabase baseados em `attended_at`
  - Ordenado por data crescente
- **Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "date": "05/12",
      "avg_sla": 12
    },
    {
      "date": "06/12",
      "avg_sla": 15
    },
    {
      "date": "07/12",
      "avg_sla": 18
    }
  ],
  "timestamp": "2024-12-11T00:00:00.000Z"
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

**GET /api/leads/today-pending**
- **Descrição:** Retorna TODOS os leads pendentes (sem filtro de data, exclui status 'lost')
- **Resposta:**
```json
{
  "success": true,
  "data": {
    "count": 25,
    "leads": [/* array de LeadSLA pendentes */]
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**GET /api/leads/all-month**
- **Descrição:** Retorna todos os leads do mês atual (do dia 1 até hoje)
- **Resposta:**
```json
{
  "success": true,
  "data": [/* array de LeadSLA do mês */],
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**GET /api/leads/important-pending**
- **Descrição:** Retorna leads importantes pendentes (TEM PERFIL ou PERFIL MENOR) do pipeline SDR principal, excluindo status 'lost'
- **Resposta:**
```json
{
  "success": true,
  "data": {
    "count": 5,
    "leads": [/* array de LeadSLA pendentes importantes */]
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
│ Grid 2 Colunas:                         │
│ ┌──────────────────┬──────────────────┐ │
│ │ AverageTimeChart │ PerformanceCharts │ │
│ │ (Últimos 7 dias) │ (Evolução Semanal)│ │
│ └──────────────────┴──────────────────┘ │
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

**AverageTimeChart:**
- Gráfico de barras: Tempo médio por dia (últimos 7 dias)
- Cores: barras azuis `#3b82f6`
- Eixo X: Datas formatadas "DD/MM"
- Eixo Y: Tempo em minutos
- Tooltip: "Tempo Médio: X min"
- Atualização automática via TanStack Query

**PerformanceCharts:**
- Gráfico de linha: Evolução semanal do SLA
- Agrupamento por semana do mês
- Cores: linha azul primária

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

### 17.5 Scripts de Configuração

**PowerShell:** `backend/criar_env.ps1`
- Script para criar arquivo `.env` automaticamente
- Preenche variáveis de ambiente com valores padrão
- Facilita configuração inicial do projeto

**Uso:**
```powershell
cd backend
powershell -ExecutionPolicy Bypass -File criar_env.ps1
```

**Logs de Diagnóstico:**
- Logs detalhados no `app.ts` para verificar carregamento de `.env`
- Logs no `database.ts` para verificar configuração do Supabase
- Logs nas rotas para diagnóstico de erros
- Detecção automática de tipos de erro (DNS, autenticação, conexão)

---

## 18. Documentação Técnica

### 18.1 Documentos Disponíveis

1. **README.md** - Documentação geral do projeto
2. **PRD_COMPLETO.md** - Product Requirements Document completo (este arquivo)
3. **backend/README.md** - Documentação do backend
4. **LOGICA_NEGOCIO_SLA.md** - Regras de negócio detalhadas
5. **CONFIGURACAO_WEBHOOK_COMPLETA.md** - Guia de configuração do webhook
6. **GUIA_DEPLOY_PASSO_A_PASSO.md** - Guia completo de deploy
7. **TROUBLESHOOTING_DADOS_NAO_CHEGAM.md** - Guia de troubleshooting
8. **DIAGNOSTICO_RAPIDO.md** - Checklist rápido de problemas
9. **CORRIGIR_API_KEY_SUPABASE.md** - Como corrigir erro de API key
10. **TESTAR_ENDPOINT_DAILY_AVERAGE.md** - Guia para testar endpoint de média diária
11. **CONFIGURAR_ENV.md** - Instruções para configurar variáveis de ambiente
12. **RESOLVER_PORTA_3001.md** - Solução para erro de porta em uso
13. **backend/SEED_DATA.md** - Como usar scripts de seed

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
│   ├── criar_env.ps1            # Script PowerShell para criar .env
│   ├── package.json
│   └── tsconfig.json
├── src/
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── StatsCards.tsx
│   │   │   ├── SDRRanking.tsx
│   │   │   ├── AverageTimeChart.tsx
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

### Versão 1.3.0 (Dezembro 2024)

**Novas Funcionalidades:**
- ✅ Sistema completo de notificações com toasts e histórico
- ✅ Ranking de SDRs com filtros temporais (Diário, Semanal, Mensal)
- ✅ Score combinado de performance (40% tempo médio + 60% quantidade de leads)
- ✅ Badges de perfil na Timeline (Tem Perfil, Perfil Menor, Inconclusivo, Sem Perfil)
- ✅ Card "Melhor SDR" usando ranking mensal com score combinado
- ✅ Jornada de Atendimento dos SDRs com turnos (Manhã/Tarde)
- ✅ Histórico de notificações com filtros e ações (marcar como lida, deletar, limpar)
- ✅ Endpoint `GET /api/leads/today-pending` para leads pendentes do dia
- ✅ Endpoint `GET /api/leads/all-month` para buscar todos os leads do mês
- ✅ Otimização: busca única de leads do mês e filtragem client-side

**Melhorias:**
- ✅ Ranking de SDRs usa mesma métrica do card "Atendidos Hoje" (filtra por `attended_at`)
- ✅ Card "Leads Pendentes" mostra TODOS os leads pendentes (sem filtro de data)
- ✅ Card "Leads Importantes" mostra apenas leads pendentes com "Tem Perfil" ou "Perfil Menor"
- ✅ Filtro de leads importantes na tabela mostra apenas leads pendentes importantes
- ✅ Calendário na Jornada de Atendimento sempre acessível (mesmo em estados vazios)
- ✅ Prevenção de notificações duplicadas no carregamento inicial
- ✅ Persistência completa de notificações no localStorage

**Correções:**
- ✅ Consistência entre cards de métricas e tabela de leads
- ✅ Ranking mensal passado corretamente para o card "Melhor SDR"
- ✅ Filtros temporais do ranking alinhados com métricas de atendimento
- ✅ Agrupamento correto de SDRs usando `user_name` na chave

### Versão 1.2.1 (Dezembro 2024)

**Correções:**
- ✅ Correção de agrupamento de SDRs usando `user_name` na chave de agrupamento
- ✅ Separação correta de SDRs com mesmo `user_id` mas nomes diferentes
- ✅ Cada SDR agora aparece em sua própria linha, mesmo compartilhando o mesmo ID

### Versão 1.1.0 (Dezembro 2024)

**Novas Funcionalidades:**
- ✅ Gráfico "Tempo Médio por Dia" (últimos 7 dias) com janela deslizante
- ✅ Endpoint `GET /api/metrics/daily-average` para dados diários
- ✅ Componente `AverageTimeChart.tsx` com Recharts
- ✅ Logs de diagnóstico detalhados em todo o backend
- ✅ Script PowerShell `criar_env.ps1` para facilitar configuração
- ✅ Documentação adicional (TESTAR_ENDPOINT_DAILY_AVERAGE.md, CONFIGURAR_ENV.md, RESOLVER_PORTA_3001.md)
- ✅ Layout ajustado: gráficos lado a lado em grid responsivo
- ✅ Remoção do gráfico duplicado antigo de PerformanceCharts

**Melhorias:**
- ✅ Logs de diagnóstico no `app.ts` para variáveis de ambiente
- ✅ Logs detalhados no `database.ts` para conexão Supabase
- ✅ Tratamento de erros melhorado com detecção de tipos específicos
- ✅ Validação de HTTPS na URL do Supabase
- ✅ Mensagens de erro mais descritivas

**Correções:**
- ✅ Removido gráfico duplicado "Tempo Médio por Dia" antigo
- ✅ Layout dos gráficos ajustado para grid de 2 colunas
- ✅ PerformanceCharts simplificado (apenas Evolução Semanal)

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

**Última atualização:** Dezembro 2024  
**Versão do documento:** 1.1.0  
**Status:** ✅ Completo e Atualizado

---

## 25. Novas Funcionalidades Implementadas (v1.1.0)

### 25.1 Gráfico Tempo Médio por Dia (Últimos 7 dias)

**Descrição:**
Novo gráfico de barras que mostra a evolução do SLA médio dos SDRs ao longo dos últimos 7 dias com janela deslizante.

**Características:**
- **Janela Deslizante:** Sempre mostra os últimos 7 dias incluindo o dia atual
- **Persistência Visual:** Um dia só desaparece quando fica mais velho que 7 dias
- **Fonte de Dados:** Calculado dinamicamente do Supabase baseado em `attended_at`
- **Atualização:** Automática a cada 60 segundos via TanStack Query
- **Visual:** Gráfico de barras azul (`#3b82f6`) com tooltip informativo

**Implementação Técnica:**

**Backend:**
- Endpoint: `GET /api/metrics/daily-average`
- Função: `getDailyAverage()` em `leadsService.ts`
- Query: Filtra `attended_at >= 6 dias atrás` (hoje + 6 dias = 7 dias)
- Agrupamento: Por data formatada "DD/MM"
- Ordenação: Por data crescente

**Frontend:**
- Componente: `AverageTimeChart.tsx`
- Biblioteca: Recharts (BarChart)
- Estado: TanStack Query com refetch automático
- Layout: Grid de 2 colunas lado a lado com PerformanceCharts

**Tipo TypeScript:**
```typescript
interface DailyAverage {
  date: string; // Formato "DD/MM"
  avg_sla: number; // Média arredondada em minutos
}
```

### 25.2 Logs de Diagnóstico Melhorados

**Implementação:**
- Logs detalhados no carregamento de variáveis de ambiente (`app.ts`)
- Logs de configuração do Supabase (`database.ts`)
- Logs em cada etapa das funções de serviço (`leadsService.ts`)
- Logs nas rotas para diagnóstico de erros (`metricsRoutes.ts`)

**Funcionalidades:**
- Verificação de variáveis de ambiente com mensagens claras
- Validação de URL HTTPS do Supabase
- Detecção automática de tipos de erro:
  - Erro de conexão (`fetch failed`)
  - Erro de autenticação (`Invalid API key`)
  - Erro de tabela (`relation does not exist`)
- Mensagens de erro descritivas com possíveis causas

### 25.3 Scripts de Configuração

**Script PowerShell:** `backend/criar_env.ps1`
- Cria arquivo `.env` automaticamente
- Preenche com valores padrão
- Facilita setup inicial do projeto

**Uso:**
```powershell
cd backend
powershell -ExecutionPolicy Bypass -File criar_env.ps1
```

### 25.4 Documentação Adicional

**Novos Documentos:**
1. **TESTAR_ENDPOINT_DAILY_AVERAGE.md** - Guia completo para testar o novo endpoint
2. **CONFIGURAR_ENV.md** - Instruções detalhadas de configuração
3. **RESOLVER_PORTA_3001.md** - Solução para erro de porta em uso

### 25.5 Melhorias de Layout

**Ajustes Visuais:**
- AverageTimeChart e PerformanceCharts em grid de 2 colunas
- Layout responsivo (empilhado em telas pequenas)
- Remoção de gráfico duplicado antigo
- PerformanceCharts simplificado (apenas Evolução Semanal)

---

## 26. Detalhes Técnicos das Novas Funcionalidades

### 26.1 Endpoint GET /api/metrics/daily-average

**Implementação Backend:**

**Arquivo:** `backend/src/services/leadsService.ts`

```typescript
export async function getDailyAverage(): Promise<DailyAverage[]> {
  // Calcula data de 6 dias atrás (hoje + 6 dias = 7 dias total)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);
  
  // Query no Supabase
  const { data: leads, error } = await supabase
    .from('leads_sla')
    .select('attended_at, sla_minutes')
    .gte('attended_at', sevenDaysAgoISO)
    .not('attended_at', 'is', null)
    .not('sla_minutes', 'is', null)
    .order('attended_at', { ascending: true });
  
  // Agrupa por data e calcula média
  // Retorna array ordenado por data
}
```

**Rota:** `backend/src/routes/metricsRoutes.ts`

```typescript
router.get('/daily-average', async (req: Request, res: Response) => {
  // Logs de diagnóstico
  // Tratamento de erros detalhado
  // Retorna dados formatados
});
```

**Logs de Diagnóstico:**
- Log ao receber requisição
- Log de cada etapa do processamento
- Log de erros com detalhes completos
- Detecção de tipos específicos de erro

### 26.2 Componente AverageTimeChart

**Arquivo:** `src/components/dashboard/AverageTimeChart.tsx`

**Características:**
- Usa TanStack Query para gerenciamento de estado
- Refetch automático a cada 60 segundos
- Estados de loading, error e empty tratados
- Tooltip customizado com formatação
- Suporte completo a tema claro/escuro
- Layout responsivo

**Integração:**
- Adicionado no `Index.tsx` após SDRRanking
- Posicionado em grid de 2 colunas com PerformanceCharts
- Usa função `fetchDailyAverage()` do `api.ts`

### 26.3 Logs de Diagnóstico

**Localização dos Logs:**

1. **app.ts:**
   - Log de carregamento de `.env`
   - Verificação de variáveis críticas
   - Avisos se variáveis não estão definidas

2. **database.ts:**
   - Log de configuração do Supabase
   - Verificação de URL e chave (parcialmente mascaradas)
   - Validação de HTTPS
   - Logs de criação do cliente

3. **leadsService.ts:**
   - Logs em cada etapa de `getDailyAverage()`
   - Logs de queries executadas
   - Logs de processamento de dados
   - Tratamento detalhado de erros

4. **metricsRoutes.ts:**
   - Log ao receber requisição
   - Log ao retornar dados
   - Logs de erros com stack trace completo

**Formato dos Logs:**
```
🔍 [DIAGNÓSTICO SUPABASE] Verificando configuração...
📋 SUPABASE_URL: https://vfxqwsleorpssx...
📋 SUPABASE_KEY: eyJhb...
🔒 URL usa HTTPS: ✅ Sim
🔌 Criando cliente Supabase...
✅ Cliente Supabase criado com sucesso!
```

### 26.4 Scripts de Configuração

**criar_env.ps1:**
- Script PowerShell para Windows
- Cria arquivo `.env` com valores padrão
- Facilita configuração inicial
- Pode ser executado automaticamente

**Conteúdo:**
```powershell
$envContent = @"
SUPABASE_URL=https://...
SUPABASE_KEY=...
PIPEDRIVE_API_TOKEN=...
PORT=3001
...
"@
$envContent | Out-File -FilePath ".env" -Encoding utf8
```

---

## 27. Arquivos Modificados na Versão 1.1.0

### Backend

**Novos Arquivos:**
- `backend/criar_env.ps1` - Script de configuração

**Arquivos Modificados:**
- `backend/src/app.ts` - Logs de diagnóstico de variáveis de ambiente
- `backend/src/config/database.ts` - Logs detalhados de conexão Supabase
- `backend/src/routes/metricsRoutes.ts` - Nova rota `/daily-average` com logs
- `backend/src/services/leadsService.ts` - Função `getDailyAverage()` com logs
- `backend/src/types/index.ts` - Tipo `DailyAverage` adicionado

### Frontend

**Novos Arquivos:**
- `src/components/dashboard/AverageTimeChart.tsx` - Novo componente de gráfico

**Arquivos Modificados:**
- `src/pages/Index.tsx` - Integração do novo componente e layout em grid
- `src/components/dashboard/PerformanceCharts.tsx` - Removido gráfico duplicado, layout simplificado
- `src/lib/api.ts` - Função `fetchDailyAverage()` adicionada

### Documentação

**Novos Arquivos:**
- `TESTAR_ENDPOINT_DAILY_AVERAGE.md` - Guia de testes
- `CONFIGURAR_ENV.md` - Instruções de configuração
- `RESOLVER_PORTA_3001.md` - Solução para porta em uso

**Arquivos Modificados:**
- `PRD_COMPLETO.md` - Atualizado com todas as novas funcionalidades (este arquivo)

---

## 28. Exemplos de Uso das Novas Funcionalidades

### 28.1 Testar Endpoint de Média Diária

**Via Navegador:**
```
http://localhost:3001/api/metrics/daily-average
```

**Via PowerShell:**
```powershell
Invoke-RestMethod http://localhost:3001/api/metrics/daily-average | ConvertTo-Json
```

**Resposta Esperada:**
```json
{
  "success": true,
  "data": [
    { "date": "05/12", "avg_sla": 12 },
    { "date": "06/12", "avg_sla": 15 },
    { "date": "07/12", "avg_sla": 18 }
  ],
  "timestamp": "2024-12-11T00:00:00.000Z"
}
```

### 28.2 Verificar Logs de Diagnóstico

Ao iniciar o backend, você verá:

```
🔧 [APP] Carregando variáveis de ambiente...
✅ [APP] Arquivo .env carregado com sucesso!
🔍 [APP] Verificando variáveis críticas:
   SUPABASE_URL: ✅ Definido
   SUPABASE_KEY: ✅ Definido

🔍 [DIAGNÓSTICO SUPABASE] Verificando configuração...
📋 SUPABASE_URL: https://vfxqwsleorpssx...
📋 SUPABASE_KEY: eyJhb...
🔒 URL usa HTTPS: ✅ Sim
🔌 Criando cliente Supabase...
✅ Cliente Supabase criado com sucesso!
```

### 28.3 Usar Script de Configuração

```powershell
cd backend
powershell -ExecutionPolicy Bypass -File criar_env.ps1
# Arquivo .env criado automaticamente
```

---

## 29. Troubleshooting das Novas Funcionalidades

### 29.1 Gráfico Não Aparece

**Possíveis Causas:**
- Backend não está rodando
- Endpoint retornando erro
- Sem dados nos últimos 7 dias

**Solução:**
1. Verificar logs do backend
2. Testar endpoint diretamente
3. Verificar se há leads com `attended_at` nos últimos 7 dias

### 29.2 Erro de Conexão com Supabase

**Logs Mostrarão:**
```
❌ [getDailyAverage] Erro do Supabase: {
  message: '...',
  code: '...'
}
🔴 [getDailyAverage] ERRO DE CONEXÃO detectado!
```

**Soluções:**
- Verificar `SUPABASE_URL` no `.env`
- Verificar `SUPABASE_KEY` no `.env`
- Verificar conexão de rede
- Verificar se Supabase está acessível

### 29.3 Porta 3001 em Uso

**Solução Rápida:**
```powershell
# Encontrar processo
netstat -ano | findstr :3001

# Matar processo (substituir PID)
taskkill /PID <PID> /F
```

**Ou usar script:**
Ver `RESOLVER_PORTA_3001.md` para soluções detalhadas.

---

## 30. Métricas e Performance das Novas Funcionalidades

### 30.1 Performance do Endpoint daily-average

**Query Otimizada:**
- Filtro aplicado no banco (`gte('attended_at', ...)`)
- Seleção apenas de campos necessários
- Ordenação no banco
- Processamento mínimo em memória

**Tempo de Resposta:**
- < 200ms para até 1000 leads
- < 500ms para até 5000 leads
- Escalável para volumes maiores

### 30.2 Cache e Atualização

**Frontend:**
- TanStack Query cacheia resultados
- Refetch automático a cada 60 segundos
- Invalidação automática em caso de erro

**Backend:**
- Sem cache específico (dados sempre atualizados)
- Query otimizada com índices do banco
- Processamento eficiente em memória

---

---

## 31. Jornada de Atendimento dos SDRs

### 31.1 Visão Geral

A **Jornada de Atendimento dos SDRs** é um módulo completo que registra e calcula a jornada de trabalho dos SDRs baseado na movimentação de leads do Pipedrive. O sistema identifica quando cada SDR iniciou e finalizou suas atividades, dividindo o dia em turnos (manhã e tarde) e fornecendo métricas detalhadas.

### 31.2 Objetivo

- **Monitorar jornada de trabalho:** Identificar quando cada SDR está ativo
- **Calcular turnos:** Dividir o dia em manhã (06h-12h) e tarde (13h-18h)
- **Análise temporal:** Entender padrões de trabalho e produtividade
- **Filtro por data:** Visualizar jornada de dias específicos

### 31.3 Regras de Negócio

#### 31.3.1 Quando um Evento é Registrado

Um evento de jornada é registrado **APENAS** quando:

✅ **Lead é movido do pipeline principal "SDR" → Pipeline individual "NOME - SDR"**
- Isso significa que o lead estava **PENDENTE** e foi **ATENDIDO** por um SDR
- O evento é registrado no momento exato dessa movimentação
- O `user_id` do webhook identifica qual SDR fez a ação

✅ **Lead é criado diretamente em pipeline individual** (caso raro)
- Se um lead for criado já no pipeline individual, também é registrado

#### 31.3.2 O que NÃO é registrado

❌ Mudanças de stage dentro do pipeline principal "SDR"
- Exemplo: Lead mudando de "TEM PERFIL" para "PERFIL MENOR" dentro do pipeline "SDR"
- **Motivo:** O lead ainda está pendente, não foi atendido

❌ Mudanças dentro de pipelines individuais
- Exemplo: Lead mudando de stage dentro do pipeline "JOÃO - SDR"
- **Motivo:** O lead já foi atendido, mudanças internas não contam

#### 31.3.3 Turnos de Trabalho

O sistema divide o dia em **2 turnos** (horário de São Paulo):

**🌅 Turno da Manhã: 06:00 às 12:00**
- Primeira ação: Timestamp da primeira movimentação de lead neste horário
- Última ação: Timestamp da última movimentação neste horário
- Total de ações: Quantidade de leads atendidos neste turno
- Duração: Calculada automaticamente (última ação - primeira ação)

**🌇 Turno da Tarde: 13:00 às 18:00**
- Primeira ação: Timestamp da primeira movimentação de lead neste horário
- Última ação: Timestamp da última movimentação neste horário
- Total de ações: Quantidade de leads atendidos neste turno
- Duração: Calculada automaticamente (última ação - primeira ação)

**Nota:** Eventos fora dos horários de trabalho (06-12h e 13-18h) não são contabilizados nos turnos, mas contam no `total_actions`.

#### 31.3.4 Agrupamento

Os dados são agrupados por:
- **SDR** (`user_id` do Pipedrive)
- **Nome do SDR** (`user_name` do Pipedrive) - **CRÍTICO**: Usado para separar SDRs com mesmo `user_id`
- **Data** (dia civil em horário de São Paulo, formato YYYY-MM-DD)

**Chave de Agrupamento:**
- Quando `user_name` está disponível: `${user_id}|${user_name}|${date}`
- Quando `user_name` não está disponível: `${user_id}|${date}`

**Importante:** Esta lógica garante que SDRs com o mesmo `user_id` mas nomes diferentes (ex: ALEXANDRE, LUANA, LUCAS) apareçam em linhas separadas na tabela.

### 31.4 Estrutura de Dados

#### 31.4.1 Tabela: `sdr_attendance_events`

```sql
CREATE TABLE sdr_attendance_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(100) NOT NULL,
    user_name VARCHAR(255),
    timestamp TIMESTAMPTZ NOT NULL,
    deal_id VARCHAR(100) NOT NULL,
    event_type VARCHAR(50) DEFAULT 'attended',
    pipeline_id VARCHAR(100),
    stage_id VARCHAR(100),
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Índices:**
- `idx_sdr_attendance_user_id` - Otimiza busca por SDR
- `idx_sdr_attendance_timestamp` - Otimiza busca por data
- `idx_sdr_attendance_deal_id` - Otimiza busca por lead
- `idx_sdr_attendance_user_date` - Otimiza busca por SDR e data
- `idx_sdr_attendance_user_timestamp` - Índice composto

#### 31.4.2 Interface: `SdrDailyMetrics`

```typescript
interface SdrDailyMetrics {
  sdr_id: string;                   // ID do SDR
  sdr_name?: string;                // Nome do SDR
  date: string;                     // YYYY-MM-DD (timezone SP)
  morning: {
    first_action: string | null;    // ISO 8601 UTC
    last_action: string | null;     // ISO 8601 UTC
    action_count: number;
  };
  afternoon: {
    first_action: string | null;    // ISO 8601 UTC
    last_action: string | null;     // ISO 8601 UTC
    action_count: number;
  };
  total_actions: number;
}
```

### 31.5 APIs e Endpoints

#### 31.5.1 GET /api/metrics/sdr-attendance

**Descrição:** Retorna jornada de atendimento dos SDRs

**Query Parameters:**
- `sdr_id` (opcional): ID do SDR específico
- `date` (opcional): Data no formato YYYY-MM-DD (timezone São Paulo)
- `start_date` (opcional): Data inicial para range
- `end_date` (opcional): Data final para range

**Exemplos:**

```bash
# Buscar todas as métricas
GET /api/metrics/sdr-attendance

# Buscar métricas de um SDR específico
GET /api/metrics/sdr-attendance?sdr_id=123

# Buscar métricas de uma data específica
GET /api/metrics/sdr-attendance?date=2024-12-11

# Buscar métricas de um SDR em uma data específica
GET /api/metrics/sdr-attendance?sdr_id=123&date=2024-12-11
```

**Resposta:**

```json
{
  "success": true,
  "data": [
    {
      "sdr_id": "123",
      "sdr_name": "João Silva",
      "date": "2024-12-11",
      "morning": {
        "first_action": "2024-12-11T11:30:00Z",
        "last_action": "2024-12-11T14:15:00Z",
        "action_count": 3
      },
      "afternoon": {
        "first_action": "2024-12-11T16:30:00Z",
        "last_action": "2024-12-11T20:45:00Z",
        "action_count": 2
      },
      "total_actions": 5
    }
  ],
  "timestamp": "2024-12-11T18:51:28.089Z"
}
```

**Tratamento de Timezone:**
- A data selecionada é interpretada como horário de São Paulo
- O backend converte automaticamente para UTC para buscar no banco
- Os timestamps retornados são em UTC (ISO 8601)
- O frontend converte para horário de São Paulo para exibição

### 31.6 Interface do Usuário

#### 31.6.1 Componente: `SdrAttendanceJourney`

**Localização:** `src/components/dashboard/SdrAttendanceJourney.tsx`

**Funcionalidades:**

1. **Cards de Estatísticas Rápidas:**
   - **SDRs Ativos:** Total de SDRs únicos com eventos
   - **Total de Ações:** Soma de todas as ações registradas
   - **Dias Registrados:** Total de dias únicos com eventos

2. **Tabela de Jornada:**
   - Colunas: SDR, Data, Manhã, Tarde, Total
   - Badges coloridos para turnos (amarelo para manhã, laranja para tarde)
   - Exibe horários formatados (primeira ação - última ação)
   - Mostra quantidade de ações e duração do turno

3. **Seletor de Data:**
   - Botão de calendário no ícone do header (sempre acessível)
   - Funciona em todos os estados (loading, erro, sem dados, com dados)
   - Permite selecionar qualquer data (futuras desabilitadas)
   - Mostra indicador visual quando há filtro ativo
   - Botão "Limpar" para remover filtro

4. **Estados:**
   - **Loading:** Spinner com mensagem
   - **Erro:** Mensagem de erro com ícone
   - **Sem dados:** Mensagem informativa com opções de ação
   - **Com dados:** Tabela completa com métricas

#### 31.6.2 Características Visuais

- **Cards de turnos:** Tamanho reduzido para melhor estética
- **Badges coloridos:** Amarelo (manhã) e laranja (tarde)
- **Horários ordenados:** Primeira ação sempre aparece primeiro
- **Texto padronizado:** Sempre "ações" (sem plural condicional)
- **Layout responsivo:** Adapta-se a diferentes tamanhos de tela
- **Tema dark/light:** Suporta ambos os temas

### 31.7 Fluxos de Dados

#### 31.7.1 Registro de Evento

```
1. Webhook do Pipedrive recebe evento (deal.added ou deal.updated)
2. Handler verifica se lead foi movido de "SDR" → "NOME - SDR"
3. Se sim, chama createAttendanceEvent()
4. Evento é salvo na tabela sdr_attendance_events
5. Log de confirmação é gerado
```

#### 31.7.2 Cálculo de Métricas

```
1. Frontend faz requisição para /api/metrics/sdr-attendance
2. Backend busca eventos do banco (com filtros se aplicável)
3. Eventos são convertidos para formato PipedriveFlowEvent
4. Módulo SdrAttendanceCalculator processa eventos:
   - Converte timestamps UTC para horário de São Paulo
   - Classifica por turno (manhã/tarde)
   - Agrupa por SDR e data
   - Calcula primeira/última ação e contagem
5. Métricas são retornadas ao frontend
6. Frontend exibe na tabela formatada
```

#### 31.7.3 Filtro por Data

```
1. Usuário clica no ícone de calendário no header
2. Calendário abre (Popover)
3. Usuário seleciona uma data
4. Data é convertida para YYYY-MM-DD
5. Requisição é feita com parâmetro ?date=YYYY-MM-DD
6. Backend converte data SP para range UTC
7. Busca eventos no range UTC correspondente
8. Filtra resultados pela data em SP
9. Retorna métricas filtradas
10. Frontend exibe apenas dados da data selecionada
```

### 31.8 Módulos e Serviços

#### 31.8.1 Módulo: `SdrAttendanceCalculator`

**Localização:** `backend/src/modules/SdrAttendanceCalculator.ts`

**Funções Principais:**
- `calculateSdrAttendance()` - Calcula métricas para todos os SDRs
- `calculateSdrAttendanceForSdr()` - Calcula métricas para um SDR específico
- `calculateSdrAttendanceForDate()` - Calcula métricas para uma data específica
- `calculateSdrAttendanceForSdrAndDate()` - Calcula métricas para SDR e data

**Funções Auxiliares:**
- `extractDateInSaoPaulo()` - Extrai data em timezone SP
- `extractHourInSaoPaulo()` - Extrai hora em timezone SP
- `isMorningShift()` - Verifica se está no turno da manhã
- `isAfternoonShift()` - Verifica se está no turno da tarde
- `getOrderedTimes()` - Garante ordem correta dos horários

#### 31.8.2 Serviço: `sdrAttendanceService`

**Localização:** `backend/src/services/sdrAttendanceService.ts`

**Funções Principais:**
- `createAttendanceEvent()` - Registra novo evento
- `getAttendanceEvents()` - Busca eventos com filtros
- `calculateAttendanceMetrics()` - Calcula métricas gerais
- `calculateAttendanceMetricsForSdr()` - Calcula métricas por SDR
- `calculateAttendanceMetricsForDate()` - Calcula métricas por data
- `calculateAttendanceMetricsForSdrAndDate()` - Calcula métricas por SDR e data
- `convertSaoPauloDateToUtcRange()` - Converte data SP para range UTC

### 31.9 Integração com Webhook

#### 31.9.1 Handler: `pipedriveHandler.ts`

**Localização:** `backend/src/webhooks/pipedriveHandler.ts`

**Integração:**
- `handleDealAdded()` - Registra evento quando lead é criado já atendido
- `handleDealUpdated()` - Registra evento quando lead é movido de pendente para atendido

**Lógica:**
```typescript
// Apenas registra quando:
if (!existingLead.attended_at && isIndividualPipeline && userId) {
  await createAttendanceEvent({
    user_id: userId.toString(),
    user_name: sdrName,
    timestamp: updateTime,
    deal_id: dealIdStr,
    event_type: 'attended',
    // ...
  });
}
```

### 31.10 Configuração e Setup

#### 31.10.1 Migração do Banco de Dados

**Arquivo:** `backend/migrations/003_create_sdr_attendance_events.sql`

**Como executar:**
1. Acesse o Supabase Dashboard
2. Vá em SQL Editor
3. Cole o conteúdo do arquivo `EXECUTAR_NO_SUPABASE.sql`
4. Execute o script
5. Verifique se a tabela foi criada

**Script de verificação:**
```sql
-- Verificar se a tabela existe
SELECT * FROM information_schema.tables 
WHERE table_name = 'sdr_attendance_events';

-- Ver eventos registrados
SELECT * FROM sdr_attendance_events 
ORDER BY timestamp DESC 
LIMIT 10;
```

#### 31.10.2 Variáveis de Ambiente

Nenhuma variável adicional é necessária. O módulo usa as mesmas variáveis do sistema principal:
- `SUPABASE_URL`
- `SUPABASE_KEY`

### 31.11 Troubleshooting

#### 31.11.1 "Nenhum dado de jornada disponível"

**Possíveis Causas:**
- Tabela `sdr_attendance_events` não foi criada
- Nenhum evento foi registrado ainda
- Filtro de data não retorna resultados

**Soluções:**
1. Execute a migração SQL no Supabase
2. Verifique se há eventos na tabela usando `VERIFICAR_JORNADA.sql`
3. Mova um lead do pipeline "SDR" para um pipeline individual no Pipedrive
4. Verifique os logs do backend para erros

#### 31.11.2 Eventos não aparecem

**Verifique:**
1. Se o `user_id` está presente no payload do webhook
2. Se a tabela foi criada corretamente
3. Se o backend está processando os webhooks
4. Se há erros nos logs do backend
5. Se o lead foi realmente movido de "SDR" para "NOME - SDR"

#### 31.11.3 Filtro de data não funciona

**Possíveis Causas:**
- Problema de timezone na conversão
- Data selecionada não tem eventos
- Range UTC incorreto

**Soluções:**
1. Verifique os logs do backend para ver o range UTC gerado
2. Teste com uma data que você sabe que tem eventos
3. Limpe o filtro e verifique se aparecem dados sem filtro

#### 31.11.4 Horários aparecem invertidos

**Solução:**
- Já corrigido no código: função `getOrderedTimes()` garante ordem correta
- Backend também garante que `first_action` seja sempre o menor timestamp

### 31.12 Scripts Auxiliares

#### 31.12.1 EXECUTAR_NO_SUPABASE.sql

Script completo para criar a tabela e índices necessários.

#### 31.12.2 VERIFICAR_JORNADA.sql

Scripts de verificação para:
- Contar eventos registrados
- Ver últimos eventos
- Contar eventos por SDR
- Verificar eventos de hoje

#### 31.12.3 TESTAR_ENDPOINT.md

Documentação sobre como testar o endpoint da API.

### 31.13 Performance

#### 31.13.1 Otimizações

- **Índices no banco:** Consultas otimizadas por SDR, data e timestamp
- **Filtragem no banco:** Range UTC calculado antes da query
- **Processamento eficiente:** Agrupamento em memória após busca filtrada
- **Cache no frontend:** TanStack Query cacheia resultados

#### 31.13.2 Tempo de Resposta

- **Sem filtros:** < 300ms para até 1000 eventos
- **Com filtro de data:** < 200ms
- **Com filtro de SDR:** < 250ms
- **Com ambos os filtros:** < 150ms

### 31.14 Atualização Automática

- **Frontend:** Atualiza automaticamente a cada 60 segundos
- **Backend:** Processa eventos em tempo real via webhook
- **Sem necessidade de refresh:** Novos eventos aparecem automaticamente

### 31.15 Documentação Adicional

- **COMO_FUNCIONA_JORNADA_ATENDIMENTO.md:** Guia completo sobre funcionamento
- **backend/INTEGRACAO_SDR_ATTENDANCE.md:** Documentação técnica de integração
- **backend/src/modules/README_SdrAttendanceCalculator.md:** Documentação do módulo

---

## ✅ FIM DO PRD ATUALIZADO

Este documento contém TODAS as informações do projeto Lead Speed Monitor, incluindo todas as funcionalidades implementadas até Dezembro 2024.

**Última atualização:** Dezembro 2024  
**Versão do documento:** 1.3.0  
**Status:** ✅ Completo e Atualizado com TODAS as funcionalidades

**Funcionalidades Principais (v1.3.0):**
- ✅ Sistema completo de notificações (toasts + histórico)
- ✅ Ranking de SDRs com filtros temporais e score combinado
- ✅ Jornada de Atendimento dos SDRs com turnos
- ✅ Timeline com badges de perfil
- ✅ Card "Melhor SDR" usando ranking mensal
- ✅ Correções nos cards de Leads Pendentes e Importantes

