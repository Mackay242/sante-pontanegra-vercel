'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  MessageSquare,
  Loader2,
  Pin,
  Calendar,
  Users,
  Stethoscope,
} from 'lucide-react'
import { AppHeader } from '@/components/layout/navbar'
import { useAuth } from '@/components/auth-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { EmptyState, ErrorState, LoadingState } from '@/components/shared/states'
import { useToast } from '@/hooks/use-toast'
import { PostCard, type Post } from '@/components/community/post-card'
import { PostComposer } from '@/components/community/post-composer'
import { cn } from '@/lib/utils'
import type { Role } from '@/lib/roles'

type ReactionType = 'like' | 'thanks' | 'useful' | 'support' | 'share'

type Tab = {
  id: string
  label: string
  icon: React.ElementType
}

const TABS: Tab[] = [
  { id: 'all', label: 'Tous', icon: MessageSquare },
  { id: 'medical', label: 'Conseils médecins', icon: Stethoscope },
  { id: 'questions', label: 'Questions', icon: MessageSquare },
  { id: 'pinned', label: 'Épinglés', icon: Pin },
  { id: 'doctors', label: 'Médecins à suivre', icon: Users },
  { id: 'ama', label: 'AMA', icon: Calendar },
]

export default function CommunautePage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    if (activeTab !== 'doctors' && activeTab !== 'ama') {
      loadPosts()
    }
  }, [activeTab])

  async function loadPosts() {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (activeTab === 'medical') params.set('medicalOnly', 'true')
      if (activeTab === 'questions') params.set('postType', 'question')
      if (activeTab === 'pinned') params.set('pinnedOnly', 'true')

      const res = await fetch(`/api/posts?${params.toString()}`, {
        cache: 'no-store',
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setPosts(data.posts)
    } catch {
      setError('Impossible de charger les publications.')
    } finally {
      setLoading(false)
    }
  }

  async function handleCreatePost(data: {
    title: string
    content: string
    category: string
    postType: string
    mediaUrl?: string
    mediaType?: string
  }): Promise<boolean> {
    if (!user) return false
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await res.json()
      if (!res.ok) {
        toast({
          title: 'Erreur',
          description: result.message ?? 'Publication impossible.',
          variant: 'destructive',
        })
        return false
      }
      setPosts((p) => [
        {
          ...result.post,
          comments: [],
          reactionCounts: { like: 0, thanks: 0, useful: 0, support: 0, share: 0 },
        },
        ...p,
      ])
      toast({ title: 'Publié !', description: 'Votre message est en ligne.' })
      return true
    } catch {
      toast({
        title: 'Erreur réseau',
        variant: 'destructive',
      })
      return false
    }
  }

  async function handleReact(postId: string, type: ReactionType) {
    if (!user) return
    // Optimistic update
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p
        const counts = { ...p.reactionCounts }
        // For simplicity, just increment for now (toggle is handled by API)
        counts[type] = (counts[type] ?? 0) + 1
        return { ...p, reactionCounts: counts }
      })
    )
    try {
      await fetch(`/api/posts/${postId}/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      })
      // Reload to get accurate counts (could be optimized)
      loadPosts()
    } catch {
      toast({
        title: 'Erreur',
        description: 'Réaction impossible.',
        variant: 'destructive',
      })
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

  async function handlePin(postId: string) {
    try {
      const res = await fetch(`/api/posts/${postId}/pin`, { method: 'POST' })
      if (!res.ok) throw new Error()
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, pinned: !p.pinned } : p
        )
      )
      toast({
        title: 'Mis à jour',
        description: 'Statut d\'épinglage modifié.',
      })
    } catch {
      toast({ title: 'Erreur', variant: 'destructive' })
    }
  }

  async function handleSolve(postId: string) {
    try {
      const res = await fetch(`/api/posts/${postId}/solve`, { method: 'POST' })
      if (!res.ok) throw new Error()
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, solved: !p.solved } : p
        )
      )
    } catch {
      toast({ title: 'Erreur', variant: 'destructive' })
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
          p.id === postId
            ? {
                ...p,
                comments: [...p.comments, data.comment],
                solved:
                  p.postType === 'question' &&
                  ['DOCTOR', 'NURSE'].includes(user.role)
                    ? true
                    : p.solved,
              }
            : p
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

  const canPostAlert =
    user?.role === 'DOCTOR' || user?.role === 'NURSE' || user?.role === 'ADMIN'

  return (
    <>
      <AppHeader
        title="Communauté"
        subtitle="Échangez patients et personnel soignant"
        backHref="/dashboard"
      />

      {/* Tabs */}
      <div className="mb-4 overflow-x-auto no-scrollbar">
        <div className="flex gap-2 pb-1">
          {TABS.map((tab) => {
            const Icon = tab.icon
            return (
              <Button
                key={tab.id}
                size="sm"
                variant={activeTab === tab.id ? 'default' : 'outline'}
                onClick={() => setActiveTab(tab.id)}
                className="whitespace-nowrap"
              >
                <Icon className="mr-1 h-4 w-4" />
                {tab.label}
              </Button>
            )
          })}
        </div>
      </div>

      {/* Composer (only on regular tabs, not on doctors/ama) */}
      {activeTab !== 'doctors' && activeTab !== 'ama' && (
        <div className="mb-4 flex justify-end">
          <PostComposer canPostAlert={!!canPostAlert} onSubmit={handleCreatePost} />
        </div>
      )}

      {/* Content per tab */}
      {activeTab === 'doctors' ? (
        <DoctorsList currentUserId={user?.id} />
      ) : activeTab === 'ama' ? (
        <AMAList />
      ) : loading ? (
        <LoadingState message="Chargement des publications…" />
      ) : error ? (
        <ErrorState message={error} onRetry={loadPosts} />
      ) : posts.length === 0 ? (
        <EmptyState
          title="Aucune publication"
          description="Soyez le premier à partager une information santé avec la communauté."
          icon={<MessageSquare className="h-5 w-5" />}
        />
      ) : (
        <div className="space-y-4">
          {posts.map((p) => (
            <PostCard
              key={p.id}
              post={p}
              currentUserId={user?.id}
              currentUserRole={user?.role as Role}
              onDelete={handleDelete}
              onComment={handleComment}
              onPin={canPostAlert ? handlePin : undefined}
              onSolve={handleSolve}
              onReact={handleReact}
            />
          ))}
        </div>
      )}
    </>
  )
}

// ─── Doctors list tab ───────────────────────────────────────

function DoctorsList({ currentUserId }: { currentUserId?: string }) {
  const { toast } = useToast()
  const [doctors, setDoctors] = useState<
    Array<{
      id: string
      name: string
      email: string
      role: Role
      specialty: string | null
      bio: string | null
      avatarUrl: string | null
      followersCount: number
      postsCount: number
    }>
  >([])
  const [followingIds, setFollowingIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [following, setFollowing] = useState<Record<string, boolean>>({})

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setLoading(true)
    try {
      const res = await fetch('/api/users/doctors', { cache: 'no-store' })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setDoctors(data.doctors)
      setFollowingIds(data.followingIds ?? [])
      const followingMap: Record<string, boolean> = {}
      data.doctors.forEach((d: { id: string }) => {
        followingMap[d.id] = (data.followingIds ?? []).includes(d.id)
      })
      setFollowing(followingMap)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  async function handleFollow(doctorId: string) {
    try {
      const res = await fetch(`/api/users/${doctorId}/follow`, {
        method: 'POST',
      })
      const data = await res.json()
      if (!res.ok) throw new Error()
      setFollowing((f) => ({ ...f, [doctorId]: data.following }))
      setDoctors((prev) =>
        prev.map((d) =>
          d.id === doctorId
            ? {
                ...d,
                followersCount: d.followersCount + (data.following ? 1 : -1),
              }
            : d
        )
      )
      toast({
        title: data.following ? 'Abonné !' : 'Désabonné',
      })
    } catch {
      toast({ title: 'Erreur', variant: 'destructive' })
    }
  }

  if (loading) return <LoadingState message="Chargement du personnel médical…" />

  if (doctors.length === 0) {
    return (
      <EmptyState
        title="Aucun personnel médical inscrit"
        description="Les médecins et infirmiers apparaîtront ici une fois inscrits."
        icon={<Stethoscope className="h-5 w-5" />}
      />
    )
  }

  return (
    <div className="space-y-3">
      {doctors.map((d) => (
        <Card key={d.id}>
          <CardContent className="flex items-start gap-3 p-4">
            <div
              className={cn(
                'flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-medical-gradient text-lg font-bold text-white',
                d.role === 'DOCTOR' && 'ring-2 ring-primary ring-offset-2',
                d.role === 'NURSE' && 'ring-2 ring-blue-500 ring-offset-2'
              )}
            >
              {d.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold">{d.name}</span>
                <span
                  className={cn(
                    'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold',
                    d.role === 'DOCTOR'
                      ? 'bg-primary/10 text-primary'
                      : 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
                  )}
                >
                  {d.role === 'DOCTOR' ? 'Dr.' : 'Infirmier(ère)'}
                  {d.specialty && (
                    <span className="font-normal opacity-80">· {d.specialty}</span>
                  )}
                </span>
              </div>
              {d.bio && (
                <p className="mt-1 text-sm text-muted-foreground">{d.bio}</p>
              )}
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span>📝 {d.postsCount} publications</span>
                <span>👥 {d.followersCount} abonné{d.followersCount > 1 ? 's' : ''}</span>
              </div>
            </div>
            {currentUserId && currentUserId !== d.id && (
              <Button
                size="sm"
                variant={following[d.id] ? 'default' : 'outline'}
                onClick={() => handleFollow(d.id)}
              >
                {following[d.id] ? '✓ Suivi' : '+ Suivre'}
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// ─── AMA list tab ───────────────────────────────────────────

function AMAList() {
  const [sessions, setSessions] = useState<
    Array<{
      id: string
      title: string
      description: string
      startsAt: string
      endsAt: string
      isLive: boolean
      isFinished: boolean
      host: {
        id: string
        name: string
        role: Role
        specialty: string | null
      }
      _count: { questions: number }
    }>
  >([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setLoading(true)
    try {
      const res = await fetch('/api/ama', { cache: 'no-store' })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setSessions(data.sessions)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingState message="Chargement des AMA…" />

  if (sessions.length === 0) {
    return (
      <EmptyState
        title="Aucune AMA programmée"
        description="Les sessions Ask Me Anything organisées par les médecins apparaîtront ici."
        icon={<Calendar className="h-5 w-5" />}
        action={
          <Link href="/dashboard">
            <Button size="sm" variant="outline">
              Retour au dashboard
            </Button>
          </Link>
        }
      />
    )
  }

  return (
    <div className="space-y-3">
      {sessions.map((s) => {
        const start = new Date(s.startsAt)
        const end = new Date(s.endsAt)
        const now = new Date()
        const isUpcoming = start > now
        const isLiveNow = s.isLive && !s.isFinished
        const isPast = end < now || s.isFinished

        return (
          <Link key={s.id} href={`/ama/${s.id}`}>
            <Card className="cursor-pointer transition hover:shadow-md">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold">{s.title}</h3>
                      {isLiveNow && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-600 px-2 py-0.5 text-xs font-bold text-white animate-pulse">
                          🔴 LIVE
                        </span>
                      )}
                      {isUpcoming && (
                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                          À venir
                        </span>
                      )}
                      {isPast && (
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
                          Terminé
                        </span>
                      )}
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {s.description}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">
                        {s.host.name}
                      </span>
                      {s.host.specialty && <span>· {s.host.specialty}</span>}
                      <span>· 📅 {start.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} à {start.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                      <span>· 💬 {s._count.questions} questions</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}
