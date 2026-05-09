import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getHuntWithStops } from '@/lib/actions'
import NfcStopCard from './Nfcstopcard'
import ShareBox from './Sharebox'

// ─── Metadata ─────────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: 'Your Hunt — Write the Tags',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Build the public URL for each stop.
// NEXT_PUBLIC_APP_URL must be set in .env.local, e.g. https://yourdomain.com
function stopUrl(huntId: string, stopId: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? ''
  return `${base}/hunt/${huntId}/stop/${stopId}`
}

// ─── Admin Page ───────────────────────────────────────────────────────────────

export default async function AdminPage({
  params,
}: {
  params: Promise<{ huntId: string }>
}) {
  const { huntId } = await params
  const hunt = await getHuntWithStops(huntId)
  if (!hunt) notFound()

  const regularStops = hunt.stops.filter((s) => !s.is_finale)
  const finaleStop   = hunt.stops.find((s)  =>  s.is_finale)
  const totalTags    = hunt.stops.length

  return (
    <>
      <main className="admin-page page-shell">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <header className="admin-header">
          <Link href="/" className="admin-back-link text-muted">
            ← Back to home
          </Link>

          <div className="admin-title-block animate-fade-up">
            <p className="eyebrow">Your hunt is ready</p>
            <h1 className="heading-display admin-heading">
              For {hunt.mother_name} 🌸
            </h1>
            <p className="text-muted admin-sub">
              From {hunt.created_by} · {totalTags} tag{totalTags !== 1 ? 's' : ''} to write
            </p>
          </div>
        </header>

        {/* ── Share box ──────────────────────────────────────────────────── */}
        <ShareBox huntId={hunt.id} motherName={hunt.mother_name} />

        {/* ── Instructions card ──────────────────────────────────────────── */}
        <div className="instructions-card card animate-fade-up" style={{ animationDelay: '0.1s' }}>
          <h2 className="instructions-title heading-ui">How to write the tags</h2>
          <ol className="instructions-list">
            <li>
              <span className="instruction-step">1</span>
              <span>Expand each stop below to see its tag URL.</span>
            </li>
            <li>
              <span className="instruction-step">2</span>
              <span>
                On <strong>Android Chrome</strong> — tap <em>"Tap to write tag"</em>{' '}
                then hold a blank NFC sticker to the back of your phone.
              </span>
            </li>
            <li>
              <span className="instruction-step">3</span>
              <span>
                On <strong>iPhone</strong> — copy the URL and paste it into the{' '}
                <a
                  href="https://apps.apple.com/app/nfc-tools/id1252962749"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="admin-link"
                >
                  NFC Tools app
                </a>
                , then write it to the sticker.
              </span>
            </li>
            <li>
              <span className="instruction-step">4</span>
              <span>
                Hide each sticker in its spot and tick it off the checklist.
              </span>
            </li>
          </ol>
        </div>

        <hr className="divider" />

        {/* ── Regular stops ──────────────────────────────────────────────── */}
        {regularStops.length > 0 && (
          <section className="admin-section">
            <h2 className="admin-section-heading eyebrow">Regular stops</h2>
            <div className="stops-stack">
              {regularStops.map((stop, i) => (
                <NfcStopCard
                  key={stop.id}
                  stop={stop}
                  stopUrl={stopUrl(hunt.id, stop.id)}
                  index={i}
                />
              ))}
            </div>
          </section>
        )}

        {/* ── Finale stop ────────────────────────────────────────────────── */}
        {finaleStop && (
          <section className="admin-section">
            <h2 className="admin-section-heading eyebrow" style={{ color: 'var(--deep)' }}>
              Finale stop
            </h2>
            <NfcStopCard
              stop={finaleStop}
              stopUrl={stopUrl(hunt.id, finaleStop.id)}
              index={regularStops.length}
            />
          </section>
        )}

        <hr className="divider" />

        {/* ── Save this page reminder ─────────────────────────────────────── */}
        <div className="save-reminder card animate-fade-up">
          <span className="save-reminder-icon">🔖</span>
          <div>
            <p className="save-reminder-title heading-ui">Bookmark this page</p>
            <p className="text-muted save-reminder-desc">
              This is the only way back to your tag URLs. Save this link or
              bookmark it now so you can re-write tags if needed.
            </p>
          </div>
        </div>

        {/* ── Preview link ───────────────────────────────────────────────── */}
        {hunt.stops[0] && (
          <div className="preview-cta animate-fade-up">
            <p className="text-muted preview-label">Want to see what she'll see?</p>
            <Link
              href={`/hunt/${hunt.id}/stop/${hunt.stops[0].id}`}
              className="btn btn-secondary"
              target="_blank"
              rel="noopener noreferrer"
            >
              Preview Stop 1 →
            </Link>
          </div>
        )}
      </main>

      {/* ── Page-scoped styles ───────────────────────────────────────────── */}
      <style>{`
        .admin-page {
          gap: var(--space-6);
          padding-top: var(--space-10);
        }

        /* Header */
        .admin-back-link {
          align-self: flex-start;
          font-size: 13px;
          font-weight: 500;
          transition: color var(--duration-fast) ease;
        }

        .admin-back-link:hover { color: var(--deep); }

        .admin-title-block {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        .admin-heading {
          font-size: clamp(30px, 8vw, 44px);
        }

        .admin-sub { font-size: 14px; }

        /* Instructions */
        .instructions-card {
          padding: var(--space-6);
          border: 1px solid var(--blush);
          background: linear-gradient(135deg, #fff8fa, var(--white));
        }

        .instructions-title {
          font-size: 15px;
          margin-bottom: var(--space-4);
        }

        .instructions-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }

        .instructions-list li {
          display: flex;
          gap: var(--space-3);
          align-items: flex-start;
          font-size: 14px;
          line-height: 1.6;
          color: var(--text-soft);
        }

        .instruction-step {
          flex-shrink: 0;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: var(--rose);
          color: white;
          font-size: 11px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 1px;
        }

        .admin-link {
          color: var(--deep);
          font-weight: 500;
          text-decoration: underline;
          text-underline-offset: 2px;
        }

        /* Sections */
        .admin-section {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }

        .admin-section-heading {
          padding-left: var(--space-1);
        }

        .stops-stack {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }

        /* Save reminder */
        .save-reminder {
          display: flex;
          gap: var(--space-4);
          align-items: flex-start;
          padding: var(--space-5) var(--space-6);
          border: 1.5px solid var(--sand-dark);
          background: var(--sand);
        }

        .save-reminder-icon {
          font-size: 24px;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .save-reminder-title {
          font-size: 14px;
          margin-bottom: var(--space-1);
        }

        .save-reminder-desc {
          font-size: 13px;
          line-height: 1.6;
        }

        /* Preview CTA */
        .preview-cta {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-4) 0;
        }

        .preview-label { font-size: 13px; }
      `}</style>
    </>
  )
}