# Script PowerShell para criar arquivo .env
# Execute: .\criar_env.ps1

$envContent = @"
# Supabase Configuration
SUPABASE_URL=https://vfxqwsleorpssxzoxvcy.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmeHF3c2xlb3Jwc3N4em94dmN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3ODMxNjAsImV4cCI6MjA4MDM1OTE2MH0.nOI1AJZTVQJUy3oJlJB_IwzzGqadTptfnGOCrsGwvuM

# Pipedrive Configuration
PIPEDRIVE_API_TOKEN=seu-token-pipedrive-aqui

# Server Configuration
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Admin Key (opcional)
ADMIN_KEY=dev-admin-key-2024
"@

$envContent | Out-File -FilePath ".env" -Encoding utf8 -NoNewline
Write-Host "✅ Arquivo .env criado com sucesso!" -ForegroundColor Green



