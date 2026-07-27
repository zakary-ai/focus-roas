import { motion } from "framer-motion";
import { useRef, useState, type KeyboardEvent, type ReactNode } from "react";
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
  PANEL,
  PANEL_DEEP,
  Section,
  stagger,
  Title,
} from "./shared";

const tabs = ["Campaigns", "Conversions", "Revenue", "Tracking"] as const;
type Tab = (typeof tabs)[number];

/* ── Small building blocks ─────────────────────────────────────────── */

function Stat({ k, v, d }: { k: string; v: string; d?: string }) {
  return (
    <div
      style={{
        background: PANEL,
        border: `1px solid ${BORDER}`,
        borderTop: `1px solid rgba(245,166,35,0.18)`,
        borderRadius: 8,
        padding: "0.85rem 1rem",
        minWidth: 0,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: "0.5rem" }}>
        <span style={{ fontFamily: fontBody, fontSize: "0.72rem", color: MUTED }}>{k}</span>
        {d && (
          <span
            style={{
              fontFamily: fontBody,
              fontSize: "0.66rem",
              color: CYAN,
              background: "rgba(22,242,227,0.12)",
              borderRadius: 999,
              padding: "0.05rem 0.45rem",
            }}
          >
            {d}
          </span>
        )}
      </div>
      <span
        style={{
          fontFamily: fontDisplay,
          fontWeight: 600,
          fontSize: "1.4rem",
          color: "#fff",
        }}
      >
        {v}
      </span>
    </div>
  );
}

function Row({ cols, head }: { cols: ReactNode[]; head?: boolean }) {
  return (
    <div
      role="row"
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(120px, 1.6fr) repeat(3, minmax(64px, 1fr))",
        gap: "0.75rem",
        alignItems: "center",
        padding: "0.6rem 0.9rem",
        borderBottom: `1px solid rgba(255,255,255,0.05)`,
        fontFamily: fontBody,
        fontSize: head ? "0.66rem" : "0.82rem",
        color: head ? MUTED : INK,
        letterSpacing: head ? "0.12em" : 0,
        textTransform: head ? "uppercase" : "none",
      }}
    >
      {cols.map((c, i) => (
        <span
          key={i}
          role={head ? "columnheader" : "cell"}
          style={{ minWidth: 0, textAlign: i === 0 ? "left" : "right" }}
        >
          {c}
        </span>
      ))}
    </div>
  );
}

const okDot = (
  <span
    aria-hidden
    style={{
      width: 7,
      height: 7,
      borderRadius: "50%",
      background: CYAN,
      boxShadow: `0 0 8px ${CYAN}`,
      display: "inline-block",
      marginRight: 8,
    }}
  />
);

function Bar({ label, pct, value }: { label: string; pct: number; value: string }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(110px, 160px) 1fr auto",
        gap: "0.8rem",
        alignItems: "center",
        padding: "0.45rem 0",
      }}
    >
      <span
        style={{
          fontFamily: fontBody,
          fontSize: "0.8rem",
          color: INK,
          minWidth: 0,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </span>
      <span style={{ height: 8, borderRadius: 3, background: "rgba(255,255,255,0.06)" }}>
        <span
          style={{
            display: "block",
            width: `${pct}%`,
            height: "100%",
            borderRadius: 3,
            background: `linear-gradient(90deg, ${ACCENT}, #ffc15e)`,
          }}
        />
      </span>
      <span style={{ fontFamily: fontBody, fontSize: "0.8rem", color: "#fff" }}>{value}</span>
    </div>
  );
}

/* ── Tab panels (demonstration data only) ──────────────────────────── */

