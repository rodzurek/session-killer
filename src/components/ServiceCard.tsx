'use client'

import { useState } from 'react'
import type { Service } from '@/types'

interface Props {
  service: Service
  onToggle: (taskId: number, wasDone: boolean) => void
  onDelete?: (serviceId: number) => void
}

function CopyButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false)

  const copy = async (e: React.MouseEvent) => {
    e.preventDefault()
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <button
      onClick={copy}
      title="Copy link"
      className="flex items-center gap-1 px-1.5 py-0.5 rounded text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
    >
      {copied ? (
        <span className="text-green-500">✓ Copied</span>
      ) : (
        <>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Copy
        </>
      )}
    </button>
  )
}

export default function ServiceCard({ service, onToggle, onDelete }: Props) {
  const [open, setOpen] = useState(false)
  const done = service.tasks.filter(t => t.completed).length
  const total = service.tasks.length
  const allDone = total > 0 && done === total

  return (
    <div className={`rounded-lg border transition-colors ${allDone ? 'border-green-500/30 bg-green-500/5' : 'border-gray-200 dark:border-gray-700'}`}>
      <button
        className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors rounded-lg"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        <span className="flex items-center gap-2 font-medium text-gray-900 dark:text-gray-100">
          {allDone && <span className="text-green-500 text-sm font-bold">✓</span>}
          {service.name}
        </span>
        <span className="flex items-center gap-2 flex-shrink-0">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            allDone
              ? 'bg-green-500/20 text-green-600 dark:text-green-400'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
          }`}>
            {done}/{total}
          </span>
          {onDelete && (
            <button
              className="text-gray-300 dark:text-gray-600 hover:text-red-500 text-lg leading-none px-1 transition-colors"
              title="Remove"
              onClick={e => { e.stopPropagation(); onDelete(service.id) }}
            >
              ×
            </button>
          )}
          <span className="text-gray-400 text-xs">{open ? '▴' : '▾'}</span>
        </span>
      </button>

      {open && (
        <ul className="border-t border-gray-100 dark:border-gray-700/50">
          {service.tasks.map(task => (
            <li
              key={task.id}
              className={`px-4 py-2.5 border-b border-gray-100 dark:border-gray-700/50 last:border-0 transition-opacity ${task.completed ? 'opacity-50' : ''}`}
            >
              <div className="flex items-start justify-between gap-3">
                <label className="flex items-start gap-2.5 cursor-pointer flex-1 min-w-0">
                  <input
                    type="checkbox"
                    checked={!!task.completed}
                    onChange={() => onToggle(task.id, !!task.completed)}
                    className="mt-0.5 h-4 w-4 flex-shrink-0 accent-violet-500 cursor-pointer"
                  />
                  {task.url ? (
                    <a
                      href={task.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      className={`text-sm text-violet-600 dark:text-violet-400 underline underline-offset-2 hover:text-violet-700 dark:hover:text-violet-300 transition-colors ${task.completed ? 'line-through opacity-50' : ''}`}
                    >
                      {task.label}
                    </a>
                  ) : (
                    <span className={`text-sm text-gray-800 dark:text-gray-200 ${task.completed ? 'line-through text-gray-400' : ''}`}>
                      {task.label}
                    </span>
                  )}
                </label>

                {task.url && <CopyButton url={task.url} />}
              </div>

              {task.description && (
                <p className="mt-1 ml-6 text-xs text-gray-400 dark:text-gray-500 leading-relaxed">
                  {task.description}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
