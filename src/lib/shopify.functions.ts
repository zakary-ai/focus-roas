import { createServerFn } from "@tanstack/react-start";
import { getRequestHost } from "@tanstack/react-start/server";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

function normalizeDomain(input: string): string {
  let v = input.trim().toLowerCase();
  v = v.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
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

export const connectShopify = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { domain: string; accessToken: string }) =>
    z
      .object({
        domain: z.string().trim().min(3).max(255),
        accessToken: z.string().trim().min(10).max(500),
      })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const domain = normalizeDomain(data.domain);
    const token = data.accessToken.trim();

    // 1. Verify token by fetching shop info
    let shop: { shop?: { name?: string; myshopify_domain?: string } };
    try {
      shop = await shopifyFetch(domain, token, "/shop.json");
    } catch (e) {
      return {
        ok: false as const,
        errorMessage:
          e instanceof Error
            ? `Could not connect: ${e.message}. Check the store URL and access token.`
            : "Could not connect to Shopify.",
      };
    }

    const realDomain = shop.shop?.myshopify_domain ?? domain;
    const webhookSecret = crypto.randomUUID().replace(/-/g, "");
    const host = getRequestHost();
    const webhookUrl = `https://${host}/api/public/shopify-webhook?u=${userId}`;

    // 2. Register orders/create webhook (delete any existing ones to this URL first)
    try {
      const existing = (await shopifyFetch(domain, token, "/webhooks.json")) as {
        webhooks?: { id: number; address: string; topic: string }[];
      };
      for (const w of existing.webhooks ?? []) {
        if (w.topic === "orders/create" && w.address.includes("/api/public/shopify-webhook")) {
          await shopifyFetch(domain, token, `/webhooks/${w.id}.json`, { method: "DELETE" });
        }
      }
      await shopifyFetch(domain, token, "/webhooks.json", {
        method: "POST",
        body: JSON.stringify({
          webhook: {
            topic: "orders/create",
            address: webhookUrl,
            format: "json",
          },
        }),
      });
    } catch (e) {
      return {
        ok: false as const,
        errorMessage:
          e instanceof Error
            ? `Token works but webhook registration failed: ${e.message}. Make sure the custom app has the write_webhooks scope.`
            : "Webhook registration failed.",
      };
    }

    // 3. Save credentials
    const { error } = await supabase
      .from("user_settings")
      .upsert(
        {
          user_id: userId,
          shopify_domain: realDomain,
          shopify_access_token: token,
          shopify_webhook_secret: webhookSecret,
        },
        { onConflict: "user_id" },
      );
    if (error) throw new Error(error.message);

    return { ok: true as const, domain: realDomain, shopName: shop.shop?.name ?? realDomain };
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