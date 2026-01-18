-- Add screenshot_url column to orders table for payment verification
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS screenshot_url text;

-- Add order_notes column for admin rejection reasons
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS admin_notes text;

-- Create order_timeline table for capitaling order status changes
CREATE TABLE IF NOT EXISTS public.order_timeline (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  status text NOT NULL,
  note text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
  
);

-- Enable RLS on order_timeline
ALTER TABLE public.order_timeline ENABLE ROW LEVEL SECURITY;

-- Admins can view all timeline entries
CREATE POLICY "Admins can view order timeline"
ON public.order_timeline
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can insert timeline entries
CREATE POLICY "Admins can insert order timeline"
ON public.order_timeline
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create storage bucket for payment screenshots
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-screenshots', 'payment-screenshots', false)
ON CONFLICT (id) DO NOTHING;

-- Anyone can upload payment screenshots (for customers)
CREATE POLICY "Anyone can upload payment screenshots"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'payment-screenshots');

-- Admins can view all payment screenshots
CREATE POLICY "Admins can view payment screenshots"
ON storage.objects
FOR SELECT
USING (bucket_id = 'payment-screenshots' AND public.has_role(auth.uid(), 'admin'));


