-- GoogleWheels — Supabase şeması
-- Bu dosyayı Supabase SQL Editor'da çalıştırarak tabloları ve RLS politikalarını oluşturun.

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  severity text not null check (severity in ('green','yellow','red')),
  lat double precision not null,
  lng double precision not null,
  title text not null,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists public.elevator_status (
  id uuid primary key default gen_random_uuid(),
  location_id text not null,
  status text not null check (status in ('working','broken')),
  reported_at timestamptz not null default now()
);

create index if not exists reports_created_at_idx on public.reports (created_at desc);
create index if not exists elevator_status_location_idx on public.elevator_status (location_id, reported_at desc);

-- RLS: anonim crowdsourcing → herkese okuma + doğrulamalı ekleme; güncelleme/silme yok
alter table public.reports enable row level security;
alter table public.elevator_status enable row level security;

create policy "reports_public_select" on public.reports for select using (true);
create policy "reports_public_insert" on public.reports
  for insert with check (
    type in ('roadwork','pothole','elevator_broken','parked_car','steep','cobblestone','no_ramp','accessible')
    and severity in ('green','yellow','red')
    and lat between -90 and 90
    and lng between -180 and 180
    and char_length(title) between 1 and 120
    and (note is null or char_length(note) <= 280)
  );

create policy "elevator_public_select" on public.elevator_status for select using (true);
create policy "elevator_public_insert" on public.elevator_status
  for insert with check (
    status in ('working','broken')
    and char_length(location_id) between 1 and 64
  );
