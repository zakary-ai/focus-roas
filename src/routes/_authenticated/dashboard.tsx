import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { AlertTriangle } from "lucide-react";
import { getDashboardMetrics, getSettings } from "@/lib/ads.functions";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

const fmt = (n: number) => `$${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

function Dashboard() {
  const navigate = useNavigate();
  const metricsFn = useServerFn(getDashboardMetrics);
  const settingsFn = useServerFn(getSettings);
  const [days, setDays] = useState(30);

  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: () => settingsFn() });
  const { data, isLoading } = useQuery({
    queryKey: ["metrics", days],
    queryFn: () => metricsFn({ data: { days } }),
  });

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
                    <TableHead>Campaign</TableHead>
                    <TableHead className="text-right">Spend</TableHead>
                    <TableHead className="text-right">Clicks</TableHead>
                    <TableHead className="text-right">CTR</TableHead>
                    <TableHead className="text-right">CPC</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                    <TableHead className="text-right">ROAS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.campaigns.map((c) => (
                    <TableRow key={c.id}>
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
    </AppShell>
  );
}