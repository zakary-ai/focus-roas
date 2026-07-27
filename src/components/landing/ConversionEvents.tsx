import { motion } from "framer-motion";
import { useState } from "react";
import {
  ACCENT,
  BORDER,
  CYAN,
  ease,
  Eyebrow,
  fontBody,
  INK,
  Lede,
  MicroLabel,
  MUTED,
  PANEL_DEEP,
  rise,
  Section,
  stagger,
  Title,
} from "./shared";

type Ev = { label: string; value: string; path: string[] };

const events: Ev[] = [
  {
    label: "Form submissions",
    value: "Lead captured",
    path: ["ChatGPT Ad · Campaign", "Landing page", "Form submit", "CRM · New lead"],
  },
  {
    label: "Qualified leads",
    value: "MQL stage",
    path: ["ChatGPT Ad · Ad group", "Landing page", "Form submit", "CRM · Qualified"],
  },
  {
    label: "Booked appointments",
    value: "Meeting set",
    path: ["ChatGPT Ad · Ad", "Landing page", "Calendar booking", "CRM · Appointment"],
  },
  {
    label: "Product purchases",
    value: "Order paid",
    path: ["ChatGPT Ad · Campaign", "Product page", "Checkout", "Store · Order paid"],
  },
  {
    label: "Trial registrations",
    value: "Trial started",
    path: ["ChatGPT Ad · Ad", "Landing page", "Signup form", "App · Trial active"],
  },
  {
    label: "Software subscriptions",
    value: "Plan active",
    path: ["ChatGPT Ad · Campaign", "Pricing page", "Checkout", "Billing · Subscribed"],
  },
  {
    label: "Applications",
    value: "Application in",
    path: ["ChatGPT Ad · Ad group", "Landing page", "Application form", "CRM · Applicant"],
  },
  {
    label: "Phone calls",
    value: "Call tracked",
    path: ["ChatGPT Ad · Ad", "Landing page", "Call click", "CRM · Call logged"],
  },
  {
    label: "Pipeline value",
    value: "Value staged",
    path: ["ChatGPT Ad · Campaign", "Lead captured", "CRM stages", "Pipeline · Value assigned"],
  },
  {
    label: "Closed revenue",
    value: "Deal won",
    path: ["ChatGPT Ad · Campaign", "Lead captured", "CRM · Closed won", "Revenue attributed"],
  },
];

export default function ConversionEvents() {
  const [selected, setSelected] = useState(3);
  const ev = events[selected];

  return (
    <Section labelledBy="events-title">
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        className="lp-panel"
        style={{
          background: PANEL_DEEP,
          padding: "clamp(1.75rem, 4vw, 3.5rem)",
          borderRadius: 14,
          overflow: "hidden",
        }}
      >
        <div className="lp-grid-bg" aria-hidden />
        <div style={{ position: "relative" }}>
          <Eyebrow color={CYAN}>Conversion Tracking</Eyebrow>
          <Title id="events-title">Know what happens after someone clicks.</Title>
          <Lede maxWidth={620}>
            OpenROAS tracks the conversion events that matter to your business model — pick one to
            see how it traces back to the ad.
          </Lede>

          <div className="lp-events-grid" style={{ marginTop: "2rem" }}>
            {events.map((e, i) => (
              <button
                key={e.label}
                type="button"
                className="lp-event-card"
                aria-pressed={selected === i}
                onClick={() => setSelected(i)}
              >
                {selected === i ? (
                  <span className="lp-ping" aria-hidden />
                ) : (
                  <span
                    aria-hidden
                    style={{
                      width: 9,
                      height: 9,
                      borderRadius: "50%",
                      border: `1px solid ${MUTED}`,
                      flex: "0 0 auto",
                    }}
                  />
                )}
                {e.label}
              </button>
            ))}
          </div>

          <motion.div
            key={selected}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease }}
            style={{
              marginTop: "1.5rem",
              border: `1px solid ${BORDER}`,
              borderRadius: 10,
              background: "rgba(255,255,255,0.02)",
              padding: "clamp(1rem, 2.5vw, 1.5rem)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "1rem",
                flexWrap: "wrap",
                marginBottom: "1rem",
              }}
            >
              <MicroLabel color={CYAN}>✓ Event confirmed · {ev.value}</MicroLabel>
              <MicroLabel>Illustrative example — not customer data</MicroLabel>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.6rem" }}>
              {ev.path.map((node, i) => (
                <motion.span
                  key={node}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.12, ease }}
                  style={{ display: "inline-flex", alignItems: "center", gap: "0.6rem" }}
                >
                  <span
                    style={{
                      fontFamily: fontBody,
                      fontSize: "0.8rem",
                      color: i === ev.path.length - 1 ? "#fff" : INK,
                      border: `1px solid ${i === ev.path.length - 1 ? "rgba(245,166,35,0.5)" : BORDER}`,
                      background:
                        i === ev.path.length - 1 ? "rgba(245,166,35,0.08)" : "transparent",
                      borderRadius: 6,
                      padding: "0.45rem 0.8rem",
                    }}
                  >
                    {node}
                  </span>
                  {i < ev.path.length - 1 && (
                    <span aria-hidden style={{ color: ACCENT, fontSize: "0.8rem" }}>
                      →
                    </span>
                  )}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </Section>
  );
}
