-- Additive document-delivery support for owner-supplied vouchers and tickets.
alter table public.booking_documents drop constraint if exists booking_documents_document_type_check;
alter table public.booking_documents add constraint booking_documents_document_type_check
  check(document_type in ('voucher','itinerary','invoice','receipt','hotel_voucher','transport_voucher','ticket','other'));
alter table public.booking_documents add column if not exists display_name text;
alter table public.booking_documents add column if not exists original_filename text;
alter table public.booking_documents add column if not exists content_type text not null default 'application/pdf';
alter table public.booking_documents add column if not exists uploaded_by uuid references public.admin_users(user_id) on delete set null;

