import { motion } from 'framer-motion';

const ACCENT = '#F5A623';
const ease = [0.25, 0, 0, 1] as const;

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease } },
};

export default function ClosingCTA() {
  return (
    <section
      style={{
        background: '#02080D',
        padding: 'clamp(6rem, 16vw, 12rem) 1.5rem',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse at center, rgba(245,166,35,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-80px' }}
        style={{
          position: 'relative',
          maxWidth: 760,
          margin: '0 auto',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <motion.p
          variants={item}
          style={{
            fontFamily: 'var(--font-inter)',
            fontSize: '0.65rem',
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            color: ACCENT,
            marginBottom: '1.5rem',
          }}
        >
          See What Works
        </motion.p>
        <motion.h2
          variants={item}
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 600,
            fontSize: 'clamp(2.2rem, 5vw, 4.5rem)',
            lineHeight: 1.05,
            letterSpacing: '-0.02em',
            marginBottom: '1.75rem',
          }}
        >
          See what your OpenAI Ads actually return.{' '}
          <span style={{ fontStyle: 'italic', fontWeight: 500, color: '#D7DCE5' }}>
            Down to the order.
          </span>
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
            marginBottom: '2.5rem',
          }}
        >
          Connect Shopify, tag your OpenAI Ads links, and watch revenue get
          attributed back to the exact ad that earned it.
        </motion.p>
        <motion.a
          variants={item}
          href="/auth"
          whileHover={{ scale: 1.04, backgroundColor: '#02080D', color: ACCENT }}
          transition={{ duration: 0.2, ease }}
          style={{
            display: 'inline-block',
            background: ACCENT,
            color: '#02080D',
            fontFamily: 'var(--font-inter)',
            fontWeight: 500,
            fontSize: '0.7rem',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            padding: '0.9rem 2.6rem',
            border: `1px solid ${ACCENT}`,
            borderRadius: 2,
            cursor: 'pointer',
          }}
        >
          Add to Shopify
        </motion.a>
      </motion.div>
    </section>
  );
}
