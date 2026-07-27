/**
 * Pixel-crisp, fully responsive HTML/CSS recreation of the OpenROAS Command
 * Center. It crossfades in over the final stretch of the hero scrub so the
 * "screen resolves into focus" payoff is real, sharp UI at any resolution — not
 * the soft raster frame. Everything is sized in `em` off a single fluid
 * container font-size, so the whole dashboard scales to the viewer's device.
 *
 * `active` triggers the in-place entrance animations (chart draw, cards rising)
 * once the camera has effectively landed on the screen.
 */

type Kpi = {
  k: string;
  v: string;
  delta?: string;
  spark: 'up' | 'down' | 'flat';
};

const kpis: Kpi[] = [
  { k: 'Total Spend', v: '$48,041.18', delta: '+26%', spark: 'up' },
  { k: 'Revenue Attributed', v: '$224,164.1', delta: '+26%', spark: 'up' },
  { k: 'ROAS', v: '4.67×', spark: 'up' },
  { k: 'Orders', v: '1,162', delta: '+26%', spark: 'up' },
  { k: 'Clicks', v: '77,228', delta: '+26%', spark: 'up' },
  { k: 'Conversion Rate', v: '1.50%', spark: 'flat' },
  { k: 'Cost / Purchase', v: '$41.34', spark: 'down' },
  { k: 'Active Campaigns', v: '4', spark: 'flat' },
];

const nav: [string, string, boolean][] = [
  ['Command Center', 'M3 3h7v7H3zM14 3h7v4h-7zM14 10h7v11h-7zM3 13h7v8H3z', true],
  ['Campaign Builder', 'M13 2L3 14h7l-1 8 10-12h-7z', false],
  ['Attribution', 'M5 19l5-5 4 4 6-8M21 8V4h-4', false],
  ['Client Dashboards', 'M9 11a3 3 0 100-6 3 3 0 000 6zM2 20a7 7 0 0114 0M19 8v6M16 11h6', false],
  ['Benchmarks', 'M4 20V10M10 20V4M16 20v-7M22 20h-20', false],
  ['Shopify Connections', 'M9 15l6-6M11 6l1-1a4 4 0 016 6l-1 1M13 18l-1 1a4 4 0 01-6-6l1-1', false],
  ['Settings', 'M12 15a3 3 0 100-6 3 3 0 000 6zM19 12a7 7 0 00-.1-1l2-1.6-2-3.4-2.4 1a7 7 0 00-1.7-1L14.5 2h-4l-.3 2.6a7 7 0 00-1.7 1l-2.4-1-2 3.4L4 11a7 7 0 000 2l-2 1.6 2 3.4 2.4-1a7 7 0 001.7 1l.3 2.6h4l.3-2.6a7 7 0 001.7-1l2.4 1 2-3.4-2-1.6a7 7 0 00.1-1z', false],
];

// Sparkline path strings inside a 0..100 x 0..32 box.
const sparks: Record<Kpi['spark'], string> = {
  up: 'M0,26 L14,24 L28,25 L42,19 L56,16 L70,12 L84,9 L100,4',
  down: 'M0,8 L14,11 L28,9 L42,14 L56,13 L70,18 L84,17 L100,22',
  flat: 'M0,17 L14,14 L28,18 L42,15 L56,17 L70,14 L84,16 L100,15',
};

// 14-day Spend-vs-Revenue series in a 0..760 x 0..240 space.
const REV =
  'M10,196 L68,188 L126,176 L184,180 L242,160 L300,150 L358,156 L416,132 L474,120 L532,108 L590,96 L648,72 L706,60 L750,48';
const REV_AREA = `${REV} L750,232 L10,232 Z`;
const SPEND =
  'M10,210 L68,209 L126,208 L184,207 L242,206 L300,206 L358,205 L416,204 L474,203 L532,203 L590,202 L648,201 L706,200 L750,199';
const xLabels = ['05-25', '05-29', '06-02', '06-06', '06-10', '06-14', '06-18', '06-22'];

