'use client'

import { useEffect, useState } from 'react'
import type { MagazineReference, ReferenceType } from '@/types'

type GuideOption = { id: string; title: string; slug: string }

type ReferenceFormState = {
  magazine: string
  reference_type: ReferenceType
  issue_number: string
  issue_date: string
  url: string
  article_title: string
  notes: string
  guide_ids: string[]
  is_active: boolean
}

const emptyForm: ReferenceFormState = {
  magazine: '',
  reference_type: 'print',
  issue_number: '',
  issue_date: '',
  url: '',
  article_title: '',
  notes: '',
  guide_ids: [],
  is_active: true,
}

const MAGAZINE_SUGGESTIONS = [
  'evo',
  'CAR',
  'Top Gear Magazine',
  'Autocar',
  'What Car',
  'PistonHeads',
  'Octane',
  'Classic Cars',
  'Performance Car',
  'Fast Car',
  'Total 911',
  'Porsche Post',
  'Land Rover Monthly',
  'Land Rover Owner International',
  'Honda Legends',
  'Hagerty',
  'Honest John',
]

function iconButtonClasses(danger = false) {
  return `inline-flex items-center justify-center min-w-[44px] min-h-[44px] rounded-sm border text-xs font-semibold transition-colors ${
    danger
      ? 'border-border text-red-700 hover:border-red-300 hover:bg-red-50'
      : 'border-border text-text-secondary hover:border-text-primary hover:text-text-primary'
  }`
}

