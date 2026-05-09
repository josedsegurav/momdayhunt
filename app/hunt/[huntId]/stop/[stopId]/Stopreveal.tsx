'use client'

import { useState, useEffect } from 'react'
import type { StopWithHunt } from '@/types'

// ─── Media embed helper ───────────────────────────────────────────────────────
// Google Drive /preview URLs use an iframe; everything else uses img/video.

function isGDrive(url: string) { return url.includes('drive.google.com') }

function MediaEmbed({ url, mediaType, className }: { url: string; mediaType: string | null; className: string }) {
  if (isGDrive(url)) {
    return <iframe src={url} className={className} allow="autoplay" allowFullScreen title="media" style={{ border: 'none' }} />
  }
  if (mediaType === 'video') {
    return <video src={url} className={className} autoPlay muted loop playsInline />
  }
  return <img src={url} alt="" className={className} />
}


// ─── Progress Dots ────────────────────────────────────────────────────────────

function ProgressDots({ total, current }: { total: number; current: number }) {
  return (
    <div className="progress-dots">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={[
            'progress-dot',
            i < current       ? 'progress-dot--done'    : '',
            i === current - 1 ? 'progress-dot--current' : '',
          ].join(' ')}
        />
      ))}
    </div>
  )
}

// ─── Stop Reveal ──────────────────────────────────────────────────────────────

