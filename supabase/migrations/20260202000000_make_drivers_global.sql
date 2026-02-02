-- Migration: Make drivers globally shared across all users
-- This migration removes user-scoped access and allows all authenticated users to manage all drivers
-- Run this migration after the initial schema and user_id column migrations

-- ============================================
-- STEP 1: Drop ALL existing driver policies
-- ============================================
DROP POLICY IF EXISTS "Users can view their own drivers" ON public.drivers;
DROP POLICY IF EXISTS "Users can create their own drivers" ON public.drivers;
DROP POLICY IF EXISTS "Users can update their own drivers" ON public.drivers;
DROP POLICY IF EXISTS "Users can delete their own drivers" ON public.drivers;
DROP POLICY IF EXISTS "All users can view all drivers" ON public.drivers;
DROP POLICY IF EXISTS "All users can create drivers" ON public.drivers;
DROP POLICY IF EXISTS "All users can update drivers" ON public.drivers;
DROP POLICY IF EXISTS "All users can delete drivers" ON public.drivers;
DROP POLICY IF EXISTS "Allow public read access on drivers" ON public.drivers;
DROP POLICY IF EXISTS "Allow public insert on drivers" ON public.drivers;
DROP POLICY IF EXISTS "Allow public update on drivers" ON public.drivers;
DROP POLICY IF EXISTS "Allow public delete on drivers" ON public.drivers;

-- ============================================
-- STEP 2: Create new global policies
-- All authenticated users can access all drivers
-- ============================================
CREATE POLICY "authenticated_select_drivers" ON public.drivers 
FOR SELECT TO authenticated USING (true);

CREATE POLICY "authenticated_insert_drivers" ON public.drivers 
FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "authenticated_update_drivers" ON public.drivers 
FOR UPDATE TO authenticated USING (true);

CREATE POLICY "authenticated_delete_drivers" ON public.drivers 
FOR DELETE TO authenticated USING (true);

-- ============================================
-- STEP 3: Clear user_id from all drivers
-- This makes all existing drivers globally visible
-- ============================================
UPDATE public.drivers SET user_id = NULL;

-- ============================================
-- STEP 4: Seed official driver list (if empty)
-- These are the global drivers for the fleet
-- ============================================
INSERT INTO public.drivers (name, phone, truck_number, vehicle_type, is_active, user_id)
SELECT * FROM (VALUES
    ('Justin Scholten', '', 'T95', 'truck', true, NULL::uuid),
    ('Kyle Bauman', '', 'T88', 'truck', true, NULL::uuid),
    ('Jeff Lince', '', 'T80', 'truck', true, NULL::uuid),
    ('Scott Masters', '', 'T60', 'truck', true, NULL::uuid),
    ('Rich Martineau', '', 'T50', 'truck', true, NULL::uuid),
    ('Chris Nunes', '', 'T25', 'truck', true, NULL::uuid),
    ('Andy Long', '', 'T97', 'truck', true, NULL::uuid),
    ('Stephen Ives', '', 'T40', 'truck', true, NULL::uuid),
    ('Dan Gambin', '', 'T35', 'truck', true, NULL::uuid),
    ('Nicole Reynolds', '', 'T30', 'truck', true, NULL::uuid),
    ('Paul Chiasson', '', 'T92', 'truck', true, NULL::uuid)
) AS v(name, phone, truck_number, vehicle_type, is_active, user_id)
WHERE NOT EXISTS (SELECT 1 FROM public.drivers WHERE name = v.name);
