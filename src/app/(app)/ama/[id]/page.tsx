'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Calendar,
  Clock,
  Users,
  ArrowLeft,
  Send,
  ThumbsUp,
  Check,
  Loader2,
} from 'lucide-react'
import { AppHeader } from '@/components/layout/navbar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { LoadingState, ErrorState } from '@/components/shared/states'
import { RoleBadge } from '@/components/shared/role-badge'
import { useAuth } from '@/components/auth-provider'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import type { Role } from '@/lib/roles'

type Host = {
  id: string
  name: string
  role: Role
  specialty: string | null
  avatarUrl: string | null
  bio: string | null
}

type Question = {
  id: string
  content: string
  votes: number
  answered: boolean
  answer: string | null
  createdAt: string
  author: {
    id: string
    name: string
    role: Role
    avatarUrl: string | null
  }
}

type AMA = {
  id: string
  title: string
  description: string
  startsAt: string
  endsAt: string
  isLive: boolean
  isFinished: boolean
  host: Host
  questions: Question[]
}

export default function AMADetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { user } = useAuth()
  const { toast } = useToast()
  const [ama, setAma] = useState<AMA | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [question, setQuestion] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [voting, setVoting] = useState<string | null>(null)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/ama/${id}`, { cache: 'no-store' })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setAma(data.ama)
    } catch {
      setError('AMA introuvable.')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmitQuestion(e: React.FormEvent) {
    e.preventDefault()
    if (!question.trim()) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/ama/${id}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: question }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error()
      setAma((a) => a ? { ...a, questions: [...a.questions, data.question] } : a)
      setQuestion('')
      toast({ title: 'Question envoyée !' })
    } catch {
      toast({ title: 'Erreur', description: 'Question impossible.', variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }

  async function handleVote(qId: string) {
    setVoting(qId)
    try {
      const res = await fetch(
        `/api/ama/${id}/questions?questionId=${qId}`,
        { method: 'PATCH' }
      )
      const data = await res.json()
      if (!res.ok) throw new Error()
      setAma((a) =>
        a
          ? {
              ...a,
              questions: a.questions.map((q) =>
                q.id === qId ? { ...q, votes: data.votes } : q
              ),
            }
          : a
      )
    } catch {
      toast({ title: 'Erreur', variant: 'destructive' })
    } finally {
      setVoting(null)
    }
  }

  if (loading) return <LoadingState message="Chargement de l'AMA…" />
  if (error || !ama) return <ErrorState message={error ?? undefined} />

  const start = new Date(ama.startsAt)
  const end = new Date(ama.endsAt)
  const now = new Date()
  const isUpcoming = start > now
  const isLiveNow = ama.isLive && !ama.isFinished
  const isHost = user?.id === ama.host.id

  return (
    <>
      <AppHeader
        title={ama.title}
        subtitle={`AMA avec ${ama.host.name}`}
        backHref="/communaute"
      />

      {/* Status badge */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {isLiveNow && (
          <Badge className="bg-red-600 text-white animate-pulse">
            🔴 EN DIRECT
          </Badge>
        )}
        {isUpcoming && (
          <Badge className="bg-blue-100 text-blue-700">
            À venir dans {timeUntil(start)}
          </Badge>
        )}
        {ama.isFinished && (
          <Badge variant="secondary">Terminé</Badge>
        )}
        <span className="text-sm text-muted-foreground">
          📅 {start.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
          {' · '}
          🕐 {start.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          {' → '}
          {end.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      {/* Host card */}
      <Card className="mb-6 border-primary/20">
        <CardHeader>
          <p className="text-xs font-semibold uppercase text-muted-foreground">
            Hôte de l'AMA
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-3">
            <div
              className={cn(
                'flex h-14 w-14 items-center justify-center rounded-full bg-medical-gradient text-xl font-bold text-white',
                ama.host.role === 'DOCTOR' && 'ring-2 ring-primary ring-offset-2'
              )}
            >
              {ama.host.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold">{ama.host.name}</span>
                <RoleBadge role={ama.host.role} specialty={ama.host.specialty} />
              </div>
              {ama.host.bio && (
                <p className="mt-1 text-sm text-muted-foreground">{ama.host.bio}</p>
              )}
            </div>
          </div>
          <p className="mt-4 text-sm">{ama.description}</p>
        </CardContent>
      </Card>

      {/* Ask question form */}
      {!ama.isFinished && (
        <Card className="mb-6">
          <CardHeader>
            <h3 className="font-semibold">Posez votre question</h3>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitQuestion} className="space-y-3">
              <Textarea
                placeholder="Soyez clair et concis. Les meilleures questions seront votées en haut."
                rows={3}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                required
              />
              <Button type="submit" disabled={submitting || !question.trim()}>
                {submitting ? (
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-1 h-4 w-4" />
                )}
                Envoyer ma question
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Questions list */}
      <div className="space-y-3">
        <h3 className="font-semibold">
          💬 Questions ({ama.questions.length})
        </h3>
        {ama.questions.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-8 text-center">
              <Users className="h-10 w-10 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">
                Aucune question pour le moment. Soyez le premier à en poser une !
              </p>
            </CardContent>
          </Card>
        ) : (
          ama.questions
            .sort((a, b) => b.votes - a.votes)
            .map((q) => (
              <Card key={q.id} className={cn(q.answered && 'border-green-300 bg-green-50/30 dark:bg-green-950/10')}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => handleVote(q.id)}
                      disabled={voting === q.id}
                      className="flex flex-col items-center gap-1 rounded-lg border bg-card px-2 py-1 hover:bg-muted tap-feedback"
                      title="Voter pour cette question"
                    >
                      <ThumbsUp className="h-4 w-4 text-primary" />
                      <span className="text-xs font-bold tabular-nums">{q.votes}</span>
                    </button>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">
                          {q.author.name}
                        </span>
                        <span>· {new Date(q.createdAt).toLocaleDateString('fr-FR')}</span>
                      </div>
                      <p className="mt-1 text-sm">{q.content}</p>

                      {q.answered && q.answer && (
                        <div className="mt-3 rounded-lg border border-primary/30 bg-primary/5 p-3">
                          <div className="mb-1 flex items-center gap-2 text-xs">
                            <Check className="h-3 w-3 text-primary" />
                            <span className="font-semibold text-primary">
                              Réponse du médecin
                            </span>
                          </div>
                          <p className="text-sm">{q.answer}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
        )}
      </div>
    </>
  )
}

function timeUntil(date: Date): string {
  const diff = date.getTime() - Date.now()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(hours / 24)
  if (days > 0) return `${days} jour${days > 1 ? 's' : ''} ${hours % 24}h`
  if (hours > 0) return `${hours}h`
  const minutes = Math.floor(diff / (1000 * 60))
  return `${minutes} min`
}
