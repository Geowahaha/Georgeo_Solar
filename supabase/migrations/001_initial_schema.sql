-- Georgeo_Solar / Duck4 Solar — initial schema, RLS, storage
-- Run in Supabase SQL Editor or via CLI: supabase db push

-- Extensions
create extension if not exists "pgcrypto";

-- Enums
do $$ begin
  create type public.user_role as enum ('admin', 'user');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.lead_temperature as enum ('HOT', 'WARM', 'COLD');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.pipeline_status as enum (
    'new',
    'contacted',
    'site_visit',
    'quote',
    'closed',
    'install',
    'support'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.roof_type as enum ('tile', 'metal', 'concrete');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.property_type as enum ('home', 'factory');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.lead_image_kind as enum ('bill', 'roof', 'project');
exception when duplicate_object then null;
end $$;

-- Profiles (1:1 auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.user_role not null default 'user',
  full_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_role_idx on public.profiles (role);

-- Leads
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  contact_email text not null,
  full_name text not null,
  phone text not null,
  line_id text,
  facebook_profile text,
  address text not null,
  lat double precision,
  lng double precision,
  monthly_bill_thb numeric(12, 2) not null,
  roof_type public.roof_type not null,
  property_type public.property_type not null,
  budget_range text not null,
  notes text,
  score integer not null default 0,
  temperature public.lead_temperature not null default 'COLD',
  status public.pipeline_status not null default 'new',
  user_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists leads_contact_email_idx on public.leads (lower(contact_email));
create index if not exists leads_temperature_idx on public.leads (temperature);
create index if not exists leads_status_idx on public.leads (status);
create index if not exists leads_user_id_idx on public.leads (user_id);
create index if not exists leads_created_at_idx on public.leads (created_at desc);

-- Lead images
create table if not exists public.lead_images (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads (id) on delete cascade,
  storage_path text not null,
  kind public.lead_image_kind not null,
  created_at timestamptz not null default now()
);

create index if not exists lead_images_lead_id_idx on public.lead_images (lead_id);

-- Projects (post-close / install tracking)
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads (id) on delete cascade,
  title text not null default 'Solar installation',
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists projects_lead_id_idx on public.projects (lead_id);

-- Project status history
create table if not exists public.project_status_history (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  from_status text,
  to_status text not null,
  note text,
  changed_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists project_status_history_project_id_idx
  on public.project_status_history (project_id, created_at desc);

-- Proposals
create table if not exists public.proposals (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads (id) on delete cascade,
  system_kw numeric(12, 4) not null,
  price_thb numeric(14, 2) not null,
  monthly_savings_thb numeric(14, 2) not null,
  annual_savings_thb numeric(14, 2) not null,
  roi_years numeric(12, 2) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (lead_id)
);

create index if not exists proposals_lead_id_idx on public.proposals (lead_id);

-- Notes (lead-level activity)
create table if not exists public.lead_notes (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads (id) on delete cascade,
  body text not null,
  author_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists lead_notes_lead_id_idx on public.lead_notes (lead_id, created_at desc);

-- Triggers: updated_at
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists leads_updated_at on public.leads;
create trigger leads_updated_at
before update on public.leads
for each row execute function public.set_updated_at();

drop trigger if exists projects_updated_at on public.projects;
create trigger projects_updated_at
before update on public.projects
for each row execute function public.set_updated_at();

drop trigger if exists proposals_updated_at on public.proposals;
create trigger proposals_updated_at
before update on public.proposals
for each row execute function public.set_updated_at();

-- Helper: is admin
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  );
$$;

-- Helper: owns lead (by user_id or email match)
create or replace function public.owns_lead(l public.leads)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    auth.uid() is not null
    and (
      l.user_id = auth.uid()
      or lower(l.contact_email) = lower((select u.email from auth.users u where u.id = auth.uid()))
    );
$$;

-- New user → profile row
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role, full_name)
  values (
    new.id,
    'user',
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;

  update public.leads l
  set user_id = new.id
  where lower(l.contact_email) = lower(new.email)
    and l.user_id is null;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- RLS
alter table public.profiles enable row level security;
alter table public.leads enable row level security;
alter table public.lead_images enable row level security;
alter table public.projects enable row level security;
alter table public.project_status_history enable row level security;
alter table public.proposals enable row level security;
alter table public.lead_notes enable row level security;

-- Profiles policies
drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin"
  on public.profiles for select
  using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles for insert
  with check (id = auth.uid());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- Leads: users see own + admins see all (insert via service role in app)
drop policy if exists "leads_select" on public.leads;
create policy "leads_select"
  on public.leads for select
  using (public.is_admin() or public.owns_lead(leads));

drop policy if exists "leads_update_admin" on public.leads;
create policy "leads_update_admin"
  on public.leads for update
  using (public.is_admin())
  with check (public.is_admin());

-- Lead images
drop policy if exists "lead_images_select" on public.lead_images;
create policy "lead_images_select"
  on public.lead_images for select
  using (
    public.is_admin()
    or exists (
      select 1 from public.leads l
      where l.id = lead_images.lead_id
        and public.owns_lead(l)
    )
  );

drop policy if exists "lead_images_insert_admin" on public.lead_images;
create policy "lead_images_insert_admin"
  on public.lead_images for insert
  with check (public.is_admin());

-- Projects
drop policy if exists "projects_select" on public.projects;
create policy "projects_select"
  on public.projects for select
  using (
    public.is_admin()
    or exists (
      select 1 from public.leads l
      where l.id = projects.lead_id
        and public.owns_lead(l)
    )
  );

drop policy if exists "projects_update_admin" on public.projects;
create policy "projects_update_admin"
  on public.projects for update
  using (public.is_admin());

drop policy if exists "projects_insert_admin" on public.projects;
create policy "projects_insert_admin"
  on public.projects for insert
  with check (public.is_admin());

-- Project history
drop policy if exists "project_status_history_select" on public.project_status_history;
create policy "project_status_history_select"
  on public.project_status_history for select
  using (
    public.is_admin()
    or exists (
      select 1
      from public.projects p
      join public.leads l on l.id = p.lead_id
      where p.id = project_status_history.project_id
        and public.owns_lead(l)
    )
  );

drop policy if exists "project_status_history_insert_admin" on public.project_status_history;
create policy "project_status_history_insert_admin"
  on public.project_status_history for insert
  with check (public.is_admin());

-- Proposals
drop policy if exists "proposals_select" on public.proposals;
create policy "proposals_select"
  on public.proposals for select
  using (
    public.is_admin()
    or exists (
      select 1 from public.leads l
      where l.id = proposals.lead_id
        and public.owns_lead(l)
    )
  );

drop policy if exists "proposals_update_admin" on public.proposals;
create policy "proposals_update_admin"
  on public.proposals for update
  using (public.is_admin());

-- Lead notes
drop policy if exists "lead_notes_select" on public.lead_notes;
create policy "lead_notes_select"
  on public.lead_notes for select
  using (
    public.is_admin()
    or exists (
      select 1 from public.leads l
      where l.id = lead_notes.lead_id
        and public.owns_lead(l)
    )
  );

drop policy if exists "lead_notes_insert" on public.lead_notes;
create policy "lead_notes_insert"
  on public.lead_notes for insert
  with check (
    public.is_admin()
    or (
      author_id = auth.uid()
      and exists (
        select 1 from public.leads l
        where l.id = lead_notes.lead_id
          and public.owns_lead(l)
      )
    )
  );

-- Storage buckets (create if not exists)
insert into storage.buckets (id, name, public)
values ('bills', 'bills', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('roofs', 'roofs', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('projects', 'projects', false)
on conflict (id) do nothing;

-- Storage policies: admins full access; customers read via path prefix lead_id
drop policy if exists "bills_admin_all" on storage.objects;
create policy "bills_admin_all"
  on storage.objects for all
  using (bucket_id = 'bills' and public.is_admin())
  with check (bucket_id = 'bills' and public.is_admin());

drop policy if exists "roofs_admin_all" on storage.objects;
create policy "roofs_admin_all"
  on storage.objects for all
  using (bucket_id = 'roofs' and public.is_admin())
  with check (bucket_id = 'roofs' and public.is_admin());

drop policy if exists "projects_admin_all" on storage.objects;
create policy "projects_admin_all"
  on storage.objects for all
  using (bucket_id = 'projects' and public.is_admin())
  with check (bucket_id = 'projects' and public.is_admin());

-- Authenticated users can read objects for leads they own (path: {lead_id}/...)
drop policy if exists "bills_select_owner" on storage.objects;
create policy "bills_select_owner"
  on storage.objects for select
  using (
    bucket_id = 'bills'
    and auth.uid() is not null
    and exists (
      select 1 from public.leads l
      where l.id::text = split_part(name, '/', 1)
        and public.owns_lead(l)
    )
  );

drop policy if exists "roofs_select_owner" on storage.objects;
create policy "roofs_select_owner"
  on storage.objects for select
  using (
    bucket_id = 'roofs'
    and auth.uid() is not null
    and exists (
      select 1 from public.leads l
      where l.id::text = split_part(name, '/', 1)
        and public.owns_lead(l)
    )
  );

drop policy if exists "projects_select_owner" on storage.objects;
create policy "projects_select_owner"
  on storage.objects for select
  using (
    bucket_id = 'projects'
    and auth.uid() is not null
    and exists (
      select 1
      from public.projects p
      join public.leads l on l.id = p.lead_id
      where p.id::text = split_part(name, '/', 1)
        and public.owns_lead(l)
    )
  );

-- Grant usage
grant usage on schema public to postgres, anon, authenticated, service_role;
grant all on all tables in schema public to postgres, service_role;
grant select, insert, update, delete on all tables in schema public to authenticated;
