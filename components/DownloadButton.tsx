'use client'

import { useState } from 'react'

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

      const data = await res.json()

      if (!res.ok) {
        setState({ status: 'error', message: data.error ?? 'Download failed.' })
        return
      }

      // Trigger the download by navigating to the signed URL in a new tab.
      // This avoids popup-blockers (the URL is opened synchronously in the
      // click handler chain) and lets the browser handle the PDF download.
      const a = document.createElement('a')
      a.href = data.url
      a.target = '_blank'
      a.rel = 'noopener noreferrer'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)

      setState({ status: 'done' })
    } catch {
      setState({ status: 'error', message: 'Something went wrong. Please try again.' })
    }
  }

  return (
    <div className="space-y-3">
      <button
        onClick={handleDownload}
        disabled={state.status === 'loading' || state.status === 'done'}
        className="inline-flex items-center gap-2 bg-black text-white text-sm font-semibold px-5 py-2.5 rounded hover:bg-gray-800 disabled:opacity-50 transition-colors"
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
      </button>

      {state.status === 'error' && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2 max-w-md">
          {state.message}
        </p>
      )}

      {state.status === 'done' && (
        <p className="text-sm text-gray-500">
          Your download should begin automatically and we've also emailed you
          a copy. If it doesn't start,{' '}
          <button
            onClick={handleDownload}
            className="underline underline-offset-2 text-black"
          >
            try again
          </button>
          .
        </p>
      )}
    </div>
  )
}
