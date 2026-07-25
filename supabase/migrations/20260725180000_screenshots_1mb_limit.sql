-- Tighten screenshots object cap from 2 MB to 1 MB (client compress target).

update storage.buckets
set file_size_limit = 1048576
where id = 'screenshots';
