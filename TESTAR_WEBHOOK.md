# ✅ Testar Webhook do Pipedrive

Agora que você configurou o webhook, vamos testar se está funcionando corretamente!

---

## 🧪 PASSO 1: Testar o Backend

### 1.1 Verificar se o Backend está Rodando

1. Acesse a URL do seu backend no Render
2. Adicione `/health` no final: `https://seu-backend.onrender.com/health`
3. Deve retornar: `{"status":"ok","message":"Backend is running"}`

✅ **Se funcionou:** Backend está rodando!

❌ **Se não funcionou:** Verifique se o deploy foi concluído no Render

---

## 🧪 PASSO 2: Testar o Webhook

### 2.1 Criar um Deal de Teste no Pipedrive

1. Acesse [app.pipedrive.com](https://app.pipedrive.com)
2. Vá em **"Deals"** ou **"Negócios"**
3. Clique em **"Add deal"** ou **"Adicionar negócio"**
4. Preencha:
   - **Title**: "Teste Webhook - [sua data]"
   - **Pipeline**: Selecione o pipeline **"SDR"**
   - **Stage**: Selecione qualquer stage válido:
     - TEM PERFIL
     - PERFIL MENOR
     - INCONCLUSIVO
     - SEM PERFIL
5. Clique em **"Save"** ou **"Salvar"**

### 2.2 Verificar Logs do Render

1. Acesse o painel do Render
2. Vá em **Logs** (no menu lateral)
3. Procure por mensagens como:
   - `📥 Webhook recebido do Pipedrive`
   - `🔍 Processando deal...`
   - `✅ Lead criado/atualizado`
   - `POST /api/webhook/pipedrive`

✅ **Se aparecer:** Webhook está funcionando!

❌ **Se não aparecer nada:** 
- Verifique se a URL do webhook está correta
- Verifique se o backend está rodando
- Aguarde alguns segundos (pode haver delay)

### 2.3 Verificar no Dashboard

1. Acesse o frontend no Netlify
2. O lead deve aparecer na lista de **pendentes**
3. Verifique se:
   - Nome do lead está correto
   - Stage está correto
   - Data de entrada está correta

✅ **Se aparecer:** Sistema completo funcionando!

❌ **Se não aparecer:**
- Verifique se o frontend está conectado ao backend correto
- Verifique se `VITE_API_URL` está configurado no Netlify
- Aguarde alguns segundos e atualize a página

---

## 🧪 PASSO 3: Testar Atendimento de Lead

### 3.1 Atender um Lead no Pipedrive

1. No Pipedrive, encontre o deal que você criou
2. Mova o deal do pipeline **"SDR"** para um pipeline individual:
   - Exemplo: "João - SDR"
   - Ou: "Maria - SDR"
   - Ou qualquer pipeline no formato "NOME - SDR"
3. Salve a mudança

### 3.2 Verificar no Dashboard

1. Atualize o dashboard no Netlify
2. O lead deve aparecer como **atendido**
3. Verifique se:
   - SLA foi calculado
   - Nome do SDR está correto
   - Data de atendimento está correta

✅ **Se funcionou:** Sistema completo está operacional!

---

## 🔍 VERIFICAR CONFIGURAÇÕES

### Checklist de Verificação

- [ ] Backend está rodando (teste `/health`)
- [ ] Webhook criado no Pipedrive
- [ ] URL do webhook está correta
- [ ] Eventos `added` e `updated` configurados
- [ ] Frontend está acessível
- [ ] `VITE_API_URL` configurado no Netlify
- [ ] `FRONTEND_URL` configurado no Render
- [ ] Pipeline "SDR" existe no Pipedrive
- [ ] Stages corretos no pipeline "SDR"
- [ ] Pipelines individuais existem (formato "NOME - SDR")

---

## 🐛 PROBLEMAS COMUNS

### Problema: Webhook não está recebendo eventos

**Soluções:**
1. Verifique se a URL está correta no Pipedrive
2. Verifique se o backend está rodando
3. Verifique os logs do Render
4. Teste a URL manualmente: `https://seu-backend.onrender.com/health`

### Problema: Lead não aparece no dashboard

**Soluções:**
1. Verifique se o deal está no pipeline "SDR"
2. Verifique se o stage é válido
3. Verifique se `VITE_API_URL` está correto no Netlify
4. Limpe o cache do navegador
5. Verifique os logs do backend

### Problema: SLA não é calculado

**Soluções:**
1. Verifique se o deal foi movido do pipeline "SDR" para um pipeline individual
2. Verifique se o pipeline individual segue o formato "NOME - SDR"
3. Verifique os logs do backend para erros

---

## ✅ PRÓXIMOS PASSOS

Após confirmar que está funcionando:

1. ✅ **Monitorar logs** regularmente
2. ✅ **Testar com dados reais** do Pipedrive
3. ✅ **Ajustar configurações** conforme necessário
4. ✅ **Documentar** qualquer problema encontrado

---

## 🎉 PRONTO!

Se todos os testes passaram, seu sistema está funcionando! 🚀

**O que acontece agora:**
- ✅ Novos deals no Pipedrive aparecem automaticamente no dashboard
- ✅ Quando um deal é atendido (movido para pipeline individual), o SLA é calculado
- ✅ O dashboard mostra métricas em tempo real

**Dicas:**
- Monitore os logs do Render regularmente
- Teste com diferentes tipos de deals
- Ajuste conforme necessário





