-- =====================================================================
-- MoveHaus — Seed inicial do catálogo (idempotente por slug).
-- Espelha os dados de exemplo usados na fase visual. Substituíveis pelo
-- painel administrativo. Rodar UMA vez após as migrations.
-- =====================================================================

insert into public.categories (slug, name, position) values
  ('vestuario',  'Vestuário',           1),
  ('acessorios', 'Acessórios',          2),
  ('programas',  'Programas de treino', 3),
  ('nutricao',   'Nutrição',            4)
on conflict (slug) do nothing;

-- ---------- Produtos físicos ----------
insert into public.products
  (slug, type, name, short_description, description, category_id, variants, featured, active, price, compare_at_price, stock, sku, weight_grams)
values
  ('camiseta-dry-movehaus','physical','Camiseta Dry MoveHaus',
   'Tecido leve com secagem rápida para treino pesado.',
   'Camiseta de treino em malha dry com toque seco e caimento atlético. Costuras reforçadas e logo emborrachado no peito. Feita para suar sem pesar.',
   (select id from public.categories where slug='vestuario'),
   '[{"label":"Tamanho","options":["P","M","G","GG"]}]', true, true, 12900, 15900, 42, 'MH-CAM-DRY', 180),
  ('regata-training','physical','Regata Training',
   'Cava ampla e liberdade total de movimento.',
   'Regata de treino com cava esportiva e tecido respirável. Corte reto, sem apertar. Ideal para dias de ombro e costas.',
   (select id from public.categories where slug='vestuario'),
   '[{"label":"Tamanho","options":["P","M","G","GG"]}]', false, true, 9900, null, 30, 'MH-REG-01', 150),
  ('moletom-movehaus','physical','Moletom MoveHaus',
   'Para o aquecimento e para a rua.',
   'Moletom flanelado por dentro, com capuz e bolso canguru. Peso médio, quente sem esquentar demais. Bordado da marca no peito.',
   (select id from public.categories where slug='vestuario'),
   '[{"label":"Tamanho","options":["P","M","G","GG"]}]', true, true, 21900, null, 18, 'MH-MOL-01', 520),
  ('squeeze-1l','physical','Squeeze MoveHaus 1L',
   'Garrafa de 1 litro livre de BPA.',
   'Garrafa de treino de 1 litro com marcação de volume e bico de rosca vedante. Material resistente e livre de BPA.',
   (select id from public.categories where slug='acessorios'),
   '[]', false, true, 5900, 6900, 60, 'MH-SQZ-1L', 140),
  ('straps-de-treino','physical','Straps de Treino',
   'Pegada firme nos exercícios de puxada.',
   'Par de straps em algodão reforçado para auxiliar a pegada em levantamentos e puxadas. Costura dupla e boa durabilidade.',
   (select id from public.categories where slug='acessorios'),
   '[]', false, true, 4500, null, 0, 'MH-STR-01', 90)
on conflict (slug) do nothing;

-- ---------- Produtos digitais (programas) ----------
insert into public.products
  (slug, type, name, short_description, description, category_id, featured, active, billing_model, price, monthly_price, access_duration_days, grace_days)
values
  ('programa-hipertrofia-12-semanas','digital','Programa de Hipertrofia — 12 semanas',
   'Plano completo de 12 semanas para ganho de massa.',
   'Programa progressivo de 12 semanas com divisão de treinos, séries, repetições e orientações de execução. Pensado para quem já treina e quer estrutura para evoluir. Acesso permanente após a compra.',
   (select id from public.categories where slug='programas'),
   true, true, 'one_time', 14900, null, null, null),
  ('full-body-clube','digital','Full Body Clube — treinos mensais',
   'Treinos novos todo mês enquanto a assinatura estiver ativa.',
   'Assinatura com novos treinos full body publicados mensalmente, com variações para academia e para casa. O acesso acompanha a assinatura ativa.',
   (select id from public.categories where slug='programas'),
   true, true, 'subscription', null, 3990, null, 5)
on conflict (slug) do nothing;

-- ---------- E-books ----------
insert into public.products
  (slug, type, name, short_description, description, category_id, featured, active, billing_model, price, monthly_price, access_duration_days, grace_days, author, chapters_count)
values
  ('guia-alimentacao-para-treino','ebook','Guia de Alimentação para Treino',
   'Como organizar as refeições em torno do treino.',
   'Material introdutório sobre organização das refeições ao longo do dia de treino, hidratação e leitura de rótulos. Conteúdo educativo, sem substituir acompanhamento individual.',
   (select id from public.categories where slug='nutricao'),
   true, true, 'one_time', 4900, null, null, null, 'Equipe MoveHaus', 6),
  ('receitas-do-clube','ebook','Receitas do Clube',
   'Novas receitas práticas todo mês.',
   'Coletânea de receitas práticas atualizada mensalmente, com opções para diferentes objetivos. O acesso acompanha a assinatura ativa.',
   (select id from public.categories where slug='nutricao'),
   false, true, 'subscription', null, 2490, null, 7, 'Equipe MoveHaus', 10),
  ('organizacao-de-rotina-90-dias','ebook','Organização de Rotina — 90 dias',
   'Planejamento de treino e alimentação por 90 dias.',
   'Guia com um plano de 90 dias para organizar treino, sono e refeições. Acesso liberado por 180 dias após a compra.',
   (select id from public.categories where slug='nutricao'),
   false, true, 'one_time', 6900, null, 180, null, 'Equipe MoveHaus', 8)
on conflict (slug) do nothing;

-- ---------- Meta dos e-books (publicados) ----------
insert into public.ebooks (product_id, intro, status)
select id, 'Conteúdo educativo da MoveHaus. Boa leitura!', 'published'
from public.products where type = 'ebook'
on conflict (product_id) do nothing;
