# Plan

## 1. Fix "Store URL" validation in onboarding (Step 2)

Currently the input requires a full URL like `https://www.saraglove.com`, so typing `www.saraglove.com` fails with `Invalid url`.

Change the validation in `src/routes/_authenticated/onboarding.tsx` (and matching logic in `src/routes/_authenticated/settings.tsx` if it shares the same schema):
- Accept bare domains (e.g. `www.saraglove.com`, `saraglove.com/products/x`).
- Auto-prepend `https://` if the user omits the protocol, then validate as URL.
- Show a clearer inline error ("Enter a valid website, e.g. www.example.com").
- Save the normalized `https://...` value to the database.

## 2. New "How to find your API key" help page

Add a dedicated route `src/routes/_authenticated/help.api-key.tsx` (URL: `/help/api-key`) that walks users through retrieving their key from the OpenAI Ads Manager:

1. Go to **Ads Manager → Settings → General**
2. Scroll to **API Keys**
3. Click **+ Create New Key**, name it (e.g. "ROAS.ai"), copy the `sk-svc-...` value
4. Paste it into ROAS.ai

Include:
- Numbered steps with the indigo/dark design system.
- A reference screenshot illustration (use the uploaded settings screenshot as inspiration — recreate as a styled mock panel in JSX, not by embedding the user's screenshot).
- A "Back to onboarding" / "Back to settings" button (uses `history.back()` or links to `/onboarding`).
- Security callout: "Your key is encrypted and only used server-side."

## 3. Link to the help page from existing screens

- Onboarding Step 1 (API key): add a "Need help finding your API key?" link → `/help/api-key` (opens in a new tab so progress isn't lost).
- Settings page API key field: same link next to the input/label.

## Technical notes

- Validation lives in the Zod schema inside the onboarding component. Update to:
  ```ts
  storeUrl: z.string().trim().min(1).transform((v) =>
    /^https?:\/\//i.test(v) ? v : `https://${v}`
  ).pipe(z.string().url())
  ```
- No database, server function, or auth changes required.
- No new dependencies.
