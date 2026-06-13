import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { BarChart3, Link2, Shield, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ROAS.ai — Track & Optimize Your OpenAI Ads ROAS" },
      {
        name: "description",
        content:
          "Connect your OpenAI Ads account, set up conversion tracking, and view ROAS in a single dashboard.",
      },
      { property: "og:title", content: "ROAS.ai — Track & Optimize Your OpenAI Ads ROAS" },
      {
        property: "og:description",
        content:
          "Connect your OpenAI Ads account, set up conversion tracking, and view ROAS in a single dashboard.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/30">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
            R
          </div>
          ROAS.ai
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost">
            <Link to="/auth">Sign in</Link>
          </Button>
          <Button asChild>
            <Link to="/auth">Get started</Link>
          </Button>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 pb-24 pt-16">
        <section className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <Sparkles className="h-3 w-3 text-primary" /> ROAS Manager for OpenAI Ads
          </span>
          <h1 className="mt-6 text-5xl font-bold tracking-tight md:text-6xl">
            Know your return on every ad dollar.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
            Connect your OpenAI Ads account, set up conversion tracking the right way, and watch
            spend, revenue, and ROAS in one clean dashboard.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Button asChild size="lg">
              <Link to="/auth">Start free</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/auth">Sign in</Link>
            </Button>
          </div>
        </section>
        <section className="mt-24 grid gap-6 md:grid-cols-3">
          {[
            {
              icon: BarChart3,
              title: "ROAS Dashboard",
              body: "Spend, revenue, clicks and ROAS across every campaign — in one view.",
            },
            {
              icon: Link2,
              title: "UTM Generator",
              body: "Tag every product URL correctly so OpenAI Ads attributes revenue back to the right campaign.",
            },
            {
              icon: Shield,
              title: "Conversion Setup",
              body: "A guided checklist to wire up the Purchase event with variable value tracking.",
            },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl border bg-card p-6 shadow-sm">
              <f.icon className="h-6 w-6 text-primary" />
              <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </section>
      </main>
      <footer className="border-t bg-background/80">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-muted-foreground sm:flex-row">
          <div className="font-semibold text-foreground">ROAS.ai</div>
          <p>© {new Date().getFullYear()} ROAS.ai</p>
          <Link to="/privacy" className="font-medium hover:text-foreground">
            Privacy
          </Link>
        </div>
      </footer>
    </div>
  );
}
