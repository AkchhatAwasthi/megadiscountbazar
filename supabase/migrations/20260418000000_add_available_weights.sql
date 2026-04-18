ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS available_weights JSONB DEFAULT '[]'::jsonb;
