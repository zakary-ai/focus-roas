import { createFileRoute, redirect } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "crypto";

export const Route = createFileRoute("/api/public/shopify-oauth/callback")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const code = url.searchParams.get("code");
        const shop = url.searchParams.get("shop");
        const state = url.searchParams.get("state");
        const shopifyHmac = url.searchParams.get("hmac");

        if (!code || !shop || !state || !shopifyHmac) {
          return new Response("Missing params", { status: 400 });
        }

        const clientId = process.env.SHOPIFY_CLIENT_ID;
        const clientSecret = process.env.SHOPIFY_CLIENT_SECRET;
        if (!clientId || !clientSecret) {
          return new Response("Shopify not configured", { status: 500 });
        }

        // Validate shop domain
        if (!/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/.test(shop)) {
          return new Response("Invalid shop domain", { status: 400 });
        }

        // 1. Verify Shopify's HMAC over the callback params.
        // Mirror Shopify's official libs: parse params, remove hmac/signature,
        // sort by key, then re-serialize via URLSearchParams.
        const sortedParams = new URLSearchParams();
        [...url.searchParams.entries()]
          .filter(([key]) => key !== "hmac" && key !== "signature")
          .sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey))
          .forEach(([key, value]) => {
            sortedParams.append(key, value);
          });
        const message = sortedParams.toString();
        const expectedShopify = createHmac("sha256", clientSecret).update(message).digest("hex");
        const a = Buffer.from(shopifyHmac);
        const b = Buffer.from(expectedShopify);
        if (a.length !== b.length || !timingSafeEqual(a, b)) {
          console.error("Shopify OAuth HMAC mismatch", {
            shop,
            queryKeys: [...url.searchParams.keys()].sort(),
            message,
            receivedPrefix: shopifyHmac.slice(0, 12),
            expectedPrefix: expectedShopify.slice(0, 12),
          });
          return new Response("Invalid Shopify HMAC", { status: 401 });
        }

        // 2. Verify our signed state and extract userId.
        const [payloadB64, sig] = state.split(".");
        if (!payloadB64 || !sig) return new Response("Invalid state", { status: 400 });
        let payload: string;
        try {
          payload = Buffer.from(payloadB64, "base64url").toString("utf8");
        } catch {
          return new Response("Invalid state", { status: 400 });
        }
        const expectedSig = createHmac("sha256", clientSecret).update(payload).digest("hex");
        const sa = Buffer.from(sig);
        const sb = Buffer.from(expectedSig);
        if (sa.length !== sb.length || !timingSafeEqual(sa, sb)) {
          return new Response("Invalid state signature", { status: 401 });
        }
        const [userId, , tsStr] = payload.split(".");
        const ts = Number(tsStr);
        if (!userId || !ts || Date.now() - ts > 10 * 60 * 1000) {
          return new Response("State expired", { status: 400 });
        }

        // 3. Exchange code for access token.
        const tokenRes = await fetch(`https://${shop}/admin/oauth/access_token`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            client_id: clientId,
            client_secret: clientSecret,
            code,
          }),
        });
        if (!tokenRes.ok) {
          const text = await tokenRes.text();
          return new Response(`Token exchange failed: ${text.slice(0, 200)}`, { status: 502 });
        }
        const tokenJson = (await tokenRes.json()) as { access_token?: string; scope?: string };
        const accessToken = tokenJson.access_token;
        if (!accessToken) return new Response("No access token returned", { status: 502 });

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        // 4. Save credentials.
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
          const host = url.host;
          const webhookUrl = `https://${host}/api/public/shopify-webhook?u=${userId}`;
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
        } catch {
          // non-fatal — user can reconnect if webhook missing
        }

        throw redirect({ to: "/dashboard" });
      },
    },
  },
});