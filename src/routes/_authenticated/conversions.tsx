import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { getSettings, updateChecklist } from "@/lib/ads.functions";

export const Route = createFileRoute("/_authenticated/conversions")({
  component: ConversionsPage,
});

const CHECKLIST_ITEMS = [
  { key: "open_manager", label: 'Go to OpenAI Ads Manager → Conversions' },
  { key: "create_event", label: 'Create a new conversion event called "Purchase"' },
  { key: "variable_value", label: 'Set conversion value to "Variable" (tracks actual order value)' },
  { key: "add_pixel", label: "Copy the pixel snippet and add it to your order confirmation page" },
  { key: "test", label: "Test a conversion to make sure it fires" },
];

function ConversionsPage() {
  const settingsFn = useServerFn(getSettings);
  const checklistFn = useServerFn(updateChecklist);
  const { data: settings, refetch } = useQuery({ queryKey: ["settings"], queryFn: () => settingsFn() });

  async function toggle(key: string, value: boolean) {
    await checklistFn({ data: { key, complete: value } });
    await refetch();
  }

  return (
    <AppShell title="Conversion Setup">
      <Card>
        <CardHeader><CardTitle className="text-base">Setup checklist</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {CHECKLIST_ITEMS.map((it, idx) => {
            const checked = !!settings?.conversionChecklist?.[it.key];
            return (
              <div key={it.key} className="flex items-start gap-3 rounded-lg border p-3">
                <Checkbox id={`c-${idx}`} checked={checked} onCheckedChange={(v) => toggle(it.key, !!v)} />
                <Label htmlFor={`c-${idx}`} className="cursor-pointer text-sm leading-snug">
                  <span className="font-medium text-foreground">{idx + 1}.</span> {it.label}
                </Label>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader><CardTitle className="text-base">Test your pixel</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>1. Open your store in a private window.</p>
          <p>2. Place a test order on your order confirmation page.</p>
          <p>3. In OpenAI Ads Manager, open the Purchase event and check the "Recent activity" feed.</p>
          <p>4. You should see a fired event within 30 seconds, including the order value.</p>
        </CardContent>
      </Card>
    </AppShell>
  );
}