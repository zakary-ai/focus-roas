import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import {
  getSettings,
  verifyApiKey,
  updateStoreUrl,
  updateChecklist,
  completeOnboarding,
} from "@/lib/ads.functions";
import { CONVERSION_STEPS } from "@/lib/shopify-pixel-snippet";

export const Route = createFileRoute("/_authenticated/onboarding")({
  component: Onboarding,
});

function Onboarding() {
  const navigate = useNavigate();
  const getSettingsFn = useServerFn(getSettings);
  const verifyFn = useServerFn(verifyApiKey);
  const storeUrlFn = useServerFn(updateStoreUrl);
  const checklistFn = useServerFn(updateChecklist);
  const completeFn = useServerFn(completeOnboarding);

  const { data: settings, refetch } = useQuery({
    queryKey: ["settings"],
    queryFn: () => getSettingsFn(),
  });

  const [step, setStep] = useState(1);
  const [apiKey, setApiKey] = useState("");
  const [adAccountId, setAdAccountId] = useState("");
  const [storeUrl, setStoreUrl] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (settings?.onboardingCompleted) navigate({ to: "/dashboard" });
    if (settings?.storeUrl) setStoreUrl(settings.storeUrl);
  }, [settings, navigate]);

  useEffect(() => {
    if (step === 4) {
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    }
  }, [step]);

  async function step1Submit() {
    if (!apiKey.trim()) return toast.error("Enter your API key");
    if (!/^adacct_[A-Za-z0-9]{6,}$/.test(adAccountId.trim()))
      return toast.error("Enter a valid ad account ID (adacct_xxxxxxxxx)");
    setBusy(true);
    try {
      const result = await verifyFn({
        data: { apiKey: apiKey.trim(), adAccountId: adAccountId.trim() },
      });
      if (!result.ok) {
        toast.error(result.errorMessage);
        return;
      }
      await refetch();
      toast.success("Connected");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not connect");
    } finally {
      setBusy(false);
    }
  }

  async function step2Submit() {
    const raw = storeUrl.trim();
    if (!raw) return toast.error("Enter your store URL");
    const normalized = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    try {
      // quick client-side sanity check
      new URL(normalized);
    } catch {
      return toast.error("Enter a valid website, e.g. www.example.com");
    }
    setStoreUrl(normalized);
    setBusy(true);
    try {
      await storeUrlFn({ data: { storeUrl: normalized } });
      setStep(3);
    } catch (e) {
      toast.error("Enter a valid website, e.g. www.example.com");
    } finally {
      setBusy(false);
    }
  }

  async function toggleCheck(key: string, value: boolean) {
    await checklistFn({ data: { key, complete: value } });
    await refetch();
  }

  async function finish() {
    await completeFn();
    navigate({ to: "/dashboard" });
  }

  return (
    <div className="grid min-h-screen place-items-center bg-accent/30 px-4 py-10">
      <div className="w-full max-w-2xl rounded-2xl border bg-card p-8 shadow-sm">
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>Step {step} of 4</span>
            <span>{Math.round((step / 4) * 100)}%</span>
          </div>
          <Progress value={(step / 4) * 100} />
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Connect OpenAI Ads</h2>
            <p className="text-sm text-muted-foreground">Paste your OpenAI Ads API key — it's stored encrypted and only ever used server-side.</p>
            <div>
              <Label htmlFor="key">API Key</Label>
              <Input id="key" type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="sk-ads-..." />
              <Link
                to="/help/api-key"
                target="_blank"
                className="mt-2 inline-block text-xs font-medium text-primary hover:underline"
              >
                Need help finding your API key?
              </Link>
            </div>
            <div>
              <Label htmlFor="acct">Ad Account ID</Label>
              <Input
                id="acct"
                value={adAccountId}
                onChange={(e) => setAdAccountId(e.target.value)}
                placeholder="adacct_xxxxxxxxx"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Find it in OpenAI Ads Manager → Settings → Account. Starts with <code>adacct_</code>.
              </p>
            </div>
            {settings?.apiKeyConnected && (
              <div className="flex items-center gap-2 rounded-lg bg-success/10 px-3 py-2 text-sm text-success">
                <CheckCircle2 className="h-4 w-4" /> Connected to {settings.accountName}
              </div>
            )}
            <div className="flex justify-between">
              <span />
              <div className="flex gap-2">
                <Button onClick={step1Submit} disabled={busy} variant="outline">Connect</Button>
                <Button onClick={() => setStep(2)} disabled={!settings?.apiKeyConnected}>Next</Button>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Add your store URL</h2>
            <p className="text-sm text-muted-foreground">We'll pre-fill this when generating UTM tags.</p>
            <div>
              <Label htmlFor="url">Store or product URL</Label>
              <Input id="url" value={storeUrl} onChange={(e) => setStoreUrl(e.target.value)} placeholder="www.mystore.com" />
              <p className="mt-1 text-xs text-muted-foreground">You can paste a domain like <code>www.mystore.com</code> — we'll add <code>https://</code> for you.</p>
            </div>
            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
              <Button onClick={step2Submit} disabled={busy}>Next</Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Set up conversions</h2>
            <p className="text-sm text-muted-foreground">
              Connect Shopify to OpenAI Ads Manager. Full code &amp; copy button live on the{" "}
              <a href="/conversions" target="_blank" rel="noreferrer" className="font-medium text-primary hover:underline">
                Conversions page
              </a>.
            </p>
            <ul className="space-y-2">
              {CONVERSION_STEPS.map((it, idx) => {
                const checked = !!settings?.conversionChecklist?.[it.key];
                return (
                  <li key={it.key} className="flex items-start gap-3 rounded-lg border p-3">
                    <Checkbox checked={checked} onCheckedChange={(v) => toggleCheck(it.key, !!v)} id={`c-${idx}`} className="mt-1" />
                    <Label htmlFor={`c-${idx}`} className="cursor-pointer space-y-0.5 text-sm leading-snug">
                      <span className="block font-medium text-foreground">
                        <span className="text-muted-foreground">{idx + 1}.</span> {it.title}
                      </span>
                      <span className="block text-xs text-muted-foreground">{it.body}</span>
                    </Label>
                  </li>
                );
              })}
            </ul>
            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setStep(2)}>Back</Button>
              <Button onClick={() => setStep(4)}>I've set up conversions</Button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-success/10 text-success">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <h2 className="text-2xl font-semibold">Your dashboard is ready</h2>
            <p className="text-sm text-muted-foreground">We've stored everything securely. Time to see how your ads are performing.</p>
            <Button onClick={finish} size="lg">Go to dashboard</Button>
          </div>
        )}
      </div>
    </div>
  );
}