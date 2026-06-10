
ALTER TABLE public.user_settings
  ADD COLUMN IF NOT EXISTS shopify_access_token text,
  ADD COLUMN IF NOT EXISTS shopify_webhook_secret text,
  ADD COLUMN IF NOT EXISTS shopify_domain text;

CREATE TABLE public.conversions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  campaign_id text,
  shopify_order_id text NOT NULL,
  revenue_cents bigint NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  utm_source text,
  utm_medium text,
  utm_campaign text,
  landing_site text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, shopify_order_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.conversions TO authenticated;
GRANT ALL ON public.conversions TO service_role;

ALTER TABLE public.conversions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own conversions"
  ON public.conversions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role manages conversions"
  ON public.conversions FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

CREATE INDEX idx_conversions_user_campaign ON public.conversions(user_id, utm_campaign);
CREATE INDEX idx_conversions_created_at ON public.conversions(created_at DESC);
