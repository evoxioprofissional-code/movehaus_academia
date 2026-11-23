# Escopo atual — MoveHaus Training Club

A MoveHaus é uma loja de produtos físicos, PDFs, e-books e receitas.
A experiência do celular usa navegação de aplicativo e uma biblioteca para ler
os materiais comprados. O Haus Coach é um projeto independente.

## Loja

- Vitrine, catálogo, categorias e ofertas.
- Carrinho, cupons, Pix e cartão dentro da plataforma.
- Pagamento único ou assinatura de um produto digital.
- Conta do cliente, pedidos, comprovantes e contato para retirada ou entrega.
- Biblioteca protegida, leitor de PDFs e progresso de leitura.
- Atendimento e políticas de compra.

## Administração

- Vendas: visão geral, pedidos, financeiro e clientes.
- Catálogo: produtos, PDFs e receitas, categorias e cupons.
- Loja: banners, vitrine, contato, entrega e políticas.

## Fora deste projeto

Treinos interativos, acompanhamento de alunos, planos alimentares individuais,
pontuação, metas, recompensas, comunidade e painéis de professores ou
nutricionistas não fazem parte da loja. As URLs antigas redirecionam para as
áreas comerciais, e os arquivos visuais antigos foram removidos.

## Dados e validação

Pedidos, pagamentos, assinaturas e acessos já adquiridos são preservados.
Migrations antigas são histórico do banco; a limpeza do aplicativo não apaga
registros nem tabelas em produção.

Antes de publicar, executar build, lint e os testes em `tests/`, além de conferir
a navegação mobile. Os valores e acessos devem continuar validados no servidor.
