import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { getSettings, updateChecklist } from "@/lib/ads.functions";
import { CONVERSION_STEPS, SHOPIFY_PIXEL_SNIPPET } from "@/lib/shopify-pixel-snippet";

export const Route = createFileRoute("/_authenticated/conversions")({
  component: ConversionsPage,
});

function ConversionsPage() {
  const settingsFn = useServerFn(getSettings);
  const checklistFn = useServerFn(updateChecklist);
  const { data: settings, refetch } = useQuery({ queryKey: ["settings"], queryFn: () => settingsFn() });
  const [copied, setCopied] = useState(false);

  async function toggle(key: string, value: boolean) {
    await checklistFn({ data: { key, complete: value } });
    await refetch();
  }

  async function copySnippet() {
    await navigator.clipboard.writeText(SHOPIFY_PIXEL_SNIPPET);
    setCopied(true);
    toast.success("Pixel snippet copied");
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <AppShell title="Conversion Setup">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Setup checklist</CardTitle>
          <p className="text-sm text-muted-foreground">Follow these steps to track Shopify orders inside OpenAI Ads Manager.</p>
        </CardHeader>
        <CardContent className="space-y-2">
          {CONVERSION_STEPS.map((it, idx) => {
            const checked = !!settings?.conversionChecklist?.[it.key];
            return (
              <div key={it.key} className="flex items-start gap-3 rounded-lg border p-3">
                <Checkbox id={`c-${idx}`} checked={checked} onCheckedChange={(v) => toggle(it.key, !!v)} className="mt-1" />
                <div className="space-y-1">
                  <Label htmlFor={`c-${idx}`} className="cursor-pointer text-sm font-medium leading-snug text-foreground">
                    <span className="text-muted-foreground">{idx + 1}.</span> {it.title}
                  </Label>
                  <p className="text-sm text-muted-foreground">{it.body}</p>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-base">Shopify custom pixel code</CardTitle>
            <p className="text-sm text-muted-foreground">Paste this into the custom pixel you create in Shopify → Customer Events.</p>
          </div>
          <Button size="sm" variant="outline" onClick={copySnippet}>
            {copied ? <Check className="mr-1 h-4 w-4" /> : <Copy className="mr-1 h-4 w-4" />}
            {copied ? "Copied" : "Copy"}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg bg-warning/10 px-3 py-2 text-xs text-warning-foreground border border-warning/30 mb-3">
            Replace <code className="font-mono">YOUR_PIXEL_ID_HERE</code> with the Pixel ID from the data source you created in step 2.
          </div>
          <pre className="max-h-96 overflow-auto rounded-lg bg-slate-950 p-4 text-xs leading-relaxed text-slate-100">
            <code>{SHOPIFY_PIXEL_SNIPPET}</code>
          </pre>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader><CardTitle className="text-base">Test your pixel</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>1. Open your store in a private/incognito window and open the browser console.</p>
          <p>2. View a product, add to cart, start checkout, then complete a test order.</p>
          <p>3. You should see <code className="font-mono">OpenAI test:</code> log lines for each step.</p>
          <p>4. In OpenAI Ads Manager, open Conversions → your data source — events appear within ~30 seconds.</p>
        </CardContent>
      </Card>
    </AppShell>
  );
}