import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getSettings, verifyApiKey, updateStoreUrl, deleteAccountData } from "@/lib/ads.functions";
import { getShopifyStatus, startShopifyOAuth, disconnectShopify } from "@/lib/shopify.functions";

export const Route = createFileRoute("/_authenticated/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const settingsFn = useServerFn(getSettings);
  const verifyFn = useServerFn(verifyApiKey);
  const storeFn = useServerFn(updateStoreUrl);
  const deleteFn = useServerFn(deleteAccountData);
  const shopifyStatusFn = useServerFn(getShopifyStatus);
  const shopifyConnectFn = useServerFn(startShopifyOAuth);
  const shopifyDisconnectFn = useServerFn(disconnectShopify);

  const { data: settings, refetch } = useQuery({ queryKey: ["settings"], queryFn: () => settingsFn() });
  const { data: shopify, refetch: refetchShopify } = useQuery({
    queryKey: ["shopify-status"],
    queryFn: () => shopifyStatusFn(),
  });
  const [newKey, setNewKey] = useState("");
  const [storeUrl, setStoreUrl] = useState("");
  const [shopDomain, setShopDomain] = useState("");
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    if (settings?.storeUrl) setStoreUrl(settings.storeUrl);
  }, [settings]);

  async function updateKey() {
    const key = newKey.trim();
    if (!key) return toast.error("Enter an API key");
    try {
      const result = await verifyFn({ data: { apiKey: key } });
      if (!result.ok) {
        toast.error(result.errorMessage);
        return;
      }
      setNewKey("");
      await refetch();
      toast.success(`Connected to ${result.accountName}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not update");
    }
  }

  async function saveStore() {
    await storeFn({ data: { storeUrl } });
    toast.success("Store URL saved");
    await refetch();
  }

  async function connectShop() {
    if (!shopDomain.trim()) return toast.error("Enter your store domain");
    setConnecting(true);
    try {
      const res = await shopifyConnectFn({ data: { domain: shopDomain.trim() } });
      if (!res.ok) {
        toast.error(res.errorMessage);
        return;
      }
      window.location.href = res.authUrl;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not connect");
      setConnecting(false);
    }
  }

  async function disconnectShop() {
    await shopifyDisconnectFn();
    toast.success("Shopify disconnected");
    await refetchShopify();
  }

  async function deleteEverything() {
    await deleteFn();
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    toast.success("Account data deleted");
    navigate({ to: "/", replace: true });
  }

  return (
    <AppShell title="Settings">
      <div className="grid gap-6 md:max-w-2xl">
        <Card>
          <CardHeader><CardTitle className="text-base">OpenAI Ads API key</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {settings?.accountName && (
              <div>
                <Label>Connected account</Label>
                <Input readOnly value={settings.accountName} />
              </div>
            )}
            <div>
              <Label>Current key</Label>
              <Input readOnly value={settings?.apiKeyMasked ?? "Not connected"} className="font-mono" />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="newkey">Replace with new key</Label>
                <Link to="/help/api-key" target="_blank" className="text-xs font-medium text-primary hover:underline">
                  Where do I find this?
                </Link>
              </div>
              <div className="flex gap-2">
                <Input id="newkey" type="password" value={newKey} onChange={(e) => setNewKey(e.target.value)} placeholder="sk-ads-..." />
              </div>
              <Button className="mt-3" onClick={updateKey} disabled={!newKey.trim()}>
                Update
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Store URL</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label htmlFor="store">URL</Label>
              <Input id="store" value={storeUrl} onChange={(e) => setStoreUrl(e.target.value)} />
            </div>
            <Button onClick={saveStore}>Save</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Shopify connection</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {shopify?.connected ? (
              <>
                <div>
                  <Label>Connected store</Label>
                  <Input readOnly value={shopify.domain ?? ""} />
                </div>
                <p className="text-sm text-muted-foreground">
                  Orders are syncing automatically. Revenue and ROAS will populate on your dashboard.
                </p>
                <Button variant="outline" onClick={disconnectShop}>Disconnect</Button>
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  Click connect and approve the permissions in your Shopify admin. We'll handle the rest.
                </p>
                <div>
                  <Label htmlFor="shop-domain">Store domain</Label>
                  <Input
                    id="shop-domain"
                    placeholder="mystore.myshopify.com"
                    value={shopDomain}
                    onChange={(e) => setShopDomain(e.target.value)}
                  />
                </div>
                <Button onClick={connectShop} disabled={connecting}>
                  {connecting ? "Connecting..." : "Connect Shopify"}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-destructive/40">
          <CardHeader><CardTitle className="text-base text-destructive">Danger zone</CardTitle></CardHeader>
          <CardContent>
            <p className="mb-3 text-sm text-muted-foreground">Permanently delete your account data, including stored API key and UTM history.</p>
            <AlertDialog>
              <AlertDialogTrigger asChild><Button variant="destructive">Delete account and all data</Button></AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>This action cannot be undone. You'll be signed out immediately.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={deleteEverything}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}