'use client'

import { useState } from 'react'
import { Pin, MessageSquare, Trash2, Check, Send } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card'
import { RoleBadge, RoleAvatar } from '@/components/shared/role-badge'
import { ReactionBar } from '@/components/shared/reaction-bar'
import { MediaDisplay } from '@/components/shared/media-display'
import type { Role } from '@/lib/roles'

type Author = {
  id: string
  name: string
  role: Role
  specialty: string | null
  avatarUrl: string | null
}

type Comment = {
  id: string
  authorName: string
  authorId: string
  author: Author
  content: string
  isMedicalAnswer: boolean
  pinned: boolean
  createdAt: string
}

type ReactionType = 'like' | 'thanks' | 'useful' | 'support' | 'share'

export type Post = {
  id: string
  title: string
  content: string
  category: string
  postType: string // post | question | alert
  authorName: string
  authorId: string
  author: Author
  likes: number
  likedBy: string[]
  reactionCounts: Record<ReactionType, number>
  pinned: boolean
  solved: boolean
  mediaUrl: string | null
  mediaType: string | null
  createdAt: string
  comments: Comment[]
}

const POST_TYPE_BADGES = {
  question: { label: '❓ Question', className: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300' },
  alert: { label: '🚨 Alerte', className: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300' },
  post: { label: '💬 Publication', className: 'bg-muted text-muted-foreground' },
} as const

export function PostCard({
  post,
  currentUserId,
  currentUserRole,
  onDelete,
  onComment,
  onPin,
  onSolve,
  onReact,
}: {
  post: Post
  currentUserId?: string
  currentUserRole?: Role
  onDelete: (postId: string) => void
  onComment: (postId: string, content: string) => void
  onPin?: (postId: string) => Promise<void>
  onSolve?: (postId: string) => Promise<void>
  onReact: (postId: string, type: ReactionType) => Promise<void>
}) {
  const [comment, setComment] = useState('')
  const [showComments, setShowComments] = useState(false)
  const [pinning, setPinning] = useState(false)
  const [solving, setSolving] = useState(false)

  const canPin =
    currentUserRole && ['DOCTOR', 'NURSE', 'ADMIN'].includes(currentUserRole)
  const canSolve =
    currentUserRole &&
    (post.authorId === currentUserId ||
      ['DOCTOR', 'NURSE', 'ADMIN'].includes(currentUserRole))
  const canDelete = currentUserId === post.authorId || currentUserRole === 'ADMIN'

  async function handlePin() {
    if (!onPin) return
    setPinning(true)
    try {
      await onPin(post.id)
    } finally {
      setPinning(false)
    }
  }

  async function handleSolve() {
    if (!onSolve) return
    setSolving(true)
    try {
      await onSolve(post.id)
    } finally {
      setSolving(false)
    }
  }

  function handleComment(e: React.FormEvent) {
    e.preventDefault()
    if (!comment.trim()) return
    onComment(post.id, comment)
    setComment('')
  }

  const typeBadge = POST_TYPE_BADGES[post.postType as keyof typeof POST_TYPE_BADGES]

  return (
    <Card
      className={cn(
        'overflow-hidden',
        post.pinned && 'border-primary/40 bg-primary/5',
        post.author.role === 'DOCTOR' &&
          !post.pinned &&
          'border-l-4 border-l-primary',
        post.author.role === 'NURSE' &&
          !post.pinned &&
          'border-l-4 border-l-blue-500'
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <RoleAvatar
              name={post.authorName}
              role={post.author.role}
              avatarUrl={post.author.avatarUrl}
              size="md"
            />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold">{post.authorName}</span>
                <RoleBadge role={post.author.role} specialty={post.author.specialty} />
                {post.pinned && (
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    <Pin className="mr-1 h-3 w-3" />
                    Épinglé
                  </Badge>
                )}
                {post.solved && (
                  <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300">
                    <Check className="mr-1 h-3 w-3" />
                    Résolu
                  </Badge>
                )}
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                {typeBadge && (
                  <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold', typeBadge.className)}>
                    {typeBadge.label}
                  </span>
                )}
                <Badge variant="outline" className="capitalize text-[10px]">
                  {post.category}
                </Badge>
                <span>· {formatDate(post.createdAt)}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {canPin && (
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-muted-foreground hover:text-primary"
                onClick={handlePin}
                disabled={pinning}
                title={post.pinned ? 'Désépingler' : 'Épingler'}
              >
                <Pin className={cn('h-4 w-4', post.pinned && 'fill-primary text-primary')} />
              </Button>
            )}
            {canSolve && post.postType === 'question' && (
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-muted-foreground hover:text-green-600"
                onClick={handleSolve}
                disabled={solving}
                title={post.solved ? 'Marquer non résolu' : 'Marquer résolu'}
              >
                <Check className={cn('h-4 w-4', post.solved && 'text-green-600')} />
              </Button>
            )}
            {canDelete && (
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => onDelete(post.id)}
                title="Supprimer"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <h3 className="font-semibold leading-tight">{post.title}</h3>
        <p className="mt-2 whitespace-pre-wrap text-sm">{post.content}</p>

        {/* Media (video/image) */}
        {post.mediaUrl && (
          <div className="mt-3">
            <MediaDisplay url={post.mediaUrl} type={post.mediaType ?? undefined} />
          </div>
        )}

        {/* Reactions + comments count */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <ReactionBar
            postId={post.id}
            counts={post.reactionCounts ?? { like: 0, thanks: 0, useful: 0, support: 0, share: 0 }}
            userReaction={null}
            onReact={onReact}
          />
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowComments((v) => !v)}
          >
            <MessageSquare className="mr-1 h-4 w-4" />
            {post.comments.length}
          </Button>
        </div>

        {/* Comments */}
        {showComments && (
          <div className="mt-4 space-y-3 border-t pt-3">
            {post.comments.map((c) => (
              <CommentItem key={c.id} comment={c} />
            ))}
            <form onSubmit={handleComment} className="flex gap-2">
              <Input
                placeholder="Ajouter un commentaire…"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <Button type="submit" size="icon" disabled={!comment.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function CommentItem({ comment }: { comment: Comment }) {
  const isMedical = comment.isMedicalAnswer
  const isPinned = comment.pinned

  return (
    <div
      className={cn(
        'rounded-lg p-3',
        isMedical
          ? 'border border-primary/30 bg-primary/5'
          : isPinned
          ? 'border border-amber-300 bg-amber-50 dark:bg-amber-950/20'
          : 'bg-muted/50'
      )}
    >
      <div className="mb-1 flex items-center gap-2 text-xs">
        <RoleAvatar
          name={comment.author.name}
          role={comment.author.role}
          avatarUrl={comment.author.avatarUrl}
          size="sm"
        />
        <div className="flex flex-wrap items-center gap-1">
          <span className="font-medium text-foreground">
            {comment.author.name}
          </span>
          <RoleBadge
            role={comment.author.role}
            specialty={comment.author.specialty}
            showSpecialty={false}
            size="xs"
          />
          {isMedical && (
            <span className="rounded-full bg-primary px-1.5 py-0 text-[10px] font-semibold text-primary-foreground">
              ✓ Réponse médicale
            </span>
          )}
          {isPinned && (
            <span className="rounded-full bg-amber-500 px-1.5 py-0 text-[10px] font-semibold text-white">
              Épinglé
            </span>
          )}
        </div>
        <span className="ml-auto text-muted-foreground">
          {formatDate(comment.createdAt)}
        </span>
      </div>
      <p className="text-sm">{comment.content}</p>
    </div>
  )
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const diff = (now.getTime() - d.getTime()) / 1000
  if (diff < 60) return 'à l\'instant'
  if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`
  if (diff < 86400) return `il y a ${Math.floor(diff / 3600)} h`
  return d.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}
