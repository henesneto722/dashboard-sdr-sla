# Módulo de Cálculo de Jornada de Atendimento dos SDRs

Este módulo calcula a jornada de atendimento dos SDRs baseada na movimentação de leads no Pipedrive.

## 📋 Funcionalidades

- ✅ Calcula primeira e última ação em cada turno (Manhã: 06-12h, Tarde: 13-18h)
- ✅ Agrupa métricas por SDR e Data
- ✅ Converte timestamps UTC para timezone America/Sao_Paulo
- ✅ Filtra eventos fora dos horários de trabalho
- ✅ Fornece funções auxiliares para formatação e cálculos

## 🚀 Como Usar

### Exemplo Básico

```typescript
import { calculateSdrAttendance, PipedriveFlowEvent } from './modules/SdrAttendanceCalculator.js';

// Exemplo de eventos do Pipedrive
const events: PipedriveFlowEvent[] = [
  {
    user_id: 123,
    user_name: 'João Silva',
    timestamp: '2024-01-15T08:30:00Z', // 08:30 em UTC = 05:30 em SP (não conta)
    deal_id: 456,
    event_type: 'stage_change'
  },
  {
    user_id: 123,
    user_name: 'João Silva',
    timestamp: '2024-01-15T14:00:00Z', // 14:00 em UTC = 11:00 em SP (manhã)
    deal_id: 789,
    event_type: 'stage_change'
  },
  {
    user_id: 123,
    user_name: 'João Silva',
    timestamp: '2024-01-15T16:30:00Z', // 16:30 em UTC = 13:30 em SP (tarde)
    deal_id: 101,
    event_type: 'stage_change'
  },
  {
    user_id: 123,
    user_name: 'João Silva',
    timestamp: '2024-01-15T21:00:00Z', // 21:00 em UTC = 18:00 em SP (tarde - última)
    deal_id: 202,
    event_type: 'stage_change'
  },
];

// Calcular métricas
const metrics = calculateSdrAttendance(events);

console.log(metrics);
// [
//   {
//     sdr_id: '123',
//     sdr_name: 'João Silva',
//     date: '2024-01-15',
//     morning: {
//       first_action: '2024-01-15T14:00:00Z',
//       last_action: '2024-01-15T14:00:00Z',
//       action_count: 1
//     },
//     afternoon: {
//       first_action: '2024-01-15T16:30:00Z',
//       last_action: '2024-01-15T21:00:00Z',
//       action_count: 2
//     },
//     total_actions: 3
//   }
// ]
```

### Filtrar por SDR Específico

```typescript
import { calculateSdrAttendanceForSdr } from './modules/SdrAttendanceCalculator.js';

const sdrMetrics = calculateSdrAttendanceForSdr(events, 123);
// Retorna apenas métricas do SDR com ID 123
```

### Filtrar por Data Específica

```typescript
import { calculateSdrAttendanceForDate } from './modules/SdrAttendanceCalculator.js';

const dateMetrics = calculateSdrAttendanceForDate(events, '2024-01-15');
// Retorna apenas métricas do dia 2024-01-15
```

### Filtrar por SDR e Data

```typescript
import { calculateSdrAttendanceForSdrAndDate } from './modules/SdrAttendanceCalculator.js';

const specificMetrics = calculateSdrAttendanceForSdrAndDate(events, 123, '2024-01-15');
// Retorna métricas do SDR 123 no dia 2024-01-15, ou null se não houver dados
```

### Formatação de Timestamps

```typescript
import { formatTimestampToSaoPaulo } from './modules/SdrAttendanceCalculator.js';

const formatted = formatTimestampToSaoPaulo('2024-01-15T14:00:00Z');
// Retorna: "15/01/2024 11:00" (convertido para horário de São Paulo)
```

### Calcular Duração do Turno

