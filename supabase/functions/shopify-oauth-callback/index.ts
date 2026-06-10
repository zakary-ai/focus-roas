// Shopify OAuth callback - handles install redirect from Shopify.
// Verifies HMAC, validates signed state, exchanges code for access token,
// stores credentials in user_settings, and redirects back to the app dashboard.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { createHmac, timingSafeEqual } from "node:crypto";
import { Buffer } from "node:buffer";

const SHOPIFY_CLIENT_ID = Deno.env.get("SHOPIFY_CLIENT_ID") ?? "";
const SHOPIFY_CLIENT_SECRET = Deno.env.get("SHOPIFY_CLIENT_SECRET") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

function validateShopifyHmac(query: Record<string, string>, secret: string): boolean {
  const { hmac, signature: _sig, ...rest } = query;
  if (!hmac) return false;
  const message = Object.keys(rest)
    .sort()
    .map((k) => `${k}=${rest[k]}`)
    .join("&");
  const computed = createHmac("sha256", secret).update(message).digest("hex");
  try {
    const a = Buffer.from(computed, "hex");
    const b = Buffer.from(hmac, "hex");
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

Deno.serve(async (request) => {
  if (request.method !== "GET") {
    return new Response("Method not allowed", { status: 405 });
  }

  if (!SHOPIFY_CLIENT_ID || !SHOPIFY_CLIENT_SECRET) {
    return new Response("Shopify not configured", { status: 500 });
  }

  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const shop = url.searchParams.get("shop");
  const state = url.searchParams.get("state");
  const shopifyHmac = url.searchParams.get("hmac");

  if (!code || !shop || !state || !shopifyHmac) {
    return new Response("Missing params", { status: 400 });
  }

  if (!/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/.test(shop)) {
    return new Response("Invalid shop domain", { status: 400 });
  }

  // 1. Verify Shopify's HMAC over the callback query string.
  const query: Record<string, string> = {};
  for (const [k, v] of url.searchParams.entries()) query[k] = v;
  if (!validateShopifyHmac(query, SHOPIFY_CLIENT_SECRET)) {
    console.error("Shopify OAuth HMAC mismatch", { shop });
    return new Response("Invalid Shopify HMAC", { status: 401 });
  }

  // 2. Verify our signed state: `${userId}.${nonce}.${ts}.${originB64}` . sig
  const [payloadB64, sig] = state.split(".");
  if (!payloadB64 || !sig) return new Response("Invalid state", { status: 400 });
  let payload: string;
  try {
    payload = Buffer.from(payloadB64, "base64url").toString("utf8");
  } catch {
    return new Response("Invalid state", { status: 400 });
  }
  const expectedSig = createHmac("sha256", SHOPIFY_CLIENT_SECRET).update(payload).digest("hex");
  const sa = Buffer.from(sig);
  const sb = Buffer.from(expectedSig);
  if (sa.length !== sb.length || !timingSafeEqual(sa, sb)) {
    return new Response("Invalid state signature", { status: 401 });
  }
  const [userId, , tsStr, originB64] = payload.split(".");
  const ts = Number(tsStr);
  if (!userId || !ts || Date.now() - ts > 10 * 60 * 1000) {
    return new Response("State expired", { status: 400 });
  }
  let appOrigin = "";
  try {
    appOrigin = originB64 ? Buffer.from(originB64, "base64url").toString("utf8") : "";
  } catch {
    appOrigin = "";
  }

  // 3. Exchange code for access token.
  const tokenRes = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      client_id: SHOPIFY_CLIENT_ID,
      client_secret: SHOPIFY_CLIENT_SECRET,
      code,
    }),
  });
  if (!tokenRes.ok) {
    const text = await tokenRes.text();
    return new Response(`Token exchange failed: ${text.slice(0, 200)}`, { status: 502 });
  }
  const tokenJson = (await tokenRes.json()) as { access_token?: string };
  const accessToken = tokenJson.access_token;
  if (!accessToken) return new Response("No access token returned", { status: 502 });

  // 4. Save credentials with service-role client (bypasses RLS).
  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error: saveErr } = await supabaseAdmin.from("user_settings").upsert(
    {
      user_id: userId,
      shopify_domain: shop,
      shopify_access_token: accessToken,
    },
    { onConflict: "user_id" },
  );
  if (saveErr) return new Response(`Save failed: ${saveErr.message}`, { status: 500 });

  // 5. Register orders/create webhook (best-effort).
  try {
    if (appOrigin) {
      const webhookUrl = `${appOrigin.replace(/\/$/, "")}/api/public/shopify-webhook?u=${userId}`;
      const existingRes = await fetch(`https://${shop}/admin/api/2024-10/webhooks.json`, {
        headers: { "X-Shopify-Access-Token": accessToken, Accept: "application/json" },
      });
      if (existingRes.ok) {
        const { webhooks } = (await existingRes.json()) as {
          webhooks?: { id: number; address: string; topic: string }[];
        };
        for (const w of webhooks ?? []) {
          if (w.topic === "orders/create" && w.address.includes("/api/public/shopify-webhook")) {
            await fetch(`https://${shop}/admin/api/2024-10/webhooks/${w.id}.json`, {
              method: "DELETE",
              headers: { "X-Shopify-Access-Token": accessToken },
            });
          }
        }
      }
      await fetch(`https://${shop}/admin/api/2024-10/webhooks.json`, {
        method: "POST",
        headers: {
          "X-Shopify-Access-Token": accessToken,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          webhook: { topic: "orders/create", address: webhookUrl, format: "json" },
        }),
      });
    }
  } catch (e) {
    console.error("webhook registration failed", e);
  }

  // 6. Redirect back to the app dashboard.
  const dashboardUrl = appOrigin
    ? `${appOrigin.replace(/\/$/, "")}/dashboard`
    : "/dashboard";
  return new Response(null, { status: 302, headers: { Location: dashboardUrl } });
});