function ReferenceForm({
  initial = emptyForm,
  guides,
  saving,
  error,
  onCancel,
  onSave,
}: {
  initial?: ReferenceFormState
  guides: GuideOption[]
  saving: boolean
  error: string | null
  onCancel: () => void
  onSave: (form: ReferenceFormState) => void
}) {
  const [form, setForm] = useState<ReferenceFormState>(initial)

  function set<K extends keyof ReferenceFormState>(key: K, value: ReferenceFormState[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function toggleGuide(id: string) {
    setForm((f) => ({
      ...f,
      guide_ids: f.guide_ids.includes(id)
        ? f.guide_ids.filter((g) => g !== id)
        : [...f.guide_ids, id],
    }))
  }

  const fieldClasses =
    'w-full min-h-[44px] border border-border rounded-sm px-3 py-2 text-sm text-text-primary bg-surface focus:outline-none focus:border-accent transition-colors'

  return (
    <div className="bg-background border border-border rounded-sm p-4 space-y-3">
      <div>
        <label className="block text-xs font-medium text-text-primary mb-1">
          Magazine / Source name
        </label>
        <input
          type="text"
          list="magazine-suggestions"
          value={form.magazine}
          onChange={(e) => set('magazine', e.target.value)}
          className={fieldClasses}
          placeholder="e.g. evo"
        />
        <datalist id="magazine-suggestions">
          {MAGAZINE_SUGGESTIONS.map((m) => (
            <option key={m} value={m} />
          ))}
        </datalist>
      </div>

      <div>
        <label className="block text-xs font-medium text-text-primary mb-1">Reference type</label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => set('reference_type', 'print')}
            className={`flex-1 min-h-[44px] rounded-sm border text-sm font-semibold transition-colors ${
              form.reference_type === 'print'
                ? 'border-accent bg-accent text-white'
                : 'border-border text-text-secondary hover:border-text-primary hover:text-text-primary'
            }`}
          >
            Print
          </button>
          <button
            type="button"
            onClick={() => set('reference_type', 'web')}
            className={`flex-1 min-h-[44px] rounded-sm border text-sm font-semibold transition-colors ${
              form.reference_type === 'web'
                ? 'border-accent bg-accent text-white'
                : 'border-border text-text-secondary hover:border-text-primary hover:text-text-primary'
            }`}
          >
            Web
          </button>
        </div>
      </div>

      {form.reference_type === 'print' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-text-primary mb-1">
              Issue number
            </label>
            <input
              type="text"
              value={form.issue_number}
              onChange={(e) => set('issue_number', e.target.value)}
              className={fieldClasses}
              placeholder="Issue 47 or #312"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-primary mb-1">
              Issue date
            </label>
            <input
              type="text"
              value={form.issue_date}
              onChange={(e) => set('issue_date', e.target.value)}
              className={fieldClasses}
              placeholder="March 2003"
            />
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-text-primary mb-1">URL</label>
            <input
              type="text"
              inputMode="url"
              value={form.url}
              onChange={(e) => set('url', e.target.value)}
              className={`${fieldClasses} font-mono text-xs`}
              placeholder="https://…"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-primary mb-1">
              Date published
            </label>
            <input
              type="text"
              value={form.issue_date}
              onChange={(e) => set('issue_date', e.target.value)}
              className={fieldClasses}
              placeholder="March 2024"
            />
          </div>
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-text-primary mb-1">Article title</label>
        <input
          type="text"
          value={form.article_title}
          onChange={(e) => set('article_title', e.target.value)}
          className={fieldClasses}
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-text-primary mb-1">Notes</label>
        <textarea
          value={form.notes}
          onChange={(e) => set('notes', e.target.value)}
          rows={2}
          className="w-full border border-border rounded-sm px-3 py-2 text-sm text-text-primary bg-surface focus:outline-none focus:border-accent transition-colors resize-none"
          placeholder="Full road test, group test winner, buying guide, long term test conclusion"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-text-primary mb-1">
          Link to guides
        </label>
        <div className="border border-border rounded-sm max-h-48 overflow-y-auto bg-surface divide-y divide-border">
          {guides.length === 0 ? (
            <p className="text-xs text-text-muted px-3 py-3">No published guides yet.</p>
          ) : (
            guides.map((g) => (
              <label
                key={g.id}
                className="flex items-center gap-3 min-h-[44px] px-3 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={form.guide_ids.includes(g.id)}
                  onChange={() => toggleGuide(g.id)}
                  className="w-5 h-5 accent-[color:var(--color-accent)] shrink-0"
                />
                <span className="text-sm text-text-primary">{g.title}</span>
              </label>
            ))
          )}
        </div>
      </div>

      <label className="flex items-center gap-3 min-h-[44px]">
        <input
          type="checkbox"
          checked={form.is_active}
          onChange={(e) => set('is_active', e.target.checked)}
          className="w-5 h-5 accent-[color:var(--color-accent)]"
        />
        <span className="text-sm text-text-primary">
          Active <span className="text-text-muted">(visible on the public page)</span>
        </span>
      </label>

      {error && (
        <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-sm px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex gap-3 pt-1">
        <button
          type="button"
          disabled={saving || !form.magazine.trim()}
          onClick={() =>
            onSave({
              ...form,
              magazine: form.magazine.trim(),
              issue_number: form.issue_number.trim(),
              issue_date: form.issue_date.trim(),
              url: form.url.trim(),
              article_title: form.article_title.trim(),
              notes: form.notes.trim(),
            })
          }
          className="min-h-[44px] px-5 rounded-sm bg-accent text-white text-sm font-semibold hover:bg-accent-hover transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="min-h-[44px] px-5 rounded-sm border border-border text-text-secondary text-sm font-semibold hover:border-text-primary hover:text-text-primary transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

function ReferenceRow({
  reference,
  onToggleActive,
  onEdit,
  onDelete,
}: {
  reference: MagazineReference
  onToggleActive: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  const isWeb = reference.reference_type === 'web'

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 border border-border rounded-sm p-3 bg-surface">
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <p className="text-sm font-semibold text-text-primary">{reference.magazine}</p>
          <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase bg-border/60 text-text-secondary">
            {isWeb ? 'Web' : 'Print'}
          </span>
        </div>
        {reference.article_title && (
          <p className="text-xs text-text-secondary mb-1">{reference.article_title}</p>
        )}
        <p className="text-xs text-text-muted truncate">
          {isWeb
            ? reference.url || '—'
            : [reference.issue_number, reference.issue_date].filter(Boolean).join(' · ') || '—'}
        </p>
        {reference.guides.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {reference.guides.map((g) => (
              <span
                key={g.id}
                className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold bg-accent/10 text-accent-hover"
              >
                {g.title}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={onToggleActive}
          className={`min-h-[44px] px-3 rounded-sm border text-xs font-semibold transition-colors ${
            reference.is_active
              ? 'border-accent bg-accent text-white hover:bg-accent-hover'
              : 'border-border text-text-secondary hover:border-text-primary hover:text-text-primary'
          }`}
        >
          {reference.is_active ? 'Active' : 'Hidden'}
        </button>
        <button type="button" onClick={onEdit} className={iconButtonClasses()}>
          Edit
        </button>
        <button type="button" onClick={onDelete} className={iconButtonClasses(true)}>
          Del
        </button>
      </div>
    </div>
  )
}

export default function MagazineReferencesManager() {
  const [references, setReferences] = useState<MagazineReference[] | null>(null)
  const [guides, setGuides] = useState<GuideOption[]>([])
  const [loadError, setLoadError] = useState<string | null>(null)

  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/magazine-references')
      .then(async (res) => {
        if (!res.ok) throw new Error('load-failed')
        const data = await res.json()
        setReferences(data.references ?? [])
        setGuides(data.guides ?? [])
      })
      .catch(() => {
        setLoadError(
          'Could not load magazine references. If this is the first time, make sure the database migration in supabase/migrations/004_magazine_references.sql has been run in the Supabase SQL editor.'
        )
      })
  }, [])

  async function handleCreate(form: ReferenceFormState) {
    setSaving(true)
    setFormError(null)
    try {
      const res = await fetch('/api/admin/magazine-references', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        setFormError(data.error ?? 'Failed to create reference.')
        return
      }
      setReferences((prev) => [...(prev ?? []), data.reference])
      setAdding(false)
    } catch {
      setFormError('Something went wrong. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  async function handleUpdate(id: string, form: ReferenceFormState) {
    setSaving(true)
    setFormError(null)
    try {
      const res = await fetch(`/api/admin/magazine-references/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        setFormError(data.error ?? 'Failed to update reference.')
        return
      }
      setReferences((prev) => (prev ?? []).map((r) => (r.id === id ? data.reference : r)))
      setEditingId(null)
    } catch {
      setFormError('Something went wrong. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  async function handleToggleActive(reference: MagazineReference) {
    const res = await fetch(`/api/admin/magazine-references/${reference.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !reference.is_active }),
    })
    if (res.ok) {
      const data = await res.json()
      setReferences((prev) =>
        (prev ?? []).map((r) => (r.id === reference.id ? data.reference : r))
      )
    }
  }

  async function handleDelete(reference: MagazineReference) {
    if (
      !window.confirm(
        `Delete this reference from ${reference.magazine}? This cannot be undone.`
      )
    )
      return

    const res = await fetch(`/api/admin/magazine-references/${reference.id}`, {
      method: 'DELETE',
    })
    if (res.ok) {
      setReferences((prev) => (prev ?? []).filter((r) => r.id !== reference.id))
    }
  }

  if (loadError) {
    return (
      <section>
        <h2 className="font-heading text-h4 text-text-primary mb-4">Magazine references</h2>
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-sm px-3 py-2">
          {loadError}
        </p>
      </section>
    )
  }

  if (!references) {
    return (
      <section>
        <h2 className="font-heading text-h4 text-text-primary mb-4">Magazine references</h2>
        <p className="text-sm text-text-muted">Loading…</p>
      </section>
    )
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-4 gap-4">
        <h2 className="font-heading text-h4 text-text-primary">Magazine references</h2>
        {!adding && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="min-h-[44px] px-4 rounded-sm bg-accent text-white text-sm font-semibold hover:bg-accent-hover transition-colors shrink-0"
          >
            + Add reference
          </button>
        )}
      </div>

      {adding && (
        <div className="mb-4">
          <ReferenceForm
            guides={guides}
            saving={saving}
            error={formError}
            onCancel={() => {
              setAdding(false)
              setFormError(null)
            }}
            onSave={handleCreate}
          />
        </div>
      )}

      {references.length === 0 && !adding && (
        <p className="text-sm text-text-muted">No magazine references yet.</p>
      )}

      <div className="space-y-3">
        {references.map((reference) =>
          editingId === reference.id ? (
            <ReferenceForm
              key={reference.id}
              initial={{
                magazine: reference.magazine,
                reference_type: reference.reference_type,
                issue_number: reference.issue_number ?? '',
                issue_date: reference.issue_date ?? '',
                url: reference.url ?? '',
                article_title: reference.article_title ?? '',
                notes: reference.notes ?? '',
                guide_ids: reference.guides.map((g) => g.id),
                is_active: reference.is_active,
              }}
              guides={guides}
              saving={saving}
              error={formError}
              onCancel={() => {
                setEditingId(null)
                setFormError(null)
              }}
              onSave={(form) => handleUpdate(reference.id, form)}
            />
          ) : (
            <ReferenceRow
              key={reference.id}
              reference={reference}
              onToggleActive={() => handleToggleActive(reference)}
              onEdit={() => {
                setEditingId(reference.id)
                setFormError(null)
              }}
              onDelete={() => handleDelete(reference)}
            />
          )
        )}
      </div>
    </section>
  )
}
