-- ==============================================================================
-- SolarOps - Solar Energy Installation & Billing Management System
-- Complete PostgreSQL Schema with Supabase Auth, Triggers & Row Level Security (RLS)
-- ==============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ==============================================================================
-- 1. PROFILES TABLE (Linked to auth.users)
-- ==============================================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null check (role in ('customer', 'technician', 'admin')) default 'customer',
  full_name text not null,
  phone text,
  address text,
  city text,
  state text,
  pincode text,
  electricity_conn_no text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Index for role and email lookups
create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_profiles_email on public.profiles(email);

-- ==============================================================================
-- 2. SOLAR PACKAGES TABLE
-- ==============================================================================
create table if not exists public.solar_packages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  capacity_kw numeric(4,2) not null,
  panel_count integer not null,
  panel_type text not null default 'Mono PERC / Bifacial',
  inverter_type text not null default 'Grid-Tied String Inverter',
  price_inr numeric(12,2) not null,
  description text not null,
  warranty_years integer not null default 25,
  roof_area_sqft integer not null default 100,
  monthly_gen_units integer not null default 120,
  is_active boolean not null default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==============================================================================
-- 3. INSTALLATION REQUESTS TABLE
-- ==============================================================================
create table if not exists public.installation_requests (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id) on delete cascade,
  package_id uuid references public.solar_packages(id) on delete set null,
  custom_capacity_kw numeric(4,2),
  property_address text not null,
  roof_type text not null check (roof_type in ('RCC Flat', 'Tin Shed', 'Tiled Roof', 'Industrial Shed', 'Other')),
  electricity_conn_no text not null,
  discom_provider text not null,
  sanctioned_load_kw numeric(4,2) not null,
  status text not null check (status in ('pending_review', 'scheduled', 'in_progress', 'completed', 'cancelled')) default 'pending_review',
  current_stage integer not null check (current_stage between 1 and 7) default 1,
  assigned_technician_id uuid references public.profiles(id) on delete set null,
  scheduled_date date,
  estimated_completion_date date,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_inst_requests_customer on public.installation_requests(customer_id);
create index if not exists idx_inst_requests_technician on public.installation_requests(assigned_technician_id);
create index if not exists idx_inst_requests_status on public.installation_requests(status);

-- ==============================================================================
-- 4. INSTALLATION STAGES (7-STAGE PROGRESS TRACKER)
-- ==============================================================================
create table if not exists public.installation_stages (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.installation_requests(id) on delete cascade,
  stage_number integer not null check (stage_number between 1 and 7),
  stage_name text not null,
  status text not null check (status in ('pending', 'in_progress', 'completed', 'blocked')) default 'pending',
  technician_notes text,
  updated_by uuid references public.profiles(id) on delete set null,
  completed_at timestamp with time zone,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (request_id, stage_number)
);

create index if not exists idx_inst_stages_request on public.installation_stages(request_id);

