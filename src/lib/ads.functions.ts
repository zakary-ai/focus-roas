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

function utcDayFromToday(daysAgo: number) {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - daysAgo));
}

function isoUtcDay(d: Date) {
  return d.toISOString().slice(0, 10);
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

    type InsightRow = {
      readable_time?: string;
      campaign_id?: string;
      campaign_name?: string;
      spend?: number | string;
      clicks?: number | string;
      impressions?: number | string;
      ctr?: number | string;
      cpc?: number | string;
    };

    const insightFields = [
      "readable_time",
      "campaign_id",
      "campaign_name",
      "clicks",
      "impressions",
      "spend",
      "ctr",
      "cpc",
    ];

    let insightsRes: { data: InsightRow[] } | null = null;
    let end: Date | null = null;

    for (let endOffsetDays = 1; endOffsetDays <= 7; endOffsetDays++) {
      const candidateEnd = utcDayFromToday(endOffsetDays);
      const candidateStart = new Date(candidateEnd);
      candidateStart.setUTCDate(candidateEnd.getUTCDate() - (data.days - 1));

      const params = new URLSearchParams();
      params.append("time_granularity", "daily");
      params.append("aggregation_level", "campaign");
      for (const field of insightFields) {
        params.append("fields[]", field);
      }
      params.append(
        "time_ranges[]",
        JSON.stringify({
          type: "date_range",
          since: isoUtcDay(candidateStart),
          until: isoUtcDay(candidateEnd),
        }),
      );
      params.append("limit", "1000");

      try {
        insightsRes = await oaiAds<{ data: InsightRow[] }>(
          creds.apiKey,
          `/ad_account/insights?${params.toString()}`,
        );
        end = candidateEnd;
        break;
      } catch (error) {
        if (isRecoverableAdsAuthError(error)) {
          return { connected: false as const, errorMessage: formatAdsConnectionError(error) };
        }

        const isFutureRangeError =
          error instanceof OpenAIAdsApiError &&
          error.status === 400 &&
          (error.apiMessage ?? error.bodyText).includes("time_ranges.end cannot be in the future");

        if (isFutureRangeError && endOffsetDays < 7) {
          continue;
        }

        throw error;
      }
    }

    if (!insightsRes || !end) {
      throw new Error("Could not fetch dashboard insights right now.");
    }

    const byDate = new Map<string, { spend: number; revenue: number; clicks: number }>();
    const campMap = new Map<
      string,
      { id: string; name: string; spend: number; clicks: number; impressions: number; revenue: number }
    >();

    for (const row of insightsRes.data ?? []) {
      const date = (row.readable_time ?? "").slice(0, 10);
      const spend = Number(row.spend ?? 0);
      const clicks = Number(row.clicks ?? 0);
      const impressions = Number(row.impressions ?? 0);
      const id = row.campaign_id ?? "unknown";
      const name = row.campaign_name ?? id;

      if (date) {
        const cur = byDate.get(date) ?? { spend: 0, revenue: 0, clicks: 0 };
        cur.spend += spend;
        cur.clicks += clicks;
        byDate.set(date, cur);
      }
      const c = campMap.get(id) ?? { id, name, spend: 0, clicks: 0, impressions: 0, revenue: 0 };
      c.spend += spend;
      c.clicks += clicks;
      c.impressions += impressions;
      campMap.set(id, c);
    }

    const campaigns = Array.from(campMap.values()).map((c) => ({
      id: c.id,
      name: c.name,
      spend: c.spend,
      clicks: c.clicks,
      ctr: c.impressions ? (c.clicks / c.impressions) * 100 : 0,
      cpc: c.clicks ? c.spend / c.clicks : 0,
      revenue: 0,
      roas: 0,
    }));

    const series: { date: string; spend: number; revenue: number; clicks: number }[] = [];
    for (let i = data.days - 1; i >= 0; i--) {
      const d = new Date(end);
      d.setUTCDate(end.getUTCDate() - i);
      const key = isoUtcDay(d);
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

// ---------- Campaign Builder ----------
function slugifyName(s: string) {
  return s.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function buildUtmUrl(productUrl: string, campaignName: string) {
  try {
    const u = new URL(productUrl);
    u.searchParams.set("utm_source", "openai");
    u.searchParams.set("utm_medium", "cpc");
    u.searchParams.set("utm_campaign", slugifyName(campaignName));
    return u.toString();
  } catch {
    return productUrl;
  }
}

const BuildInput = z.object({
  productName: z.string().trim().min(1).max(200),
  productUrl: z.string().trim().url().max(500),
  productDescription: z.string().trim().min(1).max(2000),
  monthlyBudget: z.number().positive().max(1_000_000),
  targetAudience: z.string().trim().min(1).max(500),
  brand: z.string().trim().max(100).optional(),
  campaignName: z.string().trim().min(1).max(200).optional(),
});

export const buildCampaign = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => BuildInput.parse(d))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;

    const { data: settings } = await supabase
      .from("user_settings")
      .select("connected_account_name, store_url")
      .eq("user_id", userId)
      .maybeSingle();

    const brand =
      data.brand?.trim() ||
      (settings?.connected_account_name as string | undefined)?.trim() ||
      "Brand";

    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    const systemPrompt =
      "You are a senior performance marketer writing ads for OpenAI Ads. Return strictly valid JSON. Headlines must be <=60 chars. Body copy must be <=150 chars. Context hints are specific multi-word conversational phrases describing the kinds of ChatGPT conversations where this ad should appear — buyer intents, use-cases, buyer personas, product variants, and purchase contexts. Each hint is a short phrase (3-8 words), lowercased, no punctuation. Aim for 12-18 hints covering a wide range of intents: bulk/wholesale, specific use-cases (industry, profession, environment), product variants/specs, and price/quality angles.";
    const userPrompt = `Generate ad copy for this product.
Product: ${data.productName}
Description: ${data.productDescription}
Target audience: ${data.targetAudience}
Monthly budget: $${data.monthlyBudget}

Example of high-performing context_hints for "blue nitrile gloves" (style reference only — generate hints specific to THIS product):
["buying blue nitrile gloves in bulk","powder-free nitrile gloves","disposable gloves","industrial gloves","exam gloves","PPE supplies","bulk gloves by the case","latex-free gloves","nitrile gloves for shops","nitrile gloves for cleaning companies","gloves for janitorial teams","gloves for warehouses","gloves for auto shops","gloves for food handling","gloves for maintenance crews","gloves for medical offices","wholesale nitrile gloves","case-packed gloves","affordable disposable work gloves"]

Return JSON with this exact shape:
{"headlines":["...","...","..."],"bodies":["...","...","..."],"context_hints":["...", ... 12 to 18 phrases ...]}`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": key,
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!aiRes.ok) {
      const txt = await aiRes.text().catch(() => "");
      if (aiRes.status === 429) throw new Error("AI rate limit hit. Try again shortly.");
      if (aiRes.status === 402) throw new Error("AI credits exhausted. Please add credits.");
      throw new Error(`AI generation failed: ${aiRes.status} ${txt.slice(0, 200)}`);
    }
    const aiJson = (await aiRes.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = aiJson.choices?.[0]?.message?.content ?? "{}";
    let parsed: { headlines?: string[]; bodies?: string[]; context_hints?: string[] } = {};
    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = {};
    }
    const headlines = (parsed.headlines ?? []).slice(0, 3).map((s) => String(s).slice(0, 60));
    const bodies = (parsed.bodies ?? []).slice(0, 3).map((s) => String(s).slice(0, 150));
    const context_hints = (parsed.context_hints ?? [])
      .slice(0, 20)
      .map((s) => String(s).trim().toLowerCase().slice(0, 120))
      .filter(Boolean);

    while (headlines.length < 3) headlines.push(`${data.productName} — shop now`);
    while (bodies.length < 3) bodies.push(`Discover ${data.productName}. Built for ${data.targetAudience}.`);
    while (context_hints.length < 3) context_hints.push(data.targetAudience.split(/[,]+/)[0]?.trim().toLowerCase() ?? "buyers");

    const campaignName =
      data.campaignName?.trim() || `${brand} - ${data.productName} - v1`;
    const utmUrl = buildUtmUrl(data.productUrl, campaignName);
    const dailyBudget = Math.round((data.monthlyBudget / 30) * 100) / 100;
    const lifetimeBudgetMicros = Math.round(data.monthlyBudget * 1_000_000);

    return {
      campaignName,
      utmUrl,
      dailyBudget,
      lifetimeBudgetMicros,
      headlines,
      bodies,
      contextHints: context_hints,
      brand,
    };
  });

