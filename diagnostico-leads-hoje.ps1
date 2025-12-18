# ============================================
# Script de Diagnóstico: Por que não há dados de hoje?
# ============================================

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  DIAGNÓSTICO: LEADS DE HOJE" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$today = Get-Date -Format "yyyy-MM-dd"
Write-Host "📅 Data de hoje: $today`n" -ForegroundColor Yellow

# ============================================
# 1. Verificar se o backend está rodando
# ============================================
Write-Host "1️⃣ Verificando se o backend está rodando..." -ForegroundColor Cyan
$backendProcess = Get-Process | Where-Object {$_.ProcessName -like "*node*"} | Select-Object -First 1
if ($backendProcess) {
    Write-Host "   ✅ Backend está rodando (PID: $($backendProcess.Id))" -ForegroundColor Green
} else {
    Write-Host "   ❌ Backend NÃO está rodando!" -ForegroundColor Red
    Write-Host "   💡 Execute: cd backend; npm run dev" -ForegroundColor Yellow
}

# Verificar se a porta 3001 está aberta
$port3001 = Test-NetConnection -ComputerName localhost -Port 3001 -InformationLevel Quiet -WarningAction SilentlyContinue
if ($port3001) {
    Write-Host "   ✅ Porta 3001 está aberta" -ForegroundColor Green
} else {
    Write-Host "   ❌ Porta 3001 NÃO está aberta!" -ForegroundColor Red
}

Write-Host ""

# ============================================
# 2. Verificar variáveis de ambiente
# ============================================
Write-Host "2️⃣ Verificando variáveis de ambiente..." -ForegroundColor Cyan

if (Test-Path "backend\.env") {
    Write-Host "   ✅ Arquivo .env existe" -ForegroundColor Green
    
    $envContent = Get-Content "backend\.env" -Raw
    if ($envContent -match "PIPEDRIVE_API_TOKEN") {
        $tokenMatch = [regex]::Match($envContent, "PIPEDRIVE_API_TOKEN=(.+)")
        if ($tokenMatch.Success -and $tokenMatch.Groups[1].Value.Trim() -ne "") {
            Write-Host "   ✅ PIPEDRIVE_API_TOKEN está configurado" -ForegroundColor Green
        } else {
            Write-Host "   ❌ PIPEDRIVE_API_TOKEN está vazio!" -ForegroundColor Red
        }
    } else {
        Write-Host "   ❌ PIPEDRIVE_API_TOKEN não encontrado no .env!" -ForegroundColor Red
    }
    
    if ($envContent -match "SUPABASE_URL") {
        Write-Host "   ✅ SUPABASE_URL está configurado" -ForegroundColor Green
    } else {
        Write-Host "   ❌ SUPABASE_URL não encontrado!" -ForegroundColor Red
    }
    
    if ($envContent -match "SUPABASE_SERVICE_ROLE_KEY") {
        Write-Host "   ✅ SUPABASE_SERVICE_ROLE_KEY está configurado" -ForegroundColor Green
    } else {
        Write-Host "   ❌ SUPABASE_SERVICE_ROLE_KEY não encontrado!" -ForegroundColor Red
    }
} else {
    Write-Host "   ❌ Arquivo backend\.env NÃO existe!" -ForegroundColor Red
}

Write-Host ""

# ============================================
# 3. Testar conexão com o backend
# ============================================
Write-Host "3️⃣ Testando conexão com o backend..." -ForegroundColor Cyan

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/health" -Method GET -TimeoutSec 5 -ErrorAction Stop
    Write-Host "   ✅ Backend respondeu" -ForegroundColor Green
} catch {
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:3001/api/webhook/admin/pipelines" -Method GET -TimeoutSec 5 -ErrorAction Stop
        Write-Host "   ✅ Backend respondeu (endpoint alternativo)" -ForegroundColor Green
    } catch {
        Write-Host "   ❌ Backend NÃO respondeu!" -ForegroundColor Red
        Write-Host "   💡 Verifique se o backend está rodando" -ForegroundColor Yellow
    }
}

Write-Host ""

# ============================================
# 4. Verificar pipelines do Pipedrive
# ============================================
Write-Host "4️⃣ Verificando pipelines do Pipedrive..." -ForegroundColor Cyan

