-- Add RESTOCK to order_type enum
ALTER TYPE public.order_type ADD VALUE IF NOT EXISTS 'RESTOCK';

-- Add fulfillment_type column
ALTER TABLE public.orders ADD COLUMN fulfillment_type TEXT DEFAULT 'Delivery';

-- Add is_ready column
ALTER TABLE public.orders ADD COLUMN is_ready BOOLEAN DEFAULT TRUE;
