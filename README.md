# MoveHaus Training Club — Loja oficial

E-commerce de vendedor único da MoveHaus: produtos físicos, produtos digitais e
e-books, com pagamento único ou assinatura mensal e leitor interno protegido.

## Stack
Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · Supabase (Postgres +
Auth + Storage) · Mercado Pago · lucide-react.

## Rodando localmente

```bash
npm install
cp .env.example .env.local   # preencha as variáveis
npm run dev
```

App em http://localhost:3000.

## Variáveis de ambiente
Veja `.env.example`. Chaves `NEXT_PUBLIC_*` vão ao navegador; `SUPABASE_SERVICE_ROLE_KEY`
e as chaves do Mercado Pago são **exclusivas de servidor**.

## Documentação
A pasta [`docs/`](./docs) é a fonte de verdade:
- [ROADMAP](./docs/ROADMAP.md) — fases e status.
- [ARQUITETURA](./docs/ARQUITETURA.md) — stack, estrutura, decisões.
- [MODELO-DADOS](./docs/MODELO-DADOS.md) — tabelas e RLS (Fase 3).
- [DESIGN-SYSTEM](./docs/DESIGN-SYSTEM.md) — tokens e princípios visuais.

## Scripts
- `npm run dev` — desenvolvimento
- `npm run build` — build de produção
- `npm run lint` — ESLint