function CampaignsPanel() {
  return (
    <div>
      <Row head cols={["Campaign", "Spend", "Results", "Cost / result"]} />
      <Row cols={[<>{okDot}Demand — Core offer</>, "$6,240", "182 leads", "$34.29"]} />
      <Row cols={[<>{okDot}Branded — Product</>, "$1,830", "96 trials", "$19.06"]} />
      <Row cols={[<>{okDot}Retargeting — Cart</>, "$2,410", "74 orders", "$32.57"]} />
      <Row
        cols={[
          <>
            <span
              aria-hidden
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: MUTED,
                display: "inline-block",
                marginRight: 8,
              }}
            />
            Test — New angle
          </>,
          "$620",
          "11 leads",
          "$56.36",
        ]}
      />
      <div
        style={{
          marginTop: "1rem",
          border: "1px solid rgba(245,166,35,0.3)",
          background: "rgba(245,166,35,0.06)",
          borderRadius: 8,
          padding: "0.85rem 1rem",
          display: "flex",
          gap: "0.9rem",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <MicroLabel color={ACCENT}>Optimization</MicroLabel>
        <span style={{ fontFamily: fontBody, fontSize: "0.84rem", color: INK, flex: "1 1 240px" }}>
          Scale “Branded — Product”; pause the losing variant in “Test — New angle”.
        </span>
      </div>
    </div>
  );
}

function ConversionsPanel() {
  const items = [
    ["form_submit", "Landing page A → CRM", "Qualified"],
    ["booked_call", "Landing page A → Calendar", "Showed"],
    ["purchase", "Product page → Checkout", "$184.00"],
    ["trial_start", "Pricing page → App", "Active"],
  ];
  return (
    <div>
      <Row head cols={["Event", "Path", "Quality", ""]} />
      {items.map(([e, p, q]) => (
        <Row
          key={e}
          cols={[
            <>
              {okDot}
              {e}
            </>,
            p,
            q,
            "✓",
          ]}
        />
      ))}
      <p style={{ fontFamily: fontBody, fontSize: "0.78rem", color: MUTED, marginTop: "0.9rem" }}>
        Lead quality is scored from what happens inside your CRM — not from the click.
      </p>
    </div>
  );
}

function RevenuePanel() {
  return (
    <div>
      <MicroLabel>Attributed revenue by campaign</MicroLabel>
      <div style={{ marginTop: "0.6rem", marginBottom: "1.2rem" }}>
        <Bar label="Demand — Core offer" pct={82} value="$18,420" />
        <Bar label="Retargeting — Cart" pct={54} value="$12,080" />
        <Bar label="Branded — Product" pct={38} value="$8,610" />
        <Bar label="Test — New angle" pct={9} value="$1,940" />
      </div>
      <MicroLabel>Landing page performance</MicroLabel>
      <div style={{ marginTop: "0.4rem" }}>
        <Row head cols={["Page", "Views", "Conv.", "Rate"]} />
        <Row cols={["/offer", "4,812", "182", "3.8%"]} />
        <Row cols={["/pricing", "2,140", "96", "4.5%"]} />
      </div>
    </div>
  );
}

