'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Stop } from '@/types'

// ─── Types ────────────────────────────────────────────────────────────────────

type NfcSupport = 'detecting' | 'supported' | 'unsupported'
type WriteState = 'idle' | 'waiting' | 'success' | 'error'

// ─── QR code via free API (no dependency needed) ──────────────────────────────
function qrUrl(data: string) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(data)}`
}

// ─── Copy to clipboard ────────────────────────────────────────────────────────
async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

// ─── NFC Stop Card ────────────────────────────────────────────────────────────

export default function NfcStopCard({
  stop,
  stopUrl,
  index,
}: {
  stop:    Stop
  stopUrl: string
  index:   number
}) {
  const [nfcSupport, setNfcSupport] = useState<NfcSupport>('detecting')
  const [writeState, setWriteState] = useState<WriteState>('idle')
  const [writeError, setWriteError] = useState<string | null>(null)
  const [copied,     setCopied]     = useState(false)
  const [written,    setWritten]    = useState(false)
  const [showQr,     setShowQr]     = useState(false)
  const [expanded,   setExpanded]   = useState(false)

  // ── Detect NFC support on mount ───────────────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return

    const saved = localStorage.getItem(`nfc-written-${stop.id}`)
    if (saved === 'true') setWritten(true)

    setNfcSupport('NDEFReader' in window ? 'supported' : 'unsupported')
  }, [stop.id])

  // ── Write tag via Web NFC API ─────────────────────────────────────────────
  const handleWrite = useCallback(async () => {
    setWriteState('waiting')
    setWriteError(null)

    try {
      // @ts-ignore — NDEFReader not yet in TS DOM lib
      const ndef = new NDEFReader()
      await ndef.write({ records: [{ recordType: 'url', data: stopUrl }] })

      setWriteState('success')
      setWritten(true)
      localStorage.setItem(`nfc-written-${stop.id}`, 'true')
      setTimeout(() => setWriteState('idle'), 3000)

    } catch (err: any) {
      if (err?.name === 'AbortError' || err?.name === 'NotAllowedError') {
        setWriteState('idle')
      } else {
        setWriteState('error')
        setWriteError(err?.message ?? 'Could not write to tag. Try holding it closer.')
        setTimeout(() => { setWriteState('idle'); setWriteError(null) }, 4000)
      }
    }
  }, [stop.id, stopUrl])

  // ── Copy URL ──────────────────────────────────────────────────────────────
  const handleCopy = async () => {
    const ok = await copyText(stopUrl)
    if (ok) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // ── Mark written manually ─────────────────────────────────────────────────
  const toggleWritten = () => {
    const next = !written
    setWritten(next)
    localStorage.setItem(`nfc-written-${stop.id}`, String(next))
  }

  return (
    <>
      <div
        className={`nfc-card card ${written ? 'nfc-card--written' : ''} ${stop.is_finale ? 'nfc-card--finale' : ''}`}
        style={{ animationDelay: `${index * 0.07}s` }}
      >
        {/* ── Card header ──────────────────────────────────────────────── */}
        <div className="nfc-card-header">
          <div className="nfc-card-meta">
            <span className={`badge ${stop.is_finale ? 'badge-warm' : 'badge-rose'}`}>
              {stop.is_finale ? '🌸 Finale' : `Stop ${stop.stop_order}`}
            </span>
            {written && <span className="written-badge">✓ Written</span>}
          </div>
          <button
            className="expand-btn"
            onClick={() => setExpanded((v) => !v)}
            aria-label={expanded ? 'Collapse' : 'Expand'}
          >
            {expanded ? '▲' : '▼'}
          </button>
        </div>

        {/* ── Location hint ─────────────────────────────────────────────── */}
        <div className="nfc-card-body">
          <p className="nfc-location-hint">📍 {stop.location_hint}</p>
        </div>

        {/* ── Expanded: URL + actions ───────────────────────────────────── */}
        {expanded && (
          <div className="nfc-card-expanded animate-fade-up">

            {/* URL display */}
            <div className="url-box">
              <p className="label">Tag URL</p>
              <p className="url-text">{stopUrl}</p>
            </div>

            {/* Android: Web NFC write */}
            {nfcSupport === 'supported' && (
              <div className="nfc-write-section">
                <button
                  className={`btn nfc-write-btn ${
                    writeState === 'waiting' ? 'nfc-write-btn--waiting' :
                    writeState === 'success' ? 'nfc-write-btn--success' :
                    writeState === 'error'   ? 'nfc-write-btn--error'   : 'btn-primary'
                  }`}
                  onClick={handleWrite}
                  disabled={writeState === 'waiting'}
                >
                  {writeState === 'idle'    && <><span className="nfc-icon">📶</span> Tap to write tag</>}
                  {writeState === 'waiting' && <><span className="spinner" /> Hold tag to phone…</>}
                  {writeState === 'success' && <>✓ Tag written!</>}
                  {writeState === 'error'   && <>✕ Try again</>}
                </button>

                {writeState === 'waiting' && (
                  <p className="nfc-waiting-hint text-muted">
                    Hold the NFC sticker flat against the back of your phone.
                  </p>
                )}

                {writeError && <p className="error-message">{writeError}</p>}
              </div>
            )}

            {/* iPhone / unsupported browser */}
            {nfcSupport === 'unsupported' && (
              <div className="unsupported-section">
                <div className="unsupported-banner">
                  <span className="unsupported-icon">📱</span>
                  <div>
                    <p className="unsupported-title">Writing requires Android + Chrome</p>
                    <p className="text-muted unsupported-desc">
                      Copy the URL below and paste it into the{' '}
                      <a
                        href="https://apps.apple.com/app/nfc-tools/id1252962749"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="nfc-tools-link"
                      >
                        NFC Tools app
                      </a>
                      {' '}to write from iPhone.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Copy + QR (always shown) */}
            <div className="copy-row">
              <button
                className={`btn ${copied ? 'share-copy-btn--copied' : 'btn-secondary'}`}
                onClick={handleCopy}
              >
                {copied ? '✓ Copied!' : '⎘ Copy URL'}
              </button>
              <button
                className="btn btn-ghost"
                onClick={() => setShowQr((v) => !v)}
              >
                {showQr ? 'Hide QR' : '⬛ Show QR'}
              </button>
            </div>

            {showQr && (
              <div className="qr-section animate-fade-up">
                <p className="text-muted qr-hint">
                  Scan with NFC Tools or any QR reader to copy the URL.
                </p>
                <img
                  src={qrUrl(stopUrl)}
                  alt={`QR code for stop ${stop.stop_order}`}
                  className="qr-image"
                  width={180}
                  height={180}
                />
              </div>
            )}

            {/* Manual written toggle */}
            <button className="mark-written-btn" onClick={toggleWritten}>
              {written ? '✕ Mark as not written' : '✓ Mark as written'}
            </button>
          </div>
        )}
      </div>

      <style>{`
        .nfc-card {
          width: 100%;
          border: 1.5px solid var(--sand);
          transition: border-color var(--duration-normal) ease;
          animation: fadeUp var(--duration-slow) var(--ease-spring) both;
        }

        .nfc-card--written {
          border-color: var(--rose);
          background: linear-gradient(135deg, #fff9fa, var(--white));
        }

        .nfc-card--finale { border-color: var(--blush); }

        .nfc-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-4) var(--space-5);
          cursor: pointer;
        }

        .nfc-card-meta { display: flex; align-items: center; gap: var(--space-2); }

        .written-badge {
          font-size: 11px; font-weight: 600;
          color: var(--deep);
          background: #fff0f3;
          border: 1px solid var(--blush);
          border-radius: var(--radius-full);
          padding: 3px 10px;
        }

        .expand-btn {
          background: none;
          border: 1px solid var(--sand-dark);
          border-radius: var(--radius-sm);
          color: var(--muted);
          font-size: 11px;
          padding: 4px 8px;
          cursor: pointer;
          transition: background var(--duration-fast) ease;
        }
        .expand-btn:hover { background: var(--sand); }

        .nfc-card-body { padding: 0 var(--space-5) var(--space-4); }

        .nfc-location-hint { font-size: 14px; color: var(--text-soft); font-weight: 500; }

        .nfc-card-expanded {
          border-top: 1px solid var(--sand);
          padding: var(--space-5);
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .url-box {
          background: var(--sand);
          border-radius: var(--radius-md);
          padding: var(--space-3) var(--space-4);
        }
        .url-box .label { margin-bottom: var(--space-1); }
        .url-text { font-size: 12px; font-family: monospace; color: var(--text-soft); word-break: break-all; line-height: 1.6; }

        .nfc-write-btn {
          width: 100%; padding: 16px; font-size: 15px;
          display: flex; align-items: center; justify-content: center; gap: var(--space-2);
        }
        .nfc-write-btn--waiting { background: var(--sand); color: var(--muted); border: 1.5px solid var(--blush); }
        .nfc-write-btn--success { background: linear-gradient(135deg, #34c759, #28a745); color: white; border: none; box-shadow: 0 4px 16px rgba(52,199,89,0.35); }
        .nfc-write-btn--error   { background: linear-gradient(135deg, #ff6b6b, #c0392b); color: white; border: none; }

        .nfc-icon { font-size: 18px; }

        .nfc-waiting-hint { text-align: center; font-size: 12px; animation: fadeIn 0.4s ease; }

        .nfc-write-section { display: flex; flex-direction: column; gap: var(--space-2); }

        .unsupported-banner {
          display: flex; gap: var(--space-3); align-items: flex-start;
          background: var(--sand); border-radius: var(--radius-md); padding: var(--space-4);
        }
        .unsupported-icon  { font-size: 22px; flex-shrink: 0; margin-top: 2px; }
        .unsupported-title { font-weight: 500; font-size: 14px; margin-bottom: var(--space-1); }
        .unsupported-desc  { font-size: 13px; line-height: 1.55; }
        .nfc-tools-link    { color: var(--deep); font-weight: 500; text-decoration: underline; text-underline-offset: 2px; }

        .copy-row { display: flex; gap: var(--space-2); }
        .copy-row .btn { flex: 1; }

        .share-copy-btn--copied {
          background: var(--blush-light);
          border: 1.5px solid var(--rose);
          color: var(--deep);
          border-radius: var(--radius-full);
          padding: 14px var(--space-8);
          font-size: 14px;
          font-weight: 500;
        }

        .qr-section {
          display: flex; flex-direction: column; align-items: center; gap: var(--space-3);
          padding: var(--space-4);
          background: var(--white);
          border: 1px solid var(--blush);
          border-radius: var(--radius-md);
        }
        .qr-hint  { font-size: 12px; text-align: center; }
        .qr-image { border-radius: var(--radius-md); border: 1px solid var(--sand-dark); }

        .mark-written-btn {
          background: none; border: none;
          color: var(--muted); font-size: 12px; font-family: var(--font-body);
          cursor: pointer; padding: var(--space-1) 0;
          text-decoration: underline; text-underline-offset: 3px;
          align-self: flex-start;
          transition: color var(--duration-fast) ease;
        }
        .mark-written-btn:hover { color: var(--deep); }
      `}</style>
    </>
  )
}