import { motion, type Variants } from "framer-motion";
import type { CSSProperties, ReactNode } from "react";

/* Brand tokens shared by every landing section — sourced from the approved
   hero/dashboard design so the page below the fold reads as one system. */
export const BG = "#02080D";
export const PANEL = "#0C1018";
export const PANEL_DEEP = "#0a0f17";
export const ACCENT = "#F5A623";
export const CYAN = "#16F2E3";
export const INK = "#D7DCE5";
export const MUTED = "#7b8a96";
export const BORDER = "rgba(255,255,255,0.08)";
export const ACCENT_BORDER = "rgba(245,166,35,0.18)";
export const ACCENT_BORDER_SOFT = "rgba(245,166,35,0.10)";

export const ease = [0.25, 0, 0, 1] as const;

/* Single place to swap in a real scheduling link (Calendly etc.). */
export const BOOK_CALL_URL = "mailto:zakary@deleo.ai?subject=ChatGPT%20Ads%20strategy%20call";

export const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

export const rise: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease } },
};

export const fontDisplay = "var(--font-display)";
export const fontBody = "var(--font-inter)";

export function Section({
  id,
  children,
  style,
  labelledBy,
}: {
  id?: string;
  children: ReactNode;
  style?: CSSProperties;
  labelledBy?: string;
}) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      style={{
        background: BG,
        padding: "clamp(5rem, 12vw, 8.5rem) clamp(1.5rem, 6vw, 7rem)",
        maxWidth: 1400,
        margin: "0 auto",
        position: "relative",
        ...style,
      }}
    >
      {children}
    </section>
  );
}

export function Eyebrow({ children, color = ACCENT }: { children: ReactNode; color?: string }) {
  return (
    <motion.p
      variants={rise}
      style={{
        fontFamily: fontBody,
        fontSize: "0.65rem",
        letterSpacing: "0.25em",
        textTransform: "uppercase",
        color,
        marginBottom: "1.25rem",
      }}
    >
      {children}
    </motion.p>
  );
}

export function Title({
  children,
  id,
  maxWidth = 760,
}: {
  children: ReactNode;
  id?: string;
  maxWidth?: number;
}) {
  return (
    <motion.h2
      id={id}
      variants={rise}
      style={{
        fontFamily: fontDisplay,
        fontWeight: 600,
        fontSize: "clamp(2rem, 4vw, 3.5rem)",
        lineHeight: 1.05,
        letterSpacing: "-0.02em",
        marginBottom: "1.25rem",
        maxWidth,
        color: "#fff",
      }}
    >
      {children}
    </motion.h2>
  );
}

export function Lede({
  children,
  maxWidth = 560,
  style,
}: {
  children: ReactNode;
  maxWidth?: number;
  style?: CSSProperties;
}) {
  return (
    <motion.p
      variants={rise}
      style={{
        fontFamily: fontBody,
        fontWeight: 300,
        fontSize: "1.05rem",
        lineHeight: 1.6,
        color: INK,
        maxWidth,
        marginBottom: "1.1rem",
        ...style,
      }}
    >
      {children}
    </motion.p>
  );
}

const ctaBase: CSSProperties = {
  display: "inline-block",
  fontFamily: fontBody,
  fontWeight: 500,
  fontSize: "0.7rem",
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  padding: "0.9rem 2.2rem",
  borderRadius: 2,
};

export function PrimaryCta({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      className="lp-cta-primary"
      style={{ ...ctaBase, background: ACCENT, color: BG, border: `1px solid ${ACCENT}` }}
    >
      {children}
    </a>
  );
}

export function GhostCta({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      className="lp-cta-ghost"
      style={{
        ...ctaBase,
        background: "transparent",
        color: "#fff",
        border: "1px solid rgba(255,255,255,0.25)",
      }}
    >
      {children}
    </a>
  );
}

/* Small uppercase label used inside interface-style cards. */
export function MicroLabel({ children, color = MUTED }: { children: ReactNode; color?: string }) {
  return (
    <span
      style={{
        fontFamily: fontBody,
        fontSize: "0.62rem",
        letterSpacing: "0.16em",
        textTransform: "uppercase",
        color,
      }}
    >
      {children}
    </span>
  );
}
