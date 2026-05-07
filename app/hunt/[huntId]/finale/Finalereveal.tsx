'use client'

import { useState, useEffect, useRef } from 'react'
import type { StopWithHunt } from '@/types'

// ─── Confetti ─────────────────────────────────────────────────────────────────
// Pure canvas confetti — no npm package.

type Particle = {
  x:       number
  y:       number
  vx:      number
  vy:      number
  size:    number
  color:   string
  opacity: number
  spin:    number
  spinV:   number
  shape:   'rect' | 'circle' | 'petal'
}

const COLORS = [
  '#f9c6d0', '#e8879a', '#fcd5ce',
  '#fde8ed', '#c9956a', '#b05070',
  '#ffffff', '#f8b4c8',
]

function makeParticle(canvasWidth: number): Particle {
  return {
    x:       Math.random() * canvasWidth,
    y:       -10 - Math.random() * 40,
    vx:      (Math.random() - 0.5) * 3,
    vy:      2.5 + Math.random() * 3.5,
    size:    5 + Math.random() * 7,
    color:   COLORS[Math.floor(Math.random() * COLORS.length)],
    opacity: 0.7 + Math.random() * 0.3,
    spin:    Math.random() * Math.PI * 2,
    spinV:   (Math.random() - 0.5) * 0.18,
    shape:   (['rect', 'circle', 'petal'] as const)[Math.floor(Math.random() * 3)],
  }
}

function drawParticle(ctx: CanvasRenderingContext2D, p: Particle) {
  ctx.save()
  ctx.globalAlpha = p.opacity
  ctx.fillStyle   = p.color
  ctx.translate(p.x, p.y)
  ctx.rotate(p.spin)

  if (p.shape === 'circle') {
    ctx.beginPath()
    ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2)
    ctx.fill()
  } else if (p.shape === 'petal') {
    ctx.beginPath()
    ctx.ellipse(0, 0, p.size / 3, p.size / 1.4, 0, 0, Math.PI * 2)
    ctx.fill()
  } else {
    ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2)
  }

  ctx.restore()
}

function ConfettiCanvas() {
  const canvasRef  = useRef<HTMLCanvasElement>(null)
  const particles  = useRef<Particle[]>([])
  const frameRef   = useRef<number>(0)
  const burstsDone = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Three bursts: immediate, 0.6s, 1.4s
    const burst = () => {
      const count = 90
      for (let i = 0; i < count; i++) {
        particles.current.push(makeParticle(canvas.width))
      }
      burstsDone.current++
    }

    burst()
    const t1 = setTimeout(burst, 600)
    const t2 = setTimeout(burst, 1400)

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particles.current = particles.current.filter((p) => {
        p.x      += p.vx
        p.y      += p.vy
        p.vy     += 0.06       // gravity
        p.vx     *= 0.995      // drag
        p.spin   += p.spinV
        p.opacity = Math.max(0, p.opacity - 0.003)
        drawParticle(ctx, p)
        return p.y < canvas.height + 20 && p.opacity > 0.01
      })

      frameRef.current = requestAnimationFrame(tick)
    }

    frameRef.current = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(frameRef.current)
      clearTimeout(t1)
      clearTimeout(t2)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset:    0,
        pointerEvents: 'none',
        zIndex:   10,
      }}
      aria-hidden="true"
    />
  )
}

// ─── Floating hearts ──────────────────────────────────────────────────────────

function FloatingHearts() {
  const items = ['🌸', '🤍', '💕', '🌸', '💗', '🤍', '🌸', '💕']
  return (
    <div className="float-hearts" aria-hidden="true">
      {items.map((s, i) => (
        <span
          key={i}
          className="float-heart"
          style={{
            left:            `${8 + i * 11.5}%`,
            animationDelay:  `${i * 0.35}s`,
            animationDuration: `${4 + (i % 3)}s`,
            fontSize:        `${18 + (i % 3) * 6}px`,
          }}
        >
          {s}
        </span>
      ))}
    </div>
  )
}

// ─── Finale Reveal ────────────────────────────────────────────────────────────

