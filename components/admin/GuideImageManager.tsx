'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

export default function GuideImageManager({
  guideId,
  initialCoverImage,
}: {
  guideId: string
  initialCoverImage: string | null
}) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [coverImage, setCoverImage] = useState(initialCoverImage)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  )

  function pickFile() {
    setMessage(null)
    fileInputRef.current?.click()
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = '' // allow re-selecting the same file later
    if (!file) return

    setLoading(true)
    setMessage(null)

    try {
      const formData = new FormData()
      formData.append('image', file)

      const res = await fetch(`/api/admin/guides/${guideId}/image`, {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()

      if (!res.ok) {
        setMessage({ type: 'error', text: data.error ?? 'Upload failed.' })
        return
      }

      setCoverImage(data.cover_image)
      setMessage({ type: 'success', text: 'Image updated.' })
      router.refresh()
    } catch {
      setMessage({ type: 'error', text: 'Something went wrong. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  async function handleRemove() {
    if (!window.confirm('Remove this cover image?')) return

    setLoading(true)
    setMessage(null)

    try {
      const res = await fetch(`/api/admin/guides/${guideId}/image`, { method: 'DELETE' })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setMessage({ type: 'error', text: data.error ?? 'Failed to remove image.' })
        return
      }

      setCoverImage(null)
      setMessage({ type: 'success', text: 'Image removed.' })
      router.refresh()
    } catch {
      setMessage({ type: 'error', text: 'Something went wrong. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const buttonClasses =
    'min-h-[44px] px-3 rounded-sm border border-border text-xs font-semibold text-text-secondary hover:border-text-primary hover:text-text-primary transition-colors disabled:opacity-50'

  return (
    <div className="flex items-center gap-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      {coverImage ? (
        <>
          <div className="relative w-[80px] h-[53px] rounded-sm overflow-hidden border border-border shrink-0 bg-background">
            <Image
              src={`${siteUrl}/api/images/${coverImage}`}
              alt=""
              fill
              sizes="80px"
              className="object-cover"
            />
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex gap-2">
              <button type="button" onClick={pickFile} disabled={loading} className={buttonClasses}>
                {loading ? '…' : 'Replace'}
              </button>
              <button
                type="button"
                onClick={handleRemove}
                disabled={loading}
                className="min-h-[44px] px-3 rounded-sm border border-border text-xs font-semibold text-red-700 hover:border-red-300 hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                Remove
              </button>
            </div>
            {message && (
              <span
                className={`text-xs ${message.type === 'error' ? 'text-red-700' : 'text-green-700'}`}
              >
                {message.text}
              </span>
            )}
          </div>
        </>
      ) : (
        <div className="flex flex-col gap-1">
          <button type="button" onClick={pickFile} disabled={loading} className={buttonClasses}>
            {loading ? 'Uploading…' : 'Upload image'}
          </button>
          {message && (
            <span
              className={`text-xs ${message.type === 'error' ? 'text-red-700' : 'text-green-700'}`}
            >
              {message.text}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
