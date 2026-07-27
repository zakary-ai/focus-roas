import { motion } from "framer-motion";
import {
  ACCENT,
  BOOK_CALL_URL,
  BORDER,
  CYAN,
  Eyebrow,
  fontBody,
  GhostCta,
  INK,
  MUTED,
  PANEL,
  PrimaryCta,
  rise,
  Section,
  stagger,
} from "./shared";

const miniFlow = ["Ad", "Page", "CRM / Store", "Tracking", "Revenue"];

export default function FinalCTA() {
  return (
    <Section labelledBy="final-title" style={{ overflow: "hidden" }}>
      <div className="lp-grid-bg" aria-hidden />
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at center, rgba(245,166,35,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        style={{
          position: "relative",
          maxWidth: 820,
          margin: "0 auto",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Eyebrow>Ready to Launch ChatGPT Ads?</Eyebrow>
        <motion.h2
          id="final-title"
          variants={rise}
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 600,
            fontSize: "clamp(2.2rem, 5vw, 4.5rem)",
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            marginBottom: "1.5rem",
            color: "#fff",
          }}
        >
          Build a channel you can actually measure.
        </motion.h2>
        <motion.p
          variants={rise}
          style={{
            fontFamily: fontBody,
            fontWeight: 300,
            fontSize: "1.05rem",
            lineHeight: 1.6,
            color: INK,
            maxWidth: 560,
            marginBottom: "2rem",
          }}
        >
          OpenROAS gives you the strategy, campaign management, tracking, integrations, analytics,
          and ongoing optimization required to turn ChatGPT Ads into a reliable growth system.
        </motion.p>

        <motion.div
          variants={rise}
          aria-hidden
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "center",
            gap: "0.5rem",
            marginBottom: "2.25rem",
          }}
        >
          {miniFlow.map((n, i) => (
            <span key={n} style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
              <span
                style={{
                  fontFamily: fontBody,
                  fontSize: "0.72rem",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: i === miniFlow.length - 1 ? ACCENT : INK,
                  border: `1px solid ${i === miniFlow.length - 1 ? "rgba(245,166,35,0.45)" : BORDER}`,
                  background: PANEL,
                  borderRadius: 999,
                  padding: "0.35rem 0.8rem",
                }}
              >
                {n}
              </span>
              {i < miniFlow.length - 1 && (
                <span style={{ color: CYAN, fontSize: "0.75rem" }}>→</span>
              )}
            </span>
          ))}
        </motion.div>

        <motion.div
          variants={rise}
          style={{ display: "flex", gap: "0.9rem", flexWrap: "wrap", justifyContent: "center" }}
        >
          <PrimaryCta href={BOOK_CALL_URL}>Book a Strategy Call</PrimaryCta>
          <GhostCta href="#system">See the OpenROAS System</GhostCta>
        </motion.div>

        <motion.p
          variants={rise}
          style={{
            fontFamily: fontBody,
            fontSize: "0.8rem",
            color: MUTED,
            marginTop: "1.75rem",
          }}
        >
          No disconnected tools. No unclear reporting. No guessing what happened after the click.
        </motion.p>
      </motion.div>
    </Section>
  );
}
