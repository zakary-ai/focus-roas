import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// ---------- OpenAI Ads API ----------
const OPENAI_ADS_BASE = "https://api.ads.openai.com/v1";

class OpenAIAdsApiError extends Error {
  status: number;
  bodyText: string;
  apiMessage: string | null;

  constructor(status: number, bodyText: string, apiMessage: string | null) {
    super(`OpenAI Ads API ${status}: ${(apiMessage ?? bodyText) || "Request failed"}`);
    this.name = "OpenAIAdsApiError";
    this.status = status;
    this.bodyText = bodyText;
    this.apiMessage = apiMessage;
  }
}

function parseAdsApiMessage(bodyText: string): string | null {
  try {
    const parsed = JSON.parse(bodyText);
    return typeof parsed?.error?.message === "string" ? parsed.error.message : null;
  } catch {
    return null;
  }
}

function formatAdsConnectionError(error: unknown): string {
  if (error instanceof OpenAIAdsApiError) {
    if (error.status === 401) {
      return "The API key was rejected. Check that you pasted the correct OpenAI Ads API key.";
    }

    if (error.status === 403) {
      return "This API key does not have access to an ad account.";
    }

    if (error.status === 404) {
      return "That OpenAI Ads resource could not be found. Recheck the ID you entered.";
    }

    return error.apiMessage
      ? `OpenAI Ads API ${error.status}: ${error.apiMessage}`
      : `OpenAI Ads API ${error.status}: ${error.bodyText.slice(0, 300) || "Request failed"}`;
  }

  return error instanceof Error ? error.message : "Could not connect to OpenAI Ads";
}

function isRecoverableAdsAuthError(error: unknown): error is OpenAIAdsApiError {
  return error instanceof OpenAIAdsApiError && [401, 403, 404].includes(error.status);
}

async function oaiAds<T>(
  apiKey: string,
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${OPENAI_ADS_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new OpenAIAdsApiError(
      res.status,
      body.slice(0, 1000) || res.statusText,
      parseAdsApiMessage(body),
    );
  }
  return (await res.json()) as T;
}

async function getCreds(supabase: any, userId: string) {
  const { data, error } = await supabase
    .from("user_settings")
    .select("openai_ads_api_key")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data?.openai_ads_api_key) return null;
  return { apiKey: data.openai_ads_api_key as string };
}

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
      .select(
        "openai_ads_api_key, openai_ad_account_id, connected_account_name, store_url, onboarding_completed, conversion_checklist",
      )
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    const row = data ?? {
      openai_ads_api_key: null,
      openai_ad_account_id: null,
      connected_account_name: null,
      store_url: null,
      onboarding_completed: false,
      conversion_checklist: {},
    };
    return {
      apiKeyConnected: !!row.openai_ads_api_key,
      apiKeyMasked: mask(row.openai_ads_api_key as string | null),
      adAccountId: (row.openai_ad_account_id as string | null) ?? null,
      accountName: row.connected_account_name,
      storeUrl: row.store_url,
      onboardingCompleted: row.onboarding_completed,
      conversionChecklist: (row.conversion_checklist as Record<string, boolean>) ?? {},
    };
  });

export const verifyApiKey = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { apiKey: string }) =>
    z
      .object({
        apiKey: z.string().trim().min(8, "Key looks too short").max(200),
      })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const apiKey = data.apiKey.trim();

    let account: { id: string; name?: string };
    try {
      account = await oaiAds<{ id: string; name?: string }>(apiKey, "/ad_account");
    } catch (e) {
      return { ok: false as const, errorMessage: formatAdsConnectionError(e) };
    }

    const accountName = account.name ?? account.id;
    const { error } = await supabase
      .from("user_settings")
      .upsert(
        {
          user_id: userId,
          openai_ads_api_key: apiKey,
          openai_ad_account_id: account.id,
          connected_account_name: accountName,
        },
        { onConflict: "user_id" },
      );
    if (error) throw new Error(error.message);
    return { ok: true as const, accountName };
  });

export const updateStoreUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { storeUrl: string }) =>
    z
      .object({
        storeUrl: z
          .string()
          .trim()
          .min(1)
          .max(500)
          .transform((v) => (/^https?:\/\//i.test(v) ? v : `https://${v}`))
          .pipe(z.string().url().max(500)),
      })
      .parse(d),
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

// ---------- Ads provider (OpenAI Ads API) ----------
type ApiCampaign = {
  id: string;
  name: string;
  insight_metrics?: {
    spend?: number;
    clicks?: number;
    impressions?: number;
    revenue?: number;
    conversions?: number;
  };
};

export const listCampaigns = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const creds = await getCreds(context.supabase, context.userId);
    if (!creds) return { connected: false as const, campaigns: [] };
    try {
      const res = await oaiAds<{ data: ApiCampaign[] }>(creds.apiKey, "/campaigns");
      return {
        connected: true as const,
        campaigns: (res.data ?? []).map((c) => ({ id: c.id, name: c.name })),
      };
    } catch (error) {
      if (isRecoverableAdsAuthError(error)) {
        return {
          connected: false as const,
          campaigns: [],
          errorMessage: formatAdsConnectionError(error),
        };
      }
      throw error;
    }
  });

