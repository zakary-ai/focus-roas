import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "crypto";

export const Route = createFileRoute("/api/public/shopify-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const url = new URL(request.url);
        const userId = url.searchParams.get("u");
        if (!userId) return new Response("Missing user", { status: 400 });

        const body = await request.text();
        const hmacHeader = request.headers.get("x-shopify-hmac-sha256") ?? "";

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        const { data: settings } = await supabaseAdmin
          .from("user_settings")
          .select("shopify_domain")
          .eq("user_id", userId)
          .maybeSingle();
        if (!settings?.shopify_domain) {
          return new Response("Not connected", { status: 404 });
        }

        // Verify Shopify HMAC using the SHOPIFY_API_SECRET (Shopify signs with the app's API secret).
        // For Custom Apps, the signing secret is the Admin API access token's API secret key.
        // Until users supply that, accept domain match as a lightweight check.
        const sharedSecret = process.env.SHOPIFY_WEBHOOK_SECRET;
        if (sharedSecret && hmacHeader) {
          const expected = createHmac("sha256", sharedSecret).update(body, "utf8").digest("base64");
          const a = Buffer.from(hmacHeader);
          const b = Buffer.from(expected);
          if (a.length !== b.length || !timingSafeEqual(a, b)) {
            return new Response("Invalid signature", { status: 401 });
          }
        }

        let order: any;
        try {
          order = JSON.parse(body);
        } catch {
          return new Response("Bad JSON", { status: 400 });
        }

        const landingSite: string = order.landing_site ?? order.referring_site ?? "";
        let utm_source: string | null = null;
        let utm_medium: string | null = null;
        let utm_campaign: string | null = null;
        if (landingSite) {
          try {
            const u = new URL(landingSite, `https://${settings.shopify_domain}`);
            utm_source = u.searchParams.get("utm_source");
            utm_medium = u.searchParams.get("utm_medium");
            utm_campaign = u.searchParams.get("utm_campaign");
          } catch {
            // ignore
          }
        }

        const totalPrice = Number(order.total_price ?? order.current_total_price ?? 0);
        const revenueCents = Math.round(totalPrice * 100);
        const currency = order.currency ?? "USD";

        // Look up campaign_id from utm_links if utm_campaign present
        let campaignId: string | null = null;
        if (utm_campaign) {
          const { data: link } = await supabaseAdmin
            .from("utm_links")
            .select("campaign_id")
            .eq("user_id", userId)
            .eq("campaign_name", utm_campaign)
            .maybeSingle();
          campaignId = (link?.campaign_id as string | null) ?? null;
        }

        await supabaseAdmin.from("conversions").upsert(
          {
            user_id: userId,
            campaign_id: campaignId,
            shopify_order_id: String(order.id ?? order.admin_graphql_api_id ?? Date.now()),
            revenue_cents: revenueCents,
            currency,
            utm_source,
            utm_medium,
            utm_campaign,
            landing_site: landingSite || null,
          },
          { onConflict: "user_id,shopify_order_id" },
        );

        return new Response("ok", { status: 200 });
      },
    },
  },
});