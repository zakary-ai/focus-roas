import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Copy, Sparkles, CheckCircle2, X } from "lucide-react";
import { toast } from "sonner";
import {
  buildCampaign,
  saveCampaignBuild,
  listCampaignBuilds,
  createCampaignViaApi,
} from "@/lib/ads.functions";

export const Route = createFileRoute("/_authenticated/utm")({
  component: CampaignBuilderPage,
});

type BuildResult = Awaited<ReturnType<typeof buildCampaign>>;

function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        toast.success("Copied");
      }}
    >
      <Copy className="mr-1 h-3.5 w-3.5" /> {label}
    </Button>
  );
}

function CampaignBuilderPage() {
  const qc = useQueryClient();
  const buildFn = useServerFn(buildCampaign);
  const saveFn = useServerFn(saveCampaignBuild);
  const createRemoteFn = useServerFn(createCampaignViaApi);
  const listFn = useServerFn(listCampaignBuilds);

  const [campaignNameInput, setCampaignNameInput] = useState("");
  const [productName, setProductName] = useState("");
  const [productUrl, setProductUrl] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [monthlyBudget, setMonthlyBudget] = useState<string>("300");
  const [targetAudience, setTargetAudience] = useState("");

  const [result, setResult] = useState<BuildResult | null>(null);
  const [selectedHeadlineIdx, setSelectedHeadlineIdx] = useState(0);
  const [selectedBodyIdx, setSelectedBodyIdx] = useState(0);
  const [hints, setHints] = useState<string[]>([]);
  const [newHint, setNewHint] = useState("");
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const [remoteCampaignId, setRemoteCampaignId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("campaignBuilderPrefill");
      if (!raw) return;
      sessionStorage.removeItem("campaignBuilderPrefill");
      const p = JSON.parse(raw) as {
        campaignName?: string;
        contextHints?: string[];
        monthlyBudget?: number | null;
      };
      if (p.campaignName) setCampaignNameInput(p.campaignName);
      if (Array.isArray(p.contextHints)) setHints(p.contextHints.slice(0, 10));
      if (typeof p.monthlyBudget === "number" && p.monthlyBudget > 0) {
        setMonthlyBudget(String(p.monthlyBudget));
      }
      toast.success("Prefilled from existing campaign");
    } catch {
      // ignore
    }
  }, []);

  const { data: history } = useQuery({
    queryKey: ["campaign-builds"],
    queryFn: () => listFn(),
  });

  const build = useMutation({
    mutationFn: (input: {
      productName: string;
      productUrl: string;
      productDescription: string;
      monthlyBudget: number;
      targetAudience: string;
      campaignName?: string;
    }) => buildFn({ data: input }),
    onSuccess: (r) => {
      setResult(r);
      setSelectedHeadlineIdx(0);
      setSelectedBodyIdx(0);
      setHints(r.contextHints);
      setRemoteCampaignId(null);
      setChecklist({});
      toast.success("Campaign ready");
      save.mutate({
        productName,
        productUrl,
        productDescription,
        monthlyBudget: Number(monthlyBudget),
        targetAudience,
        campaignName: r.campaignName,
        selectedHeadline: r.headlines[0] ?? "",
        selectedBody: r.bodies[0] ?? "",
        headlines: r.headlines,
        bodies: r.bodies,
        contextHints: r.contextHints.slice(0, 10),
        utmUrl: r.utmUrl,
      });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const save = useMutation({
    mutationFn: (input: {
      productName: string;
      productUrl: string;
      productDescription?: string;
      monthlyBudget: number;
      targetAudience?: string;
      campaignName: string;
      selectedHeadline: string;
      selectedBody: string;
      headlines: string[];
      bodies: string[];
      contextHints: string[];
      utmUrl: string;
      remoteCampaignId?: string;
    }) => saveFn({ data: input }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["campaign-builds"] });
    },
  });

  const remote = useMutation({
    mutationFn: (input: {
      campaignName: string;
      lifetimeBudgetMicros: number;
      headline: string;
      body: string;
      destinationUrl: string;
      contextHints: string[];
    }) => createRemoteFn({ data: input }),
    onSuccess: (r) => {
      setRemoteCampaignId(r.campaignId);
      toast.success("Campaign created!");
      if (result) {
        save.mutate({
          productName,
          productUrl,
          productDescription,
          monthlyBudget: Number(monthlyBudget),
          targetAudience,
          campaignName: result.campaignName,
          selectedHeadline: result.headlines[selectedHeadlineIdx],
          selectedBody: result.bodies[selectedBodyIdx],
          headlines: result.headlines,
          bodies: result.bodies,
          contextHints: hints,
          utmUrl: result.utmUrl,
          remoteCampaignId: r.campaignId,
        });
      }
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const selectedHeadline = result?.headlines[selectedHeadlineIdx] ?? "";
  const selectedBody = result?.bodies[selectedBodyIdx] ?? "";

  const steps = useMemo(() => {
    if (!result) return [] as { key: string; label: React.ReactNode }[];
    return [
      { key: "s1", label: <>Go to ads.openai.com → Campaigns → New Campaign → paste <b>{result.campaignName}</b></> },
      { key: "s2", label: <>Set budget to <b>${result.dailyBudget.toFixed(2)}/day</b></> },
      { key: "s3", label: <>Create Ad Group → add context hints: <b>{hints.join(", ")}</b></> },
      { key: "s4", label: <>Create Ad → paste headline, body, and destination URL (the UTM URL)</> },
      { key: "s5", label: <>Submit for review (usually takes a few minutes)</> },
    ];
  }, [result, hints]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const budget = Number(monthlyBudget);
    if (!productName || !productUrl || !productDescription || !targetAudience || !budget) {
      toast.error("Fill in every field");
      return;
    }
    build.mutate({
      productName,
      productUrl,
      productDescription,
      monthlyBudget: budget,
      targetAudience,
      campaignName: campaignNameInput || undefined,
    });
  }

  function saveDraft() {
    if (!result) return;
    save.mutate({
      productName,
      productUrl,
      productDescription,
      monthlyBudget: Number(monthlyBudget),
      targetAudience,
      campaignName: result.campaignName,
      selectedHeadline,
      selectedBody,
      headlines: result.headlines,
      bodies: result.bodies,
      contextHints: hints,
      utmUrl: result.utmUrl,
    });
    toast.success("Saved to history");
  }

  return (
    <AppShell title="Campaign Builder">
      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>New campaign</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="cname">Campaign Name</Label>
                <Input id="cname" value={campaignNameInput} onChange={(e) => setCampaignNameInput(e.target.value)} placeholder="Spring Gloves Promo" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pname">Product Name</Label>
                <Input id="pname" value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="Blue Nitrile Gloves" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="purl">Product URL</Label>
                <Input id="purl" value={productUrl} onChange={(e) => setProductUrl(e.target.value)} placeholder="https://yourstore.com/product" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pdesc">Product Description</Label>
                <Textarea
                  id="pdesc"
                  rows={3}
                  value={productDescription}
                  onChange={(e) => setProductDescription(e.target.value)}
                  placeholder="What it is and who buys it (2-3 sentences)"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="budget">Monthly Budget ($)</Label>
                <Input id="budget" type="number" min="1" value={monthlyBudget} onChange={(e) => setMonthlyBudget(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="aud">Target Audience</Label>
                <Input id="aud" value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} placeholder="medical professionals, janitorial staff" />
              </div>
              <Button type="submit" disabled={build.isPending} className="w-full">
                <Sparkles className="mr-2 h-4 w-4" />
                {build.isPending ? "Building..." : "Build My Campaign"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6 lg:col-span-3">
          {!result ? (
            <Card>
              <CardContent className="p-10 text-center text-muted-foreground">
                Fill the form and click <b>Build My Campaign</b> to generate ad copy and a launch plan.
              </CardContent>
            </Card>
          ) : (
            <>
              {remoteCampaignId && (
                <div className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Campaign created! ID: <code className="font-mono">{remoteCampaignId}</code>
                </div>
              )}

              {/* Section 1: Setup */}
              <Card>
                <CardHeader>
                  <CardTitle>1. Campaign Setup</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <Row label="Campaign Name" value={result.campaignName} />
                  <Row label="Daily Budget" value={`$${result.dailyBudget.toFixed(2)}`} />
                  <Row
                    label="Lifetime Budget (micros)"
                    value={result.lifetimeBudgetMicros.toLocaleString()}
                  />
                </CardContent>
              </Card>

              {/* Section 2: Ad Copy */}
              <Card>
                <CardHeader>
                  <CardTitle>2. Ad Copy</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label className="mb-2 block">Headlines</Label>
                    <RadioGroup
                      value={String(selectedHeadlineIdx)}
                      onValueChange={(v) => setSelectedHeadlineIdx(Number(v))}
                      className="space-y-2"
                    >
                      {result.headlines.map((h, i) => (
                        <div key={i} className="flex items-center gap-3 rounded-lg border p-3">
                          <RadioGroupItem value={String(i)} id={`h-${i}`} />
                          <label htmlFor={`h-${i}`} className="flex-1 text-sm">{h}</label>
                          <CopyButton text={h} />
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                  <div>
                    <Label className="mb-2 block">Body copy</Label>
                    <RadioGroup
                      value={String(selectedBodyIdx)}
                      onValueChange={(v) => setSelectedBodyIdx(Number(v))}
                      className="space-y-2"
                    >
                      {result.bodies.map((b, i) => (
                        <div key={i} className="flex items-center gap-3 rounded-lg border p-3">
                          <RadioGroupItem value={String(i)} id={`b-${i}`} />
                          <label htmlFor={`b-${i}`} className="flex-1 text-sm">{b}</label>
                          <CopyButton text={b} />
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  {/* Ad preview */}
                  <div>
                    <Label className="mb-2 block">Ad Preview</Label>
                    <div className="rounded-2xl border bg-card p-4 shadow-sm">
                      <div className="flex items-start gap-3">
                        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-black text-xs font-bold text-white">AI</div>
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">Sponsored</div>
                          <div className="font-semibold">{selectedHeadline}</div>
                          <div className="text-sm text-muted-foreground">{selectedBody}</div>
                          <div className="pt-1 text-xs text-primary">{new URL(productUrl || result.utmUrl).hostname}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Section 3: Targeting */}
              <Card>
                <CardHeader>
                  <CardTitle>3. Targeting</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {hints.map((h, i) => (
                      <Badge key={i} variant="secondary" className="gap-1 py-1.5 pl-3 pr-1.5 text-sm">
                        {h}
                        <button
                          type="button"
                          onClick={() => setHints((arr) => arr.filter((_, j) => j !== i))}
                          className="rounded p-0.5 hover:bg-background"
                          aria-label="Remove"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  {hints.length > 10 && (
                    <p className="text-sm font-medium text-destructive">
                      OpenAI Ads allows max 10 context hints. Remove {hints.length - 10} before creating.
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {Math.min(hints.length, 10)}/10 hints added
                  </p>
                  <form
                    className="flex gap-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      const v = newHint.trim();
                      if (v) {
                        setHints((arr) => [...arr, v]);
                        setNewHint("");
                      }
                    }}
                  >
                    <Input
                      placeholder="Add a context hint"
                      value={newHint}
                      onChange={(e) => setNewHint(e.target.value)}
                    />
                    <Button type="submit" variant="outline">Add</Button>
                  </form>
                </CardContent>
              </Card>

              {/* Section 4: UTM URL */}
              <Card>
                <CardHeader>
                  <CardTitle>4. Your Tagged URL</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center gap-3">
                  <Input readOnly value={result.utmUrl} className="font-mono text-xs" />
                  <CopyButton text={result.utmUrl} />
                </CardContent>
              </Card>

              {/* Section 5: Step-by-step */}
              <Card>
                <CardHeader>
                  <CardTitle>5. Set this up in OpenAI Ads Manager</CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="space-y-3">
                    {steps.map((s, i) => (
                      <li key={s.key} className="flex items-start gap-3">
                        <Checkbox
                          checked={!!checklist[s.key]}
                          onCheckedChange={(v) =>
                            setChecklist((c) => ({ ...c, [s.key]: !!v }))
                          }
                          id={s.key}
                        />
                        <label
                          htmlFor={s.key}
                          className={`text-sm ${checklist[s.key] ? "text-muted-foreground line-through" : ""}`}
                        >
                          <span className="mr-1 font-semibold">{i + 1}.</span>
                          {s.label}
                        </label>
                      </li>
                    ))}
                  </ol>

                  <div className="mt-6 flex gap-3">
                    <Button variant="outline" onClick={saveDraft}>Save draft</Button>
                    <Button
                      onClick={() => {
                        if (hints.length > 10) {
                          toast.error(`OpenAI Ads allows max 10 context hints. Remove ${hints.length - 10} before creating.`);
                          return;
                        }
                        remote.mutate({
                          campaignName: result.campaignName,
                          lifetimeBudgetMicros: result.lifetimeBudgetMicros,
                          headline: selectedHeadline,
                          body: selectedBody,
                          destinationUrl: result.utmUrl,
                          contextHints: hints.length ? hints : result.contextHints,
                        });
                      }}
                      disabled={remote.isPending}
                    >
                      {remote.isPending ? "Creating..." : "Create Campaign via API"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>

      {/* History */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Campaign history</CardTitle>
        </CardHeader>
        <CardContent>
          {!history?.length ? (
            <p className="text-sm text-muted-foreground">No campaigns yet.</p>
          ) : (
            <ul className="divide-y">
              {history.map((b) => (
                <li key={b.id} className="flex items-center justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{b.campaign_name}</div>
                    <div className="truncate text-xs text-muted-foreground">{b.selected_headline}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {b.remote_campaign_id && (
                      <Badge variant="secondary" className="text-xs">Live</Badge>
                    )}
                    <CopyButton text={b.utm_url} label="URL" />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/30 px-3 py-2">
      <span className="text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <span className="font-mono text-xs">{value}</span>
        <CopyButton text={value} />
      </div>
    </div>
  );
}
