-- Seed script for drivers table
-- Run this in your Supabase SQL Editor

-- First, get the user_id of an existing user (or use NULL if RLS allows)
-- You may need to replace 'YOUR_USER_ID' with an actual user ID from auth.users

-- Insert drivers from the provided list
INSERT INTO public.drivers (name, phone, truck_number, vehicle_type, is_active, user_id)
VALUES
  ('Justin Scholten', '', 'T95', 'truck', true, NULL),
  ('Kyle Bauman', '', 'T88', 'truck', true, NULL),
  ('Jeff Lince', '', 'T80', 'truck', true, NULL),
  ('Scott Masters', '', 'T60', 'truck', true, NULL),
  ('Rich Martineau', '', 'T50', 'truck', true, NULL),
  ('Chris Nunes', '', 'T25', 'truck', true, NULL),
  ('Andy Long', '', 'T97', 'truck', true, NULL),
  ('Stephen Ives', '', 'T40', 'truck', true, NULL),
  ('Dan Gambin', '', 'T35', 'truck', true, NULL),
  ('Nicole Reynolds', '', 'T30', 'truck', true, NULL),
  ('Paul Chiasson', '', 'T92', 'truck', true, NULL)
ON CONFLICT DO NOTHING;

-- Note: If you get an error about user_id being required or RLS policy violations,
-- you may need to:
-- 1. Temporarily disable RLS on the drivers table
-- 2. Or replace NULL with an actual user ID from your auth.users table
-- 3. Or update your RLS policies to allow inserts without user_id for seeding

-- To check the inserted drivers:
-- SELECT * FROM public.drivers;
