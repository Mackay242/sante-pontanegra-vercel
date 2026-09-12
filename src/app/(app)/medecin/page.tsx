'use client'

import { useEffect, useRef, useState } from 'react'
import { Send, Loader2, Stethoscope } from 'lucide-react'
import { AppHeader } from '@/components/layout/navbar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { INITIAL_MESSAGES } from '@/lib/data/bot'

type Message = {
  id: string
  role: 'user' | 'bot'
  content: string
  createdAt: string
}

export default function MedecinPage() {
  const [messages, setMessages] = useState<Message[]>(
    INITIAL_MESSAGES.map((m) => ({ ...m, id: m.id }))
  )
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Load history
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMsg: Message = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      createdAt: new Date().toISOString(),
    }
    setMessages((m) => [...m, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg.content }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error()
      // Replace temp user msg with persisted one, add bot reply
      setMessages((m) => [
        ...m.filter((msg) => msg.id !== userMsg.id),
        data.userMessage,
        data.botMessage,
      ])
    } catch {
      setMessages((m) =>
        m.filter((msg) => msg.id !== userMsg.id)
      )
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

      <Card className="flex h-[calc(100vh-12rem)] flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 border-b bg-medical-gradient p-4 text-white">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
            <Stethoscope className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold">Assistant Médical</p>
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
                <p className="whitespace-pre-wrap">{m.content}</p>
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

        {/* Input */}
        <form
          onSubmit={handleSubmit}
          className="flex items-end gap-2 border-t bg-card p-3"
        >
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Décrivez vos symptômes…"
            rows={1}
            className="resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSubmit(e)
              }
            }}
          />
          <Button type="submit" size="icon" disabled={!input.trim() || loading}>
            <Send className="h-4 w-4" />
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
