-- ==============================================================================
-- SolarOps - Sample Seed Data
-- Run this in the Supabase SQL Editor after running schema.sql
-- ==============================================================================

-- 1. Insert 3 Solar Packages
insert into public.solar_packages (id, name, capacity_kw, panel_count, panel_type, inverter_type, price_inr, description, warranty_years, roof_area_sqft, monthly_gen_units, is_active)
values
  ('11111111-1111-1111-1111-111111111111', '1 kW Compact Home System', 1.00, 3, '540W Mono PERC Half-Cut', '1kW High Efficiency String Inverter', 65000.00, 'Perfect for small homes (1-2 BHK). Powers 3-4 fans, LED lights, TV, and refrigerator. Qualifies for PM Surya Ghar central subsidy.', 25, 90, 120, true),
  ('22222222-2222-2222-2222-222222222222', '3 kW Standard Residence System', 3.00, 8, '550W TopCon Bifacial N-Type', '3.3kW Dual MPPT Smart Inverter with WiFi', 185000.00, 'Our most popular choice for 2-3 BHK homes with 1.5 ton AC, refrigerator, washing machine, and water pump. Maximizes ₹78,000 PM Surya Ghar subsidy.', 25, 270, 360, true),
  ('33333333-3333-3333-3333-333333333333', '5 kW High-Capacity Home System', 5.00, 14, '575W Bifacial High-Efficiency Glass-to-Glass', '5kW 3-Phase Smart Hybrid Ready Inverter', 295000.00, 'Engineered for villas, duplexes, multiple air conditioners, and EV charging support. High generation potential with zero electricity bills.', 25, 450, 600, true)
on conflict (id) do nothing;

-- 2. Mock Profiles (for reference in local development / demo mode)
-- In production Supabase, profiles are linked to auth.users. The application includes automatic fallback demo data when Supabase credentials are not connected.
