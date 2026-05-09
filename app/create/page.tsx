'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createHunt } from '@/lib/actions'
import type { CreateHuntInput, CreateStopInput, MediaType } from '@/types'

// ─── Google Drive URL helpers ─────────────────────────────────────────────────
// Converts any Google Drive sharing URL into an embeddable /preview URL.
// Non-Drive URLs are returned unchanged.

function toEmbedUrl(url: string): string {
  if (!url) return ''
  // Match /file/d/{id}/view, /file/d/{id}/edit, or just /file/d/{id}
  const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)
  if (match) return `https://drive.google.com/file/d/${match[1]}/preview`
  return url
}

function isGoogleDriveUrl(url: string): boolean {
  return url.includes('drive.google.com')
}

// Detect media type from URL — Google Drive files use iframe regardless,
// but for direct URLs we can sniff the extension.
function detectMediaType(url: string): MediaType {
  const lower = url.toLowerCase()
  if (lower.match(/\.(mp4|webm|mov|avi|mkv)(\?|$)/)) return 'video'
  return 'image'
}

// ─── Media Preview ────────────────────────────────────────────────────────────

function MediaPreview({ url }: { url: string }) {
  if (!url) return null
  const embedUrl = toEmbedUrl(url)
  const isDrive  = isGoogleDriveUrl(url)

  if (isDrive) {
    return (
      <iframe
        src={embedUrl}
        className="media-preview-frame"
        allow="autoplay"
        allowFullScreen
        title="Media preview"
      />
    )
  }

  const type = detectMediaType(url)
  if (type === 'video') {
    return <video src={url} className="media-preview-asset" controls />
  }
  return (
    <img
      src={url}
      alt="Preview"
      className="media-preview-asset"
      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
    />
  )
}

// ─── Types ────────────────────────────────────────────────────────────────────

type StopDraft = {
  stop_order:    number
  location_hint: string
  message:       string
  media_url:     string          // direct URL or Google Drive share link
  media_type:    MediaType | null
  next_hint:     string
  is_finale:     boolean
}

type HuntDraft = {
  mother_name: string
  created_by:  string
}

type WizardStep = 1 | 2 | 3

// ─── Helpers ──────────────────────────────────────────────────────────────────

function emptyStop(stop_order: number): StopDraft {
  return {
    stop_order,
    location_hint: '',
    message:       '',
    media_url:     '',
    media_type:    null,
    next_hint:     '',
    is_finale:     false,
  }
}

function validateStop(stop: StopDraft): string | null {
  if (!stop.location_hint.trim()) return 'Add a location hint so she knows where to look.'
  if (!stop.message.trim())       return 'Write a message for this stop.'
  if (!stop.is_finale && !stop.next_hint.trim())
    return 'Add a clue for where to find the next tag.'
  return null
}

