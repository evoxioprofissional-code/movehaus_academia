# Arquitetura — MoveHaus Training Club

Loja oficial de vendedor único, com produtos físicos e materiais digitais.
O Haus Coach é mantido em projeto independente.

## Aplicação

Next.js 16 com App Router, TypeScript, React e Tailwind CSS v4. Supabase fornece
Postgres, autenticação e armazenamento. Mercado Pago processa os pagamentos.

- `src/app/(store)`: vitrine, catálogo, produtos, ofertas, carrinho, checkout,
  atendimento e políticas.
- `src/app/(auth)`: entrada, cadastro e recuperação de conta.
- `src/app/(member)`: conta do comprador, pedidos, comprovantes, assinaturas,
  biblioteca e leitor protegido.
- `src/app/admin`: vendas, catálogo, produtos digitais e configurações da loja.
- `src/lib/commerce`: orçamento, pagamentos, assinaturas e comprovantes.
- `src/lib/customer`: consultas e ações do comprador, além do acesso aos PDFs.
- `src/lib/admin`: consultas e ações administrativas, incluindo publicação de PDFs.
- `src/proxy.ts`: renovação de sessão nas rotas de cliente e admin.

O celular usa uma interface de aplicativo com navegação inferior. As fotos dos
produtos alimentam a vitrine mobile. Banners atendem campanhas nos dois formatos;
a edição da vitrine do computador fica em `/admin/home`.

## Conteúdo digital

PDFs, e-books e receitas são produtos da loja. Os tipos `ebook` e `digital` usam
a mesma biblioteca protegida. Materiais antigos comprados continuam acessíveis.
O conteúdo pode ter texto ou um PDF privado, entregue pela rota autenticada
`/minha-area/ler/[slug]/pdf/[chapterId]` após checar compra e publicação.

## Segurança e dados

- A leitura exige autorização no servidor e acesso válido em `digital_access`.
- O papel administrativo é verificado no servidor; a interface não concede acesso.
- Chaves de serviço e credenciais de pagamento ficam exclusivamente no servidor.
- Preços e estoque são conferidos no servidor antes da cobrança.
- O webhook em `/api/mercadopago/webhook` valida e sincroniza os pagamentos.
- Pedidos, pagamentos, assinaturas e compras existentes são preservados.

As migrations antigas documentam o histórico do banco. Elas não reativam os
módulos de treino, acompanhamento ou pontuação, removidos da aplicação.