-- ==============================================================================
-- 5. BILLS TABLE
-- ==============================================================================
create table if not exists public.bills (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.installation_requests(id) on delete cascade,
  customer_id uuid not null references public.profiles(id) on delete cascade,
  total_amount numeric(12,2) not null,
  subsidy_amount numeric(12,2) not null default 0,
  net_payable numeric(12,2) not null,
  emi_tenure_months integer not null default 12,
  emi_monthly_amount numeric(12,2) not null,
  status text not null check (status in ('unpaid', 'partially_paid', 'fully_paid')) default 'unpaid',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_bills_customer on public.bills(customer_id);
create index if not exists idx_bills_request on public.bills(request_id);

-- ==============================================================================
-- 6. EMI SCHEDULES TABLE
-- ==============================================================================
create table if not exists public.emi_schedules (
  id uuid primary key default gen_random_uuid(),
  bill_id uuid not null references public.bills(id) on delete cascade,
  installment_number integer not null,
  amount numeric(12,2) not null,
  due_date date not null,
  status text not null check (status in ('paid', 'pending', 'overdue')) default 'pending',
  paid_at timestamp with time zone,
  payment_method text,
  demo_receipt_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_emi_bill on public.emi_schedules(bill_id);
create index if not exists idx_emi_status on public.emi_schedules(status);

-- ==============================================================================
-- 7. DEMO PAYMENTS TABLE (Strictly Simulated)
-- ==============================================================================
create table if not exists public.demo_payments (
  id uuid primary key default gen_random_uuid(),
  emi_id uuid not null references public.emi_schedules(id) on delete cascade,
  bill_id uuid not null references public.bills(id) on delete cascade,
  customer_id uuid not null references public.profiles(id) on delete cascade,
  amount numeric(12,2) not null,
  payment_mode text not null check (payment_mode in ('upi', 'card', 'netbanking')),
  transaction_ref text not null,
  status text not null default 'success',
  is_demo boolean not null default true,
  notes text default 'Simulated demo payment. No real money was charged.',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_payments_bill on public.demo_payments(bill_id);
create index if not exists idx_payments_customer on public.demo_payments(customer_id);

-- ==============================================================================
-- 8. SUBSIDY APPLICATIONS TABLE (PM Surya Ghar / Central Assistance)
-- ==============================================================================
create table if not exists public.subsidy_applications (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.installation_requests(id) on delete cascade,
  customer_id uuid not null references public.profiles(id) on delete cascade,
  scheme_name text not null default 'PM Surya Ghar: Muft Bijli Yojana',
  application_number text not null unique,
  sanctioned_amount numeric(12,2) not null default 78000,
  status text not null check (status in ('submitted', 'document_verified', 'technical_sanction', 'inspection_passed', 'disbursed')) default 'submitted',
  disbursed_date date,
  bank_ref text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_subsidy_customer on public.subsidy_applications(customer_id);
create index if not exists idx_subsidy_request on public.subsidy_applications(request_id);

-- ==============================================================================
-- 9. COMPLAINTS & SERVICE TICKETS TABLE
-- ==============================================================================
create table if not exists public.complaints (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id) on delete cascade,
  request_id uuid references public.installation_requests(id) on delete set null,
  assigned_technician_id uuid references public.profiles(id) on delete set null,
  ticket_number text not null unique,
  category text not null check (category in ('inverter_issue', 'panel_damage', 'generation_drop', 'metering_delay', 'wiring_issue', 'other')),
  subject text not null,
  description text not null,
  priority text not null check (priority in ('low', 'medium', 'high', 'critical')) default 'medium',
  status text not null check (status in ('open', 'assigned', 'in_progress', 'resolved', 'closed')) default 'open',
  resolution_notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  resolved_at timestamp with time zone,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_complaints_customer on public.complaints(customer_id);
create index if not exists idx_complaints_technician on public.complaints(assigned_technician_id);
create index if not exists idx_complaints_status on public.complaints(status);

-- ==============================================================================
-- 10. AUTH TRIGGER TO CREATE PROFILE AUTOMATICALLY
-- ==============================================================================
-- Automatically provisions a profile when a new user signs up via Supabase Auth
create or replace function public.handle_new_user()
returns trigger as $$
declare
  admin_email_config text := 'solar.admin@example.com';
  user_role text := 'customer';
begin
  -- Check if user matches admin email (configurable)
  if lower(new.email) = lower(admin_email_config) then
    user_role := 'admin';
  elsif (new.raw_user_meta_data->>'role') in ('customer', 'technician', 'admin') then
    -- Allow metadata override on initial signup if permitted
    user_role := new.raw_user_meta_data->>'role';
  end if;

  insert into public.profiles (
    id,
    email,
    role,
    full_name,
    phone,
    address,
    city,
    state,
    pincode,
    electricity_conn_no
  ) values (
    new.id,
    new.email,
    user_role,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'address',
    new.raw_user_meta_data->>'city',
    new.raw_user_meta_data->>'state',
    new.raw_user_meta_data->>'pincode',
    new.raw_user_meta_data->>'electricity_conn_no'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if exists and recreate
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ==============================================================================
-- 11. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.solar_packages enable row level security;
alter table public.installation_requests enable row level security;
alter table public.installation_stages enable row level security;
alter table public.bills enable row level security;
alter table public.emi_schedules enable row level security;
alter table public.demo_payments enable row level security;
alter table public.subsidy_applications enable row level security;
alter table public.complaints enable row level security;

-- Helper functions to check role
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer;

create or replace function public.is_technician()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'technician'
  );
$$ language sql security definer;

-- --- Profiles RLS ---
create policy "Users can view own profile or admin can view all"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id or public.is_admin());

-- --- Solar Packages RLS ---
create policy "Anyone authenticated can view active packages"
  on public.solar_packages for select
  using (is_active = true or public.is_admin());

create policy "Admins can manage packages"
  on public.solar_packages for all
  using (public.is_admin());

-- --- Installation Requests RLS ---
create policy "Customers can view their own installation requests"
  on public.installation_requests for select
  using (customer_id = auth.uid() or assigned_technician_id = auth.uid() or public.is_admin());

create policy "Customers can insert their own installation requests"
  on public.installation_requests for insert
  with check (customer_id = auth.uid());

create policy "Technicians and admins can update installation requests"
  on public.installation_requests for update
  using (assigned_technician_id = auth.uid() or public.is_admin());

-- --- Installation Stages RLS ---
create policy "View installation stages"
  on public.installation_stages for select
  using (
    exists (
      select 1 from public.installation_requests r
      where r.id = installation_stages.request_id
      and (r.customer_id = auth.uid() or r.assigned_technician_id = auth.uid() or public.is_admin())
    )
  );

create policy "Technicians and admins can update stages"
  on public.installation_stages for update
  using (
    public.is_admin() or exists (
      select 1 from public.installation_requests r
      where r.id = installation_stages.request_id
      and r.assigned_technician_id = auth.uid()
    )
  );

-- --- Bills RLS ---
create policy "Customers can view their own bills"
  on public.bills for select
  using (customer_id = auth.uid() or public.is_admin());

create policy "Admins can manage bills"
  on public.bills for all
  using (public.is_admin());

-- --- EMI Schedules RLS ---
create policy "Customers can view their EMI schedules"
  on public.emi_schedules for select
  using (
    exists (
      select 1 from public.bills b
      where b.id = emi_schedules.bill_id
      and (b.customer_id = auth.uid() or public.is_admin())
    )
  );

create policy "Customers and admins can update EMI schedules for payments"
  on public.emi_schedules for update
  using (
    public.is_admin() or exists (
      select 1 from public.bills b
      where b.id = emi_schedules.bill_id
      and b.customer_id = auth.uid()
    )
  );

-- --- Demo Payments RLS ---
create policy "Customers can view and record demo payments"
  on public.demo_payments for select
  using (customer_id = auth.uid() or public.is_admin());

create policy "Customers can insert demo payments"
  on public.demo_payments for insert
  with check (customer_id = auth.uid());

-- --- Subsidy Applications RLS ---
create policy "Customers can view own subsidy applications"
  on public.subsidy_applications for select
  using (customer_id = auth.uid() or public.is_admin());

create policy "Admins can manage subsidy applications"
  on public.subsidy_applications for all
  using (public.is_admin());

-- --- Complaints RLS ---
create policy "Customers can view own complaints, technicians assigned, admin all"
  on public.complaints for select
  using (customer_id = auth.uid() or assigned_technician_id = auth.uid() or public.is_admin());

create policy "Customers can submit complaints"
  on public.complaints for insert
  with check (customer_id = auth.uid());

create policy "Technicians and Admins can update complaints"
  on public.complaints for update
  using (assigned_technician_id = auth.uid() or public.is_admin());
