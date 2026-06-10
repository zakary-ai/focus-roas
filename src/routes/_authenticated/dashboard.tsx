import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { AlertTriangle, ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { getDashboardMetrics, getSettings } from "@/lib/ads.functions";
import { CampaignDetailSheet } from "@/components/campaign-detail-sheet";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

const fmt = (n: number) => `$${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

function Dashboard() {
  const navigate = useNavigate();
  const metricsFn = useServerFn(getDashboardMetrics);
  const settingsFn = useServerFn(getSettings);
  const [days, setDays] = useState(30);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);

  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: () => settingsFn() });
  const { data, isLoading } = useQuery({
    queryKey: ["metrics", days],
    queryFn: () => metricsFn({ data: { days } }),
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });

  type SortKey = "name" | "spend" | "clicks" | "ctr" | "cpc" | "revenue" | "roas";
  const [sortKey, setSortKey] = useState<SortKey>("spend");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const sortedCampaigns = useMemo(() => {
    const rows = data?.campaigns ? [...data.campaigns] : [];
    rows.sort((a, b) => {
      if (sortKey === "name") {
        return sortDir === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      }
      const av = (a[sortKey] as number) ?? 0;
      const bv = (b[sortKey] as number) ?? 0;
      return sortDir === "asc" ? av - bv : bv - av;
    });
    return rows;
  }, [data, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "name" ? "asc" : "desc");
    }
  }

  function SortHeader({ k, label, align = "right" }: { k: SortKey; label: string; align?: "left" | "right" }) {
    const active = sortKey === k;
    const Icon = !active ? ArrowUpDown : sortDir === "asc" ? ArrowUp : ArrowDown;
    return (
      <TableHead className={align === "right" ? "text-right" : ""}>
        <button
          type="button"
          onClick={() => toggleSort(k)}
          className={`inline-flex items-center gap-1 hover:text-foreground ${active ? "text-foreground" : "text-muted-foreground"} ${align === "right" ? "justify-end w-full" : ""}`}
        >
          {label}
          <Icon className="h-3.5 w-3.5" />
        </button>
      </TableHead>
    );
  }

  useEffect(() => {
    if (settings && !settings.onboardingCompleted && !settings.apiKeyConnected) {
      navigate({ to: "/onboarding" });
    }
  }, [settings, navigate]);

  return (
    <AppShell title="Dashboard">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Performance for the selected period</p>
        <Select value={String(days)} onValueChange={(v) => setDays(Number(v))}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="14">Last 14 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {data && data.connected && !data.conversionsConfigured && (
        <div className="mb-4 flex items-start gap-3 rounded-lg border border-warning/40 bg-warning/10 px-4 py-3 text-sm text-warning-foreground">
          <AlertTriangle className="mt-0.5 h-4 w-4 text-warning" />
          <div>
            Revenue data missing — make sure conversions are set up (Step 3 of onboarding).
          </div>
        </div>
      )}

      {data && !data.connected && (
        <div className="rounded-lg border bg-card p-6 text-sm text-muted-foreground">
          <p>
            {data.errorMessage ?? "Connect your OpenAI Ads account from onboarding to see metrics."}
          </p>
          <a className="mt-3 inline-block text-primary underline" href="/settings">Open settings</a>
        </div>
      )}

      {data && data.connected && (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            {[
              { label: "Total Spend", value: fmt(data.totals.spend) },
              { label: "Total Revenue", value: fmt(data.totals.revenue) },
              { label: "ROAS", value: data.totals.roas.toFixed(2) + "x" },
              { label: "Total Clicks", value: data.totals.clicks.toLocaleString() },
            ].map((k) => (
              <Card key={k.label}>
                <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">{k.label}</CardTitle></CardHeader>
                <CardContent><div className="text-2xl font-semibold">{k.value}</div></CardContent>
              </Card>
            ))}
          </div>

          <Card className="mt-6">
            <CardHeader><CardTitle className="text-base">Daily Spend vs Revenue</CardTitle></CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.series}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="date" fontSize={12} />
                    <YAxis yAxisId="left" fontSize={12} />
                    <YAxis yAxisId="right" orientation="right" fontSize={12} />
                    <Tooltip />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="spend" stroke="var(--chart-1)" name="Spend" strokeWidth={2} dot={false} />
                    <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="var(--chart-2)" name="Revenue" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader><CardTitle className="text-base">Campaign performance</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <SortHeader k="name" label="Campaign" align="left" />
                    <SortHeader k="spend" label="Spend" />
                    <SortHeader k="clicks" label="Clicks" />
                    <SortHeader k="ctr" label="CTR" />
                    <SortHeader k="cpc" label="CPC" />
                    <SortHeader k="revenue" label="Revenue" />
                    <SortHeader k="roas" label="ROAS" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedCampaigns.map((c) => (
                    <TableRow
                      key={c.id}
                      onClick={() => setSelectedCampaignId(c.id)}
                      className="cursor-pointer hover:bg-muted/50"
                    >
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell className="text-right">{fmt(c.spend)}</TableCell>
                      <TableCell className="text-right">{c.clicks.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{c.ctr.toFixed(2)}%</TableCell>
                      <TableCell className="text-right">{fmt(c.cpc)}</TableCell>
                      <TableCell className="text-right">{fmt(c.revenue)}</TableCell>
                      <TableCell className="text-right font-semibold">{c.roas.toFixed(2)}x</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
      {isLoading && <div className="mt-6 text-sm text-muted-foreground">Loading metrics…</div>}
      <CampaignDetailSheet
        campaignId={selectedCampaignId}
        days={days}
        onClose={() => setSelectedCampaignId(null)}
      />
    </AppShell>
  );
}