import { fontBody, INK } from "./shared";

const items = ["Strategy", "Campaign Management", "Tracking", "Integrations", "Analytics"];

/* Slim, always-on strip under the hero: the five pillars separated by
   softly blinking data indicators, with a scanning line along each edge. */
export default function OutcomeStrip() {
  return (
    <div className="lp-strip" role="presentation">
      <span className="lp-strip-scan" aria-hidden />
      <span className="lp-strip-scan bottom" aria-hidden />
      {items.map((label, i) => (
        <span key={label} style={{ display: "flex", alignItems: "center", gap: "1.4rem" }}>
          <span
            style={{
              fontFamily: fontBody,
              fontWeight: 500,
              fontSize: "0.72rem",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: INK,
              whiteSpace: "nowrap",
            }}
          >
            {label}
          </span>
          {i < items.length - 1 && <span className="lp-strip-dot" aria-hidden />}
        </span>
      ))}
    </div>
  );
}
