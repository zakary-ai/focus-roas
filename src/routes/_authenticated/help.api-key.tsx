import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ArrowLeft, KeyRound, ShieldCheck, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/_authenticated/help/api-key")({
  component: ApiKeyHelp,
});

const STEPS = [
  {
    title: "Open OpenAI Ads Manager",
    body: (
      <>
        Go to{" "}
        <a
          href="https://ads.openai.com"
          target="_blank"
          rel="noreferrer"
          className="font-medium text-primary hover:underline"
        >
          ads.openai.com <ExternalLink className="inline h-3 w-3" />
        </a>{" "}
        and sign in to the account you advertise from.
      </>
    ),
  },
  {
    title: "Navigate to Settings → General",
    body: <>In the left sidebar, click <strong>Settings</strong>, then choose <strong>General</strong>.</>,
  },
  {
    title: "Scroll to the API Keys section",
    body: <>Below <strong>Account Info</strong> you'll see a panel titled <strong>API Keys</strong>.</>,
  },
  {
    title: "Create a new key",
    body: <>Click <strong>+ Create New Key</strong>, name it something like <code>ROAS.ai</code>, and copy the value (it starts with <code>sk-svc-</code>).</>,
  },
  {
    title: "Paste it into ROAS.ai",
    body: <>Return to ROAS.ai and paste the key into the <strong>API Key</strong> field. We'll verify it instantly.</>,
  },
];

function ApiKeyHelp() {
  return (
    <div className="min-h-screen bg-accent/30 px-4 py-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <Button asChild variant="ghost" size="sm">
          <Link to="/onboarding">
            <ArrowLeft className="mr-1 h-4 w-4" /> Back
          </Link>
        </Button>

        <div className="rounded-2xl border bg-card p-8 shadow-sm">
          <div className="mb-6 flex items-start gap-4">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
              <KeyRound className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">Find your OpenAI Ads API key</h1>
              <p className="text-sm text-muted-foreground">A 1-minute walkthrough — no developer skills required.</p>
            </div>
          </div>

          <ol className="space-y-4">
            {STEPS.map((s, i) => (
              <li key={i} className="flex gap-4 rounded-xl border bg-background p-4">
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                  {i + 1}
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-foreground">{s.title}</p>
                  <p className="text-sm text-muted-foreground">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>

          {/* Mock illustration of the Ads Manager settings screen */}
          <div className="mt-8">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              What it looks like
            </p>
            <div className="overflow-hidden rounded-xl border bg-background shadow-sm">
              <div className="flex">
                <aside className="hidden w-44 shrink-0 border-r bg-muted/30 p-3 text-xs sm:block">
                  <p className="mb-3 font-semibold">Ads Manager</p>
                  <p className="py-1 text-muted-foreground">Campaigns</p>
                  <p className="py-1 text-muted-foreground">Tools</p>
                  <p className="py-1 text-muted-foreground">Billing</p>
                  <p className="py-1 font-medium text-foreground">Settings</p>
                  <p className="ml-3 py-1 text-muted-foreground">General</p>
                </aside>
                <div className="flex-1 p-4">
                  <p className="mb-3 text-sm font-semibold">Settings</p>
                  <div className="rounded-lg border p-3">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-sm font-medium">API Keys</p>
                      <span className="rounded-full bg-foreground px-3 py-1 text-xs text-background">
                        + Create New Key
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 border-t pt-2 text-xs text-muted-foreground">
                      <span>Name</span><span>Key</span>
                      <span className="text-foreground">roas-ai</span>
                      <span className="font-mono text-foreground">sk-svc…NIAA</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-start gap-3 rounded-lg border border-success/30 bg-success/10 p-4 text-sm text-success">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              Your key is encrypted at rest and only ever used from secure server functions — it never touches the
              browser after you paste it.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}