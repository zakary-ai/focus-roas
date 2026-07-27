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
  MicroLabel,
  MUTED,
  PANEL,
  rise,
  Section,
  stagger,
  Title,
} from "./shared";

const groups: { name: string; items: string[] }[] = [
  { name: "Advertising", items: ["ChatGPT Ads"] },
  { name: "Websites & landing pages", items: ["Custom pages", "Webflow", "WordPress"] },
  { name: "CRM & lead management", items: ["HubSpot", "GoHighLevel", "Salesforce"] },
  { name: "Commerce & payments", items: ["Shopify", "Stripe"] },
  {
    name: "Analytics & automation",
    items: ["Google Analytics", "Zapier", "Make", "Webhooks", "Custom APIs"],
  },
];

function Group({ name, items }: { name: string; items: string[] }) {
  return (
    <div
      style={{
        border: `1px solid ${BORDER}`,
        borderRadius: 10,
        background: PANEL,
        padding: "1rem 1.1rem",
      }}
    >
      <div style={{ marginBottom: "0.7rem" }}>
        <MicroLabel color={ACCENT}>{name}</MicroLabel>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.45rem" }}>
        {items.map((it) => (
          <span key={it} className="lp-chip">
            <span
              aria-hidden
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: CYAN,
                boxShadow: `0 0 6px ${CYAN}`,
              }}
            />
            {it}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function IntegrationsSection() {
  return (
    <Section id="integrations" labelledBy="integrations-title">
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
      >
        <Eyebrow>Connectors</Eyebrow>
        <Title id="integrations-title">Bring your advertising and business data together.</Title>
        <Lede maxWidth={620}>
          OpenROAS sits in the middle of your stack: advertising on one side, the systems that hold
          your leads, orders, and revenue on the other.
        </Lede>

        <motion.div variants={rise} style={{ marginTop: "clamp(2rem, 4vw, 3rem)" }}>
          <div className="lp-hub">
            <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
              <Group {...groups[0]} />
              <Group {...groups[1]} />
            </div>

            <div
              style={{ display: "flex", alignItems: "center", gap: "clamp(0.75rem, 2vw, 1.5rem)" }}
            >
              <span
                className="lp-hub-line"
                style={{ width: "clamp(24px, 4vw, 70px)" }}
                aria-hidden
              />
              <div
                style={{
                  border: `1px solid rgba(245,166,35,0.5)`,
                  borderRadius: 14,
                  background: "rgba(245,166,35,0.07)",
                  boxShadow: "0 0 60px -12px rgba(245,166,35,0.45)",
                  padding: "1.4rem 1.8rem",
                  textAlign: "center",
                }}
              >
                <span
                  style={{
                    display: "block",
                    fontFamily: fontDisplay,
                    fontWeight: 600,
                    fontSize: "1.2rem",
                    color: "#fff",
                  }}
                >
                  OpenROAS
                </span>
                <span
                  style={{
                    display: "block",
                    fontFamily: fontBody,
                    fontSize: "0.68rem",
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: ACCENT,
                    marginTop: "0.35rem",
                  }}
                >
                  Tracking · Attribution · Reporting
                </span>
              </div>
              <span
                className="lp-hub-line rev"
                style={{ width: "clamp(24px, 4vw, 70px)" }}
                aria-hidden
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
              <Group {...groups[2]} />
              <Group {...groups[3]} />
              <Group {...groups[4]} />
            </div>
          </div>
        </motion.div>

        <motion.p
          variants={rise}
          style={{
            fontFamily: fontBody,
            fontSize: "0.8rem",
            color: MUTED,
            marginTop: "1.5rem",
            maxWidth: 640,
          }}
        >
          Platforms shown are examples of what an OpenROAS build can connect to — integrations are
          scoped and configured per engagement, and anything with an API or webhooks can be wired in
          as a custom integration.
        </motion.p>
      </motion.div>
    </Section>
  );
}
