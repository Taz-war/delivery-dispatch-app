-- Create order_timeline table for tracking status changes
CREATE TABLE public.order_timeline (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  previous_status TEXT,
  changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  changed_by TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.order_timeline ENABLE ROW LEVEL SECURITY;

-- Create public access policies (same pattern as orders table)
CREATE POLICY "Allow public read access on order_timeline" 
ON public.order_timeline 
FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert on order_timeline" 
ON public.order_timeline 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public update on order_timeline" 
ON public.order_timeline 
FOR UPDATE 
USING (true);

CREATE POLICY "Allow public delete on order_timeline" 
ON public.order_timeline 
FOR DELETE 
USING (true);

-- Create index for efficient queries by order_id
CREATE INDEX idx_order_timeline_order_id ON public.order_timeline(order_id);

-- Create function to automatically log order status changes
CREATE OR REPLACE FUNCTION public.log_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Log status change if stage has changed
  IF OLD.stage IS DISTINCT FROM NEW.stage THEN
    INSERT INTO public.order_timeline (order_id, status, previous_status)
    VALUES (NEW.id, NEW.stage, OLD.stage);
  END IF;
  
  -- Log picking column change
  IF OLD.picking_column IS DISTINCT FROM NEW.picking_column THEN
    INSERT INTO public.order_timeline (order_id, status, previous_status, notes)
    VALUES (NEW.id, 'column_' || NEW.picking_column, 'column_' || OLD.picking_column, 'Moved to ' || NEW.picking_column || ' column');
  END IF;
  
  -- Log driver assignment
  IF OLD.assigned_driver_id IS DISTINCT FROM NEW.assigned_driver_id AND NEW.assigned_driver_id IS NOT NULL THEN
    INSERT INTO public.order_timeline (order_id, status, notes)
    VALUES (NEW.id, 'driver_assigned', 'Driver assigned');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timeline logging
CREATE TRIGGER log_order_changes
AFTER UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.log_order_status_change();

-- Create function to log order creation
CREATE OR REPLACE FUNCTION public.log_order_creation()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.order_timeline (order_id, status, notes)
  VALUES (NEW.id, 'created', 'Order created with stage: ' || NEW.stage);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for order creation
CREATE TRIGGER log_order_created
AFTER INSERT ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.log_order_creation();