```typescript
import { calculateShiftDuration } from './modules/SdrAttendanceCalculator.js';

const duration = calculateShiftDuration(
  '2024-01-15T14:00:00Z', // primeira ação
  '2024-01-15T21:00:00Z'  // última ação
);
// Retorna: 420 (minutos) = 7 horas
```

## 🔌 Integração com o Sistema Existente

### Exemplo de Integração no Handler de Webhook

```typescript
// Em src/webhooks/pipedriveHandler.ts ou similar

import { calculateSdrAttendance, PipedriveFlowEvent } from '../modules/SdrAttendanceCalculator.js';

// Quando receber um evento de atualização de deal
export async function handleDealUpdated(...) {
  // ... código existente ...
  
  // Criar evento de flow para o calculador
  const flowEvent: PipedriveFlowEvent = {
    user_id: userId,
    user_name: sdrName,
    timestamp: updateTime, // ISO 8601 UTC
    deal_id: dealId,
    event_type: 'stage_change',
  };
  
  // Se você tiver uma lista de eventos acumulados, pode calcular:
  // const metrics = calculateSdrAttendance([flowEvent, ...otherEvents]);
}
```

### Exemplo de Endpoint de API

```typescript
// Em src/routes/metricsRoutes.ts ou similar

import { calculateSdrAttendance, PipedriveFlowEvent } from '../modules/SdrAttendanceCalculator.js';

router.get('/sdr-attendance', async (req: Request, res: Response) => {
  try {
    // Buscar eventos do banco de dados ou API do Pipedrive
    // Assumindo que você tem uma função para buscar histórico
    const events: PipedriveFlowEvent[] = await fetchPipedriveFlowEvents();
    
    // Calcular métricas
    const metrics = calculateSdrAttendance(events);
    
    res.json({
      success: true,
      data: metrics,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    });
  }
});
```

## 📊 Estrutura de Dados

### PipedriveFlowEvent

```typescript
interface PipedriveFlowEvent {
  user_id: number | string;        // ID do SDR (obrigatório)
  user_name?: string;               // Nome do SDR (opcional)
  timestamp: string;                // ISO 8601 UTC (obrigatório)
  deal_id: number | string;         // ID do deal/lead
  event_type?: string;              // Tipo de evento (ex: 'stage_change')
  metadata?: Record<string, unknown>; // Dados adicionais
}
```

### SdrDailyMetrics

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

## ⚙️ Regras de Negócio

1. **Turno da Manhã**: 06:00 às 12:00 (horário de São Paulo)
2. **Turno da Tarde**: 13:00 às 18:00 (horário de São Paulo)
3. **Timezone**: Todos os timestamps de entrada são assumidos como UTC e convertidos para America/Sao_Paulo
4. **Filtragem**: Eventos fora dos horários de trabalho (06-12h e 13-18h) não são contabilizados nos turnos, mas contam no `total_actions`
5. **Agrupamento**: Métricas são agrupadas por SDR (`user_id`) e Data (dia civil em SP)

## 🧪 Testes

Para testar o módulo, você pode criar eventos de exemplo:

```typescript
const testEvents: PipedriveFlowEvent[] = [
  {
    user_id: 1,
    user_name: 'Test SDR',
    timestamp: new Date('2024-01-15T09:00:00Z').toISOString(), // Manhã
    deal_id: 1,
  },
  {
    user_id: 1,
    user_name: 'Test SDR',
    timestamp: new Date('2024-01-15T15:00:00Z').toISOString(), // Tarde
    deal_id: 2,
  },
];

const result = calculateSdrAttendance(testEvents);
console.log(JSON.stringify(result, null, 2));
```

## 📝 Notas Importantes

- O módulo **NÃO** altera arquivos existentes
- O módulo **NÃO** depende de bibliotecas externas (usa apenas APIs nativas do JavaScript)
- Os timestamps retornados são mantidos em UTC (ISO 8601) para consistência
- A conversão de timezone é feita apenas para classificação e agrupamento
- Eventos com `user_id` ou `timestamp` inválidos são ignorados com um warning



