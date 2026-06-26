create table locations (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  lat double precision,
  lng double precision,
  img text
);