-- Optional display label (usually the destination page title) for step resources.

alter table public.step_resources
  add column if not exists label text;

alter table public.step_resources
  drop constraint if exists step_resources_label_length;

alter table public.step_resources
  add constraint step_resources_label_length
  check (label is null or char_length(label) <= 200);
