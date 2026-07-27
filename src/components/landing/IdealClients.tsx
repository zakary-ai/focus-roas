import { motion } from "framer-motion";
import {
  ACCENT,
  CYAN,
  Eyebrow,
  fontBody,
  fontDisplay,
  INK,
  Lede,
  MicroLabel,
  rise,
  Section,
  stagger,
  Title,
} from "./shared";

type Client = {
  title: string;
  goal: string;
  copy: string;
  funnel: [string, number, number][]; // label, resting width, hover width (0..1)
};

const clients: Client[] = [
  {
    title: "SaaS & AI Products",
    goal: "Trials and paid subscriptions",
    copy: "Track signups from ChatGPT Ads through activation to paid plans, so spend follows revenue — not raw signups.",
    funnel: [
      ["Visit", 1, 1],
      ["Trial", 0.55, 0.68],
      ["Paid", 0.28, 0.42],
    ],
  },
  {
    title: "E-commerce Brands",
    goal: "Purchases and repeat revenue",
    copy: "Attribute orders to the exact ad and campaign, and see which products the channel actually sells.",
    funnel: [
      ["Click", 1, 1],
      ["Add to cart", 0.5, 0.62],
      ["Order", 0.3, 0.46],
    ],
  },
  {
    title: "Professional Services",
    goal: "Qualified leads and booked calls",
    copy: "Measure form fills and calls by lead quality in your CRM — so you optimize for clients, not inquiries.",
    funnel: [
      ["Lead", 1, 1],
      ["Qualified", 0.6, 0.72],
      ["Booked", 0.34, 0.5],
    ],
  },
  {
    title: "Local & Experience-Based",
    goal: "Bookings, calls, and visits",
    copy: "Connect your booking system and phones so every reservation traces back to the ad that drove it.",
    funnel: [
      ["View", 1, 1],
      ["Call / Book", 0.52, 0.66],
      ["Showed", 0.3, 0.44],
    ],
  },
];

export default function IdealClients() {
  return (
    <Section labelledBy="clients-title">
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
      >
        <Eyebrow>Who It’s For</Eyebrow>
        <Title id="clients-title">A better way to enter the ChatGPT Ads channel.</Title>
        <Lede>
          Different business models, same principle: optimize for the conversion that pays you.
        </Lede>

        <motion.div variants={rise}>
          <div className="lp-clients" style={{ marginTop: "clamp(2rem, 4vw, 3rem)" }}>
            {clients.map((c) => (
              <article key={c.title} className="lp-client-card" tabIndex={0}>
                <MicroLabel color={ACCENT}>Primary goal · {c.goal}</MicroLabel>
                <h3
                  style={{
                    fontFamily: fontDisplay,
                    fontWeight: 500,
                    fontSize: "1.2rem",
                    color: "#fff",
                  }}
                >
                  {c.title}
                </h3>
                <p
                  style={{
                    fontFamily: fontBody,
                    fontWeight: 300,
                    fontSize: "0.92rem",
                    lineHeight: 1.55,
                    color: INK,
                    flex: "1 1 auto",
                  }}
                >
                  {c.copy}
                </p>
                <div
                  aria-hidden
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.4rem",
                    marginTop: "0.4rem",
                  }}
                >
                  {c.funnel.map(([label, w, wh], i) => (
                    <div
                      key={label}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "84px 1fr",
                        gap: "0.6rem",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: fontBody,
                          fontSize: "0.66rem",
                          color: i === c.funnel.length - 1 ? CYAN : INK,
                        }}
                      >
                        {label}
                      </span>
                      <span
                        className="lp-funnel-bar"
                        style={
                          {
                            "--w": w,
                            "--wh": wh,
                            opacity: 0.5 + 0.5 * (1 - i * 0.3),
                          } as React.CSSProperties
                        }
                      />
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </Section>
  );
}
