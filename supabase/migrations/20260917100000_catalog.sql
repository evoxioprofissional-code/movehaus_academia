-- =====================================================================
-- MoveHaus — Fase 4: Catálogo, conteúdos e configurações
-- categories, products (imagens/variações inline), ebooks, ebook_chapters,
-- site_settings + bucket público de imagens. RLS: público lê ativos/publicados;
-- admin gerencia tudo (public.is_admin()).
-- =====================================================================

-- ---------- Enums ----------
do $$ begin
  if not exists (select 1 from pg_type where typname='product_type') then
    create type public.product_type as enum ('physical','digital','ebook');
  end if;
  if not exists (select 1 from pg_type where typname='billing_model') then
    create type public.billing_model as enum ('one_time','subscription');
  end if;
  if not exists (select 1 from pg_type where typname='ebook_status') then
    create type public.ebook_status as enum ('draft','published');
  end if;
end $$;

-- ---------- Categorias ----------
create table if not exists public.categories (
  id         uuid primary key default gen_random_uuid(),
  slug       text unique not null,
  name       text not null,
  position   int not null default 0,
  active     boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------- Produtos (físico/digital/ebook em uma tabela) ----------
create table if not exists public.products (
  id                  uuid primary key default gen_random_uuid(),
  slug                text unique not null,
  type                public.product_type not null,
  name                text not null,
  short_description   text not null default '',
  description         text not null default '',
  category_id         uuid references public.categories (id) on delete set null,
  images              text[] not null default '{}',
  variants            jsonb  not null default '[]',       -- [{label, options[]}]
  featured            boolean not null default false,
  active              boolean not null default true,
  -- físico / pagamento único (valores em centavos)
  price               integer,
  compare_at_price    integer,
  stock               integer not null default 0,
  sku                 text,
  weight_grams        integer,
  -- digital / ebook
  billing_model       public.billing_model,
  monthly_price       integer,
  access_duration_days integer,                            -- null = permanente
  grace_days          integer,
  -- ebook
  author              text,
  chapters_count      integer,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
create index if not exists products_category_idx on public.products (category_id);
create index if not exists products_type_idx on public.products (type);

-- ---------- E-books (1:1 com um product tipo ebook) ----------
create table if not exists public.ebooks (
  product_id uuid primary key references public.products (id) on delete cascade,
  cover_url  text,
  intro      text not null default '',
  status     public.ebook_status not null default 'draft',
  version    int not null default 1,
  updated_at timestamptz not null default now()
);

create table if not exists public.ebook_chapters (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  title      text not null,
  position   int not null default 0,
  content    text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists ebook_chapters_product_idx
  on public.ebook_chapters (product_id, position);

-- ---------- Configurações do site (linha única) ----------
create table if not exists public.site_settings (
  id               int primary key default 1,
  academy_name     text not null default 'MoveHaus Training Club',
  whatsapp         text default '',
  whatsapp_label   text default '',
  email            text default '',
  instagram        text default '',
  address          text default '',
  city             text default '',
  delivery_rules   text default '',
  device_limit     int  default 3,
  grace_days       int  default 5,
  nutritionist_name text default '',
  nutritionist_bio  text default '',
  terms            text default '',
  privacy          text default '',
  updated_at       timestamptz not null default now(),
  constraint site_settings_singleton check (id = 1)
);
insert into public.site_settings (id) values (1) on conflict do nothing;

-- ---------- updated_at ----------
drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at before update on public.products
  for each row execute function public.set_updated_at();
drop trigger if exists ebooks_set_updated_at on public.ebooks;
create trigger ebooks_set_updated_at before update on public.ebooks
  for each row execute function public.set_updated_at();
drop trigger if exists ebook_chapters_set_updated_at on public.ebook_chapters;
create trigger ebook_chapters_set_updated_at before update on public.ebook_chapters
  for each row execute function public.set_updated_at();
drop trigger if exists site_settings_set_updated_at on public.site_settings;
create trigger site_settings_set_updated_at before update on public.site_settings
  for each row execute function public.set_updated_at();

-- =====================================================================
-- RLS
-- =====================================================================
alter table public.categories     enable row level security;
alter table public.products       enable row level security;
alter table public.ebooks         enable row level security;
alter table public.ebook_chapters enable row level security;
alter table public.site_settings  enable row level security;

-- categorias: público vê ativas; admin gerencia
drop policy if exists categories_select on public.categories;
create policy categories_select on public.categories
  for select using (active or public.is_admin());
drop policy if exists categories_admin_write on public.categories;
create policy categories_admin_write on public.categories
  for all using (public.is_admin()) with check (public.is_admin());

-- produtos: público vê ativos; admin gerencia
drop policy if exists products_select on public.products;
create policy products_select on public.products
  for select using (active or public.is_admin());
drop policy if exists products_admin_write on public.products;
create policy products_admin_write on public.products
  for all using (public.is_admin()) with check (public.is_admin());

-- ebooks (meta): público vê publicados; admin gerencia
drop policy if exists ebooks_select on public.ebooks;
create policy ebooks_select on public.ebooks
  for select using (status = 'published' or public.is_admin());
drop policy if exists ebooks_admin_write on public.ebooks;
create policy ebooks_admin_write on public.ebooks
  for all using (public.is_admin()) with check (public.is_admin());

-- capítulos: conteúdo protegido — só admin por enquanto (acesso do cliente na Fase 6)
drop policy if exists ebook_chapters_admin on public.ebook_chapters;
create policy ebook_chapters_admin on public.ebook_chapters
  for all using (public.is_admin()) with check (public.is_admin());

-- configurações: leitura pública; admin escreve
drop policy if exists site_settings_select on public.site_settings;
create policy site_settings_select on public.site_settings
  for select using (true);
drop policy if exists site_settings_admin_write on public.site_settings;
create policy site_settings_admin_write on public.site_settings
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------- Storage: bucket público de imagens do catálogo ----------
insert into storage.buckets (id, name, public)
values ('catalog', 'catalog', true)
on conflict (id) do nothing;
