insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('site-media','site-media',true,5242880,array['image/jpeg','image/png','image/webp'])
on conflict(id) do update set public=true,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;

-- Public website media is readable by anyone. Uploads are performed only by
-- the server after an active Admin role check using the service-role key.
drop policy if exists "public reads site media" on storage.objects;
create policy "public reads site media" on storage.objects for select using(bucket_id='site-media');
