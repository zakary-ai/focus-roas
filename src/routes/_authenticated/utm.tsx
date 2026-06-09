import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { getSettings, listCampaigns, listUtmLinks, saveUtmLink } from "@/lib/ads.functions";

export const Route = createFileRoute("/_authenticated/utm")({
  component: UtmGenerator,
});

function slugify(s: string) {
  return s.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function UtmGenerator() {
  const qc = useQueryClient();
  const settingsFn = useServerFn(getSettings);
  const campaignsFn = useServerFn(listCampaigns);
  const linksFn = useServerFn(listUtmLinks);
  const saveFn = useServerFn(saveUtmLink);

  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: () => settingsFn() });
  const { data: campaignsRes } = useQuery({ queryKey: ["campaigns"], queryFn: () => campaignsFn() });
  const { data: links } = useQuery({ queryKey: ["utm-links"], queryFn: () => linksFn() });

  const [campaignId, setCampaignId] = useState<string>("");
  const [campaignName, setCampaignName] = useState("");
  const [productUrl, setProductUrl] = useState("");

  useEffect(() => {
    if (settings?.storeUrl && !productUrl) setProductUrl(settings.storeUrl);
  }, [settings, productUrl]);

  useEffect(() => {
    if (campaignsRes?.connected && campaignsRes.campaigns.length && !campaignId) {
      setCampaignId(campaignsRes.campaigns[0].id);
      setCampaignName(campaignsRes.campaigns[0].name);
    }
  }, [campaignsRes, campaignId]);

  const fullUrl = useMemo(() => {
    if (!productUrl || !campaignName) return "";
    try {
      const u = new URL(productUrl);
      u.searchParams.set("utm_source", "chatgpt");
      u.searchParams.set("utm_medium", "cpc");
      u.searchParams.set("utm_campaign", slugify(campaignName));
      return u.toString();
    } catch {
      return "";
    }
  }, [productUrl, campaignName]);

  async function copy() {
    if (!fullUrl) return;
    await navigator.clipboard.writeText(fullUrl);
    toast.success("Copied!");
    try {
      await saveFn({ data: { campaignId, campaignName, baseUrl: productUrl, fullUrl } });
      qc.invalidateQueries({ queryKey: ["utm-links"] });
    } catch { /* ignore */ }
  }

  return (
    <AppShell title="UTM Generator">
      <Card>
        <CardHeader><CardTitle className="text-base">Build a tagged link</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Campaign</Label>
            <Select
              value={campaignId}
              onValueChange={(v) => {
                setCampaignId(v);
                const c = campaignsRes?.campaigns.find((x) => x.id === v);
                if (c) setCampaignName(c.name);
              }}
            >
              <SelectTrigger><SelectValue placeholder={campaignsRes?.connected ? "Select a campaign" : "Connect your API key first"} /></SelectTrigger>
              <SelectContent>
                {campaignsRes?.campaigns.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="purl">Product URL</Label>
            <Input id="purl" value={productUrl} onChange={(e) => setProductUrl(e.target.value)} placeholder="https://mystore.com/product" />
          </div>
          <div>
            <Label htmlFor="cname">UTM Campaign Name</Label>
            <Input id="cname" value={campaignName} onChange={(e) => setCampaignName(e.target.value)} />
          </div>
          <div>
            <Label>Generated URL</Label>
            <div className="flex gap-2">
              <Input readOnly value={fullUrl} className="font-mono text-xs" />
              <Button onClick={copy} disabled={!fullUrl}><Copy className="mr-2 h-4 w-4" /> Copy</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader><CardTitle className="text-base">Recent links</CardTitle></CardHeader>
        <CardContent>
          {!links?.length ? (
            <p className="text-sm text-muted-foreground">No links yet — copy one above to save it here.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead className="text-right">Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {links.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="font-medium">{l.campaign_name}</TableCell>
                    <TableCell className="max-w-xl truncate font-mono text-xs">{l.full_url}</TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">{new Date(l.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}