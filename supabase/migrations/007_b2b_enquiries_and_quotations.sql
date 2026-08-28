-- Additive 27-Aug completion: partner-owned enquiries and customer quotation pricing.
alter table public.inquiries drop constraint if exists inquiries_kind_check;
alter table public.inquiries add constraint inquiries_kind_check
  check(kind in ('contact','custom_trip','package_quote','quick_quote','corporate','school','b2b_enquiry'));

alter table public.inquiries add column if not exists agent_id uuid references public.b2b_agents(id) on delete set null;
alter table public.quotations add column if not exists agent_id uuid references public.b2b_agents(id) on delete set null;
alter table public.quotations add column if not exists agent_cost numeric(12,2) check(agent_cost is null or agent_cost>=0);
alter table public.quotations add column if not exists agent_markup_percent numeric(5,2) check(agent_markup_percent is null or agent_markup_percent between 0 and 100);

create index if not exists inquiries_agent_created_idx on public.inquiries(agent_id,created_at desc);
create index if not exists quotations_agent_created_idx on public.quotations(agent_id,created_at desc);

drop policy if exists "approved agents read own enquiries" on public.inquiries;
create policy "approved agents read own enquiries" on public.inquiries for select using(
  exists(select 1 from public.b2b_agents a where a.id=agent_id and a.user_id=auth.uid() and a.verification_status='approved')
);
drop policy if exists "approved agents read own quotations" on public.quotations;
create policy "approved agents read own quotations" on public.quotations for select using(
  exists(select 1 from public.b2b_agents a where a.id=agent_id and a.user_id=auth.uid() and a.verification_status='approved')
);
drop policy if exists "approved agents read own quotation lines" on public.quotation_lines;
create policy "approved agents read own quotation lines" on public.quotation_lines for select using(
  exists(select 1 from public.quotations q join public.b2b_agents a on a.id=q.agent_id where q.id=quotation_id and a.user_id=auth.uid() and a.verification_status='approved')
);
