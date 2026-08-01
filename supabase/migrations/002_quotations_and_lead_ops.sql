-- Additive production migration: lead operations and quotation lifecycle.
create table if not exists public.quotations(
  id uuid primary key default gen_random_uuid(), reference text unique not null,
  inquiry_id text references public.inquiries(id) on delete set null,
  customer_name text not null, customer_email text, customer_phone text,
  title text not null, status text not null default 'draft' check(status in ('draft','sent','accepted','expired','cancelled')),
  currency text not null default 'INR', valid_until date, subtotal numeric(12,2) not null default 0,
  discount numeric(12,2) not null default 0, tax numeric(12,2) not null default 0, total numeric(12,2) not null default 0,
  terms text, notes text, created_by uuid references public.admin_users(user_id),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.quotation_lines(
  id uuid primary key default gen_random_uuid(), quotation_id uuid not null references public.quotations(id) on delete cascade,
  description text not null, quantity numeric(10,2) not null default 1 check(quantity>0),
  unit_price numeric(12,2) not null default 0 check(unit_price>=0), sort_order integer not null default 0
);
create index if not exists quotations_status_created_idx on public.quotations(status,created_at desc);
create index if not exists quotations_inquiry_idx on public.quotations(inquiry_id);
alter table public.quotations enable row level security;
alter table public.quotation_lines enable row level security;
