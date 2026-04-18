-- Product variants table: enables per-variant pricing (weight packs, storage tiers, etc.)
CREATE TABLE IF NOT EXISTS public.product_variants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  label TEXT NOT NULL,
  price NUMERIC NOT NULL,
  original_price NUMERIC,
  weight TEXT,
  pieces TEXT,
  stock_quantity INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read active variants"
  ON public.product_variants FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admin manage variants"
  ON public.product_variants FOR ALL
  USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_product_variants_product_id
  ON public.product_variants(product_id);
