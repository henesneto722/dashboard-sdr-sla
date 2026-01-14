# Script de Diagnostico: Por que nao ha dados de hoje?

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DIAGNOSTICO: LEADS DE HOJE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$today = Get-Date -Format "yyyy-MM-dd"
Write-Host "Data de hoje: $today" -ForegroundColor Yellow
Write-Host ""

# 1. Verificar backend
Write-Host "1. Verificando se o backend esta rodando..." -ForegroundColor Cyan
$backendProcess = Get-Process | Where-Object {$_.ProcessName -like "*node*"} | Select-Object -First 1
if ($backendProcess) {
    Write-Host "   OK - Backend esta rodando (PID: $($backendProcess.Id))" -ForegroundColor Green
} else {
    Write-Host "   ERRO - Backend NAO esta rodando!" -ForegroundColor Red
}

$port3001 = Test-NetConnection -ComputerName localhost -Port 3001 -InformationLevel Quiet -WarningAction SilentlyContinue
if ($port3001) {
    Write-Host "   OK - Porta 3001 esta aberta" -ForegroundColor Green
} else {
    Write-Host "   ERRO - Porta 3001 NAO esta aberta!" -ForegroundColor Red
}
Write-Host ""

# 2. Verificar variaveis de ambiente
Write-Host "2. Verificando variaveis de ambiente..." -ForegroundColor Cyan
if (Test-Path "backend\.env") {
    Write-Host "   OK - Arquivo .env existe" -ForegroundColor Green
    $envContent = Get-Content "backend\.env" -Raw
    if ($envContent -match "PIPEDRIVE_API_TOKEN=.+") {
        Write-Host "   OK - PIPEDRIVE_API_TOKEN configurado" -ForegroundColor Green
    } else {
        Write-Host "   ERRO - PIPEDRIVE_API_TOKEN nao encontrado!" -ForegroundColor Red
    }
    if ($envContent -match "SUPABASE_URL") {
        Write-Host "   OK - SUPABASE_URL configurado" -ForegroundColor Green
    } else {
        Write-Host "   ERRO - SUPABASE_URL nao encontrado!" -ForegroundColor Red
    }
} else {
    Write-Host "   ERRO - Arquivo backend\.env NAO existe!" -ForegroundColor Red
}
Write-Host ""

# 3. Testar conexao com backend
Write-Host "3. Testando conexao com o backend..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/webhook/admin/pipelines" -Method GET -TimeoutSec 5 -ErrorAction Stop
    Write-Host "   OK - Backend respondeu" -ForegroundColor Green
} catch {
    Write-Host "   ERRO - Backend NAO respondeu!" -ForegroundColor Red
}
Write-Host ""

# 4. Verificar pipelines
Write-Host "4. Verificando pipelines do Pipedrive..." -ForegroundColor Cyan
try {
    $pipelinesResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/leads/debug/pipelines" -Method GET -TimeoutSec 10 -ErrorAction Stop
    if ($pipelinesResponse.success -and $pipelinesResponse.data) {
        $pipelines = $pipelinesResponse.data
        Write-Host "   OK - $($pipelines.Count) pipelines encontrados" -ForegroundColor Green
        $sdrPipelines = $pipelines | Where-Object { $_.isSDR -eq $true }
        if ($sdrPipelines) {
            Write-Host "   OK - $($sdrPipelines.Count) pipeline(s) SDR encontrado(s)" -ForegroundColor Green
            foreach ($pipeline in $sdrPipelines) {
                $type = if ($pipeline.isMainSDR) { "PRINCIPAL" } elseif ($pipeline.isIndividualSDR) { "INDIVIDUAL" } else { "SDR" }
                Write-Host "      - $($pipeline.name) (ID: $($pipeline.id)) - $type" -ForegroundColor Gray
            }
        } else {
            Write-Host "   ERRO - Nenhum pipeline SDR encontrado!" -ForegroundColor Red
        }
    }
} catch {
    Write-Host "   ERRO - Nao foi possivel buscar pipelines: $_" -ForegroundColor Red
}
Write-Host ""

# 5. Verificar leads
Write-Host "5. Verificando leads no banco de dados..." -ForegroundColor Cyan
try {
    $todayResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/leads/today-attended" -Method GET -TimeoutSec 10 -ErrorAction Stop
    if ($todayResponse.success) {
        $todayLeads = $todayResponse.data
        Write-Host "   Leads atendidos hoje: $($todayLeads.Count)" -ForegroundColor $(if ($todayLeads.Count -gt 0) { "Green" } else { "Yellow" })
        if ($todayLeads.Count -eq 0) {
            Write-Host "   AVISO - Nenhum lead atendido hoje encontrado" -ForegroundColor Yellow
        }
    }
    
    $pendingResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/leads/all-pending" -Method GET -TimeoutSec 10 -ErrorAction Stop
    if ($pendingResponse.success) {
        $pendingLeads = $pendingResponse.data.leads
        Write-Host "   Leads pendentes: $($pendingLeads.Count)" -ForegroundColor $(if ($pendingLeads.Count -gt 0) { "Green" } else { "Yellow" })
    }
    
    $allMonthResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/leads/all-month" -Method GET -TimeoutSec 10 -ErrorAction Stop
    if ($allMonthResponse.success) {
        $allLeads = $allMonthResponse.data
        $todayCreatedLeads = $allLeads | Where-Object {
            if ($_.entered_at) {
                $enteredDate = [DateTime]::Parse($_.entered_at)
                $enteredDate.ToString("yyyy-MM-dd") -eq $today
            } else {
                $false
            }
        }
        Write-Host "   Leads criados hoje (entered_at): $($todayCreatedLeads.Count)" -ForegroundColor $(if ($todayCreatedLeads.Count -gt 0) { "Green" } else { "Yellow" })
    }
} catch {
    Write-Host "   ERRO - Nao foi possivel buscar leads: $_" -ForegroundColor Red
}
Write-Host ""

# 6. Verificar jornada
Write-Host "6. Verificando eventos da jornada de hoje..." -ForegroundColor Cyan
try {
    $journeyResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/metrics/sdr-attendance?date=$today" -Method GET -TimeoutSec 10 -ErrorAction Stop
    if ($journeyResponse.success -and $journeyResponse.data) {
        $journeyMetrics = $journeyResponse.data
        Write-Host "   OK - $($journeyMetrics.Count) SDR(s) com atividade hoje" -ForegroundColor Green
        foreach ($metric in $journeyMetrics) {
            Write-Host "      - $($metric.sdr_name) (ID: $($metric.sdr_id)): $($metric.total_actions) leads unicos" -ForegroundColor Gray
        }
    } else {
        Write-Host "   AVISO - Nenhum evento de jornada encontrado para hoje" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ERRO - Nao foi possivel buscar jornada: $_" -ForegroundColor Red
}
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  RESUMO" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Proximos passos:" -ForegroundColor Yellow
Write-Host "  1. Verifique os logs do backend em tempo real" -ForegroundColor White
Write-Host "  2. Verifique se o webhook do Pipedrive esta configurado" -ForegroundColor White
Write-Host "  3. Verifique se ha deals sendo criados/atualizados no Pipedrive hoje" -ForegroundColor White
Write-Host "  4. Verifique se os deals estao em stages validos" -ForegroundColor White
Write-Host ""
Write-Host "Diagnostico concluido!" -ForegroundColor Green
Write-Host ""


