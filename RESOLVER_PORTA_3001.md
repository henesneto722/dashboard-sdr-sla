# 🔧 Resolver Porta 3001 em Uso

## Problema
```
Error: listen EADDRINUSE: address already in use :::3001
```

A porta 3001 já está sendo usada por outro processo.

---

## Solução Rápida (Windows PowerShell)

### Opção 1: Encontrar e Matar o Processo

```powershell
# Encontrar o processo usando a porta 3001
netstat -ano | findstr :3001

# Você verá algo como:
# TCP    0.0.0.0:3001    0.0.0.0:0    LISTENING    12345
# O último número (12345) é o PID do processo

# Matar o processo (substitua 12345 pelo PID que você encontrou)
taskkill /PID 12345 /F
```

### Opção 2: Comando Único (PowerShell)

```powershell
# Encontrar e matar automaticamente
$port = 3001
$process = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess
if ($process) {
    Stop-Process -Id $process -Force
    Write-Host "Processo na porta $port foi encerrado"
} else {
    Write-Host "Nenhum processo encontrado na porta $port"
}
```

### Opção 3: Matar Todos os Processos Node.js

```powershell
# CUIDADO: Isso mata TODOS os processos Node.js
taskkill /F /IM node.exe
```

---

## Solução Alternativa: Usar Outra Porta

Se não quiser matar o processo, você pode usar outra porta:

1. Edite `backend/.env`:
   ```env
   PORT=3002
   ```

2. Ou passe como variável de ambiente:
   ```powershell
   $env:PORT=3002; cd backend; npm run dev
   ```

---

## Verificar se Funcionou

Depois de matar o processo, tente iniciar o backend novamente:

```powershell
cd backend
npm run dev
```

Se ainda der erro, repita o processo acima.


