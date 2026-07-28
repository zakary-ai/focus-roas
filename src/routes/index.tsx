import { createFileRoute } from "@tanstack/react-router";
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
import SiteHeader from "@/components/landing/SiteHeader";
import SiteFooter from "@/components/landing/SiteFooter";
import { SITE_URL } from "@/components/landing/shared";

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
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/` },
    ],
    links: [
      { rel: "stylesheet", href: landingCss },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&family=Sora:wght@500;600&display=swap",
      },
      // First scroll-hero frame — preload so the beach opens instantly.
      { rel: "preload", as: "image", href: "/frames/frame_0001.jpg" },
      { rel: "icon", type: "image/png", href: "/favicon.png" },
      { rel: "apple-touch-icon", href: "/favicon.png" },
      { rel: "canonical", href: `${SITE_URL}/` },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="landing-root">
      <SiteHeader />
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
      <SiteFooter />
    </div>
  );
}
