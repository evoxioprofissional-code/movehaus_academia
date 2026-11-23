# Modelo de dados — MoveHaus (planejamento, Fase 3)

Migrations versionadas em `supabase/migrations/` + RLS por tabela.
Valores monetários em **centavos** (inteiro). Datas em UTC.

## Identidade e papéis
- **profiles** — 1:1 com `auth.users`. Dados: nome, telefone/WhatsApp, e-mail.
- **user_roles** — papel do usuário (`admin` | `customer`). Fonte de verdade do
  admin; **nunca** derivado de input do navegador. Checagem por função
  `is_admin()` (SECURITY DEFINER) usada nas policies.

## Catálogo
- **categories** — nome, slug, ordem, ativa.
- **products** — tipo (`physical` | `digital` | `ebook`), nome, slug, descrição,
  preço (centavos), preço promocional, destaque, ativo. Campos de digital:
  `billing_model` (`one_time` | `subscription`), `access_duration_days`
  (null = permanente), `monthly_price`, `grace_days`.
- **product_images** — imagens ordenadas (bucket público de catálogo).
- **product_categories** — N:N produto↔categoria.
- **product_variants** — variações de físico (tamanho/cor), preço, SKU, estoque.
- **inventory_movements** — histórico de entrada/saída de estoque (auditável).

## Carrinho e pedidos
- **carts** / **cart_items** — carrinho por usuário (ou sessão anônima).
- **orders** — número, cliente, total, status pagamento, status entrega,
  endereço, observações. Total **recalculado no servidor**.
- **order_items** — snapshot de produto/variação/preço no momento da compra.
- **payments** — provedor (mercadopago), id externo, status, payload, evento.
  Idempotência por id externo do evento.

## Acesso a conteúdo digital
- **subscriptions** — assinatura por cliente↔produto: status
  (`active` | `past_due` | `canceled` | `expired`), próxima cobrança,
  id externo, cancelado_em. Carência aplicada por produto.
- **digital_access** — permissão efetiva de acesso: cliente↔produto, origem
  (pagamento único ou assinatura), `starts_at`, `expires_at` (null = permanente),
  `revoked_at`. **A tela de leitura só consulta esta tabela, no servidor.**

## E-books
- **ebooks** — 1:1 com um `product` do tipo ebook: capa, introdução, status
  (`draft` | `published`), versão.
- **ebook_chapters** — título, ordem, texto dos materiais e receitas ou metadados
  do arquivo PDF privado para leitura na plataforma.
- **reading_progress** — cliente↔ebook: capítulo atual, posição, percentual,
  atualizado_em (para retomar de onde parou).

## Promoções
- **coupons** — código, tipo (`percent` | `fixed`), valor, validade, limite de
  uso, produtos elegíveis, ativo.
- **coupon_redemptions** — uso por cliente↔pedido (impede reuso além do limite).

## Auditoria
- **access_logs** — registro de acessos a conteúdo (quem, quando, ip/ua, ebook).

## Configuração e conteúdo do site
- **site_settings** — identificação da loja, WhatsApp, endereço, redes, regras de
  entrega, políticas e termos. Configurações antigas de dispositivos e de
  profissionais não são oferecidas no painel da loja.
- **banners** — banners promocionais (imagem, link, período, ordem, ativo).

## Notas de RLS
- Cliente: `select/update` apenas onde `user_id = auth.uid()`.
- `digital_access`, `subscriptions`, `reading_progress`, `orders`: só do dono.
- Conteúdo de `ebook_chapters` publicado: leitura só com `digital_access`
  válido, verificada no servidor (não exposta a `select` público direto).
- Admin: gerência ampla via `is_admin()`.
- Storage de PDFs: bucket **privado**, servido pela rota autenticada do leitor
  após verificar o acesso do comprador e a publicação do conteúdo.

Tabelas e papéis de módulos antigos permanecem nas migrations históricas.
A limpeza da loja não remove dados existentes do banco de produção.
