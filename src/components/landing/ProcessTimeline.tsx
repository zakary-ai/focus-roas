import { motion } from "framer-motion";
import {
  ACCENT_BORDER,
  CYAN,
  Eyebrow,
  fontBody,
  fontDisplay,
  INK,
  Lede,
  rise,
  Section,
  stagger,
  Title,
} from "./shared";

const steps: [string, string][] = [
  [
    "Discovery and Audit",
    "We map your offer, funnel, existing tracking, and business systems — and find what’s measurable today.",
  ],
  [
    "Campaign Blueprint",
    "Strategy, campaign structure, budgets, messaging angles, and the measurement plan, agreed before build.",
  ],
  [
    "System Buildout",
    "Campaigns, ad copy, landing pages, tracking, and connectors are built as one system.",
  ],
  [
    "Validation",
    "Every link, form, event, and integration is tested end to end before a dollar of spend goes live.",
  ],
  [
    "Launch and Management",
    "Campaigns go live with daily oversight of spend, delivery, and conversion flow.",
  ],
  [
    "Optimization and Reporting",
    "Results are reviewed against leads and revenue; budgets, creative, and pages follow what works.",
  ],
];

export default function ProcessTimeline() {
  return (
    <Section id="how" labelledBy="process-title">
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
      >
        <Eyebrow>How It Works</Eyebrow>
        <Title id="process-title">From first call to measurable channel.</Title>
        <Lede>
          A six-step engagement — with the unglamorous parts (tracking, links, forms, events,
          integrations) tested before launch, not after.
        </Lede>

        <div className="lp-timeline" style={{ marginTop: "clamp(2rem, 4vw, 3rem)" }}>
          {steps.map(([title, copy], i) => (
            <motion.div key={title} variants={rise} className="lp-timeline-step">
              <span className="lp-timeline-num" aria-hidden>
                0{i + 1}
              </span>
              <div style={{ paddingTop: "0.35rem" }}>
                <h3
                  style={{
                    fontFamily: fontDisplay,
                    fontWeight: 500,
                    fontSize: "1.2rem",
                    color: "#fff",
                    marginBottom: "0.45rem",
                  }}
                >
                  {title}
                  {i === 3 && (
                    <span
                      style={{
                        fontFamily: fontBody,
                        fontWeight: 500,
                        fontSize: "0.6rem",
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        color: CYAN,
                        border: "1px solid rgba(22,242,227,0.35)",
                        borderRadius: 999,
                        padding: "0.2rem 0.6rem",
                        marginLeft: "0.7rem",
                        verticalAlign: "middle",
                      }}
                    >
                      Tested before launch
                    </span>
                  )}
                </h3>
                <p
                  style={{
                    fontFamily: fontBody,
                    fontWeight: 300,
                    fontSize: "0.95rem",
                    lineHeight: 1.6,
                    color: INK,
                    maxWidth: 560,
                  }}
                >
                  {copy}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.p
          variants={rise}
          style={{
            fontFamily: fontBody,
            fontSize: "0.9rem",
            color: INK,
            border: `1px solid ${ACCENT_BORDER}`,
            background: "rgba(245,166,35,0.05)",
            borderRadius: 8,
            padding: "0.9rem 1.1rem",
            maxWidth: 640,
          }}
        >
          Nothing launches on faith: tracking, links, forms, conversion events, and integrations are
          validated first, so the data you optimize with is data you can trust.
        </motion.p>
      </motion.div>
    </Section>
  );
}
