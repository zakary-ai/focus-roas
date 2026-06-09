import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { getCampaignDetails, updateCampaignStatus } from "@/lib/ads.functions";

const fmtMoney = (n: number) =>
  `$${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

export function CampaignDetailSheet({
  campaignId,
  days,
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
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Performance (last {days} days)</CardTitle>
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
                <div className="mt-4 h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.series}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="date" fontSize={11} />
                      <YAxis yAxisId="left" fontSize={11} />
                      <YAxis yAxisId="right" orientation="right" fontSize={11} />
                      <Tooltip />
                      <Legend />
                      <Line yAxisId="left" type="monotone" dataKey="spend" stroke="var(--chart-1)" name="Spend" strokeWidth={2} dot={false} />
                      <Line yAxisId="right" type="monotone" dataKey="clicks" stroke="var(--chart-2)" name="Clicks" strokeWidth={2} dot={false} />
                      <Line yAxisId="right" type="monotone" dataKey="impressions" stroke="var(--chart-3)" name="Impressions" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
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
                    <div key={g.id} className="space-y-2 rounded-md border p-3">
                      <div className="text-sm font-medium">{g.name}</div>
                      {g.contextHints.length > 0 && (
                        <div>
                          <div className="mb-1 text-xs text-muted-foreground">Context hints</div>
                          <div className="flex flex-wrap gap-1.5">
                            {g.contextHints.map((h, i) => (
                              <Badge key={i} variant="secondary" className="font-normal">{h}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {groupAds.map((a) => (
                        <div key={a.id} className="rounded bg-muted/40 p-2 text-sm">
                          <div className="font-medium">{a.headline || "(no headline)"}</div>
                          <div className="text-muted-foreground">{a.body || "(no body)"}</div>
                        </div>
                      ))}
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