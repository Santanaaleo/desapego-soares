# Segurança do Projeto

Auditoria realizada no código-fonte local do projeto. Este documento não contém senhas reais, tokens reais ou chaves privadas.

## Resumo Executivo

- `.env.local` existe localmente e está listado no `.gitignore`, portanto não deve ser versionado.
- Foi encontrado `ADMIN_PASSWORD` com valor fraco/de desenvolvimento em `.env.local`; trate como senha local e substitua nos ambientes reais.
- A chave `SUPABASE_SERVICE_ROLE_KEY` é usada apenas no servidor em `lib/supabase/server.ts` e rotas server-side.
- As variáveis `NEXT_PUBLIC_*` são públicas por definição e podem aparecer no frontend.
- Foram encontrados fallbacks hardcoded não secretos para WhatsApp e CEP de origem.
- Foi removido log temporário que imprimia o valor bruto de `INFINITEPAY_HANDLE`.

## Variáveis de Ambiente

| Variável | Onde é utilizada | Obrigatória | Sensibilidade | Risco caso exposta |
| --- | --- | --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | `lib/supabase/client.ts`, `lib/supabase/server.ts` | Sim | Baixa | Expõe a URL do projeto Supabase; isoladamente não concede acesso administrativo. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `lib/supabase/client.ts` | Sim | Média pública | Chave pública do Supabase. O risco depende das policies RLS; se RLS estiver mal configurado, pode permitir leitura indevida. |
| `SUPABASE_SERVICE_ROLE_KEY` | `lib/supabase/server.ts`, rotas/admin/server helpers que usam `supabaseAdmin` | Sim | Crítica | Bypassa RLS e permite acesso administrativo ao banco. Vazamento exige rotação imediata. |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | `lib/constants.ts` | Opcional | Baixa | Número público de atendimento. Pode gerar spam se exposto. |
| `ADMIN_USER` | `app/api/admin/login/route.ts` | Sim | Alta | Facilita tentativas de login se exposto. |
| `ADMIN_PASSWORD` | `app/api/admin/login/route.ts`, `lib/admin-server.ts`, `proxy.ts` | Sim | Crítica | Permite acesso ao painel admin se vazada. Deve ser forte e rotacionada. |
| `SUPERFRETE_TOKEN` | `app/api/frete/route.ts` | Sim para frete em produção | Alta | Permite uso indevido da API SuperFrete e consumo de cota/serviços. |
| `SUPERFRETE_ORIGIN_CEP` | `app/api/frete/route.ts` | Sim para cálculo correto | Baixa/Média | Expõe CEP de origem logística. Pode revelar localização operacional aproximada. |
| `INFINITEPAY_HANDLE` | `app/api/checkout/infinitepay/route.ts` | Sim | Alta | Identifica a conta/merchant no checkout. Pode permitir abuso/tentativas de cobrança indevida se combinado com endpoints. |
| `INFINITEPAY_WEBHOOK_SECRET` | `app/api/webhooks/infinitepay/route.ts` | Sim para webhook em produção | Crítica | Permite autenticar callbacks de pagamento. Vazamento pode permitir tentativa de forjar confirmação de pagamento. |
| `NODE_ENV` | `hooks/useProducts.ts`, rotas admin cookies | Automática | Baixa | Controla comportamento de ambiente; não é segredo. |

## Verificação de Segredos Hardcoded

Escopo verificado:

- `app/`
- `components/`
- `lib/`
- `hooks/`
- arquivos de configuração principais
- arquivos `.env*` locais

Achados:

- `.env.local` contém `ADMIN_PASSWORD` com valor fraco/de desenvolvimento. Arquivo está ignorado por Git, mas a senha deve ser trocada em ambientes reais.
- `lib/constants.ts` possui fallback público de WhatsApp: `5511930071851`.
- `app/api/frete/route.ts` possui fallback de CEP de origem: `04257245`.
- Não foi encontrada `SUPABASE_SERVICE_ROLE_KEY` hardcoded.
- Não foi encontrada `SUPERFRETE_TOKEN` hardcoded.
- Não foi encontrada chave Supabase real hardcoded no código lido.
- Não foi encontrada senha mestre hardcoded no código.

## Exposição no Frontend

Variáveis disponíveis no frontend:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_WHATSAPP_NUMBER`

Variáveis que permanecem server-side:

- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_USER`
- `ADMIN_PASSWORD`
- `SUPERFRETE_TOKEN`
- `SUPERFRETE_ORIGIN_CEP`
- `INFINITEPAY_HANDLE`
- `INFINITEPAY_WEBHOOK_SECRET`

Conclusão: a Service Role Key não é enviada diretamente para o frontend pelo código atual.

## Arquivos Versionados e Configuração

- `.env.local` está no `.gitignore`.
- `.env.example` deve conter apenas nomes de variáveis e valores vazios.
- Não coloque valores reais em `.env.example`, Markdown, código, issues ou commits.

## Logs e Observabilidade

- Logs do webhook InfinitePay registram apenas metadados seguros e presença de campos.
- Logs do checkout InfinitePay não devem imprimir `INFINITEPAY_HANDLE` completo.
- Nunca registrar `SUPABASE_SERVICE_ROLE_KEY`, `SUPERFRETE_TOKEN` ou `ADMIN_PASSWORD`.

## Recomendações

- Trocar o valor atual de `ADMIN_PASSWORD` local e em produção.
- Remover fallbacks de CEP/WhatsApp futuramente se quiser obrigar configuração explícita por ambiente.
- Rotacionar segredos se algum valor real tiver sido compartilhado fora do provedor seguro.
- Revisar logs da Vercel após testes antigos para garantir que nenhum handle completo precise ser tratado como vazado.

## Senha Mestre Administrativa

Por segurança, a senha mestre informada pelo operador não foi gravada neste arquivo. Configure-a diretamente no provedor seguro de variáveis de ambiente como `ADMIN_PASSWORD`.
