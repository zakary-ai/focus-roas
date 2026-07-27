import { motion } from 'framer-motion';

const ACCENT = '#F5A623';
const ease = [0.25, 0, 0, 1] as const;

const points: [string, string][] = [
  ['Per-client attribution', 'Order-level revenue tracking for every Shopify store you manage.'],
  ['Reporting you can defend', 'Show exactly which campaigns produced sales — data, not estimates.'],
  ['Cleaner client reviews', 'Walk into every check-in with clear ROAS instead of screenshots.'],
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease } },
};

export default function AgencySection() {
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
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 'clamp(2.5rem, 6vw, 5rem)',
          alignItems: 'start',
        }}
      >
        <div>
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
            For Agencies
          </motion.p>
          <motion.h2
            variants={item}
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 600,
              fontSize: 'clamp(2rem, 4vw, 3.5rem)',
              lineHeight: 1.05,
              letterSpacing: '-0.02em',
              marginBottom: '1.5rem',
            }}
          >
            Prove performance to every client.
          </motion.h2>
          <motion.p
            variants={item}
            style={{
              fontFamily: 'var(--font-inter)',
              fontWeight: 300,
              fontSize: '1.05rem',
              lineHeight: 1.6,
              color: '#D7DCE5',
              maxWidth: 480,
            }}
          >
            Running OpenAI Ads for multiple Shopify stores? OpenROAS gives you clean,
            order-level attribution for each client — so you can show exactly which
            campaigns produced revenue, and back up your reporting with data instead
            of estimates.
          </motion.p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
          {points.map(([title, copy]) => (
            <motion.div
              key={title}
              variants={item}
              whileHover={{ x: 6, boxShadow: '0 24px 50px -12px rgba(0,0,0,0.6)' }}
              transition={{ duration: 0.3, ease }}
              style={{
                position: 'relative',
                background: '#0C1018',
                borderLeft: `2px solid ${ACCENT}`,
                padding: 'clamp(1.25rem, 2.5vw, 1.75rem)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.4rem',
              }}
            >
              <h3
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 500,
                  fontSize: '1.1rem',
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
