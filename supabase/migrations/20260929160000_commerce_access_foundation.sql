-- MoveHaus — fundação segura para pedidos e conteúdos digitais.
-- A integração com o provedor de pagamento fica desacoplada destas tabelas.

do $$ begin
  if not exists (select 1 from pg_type where typname = 'subscription_status') then
    create type public.subscription_status as enum ('pending','active','past_due','cancelled','expired');
  end if;
  if not exists (select 1 from pg_type where typname = 'access_status') then
    create type public.access_status as enum ('active','revoked','expired');
  end if;
end $$;

alter table public.orders
  add column if not exists idempotency_key text,
  add column if not exists coupon_id uuid references public.coupons(id) on delete set null,
  add column if not exists customer_email text,
  add column if not exists customer_name text,
  add column if not exists customer_phone text;

create unique index if not exists orders_idempotency_key_idx
  on public.orders(idempotency_key) where idempotency_key is not null;

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  provider text not null,
  provider_payment_id text,
  status public.payment_status not null default 'pending',
  amount integer not null check (amount >= 0),
  method text,
  idempotency_key text not null unique,
  provider_payload jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  provider text,
  provider_subscription_id text,
  status public.subscription_status not null default 'pending',
  monthly_amount integer not null check (monthly_amount >= 0),
  grace_days integer not null default 0,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, product_id)
);

create table if not exists public.digital_access (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  order_id uuid references public.orders(id) on delete set null,
  subscription_id uuid references public.subscriptions(id) on delete set null,
  status public.access_status not null default 'active',
  permanent boolean not null default false,
  starts_at timestamptz not null default now(),
  expires_at timestamptz,
  revoked_at timestamptz,
  revoked_by uuid references public.profiles(id) on delete set null,
  reason text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, product_id)
);

create table if not exists public.reading_progress (
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  chapter_id uuid references public.ebook_chapters(id) on delete set null,
  progress_percent numeric(5,2) not null default 0 check (progress_percent between 0 and 100),
  updated_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

create table if not exists public.coupon_redemptions (
  id uuid primary key default gen_random_uuid(),
  coupon_id uuid not null references public.coupons(id) on delete restrict,
  user_id uuid references public.profiles(id) on delete set null,
  order_id uuid not null unique references public.orders(id) on delete cascade,
  discount integer not null check (discount >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.customer_devices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  device_hash text not null,
  label text not null default 'Dispositivo',
  last_seen_at timestamptz not null default now(),
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, device_hash)
);

create table if not exists public.access_logs (
  id bigint generated always as identity primary key,
  user_id uuid references public.profiles(id) on delete set null,
  product_id uuid references public.products(id) on delete set null,
  device_id uuid references public.customer_devices(id) on delete set null,
  action text not null,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists payments_order_idx on public.payments(order_id, created_at desc);
create index if not exists subscriptions_user_idx on public.subscriptions(user_id, status);
create index if not exists digital_access_user_idx on public.digital_access(user_id, status);
create index if not exists access_logs_user_idx on public.access_logs(user_id, created_at desc);

drop trigger if exists payments_set_updated_at on public.payments;
create trigger payments_set_updated_at before update on public.payments for each row execute function public.set_updated_at();
drop trigger if exists subscriptions_set_updated_at on public.subscriptions;
create trigger subscriptions_set_updated_at before update on public.subscriptions for each row execute function public.set_updated_at();
drop trigger if exists digital_access_set_updated_at on public.digital_access;
create trigger digital_access_set_updated_at before update on public.digital_access for each row execute function public.set_updated_at();
drop trigger if exists reading_progress_set_updated_at on public.reading_progress;
create trigger reading_progress_set_updated_at before update on public.reading_progress for each row execute function public.set_updated_at();

alter table public.payments enable row level security;
alter table public.subscriptions enable row level security;
alter table public.digital_access enable row level security;
alter table public.reading_progress enable row level security;
alter table public.coupon_redemptions enable row level security;
alter table public.customer_devices enable row level security;
alter table public.access_logs enable row level security;

create policy payments_owner_read on public.payments for select using (
  exists (select 1 from public.orders o where o.id = order_id and (o.customer_id = auth.uid() or public.is_admin()))
);
create policy payments_admin_all on public.payments for all using (public.is_admin()) with check (public.is_admin());
create policy subscriptions_owner_read on public.subscriptions for select using (user_id = auth.uid() or public.is_admin());
create policy subscriptions_admin_all on public.subscriptions for all using (public.is_admin()) with check (public.is_admin());
create policy digital_access_owner_read on public.digital_access for select using (user_id = auth.uid() or public.is_admin());
create policy digital_access_admin_all on public.digital_access for all using (public.is_admin()) with check (public.is_admin());
create policy reading_progress_owner_all on public.reading_progress for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy reading_progress_admin_read on public.reading_progress for select using (public.is_admin());
create policy coupon_redemptions_owner_read on public.coupon_redemptions for select using (user_id = auth.uid() or public.is_admin());
create policy coupon_redemptions_admin_all on public.coupon_redemptions for all using (public.is_admin()) with check (public.is_admin());
create policy customer_devices_owner_all on public.customer_devices for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy customer_devices_admin_all on public.customer_devices for all using (public.is_admin()) with check (public.is_admin());
create policy access_logs_owner_insert on public.access_logs for insert with check (user_id = auth.uid());
create policy access_logs_owner_read on public.access_logs for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists ebook_chapters_entitled_read on public.ebook_chapters;
create policy ebook_chapters_entitled_read on public.ebook_chapters for select using (
  public.is_admin() or exists (
    select 1 from public.digital_access da
    where da.product_id = ebook_chapters.product_id
      and da.user_id = auth.uid()
      and da.status = 'active'
      and (da.permanent or da.expires_at is null or da.expires_at > now())
  )
);

-- Bucket privado para imagens inseridas em capítulos protegidos.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('protected-content', 'protected-content', false, 8388608, array['image/jpeg','image/png','image/webp','image/avif'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

create policy protected_content_admin_all on storage.objects for all
  using (bucket_id = 'protected-content' and public.is_admin())
  with check (bucket_id = 'protected-content' and public.is_admin());
