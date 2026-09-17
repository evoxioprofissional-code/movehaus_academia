# Imagens da MoveHaus

Coloque aqui as fotos reais da academia (treino, alunos, professores,
ambiente, produtos). Depois é só apontar o caminho no arquivo de conteúdo.

## Como usar

1. Salve a foto nesta pasta, ex.: `public/images/hero.jpg`.
2. Abra `src/content/home.ts` e troque o `src` do slot correspondente:
   ```ts
   image: { src: "/images/hero.jpg", alt: "Treino na MoveHaus" }
   ```
3. Pronto — a foto substitui o placeholder automaticamente.

## Sugestões de fotos (proporção)

- `hero.jpg` — treino/ambiente, horizontal, alta resolução (para o topo).
- `academia.jpg` — visão ampla do espaço (bloco "A academia").
- `aluno.jpg`, `professor.jpg` — retratos verticais.
- `comunidade.jpg` — grupo/aula (bloco "Sobre a MoveHaus").

Formatos recomendados: `.webp` ou `.jpg` otimizados. Evite imagens de bancos
genéricos que possam não representar a MoveHaus.
