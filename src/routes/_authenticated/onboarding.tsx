import { createFileRoute, useNavigate } from "@tanstack/react-router";
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

export const Route = createFileRoute("/_authenticated/onboarding")({
  component: Onboarding,
});

const CHECKLIST_ITEMS = [
  { key: "open_manager", label: 'Go to OpenAI Ads Manager → Conversions' },
  { key: "create_event", label: 'Create a new conversion event called "Purchase"' },
  { key: "variable_value", label: 'Set conversion value to "Variable" (tracks actual order value)' },
  { key: "add_pixel", label: "Copy the pixel snippet and add it to your order confirmation page" },
  { key: "test", label: "Test a conversion to make sure it fires" },
];

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
    setBusy(true);
    try {
      await verifyFn({ data: { apiKey: apiKey.trim() } });
      await refetch();
      toast.success("Connected");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not connect");
    } finally {
      setBusy(false);
    }
  }

  async function step2Submit() {
    setBusy(true);
    try {
      await storeUrlFn({ data: { storeUrl: storeUrl.trim() } });
      setStep(3);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Invalid URL");
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
              <Input id="url" value={storeUrl} onChange={(e) => setStoreUrl(e.target.value)} placeholder="https://mystore.com" />
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
            <p className="text-sm text-muted-foreground">Follow these steps inside OpenAI Ads Manager.</p>
            <ul className="space-y-2">
              {CHECKLIST_ITEMS.map((it, idx) => {
                const checked = !!settings?.conversionChecklist?.[it.key];
                return (
                  <li key={it.key} className="flex items-start gap-3 rounded-lg border p-3">
                    <Checkbox checked={checked} onCheckedChange={(v) => toggleCheck(it.key, !!v)} id={`c-${idx}`} />
                    <Label htmlFor={`c-${idx}`} className="cursor-pointer text-sm leading-snug">
                      <span className="font-medium text-foreground">{idx + 1}.</span> {it.label}
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