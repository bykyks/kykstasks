# Kykstasks

App web de gestion de tâches (migration de TaskFlow). React 18/19 + TypeScript + Vite + Tailwind v4 + Zustand + Supabase.

## Commandes

```bash
npm run dev      # dev server sur http://localhost:5173
npm run build    # build production
npm run preview  # preview du build
```

## Variables d'environnement

```
VITE_SUPABASE_URL=https://bifyynjhznalooqzrzaw.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_HSHru1Q7fYBLhMeGNLVwCw_IFFearDl
```

## Schéma SQL Supabase (à exécuter dans SQL Editor)

```sql
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Projects
create table projects (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  color text not null default '#6366f1',
  icon text not null default 'folder',
  position integer not null default 0,
  created_at timestamptz not null default now()
);
alter table projects enable row level security;
create policy "users see own projects" on projects for all using (auth.uid() = user_id);

-- Tags
create table tags (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  color text not null default '#6366f1'
);
alter table tags enable row level security;
create policy "users see own tags" on tags for all using (auth.uid() = user_id);

-- Tasks
create table tasks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  notes text not null default '',
  priority text not null default 'medium',
  project_id uuid references projects(id) on delete set null,
  due_date date,
  due_time time,
  completed boolean not null default false,
  completed_at timestamptz,
  position integer not null default 0,
  recurrence text not null default 'none',
  recurrence_end date,
  kanban_status text not null default 'todo',
  reminder_minutes integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table tasks enable row level security;
create policy "users see own tasks" on tasks for all using (auth.uid() = user_id);

-- Trigger updated_at
create or replace function handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger tasks_updated_at
  before update on tasks
  for each row execute function handle_updated_at();

-- Task tags (junction table)
create table task_tags (
  task_id uuid references tasks(id) on delete cascade not null,
  tag_id uuid references tags(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  primary key (task_id, tag_id)
);
alter table task_tags enable row level security;
create policy "users see own task_tags" on task_tags for all using (auth.uid() = user_id);

-- Subtasks
create table subtasks (
  id uuid primary key default uuid_generate_v4(),
  task_id uuid references tasks(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  completed boolean not null default false,
  position integer not null default 0
);
alter table subtasks enable row level security;
create policy "users see own subtasks" on subtasks for all using (auth.uid() = user_id);

-- Settings (1 row per user)
create table settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  theme text not null default 'system',
  reminder_default integer not null default 15,
  daily_digest_enabled boolean not null default false,
  daily_digest_time text not null default '09:00',
  backup_enabled boolean not null default false
);
alter table settings enable row level security;
create policy "users see own settings" on settings for all using (auth.uid() = user_id);
```

## Notes techniques

- Tailwind v4 : PostCSS via `@tailwindcss/postcss`, CSS via `@import "tailwindcss"`
- lucide-react 0.344 installé avec `--legacy-peer-deps` (peer React 18, project React 19)
- `@dnd-kit/core` : `DragEndEvent` est un type, importer avec `import type`
- Supabase clé `sb_publishable_...` = nouveau format anon key
