'use client'

import { useState, useEffect } from 'react'
import type { HuntWithStops } from '@/types'

// ─── Envelope open animation ──────────────────────────────────────────────────
// The page opens like an envelope being unsealed — lid folds down,
// content rises up from inside.

function Envelope({ onOpen }: { onOpen: () => void }) {
  const [state, setState] = useState<'closed' | 'opening' | 'open'>('closed')

  useEffect(() => {
    const t1 = setTimeout(() => setState('opening'), 400)
    const t2 = setTimeout(() => setState('open'),    1400)
    const t3 = setTimeout(() => onOpen(),            1800)
    return () => [t1, t2, t3].forEach(clearTimeout)
  }, [onOpen])

  return (
    <div className={`envelope-wrap envelope--${state}`} aria-hidden="true">
      {/* Envelope body */}
      <div className="envelope-body">
        {/* Flap */}
        <div className="envelope-flap">
          <div className="envelope-flap-inner" />
        </div>
        {/* Seal */}
        <div className="envelope-seal">🌸</div>
      </div>
    </div>
  )
}

// ─── Hunt Welcome ─────────────────────────────────────────────────────────────

export default function HuntWelcome({ hunt }: { hunt: HuntWithStops }) {
  const [phase,        setPhase]        = useState(0)
  const [envelopeDone, setEnvelopeDone] = useState(false)

  const firstStop  = hunt.stops[0]
  const totalStops = hunt.stops.filter((s) => !s.is_finale).length

  // After envelope opens, stagger content in
  useEffect(() => {
    if (!envelopeDone) return
    const timers = [
      setTimeout(() => setPhase(1),  100),
      setTimeout(() => setPhase(2),  400),
      setTimeout(() => setPhase(3),  750),
      setTimeout(() => setPhase(4), 1100),
    ]
    return () => timers.forEach(clearTimeout)
  }, [envelopeDone])

  return (
    <>
      <div className="welcome-page page-shell">

        {/* ── Envelope intro ─────────────────────────────────────────────── */}
        {!envelopeDone && (
          <div className="envelope-stage">
            <Envelope onOpen={() => setEnvelopeDone(true)} />
            <p className="envelope-hint eyebrow">Something arrived for you…</p>
          </div>
        )}

        {/* ── Main content — fades in after envelope ─────────────────────── */}
        {envelopeDone && (
          <div className="welcome-content">

            {/* Header */}
            <header className={`welcome-header ${phase >= 1 ? 'phase-in' : ''}`}>
              <div className="welcome-flower" aria-hidden="true">
                <FlowerSVG />
              </div>
              <p className="eyebrow welcome-eyebrow">A special delivery for</p>
              <h1 className="heading-display welcome-name">
                {hunt.mother_name} 🌸
              </h1>
              <p className="welcome-from text-muted">From {hunt.created_by}</p>
            </header>

            {/* Letter card */}
            <div className={`welcome-letter card ${phase >= 2 ? 'phase-in' : ''}`}>
              <div className="welcome-letter-inner">
                <p className="letter-dear heading-display">
                  Dear {hunt.mother_name},
                </p>
                <p className="letter-body">
                  We've hidden {totalStops} little message{totalStops !== 1 ? 's' : ''} for
                  you around the house. Each one has something we want you to know.
                  Follow the clues from tag to tag — there's a surprise waiting at the end.
                </p>
                <p className="letter-sign text-muted">
                  With all our love, {hunt.created_by} ❤️
                </p>
              </div>
            </div>

            {/* First clue */}
            {firstStop && (
              <div className={`first-clue-wrap ${phase >= 3 ? 'phase-in' : ''}`}>
                <div className="first-clue card">
                  <p className="eyebrow first-clue-label">Your first clue 🗺️</p>
                  <p className="first-clue-hint">
                    {firstStop.location_hint}
                  </p>
                  <p className="first-clue-sub text-muted">
                    Find the tag, then tap it with your phone to read your first message.
                  </p>
                </div>
              </div>
            )}

            {/* CTA */}
            {firstStop && (
              <div className={`welcome-cta ${phase >= 4 ? 'phase-in' : ''}`}>
                {/* Fallback button — in case NFC doesn't work or she's on WiFi only */}
                <a
                  href={`/hunt/${hunt.id}/stop/${firstStop.id}`}
                  className="btn btn-primary welcome-start-btn"
                >
                  <span>I found it — open my first message</span>
                  <span className="start-arrow">→</span>
                </a>
                <p className="welcome-cta-hint text-muted">
                  Or just tap the tag with your phone 📱
                </p>
              </div>
            )}

          </div>
        )}
      </div>

      {/* ── Styles ───────────────────────────────────────────────────────── */}
      <style>{`

        /* Page */
        .welcome-page {
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          gap: var(--space-6);
          padding-top: 56px;
        }

        /* ── Envelope ── */
        .envelope-stage {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-4);
          min-height: 60vh;
          justify-content: center;
        }

        .envelope-hint {
          color: var(--muted);
          animation: fadeIn 0.6s ease 0.2s both;
        }

        .envelope-wrap {
          width: 200px;
          height: 140px;
          position: relative;
          animation: fadeUp 0.6s var(--ease-spring) both;
        }

        .envelope-body {
          width: 100%;
          height: 100%;
          background: linear-gradient(160deg, var(--cream), var(--sand));
          border: 2px solid var(--blush);
          border-radius: var(--radius-md);
          position: relative;
          overflow: visible;
          box-shadow: var(--shadow-card);
        }

        /* Flap */
        .envelope-flap {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 70px;
          transform-origin: top center;
          transition: transform 0.8s var(--ease-spring);
          z-index: 2;
        }

        .envelope--opening .envelope-flap,
        .envelope--open    .envelope-flap {
          transform: rotateX(180deg);
        }

        .envelope-flap-inner {
          width: 100%;
          height: 100%;
          background: linear-gradient(160deg, var(--blush-light), var(--sand));
          border: 2px solid var(--blush);
          border-bottom: none;
          border-radius: var(--radius-md) var(--radius-md) 0 0;
          clip-path: polygon(0 0, 100% 0, 50% 100%);
        }

        /* Seal */
        .envelope-seal {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 28px;
          z-index: 3;
          transition: transform 0.5s var(--ease-spring), opacity 0.5s ease;
        }

        .envelope--opening .envelope-seal,
        .envelope--open    .envelope-seal {
          transform: translate(-50%, -50%) scale(0);
          opacity: 0;
        }

        /* ── Content ── */
        .welcome-content {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-6);
        }

        /* Phase entrance shared */
        .phase-in {
          opacity: 1   !important;
          transform: none !important;
        }

        /* Header */
        .welcome-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-2);
          text-align: center;
          opacity: 0;
          transform: translateY(18px);
          transition:
            opacity   0.7s var(--ease-spring),
            transform 0.7s var(--ease-spring);
        }

        .welcome-flower {
          width: 60px;
          margin-bottom: var(--space-1);
        }

        .welcome-eyebrow { color: var(--muted); }

        .welcome-name {
          font-size: clamp(38px, 10vw, 56px);
        }

        .welcome-from { font-size: 14px; }

        /* Letter card */
        .welcome-letter {
          width: 100%;
          border: 1px solid var(--blush);
          background: linear-gradient(160deg, #fffaf8, var(--white));
          opacity: 0;
          transform: translateY(16px);
          transition:
            opacity   0.7s var(--ease-spring) 0.05s,
            transform 0.7s var(--ease-spring) 0.05s;
        }

        .welcome-letter-inner {
          padding: var(--space-6) var(--space-6) var(--space-5);
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
          position: relative;
        }

        /* Lined paper effect */
        .welcome-letter-inner::before {
          content: '';
          position: absolute;
          left: var(--space-6);
          right: var(--space-6);
          bottom: var(--space-5);
          height: 1px;
          background: var(--sand);
        }

        .letter-dear {
          font-size: clamp(22px, 5vw, 28px);
          color: var(--deep);
        }

        .letter-body {
          font-size: 15px;
          line-height: 1.75;
          color: var(--text-soft);
        }

        .letter-sign {
          font-size: 13px;
          font-style: italic;
        }

        /* First clue */
        .first-clue-wrap {
          width: 100%;
          opacity: 0;
          transform: translateY(14px);
          transition:
            opacity   0.6s var(--ease-spring) 0.05s,
            transform 0.6s var(--ease-spring) 0.05s;
        }

        .first-clue {
          padding: var(--space-5) var(--space-6);
          border: 1.5px solid var(--blush);
          background: linear-gradient(135deg, #fff5f7, var(--cream));
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }

        .first-clue-label { color: var(--rose); }

        .first-clue-hint {
          font-family: var(--font-display);
          font-size: clamp(20px, 5vw, 26px);
          font-style: italic;
          color: var(--text);
          line-height: 1.5;
        }

        .first-clue-sub {
          font-size: 13px;
          line-height: 1.6;
          padding-top: var(--space-2);
          border-top: 1px solid var(--sand);
        }

        /* CTA */
        .welcome-cta {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-3);
          width: 100%;
          padding-bottom: var(--space-8);
          opacity: 0;
          transform: translateY(12px);
          transition:
            opacity   0.6s var(--ease-spring) 0.05s,
            transform 0.6s var(--ease-spring) 0.05s;
        }

        .welcome-start-btn {
          width: 100%;
          font-size: 15px;
          padding: 16px var(--space-6);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-3);
        }

        .start-arrow {
          animation: nudgeRight 1.6s ease-in-out infinite;
        }

        .welcome-cta-hint {
          font-size: 12px;
        }
      `}</style>
    </>
  )
}

// ─── Decorative flower SVG (same as landing page) ─────────────────────────────
function FlowerSVG() {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
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