export default function StopReveal({ data }: { data: StopWithHunt }) {
  const { hunt, totalStops, ...stop } = data

  const [revealCard,    setRevealCard]    = useState(false)
  const [revealBadge,   setRevealBadge]   = useState(false)
  const [revealMedia,   setRevealMedia]   = useState(false)
  const [revealMessage, setRevealMessage] = useState(false)
  const [revealNext,    setRevealNext]    = useState(false)

  useEffect(() => {
    const timers = [
      setTimeout(() => setRevealCard(true),     100),
      setTimeout(() => setRevealBadge(true),    300),
      setTimeout(() => setRevealMedia(true),    500),
      setTimeout(() => setRevealMessage(true),  750),
      setTimeout(() => setRevealNext(true),    1200),
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <>
      <div className="reveal-page page-shell">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <header className="reveal-header">
          <p className="eyebrow reveal-to">A message for</p>
          <h1 className="heading-display reveal-name">{hunt.mother_name} 🌸</h1>
        </header>

        {/* ── Progress ───────────────────────────────────────────────────── */}
        <ProgressDots total={totalStops} current={stop.stop_order} />

        {/* ── Card ───────────────────────────────────────────────────────── */}
        <div className={`reveal-card card ${revealCard ? 'reveal-card--in' : ''} ${stop.is_finale ? 'reveal-card--finale' : ''}`}>

          {/* Location badge */}
          <div className={`reveal-location ${revealBadge ? 'reveal-layer--in' : ''}`}>
            <span>📍</span>
            <span>{stop.location_hint}</span>
          </div>

          {/* Media */}
          {stop.media_url && (
            <div className={`reveal-media ${revealMedia ? 'reveal-layer--in reveal-media--in' : ''}`}>
              <MediaEmbed url={stop.media_url} mediaType={stop.media_type} className="reveal-media-asset" />
              <div className="reveal-media-fade" />
            </div>
          )}

          {/* Message */}
          <div className={`reveal-message ${revealMessage ? 'reveal-layer--in reveal-message--in' : ''}`}>
            {stop.is_finale && (
              <span className="badge badge-rose reveal-finale-tag">✨ With all our love</span>
            )}

            <p className="reveal-stop-count eyebrow">
              {stop.is_finale
                ? `From ${hunt.created_by}`
                : `Stop ${stop.stop_order} of ${totalStops}`}
            </p>

            <blockquote className="reveal-quote">"{stop.message}"</blockquote>

            <p className="reveal-from text-muted">— {hunt.created_by}</p>
          </div>

          {/* Next hint / Finale end */}
          <div className={`reveal-footer ${revealNext ? 'reveal-layer--in reveal-footer--in' : ''}`}>
            {stop.is_finale ? (
              <FinaleFooter />
            ) : stop.next_hint ? (
              <NextHint hint={stop.next_hint} />
            ) : null}
          </div>
        </div>
      </div>

      <style>{`
        .reveal-page {
          align-items: center;
          gap: var(--space-5);
          padding-top: 48px;
        }

        .reveal-header {
          display: flex; flex-direction: column;
          align-items: center; gap: var(--space-1);
          text-align: center;
        }

        .reveal-to   { color: var(--muted); }
        .reveal-name { font-size: clamp(36px, 10vw, 52px); }

        /* Card entrance */
        .reveal-card {
          width: 100%;
          opacity: 0;
          transform: translateY(28px);
          transition:
            opacity   var(--duration-reveal) var(--ease-spring),
            transform var(--duration-reveal) var(--ease-spring);
        }
        .reveal-card--in      { opacity: 1; transform: translateY(0); }
        .reveal-card--finale  { background: linear-gradient(160deg, #fff5f7 0%, var(--white) 60%); }

        /* Shared layer entrance */
        .reveal-layer--in { opacity: 1 !important; transform: none !important; }

        /* Location badge */
        .reveal-location {
          display: flex; align-items: center; gap: var(--space-2);
          padding: var(--space-3) var(--space-5);
          background: linear-gradient(90deg, var(--sand), var(--cream));
          border-bottom: 1px solid var(--blush);
          font-size: 13px; color: var(--muted);
          opacity: 0;
          transition: opacity 0.5s ease 0.1s;
        }

        /* Media */
        .reveal-media {
          width: 100%; height: 240px;
          position: relative; overflow: hidden;
          opacity: 0; transform: scale(1.04);
          transition: opacity 0.7s ease 0.2s, transform 0.7s ease 0.2s;
        }
        .reveal-media--in { transform: scale(1) !important; }

        .reveal-media-asset  { width: 100%; height: 100%; object-fit: cover; display: block; }
        .reveal-media-fade   {
          position: absolute; inset: 0;
          background: linear-gradient(to bottom, transparent 40%, rgba(255,255,255,0.65) 100%);
        }

        /* Message */
        .reveal-message {
          padding: var(--space-6) var(--space-6) var(--space-4);
          display: flex; flex-direction: column; gap: var(--space-3);
          opacity: 0; transform: translateY(14px);
          transition: opacity 0.6s ease 0.3s, transform 0.6s ease 0.3s;
        }
        .reveal-message--in { transform: translateY(0) !important; }

        .reveal-finale-tag  { align-self: flex-start; }
        .reveal-stop-count  { color: var(--muted); }

        .reveal-quote {
          font-family: var(--font-display);
          font-size: clamp(19px, 5vw, 24px);
          font-style: italic; font-weight: 400;
          line-height: 1.65; color: var(--text);
          quotes: none;
        }

        .reveal-from { font-size: 13px; }

        /* Footer */
        .reveal-footer {
          padding: 0 var(--space-6) var(--space-6);
          opacity: 0; transform: translateY(10px);
          transition: opacity 0.5s ease 0.1s, transform 0.5s ease 0.1s;
        }
        .reveal-footer--in { transform: translateY(0) !important; }

        /* Next hint */
        .next-hint-box {
          position: relative;
          background: linear-gradient(135deg, #fff5f7, var(--cream));
          border: 1px solid var(--blush);
          border-radius: var(--radius-md);
          padding: var(--space-4) var(--space-10) var(--space-4) var(--space-4);
          display: flex; flex-direction: column; gap: var(--space-1);
        }

        .next-hint-label { color: var(--rose); }

        .next-hint-text {
          font-family: var(--font-display);
          font-size: 17px; font-style: italic;
          color: var(--text); line-height: 1.5;
        }

        .next-hint-arrow {
          position: absolute; right: var(--space-4); top: 50%;
          transform: translateY(-50%);
          font-size: 20px; color: var(--rose);
          animation: nudgeRight 1.6s ease-in-out infinite;
        }

        /* Finale footer */
        .finale-footer {
          display: flex; flex-direction: column; align-items: center; gap: var(--space-4);
          padding-top: var(--space-4);
          border-top: 1px solid var(--blush);
          text-align: center;
        }

        .finale-hearts { display: flex; gap: var(--space-1); justify-content: center; }

        .finale-heart {
          font-size: 22px; display: inline-block;
          animation: heartbeat 1.3s ease-in-out infinite;
        }

        .finale-message {
          font-family: var(--font-display);
          font-size: clamp(26px, 7vw, 34px);
          font-style: italic; color: var(--deep);
        }
      `}</style>
    </>
  )
}

// ─── Next Hint ────────────────────────────────────────────────────────────────

function NextHint({ hint }: { hint: string }) {
  return (
    <div className="next-hint-box">
      <p className="eyebrow next-hint-label">Next clue 🗺️</p>
      <p className="next-hint-text">{hint}</p>
      <span className="next-hint-arrow">→</span>
    </div>
  )
}

// ─── Finale Footer ────────────────────────────────────────────────────────────

function FinaleFooter() {
  return (
    <div className="finale-footer">
      <div className="finale-hearts">
        {['🌸', '🤍', '🌸', '🤍', '🌸'].map((s, i) => (
          <span
            key={i}
            className="finale-heart"
            style={{ animationDelay: `${i * 0.18}s` }}
          >
            {s}
          </span>
        ))}
      </div>
      <p className="finale-message">Happy Mother's Day</p>
    </div>
  )
}