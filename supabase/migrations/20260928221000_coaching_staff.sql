-- =====================================================================
-- MoveHaus Acompanhamento — Sub-fase F: equipe (staff)
-- is_staff() = admin | professor | nutricionista. Concede LEITURA dos dados
-- de acompanhamento dos alunos à equipe. Fotos de evolução continuam
-- privadas (só o dono). Gestão (escrita) segue restrita ao admin.
-- =====================================================================

create or replace function public.is_staff()
returns boolean language sql security definer set search_path = public stable as $$
  select exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role in ('admin', 'professor', 'nutricionista')
  );
$$;

-- Leitura para a equipe em todas as tabelas de acompanhamento (menos fotos).
do $$
declare t text;
begin
  foreach t in array array[
    'workout_plans','workout_days','workout_exercises','workout_sessions','exercise_logs',
    'body_metrics','checkins','hydration_logs',
    'goals','achievements','points_ledger',
    'meal_plans','meals','meal_items','meal_logs',
    'coaching_access','reward_redemptions'
  ] loop
    execute format('drop policy if exists %I on public.%I', t || '_staff_read', t);
    execute format('create policy %I on public.%I for select using (public.is_staff())', t || '_staff_read', t);
  end loop;
end $$;

-- A equipe também lê os perfis dos alunos (nomes/contato).
drop policy if exists profiles_staff_read on public.profiles;
create policy profiles_staff_read on public.profiles for select using (public.is_staff());
