# 🧪 Como Testar o Endpoint `/api/metrics/daily-average`

## 📋 Pré-requisitos

1. **Backend rodando:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Banco de dados configurado:**
   - Supabase conectado
   - Tabela `leads_sla` criada
   - Dados de exemplo (opcional, mas recomendado)

---

## 🧪 Métodos de Teste

### 1. **Teste via Navegador (Mais Simples)**

Abra seu navegador e acesse:

**Local:**
```
http://localhost:3001/api/metrics/daily-average
```

**Produção (Render):**
```
https://dashboard-sdr-sla.onrender.com/api/metrics/daily-average
```

**Resposta esperada:**
```json
{
  "success": true,
  "data": [
    {
      "date": "10/12",
      "avg_sla": 15
    },
    {
      "date": "11/12",
      "avg_sla": 12
    },
    {
      "date": "12/12",
      "avg_sla": 18
    }
  ],
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

---

### 2. **Teste via cURL (Terminal)**

**Windows (PowerShell):**
```powershell
curl http://localhost:3001/api/metrics/daily-average
```

**Windows (CMD):**
```cmd
curl http://localhost:3001/api/metrics/daily-average
```

**Linux/Mac:**
```bash
curl http://localhost:3001/api/metrics/daily-average
```

**Com formatação JSON (requer `jq` instalado):**
```bash
curl http://localhost:3001/api/metrics/daily-average | jq
```

**Com mais detalhes:**
```bash
curl -v http://localhost:3001/api/metrics/daily-average
```

---

### 3. **Teste via PowerShell (Windows)**

```powershell
# Teste básico
Invoke-RestMethod -Uri "http://localhost:3001/api/metrics/daily-average" -Method Get

# Com formatação
Invoke-RestMethod -Uri "http://localhost:3001/api/metrics/daily-average" -Method Get | ConvertTo-Json -Depth 10
```

---

### 4. **Teste via Postman**

1. Abra o Postman
2. Crie uma nova requisição:
   - **Método:** `GET`
   - **URL:** `http://localhost:3001/api/metrics/daily-average`
3. Clique em **Send**
4. Verifique a resposta JSON

---

### 5. **Teste via Insomnia**

1. Abra o Insomnia
2. Crie uma nova requisição:
   - **Método:** `GET`
   - **URL:** `http://localhost:3001/api/metrics/daily-average`
3. Clique em **Send**
4. Verifique a resposta JSON

---

### 6. **Teste via Node.js (Script)**

Crie um arquivo `test-endpoint.js`:

```javascript
const fetch = require('node-fetch');

async function testEndpoint() {
  try {
    const response = await fetch('http://localhost:3001/api/metrics/daily-average');
    const data = await response.json();
    
    console.log('✅ Status:', response.status);
    console.log('📊 Dados:', JSON.stringify(data, null, 2));
    
    if (data.success && Array.isArray(data.data)) {
      console.log(`\n📈 Total de dias: ${data.data.length}`);
      data.data.forEach(item => {
        console.log(`  - ${item.date}: ${item.avg_sla} min`);
      });
    }
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

testEndpoint();
```

Execute:
```bash
node test-endpoint.js
```

---

### 7. **Teste via Frontend (Dashboard)**

1. Inicie o frontend:
   ```bash
   npm run dev
   ```

2. Acesse: `http://localhost:8080`

3. O gráfico "Tempo Médio por Dia" deve aparecer automaticamente

4. Abra o DevTools (F12) → Network → Filtre por "daily-average"

5. Verifique:
   - Requisição sendo feita
   - Status 200 OK
   - Dados retornados corretamente

---

## ✅ Validações

### Resposta Válida

```json
{
  "success": true,
  "data": [
    {
      "date": "DD/MM",
      "avg_sla": number
    }
  ],
  "timestamp": "ISO string"
}
```

### Verificações:

- ✅ `success` deve ser `true`
- ✅ `data` deve ser um array
- ✅ Cada item deve ter `date` (formato "DD/MM")
- ✅ Cada item deve ter `avg_sla` (número)
- ✅ Array deve estar ordenado por data (crescente)
- ✅ Deve conter apenas últimos 7 dias

---

## 🐛 Troubleshooting

### Erro: "Cannot GET /api/metrics/daily-average"

**Causa:** Backend não está rodando ou rota não registrada

**Solução:**
1. Verifique se o backend está rodando:
   ```bash
   cd backend
   npm run dev
   ```

2. Verifique se a rota está registrada em `backend/src/app.ts`

### Erro: "Erro ao buscar média diária"

**Causa:** Problema com banco de dados ou query SQL

**Solução:**
1. Verifique conexão com Supabase:
   ```bash
   # Teste o endpoint /health
   curl http://localhost:3001/health
   ```

2. Verifique variáveis de ambiente:
   ```bash
   # No backend/.env
   SUPABASE_URL=...
   SUPABASE_KEY=...
   ```

3. Verifique logs do backend para mais detalhes

### Resposta Vazia: `[]`

**Causa:** Não há dados nos últimos 7 dias

**Solução:**
1. Verifique se há leads com `attended_at` nos últimos 7 dias:
   ```sql
   SELECT COUNT(*) 
   FROM leads_sla 
   WHERE attended_at >= CURRENT_DATE - INTERVAL '6 days'
     AND sla_minutes IS NOT NULL;
   ```

2. Se não houver dados, crie alguns leads de teste ou aguarde novos leads do Pipedrive

### Erro de CORS

**Causa:** Frontend tentando acessar backend de origem diferente

**Solução:**
1. Verifique configuração CORS em `backend/src/app.ts`
2. Certifique-se de que `FRONTEND_URL` está configurado corretamente

---

## 📊 Exemplo de Resposta Completa

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
    },
    {
      "date": "08/12",
      "avg_sla": 14
    },
    {
      "date": "09/12",
      "avg_sla": 16
    },
    {
      "date": "10/12",
      "avg_sla": 13
    },
    {
      "date": "11/12",
      "avg_sla": 17
    }
  ],
  "timestamp": "2024-12-11T15:30:00.000Z"
}
```

---

## 🎯 Teste Rápido (One-Liner)

**Windows PowerShell:**
```powershell
Invoke-RestMethod http://localhost:3001/api/metrics/daily-average | ConvertTo-Json
```

**Linux/Mac:**
```bash
curl -s http://localhost:3001/api/metrics/daily-average | jq
```

**Navegador:**
```
http://localhost:3001/api/metrics/daily-average
```

---

## ✅ Checklist de Teste

- [ ] Backend está rodando (`npm run dev` no diretório backend)
- [ ] Endpoint responde com status 200
- [ ] Resposta tem formato JSON válido
- [ ] `success` é `true`
- [ ] `data` é um array
- [ ] Cada item tem `date` e `avg_sla`
- [ ] Datas estão no formato "DD/MM"
- [ ] Array está ordenado por data (crescente)
- [ ] Contém apenas últimos 7 dias
- [ ] Gráfico aparece no dashboard do frontend

---

## 🚀 Pronto!

Agora você pode testar o endpoint de várias formas. O método mais simples é abrir no navegador ou usar o dashboard do frontend que já está integrado!


