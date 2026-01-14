# Como Executar a Migration da Coluna STATUS

## Problema
O erro no Render indica que a coluna `status` não existe na tabela `leads_sla`:
```
Could not find the 'status' column of 'leads_sla' in the schema cache
```

## Solução

### Opção 1: Executar via Supabase SQL Editor (Recomendado)

1. Acesse o Supabase Dashboard
2. Vá para **SQL Editor**
3. Execute o seguinte SQL:

```sql
-- Adicionar coluna status se não existir
ALTER TABLE leads_sla
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT NULL;

-- Criar índice para otimizar queries que filtram por status
CREATE INDEX IF NOT EXISTS idx_leads_sla_status ON leads_sla(status);

-- Comentário na coluna
COMMENT ON COLUMN leads_sla.status IS 'Status do lead no Pipedrive (lost, open, won)';
```

4. Clique em **Run** para executar

### Opção 2: Executar via psql (se tiver acesso)

```bash
psql -h [SEU_HOST] -U [SEU_USUARIO] -d [SEU_DATABASE] -f backend/migrations/004_add_status_column.sql
```

### Opção 3: Executar via Supabase CLI

```bash
supabase db push
```

## Verificação

Após executar, verifique se a coluna foi criada:

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'leads_sla' AND column_name = 'status';
```

Se retornar uma linha, a coluna foi criada com sucesso.

## Importante

Após adicionar a coluna, você pode precisar:
1. Reiniciar o backend no Render para limpar o cache do schema
2. Aguardar alguns segundos para o Supabase atualizar o schema cache


