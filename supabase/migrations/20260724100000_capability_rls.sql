-- Capability-scoped RLS for library tables + storage; close anon share_links SELECT hole.

-- ---------------------------------------------------------------------------
-- Helpers: share-backed reads without exposing share_links rows to anon RLS
-- ---------------------------------------------------------------------------
create or replace function public.screenshot_asset_readable_via_active_share(
  p_organization_id uuid,
  p_document_id text
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.share_links sl
    where sl.organization_id = p_organization_id
      and sl.revoked_at is null
      and (sl.expires_at is null or sl.expires_at > now())
      and public.share_link_document_allowed(sl, p_document_id)
  );
$$;

create or replace function public.storage_object_readable_via_active_share(p_name text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.screenshot_assets sa
    inner join public.share_links sl on sl.organization_id = sa.organization_id
    where sa.storage_path = p_name
      and sl.revoked_at is null
      and (sl.expires_at is null or sl.expires_at > now())
      and public.share_link_document_allowed(sl, sa.document_id)
  );
$$;

-- ---------------------------------------------------------------------------
-- flow_documents
-- ---------------------------------------------------------------------------
drop policy if exists "flow_documents_all_own_org" on public.flow_documents;

create policy "flow_documents_select_member"
  on public.flow_documents for select
  using (organization_id in (select public.user_organization_ids()));

create policy "flow_documents_insert_create"
  on public.flow_documents for insert
  with check (
    organization_id in (select public.user_organization_ids())
    and (
      public.is_org_admin(organization_id)
      or public.member_has_capability(organization_id, 'create')
    )
  );

create policy "flow_documents_update_edit"
  on public.flow_documents for update
  using (
    organization_id in (select public.user_organization_ids())
    and (
      public.is_org_admin(organization_id)
      or public.member_has_capability(organization_id, 'edit')
    )
  )
  with check (
    organization_id in (select public.user_organization_ids())
    and (
      public.is_org_admin(organization_id)
      or public.member_has_capability(organization_id, 'edit')
    )
  );

create policy "flow_documents_delete_delete"
  on public.flow_documents for delete
  using (
    organization_id in (select public.user_organization_ids())
    and (
      public.is_org_admin(organization_id)
      or public.member_has_capability(organization_id, 'delete')
    )
  );

-- ---------------------------------------------------------------------------
-- screenshot_assets
-- ---------------------------------------------------------------------------
drop policy if exists "screenshot_assets_all_own_org" on public.screenshot_assets;

create policy "screenshot_assets_select_member"
  on public.screenshot_assets for select
  using (organization_id in (select public.user_organization_ids()));

create policy "screenshot_assets_insert_create"
  on public.screenshot_assets for insert
  with check (
    organization_id in (select public.user_organization_ids())
    and (
      public.is_org_admin(organization_id)
      or public.member_has_capability(organization_id, 'create')
    )
  );

create policy "screenshot_assets_update_edit"
  on public.screenshot_assets for update
  using (
    organization_id in (select public.user_organization_ids())
    and (
      public.is_org_admin(organization_id)
      or public.member_has_capability(organization_id, 'edit')
    )
  )
  with check (
    organization_id in (select public.user_organization_ids())
    and (
      public.is_org_admin(organization_id)
      or public.member_has_capability(organization_id, 'edit')
    )
  );

create policy "screenshot_assets_delete_delete"
  on public.screenshot_assets for delete
  using (
    organization_id in (select public.user_organization_ids())
    and (
      public.is_org_admin(organization_id)
      or public.member_has_capability(organization_id, 'delete')
    )
  );

-- Replace anon share SELECT that depended on share_links RLS
drop policy if exists "screenshot_assets_select_via_share" on public.screenshot_assets;

create policy "screenshot_assets_select_via_share"
  on public.screenshot_assets for select
  to anon, authenticated
  using (
    public.screenshot_asset_readable_via_active_share(organization_id, document_id)
  );

-- ---------------------------------------------------------------------------
-- personas
-- ---------------------------------------------------------------------------
drop policy if exists "personas_all_own_org" on public.personas;

