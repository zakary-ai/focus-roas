import { motion } from "framer-motion";
import type { ReactNode } from "react";
import {
  ACCENT,
  BORDER,
  CYAN,
  Eyebrow,
  fontBody,
  fontDisplay,
  INK,
  MUTED,
  rise,
  Section,
  stagger,
  Title,
} from "./shared";

/* Small interface-style illustrations, built from HTML/CSS only. */

const line = (w: string, c = "rgba(255,255,255,0.14)", h = 5) => (
  <span style={{ display: "block", width: w, height: h, borderRadius: 3, background: c }} />
);

function VisualStrategy() {
  const box = (label: string, sub: boolean) => (
    <div
      style={{
        border: `1px solid ${sub ? BORDER : "rgba(245,166,35,0.4)"}`,
        borderRadius: 5,
        padding: "0.32rem 0.5rem",
        fontFamily: fontBody,
        fontSize: "0.58rem",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: sub ? MUTED : ACCENT,
        background: sub ? "transparent" : "rgba(245,166,35,0.07)",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </div>
  );
  return (
    <div className="lp-bento-visual" aria-hidden>
      <div style={{ display: "flex", justifyContent: "center" }}>
        {box("Campaign · Demand", false)}
      </div>
      <div style={{ display: "flex", gap: "0.45rem", justifyContent: "center" }}>
        {box("Ad group A", true)}
        {box("Ad group B", true)}
      </div>
      <div style={{ display: "flex", gap: "0.45rem", justifyContent: "center", flexWrap: "wrap" }}>
        {box("Ad 1", true)}
        {box("Ad 2", true)}
        {box("Ad 3", true)}
      </div>
    </div>
  );
}

function VisualManagement() {
  const row = (label: string, pct: number, on: boolean) => (
    <div key={label} style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
      <span
        style={{
          width: 22,
          height: 12,
          borderRadius: 999,
          background: on ? "rgba(22,242,227,0.35)" : "rgba(255,255,255,0.12)",
          position: "relative",
          flex: "0 0 auto",
        }}
      >
        <span
          style={{
            position: "absolute",
            top: 2,
            left: on ? 12 : 2,
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: on ? CYAN : MUTED,
          }}
        />
      </span>
      <span style={{ fontFamily: fontBody, fontSize: "0.62rem", color: INK, width: 74 }}>
        {label}
      </span>
      <span style={{ flex: 1, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.08)" }}>
        <span
          style={{
            display: "block",
            width: `${pct}%`,
            height: "100%",
            borderRadius: 2,
            background: `linear-gradient(90deg, ${ACCENT}, #ffc15e)`,
          }}
        />
      </span>
    </div>
  );
  return (
    <div className="lp-bento-visual" aria-hidden>
      {row("Prospecting", 72, true)}
      {row("Branded", 45, true)}
      {row("Retargeting", 58, true)}
      {row("Test cell", 20, false)}
    </div>
  );
}

function VisualCreative() {
  return (
    <div className="lp-bento-visual" aria-hidden>
      <div style={{ display: "flex", gap: "0.4rem", marginBottom: "0.2rem" }}>
        <span
          style={{
            fontFamily: fontBody,
            fontSize: "0.56rem",
            letterSpacing: "0.1em",
            color: ACCENT,
            border: "1px solid rgba(245,166,35,0.4)",
            borderRadius: 999,
            padding: "0.1rem 0.5rem",
          }}
        >
          VARIANT A
        </span>
        <span
          style={{
            fontFamily: fontBody,
            fontSize: "0.56rem",
            letterSpacing: "0.1em",
            color: MUTED,
            border: `1px solid ${BORDER}`,
            borderRadius: 999,
            padding: "0.1rem 0.5rem",
          }}
        >
          VARIANT B
        </span>
      </div>
      {line("88%", "rgba(255,255,255,0.22)", 6)}
      {line("64%")}
      {line("74%")}
      <div style={{ display: "flex", gap: "0.4rem", alignItems: "center", marginTop: "0.2rem" }}>
        {line("30%", "rgba(245,166,35,0.8)", 6)}
        <span style={{ fontFamily: fontBody, fontSize: "0.58rem", color: CYAN }}>+ CTA tested</span>
      </div>
    </div>
  );
}

function VisualLanding() {
  return (
    <div className="lp-bento-visual" aria-hidden>
      <div
        style={{
          border: `1px solid ${BORDER}`,
          borderRadius: 6,
          padding: "0.55rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.35rem",
        }}
      >
        <div style={{ display: "flex", gap: "0.3rem", alignItems: "center" }}>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: MUTED }} />
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: MUTED }} />
          {line("40%", "rgba(255,255,255,0.1)", 4)}
        </div>
        {line("70%", "rgba(255,255,255,0.25)", 7)}
        {line("50%")}
        <div style={{ display: "flex", gap: "0.35rem", marginTop: "0.15rem" }}>
          <span
            style={{
              width: 52,
              height: 14,
              borderRadius: 3,
              background: ACCENT,
            }}
          />
          <span style={{ width: 40, height: 14, borderRadius: 3, border: `1px solid ${BORDER}` }} />
        </div>
      </div>
    </div>
  );
}

