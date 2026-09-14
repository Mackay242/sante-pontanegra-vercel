'use client'

import { useEffect, useRef, useState } from 'react'
import { Send, Loader2, Stethoscope, Image as ImageIcon, Mic, Square, X, Link as LinkIcon, Video as VideoIcon, Camera } from 'lucide-react'
import { AppHeader } from '@/components/layout/navbar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { MediaDisplay } from '@/components/shared/media-display'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { INITIAL_MESSAGES } from '@/lib/data/bot'

type Message = {
  id: string
  role: 'user' | 'bot'
  content: string
  mediaUrl?: string | null
  mediaType?: string | null
  createdAt: string
}

const MAX_FILE_SIZE = 5 * 1024 * 1024

type RecordingMode = 'audio' | 'video' | null

export default function MedecinPage() {
  const { toast } = useToast()
  const [messages, setMessages] = useState<Message[]>(
    INITIAL_MESSAGES.map((m) => ({ ...m, id: m.id }))
  )
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [mediaFile, setMediaFile] = useState<string | null>(null)
  const [mediaType, setMediaType] = useState<'image' | 'audio' | 'video' | null>(null)

  // Recording states
  const [recording, setRecording] = useState<RecordingMode>(null)
  const [recordingTime, setRecordingTime] = useState(0)

  // Refs
  const scrollRef = useRef<HTMLDivElement>(null)
  const photoInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null)
  const videoPreviewRef = useRef<HTMLVideoElement | null>(null)
  const videoStreamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    fetch('/api/chat', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : { messages: [] }))
      .then((data) => {
        if (data.messages && data.messages.length > 0) {
          setMessages(data.messages)
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [messages])

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

    if (photoInputRef.current) photoInputRef.current.value = ''
    if (galleryInputRef.current) galleryInputRef.current.value = ''
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
      // Show live preview
      videoStreamRef.current = stream
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
      // Stop camera stream
      stream.getTracks().forEach((t) => t.stop())
      videoStreamRef.current = null
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

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault()
    if ((!input.trim() && !mediaFile) || loading) return

    const userMsg: Message = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      mediaUrl: mediaFile,
      mediaType,
      createdAt: new Date().toISOString(),
    }
    setMessages((m) => [...m, userMsg])
    const sentInput = input
    const sentMedia = mediaFile
    const sentMediaType = mediaType
    setInput('')
    setMediaFile(null)
    setMediaType(null)
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: sentInput || '(message avec média)',
          mediaUrl: sentMedia,
          mediaType: sentMediaType,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error()
      setMessages((m) => [
        ...m.filter((msg) => msg.id !== userMsg.id),
        data.userMessage,
        data.botMessage,
      ])
    } catch {
      setMessages((m) => m.filter((msg) => msg.id !== userMsg.id))
      showToast('Erreur réseau', 'destructive')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <AppHeader
        title="Médecin en ligne"
        subtitle="Assistant médical IA — anonyme et gratuit"
        backHref="/dashboard"
      />

      {/* Banner: consult a real doctor */}
      <div className="mb-3">
        <Link href="/medecins">
          <Card className="border-primary/30 bg-medical-gradient-soft cursor-pointer transition hover:shadow-md">
            <div className="flex items-center gap-3 p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-medical-gradient text-white">
                <Stethoscope className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">Consulter un vrai médecin</p>
                <p className="text-xs text-muted-foreground">
                  Sélectionnez par spécialité et discutez en privé
                </p>
              </div>
              <LinkIcon className="h-4 w-4 text-primary" />
            </div>
          </Card>
        </Link>
      </div>

      <Card className="flex h-[calc(100vh-18rem)] flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 border-b bg-medical-gradient p-4 text-white">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
            <Stethoscope className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold">Assistant Médical IA</p>
            <p className="text-xs text-white/90">
              En ligne · répond en quelques secondes
            </p>
          </div>
        </div>

        {/* Messages */}
        <div
          ref={scrollRef}
          className="flex-1 space-y-3 overflow-y-auto bg-muted/30 p-4"
        >
          {messages.map((m) => (
            <div
              key={m.id}
              className={cn(
                'flex',
                m.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              <div
                className={cn(
                  'max-w-[80%] rounded-2xl px-4 py-2 text-sm',
                  m.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card border shadow-sm'
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
                    m.role === 'user' ? 'text-white/70' : 'text-muted-foreground'
                  )}
                >
                  {formatTime(m.createdAt)}
                </p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="rounded-2xl bg-card border px-4 py-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            </div>
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

        {/* Media preview (before sending) */}
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
        <form onSubmit={handleSubmit} className="flex items-end gap-1 border-t bg-card p-2">
          {/* Photo button */}
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

          {/* Video recording button */}
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

          {/* Audio recording button */}
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

          {/* Gallery button */}
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
            placeholder="Décrivez vos symptômes…"
            rows={1}
            className="resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSubmit()
              }
            }}
          />
          <Button type="submit" size="icon" disabled={(!input.trim() && !mediaFile) || loading || !!recording}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </Card>

      <p className="mt-2 text-center text-xs text-muted-foreground">
        Cet assistant ne remplace pas une consultation médicale réelle.
        En cas d&apos;urgence, appelez le <strong>118</strong>.
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

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}
