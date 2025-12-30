-- Create enum types for order stages and types
CREATE TYPE public.order_stage AS ENUM ('picking', 'unassigned_driver', 'assigned_driver', 'pickup_store', 'completed');
CREATE TYPE public.order_type AS ENUM ('DODD', 'JOBBER', 'HOTSHOT', 'PICKUP');
CREATE TYPE public.picking_column AS ENUM ('Unassigned', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Picked');
CREATE TYPE public.assigned_day AS ENUM ('Mon', 'Tue', 'Wed', 'Thu', 'Fri');
CREATE TYPE public.vehicle_type AS ENUM ('truck', 'van', 'hotshot');

-- Create drivers table
CREATE TABLE public.drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT,
  vehicle_type public.vehicle_type NOT NULL DEFAULT 'truck',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_id TEXT,
  customer_address TEXT,
  customer_phone TEXT,
  customer_lat DOUBLE PRECISION,
  customer_lng DOUBLE PRECISION,
  items JSONB NOT NULL DEFAULT '[]',
  stage public.order_stage NOT NULL DEFAULT 'picking',
  scheduled_date DATE,
  assigned_day public.assigned_day,
  rsm TEXT,
  assigned_driver_id UUID REFERENCES public.drivers(id) ON DELETE SET NULL,
  order_type public.order_type NOT NULL DEFAULT 'DODD',
  invoice_photo_url TEXT,
  comments TEXT,
  picking_column public.picking_column NOT NULL DEFAULT 'Unassigned',
  order_document_url TEXT,
  presell_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Create policies for public read/write access (for now, before auth is implemented)
-- Note: You'll want to add proper auth-based policies later
CREATE POLICY "Allow public read access on drivers" ON public.drivers FOR SELECT USING (true);
CREATE POLICY "Allow public insert on drivers" ON public.drivers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on drivers" ON public.drivers FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on drivers" ON public.drivers FOR DELETE USING (true);

CREATE POLICY "Allow public read access on orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Allow public insert on orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on orders" ON public.orders FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on orders" ON public.orders FOR DELETE USING (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_drivers_updated_at
  BEFORE UPDATE ON public.drivers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample drivers
INSERT INTO public.drivers (name, phone, vehicle_type, is_active) VALUES
  ('Mike Johnson', '(214) 555-1001', 'truck', true),
  ('Carlos Rodriguez', '(214) 555-1002', 'van', true),
  ('James Wilson', '(214) 555-1003', 'hotshot', true);

-- Insert sample orders
INSERT INTO public.orders (order_number, customer_name, customer_id, customer_address, customer_phone, customer_lat, customer_lng, items, stage, rsm, order_type, comments, picking_column) VALUES
  ('ORD-001', 'AutoZone #4521', 'AZ-4521', '123 Main Street, Dallas, TX 75201', '(214) 555-0123', 32.7767, -96.7970, '[{"partNumber": "BRK-2045", "quantity": 4, "poNumber": "PO-78945"}, {"partNumber": "OIL-5W30", "quantity": 12, "poNumber": "PO-78945"}]', 'picking', 'Kyle', 'DODD', 'Urgent - customer waiting', 'Unassigned'),
  ('ORD-002', 'O''Reilly Auto Parts', 'OR-8832', '456 Commerce Blvd, Fort Worth, TX 76102', '(817) 555-0456', 32.7555, -97.3308, '[{"partNumber": "FLT-AIR-22", "quantity": 6, "poNumber": "PO-44521"}]', 'picking', 'Kyle', 'JOBBER', '', 'Mon'),
  ('ORD-003', 'Pep Boys #112', 'PB-112', '789 Auto Lane, Arlington, TX 76010', '(682) 555-0789', 32.7357, -97.1081, '[{"partNumber": "BAT-12V", "quantity": 2, "poNumber": "PO-99012"}, {"partNumber": "WIP-22IN", "quantity": 8, "poNumber": "PO-99012"}]', 'picking', 'Sarah', 'HOTSHOT', 'Call before delivery', 'Tue'),
  ('ORD-004', 'NAPA Auto Care', 'NAPA-3301', '321 Parts Way, Plano, TX 75074', '(972) 555-0321', 33.0198, -96.6989, '[{"partNumber": "SPK-PLAT", "quantity": 16, "poNumber": "PO-55667"}]', 'picking', 'Kyle', 'PICKUP', '', 'Unassigned'),
  ('ORD-005', 'Advance Auto Parts', 'AAP-7745', '555 Mechanic Drive, Irving, TX 75039', '(469) 555-0555', 32.8140, -96.9489, '[{"partNumber": "ALT-REMAN", "quantity": 1, "poNumber": "PO-11223"}]', 'unassigned_driver', 'Kyle', 'DODD', '', 'Picked');

-- Update assigned_day for orders with day-based picking columns
UPDATE public.orders SET assigned_day = 'Mon' WHERE picking_column = 'Mon';
UPDATE public.orders SET assigned_day = 'Tue' WHERE picking_column = 'Tue';