import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// Deterministic mock data — based on userId+date so each user sees stable numbers.
function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}
function rng(seed: number) {
  let s = seed || 1;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

const MOCK_CAMPAIGNS = [
  { id: "camp_001", name: "Spring Sale - Search" },
  { id: "camp_002", name: "Brand Awareness - Display" },
  { id: "camp_003", name: "Retargeting - Cart Abandoners" },
  { id: "camp_004", name: "New Product Launch" },
  { id: "camp_005", name: "Holiday Promo" },
];

function mask(key: string | null | undefined): string | null {
  if (!key) return null;
  if (key.length <= 4) return "••••";
  return "••••••••••••" + key.slice(-4);
}

// ---------- Settings ----------
export const getSettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("user_settings")
      .select("openai_ads_api_key, connected_account_name, store_url, onboarding_completed, conversion_checklist")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    const row = data ?? {
      openai_ads_api_key: null,
      connected_account_name: null,
      store_url: null,
      onboarding_completed: false,
      conversion_checklist: {},
    };
    return {
      apiKeyConnected: !!row.openai_ads_api_key,
      apiKeyMasked: mask(row.openai_ads_api_key as string | null),
      accountName: row.connected_account_name,
      storeUrl: row.store_url,
      onboardingCompleted: row.onboarding_completed,
      conversionChecklist: (row.conversion_checklist as Record<string, boolean>) ?? {},
    };
  });

export const verifyApiKey = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { apiKey: string }) =>
    z.object({ apiKey: z.string().trim().min(8, "Key looks too short").max(200) }).parse(d),
  )
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    // Mock validation: any 8+ char key is "valid". A real provider would call the OpenAI Ads API here.
    const accountName = `Acme Ads · ${data.apiKey.slice(-4).toUpperCase()}`;
    const { error } = await supabase
      .from("user_settings")
      .upsert(
        {
          user_id: userId,
          openai_ads_api_key: data.apiKey,
          connected_account_name: accountName,
        },
        { onConflict: "user_id" },
      );
    if (error) throw new Error(error.message);
    return { ok: true, accountName };
  });

export const updateStoreUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { storeUrl: string }) =>
    z.object({ storeUrl: z.string().trim().url().max(500) }).parse(d),
  )
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("user_settings")
      .upsert({ user_id: userId, store_url: data.storeUrl }, { onConflict: "user_id" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const updateChecklist = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { key: string; complete: boolean }) =>
    z.object({ key: z.string().min(1).max(64), complete: z.boolean() }).parse(d),
  )
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { data: row } = await supabase
      .from("user_settings")
      .select("conversion_checklist")
      .eq("user_id", userId)
      .maybeSingle();
    const current = (row?.conversion_checklist as Record<string, boolean>) ?? {};
    current[data.key] = data.complete;
    const { error } = await supabase
      .from("user_settings")
      .upsert({ user_id: userId, conversion_checklist: current }, { onConflict: "user_id" });
    if (error) throw new Error(error.message);
    return { ok: true, checklist: current };
  });

export const completeOnboarding = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("user_settings")
      .upsert({ user_id: userId, onboarding_completed: true }, { onConflict: "user_id" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteAccountData = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await supabase.from("utm_links").delete().eq("user_id", userId);
    await supabase.from("user_settings").delete().eq("user_id", userId);
    return { ok: true };
  });

// ---------- Ads provider (mock) ----------
export const listCampaigns = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data } = await supabase
      .from("user_settings")
      .select("openai_ads_api_key")
      .eq("user_id", userId)
      .maybeSingle();
    if (!data?.openai_ads_api_key) return { connected: false as const, campaigns: [] };
    return { connected: true as const, campaigns: MOCK_CAMPAIGNS };
  });

export const getDashboardMetrics = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { days: number }) =>
    z.object({ days: z.number().int().min(1).max(365) }).parse(d),
  )
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { data: settings } = await supabase
      .from("user_settings")
      .select("openai_ads_api_key, conversion_checklist")
      .eq("user_id", userId)
      .maybeSingle();
    if (!settings?.openai_ads_api_key) {
      return { connected: false as const };
    }
    const checklist = (settings.conversion_checklist as Record<string, boolean>) ?? {};
    const conversionsConfigured = Object.values(checklist).filter(Boolean).length >= 3;

    const seedBase = hashString(userId);
    const series: { date: string; spend: number; revenue: number; clicks: number }[] = [];
    let totalSpend = 0, totalRevenue = 0, totalClicks = 0;
    for (let i = data.days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const r = rng(seedBase + hashString(dateStr));
      const spend = Math.round((80 + r() * 220) * 100) / 100;
      const clicks = Math.floor(40 + r() * 180);
      const revenue = conversionsConfigured ? Math.round(spend * (1.5 + r() * 2.5) * 100) / 100 : 0;
      series.push({ date: dateStr, spend, revenue, clicks });
      totalSpend += spend;
      totalRevenue += revenue;
      totalClicks += clicks;
    }
    const campaigns = MOCK_CAMPAIGNS.map((c, idx) => {
      const r = rng(seedBase + hashString(c.id));
      const spend = Math.round((totalSpend / MOCK_CAMPAIGNS.length) * (0.6 + r() * 0.8) * 100) / 100;
      const clicks = Math.floor((totalClicks / MOCK_CAMPAIGNS.length) * (0.5 + r() * 0.9));
      const impressions = clicks * Math.floor(30 + r() * 50);
      const revenue = conversionsConfigured ? Math.round(spend * (1.2 + r() * 3) * 100) / 100 : 0;
      return {
        id: c.id,
        name: c.name,
        spend,
        clicks,
        ctr: impressions ? (clicks / impressions) * 100 : 0,
        cpc: clicks ? spend / clicks : 0,
        revenue,
        roas: spend ? revenue / spend : 0,
      };
    });
    return {
      connected: true as const,
      conversionsConfigured,
      totals: {
        spend: Math.round(totalSpend * 100) / 100,
        revenue: Math.round(totalRevenue * 100) / 100,
        clicks: totalClicks,
        roas: totalSpend ? totalRevenue / totalSpend : 0,
      },
      series,
      campaigns,
    };
  });

// ---------- UTM ----------
export const listUtmLinks = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("utm_links")
      .select("id, campaign_name, full_url, base_url, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const saveUtmLink = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { campaignId?: string; campaignName: string; baseUrl: string; fullUrl: string }) =>
    z
      .object({
        campaignId: z.string().max(64).optional(),
        campaignName: z.string().min(1).max(200),
        baseUrl: z.string().url().max(500),
        fullUrl: z.string().url().max(1000),
      })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("utm_links").insert({
      user_id: userId,
      campaign_id: data.campaignId ?? null,
      campaign_name: data.campaignName,
      base_url: data.baseUrl,
      full_url: data.fullUrl,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });