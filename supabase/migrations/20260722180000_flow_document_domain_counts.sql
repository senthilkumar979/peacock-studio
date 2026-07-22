-- Persist per-document domain usage counts; aggregate for org admins

alter table public.flow_documents
  add column if not exists domain_counts jsonb not null default '{}'::jsonb;

comment on column public.flow_documents.domain_counts is
  'Map of hostname -> step occurrence count collected on save';

-- Backfill from existing steps JSON
do $$
declare
  doc record;
  step jsonb;
  event jsonb;
  urls text[];
  url text;
  domain text;
  step_domains text[];
  counts jsonb;
begin
  for doc in
    select id, steps from public.flow_documents
  loop
    counts := '{}'::jsonb;
    if doc.steps is null or jsonb_typeof(doc.steps) <> 'array' then
      update public.flow_documents set domain_counts = counts where id = doc.id;
      continue;
    end if;

    for step in select * from jsonb_array_elements(doc.steps)
    loop
      -- Skip sections / branches (have kind)
      if step ? 'kind' then
        continue;
      end if;

      event := step -> 'event';
      if event is null then
        continue;
      end if;

      urls := array[]::text[];
      if coalesce(event ->> 'type', '') = 'navigation' then
        urls := array_append(urls, event ->> 'fromUrl');
        urls := array_append(urls, event ->> 'toUrl');
      else
        urls := array_append(urls, event ->> 'url');
      end if;

      step_domains := array[]::text[];
      foreach url in array urls
      loop
        if url is null or btrim(url) = '' then
          continue;
        end if;
        begin
          domain := lower(nullif(btrim(substring(url from '://([^/?#]+)')), ''));
          -- strip credentials / port noise handled loosely; prefer hostname parse
          if domain is null then
            continue;
          end if;
          -- drop userinfo if present
          if position('@' in domain) > 0 then
            domain := split_part(domain, '@', 2);
          end if;
          -- drop port
          domain := split_part(domain, ':', 1);
          if domain = '' then
            continue;
          end if;
          if not (domain = any (step_domains)) then
            step_domains := array_append(step_domains, domain);
          end if;
        exception when others then
          continue;
        end;
      end loop;

      foreach domain in array step_domains
      loop
        counts := jsonb_set(
          counts,
          array[domain],
          to_jsonb(coalesce((counts ->> domain)::int, 0) + 1),
          true
        );
      end loop;
    end loop;

    update public.flow_documents set domain_counts = counts where id = doc.id;
  end loop;
end $$;

create or replace function public.get_org_domain_usage(p_organization_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if p_organization_id not in (select public.user_organization_ids()) then
    raise exception 'Not a member of this organization';
  end if;

  return coalesce(
    (
      select jsonb_agg(
        jsonb_build_object(
          'domain', domain,
          'count', total_count
        )
        order by total_count desc, domain asc
      )
      from (
        select
          d.key as domain,
          sum((d.value)::int)::int as total_count
        from public.flow_documents fd
        cross join lateral jsonb_each_text(coalesce(fd.domain_counts, '{}'::jsonb)) as d(key, value)
        where fd.organization_id = p_organization_id
        group by d.key
      ) aggregated
    ),
    '[]'::jsonb
  );
end;
$$;

grant execute on function public.get_org_domain_usage(uuid) to authenticated;
