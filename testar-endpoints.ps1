# Script PowerShell para Testar Endpoints de Métricas
# Execute: .\testar-endpoints.ps1

$baseUrl = "http://localhost:3001/api/metrics"

Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "Testando Endpoints de Métricas" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""

# Função auxiliar para fazer requisições
function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Url
    )
    
    Write-Host "Testando: $Name" -ForegroundColor Yellow
    Write-Host "URL: $Url" -ForegroundColor Gray
    
    try {
        $response = Invoke-RestMethod -Uri $Url -Method Get -ErrorAction Stop
        Write-Host "✅ Sucesso!" -ForegroundColor Green
        
        if ($response.success) {
            $data = $response.data
            
            if ($data -is [Array]) {
                Write-Host "   Total de registros: $($data.Count)" -ForegroundColor White
                
                # Mostrar primeiros 3 registros como exemplo
                if ($data.Count -gt 0) {
                    Write-Host "   Primeiros registros:" -ForegroundColor Gray
                    $data | Select-Object -First 3 | ConvertTo-Json -Depth 3 | Write-Host -ForegroundColor DarkGray
                }
            } elseif ($data -is [PSCustomObject]) {
                Write-Host "   Dados retornados:" -ForegroundColor White
                $data | ConvertTo-Json -Depth 3 | Write-Host -ForegroundColor DarkGray
            }
        } else {
            Write-Host "   ⚠️ Resposta indica erro: $($response.error)" -ForegroundColor Red
        }
    } catch {
        Write-Host "   ❌ Erro: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            Write-Host "   Detalhes: $responseBody" -ForegroundColor Red
        }
    }
    
    Write-Host ""
}

# Testar cada endpoint
Write-Host "1. Testando Ranking de SDRs (Mês Corrente)" -ForegroundColor Cyan
Write-Host "   Esperado: Apenas dados do mês atual" -ForegroundColor Gray
Test-Endpoint "Ranking" "$baseUrl/ranking"
Start-Sleep -Seconds 1

Write-Host "2. Testando Hourly Performance (Dia Civil)" -ForegroundColor Cyan
Write-Host "   Esperado: Apenas dados do dia atual" -ForegroundColor Gray
Test-Endpoint "Hourly Performance" "$baseUrl/hourly-performance"
Start-Sleep -Seconds 1

Write-Host "3. Testando Timeline (Dia Civil)" -ForegroundColor Cyan
Write-Host "   Esperado: Apenas dados do dia atual" -ForegroundColor Gray
Test-Endpoint "Timeline" "$baseUrl/timeline"
Start-Sleep -Seconds 1

Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "Testes Concluídos!" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Próximos passos:" -ForegroundColor Yellow
Write-Host "1. Verifique se os dados retornados correspondem às expectativas" -ForegroundColor White
Write-Host "2. Execute os scripts SQL no Supabase para comparar" -ForegroundColor White
Write-Host "3. Verifique o frontend para visualização" -ForegroundColor White


