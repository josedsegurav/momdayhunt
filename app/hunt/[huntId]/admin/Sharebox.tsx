'use client'

import { useState } from 'react'

export default function ShareBox({
  huntId,
  motherName,
}: {
  huntId:     string
  motherName: string
}) {
  const [copied, setCopied] = useState(false)

  const base       = typeof window !== 'undefined' ? window.location.origin : ''
  const welcomeUrl = `${base}/hunt/${huntId}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(welcomeUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // Fallback: select the text in the input
      const el = document.getElementById('welcome-url-input') as HTMLInputElement
      el?.select()
    }
  }

  const handleNativeShare = async () => {
    if (!navigator.share) return
    await navigator.share({
      title: `A surprise for ${motherName} 🌸`,
      text:  `Happy Mother's Day — your hunt is waiting!`,
      url:   welcomeUrl,
    })
  }

  const canNativeShare = typeof navigator !== 'undefined' && 'share' in navigator

  return (
    <>
      <div className="share-box card">
        <div className="share-box-header">
          <span className="share-box-icon">🔗</span>
          <div>
            <p className="share-box-title heading-ui">Share this with {motherName}</p>
            <p className="text-muted share-box-desc">
              Send her this link to start the hunt. She'll see a welcome letter
              and her first clue.
            </p>
          </div>
        </div>

        {/* URL row */}
        <div className="share-url-row">
          <input
            id="welcome-url-input"
            className="input share-url-input"
            type="text"
            value={welcomeUrl}
            readOnly
            onFocus={(e) => e.target.select()}
          />
          <button
            className={`btn share-copy-btn ${copied ? 'share-copy-btn--copied' : 'btn-secondary'}`}
            onClick={handleCopy}
          >
            {copied ? '✓ Copied!' : '⎘ Copy'}
          </button>
        </div>

        {/* Native share (mobile) */}
        {canNativeShare && (
          <button
            className="btn btn-primary share-native-btn"
            onClick={handleNativeShare}
          >
            <span>Share via messages, WhatsApp…</span>
            <span>↑</span>
          </button>
        )}

        <p className="share-hint text-muted">
          💡 Send this the morning of — or wrap it in a card and let her scan a QR code.
        </p>
      </div>

      <style>{`
        .share-box {
          width: 100%;
          padding: var(--space-5) var(--space-6);
          border: 1.5px solid var(--blush);
          background: linear-gradient(135deg, #fff8fa, var(--white));
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .share-box-header {
          display: flex;
          gap: var(--space-3);
          align-items: flex-start;
        }

        .share-box-icon {
          font-size: 24px;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .share-box-title { font-size: 15px; margin-bottom: var(--space-1); }

        .share-box-desc { font-size: 13px; line-height: 1.55; }

        .share-url-row {
          display: flex;
          gap: var(--space-2);
        }

        .share-url-input {
          flex: 1;
          font-size: 12px;
          font-family: monospace;
          color: var(--text-soft);
          background: var(--sand);
          border-color: var(--sand-dark);
          min-width: 0;
        }

        .share-copy-btn {
          flex-shrink: 0;
          padding: 10px var(--space-4);
          font-size: 13px;
        }

        .share-copy-btn--copied {
          background: var(--blush-light);
          border: 1.5px solid var(--rose);
          color: var(--deep);
        }

        .share-native-btn {
          width: 100%;
          display: flex;
          justify-content: space-between;
          padding: 14px var(--space-5);
          font-size: 14px;
        }

        .share-hint {
          font-size: 12px;
          line-height: 1.55;
        }
      `}</style>
    </>
  )
}