-- Lower screenshots bucket object cap from 50 MB to 2 MB as a server-side backstop.
-- Client paths compress raster images before upload; this rejects oversized bypasses.

update storage.buckets
set file_size_limit = 2097152
where id = 'screenshots';
