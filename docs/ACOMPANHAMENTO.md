# MoveHaus Acompanhamento (área do aluno) — Plano

Tier premium dentro da MoveHaus: treino + nutrição + evolução para o aluno,
com painéis para professor, nutricionista e dono. É uma **assinatura** — o
acesso é liberado a quem tem direito.

## Modelo de acesso (importante)
O acesso à área é decidido **no servidor** por `coaching_access`:
- **Agora (Sub-fase A):** liberação **manual** pelo admin (`source = 'manual'`).
- **Depois (Fase 5 — pagamentos):** a assinatura ativa passa a conceder acesso
  automaticamente (`source = 'subscription'`), e o cancelamento/inadimplência
  (após carência) revoga. O webhook do Mercado Pago apenas grava em
  `coaching_access` — o resto da área não muda.

Regra de acesso válido: `active = true AND (expires_at IS NULL OR expires_at > now())`.

## Papéis
- `customer` — aluno.
- `professor` — monta treinos, vê feedback/frequência dos seus alunos.
- `nutricionista` — planos alimentares, receitas, check-ins.
- `admin` — dono; enxerga tudo, concede acesso, configura recompensas.

(Os papéis `professor`/`nutricionista` entram na sub-fase dos painéis.)

## Sub-fases (cada uma é uma entrega testável, com aprovação entre elas)
- **A — Fundação e acesso** *(em construção)*: tabela `coaching_access`, RLS,
  função `has_coaching_access()`, tela do admin para conceder/revogar acesso, e
  a entrada do aluno `/acompanhamento` já protegida (com "Meu dia" inicial).
- **B — Treino do aluno**: plano semanal, exercícios (séries/reps/carga/descanso/
  vídeo), **modo treino** (marcar série, registrar carga, cronômetro de descanso),
  feedback pós-treino, evolução de carga.
- **C — Engajamento**: metas, pontos, recompensas (integradas à loja),
  conquistas reais, lembretes.
- **D — Corpo**: peso/medidas, antes-e-depois privado, check-in semanal, hidratação.
- **E — Nutrição**: plano alimentar, receitas, lista de compras.
- **F — Painéis**: professor, nutricionista e dono + alerta de aluno desengajado.

## Segurança e privacidade
- Fotos, peso, medidas e anotações são **privados**: visíveis só para o próprio
  aluno e profissionais autorizados (RLS por dono / por vínculo).
- Fotos de evolução em bucket **privado** (URLs assinadas), nunca público.
- Autorização de acesso à área sempre conferida no servidor.

## Estado atual
Sub-fase A em construção. Migration `*_coaching_foundation.sql`.
