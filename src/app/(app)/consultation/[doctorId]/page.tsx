'use client'

import { use, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Send, Loader2, Image as ImageIcon, Mic, X, ArrowLeft } from 'lucide-react'
import { AppHeader } from '@/components/layout/navbar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { MediaDisplay } from '@/components/shared/media-display'
import { useAuth } from '@/components/auth-provider'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import Link from 'next/link'

type Consultation = {
  id: string
  doctorId: string
  patientId: string
  status: string
  doctor: {
    id: string
    name: string
    role: string
    specialty: string | null
    avatarUrl: string | null
  }
  messages: Message[]
}

type Message = {
  id: string
  senderId: string
  content: string | null
  mediaUrl: string | null
  mediaType: string | null
  isFromDoctor: boolean
  createdAt: string
}

export default function ConsultationPage({
  params,
}: {
  params: Promise<{ doctorId: string }>
}) {
  const { doctorId } = use(params)
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [consultation, setConsultation] = useState<Consultation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [mediaFile, setMediaFile] = useState<string | null>(null)
  const [mediaType, setMediaType] = useState<'image' | 'audio' | 'video' | null>(null)
  const [recording, setRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  useEffect(() => {
    loadConsultation()
  }, [])

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [messages])

  async function loadConsultation() {
    setLoading(true)
    try {
      const res = await fetch(`/api/consultations/doctor/${doctorId}`, {
        cache: 'no-store',
      })
      const data = await res.json()
      if (!res.ok) throw new Error()
      setConsultation(data.consultation)
      setMessages(data.consultation.messages ?? [])
    } catch {
      toast({
        title: 'Erreur',
        description: 'Consultation impossible à ouvrir.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleSend(e?: React.FormEvent) {
    e?.preventDefault()
    if ((!input.trim() && !mediaFile) || sending) return

    setSending(true)
    try {
      const res = await fetch(`/api/consultations/${consultation?.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: input.trim() || undefined,
          mediaUrl: mediaFile || undefined,
          mediaType: mediaType || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error()
      setMessages((m) => [...m, data.message])
      setInput('')
      setMediaFile(null)
      setMediaType(null)
    } catch {
      toast({
        title: 'Erreur',
        description: 'Envoi impossible.',
        variant: 'destructive',
      })
    } finally {
      setSending(false)
    }
  }

  // Handle file upload (photo/video)
  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Limit: 5MB
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Fichier trop volumineux',
        description: 'Maximum 5 MB.',
        variant: 'destructive',
      })
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      setMediaFile(result)
      if (file.type.startsWith('image/')) setMediaType('image')
      else if (file.type.startsWith('video/')) setMediaType('video')
      else if (file.type.startsWith('audio/')) setMediaType('audio')
    }
    reader.readAsDataURL(file)
  }

  // Handle audio recording
  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      mediaRecorderRef.current = recorder
      chunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const reader = new FileReader()
        reader.onload = () => {
          setAudioBlob(reader.result as string)
          setMediaFile(reader.result as string)
          setMediaType('audio')
        }
        reader.readAsDataURL(blob)
        stream.getTracks().forEach((t) => t.stop())
      }

      recorder.start()
      setRecording(true)
    } catch (err) {
      console.error(err)
      toast({
        title: 'Microphone inaccessible',
        description: 'Vérifiez les autorisations du navigateur.',
        variant: 'destructive',
      })
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop()
    setRecording(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!consultation) {
    return (
      <Card className="border-destructive/30">
        <CardContent className="py-8 text-center">
          <p>Consultation introuvable.</p>
          <Link href="/medecins" className="mt-3 inline-block text-primary">
            ← Retour à l'annuaire
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <AppHeader
        title={`Consultation avec ${consultation.doctor.name}`}
        subtitle={consultation.doctor.specialty ?? 'Médecin'}
        backHref="/medecins"
      />

      <Card className="flex h-[calc(100vh-12rem)] flex-col overflow-hidden">
        {/* Header with doctor info */}
        <div className="flex items-center gap-3 border-b bg-medical-gradient-soft p-3">
          <Link href="/medecins" className="rounded-full p-1 hover:bg-muted">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-medical-gradient text-sm font-bold text-white">
            {consultation.doctor.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold">{consultation.doctor.name}</p>
            <p className="text-xs text-muted-foreground">
              {consultation.doctor.specialty ?? 'Médecin'} · Consultation privée
            </p>
          </div>
        </div>

        {/* Messages */}
        <div
          ref={scrollRef}
          className="flex-1 space-y-3 overflow-y-auto bg-muted/30 p-4"
        >
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center text-center">
              <div>
                <p className="text-sm text-muted-foreground">
                  Démarrez la conversation avec {consultation.doctor.name}.
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Envoyez un message, une photo ou un message vocal.
                </p>
              </div>
            </div>
          ) : (
            messages.map((m) => (
              <div
                key={m.id}
                className={cn(
                  'flex',
                  m.isFromDoctor ? 'justify-start' : 'justify-end'
                )}
              >
                <div
                  className={cn(
                    'max-w-[80%] rounded-2xl px-4 py-2 text-sm',
                    m.isFromDoctor
                      ? 'bg-card border shadow-sm'
                      : 'bg-primary text-primary-foreground'
                  )}
                >
                  {m.mediaUrl && m.mediaType && (
                    <div className="mb-2">
                      <MediaDisplay url={m.mediaUrl} type={m.mediaType} />
                    </div>
                  )}
                  {m.content && (
                    <p className="whitespace-pre-wrap">{m.content}</p>
                  )}
                  <p
                    className={cn(
                      'mt-1 text-[10px]',
                      m.isFromDoctor ? 'text-muted-foreground' : 'text-white/70'
                    )}
                  >
                    {formatTime(m.createdAt)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Media preview (before sending) */}
        {mediaFile && (
          <div className="border-t bg-card p-2">
            <div className="relative inline-block">
              <MediaDisplay url={mediaFile} type={mediaType ?? undefined} className="max-h-32" />
              <button
                onClick={() => {
                  setMediaFile(null)
                  setMediaType(null)
                  setAudioBlob(null)
                }}
                className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-white"
                aria-label="Retirer"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          </div>
        )}

        {/* Input */}
        <form
          onSubmit={handleSend}
          className="flex items-end gap-2 border-t bg-card p-3"
        >
          {/* Photo/video picker */}
          <label className="cursor-pointer">
            <input
              type="file"
              accept="image/*,video/*"
              capture="environment"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border bg-card text-muted-foreground hover:bg-muted">
              <ImageIcon className="h-4 w-4" />
            </div>
          </label>

          {/* Audio recording */}
          <Button
            type="button"
            size="icon"
            variant={recording ? 'destructive' : 'outline'}
            onClick={recording ? stopRecording : startRecording}
            className="h-10 w-10"
          >
            <Mic className="h-4 w-4" />
          </Button>

          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Écrivez votre message…"
            rows={1}
            className="resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
          />
          <Button type="submit" size="icon" disabled={(!input.trim() && !mediaFile) || sending}>
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </Card>

      <p className="mt-2 text-center text-xs text-muted-foreground">
        ⚠️ Cette consultation ne remplace pas une visite médicale. En cas d&apos;urgence, appelez le 118.
      </p>
    </>
  )
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return ''
  }
}
