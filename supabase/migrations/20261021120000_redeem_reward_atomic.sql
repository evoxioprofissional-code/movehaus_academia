-- =====================================================================
-- Resgate de recompensa atômico (evita gasto-duplo em cliques concorrentes).
-- Serializa por usuário com advisory lock; confere saldo, acesso e recompensa,
-- e grava o resgate + o débito de pontos numa única transação.
-- Retorna: 'ok' | 'saldo' | 'invalid'.
-- =====================================================================
create or replace function public.redeem_reward(p_reward_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user    uuid := auth.uid();
  v_cost    int;
  v_title   text;
  v_active  boolean;
  v_balance int;
begin
  if v_user is null then return 'invalid'; end if;
  if not public.has_coaching_access() then return 'invalid'; end if;

  -- Serializa resgates do MESMO usuário dentro da transação.
  perform pg_advisory_xact_lock(hashtext(v_user::text));

  select cost_points, title, active
    into v_cost, v_title, v_active
    from public.rewards
   where id = p_reward_id;
  if v_cost is null or v_active is not true then return 'invalid'; end if;

  select coalesce(sum(points), 0)
    into v_balance
    from public.points_ledger
   where user_id = v_user;
  if v_balance < v_cost then return 'saldo'; end if;

  insert into public.reward_redemptions (user_id, reward_id, reward_title, points_spent, status)
  values (v_user, p_reward_id, v_title, v_cost, 'pending');

  insert into public.points_ledger (user_id, points, reason)
  values (v_user, -v_cost, 'Resgate: ' || v_title);

  return 'ok';
end;
$$;

revoke all on function public.redeem_reward(uuid) from public;
grant execute on function public.redeem_reward(uuid) to authenticated;