export default function FinaleReveal({ data }: { data: StopWithHunt }) {
  const { hunt, ...stop } = data

  const [phase, setPhase] = useState(0)
  // phase 0 = nothing
  // phase 1 = header in
  // phase 2 = media in
  // phase 3 = message in
  // phase 4 = footer in

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1),  200),
      setTimeout(() => setPhase(2),  700),
      setTimeout(() => setPhase(3), 1100),
      setTimeout(() => setPhase(4), 1700),
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <>
      <ConfettiCanvas />
      <FloatingHearts />

      <div className="finale-page page-shell">

        {/* ── Crown ──────────────────────────────────────────────────────── */}
        <div className={`finale-crown ${phase >= 1 ? 'phase-in' : ''}`}>
          🌸
        </div>

        {/* ── Headline ───────────────────────────────────────────────────── */}
        <header className={`finale-header ${phase >= 1 ? 'phase-in' : ''}`}>
          <p className="eyebrow finale-eyebrow">The final stop</p>
          <h1 className="heading-display finale-heading">
            Happy<br /><em>Mother's Day</em>
          </h1>
          <p className="finale-name-line">
            For <strong>{hunt.mother_name}</strong>, from {hunt.created_by}
          </p>
        </header>

        {/* ── Card ───────────────────────────────────────────────────────── */}
        <div className={`finale-card card ${phase >= 2 ? 'phase-in' : ''}`}>

          {/* Media */}
          {stop.media_url && (
            <div className="finale-media">
              {stop.media_type === 'video' ? (
                <video
                  src={stop.media_url}
                  className="finale-media-asset"
                  autoPlay
                  muted
                  loop
                  playsInline
                />
              ) : (
                <img
                  src={stop.media_url}
                  alt=""
                  className="finale-media-asset"
                />
              )}
              <div className="finale-media-fade" />
            </div>
          )}

          {/* Message */}
          <div className={`finale-message-wrap ${phase >= 3 ? 'phase-in' : ''}`}>
            <span className="badge badge-rose finale-badge">✨ A message for you</span>

            <blockquote className="finale-quote">
              "{stop.message}"
            </blockquote>

            <p className="finale-from text-muted">— {hunt.created_by}</p>
          </div>

          {/* Footer hearts */}
          <div className={`finale-card-footer ${phase >= 4 ? 'phase-in' : ''}`}>
            <div className="finale-hearts-row">
              {['🌸', '🤍', '🌸', '🤍', '🌸'].map((s, i) => (
                <span
                  key={i}
                  className="finale-heart-beat"
                  style={{ animationDelay: `${i * 0.2}s` }}
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── Closing line ───────────────────────────────────────────────── */}
        <p className={`finale-closing heading-display ${phase >= 4 ? 'phase-in' : ''}`}>
          We love you more than words.
        </p>
      </div>

      {/* ── Styles ───────────────────────────────────────────────────────── */}
      <style>{`

        /* Phase entrance helper */
        .phase-in {
          opacity: 1   !important;
          transform: none !important;
        }

        /* Floating hearts background */
        .float-hearts {
          position: fixed;
          bottom: -30px;
          left: 0;
          right: 0;
          pointer-events: none;
          z-index: 1;
        }

        .float-heart {
          position: absolute;
          animation: floatUp linear infinite;
          opacity: 0;
        }

        @keyframes floatUp {
          0%   { transform: translateY(0)    rotate(0deg);   opacity: 0;   }
          10%  { opacity: 0.7; }
          80%  { opacity: 0.5; }
          100% { transform: translateY(-100vh) rotate(40deg); opacity: 0; }
        }

        /* Page */
        .finale-page {
          align-items: center;
          gap: var(--space-6);
          padding-top: 52px;
          position: relative;
          z-index: 2;
        }

        /* Crown */
        .finale-crown {
          font-size: 52px;
          opacity: 0;
          transform: scale(0.5) rotate(-20deg);
          transition:
            opacity   0.6s var(--ease-spring),
            transform 0.6s var(--ease-spring);
          animation: spin-idle 6s ease-in-out infinite 1s;
        }

        @keyframes spin-idle {
          0%, 100% { transform: rotate(0deg) scale(1);   }
          30%      { transform: rotate(12deg) scale(1.08); }
          60%      { transform: rotate(-8deg) scale(1.04); }
        }

        /* Header */
        .finale-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-2);
          text-align: center;
          opacity: 0;
          transform: translateY(20px);
          transition:
            opacity   0.7s var(--ease-spring) 0.1s,
            transform 0.7s var(--ease-spring) 0.1s;
        }

        .finale-eyebrow { color: var(--rose); }

        .finale-heading {
          font-size: clamp(40px, 11vw, 64px);
          line-height: 1.05;
        }

        .finale-heading em {
          color: var(--deep);
        }

        .finale-name-line {
          font-size: 14px;
          color: var(--muted);
          margin-top: var(--space-1);
        }

        /* Card */
        .finale-card {
          width: 100%;
          background: linear-gradient(160deg, #fff5f7 0%, var(--white) 70%);
          border: 1px solid var(--blush);
          opacity: 0;
          transform: translateY(24px) scale(0.98);
          transition:
            opacity   0.7s var(--ease-spring) 0.15s,
            transform 0.7s var(--ease-spring) 0.15s;
        }

        /* Media */
        .finale-media {
          width: 100%;
          height: 260px;
          overflow: hidden;
          position: relative;
        }

        .finale-media-asset {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .finale-media-fade {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to bottom,
            transparent 35%,
            rgba(255, 245, 247, 0.75) 100%
          );
        }

        /* Message */
        .finale-message-wrap {
          padding: var(--space-6) var(--space-6) var(--space-4);
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
          opacity: 0;
          transform: translateY(12px);
          transition:
            opacity   0.6s ease 0.2s,
            transform 0.6s ease 0.2s;
        }

        .finale-badge { align-self: flex-start; }

        .finale-quote {
          font-family: var(--font-display);
          font-size: clamp(21px, 5.5vw, 28px);
          font-style: italic;
          font-weight: 400;
          line-height: 1.65;
          color: var(--text);
          quotes: none;
        }

        .finale-from { font-size: 13px; }

        /* Card footer */
        .finale-card-footer {
          padding: var(--space-4) var(--space-6) var(--space-6);
          border-top: 1px solid var(--blush);
          opacity: 0;
          transform: translateY(8px);
          transition:
            opacity   0.5s ease 0.1s,
            transform 0.5s ease 0.1s;
        }

        .finale-hearts-row {
          display: flex;
          justify-content: center;
          gap: var(--space-2);
        }

        .finale-heart-beat {
          font-size: 24px;
          display: inline-block;
          animation: heartbeat 1.4s ease-in-out infinite;
        }

        /* Closing line */
        .finale-closing {
          font-size: clamp(20px, 5vw, 26px);
          color: var(--deep);
          text-align: center;
          opacity: 0;
          transform: translateY(10px);
          transition:
            opacity   0.7s var(--ease-spring) 0.2s,
            transform 0.7s var(--ease-spring) 0.2s;
          padding: 0 var(--space-4) var(--space-8);
        }
      `}</style>
    </>
  )
}