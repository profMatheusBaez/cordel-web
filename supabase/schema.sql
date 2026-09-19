-- Cordel — schema Supabase (auth + progresso na nuvem)
-- Rode isto no SQL editor do seu projeto Supabase.

create table if not exists public.perfis (
  user_id uuid primary key references auth.users(id) on delete cascade,
  xp integer not null default 0,
  nivel integer not null default 1,
  streak integer not null default 0,
  freezes_disponiveis integer not null default 1,
  medalhas text[] not null default '{}',
  titulo_atual text not null default 'Curioso das Cordas',
  ultima_sessao date,
  licoes_concluidas text[] not null default '{}',
  atualizado_em timestamptz not null default now()
);

alter table public.perfis enable row level security;

create policy "perfis: cada usuário vê o próprio" on public.perfis
  for select using (auth.uid() = user_id);

create policy "perfis: cada usuário atualiza o próprio" on public.perfis
  for update using (auth.uid() = user_id);

create policy "perfis: cada usuário cria o próprio" on public.perfis
  for insert with check (auth.uid() = user_id);

-- cria automaticamente um perfil vazio quando um usuário se cadastra
create or replace function public.lidar_novo_usuario()
returns trigger as $$
begin
  insert into public.perfis (user_id) values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists ao_criar_usuario on auth.users;
create trigger ao_criar_usuario
  after insert on auth.users
  for each row execute procedure public.lidar_novo_usuario();