export const getDashboardMetrics = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { days: number }) =>
    z.object({ days: z.number().int().min(1).max(365) }).parse(d),
  )
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const creds = await getCreds(supabase, userId);
    if (!creds) return { connected: false as const };

    const { data: settings } = await supabase
      .from("user_settings")
      .select("conversion_checklist")
      .eq("user_id", userId)
      .maybeSingle();
    const checklist = (settings?.conversion_checklist as Record<string, boolean>) ?? {};
    const conversionsConfigured = Object.values(checklist).filter(Boolean).length >= 3;

    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - (data.days - 1));
    const isoDay = (d: Date) => d.toISOString().slice(0, 10);

    // Fetch campaigns, then per-campaign daily insights
    type InsightRow = {
      date?: string;
      start_date?: string;
      spend?: number;
      revenue?: number;
      clicks?: number;
      impressions?: number;
    };
    let campRes: { data: ApiCampaign[] };
    try {
      campRes = await oaiAds<{ data: ApiCampaign[] }>(creds.apiKey, "/campaigns");
    } catch (error) {
      if (isRecoverableAdsAuthError(error)) {
        return { connected: false as const, errorMessage: formatAdsConnectionError(error) };
      }
      throw error;
    }

    const startKey = isoDay(start);
    const byDate = new Map<string, { spend: number; revenue: number; clicks: number }>();
    const campaigns: {
      id: string; name: string; spend: number; clicks: number;
      ctr: number; cpc: number; revenue: number; roas: number;
    }[] = [];

    const insightResults = await Promise.all(
      (campRes.data ?? []).map(async (c) => {
        try {
          const r = await oaiAds<{ data: InsightRow[] }>(
            creds.apiKey,
            `/campaigns/${encodeURIComponent(c.id)}/insights?time_granularity=daily&limit=${data.days}`,
          );
          return { c, rows: r.data ?? [], error: null as null | unknown };
        } catch (error) {
          if (isRecoverableAdsAuthError(error)) return { c, rows: [], error };
          throw error;
        }
      }),
    );

    for (const { c, rows } of insightResults) {
      let cSpend = 0, cClicks = 0, cImpr = 0, cRev = 0;
      for (const row of rows) {
        const date = (row.date ?? row.start_date ?? "").slice(0, 10);
        const spend = Number(row.spend ?? 0);
        const revenue = Number(row.revenue ?? 0);
        const clicks = Number(row.clicks ?? 0);
        const impressions = Number(row.impressions ?? 0);
        cSpend += spend; cClicks += clicks; cImpr += impressions; cRev += revenue;
        if (date && date >= startKey) {
          const cur = byDate.get(date) ?? { spend: 0, revenue: 0, clicks: 0 };
          cur.spend += spend; cur.revenue += revenue; cur.clicks += clicks;
          byDate.set(date, cur);
        }
      }
      campaigns.push({
        id: c.id,
        name: c.name,
        spend: cSpend,
        clicks: cClicks,
        ctr: cImpr ? (cClicks / cImpr) * 100 : 0,
        cpc: cClicks ? cSpend / cClicks : 0,
        revenue: cRev,
        roas: cSpend ? cRev / cSpend : 0,
      });
    }

    const series: { date: string; spend: number; revenue: number; clicks: number }[] = [];
    for (let i = data.days - 1; i >= 0; i--) {
      const d = new Date(end);
      d.setDate(end.getDate() - i);
      const key = isoDay(d);
      const row = byDate.get(key) ?? { spend: 0, revenue: 0, clicks: 0 };
      series.push({ date: key, ...row });
    }
    const totals = series.reduce(
      (a, s) => ({
        spend: a.spend + s.spend,
        revenue: a.revenue + s.revenue,
        clicks: a.clicks + s.clicks,
      }),
      { spend: 0, revenue: 0, clicks: 0 },
    );

    return {
      connected: true as const,
      conversionsConfigured,
      totals: {
        spend: Math.round(totals.spend * 100) / 100,
        revenue: Math.round(totals.revenue * 100) / 100,
        clicks: totals.clicks,
        roas: totals.spend ? totals.revenue / totals.spend : 0,
      },
      series: series.map((s) => ({
        date: s.date,
        spend: Math.round(s.spend * 100) / 100,
        revenue: Math.round(s.revenue * 100) / 100,
        clicks: s.clicks,
      })),
      campaigns,
    };
  });

export const getCampaign = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) =>
    z.object({ id: z.string().trim().min(1).max(128) }).parse(d),
  )
  .handler(async ({ context, data }) => {
    const creds = await getCreds(context.supabase, context.userId);
    if (!creds) throw new Error("OpenAI Ads is not connected");
    try {
      return await oaiAds<{ data: ApiCampaign } | ApiCampaign>(
        creds.apiKey,
        `/campaigns/${encodeURIComponent(data.id)}`,
      );
    } catch (error) {
      throw new Error(formatAdsConnectionError(error));
    }
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