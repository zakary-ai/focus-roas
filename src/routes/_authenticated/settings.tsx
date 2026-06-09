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

  const { data: settings, refetch } = useQuery({ queryKey: ["settings"], queryFn: () => settingsFn() });
  const [newKey, setNewKey] = useState("");
  const [newAcct, setNewAcct] = useState("");
  const [storeUrl, setStoreUrl] = useState("");

  useEffect(() => {
    if (settings?.storeUrl) setStoreUrl(settings.storeUrl);
    if (settings?.adAccountId) setNewAcct(settings.adAccountId);
  }, [settings]);

  async function updateKey() {
    const key = newKey.trim();
    const acctId = newAcct.trim();
    if (!acctId) return toast.error("Ad account ID is required");
    if (!/^adacct_[A-Za-z0-9]{6,}$/.test(acctId))
      return toast.error("Enter a valid ad account ID (adacct_xxxxxxxxx)");
    try {
      const result = await verifyFn({ data: { apiKey: key || undefined, adAccountId: acctId } });
      if (!result.ok) {
        toast.error(result.errorMessage);
        return;
      }
      setNewKey("");
      await refetch();
      toast.success("Settings updated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not update");
    }
  }

  async function saveStore() {
    await storeFn({ data: { storeUrl } });
    toast.success("Store URL saved");
    await refetch();
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
              <div className="mt-2">
                <Label htmlFor="newacct">Ad Account ID</Label>
                <Input
                  id="newacct"
                  value={newAcct}
                  onChange={(e) => setNewAcct(e.target.value)}
                  placeholder="adacct_xxxxxxxxx"
                  className="font-mono"
                />
              </div>
              <Button
                className="mt-3"
                onClick={updateKey}
                disabled={!newKey.trim() && newAcct.trim() === (settings?.adAccountId ?? "")}
              >
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