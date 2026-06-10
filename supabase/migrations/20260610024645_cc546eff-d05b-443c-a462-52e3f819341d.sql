CREATE TABLE public.shopify_orders (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  order_number text,
  total_price numeric,
  source_name text,
  landing_site text,
  shopify_created_at timestamptz,
  raw jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, order_number)
);

GRANT SELECT ON public.shopify_orders TO authenticated;
GRANT ALL ON public.shopify_orders TO service_role;

ALTER TABLE public.shopify_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own shopify orders"
  ON public.shopify_orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role manages shopify orders"
  ON public.shopify_orders FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE INDEX shopify_orders_user_id_idx ON public.shopify_orders (user_id, created_at DESC);