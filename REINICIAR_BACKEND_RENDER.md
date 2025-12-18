# Como Reiniciar o Backend no Render

## Método 1: Via Dashboard do Render (Recomendado)

### Passo a Passo:

1. **Acesse o Render Dashboard**
   - Vá para https://dashboard.render.com
   - Faça login na sua conta

2. **Encontre seu serviço**
   - Na lista de serviços, encontre o serviço do backend (geralmente chamado "lead-speed-monitor" ou similar)
   - Clique no nome do serviço

3. **Reinicie o serviço**
   - No menu superior, clique em **"Manual Deploy"** ou procure por **"Restart"**
   - Ou vá para a aba **"Events"** e clique em **"Restart"**
   - Ou use o botão **"Restart"** que aparece na página do serviço

4. **Aguarde a reinicialização**
   - O serviço será reiniciado automaticamente
   - Aguarde alguns segundos até o status voltar para "Live"

## Método 2: Via Render CLI (Se tiver instalado)

```bash
# Instalar Render CLI (se não tiver)
npm install -g render-cli

# Fazer login
render login

# Listar serviços
render services list

# Reiniciar serviço específico
render services:restart <service-id>
```

## Método 3: Forçar Deploy (Alternativa)

Se não houver opção de restart direto:

1. Vá para a aba **"Settings"** do seu serviço
2. Role até **"Manual Deploy"**
3. Clique em **"Deploy latest commit"** ou **"Clear build cache & deploy"**
4. Isso forçará uma nova build e reiniciará o serviço

## Verificação

Após reiniciar, verifique se o serviço está funcionando:

1. Vá para a aba **"Logs"** do serviço
2. Procure por mensagens de inicialização
3. Verifique se não há erros relacionados ao schema

## Importante

- O cache do schema do Supabase será limpo automaticamente após alguns segundos
- Não é necessário fazer nada adicional no Supabase
- O backend irá recarregar o schema do banco de dados na próxima conexão

## Tempo Estimado

- Reinicialização: 30-60 segundos
- Cache do schema atualizado: 5-10 segundos após reiniciar

