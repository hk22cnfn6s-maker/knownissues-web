'use client'

import { useEffect, useState } from 'react'
import type { ResourceItem, ResourceSection } from '@/types'

type ItemFormState = {
  name: string
  description: string
  url: string
  badge: string
  tag: string
  is_active: boolean
}

const emptyItemForm: ItemFormState = {
  name: '',
  description: '',
  url: '',
  badge: '',
  tag: '',
  is_active: true,
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
    </svg>
  )
}

function iconButtonClasses(danger = false) {
  return `inline-flex items-center justify-center min-w-[44px] min-h-[44px] rounded-sm border text-xs font-semibold transition-colors ${
    danger
      ? 'border-border text-red-700 hover:border-red-300 hover:bg-red-50'
      : 'border-border text-text-secondary hover:border-text-primary hover:text-text-primary'
  }`
}

function SectionForm({
  initialTitle = '',
  initialDescription = '',
  saving,
  error,
  onCancel,
  onSave,
}: {
  initialTitle?: string
  initialDescription?: string
  saving: boolean
  error: string | null
  onCancel: () => void
  onSave: (title: string, description: string) => void
}) {
  const [title, setTitle] = useState(initialTitle)
  const [description, setDescription] = useState(initialDescription)

  return (
    <div className="bg-background border border-border rounded-sm p-4 space-y-3">
      <div>
        <label className="block text-xs font-medium text-text-primary mb-1">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full min-h-[44px] border border-border rounded-sm px-3 py-2 text-sm text-text-primary bg-surface focus:outline-none focus:border-accent transition-colors"
          placeholder="e.g. Diagnostic Tools"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-text-primary mb-1">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="w-full border border-border rounded-sm px-3 py-2 text-sm text-text-primary bg-surface focus:outline-none focus:border-accent transition-colors resize-none"
          placeholder="Short description shown under the section heading"
        />
      </div>

      {error && (
        <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-sm px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex gap-3 pt-1">
        <button
          type="button"
          disabled={saving || !title.trim()}
          onClick={() => onSave(title.trim(), description.trim())}
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

function ItemForm({
  initial = emptyItemForm,
  saving,
  error,
  onCancel,
  onSave,
}: {
  initial?: ItemFormState
  saving: boolean
  error: string | null
  onCancel: () => void
  onSave: (form: ItemFormState) => void
}) {
  const [form, setForm] = useState<ItemFormState>(initial)

  function set<K extends keyof ItemFormState>(key: K, value: ItemFormState[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  const fieldClasses =
    'w-full min-h-[44px] border border-border rounded-sm px-3 py-2 text-sm text-text-primary bg-surface focus:outline-none focus:border-accent transition-colors'

  return (
    <div className="bg-background border border-border rounded-sm p-4 space-y-3">
      <div>
        <label className="block text-xs font-medium text-text-primary mb-1">Name</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => set('name', e.target.value)}
          className={fieldClasses}
          placeholder="e.g. Autel MaxiAP AP200"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-text-primary mb-1">Description</label>
        <textarea
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          rows={3}
          className="w-full border border-border rounded-sm px-3 py-2 text-sm text-text-primary bg-surface focus:outline-none focus:border-accent transition-colors resize-none"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-text-primary mb-1">URL</label>
        <input
          type="text"
          inputMode="url"
          value={form.url}
          onChange={(e) => set('url', e.target.value)}
          className={`${fieldClasses} font-mono text-xs`}
          placeholder="https://amzn.to/…"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-text-primary mb-1">
            Badge <span className="text-text-muted font-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={form.badge}
            onChange={(e) => set('badge', e.target.value)}
            className={fieldClasses}
            placeholder="Recommended"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-text-primary mb-1">
            Tag <span className="text-text-muted font-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={form.tag}
            onChange={(e) => set('tag', e.target.value)}
            className={fieldClasses}
            placeholder="Amazon, Direct, Awin…"
          />
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
          disabled={saving || !form.name.trim() || !form.url.trim()}
          onClick={() =>
            onSave({
              ...form,
              name: form.name.trim(),
              description: form.description.trim(),
              url: form.url.trim(),
              badge: form.badge.trim(),
              tag: form.tag.trim(),
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

function ItemRow({
  item,
  editing,
  saving,
  error,
  onToggleActive,
  onEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
}: {
  item: ResourceItem
  editing: boolean
  saving: boolean
  error: string | null
  onToggleActive: () => void
  onEdit: () => void
  onCancelEdit: () => void
  onSaveEdit: (form: ItemFormState) => void
  onDelete: () => void
}) {
  if (editing) {
    return (
      <ItemForm
        initial={{
          name: item.name,
          description: item.description ?? '',
          url: item.url,
          badge: item.badge ?? '',
          tag: item.tag ?? '',
          is_active: item.is_active,
        }}
        saving={saving}
        error={error}
        onCancel={onCancelEdit}
        onSave={onSaveEdit}
      />
    )
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 border border-border rounded-sm p-3 bg-surface">
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <p className="text-sm font-semibold text-text-primary">{item.name}</p>
          {item.badge && (
            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase bg-accent/10 text-accent-hover">
              {item.badge}
            </span>
          )}
          {item.tag && (
            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase bg-border/60 text-text-secondary">
              {item.tag}
            </span>
          )}
        </div>
        <p className="text-xs text-text-muted truncate">{item.url}</p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={onToggleActive}
          className={`min-h-[44px] px-3 rounded-sm border text-xs font-semibold transition-colors ${
            item.is_active
              ? 'border-accent bg-accent text-white hover:bg-accent-hover'
              : 'border-border text-text-secondary hover:border-text-primary hover:text-text-primary'
          }`}
        >
          {item.is_active ? 'Active' : 'Hidden'}
        </button>
        <button type="button" onClick={onEdit} className={iconButtonClasses()} aria-label="Edit item">
          Edit
        </button>
        <button
          type="button"
          onClick={onDelete}
          className={iconButtonClasses(true)}
          aria-label="Delete item"
        >
          Del
        </button>
      </div>
    </div>
  )
}

export default function ResourcesManager() {
  const [sections, setSections] = useState<ResourceSection[] | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const [addingSection, setAddingSection] = useState(false)
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null)
  const [sectionSaving, setSectionSaving] = useState(false)
  const [sectionError, setSectionError] = useState<string | null>(null)

  const [addingItemFor, setAddingItemFor] = useState<string | null>(null)
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [itemSaving, setItemSaving] = useState(false)
  const [itemError, setItemError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/resources')
      .then(async (res) => {
        if (!res.ok) throw new Error('load-failed')
        const data = await res.json()
        setSections(data.sections ?? [])
      })
      .catch(() => {
        setLoadError(
          'Could not load resources. If this is the first time, make sure the database migration in supabase/migrations/003_resources.sql has been run in the Supabase SQL editor.'
        )
      })
  }, [])

  function toggleExpanded(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // ---- sections ----

  async function handleCreateSection(title: string, description: string) {
    setSectionSaving(true)
    setSectionError(null)
    try {
      const nextOrder = (sections ?? []).reduce((max, s) => Math.max(max, s.display_order), 0) + 1
      const res = await fetch('/api/admin/resources/sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, display_order: nextOrder }),
      })
      const data = await res.json()
      if (!res.ok) {
        setSectionError(data.error ?? 'Failed to create section.')
        return
      }
      setSections((prev) => [...(prev ?? []), data.section])
      setAddingSection(false)
    } catch {
      setSectionError('Something went wrong. Please try again.')
    } finally {
      setSectionSaving(false)
    }
  }

  async function handleUpdateSection(id: string, title: string, description: string) {
    const current = (sections ?? []).find((s) => s.id === id)
    if (!current) return

    setSectionSaving(true)
    setSectionError(null)
    try {
      const res = await fetch(`/api/admin/resources/sections/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, display_order: current.display_order }),
      })
      const data = await res.json()
      if (!res.ok) {
        setSectionError(data.error ?? 'Failed to update section.')
        return
      }
      setSections((prev) =>
        (prev ?? []).map((s) => (s.id === id ? { ...s, ...data.section } : s))
      )
      setEditingSectionId(null)
    } catch {
      setSectionError('Something went wrong. Please try again.')
    } finally {
      setSectionSaving(false)
    }
  }

  async function handleDeleteSection(id: string, title: string) {
    if (!window.confirm(`Delete "${title}" and all its items? This cannot be undone.`)) return

    const res = await fetch(`/api/admin/resources/sections/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setSections((prev) => (prev ?? []).filter((s) => s.id !== id))
    }
  }

  // ---- items ----

  async function handleCreateItem(sectionId: string, form: ItemFormState) {
    setItemSaving(true)
    setItemError(null)
    try {
      const section = (sections ?? []).find((s) => s.id === sectionId)
      const nextOrder = (section?.items ?? []).reduce((max, i) => Math.max(max, i.display_order), 0) + 1

      const res = await fetch('/api/admin/resources/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section_id: sectionId, ...form, display_order: nextOrder }),
      })
      const data = await res.json()
      if (!res.ok) {
        setItemError(data.error ?? 'Failed to create item.')
        return
      }
      setSections((prev) =>
        (prev ?? []).map((s) =>
          s.id === sectionId ? { ...s, items: [...s.items, data.item] } : s
        )
      )
      setAddingItemFor(null)
    } catch {
      setItemError('Something went wrong. Please try again.')
    } finally {
      setItemSaving(false)
    }
  }

  async function handleUpdateItem(id: string, form: Partial<ItemFormState>) {
    setItemSaving(true)
    setItemError(null)
    try {
      const res = await fetch(`/api/admin/resources/items/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        setItemError(data.error ?? 'Failed to update item.')
        return
      }
      setSections((prev) =>
        (prev ?? []).map((s) => ({
          ...s,
          items: s.items.map((i) => (i.id === id ? { ...i, ...data.item } : i)),
        }))
      )
      setEditingItemId(null)
    } catch {
      setItemError('Something went wrong. Please try again.')
    } finally {
      setItemSaving(false)
    }
  }

  async function handleToggleItemActive(item: ResourceItem) {
    const res = await fetch(`/api/admin/resources/items/${item.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !item.is_active }),
    })
    if (res.ok) {
      const data = await res.json()
      setSections((prev) =>
        (prev ?? []).map((s) => ({
          ...s,
          items: s.items.map((i) => (i.id === item.id ? { ...i, ...data.item } : i)),
        }))
      )
    }
  }

  async function handleDeleteItem(item: ResourceItem) {
    if (!window.confirm(`Delete "${item.name}"? This cannot be undone.`)) return

    const res = await fetch(`/api/admin/resources/items/${item.id}`, { method: 'DELETE' })
    if (res.ok) {
      setSections((prev) =>
        (prev ?? []).map((s) => ({
          ...s,
          items: s.items.filter((i) => i.id !== item.id),
        }))
      )
    }
  }

  if (loadError) {
    return (
      <section>
        <h2 className="font-heading text-h4 text-text-primary mb-4">Affiliate resources</h2>
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-sm px-3 py-2">
          {loadError}
        </p>
      </section>
    )
  }

  if (!sections) {
    return (
      <section>
        <h2 className="font-heading text-h4 text-text-primary mb-4">Affiliate resources</h2>
        <p className="text-sm text-text-muted">Loading…</p>
      </section>
    )
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-4 gap-4">
        <h2 className="font-heading text-h4 text-text-primary">Affiliate resources</h2>
        {!addingSection && (
          <button
            type="button"
            onClick={() => setAddingSection(true)}
            className="min-h-[44px] px-4 rounded-sm bg-accent text-white text-sm font-semibold hover:bg-accent-hover transition-colors shrink-0"
          >
            + Add section
          </button>
        )}
      </div>

      {addingSection && (
        <div className="mb-4">
          <SectionForm
            saving={sectionSaving}
            error={sectionError}
            onCancel={() => {
              setAddingSection(false)
              setSectionError(null)
            }}
            onSave={(title, description) => handleCreateSection(title, description)}
          />
        </div>
      )}

      {sections.length === 0 && !addingSection && (
        <p className="text-sm text-text-muted">No resource sections yet.</p>
      )}

      <div className="space-y-3">
        {sections.map((section) => {
          const isOpen = expanded.has(section.id)
          const isEditingSection = editingSectionId === section.id

          return (
            <div key={section.id} className="bg-surface border border-border rounded-sm overflow-hidden">
              {isEditingSection ? (
                <div className="p-4">
                  <SectionForm
                    initialTitle={section.title}
                    initialDescription={section.description ?? ''}
                    saving={sectionSaving}
                    error={sectionError}
                    onCancel={() => {
                      setEditingSectionId(null)
                      setSectionError(null)
                    }}
                    onSave={(title, description) =>
                      handleUpdateSection(section.id, title, description)
                    }
                  />
                </div>
              ) : (
                <div className="flex items-center gap-3 p-4">
                  <button
                    type="button"
                    onClick={() => toggleExpanded(section.id)}
                    className="flex items-center gap-3 flex-1 min-w-0 min-h-[44px] text-left"
                    aria-expanded={isOpen}
                  >
                    <ChevronIcon open={isOpen} />
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-text-primary truncate">
                        {section.title}
                      </span>
                      <span className="block text-xs text-text-muted">
                        {section.items.length} item{section.items.length === 1 ? '' : 's'}
                      </span>
                    </span>
                  </button>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingSectionId(section.id)
                        setSectionError(null)
                      }}
                      className={iconButtonClasses()}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteSection(section.id, section.title)}
                      className={iconButtonClasses(true)}
                    >
                      Del
                    </button>
                  </div>
                </div>
              )}

              {isOpen && !isEditingSection && (
                <div className="border-t border-border bg-background p-4 space-y-3">
                  {section.items.map((item) =>
                    editingItemId === item.id ? (
                      <ItemRow
                        key={item.id}
                        item={item}
                        editing
                        saving={itemSaving}
                        error={itemError}
                        onToggleActive={() => handleToggleItemActive(item)}
                        onEdit={() => {}}
                        onCancelEdit={() => {
                          setEditingItemId(null)
                          setItemError(null)
                        }}
                        onSaveEdit={(form) => handleUpdateItem(item.id, form)}
                        onDelete={() => handleDeleteItem(item)}
                      />
                    ) : (
                      <ItemRow
                        key={item.id}
                        item={item}
                        editing={false}
                        saving={false}
                        error={null}
                        onToggleActive={() => handleToggleItemActive(item)}
                        onEdit={() => {
                          setEditingItemId(item.id)
                          setItemError(null)
                        }}
                        onCancelEdit={() => setEditingItemId(null)}
                        onSaveEdit={() => {}}
                        onDelete={() => handleDeleteItem(item)}
                      />
                    )
                  )}

                  {addingItemFor === section.id ? (
                    <ItemForm
                      saving={itemSaving}
                      error={itemError}
                      onCancel={() => {
                        setAddingItemFor(null)
                        setItemError(null)
                      }}
                      onSave={(form) => handleCreateItem(section.id, form)}
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setAddingItemFor(section.id)
                        setItemError(null)
                      }}
                      className="w-full min-h-[44px] px-4 rounded-sm border border-dashed border-border text-text-secondary text-sm font-semibold hover:border-accent hover:text-accent transition-colors"
                    >
                      + Add item
                    </button>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
