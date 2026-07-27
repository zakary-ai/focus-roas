import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { motion, useMotionValue, useMotionValueEvent, useTransform } from 'framer-motion';
import { FRAME_COUNT } from './frameConfig';
import DashboardScreen from './DashboardScreen';

const ACCENT = '#F5A623';
const CYAN = '#16F2E3';
const BG = '#02080D';
const ease = [0.16, 1, 0.3, 1] as const;

// The push-in finishes centering the laptop by this scroll fraction; the dashboard
// powers on right after, fully resolving by ~0.8 so only a short hold remains
// before the section releases into the content below.
const FRAME_END = 0.72;

function framePath(i: number) {
  // 1-indexed, 4-digit zero-padded: frame_0001.jpg
  return `/frames/frame_${String(i + 1).padStart(4, '0')}.jpg`;
}

export default function ScrollHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Scroll progress (0..1) as a motion value so the hero copy can fade out.
  const progress = useMotionValue(0);
  // Copy holds, then fades out between 0.24 and 0.62 so it never blocks the dashboard.
  const heroOpacity = useTransform(progress, [0, 0.24, 0.62], [1, 1, 0]);
  // The instant the copy clears, the entire laptop/beach background dissolves and
  // the crisp HTML dashboard powers on in its place — floating on the near-black
  // backdrop, no laptop frame, ringed by the rotating sunset glow. Reveal finishes
  // by ~0.8 so the remaining scroll quickly hands off to the content below.
  const canvasOpacity = useTransform(progress, [0.56, 0.74], [1, 0]);
  const dashOpacity = useTransform(progress, [0.6, 0.8], [0, 1]);
  const [dashActive, setDashActive] = useState(false);
  // Trigger the in-place entrance animations as the dashboard begins to appear.
  useMotionValueEvent(progress, 'change', (p) => setDashActive(p >= 0.6));

  // The laptop background is gone by the time the dashboard shows, so center it
  // in the viewport and scale to fit (16:9), keeping a margin so the glow has
  // room to breathe. Below 900px it goes full-bleed (inset:0) for phones.
  const [dashStyle, setDashStyle] = useState<CSSProperties>({ inset: 0 });
  useEffect(() => {
    const AR = 16 / 9; // dashboard aspect ratio
    const compute = () => {
      const cw = window.innerWidth;
      const ch = window.innerHeight;
      if (cw <= 900) {
        setDashStyle({ inset: 0 });
        return;
      }
      const maxW = cw * 0.88;
      const maxH = ch * 0.82;
      let w = maxW;
      let h = w / AR;
      if (h > maxH) {
        h = maxH;
        w = h * AR;
      }
      setDashStyle({
        left: Math.round((cw - w) / 2),
        top: Math.round((ch - h) / 2),
        width: Math.round(w),
        height: Math.round(h),
      });
    };
    compute();
    window.addEventListener('resize', compute);
    return () => window.removeEventListener('resize', compute);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // The hero must always open on frame 0 (the beach). Stop the browser from
    // restoring a prior scroll position on reload, which would otherwise flash a
    // late dashboard frame before snapping back to the top.
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

    const images: HTMLImageElement[] = new Array(FRAME_COUNT);
    let loadedCount = 0;
    let currentIdx = -1; // frame actually painted to the canvas
    let desiredIdx = 0; // frame the current scroll position wants
    let rafId = 0;

    // Cover-fit draw: scale the frame to fill the whole viewport, centered, with
    // a center-crop on the overflowing axis — full-bleed, no letterbox bars. The
    // subject (laptop) stays centered in the source video, so the crop never cuts
    // it off. Fill the near-black background first so no edge ever shows through.
    // Returns false (leaving the previous frame on screen) when the requested
    // image hasn't decoded yet, so scrubbing into a not-yet-loaded frame never
    // flashes to black. Only marks currentIdx once a frame is actually painted.
    const render = (idx: number): boolean => {
      const img = images[idx];
      if (!img || !img.complete || img.naturalWidth === 0) return false;
      const cw = canvas.clientWidth;
      const ch = canvas.clientHeight;
      const iw = img.naturalWidth;
      const ih = img.naturalHeight;
      const scale = Math.max(cw / iw, ch / ih);
      const dw = iw * scale;
      const dh = ih * scale;
      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, cw, ch);
      ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
      currentIdx = idx;
      return true;
    };

    const sizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cw = canvas.clientWidth;
      const ch = canvas.clientHeight;
      canvas.width = Math.round(cw * dpr);
      canvas.height = Math.round(ch * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    sizeCanvas();
    // Paint the background immediately so the first paint is never transparent.
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);

    // Preload every frame. Repaint whenever the frame the scroll currently wants
    // finishes decoding — covers frame 0 on first load and any frame scrubbed to
    // before its image was ready.
    for (let i = 0; i < FRAME_COUNT; i++) {
      const img = new Image();
      img.onload = () => {
        loadedCount++;
        if (i === desiredIdx && i !== currentIdx) render(i);
      };
      img.onerror = () => {
        loadedCount++;
      };
      img.src = framePath(i);
      images[i] = img;
    }

    // rAF loop — no scroll listener. Map scroll position to a frame index.
    const tick = () => {
      const top = container.getBoundingClientRect().top;
      const scrollable = container.offsetHeight - window.innerHeight;
      const p = scrollable > 0 ? Math.max(0, Math.min(1, -top / scrollable)) : 0;
      progress.set(p);
      // Map scroll to frames over [0, FRAME_END]; hold the last frame past that.
      const fp = Math.min(p / FRAME_END, 1);
      const target = Math.round(fp * (FRAME_COUNT - 1));
      desiredIdx = target;
      if (target !== currentIdx) render(target);
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    const onResize = () => {
      sizeCanvas();
      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
      render(currentIdx >= 0 ? currentIdx : desiredIdx);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', onResize);
    };
  }, [progress]);

  return (
    <div ref={containerRef} style={{ height: '200vh', position: 'relative' }}>
      <div
        style={{
          position: 'sticky',
          top: 0,
          width: '100vw',
          height: '100vh',
          overflow: 'hidden',
          background: BG,
        }}
      >
        <motion.canvas
          ref={canvasRef}
          style={{ display: 'block', width: '100%', height: '100%', opacity: canvasOpacity }}
        />

        {/* Sunset glow halo — sits behind the panel and slowly orbits its
            colors counterclockwise (see .dash-glow in globals.css). */}
        <motion.div
          className="dash-glow"
          style={{
            position: 'absolute',
            ...dashStyle,
            opacity: dashOpacity,
            pointerEvents: 'none',
          }}
        />

        {/* Crisp HTML dashboard — powers on as the copy clears and the laptop
            background dissolves, floating centered on the near-black backdrop,
            ringed by the rotating sunset glow above. */}
        <motion.div
          className="dash-frame"
          style={{
            position: 'absolute',
            ...dashStyle,
            containerType: 'size',
            opacity: dashOpacity,
            borderRadius: 8,
            overflow: 'hidden',
            pointerEvents: 'none',
          }}
        >
          <DashboardScreen active={dashActive} />
        </motion.div>

        {/* Gradient + copy overlay */}
        <motion.div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            opacity: heroOpacity,
            background:
              'linear-gradient(to top, rgba(2,8,13,0.92) 0%, rgba(2,8,13,0.45) 45%, transparent 100%)',
            pointerEvents: 'none',
          }}
        >
          {/* Tasteful cyan/orange glow anchored behind the CTA area */}
          <div
            style={{
              position: 'absolute',
              left: 'clamp(-4rem, 2vw, 4rem)',
              bottom: 'clamp(2rem, 8vw, 7rem)',
              width: 'min(70vw, 640px)',
              height: 'min(40vh, 360px)',
              background:
                'radial-gradient(60% 60% at 30% 70%, rgba(22,242,227,0.16) 0%, transparent 70%), radial-gradient(55% 55% at 55% 60%, rgba(245,166,35,0.18) 0%, transparent 72%)',
              filter: 'blur(40px)',
              pointerEvents: 'none',
            }}
          />
          <motion.div
            initial="hidden"
            animate="show"
            variants={{
              hidden: {},
              show: { transition: { delayChildren: 0.8, staggerChildren: 0.12 } },
            }}
            style={{
              padding: 'clamp(2.5rem, 7vw, 6rem) clamp(1.5rem, 6vw, 7rem) clamp(4rem, 10vw, 8rem)',
              maxWidth: 760,
            }}
          >
            <motion.p
              variants={{
                hidden: { opacity: 0, y: 16 },
                show: { opacity: 1, y: 0, transition: { duration: 0.8, ease } },
              }}
              style={{
                fontFamily: 'var(--font-inter)',
                fontSize: '0.65rem',
                letterSpacing: '0.25em',
                textTransform: 'uppercase',
                color: CYAN,
                marginBottom: '1.25rem',
              }}
            >
              OpenAI Ads Attribution for Shopify
            </motion.p>
            <motion.h1
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0, transition: { duration: 0.9, ease } },
              }}
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 600,
                fontSize: 'clamp(2.4rem, 6vw, 5.5rem)',
                lineHeight: 1.02,
                letterSpacing: '-0.02em',
                marginBottom: '1.5rem',
              }}
            >
              See which OpenAI Ads drive Shopify sales.
            </motion.h1>
            <motion.p
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0, transition: { duration: 0.9, ease } },
              }}
              style={{
                fontFamily: 'var(--font-inter)',
                fontWeight: 300,
                fontSize: '1.05rem',
                lineHeight: 1.6,
                color: '#D7DCE5',
                maxWidth: 480,
                marginBottom: '2.25rem',
              }}
            >
              OpenROAS connects your OpenAI ad clicks to real Shopify orders — so you
              can attribute revenue down to the campaign, ad group, ad, and click.
            </motion.p>
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0, transition: { duration: 0.9, ease } },
              }}
              style={{ display: 'flex', gap: '0.9rem', flexWrap: 'wrap' }}
            >
              <a
                href="/auth"
                style={{
                  display: 'inline-block',
                  background: ACCENT,
                  color: BG,
                  fontFamily: 'var(--font-inter)',
                  fontWeight: 500,
                  fontSize: '0.7rem',
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  padding: '0.9rem 2.6rem',
                  borderRadius: 2,
                  pointerEvents: 'auto',
                }}
              >
                Add to Shopify
              </a>
              <a
                href="#how"
                style={{
                  display: 'inline-block',
                  background: 'transparent',
                  color: '#fff',
                  fontFamily: 'var(--font-inter)',
                  fontWeight: 500,
                  fontSize: '0.7rem',
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  padding: '0.9rem 2.2rem',
                  borderRadius: 2,
                  border: '1px solid rgba(255,255,255,0.25)',
                  pointerEvents: 'auto',
                }}
              >
                See how it works
              </a>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
