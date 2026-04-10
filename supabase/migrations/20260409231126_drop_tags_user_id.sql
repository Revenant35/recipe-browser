-- Drop RLS policies that depend on user_id
drop policy "Users can view their own tags" on public.tags;
drop policy "Users can insert their own tags" on public.tags;
drop policy "Users can update their own tags" on public.tags;
drop policy "Users can delete their own tags" on public.tags;

-- Drop the column
alter table public.tags drop column user_id;

-- Re-create RLS policies without user_id scoping
create policy "Authenticated users can view tags"
  on public.tags for select to authenticated
  using (true);

create policy "Authenticated users can insert tags"
  on public.tags for insert to authenticated
  with check (true);

create policy "Authenticated users can update tags"
  on public.tags for update to authenticated
  using (true);

create policy "Authenticated users can delete tags"
  on public.tags for delete to authenticated
  using (true);
