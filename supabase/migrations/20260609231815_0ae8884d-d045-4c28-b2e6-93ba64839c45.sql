
CREATE TABLE public.campaign_builds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  product_name text NOT NULL,
  product_url text,
  product_description text,
  monthly_budget numeric,
  target_audience text,
  campaign_name text NOT NULL,
  selected_headline text,
  selected_body text,
  headlines jsonb NOT NULL DEFAULT '[]'::jsonb,
  bodies jsonb NOT NULL DEFAULT '[]'::jsonb,
  context_hints jsonb NOT NULL DEFAULT '[]'::jsonb,
  utm_url text NOT NULL,
  remote_campaign_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.campaign_builds TO authenticated;
GRANT ALL ON public.campaign_builds TO service_role;

ALTER TABLE public.campaign_builds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own campaign builds" ON public.campaign_builds
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER campaign_builds_set_updated_at
  BEFORE UPDATE ON public.campaign_builds
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
