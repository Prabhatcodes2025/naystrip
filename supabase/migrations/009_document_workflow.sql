-- Additive NaysTrip PDF/DOCX generation, invoice drafts, and private delivery support.
alter table public.bookings add column if not exists document_details jsonb not null default '{}';

create table if not exists public.invoices(
 id uuid primary key default gen_random_uuid(),
 booking_id uuid references public.bookings(id) on delete set null,
 invoice_number text not null unique,
 invoice_date date not null default current_date,
 status text not null default 'draft' check(status in ('draft','finalized','void')),
 invoice_data jsonb not null default '{}',
 created_by uuid references public.admin_users(user_id) on delete set null,
 finalized_at timestamptz,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index if not exists invoices_booking_updated_idx on public.invoices(booking_id,updated_at desc);
alter table public.invoices enable row level security;
create policy "customers read finalized own invoices" on public.invoices for select using(
 status='finalized' and exists(select 1 from public.bookings b where b.id=booking_id and b.customer_id=auth.uid())
);

alter table public.booking_documents alter column booking_id drop not null;
alter table public.booking_documents add column if not exists invoice_id uuid references public.invoices(id) on delete cascade;
alter table public.booking_documents add column if not exists document_format text not null default 'pdf' check(document_format in ('pdf','docx'));
alter table public.booking_documents drop constraint if exists booking_documents_booking_id_document_type_version_key;
alter table public.booking_documents drop constraint if exists booking_documents_document_type_check;
alter table public.booking_documents add constraint booking_documents_document_type_check
 check(document_type in ('voucher','hotel_voucher','transport_voucher','itinerary','invoice','receipt','ticket','other'));
alter table public.booking_documents drop constraint if exists booking_documents_owner_check;
alter table public.booking_documents add constraint booking_documents_owner_check
 check((booking_id is not null) or (invoice_id is not null));
create unique index if not exists booking_documents_booking_format_version_key
 on public.booking_documents(booking_id,document_type,document_format,version) where booking_id is not null;
create unique index if not exists booking_documents_invoice_format_version_key
 on public.booking_documents(invoice_id,document_type,document_format,version) where invoice_id is not null;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('booking-documents','booking-documents',false,10485760,array['application/pdf','application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
on conflict(id) do update set public=false,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;
