import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { getCampaignDetails, updateCampaignStatus } from "@/lib/ads.functions";

const fmtMoney = (n: number) =>
  `$${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

export function CampaignDetailSheet({
  campaignId,
  days: initialDays,
  shopifyConnected,
  onClose,
}: {
  campaignId: string | null;
  days: number;
  shopifyConnected?: boolean;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const detailsFn = useServerFn(getCampaignDetails);
  const statusFn = useServerFn(updateCampaignStatus);
  const [days, setDays] = useState(initialDays);

  useEffect(() => {
    setDays(initialDays);
  }, [initialDays, campaignId]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["campaign-details", campaignId, days],
    queryFn: () => detailsFn({ data: { id: campaignId!, days } }),
    enabled: !!campaignId,
  });

  const statusMut = useMutation({
    mutationFn: (status: "active" | "paused") =>
      statusFn({ data: { id: campaignId!, status } }),
    onSuccess: () => {
      toast.success("Campaign status updated");
      qc.invalidateQueries({ queryKey: ["campaign-details", campaignId] });
      qc.invalidateQueries({ queryKey: ["metrics"] });
    },
    onError: (e: unknown) =>
      toast.error(e instanceof Error ? e.message : "Failed to update status"),
  });

  const handleCopyToBuilder = () => {
    if (!data) return;
    const firstAd = data.ads[0];
    const allHints = Array.from(
      new Set(data.adGroups.flatMap((g) => g.contextHints)),
    );
    try {
      sessionStorage.setItem(
        "campaignBuilderPrefill",
        JSON.stringify({
          campaignName: `${data.campaign.name} (copy)`,
          headline: firstAd?.headline ?? "",
          body: firstAd?.body ?? "",
          destinationUrl: firstAd?.destinationUrl ?? "",
          contextHints: allHints,
          monthlyBudget: data.campaign.lifetimeBudget ?? data.campaign.dailyBudget
            ? Math.round(((data.campaign.lifetimeBudget ?? 0) || ((data.campaign.dailyBudget ?? 0) * 30)))
            : null,
        }),
      );
    } catch {
      // ignore quota errors
    }
    navigate({ to: "/utm" });
  };

  return (
    <Sheet open={!!campaignId} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="pr-8">
            {data?.campaign.name ?? "Campaign details"}
          </SheetTitle>
        </SheetHeader>

        {isLoading && (
          <div className="mt-6 text-sm text-muted-foreground">Loading campaign…</div>
        )}
        {error && (
          <div className="mt-6 rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm">
            {error instanceof Error ? error.message : "Could not load campaign"}
          </div>
        )}

        {data && (
          <div className="mt-6 space-y-6">
            {/* Campaign Info */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Campaign info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={data.campaign.status === "active" ? "default" : "secondary"}
                    >
                      {data.campaign.status}
                    </Badge>
                    <Switch
                      checked={data.campaign.status === "active"}
                      disabled={statusMut.isPending}
                      onCheckedChange={(checked) =>
                        statusMut.mutate(checked ? "active" : "paused")
                      }
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Daily budget</span>
                  <span className="font-medium">
                    {data.campaign.dailyBudget != null
                      ? fmtMoney(data.campaign.dailyBudget)
                      : "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Lifetime budget</span>
                  <span className="font-medium">
                    {data.campaign.lifetimeBudget != null
                      ? fmtMoney(data.campaign.lifetimeBudget)
                      : "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Start date</span>
                  <span className="font-medium">
                    {data.campaign.startDate
                      ? new Date(data.campaign.startDate).toLocaleDateString()
                      : "—"}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Performance */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base">Performance</CardTitle>
                <Select value={String(days)} onValueChange={(v) => setDays(Number(v))}>
                  <SelectTrigger className="h-8 w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Last 7 days</SelectItem>
                    <SelectItem value="14">Last 14 days</SelectItem>
                    <SelectItem value="30">Last 30 days</SelectItem>
                    <SelectItem value="90">Last 90 days</SelectItem>
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <Kpi label="Spend" value={fmtMoney(data.totals.spend)} />
                  <Kpi label="Clicks" value={data.totals.clicks.toLocaleString()} />
                  <Kpi label="Impressions" value={data.totals.impressions.toLocaleString()} />
                  <Kpi label="CTR" value={`${data.totals.ctr.toFixed(2)}%`} />
                  <Kpi label="CPC" value={fmtMoney(data.totals.cpc)} />
                  {shopifyConnected && <Kpi label="ROAS" value="—" />}
                </div>
                <div className="mt-4 space-y-3">
                  <MiniMetricChart
                    series={data.series}
                    dataKey="spend"
                    label="Spend"
                    color="var(--chart-1)"
                    formatValue={(v) => fmtMoney(v)}
                  />
                  <MiniMetricChart
                    series={data.series}
                    dataKey="clicks"
                    label="Clicks"
                    color="var(--chart-2)"
                    formatValue={(v) => v.toLocaleString()}
                  />
                  <MiniMetricChart
                    series={data.series}
                    dataKey="impressions"
                    label="Impressions"
                    color="var(--chart-3)"
                    formatValue={(v) => v.toLocaleString()}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Ad Copy */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base">Ad copy</CardTitle>
                <Button size="sm" variant="outline" onClick={handleCopyToBuilder}>
                  <Copy className="mr-1 h-3.5 w-3.5" /> Copy to Builder
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.adGroups.length === 0 && (
                  <p className="text-sm text-muted-foreground">No ad groups found.</p>
                )}
                {data.adGroups.map((g) => {
                  const groupAds = data.ads.filter((a) => a.adGroupId === g.id);
                  return (
                    <div key={g.id} className="space-y-4 rounded-md border p-4">
                      <div className="text-sm font-semibold">{g.name}</div>

                      <div>
                        <div className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Context hints
                        </div>
                        {g.contextHints.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {g.contextHints.map((h, i) => (
                              <Badge key={i} variant="secondary" className="font-normal">
                                {h}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">None</p>
                        )}
                      </div>

                      <div className="space-y-3">
                        <div className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Ads
                        </div>
                        {groupAds.length === 0 && (
                          <p className="text-sm text-muted-foreground">No ads in this group.</p>
                        )}
                        {groupAds.map((a) => (
                          <div key={a.id} className="space-y-2 rounded-md border bg-muted/30 p-3 text-sm">
                            <div className="text-xs text-muted-foreground">{a.name}</div>
                            <AdField label="Headline" value={a.headline} />
                            <AdField label="Body" value={a.body} />
                            {a.destinationUrl && (
                              <AdField
                                label="Destination"
                                value={a.destinationUrl}
                                mono
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-lg font-semibold">{value}</div>
    </div>
  );
}

function AdField({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div
        className={
          (mono ? "font-mono text-xs break-all " : "") +
          (value ? "text-foreground" : "italic text-muted-foreground")
        }
      >
        {value || "—"}
      </div>
    </div>
  );
}

function MiniMetricChart({
  series,
  dataKey,
  label,
  color,
  formatValue,
}: {
  series: Array<{ date: string; spend: number; clicks: number; impressions: number }>;
  dataKey: "spend" | "clicks" | "impressions";
  label: string;
  color: string;
  formatValue: (v: number) => string;
}) {
  const total = series.reduce((sum, s) => sum + (s[dataKey] as number), 0);
  const gradId = `grad-${dataKey}`;
  return (
    <div className="rounded-md border p-3">
      <div className="mb-1 flex items-baseline justify-between">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ background: color }} />
          <span className="text-xs font-medium text-muted-foreground">{label}</span>
        </div>
        <span className="text-sm font-semibold">{formatValue(total)}</span>
      </div>
      <div className="h-20">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={series} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.35} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
            <XAxis dataKey="date" fontSize={10} tickLine={false} axisLine={false} minTickGap={32} />
            <YAxis hide domain={[0, "auto"]} />
            <Tooltip
              formatter={(v: number) => [formatValue(v), label]}
              labelClassName="text-xs"
              contentStyle={{ fontSize: 12, borderRadius: 6 }}
            />
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={2}
              fill={`url(#${gradId})`}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}