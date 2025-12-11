# Integração do Módulo de Jornada de Atendimento dos SDRs

Este documento descreve como o módulo `SdrAttendanceCalculator` foi integrado ao sistema.

## 📋 O que foi implementado

### 1. Banco de Dados
- ✅ Tabela `sdr_attendance_events` criada para armazenar eventos de movimentação
- ✅ Índices otimizados para consultas por SDR e data
- ✅ RLS (Row Level Security) configurado

### 2. Serviço
- ✅ `sdrAttendanceService.ts` criado com funções CRUD e cálculo de métricas
- ✅ Integração com o módulo `SdrAttendanceCalculator`

### 3. Webhook Handler
- ✅ Captura automática de eventos quando deals são criados/atualizados
- ✅ Registro de eventos de atendimento e movimentação de stages

### 4. API Endpoint
- ✅ `GET /api/metrics/sdr-attendance` criado
- ✅ Suporta filtros por SDR, data, período

### 5. Tipos TypeScript
- ✅ Interface `SdrDailyMetrics` adicionada ao `types/index.ts`

## 🚀 Como usar

### Passo 1: Executar Migração do Banco de Dados

Execute o SQL de migração no Supabase:

```sql
-- Arquivo: backend/migrations/003_create_sdr_attendance_events.sql
```

**Como executar:**
1. Acesse o Supabase Dashboard
2. Vá em SQL Editor
3. Cole o conteúdo do arquivo `003_create_sdr_attendance_events.sql`
4. Execute o script

### Passo 2: Verificar Integração

O sistema já está configurado para capturar eventos automaticamente quando:
- Um deal é criado no Pipedrive
- Um deal é atualizado (mudança de stage ou pipeline)
- Um lead é marcado como atendido

### Passo 3: Testar o Endpoint

```bash
# Buscar todas as métricas
curl http://localhost:3001/api/metrics/sdr-attendance

# Buscar métricas de um SDR específico
curl http://localhost:3001/api/metrics/sdr-attendance?sdr_id=123

# Buscar métricas de uma data específica
curl http://localhost:3001/api/metrics/sdr-attendance?date=2024-01-15

# Buscar métricas de um SDR em uma data específica
curl http://localhost:3001/api/metrics/sdr-attendance?sdr_id=123&date=2024-01-15

# Buscar métricas de um período
curl http://localhost:3001/api/metrics/sdr-attendance?start_date=2024-01-01T00:00:00Z&end_date=2024-01-31T23:59:59Z
```

## 📊 Estrutura de Resposta

### Exemplo de Resposta

```json
{
  "success": true,
  "data": [
    {
      "sdr_id": "123",
      "sdr_name": "João Silva",
      "date": "2024-01-15",
      "morning": {
        "first_action": "2024-01-15T11:00:00Z",
        "last_action": "2024-01-15T14:30:00Z",
        "action_count": 3
      },
      "afternoon": {
        "first_action": "2024-01-15T16:00:00Z",
        "last_action": "2024-01-15T21:00:00Z",
        "action_count": 5
      },
      "total_actions": 8
    }
  ],
  "timestamp": "2024-01-15T10:00:00.000Z"
}
```

## 🔍 Como Funciona

### Captura de Eventos

Quando um webhook do Pipedrive é recebido:

1. **Deal Criado (`added`)**:
   - Se está no funil principal "SDR" → Registra evento de movimentação
   - Se está no funil individual "NOME - SDR" → Registra evento de atendimento

2. **Deal Atualizado (`updated`)**:
   - Se mudou para funil individual → Registra evento de atendimento
   - Se mudou de stage no funil principal → Registra evento de movimentação

### Cálculo de Métricas

O módulo `SdrAttendanceCalculator` processa os eventos e calcula:

- **Turno da Manhã (06:00-12:00 SP)**:
  - Primeira ação do turno
  - Última ação do turno
  - Total de ações

- **Turno da Tarde (13:00-18:00 SP)**:
  - Primeira ação do turno
  - Última ação do turno
  - Total de ações

- **Total do Dia**: Soma de todas as ações

### Timezone

- Todos os timestamps são armazenados em UTC
- A conversão para America/Sao_Paulo é feita durante o cálculo
- Os horários dos turnos são baseados no horário de São Paulo

## 🛠️ Manutenção

### Limpar Eventos Antigos

Para limpar eventos com mais de 90 dias:

```typescript
import { cleanOldEvents } from './services/sdrAttendanceService.js';

// Limpar eventos com mais de 90 dias
await cleanOldEvents(90);
```

### Verificar Eventos no Banco

```sql
-- Ver todos os eventos
SELECT * FROM sdr_attendance_events ORDER BY timestamp DESC LIMIT 100;

-- Contar eventos por SDR
SELECT user_id, user_name, COUNT(*) as total_events
FROM sdr_attendance_events
GROUP BY user_id, user_name
ORDER BY total_events DESC;

-- Ver eventos de hoje
SELECT * FROM sdr_attendance_events
WHERE DATE(timestamp AT TIME ZONE 'America/Sao_Paulo') = CURRENT_DATE
ORDER BY timestamp DESC;
```

## 📝 Notas Importantes

1. **Eventos são registrados automaticamente**: Não é necessário fazer chamadas manuais
2. **Não crítico se falhar**: Se o registro de evento falhar, o sistema continua funcionando normalmente (apenas loga um warning)
3. **Performance**: Os índices foram otimizados para consultas rápidas
4. **Retenção**: Por padrão, eventos são mantidos indefinidamente. Use `cleanOldEvents()` para limpeza periódica

## 🐛 Troubleshooting

### Problema: Endpoint retorna array vazio

**Possíveis causas:**
1. Tabela não foi criada no banco → Execute a migração SQL
2. Nenhum evento foi capturado ainda → Aguarde webhooks do Pipedrive
3. Filtros muito restritivos → Verifique os parâmetros da query

**Solução:**
```sql
-- Verificar se a tabela existe
SELECT * FROM information_schema.tables WHERE table_name = 'sdr_attendance_events';

-- Verificar se há eventos
SELECT COUNT(*) FROM sdr_attendance_events;
```

### Problema: Eventos não estão sendo registrados

**Verificar:**
1. Webhooks do Pipedrive estão configurados corretamente?
2. O `user_id` está presente no payload do webhook?
3. Logs do backend mostram erros?

**Debug:**
- Verifique os logs do backend ao receber webhooks
- Procure por mensagens como "📝 Evento de atendimento registrado"
- Se houver erros, verifique a conexão com o Supabase

## 📚 Arquivos Relacionados

- `backend/src/modules/SdrAttendanceCalculator.ts` - Módulo de cálculo
- `backend/src/services/sdrAttendanceService.ts` - Serviço de gerenciamento
- `backend/src/routes/metricsRoutes.ts` - Endpoint de API
- `backend/src/webhooks/pipedriveHandler.ts` - Integração com webhooks
- `backend/migrations/003_create_sdr_attendance_events.sql` - Migração do banco