const SaveBuildInput = z.object({
  productName: z.string().min(1).max(200),
  productUrl: z.string().url().max(500),
  productDescription: z.string().max(2000).optional(),
  monthlyBudget: z.number().positive(),
  targetAudience: z.string().max(500).optional(),
  campaignName: z.string().min(1).max(200),
  selectedHeadline: z.string().max(200),
  selectedBody: z.string().max(500),
  headlines: z.array(z.string()).max(10),
  bodies: z.array(z.string()).max(10),
  contextHints: z.array(z.string()).max(10),
  utmUrl: z.string().url().max(1000),
  remoteCampaignId: z.string().max(128).optional(),
});

export const saveCampaignBuild = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => SaveBuildInput.parse(d))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { data: row, error } = await supabase
      .from("campaign_builds")
      .insert({
        user_id: userId,
        product_name: data.productName,
        product_url: data.productUrl,
        product_description: data.productDescription ?? null,
        monthly_budget: data.monthlyBudget,
        target_audience: data.targetAudience ?? null,
        campaign_name: data.campaignName,
        selected_headline: data.selectedHeadline,
        selected_body: data.selectedBody,
        headlines: data.headlines,
        bodies: data.bodies,
        context_hints: data.contextHints,
        utm_url: data.utmUrl,
        remote_campaign_id: data.remoteCampaignId ?? null,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { ok: true, id: row.id as string };
  });

