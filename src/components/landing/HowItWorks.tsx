import { motion } from 'framer-motion';

const ACCENT = '#F5A623';
const ease = [0.25, 0, 0, 1] as const;

const steps: [string, string, string][] = [
  [
    'Connect your store',
    'Install OpenROAS on Shopify in a few clicks. No code, no data engineering.',
    '01',
  ],
  [
    'Tag your OpenAI Ads links',
    'Use OpenROAS links on your OpenAI Ads, and create test links to confirm tracking works before you scale spend.',
    '02',
  ],
  [
    'Track revenue and ROAS',
    'Watch orders get attributed back to the exact campaign, ad group, ad, and click — all inside a clean dashboard.',
    '03',
  ],
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease } },
};

export default function HowItWorks() {
  return (
    <section
      id="how"
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
          How It Works
        </motion.p>
        <motion.h2
          variants={item}
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 600,
            fontSize: 'clamp(2rem, 4vw, 3.5rem)',
            lineHeight: 1.05,
            letterSpacing: '-0.02em',
            marginBottom: '1.25rem',
            maxWidth: 760,
          }}
        >
          From ad click to attributed order.
        </motion.h2>
        <motion.p
          variants={item}
          style={{
            fontFamily: 'var(--font-inter)',
            fontWeight: 300,
            fontSize: '1.05rem',
            lineHeight: 1.6,
            color: '#D7DCE5',
            maxWidth: 520,
            marginBottom: 'clamp(2.5rem, 6vw, 4.5rem)',
          }}
        >
          OpenAI Ads can drive sales — proving it is the hard part. Here&apos;s how
          OpenROAS connects the dots.
        </motion.p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1px',
            background: 'rgba(245,166,35,0.10)',
            border: '1px solid rgba(245,166,35,0.10)',
          }}
        >
          {steps.map(([title, copy, num]) => (
            <motion.div
              key={num}
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
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  letterSpacing: '0.1em',
                  color: ACCENT,
                }}
              >
                {num}
              </span>
              <h3
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 500,
                  fontSize: '1.3rem',
                  color: '#FFFFFF',
                }}
              >
                {title}
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
                {copy}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
