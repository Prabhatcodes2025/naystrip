-- Existing enquiries, activities, coupons and website CMS remain authoritative.
alter table public.lead_activities add column if not exists agent_id uuid references public.b2b_agents(id);
alter table public.lead_activities enable row level security;
create policy "agents read own lead activities" on public.lead_activities for select using (
  exists(select 1 from public.inquiries i join public.b2b_agents a on a.id=i.agent_id where i.id=inquiry_id and a.user_id=auth.uid() and a.verification_status='approved')
);
alter table public.b2b_agents add column if not exists bank_details jsonb not null default '{}';
alter table public.coupons add column if not exists title text;
alter table public.coupons add column if not exists audience text not null default 'customer' check(audience in ('customer','b2b','all'));
alter table public.coupons add column if not exists package_id uuid references public.packages(id);
alter table public.coupons enable row level security;

create table if not exists public.registration_challenges (
  id uuid primary key, answer_hash text not null, expires_at timestamptz not null,
  client_hash text not null, created_at timestamptz not null default now()
);
create index if not exists registration_challenges_expiry_idx on public.registration_challenges(expires_at);
create index if not exists registration_challenges_client_idx on public.registration_challenges(client_hash,created_at);
alter table public.registration_challenges enable row level security;
revoke all on public.registration_challenges from anon, authenticated;

-- Each paid order is an immutable credit event. Balance is computed in SQL,
-- never from a truncated history or a browser-supplied balance.
create table if not exists public.agent_wallet_orders (
  id uuid primary key default gen_random_uuid(), agent_id uuid not null references public.b2b_agents(id),
  order_id text unique not null, amount numeric(12,2) not null check(amount between 1 and 100000),
  currency text not null default 'INR' check(currency='INR'),
  status text not null default 'created' check(status in ('created','paid')),
  gateway_payment_id text unique, created_at timestamptz not null default now(), paid_at timestamptz
);
create index if not exists agent_wallet_orders_agent_idx on public.agent_wallet_orders(agent_id,created_at desc);
alter table public.agent_wallet_orders enable row level security;
create policy "agents read own wallet" on public.agent_wallet_orders for select using (
  exists(select 1 from public.b2b_agents a where a.id=agent_id and a.user_id=auth.uid() and a.verification_status='approved')
);
revoke insert, update, delete on public.agent_wallet_orders from anon, authenticated;

create or replace function public.agent_wallet_balance(p_agent_id uuid) returns numeric
language sql stable security definer set search_path=public as $$
  select coalesce(sum(amount),0) from public.agent_wallet_orders where agent_id=p_agent_id and status='paid';
$$;
create or replace function public.post_agent_wallet_credit(p_order_id text,p_amount numeric,p_payment_id text) returns void
language plpgsql security definer set search_path=public as $$
declare payment public.agent_wallet_orders;
begin
  select * into payment from public.agent_wallet_orders where order_id=p_order_id for update;
  if not found or payment.amount<>p_amount or coalesce(p_payment_id,'')='' then raise exception 'Invalid wallet payment'; end if;
  if payment.status='paid' then return; end if;
  update public.agent_wallet_orders set status='paid',gateway_payment_id=p_payment_id,paid_at=now() where id=payment.id;
end;
$$;
revoke all on function public.agent_wallet_balance(uuid) from public, anon, authenticated;
revoke all on function public.post_agent_wallet_credit(text,numeric,text) from public, anon, authenticated;
grant execute on function public.agent_wallet_balance(uuid),public.post_agent_wallet_credit(text,numeric,text) to service_role;

create or replace function public.record_agent_follow_up(p_agent_id uuid,p_inquiry_id text,p_note text,p_follow_up_at timestamptz) returns void
language plpgsql security definer set search_path=public as $$
begin
  perform 1 from public.inquiries where id=p_inquiry_id and agent_id=p_agent_id for update;
  if not found then raise exception 'Enquiry not found'; end if;
  insert into public.lead_activities(inquiry_id,agent_id,activity_type,notes) values(p_inquiry_id,p_agent_id,'follow_up',p_note);
  update public.inquiries set follow_up_at=p_follow_up_at,
    status=case when status in ('converted','lost','closed') then status else 'follow-up' end,
    updated_at=now() where id=p_inquiry_id;
end;
$$;
revoke all on function public.record_agent_follow_up(uuid,text,text,timestamptz) from public,anon,authenticated;
grant execute on function public.record_agent_follow_up(uuid,text,text,timestamptz) to service_role;
