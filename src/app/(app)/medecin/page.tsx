'use client'

import { useEffect, useRef, useState } from 'react'
import { Send, Loader2, Stethoscope, Image as ImageIcon, Mic, Square, X, Link as LinkIcon } from 'lucide-react'
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

export default function MedecinPage() {
  const { toast } = useToast()
  const [messages, setMessages] = useState<Message[]>(
    INITIAL_MESSAGES.map((m) => ({ ...m, id: m.id }))
  )
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [recording, setRecording] = useState(false)
  const [mediaFile, setMediaFile] = useState<string | null>(null)
  const [mediaType, setMediaType] = useState<'image' | 'audio' | 'video' | null>(null)
  const [recordingTime, setRecordingTime] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null)

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

    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      mediaRecorderRef.current = recorder
      chunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        if (blob.size > MAX_FILE_SIZE) {
          showToast('Message audio trop long (max 5 MB)', 'destructive')
          return
        }
        const reader = new FileReader()
        reader.onload = () => {
          setMediaFile(reader.result as string)
          setMediaType('audio')
        }
        reader.readAsDataURL(blob)
        stream.getTracks().forEach((t) => t.stop())
      }

      recorder.start()
      setRecording(true)
      setRecordingTime(0)
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((t) => t + 1)
      }, 1000)
    } catch (err) {
      console.error(err)
      showToast('Microphone inaccessible', 'destructive')
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop()
    setRecording(false)
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

        {/* Media preview */}
        {mediaFile && (
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

        {/* Recording indicator */}
        {recording && (
          <div className="flex items-center justify-between border-t bg-red-50 p-2 dark:bg-red-950/30">
            <div className="flex items-center gap-2 text-sm text-red-600">
              <span className="h-2 w-2 animate-pulse rounded-full bg-red-600" />
              <span>Enregistrement… {formatDuration(recordingTime)}</span>
            </div>
            <Button size="sm" variant="destructive" onClick={stopRecording}>
              <Square className="mr-1 h-3 w-3" />
              Arrêter
            </Button>
          </div>
        )}

        {/* Input */}
        <form onSubmit={handleSubmit} className="flex items-end gap-2 border-t bg-card p-3">
          <label className="cursor-pointer">
            <input
              ref={fileInputRef}
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

          <Button
            type="button"
            size="icon"
            variant={recording ? 'destructive' : 'outline'}
            onClick={recording ? stopRecording : startRecording}
            className="h-10 w-10"
          >
            {recording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
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
          <Button type="submit" size="icon" disabled={(!input.trim() && !mediaFile) || loading}>
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
