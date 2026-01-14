# Como Testar o Endpoint de Jornada de Atendimento

## 1. Verificar se o Backend está Rodando

O backend deve estar rodando na porta 3001.

## 2. Testar o Endpoint

### Opção A: Usando o Navegador
Abra no navegador:
```
http://localhost:3001/api/metrics/sdr-attendance
```

### Opção B: Usando PowerShell
```powershell
# Testar endpoint geral
Invoke-RestMethod -Uri "http://localhost:3001/api/metrics/sdr-attendance" -Method Get | ConvertTo-Json

# Testar com filtro de SDR específico
Invoke-RestMethod -Uri "http://localhost:3001/api/metrics/sdr-attendance?sdr_id=123" -Method Get | ConvertTo-Json

# Testar com data específica
Invoke-RestMethod -Uri "http://localhost:3001/api/metrics/sdr-attendance?date=2024-12-11" -Method Get | ConvertTo-Json
```

### Opção C: Usando curl (se tiver instalado)
```bash
curl http://localhost:3001/api/metrics/sdr-attendance
```

## 3. Resposta Esperada

### Se houver dados:
```json
{
  "success": true,
  "data": [
    {
      "sdr_id": "123",
      "sdr_name": "João",
      "date": "2024-12-11",
      "morning": {
        "first_action": "2024-12-11T08:30:00Z",
        "last_action": "2024-12-11T10:15:00Z",
        "action_count": 2
      },
      "afternoon": {
        "first_action": "2024-12-11T14:30:00Z",
        "last_action": "2024-12-11T17:45:00Z",
        "action_count": 2
      },
      "total_actions": 4
    }
  ],
  "timestamp": "2024-12-11T..."
}
```

### Se não houver dados:
```json
{
  "success": true,
  "data": [],
  "timestamp": "2024-12-11T..."
}
```

## 4. Verificar Logs do Backend

Se o backend estiver rodando no terminal, você deve ver logs como:
- `📥 [ROTA] GET /api/metrics/sdr-attendance - Requisição recebida`
- `✅ Métricas retornadas com sucesso: X registros`

## 5. Problemas Comuns

### Erro 404 (Not Found)
- Verifique se o backend está rodando
- Verifique se a rota está correta: `/api/metrics/sdr-attendance`

### Erro 500 (Internal Server Error)
- Verifique os logs do backend
- Verifique se a tabela `sdr_attendance_events` existe no Supabase
- Verifique se as variáveis de ambiente estão configuradas

### Array vazio (sem dados)
- Verifique se há eventos na tabela usando o script `VERIFICAR_JORNADA.sql`
- Verifique se novos leads foram atendidos após criar a tabela
- Lembre-se: apenas eventos NOVOS são registrados (não retroativos)



