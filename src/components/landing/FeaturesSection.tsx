import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

const ACCENT = '#F5A623';

const ease = [0.25, 0, 0, 1] as const;

type Feature = {
  icon: ReactNode;
  label: string;
  copy: string;
};

const features: Feature[] = [
  {
    label: 'Revenue Attribution',
    copy: 'Match Shopify orders to the OpenAI ad click that drove them — not estimates, actual orders.',
    icon: (
      <>
        <path d="M8 12h8M12 8v8" />
        <circle cx="12" cy="12" r="9" />
      </>
    ),
  },
  {
    label: 'Full-Funnel Breakdown',
    copy: 'See performance by campaign, ad group, ad, and individual click.',
    icon: (
      <>
        <path d="M3 17l5-5 4 4 8-9" />
        <path d="M21 7v5h-5" />
      </>
    ),
  },
  {
    label: 'Test Links',
    copy: 'Generate and verify tracking links so you know your data is accurate before spending more.',
    icon: (
      <>
        <path d="M9 15l6-6" />
        <path d="M11 6l1-1a4 4 0 0 1 6 6l-1 1" />
        <path d="M13 18l-1 1a4 4 0 0 1-6-6l1-1" />
      </>
    ),
  },
  {
    label: 'Merchant-Friendly Dashboard',
    copy: 'ROAS, orders, and revenue in plain language — no spreadsheets required.',
    icon: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18M9 21V9" />
      </>
    ),
  },
  {
    label: 'Better Budget Decisions',
    copy: 'Identify what is converting and where spend is being wasted, so you can fund the winners.',
    icon: (
      <>
        <path d="M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6z" />
        <path d="M9 12l2 2 4-4" />
      </>
    ),
  },
  {
    label: 'Built for Shopify',
    copy: 'Made for Shopify merchants running OpenAI Ads, with attribution that lives where your orders do.',
    icon: (
      <>
        <path d="M3 21h18" />
        <path d="M6 21V9l6-5 6 5v12" />
        <path d="M10 21v-6h4v6" />
      </>
    ),
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease } },
};

export default function FeaturesSection() {
  return (
    <section
      style={{
        background: '#02080D',
        padding: 'clamp(5rem, 12vw, 9rem) clamp(1.5rem, 6vw, 7rem)',
        maxWidth: 1400,
        margin: '0 auto',
      }}
    >
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-80px' }}
      >
        <motion.p
          variants={item}
          style={{
            fontFamily: 'var(--font-inter)',
            fontSize: '0.65rem',
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            color: ACCENT,
            marginBottom: '1.25rem',
          }}
        >
          From Click To Order
        </motion.p>
        <motion.h2
          variants={item}
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 600,
            fontSize: 'clamp(2rem, 4vw, 3.5rem)',
            lineHeight: 1.05,
            letterSpacing: '-0.02em',
            marginBottom: 'clamp(2.5rem, 6vw, 4.5rem)',
            maxWidth: 720,
          }}
        >
          Know what every click returns.
        </motion.h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1px',
            background: 'rgba(245,166,35,0.10)',
            border: '1px solid rgba(245,166,35,0.10)',
          }}
        >
          {features.map((f) => (
            <motion.article
              key={f.label}
              variants={item}
              whileHover={{ y: -6, boxShadow: '0 24px 50px -12px rgba(0,0,0,0.6)' }}
              transition={{ duration: 0.3, ease }}
              style={{
                position: 'relative',
                background: '#0C1018',
                padding: 'clamp(1.75rem, 3vw, 2.5rem)',
                borderTop: '1px solid rgba(245,166,35,0.18)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                minHeight: 220,
              }}
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke={ACCENT}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {f.icon}
              </svg>
              <h3
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 500,
                  fontSize: '1.2rem',
                  color: '#FFFFFF',
                }}
              >
                {f.label}
              </h3>
              <p
                style={{
                  fontFamily: 'var(--font-inter)',
                  fontWeight: 300,
                  fontSize: '0.95rem',
                  lineHeight: 1.55,
                  color: '#D7DCE5',
                }}
              >
                {f.copy}
              </p>
            </motion.article>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
