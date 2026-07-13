'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'

type State =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'done' }

export default function DownloadButton({ slug }: { slug: string }) {
  const [state, setState] = useState<State>({ status: 'idle' })

  async function handleDownload() {
    setState({ status: 'loading' })

    try {
      const res = await fetch(`/api/guides/${slug}/download`, {
        method: 'POST',
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setState({ status: 'error', message: data.error ?? 'Download failed.' })
        return
      }

      // The response body is the watermarked PDF itself — save it via a
      // blob URL rather than navigating to a redirect URL.
      const blob = await res.blob()
      const filename =
        res.headers
          .get('Content-Disposition')
          ?.match(/filename="?([^"]+)"?/)?.[1] ?? `${slug}.pdf`

      const blobUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(blobUrl)

      setState({ status: 'done' })
    } catch {
      setState({ status: 'error', message: 'Something went wrong. Please try again.' })
    }
  }

  return (
    <div className="space-y-3">
      <Button
        onClick={handleDownload}
        disabled={state.status === 'loading' || state.status === 'done'}
        variant="primary"
      >
        {state.status === 'loading' && (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
        )}
        {state.status === 'loading'
          ? 'Preparing download…'
          : state.status === 'done'
          ? '✓ Download started'
          : 'Download guide (PDF)'}
      </Button>

      {state.status === 'error' && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-sm px-3 py-2 max-w-md">
          {state.message}
        </p>
      )}

      {state.status === 'done' && (
        <p className="text-sm text-text-secondary">
          Delivered instantly — also emailed to you. If it doesn't start,{' '}
          <button
            onClick={handleDownload}
            className="underline underline-offset-2 text-accent hover:text-accent-hover"
          >
            try again
          </button>
          .
        </p>
      )}
    </div>
  )
}
