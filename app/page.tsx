import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mother\'s Day Hunt',
  description: 'Hide NFC tags around the house. Watch her discover a love letter in every room.',
}

// ─── How it works steps ────────────────────────────────────────────────────────
const STEPS = [
  {
    number: '01',
    icon: '✍️',
    title: 'Write your messages',
    body: 'Add stops to the hunt — a heartfelt note, a photo or video, and a clue for where to look next.',
  },
  {
    number: '02',
    icon: '🏷️',
    title: 'Write the NFC tags',
    body: 'Tap each sticker with your phone to encode it. Then hide them in meaningful spots around the house.',
  },
  {
    number: '03',
    icon: '🌸',
    title: 'She follows the trail',
    body: 'Every tap opens a beautiful message just for her. The last tag leads to your grand finale.',
  },
]

// ─── Testimonial quotes ───────────────────────────────────────────────────────
const QUOTES = [
  { text: 'I cried at every single tag.', from: 'A mom in Seattle' },
  { text: 'The kids were so proud of themselves.', from: 'A dad in Austin' },
  { text: 'Best Mother\'s Day we\'ve ever had.', from: 'A family in London' },
]

export default function LandingPage() {
  return (
    <main className="landing">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero-eyebrow">
          <span className="badge badge-rose">Mother's Day 2025</span>
        </div>

        <h1 className="hero-heading">
          Give her a trail<br />
          <em>of love.</em>
        </h1>

        <p className="hero-sub">
          Hide NFC stickers around the house. Each one she taps
          opens a message, a memory, or a moment — made just for her.
        </p>

        <div className="hero-actions">
          <Link href="/create" className="btn btn-primary hero-cta">
            Build your Hunt
            <span className="cta-arrow">→</span>
          </Link>
          <p className="hero-hint">Free · No account needed · Ready in 10 minutes</p>
        </div>

        {/* Decorative flower */}
        <div className="hero-flower" aria-hidden="true">
          <FlowerSVG />
        </div>
      </section>

      <hr className="divider" />

      {/* ── How it works ──────────────────────────────────────────────────── */}
      <section className="section how-section">
        <p className="eyebrow section-eyebrow">How it works</p>
        <h2 className="heading-display section-heading">Three steps to magic</h2>

        <div className="steps">
          {STEPS.map((step, i) => (
            <div
              key={step.number}
              className="step-card card"
              style={{ animationDelay: `${i * 0.12}s` }}
            >
              <div className="step-top">
                <span className="step-number eyebrow">{step.number}</span>
                <span className="step-icon">{step.icon}</span>
              </div>
              <h3 className="step-title heading-ui">{step.title}</h3>
              <p className="step-body text-muted">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      <hr className="divider" />

      {/* ── What you'll need ──────────────────────────────────────────────── */}
      <section className="section needs-section">
        <p className="eyebrow section-eyebrow">What you'll need</p>
        <h2 className="heading-display section-heading">Just a few stickers</h2>

        <div className="needs-card card">
          <div className="need-item">
            <span className="need-icon">📦</span>
            <div>
              <p className="need-title">NFC stickers</p>
              <p className="need-desc text-muted">
                NTAG213 or NTAG215 stickers — a pack of 10 costs around $5 on Amazon.
                They look like small round labels and stick to almost anything.
              </p>
            </div>
          </div>
          <div className="needs-divider" />
          <div className="need-item">
            <span className="need-icon">📱</span>
            <div>
              <p className="need-title">An Android phone</p>
              <p className="need-desc text-muted">
                To write the tags you'll need Chrome on Android. Mom can tap and read
                on any phone — iPhone included.
              </p>
            </div>
          </div>
          <div className="needs-divider" />
          <div className="need-item">
            <span className="need-icon">💛</span>
            <div>
              <p className="need-title">A few kind words</p>
              <p className="need-desc text-muted">
                The most important ingredient. We'll guide you through writing each
                message — one stop at a time.
              </p>
            </div>
          </div>
        </div>
      </section>

      <hr className="divider" />

      {/* ── Quotes ────────────────────────────────────────────────────────── */}
      <section className="section quotes-section">
        <p className="eyebrow section-eyebrow">From families like yours</p>
        <div className="quotes">
          {QUOTES.map((q, i) => (
            <div key={i} className="quote-card">
              <p className="quote-text">"{q.text}"</p>
              <p className="quote-from text-muted">— {q.from}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Bottom CTA ────────────────────────────────────────────────────── */}
      <section className="section bottom-cta">
        <div className="bottom-cta-inner card">
          <p className="bottom-cta-pre eyebrow">Ready?</p>
          <h2 className="heading-display bottom-cta-heading">
            She deserves<br /><em>every stop.</em>
          </h2>
          <Link href="/create" className="btn btn-primary">
            Start building →
          </Link>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="footer">
        <p className="text-muted">Made with 🌸 for every mom who deserves more than flowers.</p>
      </footer>

      {/* ── Styles ────────────────────────────────────────────────────────── */}
      <style>{`

        /* Layout */
        .landing {
          position: relative;
          z-index: 2;
          max-width: 520px;
          margin: 0 auto;
          padding: 0 var(--space-4) var(--space-16);
        }

        /* ── Hero ── */
        .hero {
          padding: 72px 0 var(--space-10);
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          position: relative;
        }

        .hero-eyebrow {
          margin-bottom: var(--space-5);
          animation: fadeUp 0.6s var(--ease-spring) both;
        }

        .hero-heading {
          font-family: var(--font-display);
          font-size: clamp(48px, 12vw, 72px);
          font-weight: 600;
          line-height: 1.08;
          color: var(--text);
          margin-bottom: var(--space-5);
          animation: fadeUp 0.7s var(--ease-spring) 0.08s both;
        }

        .hero-heading em {
          color: var(--deep);
          font-style: italic;
        }

        .hero-sub {
          font-size: 16px;
          line-height: 1.7;
          color: var(--text-soft);
          max-width: 360px;
          margin-bottom: var(--space-8);
          animation: fadeUp 0.7s var(--ease-spring) 0.16s both;
        }

        .hero-actions {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-3);
          animation: fadeUp 0.7s var(--ease-spring) 0.24s both;
        }

        .hero-cta {
          font-size: 16px;
          padding: 16px 36px;
        }

        .cta-arrow {
          display: inline-block;
          animation: nudgeRight 1.6s ease-in-out infinite;
        }

        .hero-hint {
          font-size: 12px;
          color: var(--muted);
          letter-spacing: 0.04em;
        }

        /* Decorative flower */
        .hero-flower {
          position: absolute;
          top: 12px;
          right: -8px;
          width: 80px;
          opacity: 0.18;
          animation: fadeIn 1s ease 0.4s both;
          pointer-events: none;
        }

        @media (max-width: 400px) {
          .hero-flower { display: none; }
        }

        /* ── Sections ── */
        .section {
          padding: var(--space-6) 0;
        }

        .section-eyebrow {
          text-align: center;
          margin-bottom: var(--space-2);
          display: block;
        }

        .section-heading {
          text-align: center;
          font-size: clamp(28px, 7vw, 38px);
          margin-bottom: var(--space-8);
        }

        /* ── Steps ── */
        .steps {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .step-card {
          padding: var(--space-6);
          animation: fadeUp 0.6s var(--ease-spring) both;
        }

        .step-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: var(--space-3);
        }

        .step-number {
          color: var(--rose);
        }

        .step-icon {
          font-size: 24px;
        }

        .step-title {
          font-size: 16px;
          margin-bottom: var(--space-2);
        }

        .step-body {
          line-height: 1.65;
        }

        /* ── Needs ── */
        .needs-card {
          padding: var(--space-2) var(--space-6);
        }

        .need-item {
          display: flex;
          gap: var(--space-4);
          align-items: flex-start;
          padding: var(--space-5) 0;
        }

        .need-icon {
          font-size: 24px;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .need-title {
          font-weight: 500;
          font-size: 15px;
          color: var(--text);
          margin-bottom: var(--space-1);
        }

        .need-desc {
          line-height: 1.65;
        }

        .needs-divider {
          height: 1px;
          background: var(--sand);
          margin: 0 0;
        }

        /* ── Quotes ── */
        .quotes {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .quote-card {
          padding: var(--space-5) var(--space-6);
          background: linear-gradient(135deg, var(--blush-light), var(--cream));
          border: 1px solid var(--blush);
          border-radius: var(--radius-lg);
          border-left: 3px solid var(--rose);
        }

        .quote-text {
          font-family: var(--font-display);
          font-size: 20px;
          font-style: italic;
          color: var(--text);
          line-height: 1.5;
          margin-bottom: var(--space-2);
        }

        /* ── Bottom CTA ── */
        .bottom-cta-inner {
          padding: var(--space-10) var(--space-8);
          text-align: center;
          background: linear-gradient(160deg, #fff5f7 0%, var(--white) 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-5);
        }

        .bottom-cta-pre {
          color: var(--rose);
        }

        .bottom-cta-heading {
          font-size: clamp(32px, 8vw, 46px);
        }

        /* ── Footer ── */
        .footer {
          text-align: center;
          padding: var(--space-8) 0 var(--space-4);
        }
      `}</style>
    </main>
  )
}

// ─── Decorative flower SVG ────────────────────────────────────────────────────
function FlowerSVG() {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* 6 petals rotated around center */}
      {[0, 60, 120, 180, 240, 300].map((deg) => (
        <ellipse
          key={deg}
          cx="50" cy="25" rx="10" ry="22"
          fill="#e8879a"
          transform={`rotate(${deg} 50 50)`}
        />
      ))}
      <circle cx="50" cy="50" r="12" fill="#fcd5ce" />
      <circle cx="50" cy="50" r="6"  fill="#f9c6d0" />
    </svg>
  )
}