import { Link } from "@tanstack/react-router";
import { BOOK_CALL_URL } from "./shared";

/* Shared marketing-site header. Anchor links are absolute ("/#services") so
   they work from the blog pages as well as the homepage. */
export const NAV_ANCHORS: [string, string][] = [
  ["Services", "/#services"],
  ["Tracking & Integrations", "/#tracking"],
  ["Analytics", "/#analytics"],
  ["How It Works", "/#how"],
];

export default function SiteHeader() {
  return (
    <header className="lp-header">
      <Link to="/" className="lp-logo" aria-label="OpenROAS home">
        <img src="/logo.png" alt="" className="lp-logo-img" />
        <span className="lp-logo-text">OpenROAS</span>
      </Link>
      <nav className="lp-nav-links" aria-label="Main">
        {NAV_ANCHORS.map(([label, href]) => (
          <a key={href} href={href} className="lp-nav-anchor">
            {label}
          </a>
        ))}
        <Link to="/blog" className="lp-nav-anchor">
          Blog
        </Link>
        <Link to="/auth" className="lp-nav-login">
          Client Login
        </Link>
        <a href={BOOK_CALL_URL} className="lp-cta-primary lp-nav-cta">
          Book a Strategy Call
        </a>
      </nav>
    </header>
  );
}
