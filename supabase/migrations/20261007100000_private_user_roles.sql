-- user_roles var läsbar för alla (även utloggade), vilket avslöjade vilka
-- som är admin. Nu ser användare bara sina egna roller; admins ser alla.
drop policy if exists "Users can view own roles" on public.user_roles;
create policy "Users can view own roles" on public.user_roles for select to authenticated
  using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'::app_role));
