import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-shopify-hmac-sha256, x-shopify-topic, x-shopify-shop-domain",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  const url = new URL(req.url);
  const userId = url.searchParams.get("user_id");
  const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!userId || !uuidRe.test(userId)) {
    return new Response("Missing or invalid user_id", { status: 400, headers: corsHeaders });
  }

  let order: Record<string, unknown>;
  try {
    order = await req.json();
  } catch {
    return new Response("Bad JSON", { status: 400, headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const orderNumber =
    (order.order_number as number | string | undefined)?.toString() ??
    (order.name as string | undefined) ??
    (order.id as number | string | undefined)?.toString() ??
    null;
  const totalPrice = order.total_price != null ? Number(order.total_price) : null;
  const createdAt = (order.created_at as string | undefined) ?? null;
  const sourceName = (order.source_name as string | undefined) ?? null;
  const landingSite = (order.landing_site as string | undefined) ?? null;

  const { error } = await supabase.from("shopify_orders").upsert(
    {
      user_id: userId,
      order_number: orderNumber,
      total_price: totalPrice,
      shopify_created_at: createdAt,
      source_name: sourceName,
      landing_site: landingSite,
      raw: order,
    },
    { onConflict: "user_id,order_number" },
  );

  if (error) {
    console.error("shopify-webhook insert error", error);
    return new Response(`DB error: ${error.message}`, { status: 500, headers: corsHeaders });
  }

  return new Response("ok", { status: 200, headers: corsHeaders });
});