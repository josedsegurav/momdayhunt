import type { Metadata, Viewport } from 'next'
import './globals.css'

// ─── Metadata ──────────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: {
    template: '%s · Mother\'s Day Hunt',
    default: 'Mother\'s Day Hunt',
  },
  description: 'A heartfelt NFC scavenger hunt made with love.',
  // Prevent search engines from indexing hunt pages — they're personal.
  robots: { index: false, follow: false },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // Prevents zoom on input focus on iOS
  maximumScale: 1,
  userScalable: false,
  themeColor: '#fdf6f0',
}

// ─── Falling Petals (rendered server-side, animated via CSS) ──────────────────
// 16 petals with staggered delays and slight colour/size variation.
// Purely decorative — hidden from screen readers via aria-hidden.

function FallingPetals() {
  const petals = Array.from({ length: 16 }, (_, i) => {
    const colors = ['#f9c6d0', '#fcd5ce', '#f8b4c8', '#fde8ed', '#f0c0d0']
    return {
      id: i,
      left:     `${4 + ((i * 6.2) % 92)}%`,
      delay:    `${((i * 0.65) % 7).toFixed(2)}s`,
      duration: `${(7 + (i * 0.45) % 6).toFixed(2)}s`,
      size:     16 + (i * 2.7) % 22,
      opacity:  (0.18 + (i * 0.04) % 0.38).toFixed(2),
      color:    colors[i % colors.length],
      rotate:   (i * 41) % 360,
    }
  })

  return (
    <div className="petals-bg" aria-hidden="true">
      {petals.map((p) => (
        <div
          key={p.id}
          className="petal"
          style={{
            left:            p.left,
            animationDelay:  p.delay,
            animationDuration: p.duration,
            width:  `${p.size}px`,
            height: `${p.size}px`,
            color:   p.color,
            opacity: p.opacity,
            transform: `rotate(${p.rotate}deg)`,
          }}
        >
          {/* Ellipse petal shape */}
          <svg viewBox="0 0 40 60" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="20" cy="30" rx="12" ry="28" fill="currentColor" />
          </svg>
        </div>
      ))}
    </div>
  )
}

// ─── Root Layout ───────────────────────────────────────────────────────────────
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <FallingPetals />
        {children}
      </body>
    </html>
  )
}