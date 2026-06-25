'use client'

import { useState, useCallback } from 'react'
import type { Service } from '@/types'
import ServiceCard from './ServiceCard'

const CATEGORIES = {
  email:     { label: 'Email',      emoji: '✉️' },
  social:    { label: 'Social',     emoji: '🌐' },
  dev:       { label: 'Dev / Code', emoji: '💻' },
  financial: { label: 'Financial',  emoji: '💳' },
  custom:    { label: 'Custom',     emoji: '⚙️' },
} as const

interface Props {
  initialServices: Service[]
}

export default function ChecklistApp({ initialServices }: Props) {
  const [services, setServices] = useState<Service[]>(initialServices)
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [confirming, setConfirming] = useState(false)

  const reload = useCallback(async () => {
    const res = await fetch('/api/services')
    if (res.ok) setServices(await res.json())
  }, [])

  const toggleTask = async (taskId: number, wasDone: boolean) => {
    setServices(prev =>
      prev.map(s => ({
        ...s,
        tasks: s.tasks.map(t =>
          t.id === taskId ? { ...t, completed: !wasDone } : t
        ),
      }))
    )
    const res = await fetch(`/api/tasks/${taskId}/toggle`, { method: 'POST' })
    if (!res.ok) {
      setServices(prev =>
        prev.map(s => ({
          ...s,
          tasks: s.tasks.map(t =>
            t.id === taskId ? { ...t, completed: wasDone } : t
          ),
        }))
      )
    }
  }

  const addService = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return
    await fetch('/api/services', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName.trim() }),
    })
    setNewName('')
    setShowAdd(false)
    reload()
  }

  const deleteService = async (id: number) => {
    await fetch(`/api/services/${id}`, { method: 'DELETE' })
    reload()
  }

  const resetAll = async () => {
    await fetch('/api/reset', { method: 'POST' })
    setConfirming(false)
    reload()
  }

  const allTasks = services.flatMap(s => s.tasks)
  const doneCount = allTasks.filter(t => t.completed).length
  const totalCount = allTasks.length
  const pct = totalCount ? (doneCount / totalCount) * 100 : 0
  const allClear = doneCount === totalCount && totalCount > 0

  const grouped = (Object.entries(CATEGORIES) as [keyof typeof CATEGORIES, { label: string; emoji: string }][])
    .map(([id, meta]) => ({
      id,
      ...meta,
      list: services.filter(s => s.category === id),
    }))
    .filter(g => g.list.length > 0)

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <span className="text-red-500">●</span>
            Session Killer
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">Session compromised — work through this checklist</p>
        </div>
        <div className="flex items-center gap-2">
          {confirming ? (
            <span className="flex items-center gap-2 text-sm text-gray-500">
              Reset all progress?
              <button
                onClick={resetAll}
                className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded-md transition-colors"
              >
                Reset
              </button>
              <button
                onClick={() => setConfirming(false)}
                className="px-3 py-1.5 border border-gray-200 dark:border-gray-700 text-xs font-medium rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
            </span>
          ) : (
            <button
              onClick={() => setConfirming(true)}
              className="px-3 py-1.5 border border-gray-200 dark:border-gray-700 text-xs font-medium rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              New Incident
            </button>
          )}
        </div>
      </header>

      {/* Progress */}
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800/60">
        <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-2">
          <div
            className={`h-full rounded-full transition-all duration-300 ${allClear ? 'bg-green-500' : 'bg-violet-500'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-xs text-gray-400">
          {allClear ? '✅ All clear' : `${doneCount} / ${totalCount} tasks done`}
        </p>
      </div>

      {/* Checklist */}
      <main className="max-w-2xl px-6 py-6 space-y-8">
        {grouped.map(g => (
          <section key={g.id}>
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3 flex items-center gap-1.5">
              <span>{g.emoji}</span>
              {g.label}
            </h2>
            <div className="space-y-2">
              {g.list.map(s => (
                <ServiceCard
                  key={s.id}
                  service={s}
                  onToggle={toggleTask}
                  onDelete={!s.is_builtin ? deleteService : undefined}
                />
              ))}
            </div>
          </section>
        ))}

        {/* Add custom service */}
        <div className="pb-10">
          {showAdd ? (
            <form onSubmit={addService} className="flex gap-2 flex-wrap items-center">
              <input
                autoFocus
                type="text"
                placeholder="Service name (e.g. Dropbox)"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                className="flex-1 min-w-[200px] px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-violet-500 hover:bg-violet-600 text-white text-sm font-medium rounded-md transition-colors"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => setShowAdd(false)}
                className="px-3 py-2 border border-gray-200 dark:border-gray-700 text-sm rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
            </form>
          ) : (
            <button
              onClick={() => setShowAdd(true)}
              className="px-4 py-2 text-sm text-violet-500 border border-dashed border-violet-300 dark:border-violet-700 rounded-md hover:bg-violet-50 dark:hover:bg-violet-950/30 transition-colors"
            >
              + Add Custom Service
            </button>
          )}
        </div>
      </main>
    </div>
  )
}
