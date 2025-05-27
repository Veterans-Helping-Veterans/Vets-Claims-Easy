-- Create tables
create table public.claims (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  date timestamp with time zone not null,
  status text check (status in ('new', 'in_review', 'evidence_gathering', 'approved', 'denied')) default 'new',
  branch text,
  claim_type text not null,
  veteran_data text not null, -- Encrypted sensitive data (firstName, lastName, email, phone, etc)
  claim_details text not null, -- Encrypted claim details
  notes jsonb[] default array[]::jsonb[] -- Array of note objects
);

create table public.users (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  role text check (role in ('admin', 'user')) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  last_sign_in timestamp with time zone
);

create table public.files (
  id uuid default gen_random_uuid() primary key,
  claim_id uuid not null references public.claims(id) on delete cascade,
  name text not null,
  size bigint not null,
  type text not null,
  upload_date timestamp with time zone default timezone('utc'::text, now()) not null,
  category text check (category in ('medical_records', 'va_letters', 'other_documents')) not null,
  url text not null
);

-- Create indices
create index claims_date_idx on public.claims(date desc);
create index claims_status_idx on public.claims(status);
create index claims_branch_idx on public.claims(branch);
create index claims_updated_at_idx on public.claims(updated_at desc);
create index files_claim_id_idx on public.files(claim_id);
create index users_email_idx on public.users(email);
create index users_role_idx on public.users(role);

-- Create functions
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, role)
  values (new.id, new.email, 'user');
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger for new user
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create RLS policies
alter table public.claims enable row level security;
alter table public.users enable row level security;
alter table public.files enable row level security;

-- Claims policies
create policy "Claims are viewable by admin users" on public.claims
  for select using (auth.role() = 'authenticated' and exists (
    select 1 from public.users where users.id = auth.uid() and users.role = 'admin'
  ));

create policy "Claims are viewable by their owners" on public.claims
  for select using (
    auth.role() = 'authenticated' and 
    (veteran_data->>'user_id')::uuid = auth.uid()
  );

create policy "Claims can be created by authenticated users" on public.claims
  for insert with check (auth.role() = 'authenticated');

create policy "Claims can be updated by admin users" on public.claims
  for update using (auth.role() = 'authenticated' and exists (
    select 1 from public.users where users.id = auth.uid() and users.role = 'admin'
  ));

-- Users policies
create policy "Users are viewable by admin users" on public.users
  for select using (auth.role() = 'authenticated' and exists (
    select 1 from public.users where users.id = auth.uid() and users.role = 'admin'
  ));

create policy "Users can view their own data" on public.users
  for select using (auth.uid() = id);

create policy "Users can update their own data" on public.users
  for update using (auth.uid() = id);

-- Files policies
create policy "Files are viewable by admin users" on public.files
  for select using (auth.role() = 'authenticated' and exists (
    select 1 from public.users where users.id = auth.uid() and users.role = 'admin'
  ));

create policy "Files are viewable by claim owners" on public.files
  for select using (
    auth.role() = 'authenticated' and
    exists (
      select 1 
      from public.claims 
      where claims.id = files.claim_id 
      and (claims.veteran_data->>'user_id')::uuid = auth.uid()
    )
  );

create policy "Files can be created by authenticated users" on public.files
  for insert with check (auth.role() = 'authenticated');

create policy "Files can be updated by admin users" on public.files
  for update using (auth.role() = 'authenticated' and exists (
    select 1 from public.users where users.id = auth.uid() and users.role = 'admin'
  ));

create policy "Files can be deleted by admin users" on public.files
  for delete using (auth.role() = 'authenticated' and exists (
    select 1 from public.users where users.id = auth.uid() and users.role = 'admin'
  ));

-- Create storage bucket for claim files
insert into storage.buckets (id, name, public) values ('claim-files', 'claim-files', false);

-- Storage bucket policies
create policy "Authenticated users can upload claim files"
  on storage.objects for insert
  with check (
    bucket_id = 'claim-files' and
    auth.role() = 'authenticated'
  );

create policy "Authenticated users can view their own files"
  on storage.objects for select
  using (
    bucket_id = 'claim-files' and
    auth.role() = 'authenticated' and
    (storage.foldername(name)::uuid = auth.uid() or
     exists (
       select 1 
       from public.claims 
       where claims.id::text = storage.foldername(name) 
       and (claims.veteran_data->>'user_id')::uuid = auth.uid()
     ))
  );

create policy "Admin users can view all files"
  on storage.objects for select
  using (
    bucket_id = 'claim-files' and
    auth.role() = 'authenticated' and
    exists (
      select 1 
      from public.users 
      where users.id = auth.uid() 
      and users.role = 'admin'
    )
  );

create policy "Admin users can delete files"
  on storage.objects for delete
  using (
    bucket_id = 'claim-files' and
    auth.role() = 'authenticated' and
    exists (
      select 1 
      from public.users 
      where users.id = auth.uid() 
      and users.role = 'admin'
    )
  );
