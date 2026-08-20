update public.website_settings
set data = jsonb_set(data, '{whatsapp}', '"+91 8097132424"'::jsonb, true), updated_at = now()
where id = true;
