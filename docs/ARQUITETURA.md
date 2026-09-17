# Arquitetura — MoveHaus Training Club

E-commerce oficial de vendedor único (só a MoveHaus). Não é marketplace.

## Stack

| Camada | Escolha | Observação |
|--------|---------|------------|
| Framework | **Next.js 16** (App Router) | `create-next-app` mais recente instalou o 16. O briefing pedia 15; o 16 é o sucessor direto e estável. Fácil de fixar em 15 se preferir. |
| Linguagem | TypeScript (strict) | |
| UI | Tailwind CSS v4 (config em CSS via `@theme`) | |
| Ícones | lucide-react | Ícones de marca (Instagram) via SVG inline — lucide não os distribui. |
| Backend | Supabase (Postgres + Auth + Storage) | Storage **privado** para conteúdo protegido. |
| Acesso a dados | `@supabase/ssr` | Cliente browser + server, sessão via cookies, respeita RLS. |
| Pagamentos | Mercado Pago (Pix, cartão, assinatura) | Preferência/assinatura criadas só no servidor; webhooks idempotentes. |

## Estrutura de pastas

```
src/
  app/                     # Rotas (App Router)
    page.tsx               # Home (shell da marca; expandida na Fase 2)
    layout.tsx             # Fontes, metadados, shell global
    globals.css            # Design system (tokens Tailwind v4)
  components/
    brand/                 # Logo e elementos de marca
    layout/                # SiteHeader, SiteFooter
    ui/                    # Primitivos do design system (Button, ...)
  lib/
    env.ts                 # Acesso validado a env (público x servidor)
    utils.ts               # cn(), formatBRL()
    supabase/
      client.ts            # Cliente browser
      server.ts            # Cliente server + admin (service_role)
  types/
    database.ts            # Tipos do banco (placeholder até Fase 3)
  proxy.ts                 # Renova sessão a cada request (Next 16 "proxy")
docs/                      # Fonte de verdade do projeto
public/brand/              # Arte oficial (logo)
```

## Rotas planejadas (visão geral)

- Público: `/`, `/loja`, `/loja/[slug]`, `/ebooks`, `/ebooks/[slug]`,
  `/ofertas`, `/sobre`, `/carrinho`, `/checkout`, `/pedido/[id]`.
- Cliente (`/minha-area`): biblioteca, pedidos, assinaturas, dados, leitor
  `/minha-area/ler/[ebookId]`.
- Admin (`/admin`): dashboard, produtos, ebooks, pedidos, clientes, promoções,
  configurações. Protegido no servidor por papel.
- API: `/api/checkout`, `/api/webhooks/mercadopago`, `/api/reader/asset`.

## Princípios de segurança (transversais)

- Autorização de leitura de conteúdo conferida **no servidor** (nunca só no front).
- `service_role` só no servidor (`createAdminClient`), nunca no bundle.
- RLS em todas as tabelas; cliente só enxerga os próprios dados.
- Campo `role` vindo do navegador nunca concede admin.
- Preço final e estoque calculados/confirmados no servidor.
- Webhooks validados e idempotentes.

## Decisões em aberto (dependem de você)

- Fixar Next.js em 15 ou manter 16 (recomendo manter 16).
- Migrar para as chaves novas do Supabase (`sb_publishable_` / `sb_secret_`)
  ou manter as JWT (`anon` / `service_role`). Hoje uso as JWT por compatibilidade.
- Domínio de produção definitivo (hoje placeholder `movehaus.com.br`).
- Credenciais do Mercado Pago (ausentes — integração fica em modo dev).
