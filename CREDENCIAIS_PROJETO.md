# Credenciais do Projeto

Este documento explica onde configurar credenciais e como rotacioná-las. Não armazene valores reais neste arquivo.

## Onde Configurar

### Desenvolvimento Local

Use `.env.local` na raiz do projeto. Esse arquivo está no `.gitignore` e não deve ser commitado.

Variáveis esperadas:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_WHATSAPP_NUMBER=
ADMIN_USER=
ADMIN_PASSWORD=
SUPERFRETE_TOKEN=
SUPERFRETE_ORIGIN_CEP=
INFINITEPAY_HANDLE=
```

### Produção

Configure as mesmas variáveis no painel do provedor de deploy, por exemplo Vercel:

- Project Settings
- Environment Variables
- Production, Preview e Development conforme necessário

Nunca coloque valores reais em arquivos versionados.

## Variáveis Públicas

Estas variáveis podem ser expostas ao navegador porque usam `NEXT_PUBLIC_`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_WHATSAPP_NUMBER`

A segurança do Supabase depende das policies RLS. A anon key não deve permitir escrita administrativa.

## Variáveis Secretas

Estas variáveis devem existir somente no servidor:

- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_USER`
- `ADMIN_PASSWORD`
- `SUPERFRETE_TOKEN`
- `SUPERFRETE_ORIGIN_CEP`
- `INFINITEPAY_HANDLE`

## Como Trocar Credenciais

### Admin

1. Gere uma senha forte.
2. Atualize `ADMIN_PASSWORD` no provedor de deploy.
3. Atualize `.env.local` apenas no ambiente local, se necessário.
4. Faça novo deploy/restart.
5. Teste login em `/admin/login`.

### Supabase

1. Acesse o painel do Supabase.
2. Gere/rotacione as API keys conforme o tipo.
3. Atualize `NEXT_PUBLIC_SUPABASE_ANON_KEY` se trocar a anon key.
4. Atualize `SUPABASE_SERVICE_ROLE_KEY` se trocar a service role.
5. Faça novo deploy.
6. Teste catálogo, checkout e painel admin.

### SuperFrete

1. Gere novo token no painel SuperFrete.
2. Atualize `SUPERFRETE_TOKEN` no provedor de deploy.
3. Faça novo deploy.
4. Teste cálculo de frete em `/entrega`.

### InfinitePay

1. Confirme o handle correto no painel InfinitePay.
2. Atualize `INFINITEPAY_HANDLE` no provedor de deploy.
3. Faça novo deploy.
4. Teste geração de link em checkout.

## Em Caso de Vazamento

1. Revogue ou rotacione imediatamente a credencial vazada.
2. Remova a credencial de arquivos, logs, issues, prints e mensagens.
3. Se o segredo foi commitado, considere reescrever histórico Git e invalidar a credencial mesmo assim.
4. Verifique logs de acesso no provedor afetado.
5. Faça deploy com as novas variáveis.
6. Teste fluxos críticos: login admin, catálogo, frete, checkout, webhook e pedidos.

## Senha Mestre Administrativa

A senha mestre deve ser configurada diretamente como `ADMIN_PASSWORD` em `.env.local` e no provedor de deploy. Não registre a senha real em arquivos versionados.
