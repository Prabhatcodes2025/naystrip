-- Additive booking-platform migration. Safe to apply after 001 and 002.
alter table public.packages add column if not exists short_description text;
alter table public.packages add column if not exists route text;
alter table public.packages add column if not exists highlights text[] not null default '{}';
alter table public.packages add column if not exists start_point text;
alter table public.packages add column if not exists end_point text;
alter table public.packages add column if not exists booking_enabled boolean not null default false;
alter table public.packages add column if not exists custom_enquiry_only boolean not null default true;
alter table public.packages add column if not exists advance_percent numeric(5,2) not null default 50 check(advance_percent between 0 and 100);
alter table public.packages add column if not exists policies jsonb not null default '{}';
alter table public.packages add column if not exists gallery text[] not null default '{}';

alter table public.package_departures add column if not exists advance_amount numeric(12,2);
alter table public.package_departures add column if not exists booking_cutoff timestamptz;
alter table public.package_departures add column if not exists available_seats integer generated always as (greatest(capacity-booked_seats,0)) stored;

create table if not exists public.package_addons(
 id uuid primary key default gen_random_uuid(), package_id uuid not null references public.packages on delete cascade,
 name text not null, description text, unit_amount numeric(12,2) not null check(unit_amount>=0),
 pricing_unit text not null default 'booking' check(pricing_unit in ('booking','traveller','night','room')),
 active boolean not null default true, sort_order integer not null default 0, created_at timestamptz not null default now()
);
create table if not exists public.package_agent_rates(
 id uuid primary key default gen_random_uuid(), package_id uuid not null references public.packages on delete cascade,
 retail_price numeric(12,2), agent_price numeric(12,2), markup numeric(12,2), commission numeric(12,2),
 active boolean not null default true, valid_from date, valid_until date, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

alter table public.bookings add column if not exists quotation_id uuid references public.quotations on delete set null;
alter table public.bookings add column if not exists booking_source text not null default 'website';
alter table public.bookings add column if not exists travel_date date;
alter table public.bookings add column if not exists end_date date;
alter table public.bookings add column if not exists departure_city text;
alter table public.bookings add column if not exists pickup_preference text;
alter table public.bookings add column if not exists adult_count integer not null default 1 check(adult_count>=0);
alter table public.bookings add column if not exists child_count integer not null default 0 check(child_count>=0);
alter table public.bookings add column if not exists infant_count integer not null default 0 check(infant_count>=0);
alter table public.bookings add column if not exists room_count integer not null default 1 check(room_count>0);
alter table public.bookings add column if not exists room_occupancy jsonb not null default '[]';
alter table public.bookings add column if not exists hotel_category text;
alter table public.bookings add column if not exists discount numeric(12,2) not null default 0 check(discount>=0);
alter table public.bookings add column if not exists advance_required numeric(12,2) not null default 0 check(advance_required>=0);
alter table public.bookings add column if not exists amount_paid numeric(12,2) not null default 0 check(amount_paid>=0);
alter table public.bookings add column if not exists balance_due numeric(12,2) not null default 0 check(balance_due>=0);
alter table public.bookings add column if not exists payment_state text not null default 'pending';
alter table public.bookings add column if not exists operational_status text not null default 'pending_payment';
alter table public.bookings add column if not exists razorpay_order_id text;
alter table public.bookings add column if not exists razorpay_payment_id text;
alter table public.bookings add column if not exists razorpay_signature text;
alter table public.bookings add column if not exists ticket_number text unique;
alter table public.bookings add column if not exists ticket_generated_at timestamptz;
alter table public.bookings add column if not exists voucher_storage_path text;
alter table public.bookings add column if not exists invoice_storage_path text;
alter table public.bookings add column if not exists itinerary_storage_path text;
alter table public.bookings add column if not exists receipt_storage_path text;
alter table public.bookings add column if not exists customer_notes text;
alter table public.bookings add column if not exists admin_notes text;
alter table public.bookings add column if not exists assigned_staff uuid references public.admin_users(user_id);
alter table public.bookings add column if not exists idempotency_key text unique;
create index if not exists bookings_reference_idx on public.bookings(reference);
create index if not exists bookings_customer_travel_idx on public.bookings(customer_id,travel_date desc);
create index if not exists bookings_ops_queue_idx on public.bookings(operational_status,payment_state,created_at desc);

alter table public.booking_travellers add column if not exists full_name text;
alter table public.booking_travellers add column if not exists traveller_type text not null default 'adult';
alter table public.booking_travellers add column if not exists dob date;
alter table public.booking_travellers add column if not exists nationality text;
alter table public.booking_travellers add column if not exists phone text;
alter table public.booking_travellers add column if not exists email text;
alter table public.booking_travellers add column if not exists special_requirements text;
alter table public.booking_travellers add column if not exists emergency_contact_name text;
alter table public.booking_travellers add column if not exists emergency_phone text;
alter table public.booking_travellers add column if not exists emergency_relationship text;

create table if not exists public.booking_addons(
 id uuid primary key default gen_random_uuid(), booking_id uuid not null references public.bookings on delete cascade,
 addon_id uuid references public.package_addons on delete set null, addon_name text not null,
 quantity numeric(10,2) not null check(quantity>0), unit_amount numeric(12,2) not null check(unit_amount>=0),
 total_amount numeric(12,2) not null check(total_amount>=0), created_at timestamptz not null default now()
);
create table if not exists public.booking_documents(
 id uuid primary key default gen_random_uuid(), booking_id uuid not null references public.bookings on delete cascade,
 document_type text not null check(document_type in ('voucher','itinerary','invoice','receipt','other')),
 storage_path text not null, version integer not null default 1, generated_at timestamptz not null default now(),
 unique(booking_id,document_type,version)
);
create table if not exists public.booking_activity(
 id bigint generated always as identity primary key, booking_id uuid not null references public.bookings on delete cascade,
 action text not null, actor_id uuid, actor_type text not null default 'system', details jsonb not null default '{}', created_at timestamptz not null default now()
);
create index if not exists booking_activity_booking_idx on public.booking_activity(booking_id,created_at desc);

alter table public.payments add column if not exists payment_method text;
alter table public.payments add column if not exists captured_at timestamptz;
alter table public.payments add column if not exists metadata jsonb not null default '{}';
alter table public.payments add column if not exists idempotency_key text unique;
alter table public.payments add column if not exists payment_purpose text not null default 'advance';

create table if not exists public.payment_webhook_events(
 id text primary key, provider text not null, event_type text not null, payload jsonb not null default '{}',
 processing_status text not null default 'received', error text, processed_at timestamptz, created_at timestamptz not null default now()
);
create table if not exists public.notifications(
 id uuid primary key default gen_random_uuid(), booking_id uuid references public.bookings on delete cascade,
 inquiry_id text references public.inquiries on delete cascade, quotation_id uuid references public.quotations on delete cascade,
 channel text not null check(channel in ('email','whatsapp','system')), recipient text not null, event text not null,
 status text not null default 'pending' check(status in ('pending','sent','failed','skipped_not_configured')),
 provider text, provider_id text, error text, attempts integer not null default 0,
 idempotency_key text unique, payload jsonb not null default '{}', sent_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index if not exists notifications_queue_idx on public.notifications(status,created_at);

create table if not exists public.cancellation_requests(
 id uuid primary key default gen_random_uuid(), booking_id uuid not null references public.bookings on delete cascade,
 customer_id uuid references public.customers(user_id), reason text not null, status text not null default 'requested',
 calculated_fee numeric(12,2), approved_refund numeric(12,2), admin_notes text,
 reviewed_by uuid references public.admin_users(user_id), reviewed_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

alter table public.quotations add column if not exists destination text;
alter table public.quotations add column if not exists travel_start date;
alter table public.quotations add column if not exists travel_end date;
alter table public.quotations add column if not exists traveller_count integer;
alter table public.quotations add column if not exists itinerary jsonb not null default '[]';
alter table public.quotations add column if not exists inclusions text[] not null default '{}';
alter table public.quotations add column if not exists exclusions text[] not null default '{}';
alter table public.quotations add column if not exists advance_required numeric(12,2) not null default 0;
alter table public.quotations add column if not exists access_token_hash text;
alter table public.quotations add column if not exists converted_booking_id uuid references public.bookings on delete set null;

alter table public.booking_addons enable row level security;
alter table public.booking_documents enable row level security;
alter table public.booking_activity enable row level security;
alter table public.package_addons enable row level security;
alter table public.notifications enable row level security;
alter table public.cancellation_requests enable row level security;
alter table public.package_agent_rates enable row level security;

create policy "public reads active addons for published packages" on public.package_addons for select using(active and exists(select 1 from public.packages p where p.id=package_id and p.status='published' and p.deleted_at is null));
create policy "customers read own booking documents" on public.booking_documents for select using(exists(select 1 from public.bookings b where b.id=booking_id and b.customer_id=auth.uid()));
create policy "customers read own booking travellers" on public.booking_travellers for select using(exists(select 1 from public.bookings b where b.id=booking_id and b.customer_id=auth.uid()));
create policy "customers read own booking addons" on public.booking_addons for select using(exists(select 1 from public.bookings b where b.id=booking_id and b.customer_id=auth.uid()));
create policy "customers read own cancellation requests" on public.cancellation_requests for select using(customer_id=auth.uid());
create policy "customers create own cancellation requests" on public.cancellation_requests for insert with check(customer_id=auth.uid() and exists(select 1 from public.bookings b where b.id=booking_id and b.customer_id=auth.uid()));
create policy "approved agents read configured private rates" on public.package_agent_rates for select using(exists(select 1 from public.b2b_agents a where a.user_id=auth.uid() and a.verification_status='approved'));

create or replace function public.handle_naystrip_auth_user() returns trigger language plpgsql security definer set search_path=public as $$
begin
 if coalesce(new.raw_user_meta_data->>'portal','customer')='agent' then
  insert into public.b2b_agents(user_id,business_name,contact_person,email,phone,verification_status)
  values(new.id,coalesce(new.raw_user_meta_data->>'business_name','Pending business'),coalesce(new.raw_user_meta_data->>'name',''),new.email,coalesce(new.raw_user_meta_data->>'phone',''),'pending') on conflict(user_id) do nothing;
 else
  insert into public.customers(user_id,first_name,last_name,phone)
  values(new.id,split_part(coalesce(new.raw_user_meta_data->>'name',''),' ',1),nullif(regexp_replace(coalesce(new.raw_user_meta_data->>'name',''),'^[^ ]+\s*',''),''),new.raw_user_meta_data->>'phone') on conflict(user_id) do nothing;
 end if;
 return new;
end $$;
drop trigger if exists on_naystrip_auth_user_created on auth.users;
create trigger on_naystrip_auth_user_created after insert on auth.users for each row execute procedure public.handle_naystrip_auth_user();

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('booking-documents','booking-documents',false,10485760,array['application/pdf'])
on conflict(id) do update set public=false,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;
create policy "customers read own private booking files" on storage.objects for select using(bucket_id='booking-documents' and exists(select 1 from public.booking_documents d join public.bookings b on b.id=d.booking_id where d.storage_path=name and b.customer_id=auth.uid()));
