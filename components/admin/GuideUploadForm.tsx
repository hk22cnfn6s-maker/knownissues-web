'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

interface ManufacturerOption {
  id: string
  name: string
}

const MAX_DESCRIPTION_LENGTH = 200

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const fieldClasses =
  'w-full min-h-[44px] border border-border rounded-sm px-3 py-2 text-sm text-text-primary bg-background focus:outline-none focus:border-accent transition-colors disabled:opacity-50'

export default function GuideUploadForm() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [manufacturers, setManufacturers] = useState<ManufacturerOption[]>([])
  const [manufacturersError, setManufacturersError] = useState(false)

  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)
  const [description, setDescription] = useState('')
  const [manufacturerId, setManufacturerId] = useState('')
  const [isPublished, setIsPublished] = useState(false)
  const [file, setFile] = useState<File | null>(null)

  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  )

  useEffect(() => {
    let cancelled = false
    fetch('/api/guides')
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return
        const groups = Array.isArray(data.manufacturers) ? data.manufacturers : []
        const options: ManufacturerOption[] = groups
          .map((g: { manufacturer: ManufacturerOption | null }) => g.manufacturer)
          .filter((m: ManufacturerOption | null): m is ManufacturerOption => !!m)
        const unique = Array.from(new Map(options.map((m) => [m.id, m])).values())
        setManufacturers(unique)
      })
      .catch(() => {
        if (!cancelled) setManufacturersError(true)
      })
    return () => {
      cancelled = true
    }
  }, [])

  function handleTitleChange(value: string) {
    setTitle(value)
    if (!slugTouched) setSlug(slugify(value))
  }

  function handleSlugChange(value: string) {
    setSlugTouched(true)
    setSlug(slugify(value))
  }

  function resetForm() {
    setTitle('')
    setSlug('')
    setSlugTouched(false)
    setDescription('')
    setManufacturerId('')
    setIsPublished(false)
    setFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (uploading) return
    setMessage(null)

    if (!title.trim() || !slug.trim() || !description.trim() || !manufacturerId || !file) {
      setMessage({ type: 'error', text: 'Please fill in all required fields and choose a PDF.' })
      return
    }

    const formData = new FormData()
    formData.append('pdf', file)
    formData.append('title', title.trim())
    formData.append('slug', slug.trim())
    formData.append('description', description.trim())
    formData.append('manufacturer_id', manufacturerId)
    formData.append('is_published', String(isPublished))

    setUploading(true)
    setProgress(0)

    const xhr = new XMLHttpRequest()
    xhr.open('POST', '/api/admin/guides/upload')

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        setProgress(Math.round((event.loaded / event.total) * 100))
      }
    }

    xhr.onload = () => {
      setUploading(false)
      let data: { success?: boolean; error?: string } = {}
      try {
        data = JSON.parse(xhr.responseText)
      } catch {
        // ignore malformed response
      }

      if (xhr.status >= 200 && xhr.status < 300 && data.success) {
        setMessage({
          type: 'success',
          text: `Guide uploaded successfully — ${title.trim()} is now ${
            isPublished ? 'published' : 'saved as draft'
          }`,
        })
        resetForm()
        router.refresh()
      } else {
        setMessage({ type: 'error', text: data.error ?? 'Upload failed. Please try again.' })
      }
    }

    xhr.onerror = () => {
      setUploading(false)
      setMessage({
        type: 'error',
        text: 'Something went wrong. Please check your connection and try again.',
      })
    }

    xhr.send(formData)
  }

  return (
    <section className="mb-14">
      <h2 className="font-heading text-h4 text-text-primary mb-4">Upload Guide</h2>
      <form
        onSubmit={handleSubmit}
        className="bg-surface border border-border rounded-sm p-4 sm:p-6 space-y-4"
      >
        <div>
          <label className="block text-xs font-medium text-text-primary mb-1">
            Title <span className="text-red-700">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            disabled={uploading}
            required
            placeholder="Range Rover L322 (2002–2012) Buyers Guide"
            className={fieldClasses}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-text-primary mb-1">
            Slug <span className="text-red-700">*</span>
          </label>
          <input
            type="text"
            value={slug}
            onChange={(e) => handleSlugChange(e.target.value)}
            disabled={uploading}
            required
            placeholder="range-rover-l322"
            className={fieldClasses}
          />
          <p className="text-xs text-text-muted mt-1">
            URL-safe, lowercase, hyphens only — this becomes the download filename
          </p>
        </div>

        <div>
          <label className="block text-xs font-medium text-text-primary mb-1">
            Description <span className="text-red-700">*</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value.slice(0, MAX_DESCRIPTION_LENGTH))}
            disabled={uploading}
            required
            rows={3}
            maxLength={MAX_DESCRIPTION_LENGTH}
            placeholder="The definitive guide to buying a used..."
            className={`${fieldClasses} min-h-0 resize-none`}
          />
          <p className="text-xs text-text-muted mt-1 text-right">
            {description.length}/{MAX_DESCRIPTION_LENGTH}
          </p>
        </div>

        <div>
          <label className="block text-xs font-medium text-text-primary mb-1">
            Manufacturer <span className="text-red-700">*</span>
          </label>
          <select
            value={manufacturerId}
            onChange={(e) => setManufacturerId(e.target.value)}
            disabled={uploading}
            required
            className={fieldClasses}
          >
            <option value="">Select a manufacturer…</option>
            {manufacturers.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
          {manufacturersError && (
            <p className="text-xs text-red-700 mt-1">
              Failed to load manufacturers. Refresh the page and try again.
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-text-primary mb-1">
            PDF File <span className="text-red-700">*</span>
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            disabled={uploading}
            required
            className="w-full text-sm text-text-secondary file:mr-3 file:min-h-[44px] file:px-4 file:rounded-sm file:border file:border-border file:bg-background file:text-sm file:font-semibold file:text-text-secondary disabled:opacity-50"
          />
          {file && (
            <p className="text-xs text-text-muted mt-1">
              {file.name} — {formatFileSize(file.size)}
            </p>
          )}
        </div>

        <label className="flex items-center gap-3 min-h-[44px]">
          <input
            type="checkbox"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
            disabled={uploading}
            className="w-5 h-5 accent-[color:var(--color-accent)]"
          />
          <span className="text-sm text-text-primary">Publish immediately</span>
        </label>
        <p className="text-xs text-text-muted -mt-2">
          If off, guide is saved but not visible on the site
        </p>

        {uploading && (
          <div className="w-full h-2 bg-background border border-border rounded-sm overflow-hidden">
            <div
              className="h-full bg-accent transition-[width]"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {message && (
          <p
            className={`text-sm rounded-sm px-3 py-2 border ${
              message.type === 'error'
                ? 'text-red-700 bg-red-50 border-red-200'
                : 'text-green-700 bg-green-50 border-green-200'
            }`}
          >
            {message.text}
          </p>
        )}

        <button
          type="submit"
          disabled={uploading}
          className="w-full sm:w-auto min-h-[48px] px-6 rounded-sm bg-accent text-white text-sm font-semibold hover:bg-accent-hover transition-colors disabled:opacity-50"
        >
          {uploading ? `Uploading… ${progress}%` : 'Upload Guide'}
        </button>
      </form>
    </section>
  )
}
