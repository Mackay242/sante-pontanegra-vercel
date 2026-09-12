'use client'

import { useEffect, useState } from 'react'
import {
  MessageSquare,
  Heart,
  Send,
  Trash2,
  Plus,
  Loader2,
} from 'lucide-react'
import { AppHeader } from '@/components/layout/navbar'
import { useAuth } from '@/components/auth-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { EmptyState, ErrorState, LoadingState } from '@/components/shared/states'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

type Post = {
  id: string
  title: string
  content: string
  category: string
  authorName: string
  authorId: string
  likes: number
  likedBy: string[]
  comments: Comment[]
  createdAt: string
}

type Comment = {
  id: string
  authorName: string
  content: string
  createdAt: string
}

const CATEGORIES = [
  { id: 'tous', label: 'Tous' },
  { id: 'general', label: 'Général' },
  { id: 'sante', label: 'Santé' },
  { id: 'maternite', label: 'Maternité' },
  { id: 'urgence', label: 'Urgences' },
  { id: 'nutrition', label: 'Nutrition' },
]

export default function CommunautePage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState('tous')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    category: 'general' as 'general' | 'sante' | 'maternite' | 'urgence' | 'nutrition',
  })

  useEffect(() => {
    loadPosts()
  }, [])

  async function loadPosts() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/posts', { cache: 'no-store' })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setPosts(data.posts)
    } catch {
      setError('Impossible de charger les publications.')
    } finally {
      setLoading(false)
    }
  }

  async function handleCreatePost(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPost),
      })
      const data = await res.json()
      if (!res.ok) {
        toast({
          title: 'Erreur',
          description: data.message ?? 'Publication impossible.',
          variant: 'destructive',
        })
        return
      }
      setPosts((p) => [{ ...data.post, comments: [] }, ...p])
      setNewPost({ title: '', content: '', category: 'general' })
      setDialogOpen(false)
      toast({ title: 'Publié !', description: 'Votre message est en ligne.' })
    } finally {
      setSubmitting(false)
    }
  }

  async function handleLike(postId: string) {
    if (!user) return
    // Optimistic update
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p
        const already = p.likedBy.includes(user.id)
        return {
          ...p,
          likes: already ? p.likes - 1 : p.likes + 1,
          likedBy: already
            ? p.likedBy.filter((id) => id !== user.id)
            : [...p.likedBy, user.id],
        }
      })
    )
    try {
      await fetch(`/api/posts/${postId}/like`, { method: 'POST' })
    } catch {
      // Revert on error
      loadPosts()
    }
  }

  async function handleDelete(postId: string) {
    if (!confirm('Supprimer cette publication ?')) return
    try {
      const res = await fetch(`/api/posts/${postId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      setPosts((prev) => prev.filter((p) => p.id !== postId))
      toast({ title: 'Supprimé', description: 'Publication supprimée.' })
    } catch {
      toast({
        title: 'Erreur',
        description: 'Suppression impossible.',
        variant: 'destructive',
      })
    }
  }

  async function handleComment(postId: string, content: string) {
    if (!user || !content.trim()) return
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error()
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, comments: [...p.comments, data.comment] } : p
        )
      )
    } catch {
      toast({
        title: 'Erreur',
        description: 'Commentaire impossible.',
        variant: 'destructive',
      })
    }
  }

  const visiblePosts =
    activeCategory === 'tous'
      ? posts
      : posts.filter((p) => p.category === activeCategory)

  return (
    <>
      <AppHeader
        title="Communauté"
        subtitle="Échangez avec d'autres habitants sur la santé au quotidien"
        backHref="/dashboard"
      />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <Button
              key={c.id}
              size="sm"
              variant={activeCategory === c.id ? 'default' : 'outline'}
              onClick={() => setActiveCategory(c.id)}
            >
              {c.label}
            </Button>
          ))}
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-1 h-4 w-4" />
              Nouvelle publication
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Partager avec la communauté</DialogTitle>
              <DialogDescription>
                Votre message sera visible par tous les membres.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreatePost} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titre</Label>
                <Input
                  id="title"
                  required
                  placeholder="Sujet de votre publication"
                  value={newPost.title}
                  onChange={(e) =>
                    setNewPost((p) => ({ ...p, title: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Catégorie</Label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.filter((c) => c.id !== 'tous').map((c) => (
                    <Button
                      key={c.id}
                      type="button"
                      size="sm"
                      variant={newPost.category === c.id ? 'default' : 'outline'}
                      onClick={() =>
                        setNewPost((p) => ({
                          ...p,
                          category: c.id as typeof newPost.category,
                        }))
                      }
                    >
                      {c.label}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Contenu</Label>
                <Textarea
                  id="content"
                  required
                  rows={4}
                  placeholder="Votre message…"
                  value={newPost.content}
                  onChange={(e) =>
                    setNewPost((p) => ({ ...p, content: e.target.value }))
                  }
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-1 h-4 w-4" />
                  )}
                  Publier
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <LoadingState message="Chargement des publications…" />
      ) : error ? (
        <ErrorState message={error} onRetry={loadPosts} />
      ) : visiblePosts.length === 0 ? (
        <EmptyState
          title="Aucune publication"
          description="Soyez le premier à partager une information santé avec la communauté."
          icon={<MessageSquare className="h-5 w-5" />}
        />
      ) : (
        <div className="space-y-4">
          {visiblePosts.map((p) => (
            <PostCard
              key={p.id}
              post={p}
              currentUserId={user?.id}
              onLike={() => handleLike(p.id)}
              onDelete={() => handleDelete(p.id)}
              onComment={(content) => handleComment(p.id, content)}
            />
          ))}
        </div>
      )}
    </>
  )
}

function PostCard({
  post,
  currentUserId,
  onLike,
  onDelete,
  onComment,
}: {
  post: Post
  currentUserId?: string
  onLike: () => void
  onDelete: () => void
  onComment: (content: string) => void
}) {
  const [comment, setComment] = useState('')
  const [showComments, setShowComments] = useState(false)
  const liked = currentUserId ? post.likedBy.includes(currentUserId) : false
  const canDelete = currentUserId === post.authorId

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold">{post.title}</h3>
            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="secondary" className="capitalize">
                {post.category}
              </Badge>
              <span>par {post.authorName}</span>
              <span>·</span>
              <span>{formatDate(post.createdAt)}</span>
            </div>
          </div>
          {canDelete && (
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={onDelete}
              aria-label="Supprimer"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="whitespace-pre-wrap text-sm">{post.content}</p>

        <div className="mt-4 flex items-center gap-2">
          <Button
            size="sm"
            variant={liked ? 'default' : 'outline'}
            onClick={onLike}
          >
            <Heart
              className={cn('mr-1 h-4 w-4', liked && 'fill-current')}
            />
            {post.likes}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowComments((v) => !v)}
          >
            <MessageSquare className="mr-1 h-4 w-4" />
            {post.comments.length}
          </Button>
        </div>

        {showComments && (
          <div className="mt-4 space-y-3 border-t pt-3">
            {post.comments.map((c) => (
              <div key={c.id} className="rounded-lg bg-muted/50 p-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {c.authorName}
                  </span>
                  <span>·</span>
                  <span>{formatDate(c.createdAt)}</span>
                </div>
                <p className="mt-1 text-sm">{c.content}</p>
              </div>
            ))}
            <form
              onSubmit={(e) => {
                e.preventDefault()
                onComment(comment)
                setComment('')
              }}
              className="flex gap-2"
            >
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
