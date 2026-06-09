
# ROAS.ai — Build Plan

A SaaS app for managing OpenAI Ads ROAS. Email/password + Google sign-in, onboarding wizard, and a 4-page authenticated app. Since OpenAI Ads has no public API, the integration uses realistic **mock data** via server functions, structured so the real API can be dropped in later by editing a single module.

## Stack & architecture
- TanStack Start (React + TS) + Tailwind (already scaffolded)
- Lovable Cloud (Supabase) for auth, DB, server-side API access
- All "OpenAI Ads" calls go through `createServerFn` handlers (server-only); the API key never reaches the browser
- API key stored in `user_settings` table, protected by RLS (user can only read/write their own row). Encryption at rest = Supabase default (DB-level)

## Auth
- Enable Lovable Cloud
- Email/password + Google OAuth (via `configure_social_auth`)
- `/auth` route (sign in / sign up tabs)
- Managed `_authenticated/` layout gates the app
- New users → redirect to `/onboarding`; returning users → `/dashboard`

## Database (one migration)
- `user_settings` (1:1 with auth.users)
  - `user_id uuid PK refs auth.users on delete cascade`
  - `openai_ads_api_key text` (nullable)
  - `connected_account_name text`
  - `store_url text`
  - `onboarding_completed boolean default false`
  - `conversion_checklist jsonb default '{}'` (step keys → bool)
  - timestamps
- `utm_links` (history for UTM Generator)
  - `id, user_id, campaign_id, campaign_name, base_url, full_url, created_at`
- RLS: each table — user can CRUD only `where user_id = auth.uid()`
- GRANTs to `authenticated` + `service_role`
- Trigger: auto-insert empty `user_settings` row on new auth user

## Server functions (`src/lib/ads.functions.ts`)
All use `requireSupabaseAuth`. Behavior is mock but signature-stable:
- `verifyApiKey({ apiKey })` → validates format (non-empty, length check), stores it, returns `{ ok, accountName: "Acme Ads Account" }`
- `getDashboardMetrics({ from, to })` → returns KPI totals, daily series, campaign rows (deterministic mock based on user id + date)
- `listCampaigns()` → for UTM dropdown
- `getSettings()` / `updateStoreUrl()` / `updateApiKey()` / `deleteAccount()`
- `saveUtmLink()` / `listUtmLinks()`
- `updateChecklist({ key, complete })`

A single `src/lib/ads.provider.ts` exports the mock implementation behind an interface; swapping in a real API later is a one-file change.

## Routes
- `/` — marketing landing (brief hero, CTA to /auth)
- `/auth` — sign in / sign up + Google button
- `/onboarding` (under `_authenticated`) — 4-step wizard with progress bar
  1. Connect API key (calls `verifyApiKey`, shows green check + account name)
  2. Store URL input
  3. Conversion checklist (5 items with checkboxes, persisted)
  4. Done + confetti (`canvas-confetti`) → "Go to dashboard"
  - Skips to dashboard if `onboarding_completed`
- `/dashboard` — date range picker, 4 KPI cards, dual-axis line chart (Recharts), campaign table, yellow banner if revenue=0
- `/utm` — campaign dropdown, URL/campaign inputs, generated URL box, copy button (sonner toast), history table
- `/conversions` — same checklist as onboarding step 3, persistent + "test your pixel" instructions
- `/settings` — masked API key + update modal, store URL update, delete account danger zone

## Layout & design
- `AppShell` with dark sidebar (`#0f172a`), white content, indigo accent (`#6366f1`)
- Tailwind tokens added to `src/styles.css`: `--primary` indigo, `--success` green, `--warning` amber, sidebar tokens
- Inter font via Google Fonts link in `__root.tsx`
- Mobile: sidebar collapses to off-canvas using shadcn Sidebar
- shadcn components: Button, Input, Card, Table, Tabs, Dialog, Checkbox, Select, Calendar/Popover (date range), Sidebar, Sonner

## Packages to add
- `recharts` (charts), `canvas-confetti`, `date-fns` (likely already present)

## Security checklist
- API key only read/written inside server fns (never returned to client except masked)
- `getSettings` returns `apiKeyMasked: "••••a3f9"` instead of raw key
- RLS on all tables; no anon grants
- Google OAuth via Lovable broker
- Input validation with Zod on every server fn

## Build order
1. Enable Cloud + Google auth
2. Migration (tables, RLS, trigger, grants)
3. Auth pages + managed `_authenticated` wiring
4. Server functions + mock provider
5. Onboarding wizard
6. App shell + sidebar
7. Dashboard, UTM, Conversions, Settings pages
8. Landing page polish + SEO meta

## Out of scope (call out to user)
- Real OpenAI Ads API integration (no public API exists yet — mock used)
- Actual pixel/conversion tracking script (guidance only, per spec)
