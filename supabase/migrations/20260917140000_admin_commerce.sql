-- MoveHaus — evolução incremental do painel administrativo.
-- Preserva products.images e demais campos legados para compatibilidade.

do $$ begin
  if not exists (select 1 from pg_type where typname = 'order_status') then
    create type public.order_status as enum ('pending','paid','preparing','shipped','delivered','cancelled');
  end if;
  if not exists (select 1 from pg_type where typname = 'payment_status') then
    create type public.payment_status as enum ('pending','approved','failed','refunded','cancelled');
  end if;
  if not exists (select 1 from pg_type where typname = 'discount_type') then
    create type public.discount_type as enum ('percentage','fixed');
  end if;
end $$;

alter table public.products
  add column if not exists status text not null default 'active',
  add column if not exists tags text[] not null default '{}',
  add column if not exists promotion_starts_at timestamptz,
  add column if not exists promotion_ends_at timestamptz,
  add column if not exists featured_order integer,
  add column if not exists is_new boolean not null default false,
  add column if not exists show_on_home boolean not null default false,
  add column if not exists custom_badge text,
  add column if not exists track_inventory boolean not null default true,
  add column if not exists minimum_stock integer not null default 5,
  add column if not exists allow_backorder boolean not null default false,
  add column if not exists requires_shipping boolean not null default true,
  add column if not exists width_cm numeric(10,2),
  add column if not exists height_cm numeric(10,2),
  add column if not exists length_cm numeric(10,2),
  add column if not exists extra_lead_days integer not null default 0,
  add column if not exists shipping_notes text not null default '',
  add column if not exists published_at timestamptz;

alter table public.profiles
  add column if not exists phone text,
  add column if not exists status text not null default 'active',
  add column if not exists last_access_at timestamptz,
  add column if not exists internal_notes text not null default '';

alter table public.ebooks add column if not exists cover_path text;

update public.products set show_on_home = featured where featured and not show_on_home;
update public.products set status = case when active then 'active' else 'inactive' end;

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  storage_path text,
  legacy_url text,
  alt_text text not null default '',
  is_primary boolean not null default false,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  constraint product_image_source check (storage_path is not null or legacy_url is not null)
);
create index if not exists product_images_product_idx on public.product_images(product_id, display_order);
create unique index if not exists product_images_unique_storage_path_idx
  on public.product_images(storage_path) where storage_path is not null;
create unique index if not exists product_images_one_primary_idx
  on public.product_images(product_id) where is_primary;

insert into public.product_images (product_id, legacy_url, alt_text, is_primary, display_order)
select p.id, image_url, p.name, ordinality = 1, ordinality - 1
from public.products p
cross join lateral unnest(p.images) with ordinality as image_list(image_url, ordinality)
where not exists (
  select 1 from public.product_images pi
  where pi.product_id = p.id and pi.legacy_url = image_url
)
on conflict do nothing;

create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  name text not null,
  value text not null,
  sku text,
  stock integer not null default 0,
  price_delta integer not null default 0,
  active boolean not null default true,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists product_variants_product_idx on public.product_variants(product_id, position);

create table if not exists public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  variant_id uuid references public.product_variants(id) on delete set null,
  quantity integer not null,
  balance_after integer not null,
  reason text not null,
  note text not null default '',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists inventory_movements_product_idx on public.inventory_movements(product_id, created_at desc);

alter table public.categories
  add column if not exists description text not null default '',
  add column if not exists image_path text,
  add column if not exists updated_at timestamptz not null default now();

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number bigint generated by default as identity unique,
  customer_id uuid references public.profiles(id) on delete set null,
  status public.order_status not null default 'pending',
  payment_status public.payment_status not null default 'pending',
  subtotal integer not null default 0,
  discount integer not null default 0,
  shipping integer not null default 0,
  total integer not null default 0,
  payment_method text,
  shipping_address jsonb,
  notes text not null default '',
  source text not null default 'store',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  sku text,
  quantity integer not null check (quantity > 0),
  unit_price integer not null check (unit_price >= 0),
  total integer not null check (total >= 0),
  metadata jsonb not null default '{}'
);

create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  description text not null default '',
  discount_type public.discount_type not null,
  discount_value integer not null check (discount_value > 0),
  minimum_order integer not null default 0,
  usage_limit integer,
  usage_per_customer integer,
  product_ids uuid[] not null default '{}',
  category_ids uuid[] not null default '{}',
  starts_at timestamptz,
  ends_at timestamptz,
  active boolean not null default true,
  usage_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.banners (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text not null default '',
  desktop_image_path text,
  mobile_image_path text,
  button_label text,
  link text,
  starts_at timestamptz,
  ends_at timestamptz,
  active boolean not null default false,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.product_images enable row level security;
alter table public.product_variants enable row level security;
alter table public.inventory_movements enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.coupons enable row level security;
alter table public.banners enable row level security;

create policy product_images_public_read on public.product_images for select
  using (exists (select 1 from public.products p where p.id = product_id and (p.active or public.is_admin())));
create policy product_images_admin_write on public.product_images for all
  using (public.is_admin()) with check (public.is_admin());
create policy product_variants_public_read on public.product_variants for select
  using (active and exists (select 1 from public.products p where p.id = product_id and p.active) or public.is_admin());
create policy product_variants_admin_write on public.product_variants for all
  using (public.is_admin()) with check (public.is_admin());
create policy inventory_admin_all on public.inventory_movements for all
  using (public.is_admin()) with check (public.is_admin());
create policy orders_owner_read on public.orders for select
  using (customer_id = auth.uid() or public.is_admin());
create policy orders_admin_write on public.orders for all
  using (public.is_admin()) with check (public.is_admin());
create policy order_items_owner_read on public.order_items for select
  using (exists (select 1 from public.orders o where o.id = order_id and (o.customer_id = auth.uid() or public.is_admin())));
create policy order_items_admin_write on public.order_items for all
  using (public.is_admin()) with check (public.is_admin());
create policy coupons_admin_all on public.coupons for all
  using (public.is_admin()) with check (public.is_admin());
create policy banners_public_read on public.banners for select
  using (active or public.is_admin());
create policy banners_admin_write on public.banners for all
  using (public.is_admin()) with check (public.is_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('catalog', 'catalog', true, 8388608, array['image/jpeg','image/png','image/webp','image/avif'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists catalog_public_read on storage.objects;
create policy catalog_public_read on storage.objects for select
  using (bucket_id = 'catalog');
drop policy if exists catalog_admin_insert on storage.objects;
create policy catalog_admin_insert on storage.objects for insert
  with check (bucket_id = 'catalog' and public.is_admin());
drop policy if exists catalog_admin_update on storage.objects;
create policy catalog_admin_update on storage.objects for update
  using (bucket_id = 'catalog' and public.is_admin())
  with check (bucket_id = 'catalog' and public.is_admin());
drop policy if exists catalog_admin_delete on storage.objects;
create policy catalog_admin_delete on storage.objects for delete
  using (bucket_id = 'catalog' and public.is_admin());
