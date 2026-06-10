import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function ShopifyWebhookCard() {
  const [userId, setUserId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const webhookUrl = userId && supabaseUrl
    ? `${supabaseUrl.replace(/\/$/, "")}/functions/v1/shopify-webhook?user_id=${userId}`
    : "";

  async function copy() {
    if (!webhookUrl) return;
    try {
      await navigator.clipboard.writeText(webhookUrl);
      setCopied(true);
      toast.success("Webhook URL copied");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Could not copy — select and copy manually");
    }
  }

  return (
    <div className="space-y-3">
      <div>
        <Label>Your unique webhook URL</Label>
        <div className="flex gap-2">
          <Input readOnly value={webhookUrl} className="font-mono text-xs" placeholder="Loading..." />
          <Button type="button" variant="outline" size="icon" onClick={copy} disabled={!webhookUrl}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      <div className="rounded-lg border bg-muted/30 p-3 text-sm">
        <p className="mb-2 font-medium">How to connect Shopify</p>
        <ol className="list-decimal space-y-1 pl-5 text-muted-foreground">
          <li>Open Shopify Admin → <strong>Settings</strong> → <strong>Notifications</strong></li>
          <li>Scroll to <strong>Webhooks</strong> → click <strong>Create webhook</strong></li>
          <li>Event: <strong>Order payment</strong></li>
          <li>Format: <strong>JSON</strong></li>
          <li>Paste the URL above into <strong>URL</strong></li>
          <li>Click <strong>Save</strong></li>
        </ol>
      </div>
    </div>
  );
}