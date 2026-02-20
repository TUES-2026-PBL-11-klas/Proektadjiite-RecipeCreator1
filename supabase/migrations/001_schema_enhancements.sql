-- =========================
-- EXTENSION (if missing)
-- =========================
create extension if not exists "pgcrypto";

-- =========================
-- ENUM (only if missing)
-- =========================
do $$
begin
    if not exists (
        select 1 from pg_type where typname = 'difficulty_enum'
    ) then
        create type difficulty_enum as enum ('Easy', 'Medium', 'Hard');
    end if;
end
$$;

-- =========================
-- USERS TABLE UPDATES
-- =========================
alter table users
    add column if not exists created_at timestamp default now();

alter table users
    add column if not exists updated_at timestamp;

-- =========================
-- PRODUCTS TABLE UPDATES
-- =========================
alter table products
    add column if not exists created_at timestamp default now();

create index if not exists idx_product_name on products(name);

-- =========================
-- RECIPES TABLE UPDATES
-- =========================
alter table recipes
    add column if not exists calories integer;

alter table recipes
    add column if not exists protein float;

alter table recipes
    add column if not exists carbs float;

alter table recipes
    add column if not exists fat float;

alter table recipes
    add column if not exists created_at timestamp default now();

alter table recipes
    add column if not exists updated_at timestamp;

-- Add check constraint safely
do $$
begin
    if not exists (
        select 1 from pg_constraint 
        where conname = 'check_prep_time_positive'
    ) then
        alter table recipes
        add constraint check_prep_time_positive
        check (prep_time_minutes > 0);
    end if;
end
$$;

create index if not exists idx_recipe_user on recipes(user_id);
create index if not exists idx_recipe_title on recipes(title);

-- =========================
-- RECIPE_INGREDIENTS CHECK
-- =========================
do $$
begin
    if not exists (
        select 1 from pg_constraint 
        where conname = 'check_recipe_quantity_positive'
    ) then
        alter table recipe_ingredients
        add constraint check_recipe_quantity_positive
        check (quantity > 0);
    end if;
end
$$;

-- =========================
-- PANTRY CHECK + UNIQUE
-- =========================
do $$
begin
    if not exists (
        select 1 from pg_constraint 
        where conname = 'check_pantry_quantity_positive'
    ) then
        alter table pantry
        add constraint check_pantry_quantity_positive
        check (quantity > 0);
    end if;
end
$$;

create unique index if not exists unique_user_product
on pantry(user_id, product_id);