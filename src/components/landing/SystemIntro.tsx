import { motion } from "framer-motion";
import {
  ACCENT,
  ACCENT_BORDER,
  BORDER,
  CYAN,
  Eyebrow,
  fontBody,
  fontDisplay,
  Lede,
  MicroLabel,
  MUTED,
  PANEL_DEEP,
  rise,
  Section,
  stagger,
  Title,
} from "./shared";

const chain = [
  { label: "ChatGPT Ads", note: "Campaigns & tagged links", color: ACCENT },
  { label: "Landing Page", note: "Built to convert", color: CYAN },
  { label: "Website Activity", note: "Sessions & events", color: CYAN },
  { label: "CRM / Store / Booking", note: "Leads & orders captured", color: CYAN },
  { label: "Conversion", note: "The moment that matters", color: ACCENT },
  { label: "Revenue", note: "Tied back to the click", color: ACCENT },
  { label: "Reporting", note: "One clear view", color: CYAN },
  { label: "Optimization", note: "Budget follows results", color: ACCENT },
];

function ChainDiagram() {
  return (
    <motion.div
      variants={rise}
      className="lp-panel glow"
      style={{ padding: "clamp(1.25rem, 2.5vw, 2rem)" }}
      aria-label="Diagram: the OpenROAS system connects ChatGPT Ads through landing pages, website activity, CRM or store, conversion, revenue, reporting, and optimization"
    >
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
        <MicroLabel color={ACCENT}>The OpenROAS System</MicroLabel>
        <MicroLabel>End to end</MicroLabel>
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {chain.map((step, i) => (
          <div key={step.label}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.8rem",
                border: `1px solid ${BORDER}`,
                borderLeft: `2px solid ${step.color}`,
                borderRadius: 6,
                background: PANEL_DEEP,
                padding: "0.62rem 0.9rem",
              }}
            >
              <span
                aria-hidden
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: step.color,
                  boxShadow: `0 0 8px ${step.color}`,
                  flex: "0 0 auto",
                }}
              />
              <span
                style={{
                  fontFamily: fontBody,
                  fontWeight: 500,
                  fontSize: "0.85rem",
                  color: "#fff",
                  flex: "1 1 auto",
                }}
              >
                {step.label}
              </span>
              <span
                style={{
                  fontFamily: fontBody,
                  fontSize: "0.72rem",
                  color: MUTED,
                  textAlign: "right",
                }}
              >
                {step.note}
              </span>
            </div>
            {i < chain.length - 1 && (
              <div
                aria-hidden
                style={{
                  width: 2,
                  height: 12,
                  margin: "0 auto",
                  background: `linear-gradient(180deg, ${step.color}55, transparent)`,
                }}
              />
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default function SystemIntro() {
  return (
    <Section id="system" labelledBy="system-title">
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        className="lp-two-col"
      >
        <div>
          <Eyebrow>The Complete ChatGPT Ads System</Eyebrow>
          <Title id="system-title">More than ad management.</Title>
          <Lede>
            Running campaigns is only one part of building a profitable advertising channel.
          </Lede>
          <Lede>
            OpenROAS connects your ads, landing pages, website activity, CRM, checkout, booking
            system, and revenue data so you can understand what happens after someone clicks.
          </Lede>
          <Lede>
            No disconnected reports. No guessing which campaign produced the result. No optimizing
            around clicks that never become customers.
          </Lede>
          <motion.p
            variants={rise}
            style={{
              fontFamily: fontDisplay,
              fontWeight: 500,
              fontSize: "1.2rem",
              color: "#fff",
              borderLeft: `2px solid ${ACCENT}`,
              background: `rgba(245,166,35,0.06)`,
              border: `1px solid ${ACCENT_BORDER}`,
              borderLeftWidth: 2,
              borderLeftColor: ACCENT,
              padding: "1.1rem 1.3rem",
              marginTop: "1.4rem",
              maxWidth: 480,
            }}
          >
            You get one partner responsible for the entire system.
          </motion.p>
        </div>
        <ChainDiagram />
      </motion.div>
    </Section>
  );
}
