# Design System — MoveHaus Training Club

Esportivo, forte, moderno e premium. **Dark-first** (a marca é preta).
Definido em `src/app/globals.css` via `@theme` do Tailwind v4.

## Cores (tokens)

| Token | Hex | Uso |
|-------|-----|-----|
| `mh-red` | `#e5121c` | Ação, destaque, CTAs |
| `mh-red-hover` | `#c00f18` | Hover de ação |
| `mh-black` | `#0a0a0b` | Fundo base |
| `mh-ink` | `#050506` | Fundo mais profundo (rodapé) |
| `mh-surface` | `#141416` | Cards / superfícies |
| `mh-surface-2` | `#1c1c1f` | Superfície elevada |
| `mh-border` | `#2a2a2e` | Bordas / divisores |
| `mh-muted` | `#8b8b93` | Texto secundário |
| `mh-text` | `#f4f4f5` | Texto principal |

Uso em classes: `bg-mh-black`, `text-mh-red`, `border-mh-border`, etc.
Vermelho é **acento**, não preenchimento de fundo — usar com parcimônia.

## Tipografia
- **Display** (`font-display` → Oswald): títulos, botões. Condensada, atlética,
  combina com o wordmark da logo. Caixa alta em títulos/CTAs.
- **Texto** (`font-sans` → Inter): corpo, parágrafos, UI.

## Forma e profundidade
- Raio padrão: `rounded-mh` (`--radius-mh`, 0.75rem).
- Sombra: `shadow-mh` para elevação discreta.
- Superfícies com borda sutil `mh-border` em vez de sombras pesadas.

## Princípios
- Hierarquia visual forte, espaçamento consistente.
- Animações leves e naturais (transições de cor/opacidade), sem exagero.
- Sem gradientes berrantes; no máximo um brilho radial vermelho discreto no hero.
- Mobile impecável: layout fluido, alvos de toque ≥ 40px, nav mobile na Fase 2.
- Estados obrigatórios nas telas: loading (skeleton), vazio (empty state),
  erro útil, foco visível (`focus-visible` com anel vermelho).
- Acessibilidade: contraste adequado, `aria-label` em ícones-ação, HTML semântico.

## O que evitar (anti "cara de IA")
- Emojis aleatórios, ícones-clichê (ex.: Sparkles) e textos de dev na UI.
- Copy genérica; preferir mensagens concretas da marca.
- Carrosséis desnecessários e excesso de efeitos.
