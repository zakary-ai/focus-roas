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
  MUTED,
  PANEL,
  rise,
  Section,
  stagger,
  Title,
} from "./shared";

const traditional = [
  "Launch campaigns",
  "Monitor spend",
  "Report clicks",
  "Send monthly screenshots",
];

const openroas = [
  "Develop the campaign strategy",
  "Build and manage campaigns",
  "Create conversion-focused landing pages",
  "Implement tracking",
  "Connect business systems",
  "Measure leads and revenue",
  "Optimize the complete customer journey",
  "Provide clear next actions",
];

export default function ComparisonSection() {
  return (
    <Section labelledBy="compare-title">
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
      >
        <Eyebrow>The Difference</Eyebrow>
        <Title id="compare-title">Most agencies stop at the ad click.</Title>
        <Lede>OpenROAS is accountable for what happens after it.</Lede>

        <motion.div variants={rise}>
          <div className="lp-compare" style={{ marginTop: "clamp(2rem, 4vw, 3rem)" }}>
            <div
              style={{
                background: PANEL,
                border: `1px solid ${BORDER}`,
                borderRadius: 12,
                padding: "clamp(1.5rem, 3vw, 2.25rem)",
              }}
            >
              <h3
                style={{
                  fontFamily: fontDisplay,
                  fontWeight: 500,
                  fontSize: "1.15rem",
                  color: INK,
                  marginBottom: "1.25rem",
                }}
              >
                Traditional Ad Management
              </h3>
              <ul
                style={{
                  listStyle: "none",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.8rem",
                }}
              >
                {traditional.map((t) => (
                  <li
                    key={t}
                    style={{
                      fontFamily: fontBody,
                      fontWeight: 300,
                      fontSize: "0.95rem",
                      color: MUTED,
                      display: "flex",
                      gap: "0.7rem",
                      alignItems: "baseline",
                    }}
                  >
                    <span aria-hidden style={{ color: MUTED }}>
                      –
                    </span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>

            <div
              className="lp-panel glow"
              style={{
                border: `1px solid rgba(245,166,35,0.4)`,
                borderRadius: 12,
                padding: "clamp(1.5rem, 3vw, 2.25rem)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div className="lp-grid-bg" aria-hidden />
              <div style={{ position: "relative" }}>
                <h3
                  style={{
                    fontFamily: fontDisplay,
                    fontWeight: 600,
                    fontSize: "1.15rem",
                    color: "#fff",
                    marginBottom: "1.25rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.6rem",
                  }}
                >
                  <img
                    src="/logo.png"
                    alt=""
                    aria-hidden
                    style={{ width: "1.6rem", height: "1.6rem", objectFit: "contain" }}
                  />
                  The OpenROAS System
                </h3>
                <ul
                  style={{
                    listStyle: "none",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.8rem",
                  }}
                >
                  {openroas.map((t) => (
                    <li
                      key={t}
                      style={{
                        fontFamily: fontBody,
                        fontWeight: 300,
                        fontSize: "0.95rem",
                        color: INK,
                        display: "flex",
                        gap: "0.7rem",
                        alignItems: "baseline",
                      }}
                    >
                      <span aria-hidden style={{ color: CYAN }}>
                        ✓
                      </span>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </Section>
  );
}