function validateHunt(draft: HuntDraft): string | null {
  if (!draft.mother_name.trim()) return "Add the name you'd like to call her."
  if (!draft.created_by.trim())  return 'Add who this hunt is from.'
  return null
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function WizardProgress({ step }: { step: WizardStep }) {
  const labels = ['About her', 'Your stops', 'Review']
  return (
    <div className="wiz-progress">
      {labels.map((label, i) => {
        const n       = (i + 1) as WizardStep
        const done    = step > n
        const current = step === n
        return (
          <div
            key={label}
            className={`wiz-step ${done ? 'wiz-step--done' : ''} ${current ? 'wiz-step--current' : ''}`}
          >
            <div className="wiz-step-circle">{done ? '✓' : n}</div>
            <span className="wiz-step-label">{label}</span>
            {i < labels.length - 1 && (
              <div className={`wiz-step-line ${done ? 'wiz-step-line--done' : ''}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Step 1 ────────────────────────────────────────────────────────────────────

function Step1({
  draft, onChange, onNext,
}: {
  draft:    HuntDraft
  onChange: (field: keyof HuntDraft, value: string) => void
  onNext:   () => void
}) {
  const [error, setError] = useState<string | null>(null)

  const handleNext = () => {
    const err = validateHunt(draft)
    if (err) { setError(err); return }
    setError(null)
    onNext()
  }

  return (
    <div className="wiz-panel animate-fade-up">
      <div className="wiz-panel-header">
        <h2 className="heading-display wiz-title">Who is this for?</h2>
        <p className="text-muted">We'll personalise every stop with her name.</p>
      </div>
      <div className="wiz-fields">
        <div className="field">
          <label className="label" htmlFor="mother_name">Her name</label>
          <input
            id="mother_name" className="input" type="text"
            placeholder="e.g. Mom, Mama, Nana…"
            value={draft.mother_name}
            onChange={(e) => onChange('mother_name', e.target.value)}
            autoComplete="off"
          />
        </div>
        <div className="field">
          <label className="label" htmlFor="created_by">From</label>
          <input
            id="created_by" className="input" type="text"
            placeholder="e.g. Sofia & Luca, The whole family…"
            value={draft.created_by}
            onChange={(e) => onChange('created_by', e.target.value)}
            autoComplete="off"
          />
        </div>
        {error && <p className="error-message">{error}</p>}
      </div>
      <div className="wiz-actions">
        <button className="btn btn-primary" onClick={handleNext}>
          Next — Add your stops →
        </button>
      </div>
    </div>
  )
}

// ── Stop Form ─────────────────────────────────────────────────────────────────

function StopForm({
  stop, stopNumber, onChange, onSave, onCancel, isEditing,
}: {
  stop:       StopDraft
  stopNumber: number
  onChange:   (field: keyof StopDraft, value: StopDraft[keyof StopDraft]) => void
  onSave:     (label: 'add' | 'finale') => void
  onCancel:   (() => void) | null
  isEditing:  boolean
}) {
  const [error, setError] = useState<string | null>(null)

  const handleMediaUrl = (url: string) => {
    onChange('media_url',  url)
    onChange('media_type', url ? detectMediaType(url) : null)
  }

  const handleSave = (label: 'add' | 'finale') => {
    const draft = label === 'finale' ? { ...stop, is_finale: true } : stop
    const err   = validateStop(draft)
    if (err) { setError(err); return }
    setError(null)
    if (label === 'finale') onChange('is_finale', true)
    onSave(label)
  }

  return (
    <div className="stop-form card animate-fade-up">
      <div className="stop-form-header">
        <span className="badge badge-rose">Stop {stopNumber}</span>
        {isEditing && <span className="eyebrow" style={{ color: 'var(--warm)' }}>Editing</span>}
      </div>

      <div className="wiz-fields">
        <div className="field">
          <label className="label">Where will you hide this tag?</label>
          <input
            className="input" type="text"
            placeholder="e.g. Near your favourite mug ☕"
            value={stop.location_hint}
            onChange={(e) => onChange('location_hint', e.target.value)}
          />
          <p className="field-hint">She'll see this when she taps the tag.</p>
        </div>

        <div className="field">
          <label className="label">Your message</label>
          <textarea
            className="textarea" rows={4}
            placeholder="Write something from the heart…"
            value={stop.message}
            onChange={(e) => onChange('message', e.target.value)}
          />
        </div>

        {/* Media URL input */}
        <div className="field">
          <label className="label">
            Photo or video URL <span className="optional-label">optional</span>
          </label>
          <input
            className="input" type="url"
            placeholder="Paste a Google Drive share link or image URL"
            value={stop.media_url}
            onChange={(e) => handleMediaUrl(e.target.value)}
          />
          <p className="field-hint">
            Google Drive: share the file → copy link → paste here.
            Make sure sharing is set to <strong>Anyone with the link</strong>.
          </p>

          {/* Live preview */}
          {stop.media_url && (
            <div className="media-preview-wrap">
              <MediaPreview url={stop.media_url} />
              <button
                className="media-clear btn btn-ghost"
                onClick={() => handleMediaUrl('')}
              >
                ✕ Remove
              </button>
            </div>
          )}
        </div>

        {!stop.is_finale && (
          <div className="field">
            <label className="label">Clue for the next tag</label>
            <input
              className="input" type="text"
              placeholder="e.g. 🌿 Find the next one near your bedtime books"
              value={stop.next_hint}
              onChange={(e) => onChange('next_hint', e.target.value)}
            />
            <p className="field-hint">She'll see this after reading your message.</p>
          </div>
        )}

        {error && <p className="error-message">{error}</p>}
      </div>

      <div className="stop-form-actions">
        {onCancel && <button className="btn btn-ghost" onClick={onCancel}>Cancel</button>}
        <button className="btn btn-secondary" onClick={() => handleSave('add')}>
          + Save & add another
        </button>
        <button className="btn btn-primary" onClick={() => handleSave('finale')}>
          🌸 Make this the finale
        </button>
      </div>
    </div>
  )
}

// ── Stop Summary Card ─────────────────────────────────────────────────────────

function StopSummaryCard({
  stop, onEdit, onRemove,
}: {
  stop: StopDraft; onEdit: () => void; onRemove: () => void
}) {
  return (
    <div className={`stop-summary card ${stop.is_finale ? 'stop-summary--finale' : ''}`}>
      <div className="stop-summary-body">
        <div className="stop-summary-top">
          <span className="badge badge-rose">
            {stop.is_finale ? '🌸 Finale' : `Stop ${stop.stop_order}`}
          </span>
          <div className="stop-summary-controls">
            <button className="summary-ctrl-btn" onClick={onEdit}>✏️</button>
            <button className="summary-ctrl-btn" onClick={onRemove}>🗑️</button>
          </div>
        </div>
        <p className="stop-summary-hint">{stop.location_hint}</p>
        <p className="stop-summary-msg">
          "{stop.message.slice(0, 80)}{stop.message.length > 80 ? '…' : ''}"
        </p>
        {stop.media_url && (
          <p className="stop-summary-media-badge">
            {isGoogleDriveUrl(stop.media_url) ? '📁 Google Drive media' : '🔗 Media linked'}
          </p>
        )}
      </div>
    </div>
  )
}

// ── Step 2 ────────────────────────────────────────────────────────────────────

function Step2({
  stops, onAddStop, onUpdateStop, onRemoveStop, onNext, onBack,
}: {
  stops:        StopDraft[]
  onAddStop:    (s: StopDraft) => void
  onUpdateStop: (i: number, s: StopDraft) => void
  onRemoveStop: (i: number) => void
  onNext:       () => void
  onBack:       () => void
}) {
  const [current,     setCurrent]     = useState<StopDraft>(emptyStop(stops.length + 1))
  const [editingIdx,  setEditingIdx]  = useState<number | null>(null)
  const [showingForm, setShowingForm] = useState(true)
  const hasFinale = stops.some((s) => s.is_finale)

  const handleSave = (label: 'add' | 'finale') => {
    const finalStop = label === 'finale'
      ? { ...current, is_finale: true, next_hint: '' }
      : current
    if (editingIdx !== null) {
      onUpdateStop(editingIdx, finalStop)
      setEditingIdx(null)
    } else {
      onAddStop(finalStop)
    }
    setCurrent(emptyStop(stops.length + 2))
    setShowingForm(label !== 'finale')
  }

  const handleEdit = (idx: number) => {
    setCurrent(stops[idx]); setEditingIdx(idx); setShowingForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCancelEdit = () => {
    setCurrent(emptyStop(stops.length + 1)); setEditingIdx(null); setShowingForm(false)
  }

  const handleFieldChange = (
    field: keyof StopDraft,
    value: StopDraft[keyof StopDraft]
  ) => setCurrent((prev) => ({ ...prev, [field]: value }))

  const canProceed = stops.length >= 1 && hasFinale

  return (
    <div className="step2-wrap animate-fade-up">
      <div className="wiz-panel-header">
        <h2 className="heading-display wiz-title">Your stops</h2>
        <p className="text-muted">
          Add as many stops as you like. The <strong>finale stop</strong> is the last one.
        </p>
      </div>
      {stops.length > 0 && (
        <div className="stops-list">
          {stops.map((s, i) => (
            <StopSummaryCard
              key={i} stop={s}
              onEdit={() => handleEdit(i)}
              onRemove={() => onRemoveStop(i)}
            />
          ))}
        </div>
      )}
      {!showingForm && !hasFinale && (
        <button
          className="btn btn-secondary add-more-btn"
          onClick={() => {
            setCurrent(emptyStop(stops.length + 1)); setEditingIdx(null); setShowingForm(true)
          }}
        >
          + Add another stop
        </button>
      )}
      {showingForm && !hasFinale && (
        <StopForm
          stop={current}
          stopNumber={editingIdx !== null ? stops[editingIdx].stop_order : stops.length + 1}
          onChange={handleFieldChange}
          onSave={handleSave}
          onCancel={editingIdx !== null ? handleCancelEdit : null}
          isEditing={editingIdx !== null}
        />
      )}
      <div className="wiz-actions">
        <button className="btn btn-ghost" onClick={onBack}>← Back</button>
        <button className="btn btn-primary" onClick={onNext} disabled={!canProceed}>
          Review your hunt →
        </button>
      </div>
      {!canProceed && stops.length > 0 && (
        <p className="text-muted" style={{ textAlign: 'center', marginTop: 'var(--space-3)' }}>
          Mark one stop as the 🌸 finale to continue.
        </p>
      )}
    </div>
  )
}

// ── Step 3 ────────────────────────────────────────────────────────────────────

function Step3({
  hunt, stops, onSubmit, onBack, submitting, error,
}: {
  hunt:       HuntDraft
  stops:      StopDraft[]
  onSubmit:   () => void
  onBack:     () => void
  submitting: boolean
  error:      string | null
}) {
  return (
    <div className="wiz-panel animate-fade-up">
      <div className="wiz-panel-header">
        <h2 className="heading-display wiz-title">Looking good 🌸</h2>
        <p className="text-muted">Review your hunt before we save it.</p>
      </div>
      <div className="review-hunt card">
        <p className="eyebrow" style={{ marginBottom: 'var(--space-2)' }}>For</p>
        <p className="review-name">{hunt.mother_name}</p>
        <p className="text-muted">From {hunt.created_by}</p>
      </div>
      <div className="review-stops">
        {stops.map((stop, i) => (
          <div key={i} className={`review-stop card ${stop.is_finale ? 'review-stop--finale' : ''}`}>
            <div className="review-stop-top">
              <span className="badge badge-rose">
                {stop.is_finale ? '🌸 Finale' : `Stop ${stop.stop_order}`}
              </span>
              {stop.media_url && <span className="badge badge-warm">🔗 Has media</span>}
            </div>
            <p className="review-stop-hint">{stop.location_hint}</p>
            <p className="review-stop-msg">
              "{stop.message.slice(0, 100)}{stop.message.length > 100 ? '…' : ''}"
            </p>
            {stop.next_hint && (
              <p className="review-stop-next text-muted">→ {stop.next_hint}</p>
            )}
          </div>
        ))}
      </div>
      {error && <p className="error-message">{error}</p>}
      <div className="wiz-actions">
        <button className="btn btn-ghost" onClick={onBack} disabled={submitting}>← Edit stops</button>
        <button className="btn btn-primary" onClick={onSubmit} disabled={submitting}>
          {submitting
            ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Saving…</>
            : 'Save & get my NFC links →'}
        </button>
      </div>
    </div>
  )
}

// ─── Main Wizard ──────────────────────────────────────────────────────────────

export default function CreatePage() {
  const router = useRouter()

  const [step,       setStep]       = useState<WizardStep>(1)
  const [huntDraft,  setHuntDraft]  = useState<HuntDraft>({ mother_name: '', created_by: '' })
  const [stops,      setStops]      = useState<StopDraft[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error,      setError]      = useState<string | null>(null)

  const handleHuntChange = (field: keyof HuntDraft, value: string) =>
    setHuntDraft((prev) => ({ ...prev, [field]: value }))

  const handleAddStop    = (stop: StopDraft) => setStops((prev) => [...prev, stop])
  const handleUpdateStop = (index: number, stop: StopDraft) =>
    setStops((prev) => prev.map((s, i) => (i === index ? stop : s)))
  const handleRemoveStop = (index: number) =>
    setStops((prev) =>
      prev.filter((_, i) => i !== index).map((s, i) => ({ ...s, stop_order: i + 1 }))
    )

  const handleSubmit = useCallback(async () => {
    setSubmitting(true)
    setError(null)

    try {
      const stopsInput: CreateStopInput[] = stops.map((stop) => ({
        stop_order:    stop.stop_order,
        location_hint: stop.location_hint,
        message:       stop.message,
        // Store the embed URL for Google Drive, original URL otherwise
        media_url:     stop.media_url ? toEmbedUrl(stop.media_url) : null,
        media_type:    stop.media_url ? (stop.media_type ?? 'image') : null,
        next_hint:     stop.next_hint || null,
        is_finale:     stop.is_finale,
      }))

      const huntId = await createHunt({
        mother_name: huntDraft.mother_name,
        created_by:  huntDraft.created_by,
        stops:       stopsInput,
      })

      router.push(`/hunt/${huntId}/admin`)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }, [stops, huntDraft, router])

  return (
    <>
      <main className="create-page page-shell">
        <header className="create-header">
          <p className="eyebrow">Mother's Day Hunt</p>
          <h1 className="heading-display create-main-heading">Build your Hunt</h1>
        </header>

        <WizardProgress step={step} />

        {step === 1 && (
          <Step1 draft={huntDraft} onChange={handleHuntChange} onNext={() => setStep(2)} />
        )}
        {step === 2 && (
          <Step2
            stops={stops}
            onAddStop={handleAddStop}
            onUpdateStop={handleUpdateStop}
            onRemoveStop={handleRemoveStop}
            onNext={() => setStep(3)}
            onBack={() => setStep(1)}
          />
        )}
        {step === 3 && (
          <Step3
            hunt={huntDraft} stops={stops}
            onSubmit={handleSubmit} onBack={() => setStep(2)}
            submitting={submitting} error={error}
          />
        )}
      </main>

      <style>{`
        .create-page { gap: var(--space-6); }
        .create-header { text-align: center; padding-top: 48px; width: 100%; }
        .create-main-heading { font-size: clamp(32px, 8vw, 44px); margin-top: var(--space-2); }

        .wiz-progress { display: flex; align-items: center; width: 100%; padding: var(--space-2) 0; position: relative; z-index: 2; }
        .wiz-step { display: flex; align-items: center; gap: var(--space-2); flex: 1; }
        .wiz-step-circle { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; flex-shrink: 0; border: 1.5px solid var(--blush); background: var(--white); color: var(--muted); transition: all var(--duration-normal) var(--ease-spring); }
        .wiz-step--done    .wiz-step-circle { background: var(--rose); border-color: var(--deep); color: var(--white); }
        .wiz-step--current .wiz-step-circle { background: var(--deep); border-color: var(--deeper); color: var(--white); box-shadow: 0 0 0 3px rgba(176,80,112,0.2); }
        .wiz-step-label { font-size: 11px; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); white-space: nowrap; }
        .wiz-step--current .wiz-step-label { color: var(--deep); }
        .wiz-step--done    .wiz-step-label { color: var(--rose); }
        .wiz-step-line { flex: 1; height: 1.5px; background: var(--sand); margin: 0 var(--space-2); transition: background var(--duration-normal) ease; }
        .wiz-step-line--done { background: var(--rose); }

        .wiz-panel { width: 100%; display: flex; flex-direction: column; gap: var(--space-6); }
        .wiz-panel-header { display: flex; flex-direction: column; gap: var(--space-2); }
        .wiz-title { font-size: clamp(26px, 7vw, 36px); }
        .wiz-fields { display: flex; flex-direction: column; gap: var(--space-5); }
        .wiz-actions { display: flex; gap: var(--space-3); justify-content: flex-end; flex-wrap: wrap; padding-top: var(--space-2); }
        .field-hint { font-size: 12px; color: var(--muted-light); margin-top: var(--space-1); line-height: 1.5; }
        .optional-label { font-size: 10px; font-weight: 400; color: var(--muted-light); text-transform: none; margin-left: var(--space-1); }

        /* Media preview */
        .media-preview-wrap { margin-top: var(--space-3); position: relative; border-radius: var(--radius-md); overflow: hidden; border: 1.5px solid var(--blush); background: var(--sand); }
        .media-preview-frame { width: 100%; height: 220px; border: none; display: block; }
        .media-preview-asset { width: 100%; height: 200px; object-fit: cover; display: block; }
        .media-clear { position: absolute; top: var(--space-2); right: var(--space-2); font-size: 12px; padding: 4px 10px; background: rgba(255,255,255,0.92); border: 1px solid var(--blush); border-radius: var(--radius-full); }

        .stop-form { padding: var(--space-6); display: flex; flex-direction: column; gap: var(--space-5); border: 1.5px solid var(--blush); }
        .stop-form-header { display: flex; align-items: center; justify-content: space-between; }
        .stop-form-actions { display: flex; gap: var(--space-2); flex-wrap: wrap; justify-content: flex-end; padding-top: var(--space-2); border-top: 1px solid var(--sand); }

        .stops-list { display: flex; flex-direction: column; gap: var(--space-3); width: 100%; }
        .stop-summary { overflow: hidden; border: 1px solid var(--sand); }
        .stop-summary--finale { border-color: var(--blush); background: linear-gradient(135deg, #fff5f7, var(--white)); }
        .stop-summary-body { padding: var(--space-3) var(--space-4); }
        .stop-summary-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-2); }
        .stop-summary-controls { display: flex; gap: var(--space-2); }
        .summary-ctrl-btn { background: none; border: none; cursor: pointer; font-size: 14px; padding: 2px 4px; border-radius: var(--radius-sm); transition: background var(--duration-fast) ease; }
        .summary-ctrl-btn:hover { background: var(--sand); }
        .stop-summary-hint { font-size: 13px; font-weight: 500; color: var(--text-soft); margin-bottom: var(--space-1); }
        .stop-summary-msg { font-family: var(--font-display); font-style: italic; font-size: 15px; color: var(--muted); line-height: 1.5; }
        .stop-summary-media-badge { font-size: 11px; color: var(--muted); margin-top: var(--space-1); }

        .step2-wrap { width: 100%; display: flex; flex-direction: column; gap: var(--space-5); }
        .add-more-btn { width: 100%; padding: 14px; border-style: dashed; }

        .review-hunt { padding: var(--space-5) var(--space-6); background: linear-gradient(135deg, #fff5f7, var(--white)); border: 1px solid var(--blush); }
        .review-name { font-family: var(--font-display); font-size: 28px; font-style: italic; color: var(--deep); margin-bottom: var(--space-1); }
        .review-stops { display: flex; flex-direction: column; gap: var(--space-3); width: 100%; }
        .review-stop { padding: var(--space-4) var(--space-5); border: 1px solid var(--sand); display: flex; flex-direction: column; gap: var(--space-2); }
        .review-stop--finale { border-color: var(--blush); }
        .review-stop-top { display: flex; gap: var(--space-2); flex-wrap: wrap; }
        .review-stop-hint { font-size: 13px; font-weight: 500; color: var(--text-soft); }
        .review-stop-msg { font-family: var(--font-display); font-style: italic; font-size: 15px; color: var(--muted); line-height: 1.5; }
        .review-stop-next { font-size: 12px; padding-top: var(--space-1); border-top: 1px solid var(--sand); }
      `}</style>
    </>
  )
}