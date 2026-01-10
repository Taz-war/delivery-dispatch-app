-- Add user_id column to orders table
ALTER TABLE public.orders 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id column to drivers table
ALTER TABLE public.drivers 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Drop existing permissive policies on orders
DROP POLICY IF EXISTS "Allow public read access on orders" ON public.orders;
DROP POLICY IF EXISTS "Allow public insert on orders" ON public.orders;
DROP POLICY IF EXISTS "Allow public update on orders" ON public.orders;
DROP POLICY IF EXISTS "Allow public delete on orders" ON public.orders;

-- Create user-scoped policies for orders
CREATE POLICY "Users can view their own orders" 
ON public.orders 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders" 
ON public.orders 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own orders" 
ON public.orders 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own orders" 
ON public.orders 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

-- Drop existing permissive policies on drivers
DROP POLICY IF EXISTS "Allow public read access on drivers" ON public.drivers;
DROP POLICY IF EXISTS "Allow public insert on drivers" ON public.drivers;
DROP POLICY IF EXISTS "Allow public update on drivers" ON public.drivers;
DROP POLICY IF EXISTS "Allow public delete on drivers" ON public.drivers;

-- Create user-scoped policies for drivers
CREATE POLICY "Users can view their own drivers" 
ON public.drivers 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own drivers" 
ON public.drivers 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own drivers" 
ON public.drivers 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own drivers" 
ON public.drivers 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

-- Drop existing permissive policies on order_timeline
DROP POLICY IF EXISTS "Allow public read access on order_timeline" ON public.order_timeline;
DROP POLICY IF EXISTS "Allow public insert on order_timeline" ON public.order_timeline;
DROP POLICY IF EXISTS "Allow public update on order_timeline" ON public.order_timeline;
DROP POLICY IF EXISTS "Allow public delete on order_timeline" ON public.order_timeline;

-- Create user-scoped policies for order_timeline (via order ownership)
CREATE POLICY "Users can view timeline for their orders" 
ON public.order_timeline 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_timeline.order_id 
    AND orders.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert timeline for their orders" 
ON public.order_timeline 
FOR INSERT 
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_timeline.order_id 
    AND orders.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update timeline for their orders" 
ON public.order_timeline 
FOR UPDATE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_timeline.order_id 
    AND orders.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete timeline for their orders" 
ON public.order_timeline 
FOR DELETE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_timeline.order_id 
    AND orders.user_id = auth.uid()
  )
);