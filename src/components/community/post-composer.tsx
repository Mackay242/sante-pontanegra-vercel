'use client'

import { useState } from 'react'
import { Send, Loader2, Video, Image as ImageIcon, Link2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { MediaDisplay } from '@/components/shared/media-display'
import { detectMediaType } from '@/lib/media'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

type PostType = 'post' | 'question' | 'alert'

const CATEGORIES = [
  { id: 'general', label: 'Général' },
  { id: 'sante', label: 'Santé' },
  { id: 'maternite', label: 'Maternité' },
  { id: 'urgence', label: 'Urgences' },
  { id: 'nutrition', label: 'Nutrition' },
]

const POST_TYPES: Array<{ id: PostType; label: string; emoji: string }> = [
  { id: 'post', label: 'Publication', emoji: '💬' },
  { id: 'question', label: 'Question', emoji: '❓' },
  { id: 'alert', label: 'Alerte', emoji: '🚨' },
]

export function PostComposer({
  canPostAlert,
  onSubmit,
}: {
  canPostAlert: boolean
  onSubmit: (data: {
    title: string
    content: string
    category: string
    postType: PostType
    mediaUrl?: string
    mediaType?: string
  }) => Promise<boolean>
}) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    title: '',
    content: '',
    category: 'general',
    postType: 'post' as PostType,
    mediaUrl: '',
  })
  const [showMediaInput, setShowMediaInput] = useState(false)

  const mediaInfo = form.mediaUrl ? detectMediaType(form.mediaUrl) : null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim() || !form.content.trim()) return

    // Prevent non-medical users from posting alerts
    const finalPostType =
      form.postType === 'alert' && !canPostAlert ? 'post' : form.postType

    setSubmitting(true)
    const ok = await onSubmit({
      ...form,
      postType: finalPostType,
      mediaUrl: form.mediaUrl || undefined,
      mediaType: mediaInfo?.type ?? undefined,
    })
    setSubmitting(false)

    if (ok) {
      setForm({
        title: '',
        content: '',
        category: 'general',
        postType: 'post',
        mediaUrl: '',
      })
      setShowMediaInput(false)
      setOpen(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Send className="mr-1 h-4 w-4" />
          Nouvelle publication
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Partager avec la communauté</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Post type */}
          <div className="space-y-2">
            <Label>Type de publication</Label>
            <div className="flex flex-wrap gap-2">
              {POST_TYPES.map((t) => {
                const disabled = t.id === 'alert' && !canPostAlert
                return (
                  <Button
                    key={t.id}
                    type="button"
                    size="sm"
                    variant={form.postType === t.id ? 'default' : 'outline'}
                    onClick={() => setForm((f) => ({ ...f, postType: t.id }))}
                    disabled={disabled}
                    title={disabled ? 'Réservé au personnel médical' : undefined}
                    className={cn(disabled && 'cursor-not-allowed opacity-50')}
                  >
                    <span className="mr-1">{t.emoji}</span>
                    {t.label}
                  </Button>
                )
              })}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Titre</Label>
            <Input
              id="title"
              required
              placeholder={
                form.postType === 'question'
                  ? 'Posez votre question…'
                  : form.postType === 'alert'
                  ? 'Titre de l\'alerte santé…'
                  : 'Sujet de votre publication'
              }
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Catégorie</Label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <Button
                  key={c.id}
                  type="button"
                  size="sm"
                  variant={form.category === c.id ? 'default' : 'outline'}
                  onClick={() => setForm((f) => ({ ...f, category: c.id }))}
                >
                  {c.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Contenu</Label>
            <Textarea
              id="content"
              required
              rows={4}
              placeholder="Votre message…"
              value={form.content}
              onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
            />
          </div>

          {/* Media (video/image) */}
          <div className="space-y-2">
            <Label>Média (vidéo ou image)</Label>
            {!showMediaInput && !form.mediaUrl && (
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setShowMediaInput(true)}
                >
                  <Video className="mr-1 h-4 w-4" />
                  Vidéo
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setShowMediaInput(true)}
                >
                  <ImageIcon className="mr-1 h-4 w-4" />
                  Image
                </Button>
              </div>
            )}

            {showMediaInput && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Link2 className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Collez un lien YouTube, Vimeo ou URL d'image…"
                    value={form.mediaUrl}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, mediaUrl: e.target.value }))
                    }
                    type="url"
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      setForm((f) => ({ ...f, mediaUrl: '' }))
                      setShowMediaInput(false)
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  💡 Vous pouvez coller un lien YouTube, Vimeo, ou une URL directe vers une vidéo MP4 ou une image.
                </p>
              </div>
            )}

            {/* Preview */}
            {form.mediaUrl && mediaInfo?.type && (
              <div className="rounded-lg border p-2">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">
                    Aperçu · {mediaInfo.type}
                  </span>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                    onClick={() => {
                      setForm((f) => ({ ...f, mediaUrl: '' }))
                      setShowMediaInput(false)
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <MediaDisplay url={form.mediaUrl} type={mediaInfo.type} />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
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
  )
}
