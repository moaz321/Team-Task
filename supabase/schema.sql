-- Allow users to read only their own tasks
create policy "Users can read their tasks"
on tasks
for select
using ( auth.uid() = owner );

-- Allow users to insert tasks that belong to them
create policy "Users can insert their tasks"
on tasks
for insert
with check ( auth.uid() = owner );

-- Allow users to update only their own tasks
create policy "Users can update their tasks"
on tasks
for update
using ( auth.uid() = owner );

-- Allow users to delete only their own tasks
create policy "Users can delete their tasks"
on tasks
for delete
using ( auth.uid() = owner );