export const listCampaignBuilds = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("campaign_builds")
      .select(
        "id, product_name, campaign_name, selected_headline, selected_body, utm_url, remote_campaign_id, created_at",
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const CreateRemoteInput = z.object({
  campaignName: z.string().min(1).max(200),
  lifetimeBudgetMicros: z.number().int().positive(),
  headline: z.string().min(1).max(200),
  body: z.string().min(1).max(500),
  destinationUrl: z.string().url().max(1000),
  contextHints: z.array(z.string().min(1).max(80)).min(1).max(10),
});

export const createCampaignViaApi = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => CreateRemoteInput.parse(d))
  .handler(async ({ context, data }) => {
    const creds = await getCreds(context.supabase, context.userId);
    if (!creds) throw new Error("OpenAI Ads is not connected. Connect your API key first.");

    try {
      const campaign = await oaiAds<{ id: string }>(creds.apiKey, "/campaigns", {
        method: "POST",
        body: JSON.stringify({
          name: data.campaignName,
          status: "paused",
          budget: data.lifetimeBudgetMicros,
        }),
      });

      const adGroup = await oaiAds<{ id: string }>(creds.apiKey, "/ad_groups", {
        method: "POST",
        body: JSON.stringify({
          campaign_id: campaign.id,
          name: `${data.campaignName} - AG1`,
          status: "paused",
          context_hints: data.contextHints,
        }),
      });

      const ad = await oaiAds<{ id: string }>(creds.apiKey, "/ads", {
        method: "POST",
        body: JSON.stringify({
          ad_group_id: adGroup.id,
          name: `${data.campaignName} - Ad1`,
          status: "paused",
          creative: {
            headline: data.headline,
            body: data.body,
            destination_url: data.destinationUrl,
          },
        }),
      });

      return { ok: true as const, campaignId: campaign.id, adGroupId: adGroup.id, adId: ad.id };
    } catch (error) {
      throw new Error(formatAdsConnectionError(error));
    }
  });