export default function DashboardScreen({ active }: { active: boolean }) {
  return (
    <div className={`dash-screen${active ? ' dash-in' : ''}`} aria-hidden>
      {/* ── Sidebar ─────────────────────────────────────────────── */}
      <aside className="dash-rail">
        <div className="dash-logo">
          <span className="dash-logo-mark">R</span>
          <span className="dash-logo-text">OpenROAS</span>
        </div>

        <div className="dash-store">
          <span className="dash-store-ic">▦</span>
          <span className="dash-store-nm">Demo Store</span>
          <span className="dash-store-ch">⇅</span>
        </div>

        <span className="dash-rail-label">Workspace</span>
        <nav className="dash-nav">
          {nav.map(([label, d, activeItem]) => (
            <span className={`dash-nav-i${activeItem ? ' on' : ''}`} key={label}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d={d} />
              </svg>
              {label}
            </span>
          ))}
        </nav>

        <div className="dash-rail-foot">
          <div className="dash-plan">
            <span>Plan</span>
            <span className="dash-badge">Agency</span>
          </div>
          <div className="dash-conn">
            <span>OpenAI Ads</span>
            <span className="dash-conn-ok">Connected</span>
          </div>
          <div className="dash-conn">
            <span>Shopify</span>
            <span className="dash-conn-ok">Connected</span>
          </div>
          <div className="dash-signout">↪ Sign out</div>
        </div>
      </aside>

      {/* ── Content ─────────────────────────────────────────────── */}
      <div className="dash-content">
        <header className="dash-topbar">
          <div className="dash-tb-title">
            <strong>Command Center</strong>
            <span>Demo Store</span>
          </div>
          <div className="dash-tb-right">
            <span className="dash-pill"><i className="dot" /> OpenAI Ads</span>
            <span className="dash-pill"><i className="dot" /> Shopify</span>
            <span className="dash-pill range">Last 30 days ▾</span>
            <span className="dash-cta">+ Create campaign</span>
            <span className="dash-avatar">D</span>
          </div>
        </header>

        <div className="dash-scroll">
          {/* Banner + AI insights */}
          <section className="dash-banner">
            <div className="dash-banner-main">
              <span className="dash-eyebrow">Demo Store · Last 30 days</span>
              <h1>Your OpenAI Ads command center</h1>
              <div className="dash-chips">
                <span className="chip ok">✓ Ads tracking live</span>
                <span className="chip ok">✓ Shopify linked</span>
                <span className="chip ok">✓ Revenue attribution on</span>
                <span className="chip">⟳ Synced 07:53 PM</span>
                <span className="chip">⚡ Last Shopify event Jun 23, 07:53 PM</span>
              </div>
            </div>
            <div className="dash-ai">
              <span className="dash-ai-tag">✦ Next recommended action</span>
              <strong>Review AI insights</strong>
              <p>Ask Claude which campaigns to scale and which to fix.</p>
              <span className="dash-ai-btn">Review AI insights →</span>
            </div>
          </section>

          {/* KPI grid */}
          <section className="dash-kpis">
            {kpis.map((m) => (
              <div className="dash-kpi" key={m.k}>
                <div className="dash-kpi-top">
                  <span className="dash-kpi-k">{m.k}</span>
                  {m.delta ? (
                    <span className="dash-kpi-d up">↑ {m.delta}</span>
                  ) : (
                    <span className="dash-kpi-d none">—</span>
                  )}
                </div>
                <span className="dash-kpi-v">{m.v}</span>
                <svg className="dash-kpi-spark" viewBox="0 0 100 32" preserveAspectRatio="none">
                  <path d={sparks[m.spark]} fill="none" stroke={m.spark === 'down' ? '#F5A623' : '#16F2E3'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                </svg>
              </div>
            ))}
          </section>

          {/* Charts */}
          <section className="dash-charts">
            <div className="dash-panel dash-panel-main">
              <div className="dash-panel-top">
                <strong>Spend vs Revenue</strong>
                <span className="dash-legend">
                  <i className="lg-rev" /> Revenue <i className="lg-spend" /> Spend
                </span>
              </div>
              <svg className="dash-bigchart" viewBox="0 0 760 240" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#16F2E3" stopOpacity="0.22" />
                    <stop offset="100%" stopColor="#16F2E3" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {[60, 120, 180].map((y) => (
                  <line key={y} x1="0" y1={y} x2="760" y2={y} className="dash-grid" />
                ))}
                <path d={REV_AREA} fill="url(#revFill)" className="dash-area" />
                <path d={SPEND} fill="none" stroke="#F5A623" strokeWidth="2.5" strokeLinecap="round" vectorEffect="non-scaling-stroke" className="dash-line dash-line-spend" />
                <path d={REV} fill="none" stroke="#16F2E3" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" className="dash-line dash-line-rev" />
              </svg>
              <div className="dash-xaxis">
                {xLabels.map((l) => (
                  <span key={l}>{l}</span>
                ))}
              </div>
            </div>

            <div className="dash-side-col">
              <div className="dash-panel">
                <div className="dash-panel-top">
                  <strong>ROAS trend</strong>
                </div>
                <svg className="dash-roas" viewBox="0 0 220 70" preserveAspectRatio="none">
                  <path d="M6,40 L40,38 L74,41 L108,37 L142,39 L176,36 L214,38" fill="none" stroke="#5B8DEF" strokeWidth="2" strokeLinecap="round" vectorEffect="non-scaling-stroke" className="dash-line dash-line-roas" />
                </svg>
              </div>
              <div className="dash-panel">
                <div className="dash-panel-top">
                  <strong>Conversion events</strong>
                </div>
                <div className="dash-bars">
                  {Array.from({ length: 30 }).map((_, i) => (
                    <i key={i} style={{ height: `${22 + Math.round((i / 29) * 70 + (i % 3) * 4)}%` }} />
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <div className="dash-glare" />
      <div className="dash-vignette" />
    </div>
  );
}
