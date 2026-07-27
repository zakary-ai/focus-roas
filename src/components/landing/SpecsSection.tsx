import { motion } from 'framer-motion';

const ACCENT = '#F5A623';
const ease = [0.25, 0, 0, 1] as const;

const rows: [string, string][] = [
  ['Ad Source', 'OpenAI Ads'],
  ['Store Platform', 'Shopify'],
  ['Attribution Granularity', 'Campaign, ad group, ad, click'],
  ['Order Matching', 'OpenAI ad click → Shopify order'],
  ['Setup', 'Shopify install, no code'],
  ['Tracking Validation', 'Test links before you scale'],
  ['Dashboard', 'Revenue, orders, and ROAS'],
  ['Multi-Store', 'Agency-ready, per-client views'],
  ['Your Data', 'Stays with your Shopify store'],
  ['Built For', 'Shopify merchants running OpenAI Ads'],
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease } },
};

export default function SpecsSection() {
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
          The Platform
        </motion.p>
        <motion.h2
          variants={item}
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 600,
            fontSize: 'clamp(2rem, 4vw, 3.5rem)',
            lineHeight: 1.05,
            letterSpacing: '-0.02em',
            marginBottom: 'clamp(2.5rem, 6vw, 4rem)',
            maxWidth: 760,
          }}
        >
          Attribution, end to end.
        </motion.h2>

        <div style={{ maxWidth: 900 }}>
          {rows.map(([label, value]) => (
            <motion.div
              key={label}
              variants={item}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                gap: '2rem',
                padding: '1.15rem 0',
                borderBottom: '1px solid rgba(255,255,255,0.07)',
                flexWrap: 'wrap',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-inter)',
                  fontWeight: 500,
                  fontSize: '0.95rem',
                  color: ACCENT,
                  flex: '0 0 auto',
                }}
              >
                {label}
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-inter)',
                  fontWeight: 300,
                  fontSize: '0.95rem',
                  color: '#D7DCE5',
                  textAlign: 'right',
                }}
              >
                {value}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
