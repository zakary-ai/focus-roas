import { Link } from "@tanstack/react-router";
import { NAV_ANCHORS } from "./SiteHeader";

export default function SiteFooter() {
  return (
    <footer
      style={{
        borderTop: "1px solid rgba(255,255,255,0.08)",
        padding: "2.5rem clamp(1.5rem, 6vw, 7rem)",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "1.25rem",
        fontFamily: "var(--font-inter)",
        fontSize: "0.85rem",
        color: "#7b8a96",
      }}
    >
      <span
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          fontFamily: "var(--font-display)",
          fontWeight: 600,
          color: "#fff",
        }}
      >
        <img src="/logo.png" alt="" className="lp-logo-img" />
        OpenROAS
      </span>
      <nav
        aria-label="Footer"
        style={{ display: "flex", flexWrap: "wrap", gap: "1.25rem", alignItems: "center" }}
      >
        {NAV_ANCHORS.map(([label, href]) => (
          <a key={href} href={href} style={{ color: "#D7DCE5" }}>
            {label}
          </a>
        ))}
        <Link to="/blog" style={{ color: "#D7DCE5" }}>
          Blog
        </Link>
        <Link to="/auth" style={{ color: "#D7DCE5" }}>
          Client Login
        </Link>
        <Link to="/privacy" style={{ color: "#D7DCE5" }}>
          Privacy
        </Link>
      </nav>
      <span>© {new Date().getFullYear()} OpenROAS</span>
    </footer>
  );
}
