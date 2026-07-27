import { createFileRoute, Link } from "@tanstack/react-router";
import { MotionConfig } from "framer-motion";

import landingCss from "@/components/landing/landing.css?url";
import ScrollHero from "@/components/landing/ScrollHero";
import OutcomeStrip from "@/components/landing/OutcomeStrip";
import SystemIntro from "@/components/landing/SystemIntro";
import ServicesBento from "@/components/landing/ServicesBento";
import GrowthLoop from "@/components/landing/GrowthLoop";
import JourneyFlow from "@/components/landing/JourneyFlow";
import ConversionEvents from "@/components/landing/ConversionEvents";
import IntegrationsSection from "@/components/landing/IntegrationsSection";
import AnalyticsCommandCenter from "@/components/landing/AnalyticsCommandCenter";
import ComparisonSection from "@/components/landing/ComparisonSection";
import IdealClients from "@/components/landing/IdealClients";
import ProcessTimeline from "@/components/landing/ProcessTimeline";
import FinalCTA from "@/components/landing/FinalCTA";
import { BOOK_CALL_URL } from "@/components/landing/shared";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "OpenROAS — ChatGPT Ads Management & Measurement" },
      {
        name: "description",
        content:
          "OpenROAS plans, launches, tracks, and optimizes ChatGPT Ads — campaign management, landing pages, tracking, integrations, and analytics in one complete growth system.",
      },
      { property: "og:title", content: "OpenROAS — ChatGPT Ads Management & Measurement" },
      {
        property: "og:description",
        content:
          "OpenROAS plans, launches, tracks, and optimizes ChatGPT Ads — campaign management, landing pages, tracking, integrations, and analytics in one complete growth system.",
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

const anchors: [string, string][] = [
  ["Services", "#services"],
  ["Tracking & Integrations", "#tracking"],
  ["Analytics", "#analytics"],
  ["How It Works", "#how"],
];

function Index() {
  return (
    <div className="landing-root">
      <header className="lp-header">
        <a href="#top" className="lp-logo" aria-label="OpenROAS — back to top">
          <span aria-hidden className="lp-logo-mark">
            R
          </span>
          <span className="lp-logo-text">OpenROAS</span>
        </a>
        <nav className="lp-nav-links" aria-label="Main">
          {anchors.map(([label, href]) => (
            <a key={href} href={href} className="lp-nav-anchor">
              {label}
            </a>
          ))}
          <Link to="/auth" className="lp-nav-login">
            Client Login
          </Link>
          <a href={BOOK_CALL_URL} className="lp-cta-primary lp-nav-cta">
            Book a Strategy Call
          </a>
        </nav>
      </header>

      <main id="top" style={{ background: "#02080D" }}>
        <ScrollHero />
        <MotionConfig reducedMotion="user">
          <OutcomeStrip />
          <SystemIntro />
          <ServicesBento />
          <GrowthLoop />
          <JourneyFlow />
          <ConversionEvents />
          <IntegrationsSection />
          <AnalyticsCommandCenter />
          <ComparisonSection />
          <IdealClients />
          <ProcessTimeline />
          <FinalCTA />
        </MotionConfig>
      </main>

      <footer
        style={{
          borderTop: "1px solid rgba(255,255,255,0.08)",
          padding: "2.5rem clamp(1.5rem, 6vw, 7rem)",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1.25rem",
          fontFamily: "var(--font-inter)",
          fontSize: "0.85rem",
          color: "#7b8a96",
        }}
      >
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, color: "#fff" }}>
          OpenROAS
        </span>
        <nav
          aria-label="Footer"
          style={{ display: "flex", flexWrap: "wrap", gap: "1.25rem", alignItems: "center" }}
        >
          {anchors.map(([label, href]) => (
            <a key={href} href={href} style={{ color: "#D7DCE5" }}>
              {label}
            </a>
          ))}
          <Link to="/auth" style={{ color: "#D7DCE5" }}>
            Client Login
          </Link>
          <Link to="/privacy" style={{ color: "#D7DCE5" }}>
            Privacy
          </Link>
        </nav>
        <span>© {new Date().getFullYear()} OpenROAS</span>
      </footer>
    </div>
  );
}