create policy "personas_select_member"
  on public.personas for select
  using (organization_id in (select public.user_organization_ids()));

create policy "personas_insert_create"
  on public.personas for insert
  with check (
    organization_id in (select public.user_organization_ids())
    and (
      public.is_org_admin(organization_id)
      or public.member_has_capability(organization_id, 'create')
    )
  );

create policy "personas_update_edit"
  on public.personas for update
  using (
    organization_id in (select public.user_organization_ids())
    and (
      public.is_org_admin(organization_id)
      or public.member_has_capability(organization_id, 'edit')
    )
  )
  with check (
    organization_id in (select public.user_organization_ids())
    and (
      public.is_org_admin(organization_id)
      or public.member_has_capability(organization_id, 'edit')
    )
  );

create policy "personas_delete_delete"
  on public.personas for delete
  using (
    organization_id in (select public.user_organization_ids())
    and (
      public.is_org_admin(organization_id)
      or public.member_has_capability(organization_id, 'delete')
    )
  );

-- ---------------------------------------------------------------------------
-- product_tours
-- ---------------------------------------------------------------------------
drop policy if exists "product_tours_all_own_org" on public.product_tours;

create policy "product_tours_select_member"
  on public.product_tours for select
  using (organization_id in (select public.user_organization_ids()));

create policy "product_tours_insert_create"
  on public.product_tours for insert
  with check (
    organization_id in (select public.user_organization_ids())
    and (
      public.is_org_admin(organization_id)
      or public.member_has_capability(organization_id, 'create')
    )
  );

create policy "product_tours_update_edit"
  on public.product_tours for update
  using (
    organization_id in (select public.user_organization_ids())
    and (
      public.is_org_admin(organization_id)
      or public.member_has_capability(organization_id, 'edit')
    )
  )
  with check (
    organization_id in (select public.user_organization_ids())
    and (
      public.is_org_admin(organization_id)
      or public.member_has_capability(organization_id, 'edit')
    )
  );

create policy "product_tours_delete_delete"
  on public.product_tours for delete
  using (
    organization_id in (select public.user_organization_ids())
    and (
      public.is_org_admin(organization_id)
      or public.member_has_capability(organization_id, 'delete')
    )
  );

-- ---------------------------------------------------------------------------
-- workflow_artifacts
-- ---------------------------------------------------------------------------
drop policy if exists "workflow_artifacts_all_own_org" on public.workflow_artifacts;

create policy "workflow_artifacts_select_member"
  on public.workflow_artifacts for select
  using (organization_id in (select public.user_organization_ids()));

create policy "workflow_artifacts_insert_create"
  on public.workflow_artifacts for insert
  with check (
    organization_id in (select public.user_organization_ids())
    and (
      public.is_org_admin(organization_id)
      or public.member_has_capability(organization_id, 'create')
    )
  );

create policy "workflow_artifacts_update_edit"
  on public.workflow_artifacts for update
  using (
    organization_id in (select public.user_organization_ids())
    and (
      public.is_org_admin(organization_id)
      or public.member_has_capability(organization_id, 'edit')
    )
  )
  with check (
    organization_id in (select public.user_organization_ids())
    and (
      public.is_org_admin(organization_id)
      or public.member_has_capability(organization_id, 'edit')
    )
  );

create policy "workflow_artifacts_delete_delete"
  on public.workflow_artifacts for delete
  using (
    organization_id in (select public.user_organization_ids())
    and (
      public.is_org_admin(organization_id)
      or public.member_has_capability(organization_id, 'delete')
    )
  );

-- ---------------------------------------------------------------------------
-- share_links — capability-aware; drop anon SELECT of all active tokens
-- ---------------------------------------------------------------------------
drop policy if exists "share_links_all_own_org" on public.share_links;
drop policy if exists "share_links_select_active" on public.share_links;

create policy "share_links_select_member"
  on public.share_links for select
  to authenticated
  using (organization_id in (select public.user_organization_ids()));

