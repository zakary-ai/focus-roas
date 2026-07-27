import { createFileRoute, Link } from "@tanstack/react-router";

import landingCss from "@/components/landing/landing.css?url";
import ScrollHero from "@/components/landing/ScrollHero";
import HowItWorks from "@/components/landing/HowItWorks";
import FeaturesSection from "@/components/landing/FeaturesSection";
import SpecsSection from "@/components/landing/SpecsSection";
import AgencySection from "@/components/landing/AgencySection";
import ClosingCTA from "@/components/landing/ClosingCTA";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "OpenROAS — Track OpenAI Ads Revenue in Shopify" },
      {
        name: "description",
        content:
          "OpenROAS attributes Shopify orders back to the OpenAI ad click, ad, ad group, and campaign that drove them — clear ROAS for merchants and agencies.",
      },
      { property: "og:title", content: "OpenROAS — Track OpenAI Ads Revenue in Shopify" },
      {
        property: "og:description",
        content:
          "OpenROAS attributes Shopify orders back to the OpenAI ad click, ad, ad group, and campaign that drove them — clear ROAS for merchants and agencies.",
      },
    ],
    links: [
      { rel: "stylesheet", href: landingCss },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&family=Sora:wght@500;600&display=swap",
      },
      // First scroll-hero frame — preload so the beach opens instantly.
      { rel: "preload", as: "image", href: "/frames/frame_0001.jpg" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="landing-root">
      <header
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "1.4rem clamp(1.5rem, 6vw, 7rem)",
        }}
      >
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
            fontFamily: "var(--font-display)",
            fontWeight: 600,
            fontSize: "1.05rem",
            color: "#fff",
          }}
        >
          <span
            style={{
              width: "1.7rem",
              height: "1.7rem",
              borderRadius: "0.45rem",
              background: "#F5A623",
              color: "#02080D",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.95rem",
            }}
          >
            R
          </span>
          OpenROAS
        </span>
        <nav style={{ display: "flex", alignItems: "center", gap: "1.6rem" }}>
          <Link
            to="/auth"
            style={{
              fontFamily: "var(--font-inter)",
              fontWeight: 500,
              fontSize: "0.7rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#fff",
            }}
          >
            Sign in
          </Link>
          <Link
            to="/auth"
            style={{
              fontFamily: "var(--font-inter)",
              fontWeight: 500,
              fontSize: "0.7rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              background: "#F5A623",
              color: "#02080D",
              padding: "0.65rem 1.4rem",
              borderRadius: 2,
            }}
          >
            Get started
          </Link>
        </nav>
      </header>

      <main style={{ background: "#02080D" }}>
        <ScrollHero />
        <HowItWorks />
        <FeaturesSection />
        <SpecsSection />
        <AgencySection />
        <ClosingCTA />
      </main>

      <footer
        style={{
          borderTop: "1px solid rgba(255,255,255,0.08)",
          padding: "2rem clamp(1.5rem, 6vw, 7rem)",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
          fontFamily: "var(--font-inter)",
          fontSize: "0.85rem",
          color: "#7b8a96",
        }}
      >
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, color: "#fff" }}>
          OpenROAS
        </span>
        <span>© {new Date().getFullYear()} OpenROAS</span>
        <Link to="/privacy" style={{ color: "#D7DCE5" }}>
          Privacy
        </Link>
      </footer>
    </div>
  );
}
