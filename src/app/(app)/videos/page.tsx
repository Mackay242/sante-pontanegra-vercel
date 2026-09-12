'use client'

import { useMemo, useState } from 'react'
import { Video, Play, Clock, X } from 'lucide-react'
import { AppHeader } from '@/components/layout/navbar'
import { VIDEO_CATEGORIES, VIDEOS, type Video } from '@/lib/data/videos'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Dialog, DialogContent } from '@/components/ui/dialog'

export default function VideosPage() {
  const [activeCategory, setActiveCategory] = useState('tous')
  const [selected, setSelected] = useState<Video | null>(null)

  const filtered = useMemo(() => {
    return activeCategory === 'tous'
      ? VIDEOS
      : VIDEOS.filter((v) => v.category === activeCategory)
  }, [activeCategory])

  return (
    <>
      <AppHeader
        title="Sensibilisation"
        subtitle="Vidéos santé courtes et validées"
        backHref="/dashboard"
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {VIDEO_CATEGORIES.map((c) => (
          <Button
            key={c.id}
            size="sm"
            variant={activeCategory === c.id ? 'default' : 'outline'}
            onClick={() => setActiveCategory(c.id)}
          >
            <span className="mr-1">{c.icon}</span>
            {c.label}
          </Button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((v) => (
          <Card
            key={v.id}
            className="cursor-pointer overflow-hidden transition hover:shadow-md"
            onClick={() => setSelected(v)}
          >
            <div className="relative aspect-video bg-medical-gradient-soft">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-lg">
                  <Play className="h-6 w-6 fill-primary text-primary" />
                </div>
              </div>
              <span className="absolute bottom-2 right-2 rounded bg-black/70 px-2 py-0.5 text-[10px] font-medium text-white">
                {v.duration}
              </span>
            </div>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm leading-tight">{v.titre}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="line-clamp-2 text-xs text-muted-foreground">
                {v.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Video className="h-10 w-10 text-muted-foreground" />
            <p className="mt-3 text-muted-foreground">
              Aucune vidéo dans cette catégorie.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Video player dialog */}
      <Dialog
        open={!!selected}
        onOpenChange={(open) => !open && setSelected(null)}
      >
        <DialogContent className="max-w-3xl">
          {selected && (
            <div className="space-y-3">
              <div className="aspect-video overflow-hidden rounded-lg bg-black">
                <video
                  controls
                  autoPlay
                  className="h-full w-full"
                  poster=""
                >
                  <source src={selected.url} type="video/mp4" />
                  Votre navigateur ne supporte pas la lecture vidéo.
                </video>
              </div>
              <div>
                <h3 className="font-semibold">{selected.titre}</h3>
                <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{selected.duration}</span>
                  <span>·</span>
                  <span className="capitalize">{selected.category}</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {selected.description}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
