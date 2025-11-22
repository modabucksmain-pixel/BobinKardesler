-- Forum schema extension with roles and moderation controls

-- profiles table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'user' check (role in ('admin','moderator','user')),
  created_at timestamptz not null default now()
);

-- categories and forums
create table if not exists public.forum_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.forum_forums (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references forum_categories(id) on delete cascade,
  name text not null,
  slug text not null,
  description text,
  created_at timestamptz not null default now(),
  unique(category_id, slug)
);

-- threads and posts
create table if not exists public.forum_threads (
  id uuid primary key default gen_random_uuid(),
  forum_id uuid not null references forum_forums(id) on delete cascade,
  title text not null,
  slug text,
  body text not null,
  tags text[] default '{}',
  status text not null default 'open',
  created_by uuid references auth.users(id) on delete set null,
  created_by_email text,
  google_connected boolean default false,
  solution_reply_id uuid,
  last_activity_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  view_count integer not null default 0,
  is_locked boolean default false,
  unique (forum_id, slug)
);

create table if not exists public.forum_posts (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references forum_threads(id) on delete cascade,
  author_id uuid references auth.users(id) on delete set null,
  author_email text,
  body text not null,
  is_solution boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- likes and notifications
create table if not exists public.forum_post_likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references forum_posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(post_id, user_id)
);

create table if not exists public.forum_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  payload jsonb not null default '{}',
  is_read boolean default false,
  created_at timestamptz not null default now()
);

create table if not exists public.forum_reports (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references forum_posts(id) on delete cascade,
  thread_id uuid references forum_threads(id) on delete cascade,
  reporter_id uuid references auth.users(id) on delete set null,
  reason text not null,
  status text not null default 'open',
  created_at timestamptz not null default now()
);

-- indexes
create index if not exists idx_forum_categories_slug on forum_categories(slug);
create index if not exists idx_forum_forums_slug on forum_forums(slug);
create index if not exists idx_forum_threads_slug on forum_threads(slug);
create index if not exists idx_forum_threads_created_at on forum_threads(created_at desc);
create index if not exists idx_forum_posts_created_at on forum_posts(created_at desc);
create index if not exists idx_forum_likes_post on forum_post_likes(post_id);
create index if not exists idx_forum_notifications_user on forum_notifications(user_id, created_at desc);

-- trigger helpers
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_forum_threads_updated_at on forum_threads;
create trigger trg_forum_threads_updated_at
  before update on forum_threads
  for each row execute function public.handle_updated_at();

drop trigger if exists trg_forum_posts_updated_at on forum_posts;
create trigger trg_forum_posts_updated_at
  before update on forum_posts
  for each row execute function public.handle_updated_at();

-- auto profile provisioning
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles(id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- RLS enablement
alter table if exists public.forum_categories enable row level security;
alter table if exists public.forum_forums enable row level security;
alter table if exists public.forum_threads enable row level security;
alter table if exists public.forum_posts enable row level security;
alter table if exists public.forum_post_likes enable row level security;
alter table if exists public.forum_notifications enable row level security;
alter table if exists public.forum_reports enable row level security;
alter table if exists public.profiles enable row level security;

-- policies: public read
create policy if not exists "Public read categories" on public.forum_categories for select using (true);
create policy if not exists "Public read forums" on public.forum_forums for select using (true);
create policy if not exists "Public read threads" on public.forum_threads for select using (true);
create policy if not exists "Public read posts" on public.forum_posts for select using (true);

-- authenticated write
create policy if not exists "Authenticated manage categories" on public.forum_categories
  for all to authenticated using (true) with check (true);
create policy if not exists "Authenticated manage forums" on public.forum_forums
  for all to authenticated using (true) with check (true);
create policy if not exists "Authenticated write threads" on public.forum_threads
  for insert to authenticated with check (auth.uid() = created_by);
create policy if not exists "Authenticated update threads" on public.forum_threads
  for update to authenticated using (auth.uid() = created_by or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','moderator')));
create policy if not exists "Authenticated delete threads" on public.forum_threads
  for delete to authenticated using (auth.uid() = created_by or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy if not exists "Authenticated write posts" on public.forum_posts
  for insert to authenticated with check (auth.uid() = author_id);
create policy if not exists "Authenticated update posts" on public.forum_posts
  for update to authenticated using (auth.uid() = author_id or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','moderator')));
create policy if not exists "Authenticated delete posts" on public.forum_posts
  for delete to authenticated using (auth.uid() = author_id or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy if not exists "Authenticated manage likes" on public.forum_post_likes
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy if not exists "Authenticated manage notifications" on public.forum_notifications
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy if not exists "Authenticated manage reports" on public.forum_reports
  for all to authenticated using (auth.uid() = reporter_id or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','moderator')))
  with check (auth.uid() = reporter_id or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','moderator')));

create policy if not exists "Users read own profile" on public.profiles for select
  using (id = auth.uid() or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
create policy if not exists "Admins manage profiles" on public.profiles for all to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

