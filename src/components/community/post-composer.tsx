'use client'

import { useState, useRef } from 'react'
import { Send, Loader2, Video, Image as ImageIcon, Link2, X, Camera, Film } from 'lucide-react'
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

// Max file size: 5 MB (base64 makes it ~33% larger, so 5MB binary → 6.6MB base64)
const MAX_FILE_SIZE = 5 * 1024 * 1024

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
  })
  const [showMediaInput, setShowMediaInput] = useState(false)
  const [mediaUrl, setMediaUrl] = useState('')
  const [mediaType, setMediaType] = useState<string | undefined>(undefined)
  const [mediaSource, setMediaSource] = useState<'url' | 'file' | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

  const mediaInfo = mediaUrl ? detectMediaType(mediaUrl) : null

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: 'Fichier trop volumineux',
        description: 'Maximum 5 MB. Pour les vidéos longues, utilisez un lien YouTube.',
        variant: 'destructive',
      })
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      setMediaUrl(result)
      if (file.type.startsWith('image/')) setMediaType('image')
      else if (file.type.startsWith('video/')) setMediaType('video')
      else if (file.type.startsWith('audio/')) setMediaType('video')
      setMediaSource('file')
    }
    reader.readAsDataURL(file)

    toast({
      title: 'Média ajouté',
      description: `${file.type.split('/')[0].toUpperCase()} (${(file.size / 1024 / 1024).toFixed(1)} MB)`,
    })
  }

  function handleUrlInput(url: string) {
    setMediaUrl(url)
    setMediaSource('url')
    const detected = detectMediaType(url)
    setMediaType(detected.type ?? undefined)
  }

  function clearMedia() {
    setMediaUrl('')
    setMediaType(undefined)
    setMediaSource(null)
    setShowMediaInput(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (cameraInputRef.current) cameraInputRef.current.value = ''
    if (videoInputRef.current) videoInputRef.current.value = ''
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim() || !form.content.trim()) return

    const finalPostType =
      form.postType === 'alert' && !canPostAlert ? 'post' : form.postType

    setSubmitting(true)
    const ok = await onSubmit({
      ...form,
      postType: finalPostType,
      mediaUrl: mediaUrl || undefined,
      mediaType: mediaType,
    })
    setSubmitting(false)

    if (ok) {
      setForm({
        title: '',
        content: '',
        category: 'general',
        postType: 'post',
      })
      clearMedia()
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

          {/* Media section */}
          <div className="space-y-2">
            <Label>Média (photo / vidéo)</Label>
            {!showMediaInput && !mediaUrl && (
              <div className="flex flex-wrap gap-2">
                {/* Prendre une photo */}
                <label className="cursor-pointer">
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="cursor-pointer"
                  >
                    <Camera className="mr-1 h-4 w-4" />
                    Prendre une photo
                  </Button>
                </label>

                {/* Filmer une vidéo */}
                <label className="cursor-pointer">
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/*"
                    capture="environment"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="cursor-pointer"
                  >
                    <Film className="mr-1 h-4 w-4" />
                    Filmer une vidéo
                  </Button>
                </label>

                {/* Choisir depuis la galerie */}
                <label className="cursor-pointer">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="cursor-pointer"
                  >
                    <ImageIcon className="mr-1 h-4 w-4" />
                    Galerie
                  </Button>
                </label>

                {/* Coller un lien (YouTube, Vimeo, MP4) */}
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setShowMediaInput(true)}
                >
                  <Link2 className="mr-1 h-4 w-4" />
                  Coller un lien
                </Button>
              </div>
            )}

            {showMediaInput && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Link2 className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Collez un lien YouTube, Vimeo ou URL d'image…"
                    value={mediaSource === 'url' ? mediaUrl : ''}
                    onChange={(e) => handleUrlInput(e.target.value)}
                    type="url"
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={clearMedia}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  💡 Pour les vidéos longues, préférez un lien YouTube/Vimeo.
                </p>
              </div>
            )}

            {/* Preview */}
            {mediaUrl && (
              <div className="rounded-lg border p-2">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">
                    {mediaSource === 'file' ? '📁 Fichier' : '🔗 Lien'} · {mediaType}
                  </span>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                    onClick={clearMedia}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <div className="max-h-60 overflow-hidden rounded">
                  <MediaDisplay url={mediaUrl} type={mediaType} />
                </div>
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