function TrackingPanel() {
  const checks = [
    "Click IDs captured on every ad link",
    "Landing page events firing",
    "CRM stages syncing",
    "Revenue attribution active",
  ];
  return (
    <div>
      <MicroLabel>Tracking health</MicroLabel>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
          margin: "0.7rem 0 1.2rem",
        }}
      >
        {checks.map((c) => (
          <div
            key={c}
            style={{
              display: "flex",
              alignItems: "center",
              border: `1px solid ${BORDER}`,
              borderRadius: 6,
              background: PANEL,
              padding: "0.6rem 0.9rem",
              fontFamily: fontBody,
              fontSize: "0.84rem",
              color: INK,
            }}
          >
            {okDot}
            {c}
          </div>
        ))}
      </div>
      <MicroLabel>Connected systems</MicroLabel>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.45rem", marginTop: "0.6rem" }}>
        {["ChatGPT Ads", "Landing pages", "CRM", "Checkout", "Analytics"].map((s) => (
          <span key={s} className="lp-chip">
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}

const stats: Record<Tab, [string, string, string?][]> = {
  Campaigns: [
    ["Active campaigns", "4"],
    ["Spend (30d)", "$11,100"],
    ["Results", "363", "+18%"],
    ["Avg. cost / result", "$30.58"],
  ],
  Conversions: [
    ["Events (30d)", "1,204"],
    ["Qualified rate", "61%", "+6%"],
    ["Booked calls", "84"],
    ["Purchases", "74"],
  ],
  Revenue: [
    ["Attributed revenue", "$41,050", "+22%"],
    ["ROAS", "3.7×"],
    ["Pipeline value", "$96,400"],
    ["Closed revenue", "$41,050"],
  ],
  Tracking: [
    ["Tracking health", "100%"],
    ["Events validated", "12/12"],
    ["Connected systems", "5"],
    ["Last sync", "2m ago"],
  ],
};

const panels: Record<Tab, ReactNode> = {
  Campaigns: <CampaignsPanel />,
  Conversions: <ConversionsPanel />,
  Revenue: <RevenuePanel />,
  Tracking: <TrackingPanel />,
};

export default function AnalyticsCommandCenter() {
  const [tab, setTab] = useState<Tab>("Campaigns");
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKeyDown = (e: KeyboardEvent) => {
    const i = tabs.indexOf(tab);
    let next = -1;
    if (e.key === "ArrowRight") next = (i + 1) % tabs.length;
    if (e.key === "ArrowLeft") next = (i - 1 + tabs.length) % tabs.length;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = tabs.length - 1;
    if (next >= 0) {
      e.preventDefault();
      setTab(tabs[next]);
      tabRefs.current[next]?.focus();
    }
  };

  return (
    <Section id="analytics" labelledBy="analytics-title">
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
      >
        <Eyebrow>Analytics Command Center</Eyebrow>
        <Title id="analytics-title">One dashboard for your ads, conversions, and revenue.</Title>
        <Lede maxWidth={620}>
          Campaign performance, conversion events, revenue attribution, and tracking health — in one
          place, in plain language.
        </Lede>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, ease }}
        className="lp-panel glow"
        style={{
          marginTop: "clamp(2rem, 4vw, 3rem)",
          background: PANEL_DEEP,
          borderRadius: 14,
          padding: "clamp(1rem, 2.5vw, 1.75rem)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "0.8rem",
            flexWrap: "wrap",
            marginBottom: "1.1rem",
          }}
        >
          <div
            className="lp-tabs"
            role="tablist"
            aria-label="Dashboard views"
            onKeyDown={onKeyDown}
          >
            {tabs.map((t, i) => (
              <button
                key={t}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                type="button"
                role="tab"
                id={`lp-tab-${t}`}
                aria-selected={tab === t}
                aria-controls="lp-tabpanel"
                tabIndex={tab === t ? 0 : -1}
                className="lp-tab"
                onClick={() => setTab(t)}
              >
                {t}
              </button>
            ))}
          </div>
          <span
            style={{
              fontFamily: fontBody,
              fontSize: "0.66rem",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: MUTED,
              border: `1px solid ${BORDER}`,
              borderRadius: 999,
              padding: "0.3rem 0.8rem",
            }}
          >
            Example dashboard · demonstration data
          </span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: "0.7rem",
            marginBottom: "1.1rem",
          }}
        >
          {stats[tab].map(([k, v, d]) => (
            <Stat key={k} k={k} v={v} d={d} />
          ))}
        </div>

        <motion.div
          key={tab}
          id="lp-tabpanel"
          role="tabpanel"
          aria-labelledby={`lp-tab-${tab}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease }}
          style={{
            border: `1px solid ${BORDER}`,
            borderRadius: 10,
            background: "rgba(255,255,255,0.015)",
            padding: "clamp(0.9rem, 2vw, 1.3rem)",
            overflowX: "auto",
          }}
        >
          {panels[tab]}
        </motion.div>
      </motion.div>
    </Section>
  );
}
