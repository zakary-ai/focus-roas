import { createServerFn } from "@tanstack/react-start";
import { getRequestHost } from "@tanstack/react-start/server";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

function normalizeDomain(input: string): string {
  let v = input.trim().toLowerCase();
  v = v.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  if (!v.includes(".")) v = `${v}.myshopify.com`;
  return v;
}

async function shopifyFetch(domain: string, token: string, path: string, init: RequestInit = {}) {
  const res = await fetch(`https://${domain}/admin/api/2024-10${path}`, {
    ...init,
    headers: {
      "X-Shopify-Access-Token": token,
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(init.headers ?? {}),
    },
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Shopify ${res.status}: ${text.slice(0, 300)}`);
  }
  return text ? JSON.parse(text) : {};
}

export const getShopifyStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data } = await supabase
      .from("user_settings")
      .select("shopify_domain, shopify_access_token")
      .eq("user_id", userId)
      .maybeSingle();
    return {
      connected: !!data?.shopify_access_token,
      domain: (data?.shopify_domain as string | null) ?? null,
    };
  });

/**
 * Generates a signed OAuth authorize URL. State = base64url(payload).base64url(hmac)
 * where payload = `${userId}.${nonce}.${ts}` and hmac is HMAC-SHA256 with the
 * Shopify client secret. The /api/public/shopify-oauth/callback route verifies it.
 */
export const startShopifyOAuth = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { domain: string }) =>
    z
      .object({
        domain: z.string().trim().min(3).max(255),
      })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    const { userId } = context;
    const clientId = process.env.SHOPIFY_CLIENT_ID;
    const clientSecret = process.env.SHOPIFY_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      return { ok: false as const, errorMessage: "Shopify app credentials are not configured." };
    }
    const domain = normalizeDomain(data.domain);
    if (!/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/.test(domain)) {
      return {
        ok: false as const,
        errorMessage: "Enter your store as yourstore.myshopify.com",
      };
    }

    const { createHmac, randomBytes } = await import("crypto");
    const nonce = randomBytes(16).toString("hex");
    const ts = Date.now().toString();
    const payload = `${userId}.${nonce}.${ts}`;
    const sig = createHmac("sha256", clientSecret).update(payload).digest("hex");
    const state = `${Buffer.from(payload).toString("base64url")}.${sig}`;

    const host = getRequestHost();
    const redirectUri = `https://${host}/api/public/shopify-oauth/callback`;
    const scopes = "read_orders,read_analytics";

    const authUrl =
      `https://${domain}/admin/oauth/authorize` +
      `?client_id=${encodeURIComponent(clientId)}` +
      `&scope=${encodeURIComponent(scopes)}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&state=${encodeURIComponent(state)}`;

    return { ok: true as const, authUrl, redirectUri };
  });

export const disconnectShopify = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data } = await supabase
      .from("user_settings")
      .select("shopify_domain, shopify_access_token")
      .eq("user_id", userId)
      .maybeSingle();
    if (data?.shopify_domain && data.shopify_access_token) {
      try {
        const existing = (await shopifyFetch(
          data.shopify_domain as string,
          data.shopify_access_token as string,
          "/webhooks.json",
        )) as { webhooks?: { id: number; address: string; topic: string }[] };
        for (const w of existing.webhooks ?? []) {
          if (w.address.includes("/api/public/shopify-webhook")) {
            await shopifyFetch(
              data.shopify_domain as string,
              data.shopify_access_token as string,
              `/webhooks/${w.id}.json`,
              { method: "DELETE" },
            );
          }
        }
      } catch {
        // ignore — clear local creds anyway
      }
    }
    await supabase
      .from("user_settings")
      .update({
        shopify_access_token: null,
        shopify_webhook_secret: null,
        shopify_domain: null,
      })
      .eq("user_id", userId);
    return { ok: true };
  });