'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function GuideToggle({
  guideId,
  isPublished,
}: {
  guideId: string
  isPublished: boolean
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [published, setPublished] = useState(isPublished)

  async function handleToggle() {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/guides/${guideId}/toggle`, {
        method: 'POST',
      })
      if (res.ok) {
        const data = await res.json()
        setPublished(data.is_published)
        router.refresh()
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`text-xs font-semibold px-3 py-1.5 rounded border transition-colors disabled:opacity-50 ${
        published
          ? 'border-black bg-black text-white hover:bg-gray-800'
          : 'border-gray-300 text-gray-600 hover:border-black hover:text-black'
      }`}
    >
      {loading ? '…' : published ? 'Published' : 'Unpublished'}
    </button>
  )
}
