import { motion } from "framer-motion";
import {
  ACCENT,
  BORDER,
  CYAN,
  Eyebrow,
  fontBody,
  fontDisplay,
  INK,
  Lede,
  PANEL,
  rise,
  Section,
  stagger,
  Title,
} from "./shared";

const stages = [
  {
    label: "ChatGPT Ads",
    icon: "M13 2L3 14h7l-1 8 10-12h-7z",
    copy: "Campaigns and tagged links built so every click is identifiable from the start.",
    color: ACCENT,
  },
  {
    label: "Landing Page",
    icon: "M3 5h18v14H3zM3 9h18",
    copy: "A conversion-focused page that carries the ad’s promise through to one clear action.",
    color: CYAN,
  },
  {
    label: "CRM, Store, or Booking",
    icon: "M9 11a3 3 0 100-6 3 3 0 000 6zM2 20a7 7 0 0114 0M19 8v6M16 11h6",
    copy: "Leads, orders, and appointments land in the systems your business already runs on.",
    color: CYAN,
  },
  {
    label: "OpenROAS Tracking",
    icon: "M5 19l5-5 4 4 6-8M21 8V4h-4",
    copy: "Every event is stitched back to the exact ad, campaign, and click that caused it.",
    color: ACCENT,
  },
  {
    label: "Analytics & Optimization",
    icon: "M4 20V10M10 20V4M16 20v-7M22 20h-20",
    copy: "One clear view of results drives the next budget, creative, and page decision.",
    color: CYAN,
  },
];

export default function JourneyFlow() {
  return (
    <Section id="tracking" labelledBy="journey-title">
      <div className="lp-grid-bg" aria-hidden />
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        style={{ position: "relative" }}
      >
        <Eyebrow>Tracking &amp; Integrations</Eyebrow>
        <Title id="journey-title">Your entire customer journey, connected.</Title>
        <Lede>
          This is the system OpenROAS builds around your campaigns — data flowing from the first
          impression to the final conversion.
        </Lede>

        <motion.div variants={rise}>
          <div className="lp-journey" style={{ marginTop: "clamp(2.5rem, 5vw, 4rem)" }}>
            {stages.map((s) => (
              <div className="lp-journey-node" key={s.label}>
                <span className="lp-journey-link" aria-hidden>
                  <span className="lp-journey-pulse" />
                </span>
                <div
                  style={{
                    width: 68,
                    height: 68,
                    borderRadius: 14,
                    border: `1px solid ${BORDER}`,
                    background: PANEL,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: `0 0 30px -10px ${s.color}55`,
                    flex: "0 0 auto",
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  <svg
                    width="26"
                    height="26"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={s.color}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <path d={s.icon} />
                  </svg>
                </div>
                <div style={{ marginTop: "0.9rem" }}>
                  <h3
                    style={{
                      fontFamily: fontDisplay,
                      fontWeight: 500,
                      fontSize: "0.98rem",
                      color: "#fff",
                      marginBottom: "0.4rem",
                    }}
                  >
                    {s.label}
                  </h3>
                  <p
                    style={{
                      fontFamily: fontBody,
                      fontWeight: 300,
                      fontSize: "0.84rem",
                      lineHeight: 1.55,
                      color: INK,
                      maxWidth: 240,
                    }}
                  >
                    {s.copy}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </Section>
  );
}