try {
    $pipelinesResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/leads/debug/pipelines" -Method GET -TimeoutSec 10 -ErrorAction Stop
    if ($pipelinesResponse.success -and $pipelinesResponse.data) {
        $pipelines = $pipelinesResponse.data
        Write-Host "   ✅ $($pipelines.Count) pipelines encontrados" -ForegroundColor Green
        
        $sdrPipelines = $pipelines | Where-Object { $_.isSDR -eq $true }
        if ($sdrPipelines) {
            Write-Host "   ✅ $($sdrPipelines.Count) pipeline(s) SDR encontrado(s):" -ForegroundColor Green
            foreach ($pipeline in $sdrPipelines) {
                $type = if ($pipeline.isMainSDR) { "PRINCIPAL" } elseif ($pipeline.isIndividualSDR) { "INDIVIDUAL" } else { "SDR" }
                Write-Host "      - $($pipeline.name) (ID: $($pipeline.id)) - $type" -ForegroundColor Gray
            }
        } else {
            Write-Host "   ❌ Nenhum pipeline SDR encontrado!" -ForegroundColor Red
            Write-Host "   💡 Verifique se há pipelines com 'SDR' no nome no Pipedrive" -ForegroundColor Yellow
        }
    } else {
        Write-Host "   ❌ Erro ao buscar pipelines" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ Erro ao conectar com o backend: $_" -ForegroundColor Red
}

Write-Host ""

# ============================================
# 5. Verificar leads no banco de dados
# ============================================
Write-Host "5️⃣ Verificando leads no banco de dados..." -ForegroundColor Cyan

try {
    # Verificar leads de hoje
    $todayResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/leads/today-attended" -Method GET -TimeoutSec 10 -ErrorAction Stop
    if ($todayResponse.success) {
        $todayLeads = $todayResponse.data
        Write-Host "   📊 Leads atendidos hoje: $($todayLeads.Count)" -ForegroundColor $(if ($todayLeads.Count -gt 0) { "Green" } else { "Yellow" })
        
        if ($todayLeads.Count -eq 0) {
            Write-Host "   ⚠️ Nenhum lead atendido hoje encontrado" -ForegroundColor Yellow
        } else {
            Write-Host "   ✅ Primeiros 3 leads de hoje:" -ForegroundColor Green
            $todayLeads | Select-Object -First 3 | ForEach-Object {
                Write-Host "      - $($_.lead_name) (ID: $($_.lead_id)) - Atendido: $($_.attended_at)" -ForegroundColor Gray
            }
        }
    }
    
    # Verificar leads pendentes
    $pendingResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/leads/all-pending" -Method GET -TimeoutSec 10 -ErrorAction Stop
    if ($pendingResponse.success) {
        $pendingLeads = $pendingResponse.data.leads
        Write-Host "   📊 Leads pendentes: $($pendingLeads.Count)" -ForegroundColor $(if ($pendingLeads.Count -gt 0) { "Green" } else { "Yellow" })
    }
    
    # Verificar leads criados hoje (usando entered_at)
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
        Write-Host "   📊 Leads criados hoje (entered_at): $($todayCreatedLeads.Count)" -ForegroundColor $(if ($todayCreatedLeads.Count -gt 0) { "Green" } else { "Yellow" })
    }
} catch {
    Write-Host "   ❌ Erro ao buscar leads: $_" -ForegroundColor Red
}

Write-Host ""

# ============================================
# 6. Verificar eventos da jornada de hoje
# ============================================
Write-Host "6️⃣ Verificando eventos da jornada de hoje..." -ForegroundColor Cyan

try {
    $journeyResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/metrics/sdr-attendance?date=$today" -Method GET -TimeoutSec 10 -ErrorAction Stop
    if ($journeyResponse.success -and $journeyResponse.data) {
        $journeyMetrics = $journeyResponse.data
        Write-Host "   ✅ $($journeyMetrics.Count) SDR(s) com atividade hoje" -ForegroundColor Green
        
        foreach ($metric in $journeyMetrics) {
            Write-Host "      - $($metric.sdr_name) (ID: $($metric.sdr_id)): $($metric.total_actions) leads únicos" -ForegroundColor Gray
        }
    } else {
        Write-Host "   ⚠️ Nenhum evento de jornada encontrado para hoje" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ❌ Erro ao buscar jornada: $_" -ForegroundColor Red
}

Write-Host ""

# ============================================
# 7. Testar endpoint de webhook
# ============================================
Write-Host "7️⃣ Testando endpoint de webhook..." -ForegroundColor Cyan

try {
    $testPayload = @{
        meta = @{
            action = "added"
        }
        current = @{
            id = "TEST_$(Get-Date -Format 'yyyyMMddHHmmss')"
            title = "Test Lead"
            pipeline_id = "1"
            stage_id = "1"
            add_time = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
            update_time = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
        }
    } | ConvertTo-Json -Depth 10
    
    $webhookResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/webhook/pipedrive" -Method POST -Body $testPayload -ContentType "application/json" -TimeoutSec 10 -ErrorAction Stop
    Write-Host "   ✅ Webhook respondeu: $($webhookResponse.message)" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Erro ao testar webhook: $_" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "   Resposta: $responseBody" -ForegroundColor Gray
    }
}

Write-Host ""

# ============================================
# 8. Resumo e recomendações
# ============================================
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  RESUMO E RECOMENDAÇÕES" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "📋 Próximos passos para investigar:" -ForegroundColor Yellow
Write-Host "   1. Verifique os logs do backend em tempo real" -ForegroundColor White
Write-Host "   2. Verifique se o webhook do Pipedrive está configurado" -ForegroundColor White
Write-Host "   3. Verifique se há deals sendo criados/atualizados no Pipedrive hoje" -ForegroundColor White
Write-Host "   4. Verifique se os deals estão em stages válidos (TEM PERFIL, PERFIL MENOR, etc.)" -ForegroundColor White
Write-Host "   5. Verifique se os deals não têm lost_time preenchido" -ForegroundColor White
Write-Host ""

Write-Host "🔍 Para ver logs do backend em tempo real:" -ForegroundColor Yellow
Write-Host "   - Abra o terminal onde o backend está rodando" -ForegroundColor White
Write-Host "   - Procure por mensagens como:" -ForegroundColor White
Write-Host "     * '📥 Webhook recebido'" -ForegroundColor Gray
Write-Host "     * '⏭️ Pipeline não é de SDR'" -ForegroundColor Gray
Write-Host "     * '⏭️ Deal em etapa não válida'" -ForegroundColor Gray
Write-Host "     * 'Lead já existe'" -ForegroundColor Gray
Write-Host "     * '✅ Lead criado'" -ForegroundColor Gray
Write-Host ""

Write-Host "Diagnostico concluido!" -ForegroundColor Green
Write-Host ""

