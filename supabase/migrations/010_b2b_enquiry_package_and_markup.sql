-- Additive B2B workflow metadata. Existing enquiries, quotations and package catalogue remain authoritative.
alter table public.inquiries add column if not exists package_id uuid references public.packages(id) on delete set null;
alter table public.inquiries add column if not exists enquiry_source text;
alter table public.quotations add column if not exists agent_markup_type text default 'percentage'
  check(agent_markup_type in ('percentage','fixed'));
alter table public.quotations add column if not exists agent_markup_value numeric(12,2)
  check(agent_markup_value is null or agent_markup_value >= 0);

create index if not exists inquiries_package_idx on public.inquiries(package_id);
create index if not exists inquiries_b2b_source_idx on public.inquiries(agent_id,enquiry_source,created_at desc);
