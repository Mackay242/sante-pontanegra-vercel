'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

type ReactionType = 'like' | 'thanks' | 'useful' | 'support' | 'share'

const REACTIONS: Array<{
  type: ReactionType
  emoji: string
  label: string
  color: string
}> = [
  { type: 'like', emoji: '👍', label: 'J\'aime', color: 'text-blue-600' },
  { type: 'thanks', emoji: '🙏', label: 'Merci', color: 'text-amber-600' },
  { type: 'useful', emoji: '💡', label: 'Utile', color: 'text-yellow-500' },
  { type: 'support', emoji: '❤️', label: 'Soutien', color: 'text-red-500' },
  { type: 'share', emoji: '📢', label: 'Partager', color: 'text-green-600' },
]

/**
 * Reaction bar — 5 reactions + counts.
 * User can react with one type at a time (toggles).
 */
export function ReactionBar({
  postId,
  counts,
  userReaction,
  onReact,
}: {
  postId: string
  counts: Record<ReactionType, number>
  userReaction: ReactionType | null
  onReact: (postId: string, type: ReactionType) => Promise<void>
}) {
  const [showPicker, setShowPicker] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleReact(type: ReactionType) {
    setLoading(true)
    try {
      await onReact(postId, type)
    } finally {
      setLoading(false)
      setShowPicker(false)
    }
  }

  // Compact display: only show reactions with count > 0, plus a "react" button
  const visibleReactions = REACTIONS.filter(
    (r) => (counts[r.type] ?? 0) > 0 || userReaction === r.type
  )

  return (
    <div className="relative flex flex-wrap items-center gap-1">
      {visibleReactions.map((r) => {
        const count = counts[r.type] ?? 0
        const isMine = userReaction === r.type
        return (
          <button
            key={r.type}
            type="button"
            disabled={loading}
            onClick={() => handleReact(r.type)}
            className={cn(
              'flex items-center gap-1 rounded-full border px-2 py-1 text-xs transition tap-feedback',
              isMine
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border bg-card hover:bg-muted'
            )}
            title={r.label}
          >
            <span className="text-sm">{r.emoji}</span>
            {count > 0 && <span className="font-medium tabular-nums">{count}</span>}
          </button>
        )
      })}

      <button
        type="button"
        disabled={loading}
        onClick={() => setShowPicker((v) => !v)}
        className={cn(
          'rounded-full border border-dashed px-2 py-1 text-xs text-muted-foreground hover:bg-muted tap-feedback',
          showPicker && 'bg-muted'
        )}
        title="Réagir"
      >
        + Réagir
      </button>

      {showPicker && (
        <div className="absolute bottom-full left-0 z-10 mb-1 flex gap-1 rounded-full border bg-card p-1 shadow-lg">
          {REACTIONS.map((r) => (
            <button
              key={r.type}
              type="button"
              disabled={loading}
              onClick={() => handleReact(r.type)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-lg transition hover:bg-muted tap-feedback"
              title={r.label}
            >
              {r.emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
