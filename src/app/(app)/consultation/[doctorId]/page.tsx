'use client'

import { use, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Send, Loader2, Image as ImageIcon, Mic, X, ArrowLeft, Video as VideoIcon, Camera, Square } from 'lucide-react'
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

type RecordingMode = 'audio' | 'video' | null

const MAX_FILE_SIZE = 5 * 1024 * 1024

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
  const [recording, setRecording] = useState<RecordingMode>(null)
  const [recordingTime, setRecordingTime] = useState(0)

  const scrollRef = useRef<HTMLDivElement>(null)
  const photoInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null)
  const videoPreviewRef = useRef<HTMLVideoElement | null>(null)

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

  function showToast(title: string, variant: 'default' | 'destructive' = 'default') {
    toast({ title, variant })
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > MAX_FILE_SIZE) {
      showToast('Fichier trop volumineux (max 5 MB)', 'destructive')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setMediaFile(reader.result as string)
      if (file.type.startsWith('image/')) setMediaType('image')
      else if (file.type.startsWith('video/')) setMediaType('video')
      else if (file.type.startsWith('audio/')) setMediaType('audio')
    }
    reader.readAsDataURL(file)

    e.target.value = ''
  }

  async function startAudioRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      await startRecordingInternal(stream, 'audio')
    } catch (err) {
      console.error(err)
      showToast('Microphone inaccessible', 'destructive')
    }
  }

  async function startVideoRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: true,
      })
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream
        videoPreviewRef.current.play().catch(() => {})
      }
      await startRecordingInternal(stream, 'video')
    } catch (err) {
      console.error(err)
      showToast('Caméra inaccessible', 'destructive')
    }
  }

  async function startRecordingInternal(stream: MediaStream, mode: RecordingMode) {
    const recorder = new MediaRecorder(stream)
    mediaRecorderRef.current = recorder
    chunksRef.current = []

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data)
    }

    recorder.onstop = () => {
      const mimeType = mode === 'video' ? 'video/webm' : 'audio/webm'
      const blob = new Blob(chunksRef.current, { type: mimeType })
      if (blob.size > MAX_FILE_SIZE) {
        showToast(`${mode === 'video' ? 'Vidéo' : 'Message audio'} trop long (max 5 MB)`, 'destructive')
      } else {
        const reader = new FileReader()
        reader.onload = () => {
          setMediaFile(reader.result as string)
          setMediaType(mode === 'video' ? 'video' : 'audio')
        }
        reader.readAsDataURL(blob)
      }
      stream.getTracks().forEach((t) => t.stop())
    }

    recorder.start()
    setRecording(mode)
    setRecordingTime(0)
    recordingTimerRef.current = setInterval(() => {
      setRecordingTime((t) => t + 1)
    }, 1000)
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop()
    setRecording(null)
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current)
      recordingTimerRef.current = null
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
      showToast('Erreur', 'destructive')
    } finally {
      setSending(false)
    }
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
        {/* Header */}
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
                  Envoyez un message, une photo, un message audio ou une vidéo.
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
                  {m.content && <p className="whitespace-pre-wrap">{m.content}</p>}
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

        {/* Live video preview during recording */}
        {recording === 'video' && (
          <div className="border-t bg-black p-2">
            <div className="relative">
              <video
                ref={videoPreviewRef}
                autoPlay
                muted
                playsInline
                className="max-h-40 w-full rounded-lg"
              />
              <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-red-600 px-2 py-1 text-xs font-bold text-white">
                <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
                REC {formatDuration(recordingTime)}
              </div>
            </div>
          </div>
        )}

        {/* Audio recording indicator */}
        {recording === 'audio' && (
          <div className="flex items-center justify-between border-t bg-red-50 p-2 dark:bg-red-950/30">
            <div className="flex items-center gap-2 text-sm text-red-600">
              <span className="h-2 w-2 animate-pulse rounded-full bg-red-600" />
              <span>🎤 Enregistrement audio… {formatDuration(recordingTime)}</span>
            </div>
            <Button size="sm" variant="destructive" onClick={stopRecording}>
              <Square className="mr-1 h-3 w-3" />
              Arrêter
            </Button>
          </div>
        )}

        {/* Stop button for video recording */}
        {recording === 'video' && (
          <div className="flex justify-center border-t bg-card p-2">
            <Button size="sm" variant="destructive" onClick={stopRecording}>
              <Square className="mr-1 h-3 w-3" />
              Arrêter et envoyer
            </Button>
          </div>
        )}

        {/* Media preview */}
        {mediaFile && !recording && (
          <div className="border-t bg-card p-2">
            <div className="relative inline-block">
              <MediaDisplay url={mediaFile} type={mediaType ?? undefined} className="max-h-32" />
              <button
                onClick={() => {
                  setMediaFile(null)
                  setMediaType(null)
                }}
                className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-white"
                aria-label="Retirer"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          </div>
        )}

        {/* Hidden file inputs */}
        <input
          ref={photoInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileSelect}
          className="hidden"
        />
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*,video/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Input bar */}
        <form onSubmit={handleSend} className="flex items-end gap-1 border-t bg-card p-2">
          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={() => photoInputRef.current?.click()}
            className="h-10 w-10"
            title="Prendre une photo"
          >
            <Camera className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            size="icon"
            variant={recording === 'video' ? 'destructive' : 'outline'}
            onClick={recording === 'video' ? stopRecording : startVideoRecording}
            className="h-10 w-10"
            title="Enregistrer une vidéo"
          >
            <VideoIcon className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            size="icon"
            variant={recording === 'audio' ? 'destructive' : 'outline'}
            onClick={recording === 'audio' ? stopRecording : startAudioRecording}
            className="h-10 w-10"
            title="Enregistrer un message audio"
          >
            <Mic className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={() => galleryInputRef.current?.click()}
            className="h-10 w-10"
            title="Choisir depuis la galerie"
          >
            <ImageIcon className="h-4 w-4" />
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
          <Button type="submit" size="icon" disabled={(!input.trim() && !mediaFile) || sending || !!recording}>
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </Card>
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

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}