function VisualTracking() {
  const ev = (label: string, ok: boolean) => (
    <div key={label} style={{ display: "flex", alignItems: "center", gap: "0.55rem" }}>
      <span
        style={{
          width: 13,
          height: 13,
          borderRadius: "50%",
          border: `1px solid ${ok ? CYAN : BORDER}`,
          color: ok ? CYAN : MUTED,
          fontSize: "0.5rem",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          flex: "0 0 auto",
        }}
      >
        {ok ? "✓" : "·"}
      </span>
      <span style={{ fontFamily: fontBody, fontSize: "0.64rem", color: INK }}>{label}</span>
    </div>
  );
  return (
    <div className="lp-bento-visual" aria-hidden>
      {ev("click_id captured", true)}
      {ev("page_view · /offer", true)}
      {ev("form_submit · lead", true)}
      {ev("purchase · $184.00", true)}
    </div>
  );
}

function VisualConnectors() {
  const node = (label: string) => (
    <span
      style={{
        fontFamily: fontBody,
        fontSize: "0.58rem",
        color: INK,
        border: `1px solid ${BORDER}`,
        borderRadius: 999,
        padding: "0.18rem 0.55rem",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
  return (
    <div className="lp-bento-visual" aria-hidden>
      <div style={{ display: "flex", gap: "0.4rem", justifyContent: "center", flexWrap: "wrap" }}>
        {node("CRM")}
        {node("Store")}
        {node("Payments")}
      </div>
      <div
        style={{
          width: 1,
          height: 12,
          margin: "0 auto",
          background: "rgba(22,242,227,0.5)",
        }}
      />
      <div style={{ display: "flex", justifyContent: "center" }}>
        <span
          style={{
            fontFamily: fontDisplay,
            fontWeight: 600,
            fontSize: "0.66rem",
            color: "#02080D",
            background: ACCENT,
            borderRadius: 5,
            padding: "0.25rem 0.7rem",
          }}
        >
          OpenROAS
        </span>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: "0.25rem",
          height: 26,
          marginTop: "0.2rem",
        }}
      >
        {[35, 55, 42, 70, 62, 88, 78].map((h, i) => (
          <span
            key={i}
            style={{
              flex: 1,
              height: `${h}%`,
              borderRadius: "2px 2px 0 0",
              background: i % 2 ? "rgba(22,242,227,0.65)" : "rgba(245,166,35,0.8)",
            }}
          />
        ))}
      </div>
    </div>
  );
}

type Service = { title: string; copy: string; visual: ReactNode; wide?: boolean };

const services: Service[] = [
  {
    title: "ChatGPT Ads Strategy",
    copy: "Positioning, audience, budget, and campaign structure planned around your actual conversion goal — before anything goes live.",
    visual: <VisualStrategy />,
    wide: true,
  },
  {
    title: "Campaign Setup & Management",
    copy: "Campaigns built, launched, and managed daily: budgets, bids, structure, and testing handled for you.",
    visual: <VisualManagement />,
    wide: true,
  },
  {
    title: "Ad Copy & Creative Strategy",
    copy: "Messaging and creative angles written for how people actually use ChatGPT — and tested as variants, not guesses.",
    visual: <VisualCreative />,
  },
  {
    title: "Landing Pages",
    copy: "Conversion-focused pages designed and built to carry the click through to the action that matters.",
    visual: <VisualLanding />,
  },
  {
    title: "Tracking & Attribution",
    copy: "Click IDs, events, and conversions wired end to end so every result traces back to the ad that caused it.",
    visual: <VisualTracking />,
  },
  {
    title: "Connectors & Analytics",
    copy: "Your CRM, store, payments, and analytics feeding one reporting view — with custom integrations where needed.",
    visual: <VisualConnectors />,
  },
];

export default function ServicesBento() {
  return (
    <Section id="services" labelledBy="services-title">
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
      >
        <Eyebrow>Services</Eyebrow>
        <Title id="services-title">Everything between the ad and the revenue.</Title>
        <motion.div variants={rise} style={{ marginTop: "clamp(2rem, 5vw, 3.5rem)" }}>
          <div className="lp-bento">
            {services.map((s) => (
              <motion.article
                key={s.title}
                variants={rise}
                className={`lp-bento-card${s.wide ? " wide" : ""}`}
              >
                {s.visual}
                <h3
                  style={{
                    fontFamily: fontDisplay,
                    fontWeight: 500,
                    fontSize: "1.15rem",
                    color: "#fff",
                  }}
                >
                  {s.title}
                </h3>
                <p
                  style={{
                    fontFamily: fontBody,
                    fontWeight: 300,
                    fontSize: "0.95rem",
                    lineHeight: 1.55,
                    color: INK,
                  }}
                >
                  {s.copy}
                </p>
              </motion.article>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </Section>
  );
}