create policy "share_links_insert_share"
  on public.share_links for insert
  to authenticated
  with check (
    organization_id in (select public.user_organization_ids())
    and (
      public.is_org_admin(organization_id)
      or public.member_has_capability(organization_id, 'share')
      or public.member_has_capability(organization_id, 'embed')
    )
  );

create policy "share_links_update_share"
  on public.share_links for update
  to authenticated
  using (
    organization_id in (select public.user_organization_ids())
    and (
      public.is_org_admin(organization_id)
      or public.member_has_capability(organization_id, 'share')
      or public.member_has_capability(organization_id, 'embed')
    )
  )
  with check (
    organization_id in (select public.user_organization_ids())
    and (
      public.is_org_admin(organization_id)
      or public.member_has_capability(organization_id, 'share')
      or public.member_has_capability(organization_id, 'embed')
    )
  );

create policy "share_links_delete_share"
  on public.share_links for delete
  to authenticated
  using (
    organization_id in (select public.user_organization_ids())
    and (
      public.is_org_admin(organization_id)
      or public.member_has_capability(organization_id, 'share')
    )
  );

-- ---------------------------------------------------------------------------
-- Storage screenshots — membership SELECT; capability-gated writes
-- ---------------------------------------------------------------------------
drop policy if exists "screenshots_select_own_org" on storage.objects;
drop policy if exists "screenshots_insert_own_org" on storage.objects;
drop policy if exists "screenshots_update_own_org" on storage.objects;
drop policy if exists "screenshots_delete_own_org" on storage.objects;
drop policy if exists "screenshots_anon_share_read" on storage.objects;

create policy "screenshots_select_own_org"
  on storage.objects for select
  using (
    bucket_id = 'screenshots'
    and (storage.foldername(name))[1] in (
      select id::text from public.organizations
      where id in (select public.user_organization_ids())
    )
  );

create policy "screenshots_insert_own_org"
  on storage.objects for insert
  with check (
    bucket_id = 'screenshots'
    and (storage.foldername(name))[1] in (
      select o.id::text
      from public.organizations o
      where o.id in (select public.user_organization_ids())
        and (
          public.is_org_admin(o.id)
          or public.member_has_capability(o.id, 'create')
        )
    )
  );

create policy "screenshots_update_own_org"
  on storage.objects for update
  using (
    bucket_id = 'screenshots'
    and (storage.foldername(name))[1] in (
      select o.id::text
      from public.organizations o
      where o.id in (select public.user_organization_ids())
        and (
          public.is_org_admin(o.id)
          or public.member_has_capability(o.id, 'edit')
        )
    )
  )
  with check (
    bucket_id = 'screenshots'
    and (storage.foldername(name))[1] in (
      select o.id::text
      from public.organizations o
      where o.id in (select public.user_organization_ids())
        and (
          public.is_org_admin(o.id)
          or public.member_has_capability(o.id, 'edit')
        )
    )
  );

create policy "screenshots_delete_own_org"
  on storage.objects for delete
  using (
    bucket_id = 'screenshots'
    and (storage.foldername(name))[1] in (
      select o.id::text
      from public.organizations o
      where o.id in (select public.user_organization_ids())
        and (
          public.is_org_admin(o.id)
          or public.member_has_capability(o.id, 'delete')
        )
    )
  );

create policy "screenshots_anon_share_read"
  on storage.objects for select
  to anon, authenticated
  using (
    bucket_id = 'screenshots'
    and public.storage_object_readable_via_active_share(name)
  );

-- Confirm public share RPCs remain executable without table SELECT
grant execute on function public.resolve_share_link(text) to anon, authenticated;
grant execute on function public.get_shared_flow_document(text, text) to anon, authenticated;
grant execute on function public.get_shared_product_tour(text) to anon, authenticated;
grant execute on function public.get_shared_persona(text, text) to anon, authenticated;
grant execute on function public.list_shared_screenshot_assets(text, text) to anon, authenticated;
grant execute on function public.screenshot_asset_readable_via_active_share(uuid, text) to anon, authenticated;
grant execute on function public.storage_object_readable_via_active_share(text) to anon, authenticated;
