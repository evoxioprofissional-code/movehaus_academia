# Roadmap — MoveHaus Training Club

Trabalho por fases. Cada fase termina com build/typecheck válidos e **aguarda
aprovação explícita** antes da próxima. `docs/` é a fonte de verdade.

| Fase | Escopo | Status |
|------|--------|--------|
| 1 | Auditoria e fundação (stack, design system, estrutura, Supabase clients, env, docs) | ✅ Concluída |
| 2 | Interface pública (home, catálogo, produto, carrinho, auth visual, responsividade) | ✅ Concluída |
| 3 | Banco e autenticação (migrations, tipos, RLS, perfis, papéis, proteção de rotas) | ✅ Concluída |
| 4 | Painel administrativo (dashboard, produtos, e-books, capítulos, clientes, pedidos, promoções, configurações) | ⏳ Aguardando aprovação |
| 5 | Pagamentos (Mercado Pago: pagamento único, assinatura, webhooks, idempotência, liberação/bloqueio) | ⬜ |
| 6 | Área do cliente e leitor (biblioteca, assinaturas, pedidos, leitor, progresso, marca-d'água, dispositivos, logs) | ⬜ |
| 7 | Revisão (build, lint, TS, responsividade, segurança, acessibilidade, desempenho, docs) | ⬜ |

## Regras de execução

1. Uma etapa por vez.
2. Validar TypeScript, build e responsividade antes de seguir.
3. Preservar o que funciona; não trocar dependências sem necessidade.
4. Autorização de acesso a conteúdo é **sempre** decidida no servidor.
5. Preço final e estoque **sempre** confirmados no servidor.
6. Nada de cara de site gerado por IA: copy concreta, sem emojis aleatórios,
   sem gradientes exagerados.
