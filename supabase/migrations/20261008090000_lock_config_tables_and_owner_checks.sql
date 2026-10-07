-- Konfigurationstabeller var läsbara för alla (även utloggade). Edge-
-- funktionerna läser dem med service_role. Appen läser feature_flags och
-- jurisdiction_prompts som inloggad; resten används bara i admin.
drop policy if exists "Anyone can read feature flags" on public.feature_flags;
drop policy if exists "Signed-in users can read feature flags" on public.feature_flags;
create policy "Signed-in users can read feature flags" on public.feature_flags for select to authenticated using (true);
drop policy if exists "Anyone can read jurisdiction prompts" on public.jurisdiction_prompts;
drop policy if exists "Signed-in users can read jurisdiction prompts" on public.jurisdiction_prompts;
create policy "Signed-in users can read jurisdiction prompts" on public.jurisdiction_prompts for select to authenticated using (true);
drop policy if exists "Anyone can read report templates" on public.report_templates;
drop policy if exists "Admins can read report templates" on public.report_templates;
create policy "Admins can read report templates" on public.report_templates for select to authenticated using (public.has_role(auth.uid(), 'admin'::app_role));
drop policy if exists "Anyone can read phase instructions" on public.phase_instructions;
drop policy if exists "Admins can read phase instructions" on public.phase_instructions;
create policy "Admins can read phase instructions" on public.phase_instructions for select to authenticated using (public.has_role(auth.uid(), 'admin'::app_role));
drop policy if exists "Anyone can read behavior guidelines" on public.behavior_guidelines;
drop policy if exists "Admins can read behavior guidelines" on public.behavior_guidelines;
create policy "Admins can read behavior guidelines" on public.behavior_guidelines for select to authenticated using (public.has_role(auth.uid(), 'admin'::app_role));

-- Användare kunde flytta egna rader till en annan användare (UPDATE utan
-- WITH CHECK).
alter policy "Users can update own profile" on public.profiles with check (auth.uid() = id);
alter policy "Users can update own sessions" on public.sessions with check (auth.uid() = user_id);
alter policy "Users can update own log entries" on public.log_entries with check (auth.uid() = user_id);
alter policy "Users can update own reports" on public.reports with check (auth.uid() = user_id);
