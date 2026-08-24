-- Targeted client-feedback completion: typed enquiries, partner PAN and traveller stories.
alter table public.inquiries drop constraint if exists inquiries_kind_check;
alter table public.inquiries add constraint inquiries_kind_check
  check(kind in ('contact','custom_trip','package_quote','quick_quote','corporate','school'));

create table if not exists public.testimonials(
  id uuid primary key default gen_random_uuid(),
  name text not null,
  destination text not null,
  rating numeric(2,1) not null check(rating between 1 and 5),
  photo text,
  testimonial text not null,
  status public.publish_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.testimonials enable row level security;
drop policy if exists "published testimonials are public" on public.testimonials;
create policy "published testimonials are public" on public.testimonials for select using(status='published');

create table if not exists public.newsletter_subscribers(
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  source text not null default 'website',
  status text not null default 'subscribed' check(status in ('subscribed','unsubscribed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.newsletter_subscribers enable row level security;

create or replace function public.handle_naystrip_auth_user() returns trigger language plpgsql security definer set search_path=public as $$
begin
 if coalesce(new.raw_user_meta_data->>'portal','customer')='agent' then
  insert into public.b2b_agents(user_id,business_name,contact_person,email,phone,pan,verification_status)
  values(new.id,coalesce(new.raw_user_meta_data->>'business_name','Pending business'),coalesce(new.raw_user_meta_data->>'name',''),new.email,coalesce(new.raw_user_meta_data->>'phone',''),nullif(new.raw_user_meta_data->>'pan',''),'pending') on conflict(user_id) do nothing;
 else
  insert into public.customers(user_id,first_name,last_name,phone)
  values(new.id,split_part(coalesce(new.raw_user_meta_data->>'name',''),' ',1),nullif(regexp_replace(coalesce(new.raw_user_meta_data->>'name',''),'^[^ ]+\s*',''),''),new.raw_user_meta_data->>'phone') on conflict(user_id) do nothing;
 end if;
 return new;
end $$;
