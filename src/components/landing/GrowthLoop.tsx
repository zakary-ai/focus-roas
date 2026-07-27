import { AnimatePresence, motion } from "framer-motion";
import { useState, type ReactNode } from "react";
import {
  ACCENT,
  BORDER,
  CYAN,
  ease,
  Eyebrow,
  fontBody,
  fontDisplay,
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

const rowStyle = {
  display: "flex",
  alignItems: "center",
  gap: "0.6rem",
  border: `1px solid ${BORDER}`,
  borderRadius: 6,
  background: PANEL_DEEP,
  padding: "0.6rem 0.8rem",
  fontFamily: fontBody,
  fontSize: "0.78rem",
  color: INK,
} as const;

const check = (c = CYAN) => (
  <span style={{ color: c, fontSize: "0.72rem", flex: "0 0 auto" }} aria-hidden>
    ✓
  </span>
);

function PanelFrame({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="lp-panel glow" style={{ padding: "clamp(1.1rem, 2vw, 1.6rem)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.9rem" }}>
        <MicroLabel color={ACCENT}>{label}</MicroLabel>
        <MicroLabel>OpenROAS</MicroLabel>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>{children}</div>
    </div>
  );
}

const visuals: ReactNode[] = [
  <PanelFrame key="v0" label="Campaign planning">
    <div style={rowStyle}>Offer & audience mapped</div>
    <div style={rowStyle}>Conversion goal defined</div>
    <div style={rowStyle}>Budget & structure planned</div>
    <div style={{ ...rowStyle, borderColor: "rgba(245,166,35,0.4)", color: "#fff" }}>
      Measurement plan approved
    </div>
  </PanelFrame>,
  <PanelFrame key="v1" label="Landing page creation">
    <div style={{ ...rowStyle, flexDirection: "column", alignItems: "stretch", gap: "0.4rem" }}>
      <span
        style={{ width: "70%", height: 8, borderRadius: 3, background: "rgba(255,255,255,0.22)" }}
      />
      <span
        style={{ width: "48%", height: 5, borderRadius: 3, background: "rgba(255,255,255,0.12)" }}
      />
      <span style={{ width: 92, height: 18, borderRadius: 3, background: ACCENT, marginTop: 4 }} />
    </div>
    <div style={rowStyle}>{check()} Message matched to the ad</div>
    <div style={rowStyle}>{check()} One clear call to action</div>
  </PanelFrame>,
  <PanelFrame key="v2" label="Connector activation">
    <div style={rowStyle}>{check()} CRM connected</div>
    <div style={rowStyle}>{check()} Store / checkout connected</div>
    <div style={rowStyle}>{check()} Analytics connected</div>
    <div style={rowStyle}>{check(ACCENT)} Webhooks & custom APIs ready</div>
  </PanelFrame>,
  <PanelFrame key="v3" label="Tracking validation">
    <div style={rowStyle}>{check()} Test click → click_id captured</div>
    <div style={rowStyle}>{check()} Form submit → event received</div>
    <div style={rowStyle}>{check()} Conversion → attributed to ad</div>
    <div style={{ ...rowStyle, borderColor: "rgba(22,242,227,0.4)", color: "#fff" }}>
      All checks passed — cleared for launch
    </div>
  </PanelFrame>,
  <PanelFrame key="v4" label="Campaign performance">
    <div style={{ display: "flex", alignItems: "flex-end", gap: "0.3rem", height: 72 }} aria-hidden>
      {[38, 46, 42, 55, 60, 58, 72, 80].map((h, i) => (
        <span
          key={i}
          style={{
            flex: 1,
            height: `${h}%`,
            borderRadius: "3px 3px 0 0",
            background: i >= 6 ? CYAN : "rgba(245,166,35,0.75)",
          }}
        />
      ))}
    </div>
    <div style={rowStyle}>Cost per result trending down</div>
    <div style={rowStyle}>Winning ads identified</div>
  </PanelFrame>,
  <PanelFrame key="v5" label="Budget scaling">
    {[
      ["Winning campaign", 86, ACCENT],
      ["Proven ad group", 64, ACCENT],
      ["New test cell", 24, MUTED],
    ].map(([label, pct, color]) => (
      <div key={label as string} style={{ ...rowStyle, gap: "0.8rem" }}>
        <span style={{ width: 110, flex: "0 0 auto" }}>{label}</span>
        <span style={{ flex: 1, height: 5, borderRadius: 3, background: "rgba(255,255,255,0.08)" }}>
          <span
            style={{
              display: "block",
              width: `${pct}%`,
              height: "100%",
              borderRadius: 3,
              background: color as string,
            }}
          />
        </span>
      </div>
    ))}
    <div style={{ ...rowStyle, borderColor: "rgba(245,166,35,0.4)", color: "#fff" }}>
      Spend follows measured revenue
    </div>
  </PanelFrame>,
];

const steps = [
  {
    t: "Strategy",
    d: "We map your offer, audience, and conversion goal into a campaign plan with a measurement plan to match.",
  },
  {
    t: "Build",
    d: "Campaigns, ad messaging, and conversion-focused landing pages are built as one connected funnel.",
  },
  {
    t: "Connect",
    d: "Your CRM, store, booking system, payments, and analytics are wired into OpenROAS tracking.",
  },
  {
    t: "Launch",
    d: "Every link, form, and event is validated first — then campaigns go live with full visibility.",
  },
  {
    t: "Optimize",
    d: "Decisions come from conversions and revenue, not clicks: creative, budgets, and pages improve weekly.",
  },
  {
    t: "Scale",
    d: "Budget moves toward what measurably works, and the loop starts again at a bigger size.",
  },
];

export default function GrowthLoop() {
  const [active, setActive] = useState(0);

  return (
    <Section id="growth-loop" labelledBy="loop-title">
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
      >
        <Eyebrow>How the engine runs</Eyebrow>
        <Title id="loop-title">The OpenROAS Growth Loop</Title>
        <Lede>
          Six stages, one owner. Scroll through the loop — each stage updates the system view.
        </Lede>
      </motion.div>

      <div className="lp-loop" style={{ marginTop: "clamp(2rem, 4vw, 3rem)" }}>
        <div>
          {steps.map((s, i) => (
            <motion.button
              key={s.t}
              type="button"
              className={`lp-loop-step${active === i ? " on" : ""}`}
              onClick={() => setActive(i)}
              onFocus={() => setActive(i)}
              onViewportEnter={() => setActive(i)}
              viewport={{ margin: "-46% 0px -46% 0px" }}
              aria-current={active === i}
            >
              <span
                style={{
                  fontFamily: fontDisplay,
                  fontWeight: 600,
                  fontSize: "0.8rem",
                  letterSpacing: "0.1em",
                  color: active === i ? ACCENT : MUTED,
                  paddingTop: "0.2rem",
                }}
              >
                0{i + 1}
              </span>
              <span>
                <span
                  style={{
                    display: "block",
                    fontFamily: fontDisplay,
                    fontWeight: 500,
                    fontSize: "1.25rem",
                    color: "#fff",
                    marginBottom: "0.35rem",
                  }}
                >
                  {s.t}
                </span>
                <span
                  style={{
                    display: "block",
                    fontFamily: fontBody,
                    fontWeight: 300,
                    fontSize: "0.95rem",
                    lineHeight: 1.55,
                    color: INK,
                    maxWidth: 460,
                  }}
                >
                  {s.d}
                </span>
                <span className="lp-loop-inline">{visuals[i]}</span>
              </span>
            </motion.button>
          ))}
        </div>

        <div className="lp-loop-visual" aria-hidden>
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease }}
            >
              {visuals[active]}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </Section>
  );
}
