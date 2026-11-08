-- ============================================================================
-- BatchProof — Supabase schema
-- Run this whole file in the Supabase SQL editor (Project Settings > SQL).
-- It creates the tables, row-level security policies and the profile
-- trigger. Re-running it is safe: statements are guarded where possible,
-- otherwise drop the created objects first.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- profiles: one row per auth user, extended with business details.
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'user' check (role in ('user', 'admin')),
  business_name text,
  contact_email text,
  industry text,
  website text,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- products: catalog of goods a business registers.
-- ----------------------------------------------------------------------------
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  sku text not null,
  category text,
  description text,
  created_at timestamptz not null default now(),
  unique (owner_id, sku)
);

-- ----------------------------------------------------------------------------
-- batches: one record per production batch. `data_hash` is the SHA-256
-- fingerprint that may be anchored on-chain (Arbitrum Sepolia). The blockchain
-- never stores business information — only this hash.
-- ----------------------------------------------------------------------------
create table if not exists public.batches (
  id uuid primary key default gen_random_uuid(),
  batch_code text unique not null,
  owner_id uuid not null references public.profiles (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete restrict,
  producer_name text not null,
  origin text not null,
  production_date date not null,
  expiry_date date not null,
  description text,
  status text not null default 'registered'
    check (status in ('registered', 'in_distribution', 'delivered', 'recalled', 'revoked')),
  data_hash text not null,
  anchor_tx_hash text,
  anchored_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- batch_events: distribution, inspection and status history for a batch.
-- ----------------------------------------------------------------------------
create table if not exists public.batch_events (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null references public.batches (id) on delete cascade,
  event_type text not null check (event_type in ('registered', 'distribution', 'inspection', 'status_update')),
  status text,
  location text,
  result text check (result is null or result in ('passed', 'failed')),
  notes text,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- reports: public issue reports filed from verification pages.
-- ----------------------------------------------------------------------------
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  batch_code text not null,
  reason text not null,
  details text,
  reporter_contact text,
  status text not null default 'open' check (status in ('open', 'reviewed', 'resolved')),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_products_owner on public.products (owner_id);
create index if not exists idx_batches_owner on public.batches (owner_id);
create index if not exists idx_batches_product on public.batches (product_id);
create index if not exists idx_batch_events_batch on public.batch_events (batch_id);
create index if not exists idx_reports_status on public.reports (status);

-- ============================================================================
-- Helpers
-- ============================================================================

-- is_admin(): true when the caller's profile has the admin role. SECURITY
-- DEFINER avoids recursion through the profiles RLS policies.
create or replace function public.is_admin() returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- prevent_role_escalation(): regular users cannot grant themselves the admin
-- role through a profile update; only admins may change roles.
create or replace function public.prevent_role_escalation() returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role and not public.is_admin() then
    raise exception 'Only administrators can change user roles';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_prevent_role_escalation on public.profiles;
create trigger trg_prevent_role_escalation
  before update on public.profiles
  for each row execute function public.prevent_role_escalation();

-- touch_updated_at(): keep updated_at current on mutable tables.
create or replace function public.touch_updated_at() returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at before update on public.profiles
  for each row execute function public.touch_updated_at();

drop trigger if exists trg_batches_updated_at on public.batches;
create trigger trg_batches_updated_at before update on public.batches
  for each row execute function public.touch_updated_at();

-- handle_new_user(): create a profile whenever somebody signs up.
create or replace function public.handle_new_user() returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, business_name, contact_email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'business_name', ''),
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists trg_on_auth_user_created on auth.users;
create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- Row level security
-- ============================================================================

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.batches enable row level security;
alter table public.batch_events enable row level security;
alter table public.reports enable row level security;

-- profiles -------------------------------------------------------------------
create policy "profiles: users read own or admin reads all"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

create policy "profiles: users update own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "profiles: admins update any"
  on public.profiles for update
  using (public.is_admin())
  with check (public.is_admin());

-- products -------------------------------------------------------------------
create policy "products: publicly readable"
  on public.products for select using (true);

create policy "products: owners insert"
  on public.products for insert
  with check (auth.uid() = owner_id);

create policy "products: owners update"
  on public.products for update
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "products: owners delete"
  on public.products for delete
  using (auth.uid() = owner_id);

-- batches --------------------------------------------------------------------
-- Batches and their history are publicly readable by design: that is what QR
-- verification pages display. Writes stay with the owning business or admins.
create policy "batches: publicly readable"
  on public.batches for select using (true);

create policy "batches: owners insert"
  on public.batches for insert
  with check (auth.uid() = owner_id);

create policy "batches: owners update"
  on public.batches for update
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "batches: owners delete"
  on public.batches for delete
  using (auth.uid() = owner_id);

create policy "batches: admins update"
  on public.batches for update
  using (public.is_admin())
  with check (public.is_admin());

-- batch_events ---------------------------------------------------------------
create policy "batch_events: publicly readable"
  on public.batch_events for select using (true);

create policy "batch_events: owners insert for own batches"
  on public.batch_events for insert
  with check (
    auth.uid() = created_by
    and exists (
      select 1 from public.batches b
      where b.id = batch_id and b.owner_id = auth.uid()
    )
  );

create policy "batch_events: admins insert"
  on public.batch_events for insert
  with check (public.is_admin());

-- reports --------------------------------------------------------------------
create policy "reports: anyone can file"
  on public.reports for insert with check (true);

create policy "reports: admins read"
  on public.reports for select using (public.is_admin());

create policy "reports: admins update"
  on public.reports for update
  using (public.is_admin())
  with check (public.is_admin());

-- ============================================================================
-- Making the first administrator
-- Sign up in the app, then run in the SQL editor:
--   update public.profiles set role = 'admin' where contact_email = 'you@example.com';
-- ============================================================================
