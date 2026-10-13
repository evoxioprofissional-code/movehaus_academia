-- =====================================================================
-- MoveHaus Acompanhamento — Métodos de treino, volume load e PSE (RPE)
-- - workout_exercises: método (bi-set, tri-set, drop-set...) + rótulo de grupo
-- - workout_sessions: PSE (0-10) e volume load total da sessão (tonelagem)
-- RLS já cobre as novas colunas pelas políticas existentes.
-- =====================================================================

alter table public.workout_exercises
  add column if not exists method text not null default 'normal',
  add column if not exists group_label text not null default '';

alter table public.workout_exercises drop constraint if exists workout_exercises_method_check;
alter table public.workout_exercises add constraint workout_exercises_method_check
  check (method in ('normal','biset','triset','superset','dropset','rest_pause','piramide'));

alter table public.workout_sessions
  add column if not exists rpe smallint,
  add column if not exists total_volume_load numeric(12,2) not null default 0;

alter table public.workout_sessions drop constraint if exists workout_sessions_rpe_check;
alter table public.workout_sessions add constraint workout_sessions_rpe_check
  check (rpe is null or (rpe >= 0 and rpe <= 10));
