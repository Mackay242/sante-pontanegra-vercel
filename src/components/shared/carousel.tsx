'use client'

import { useEffect, useState, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Phone, ExternalLink, Sparkles } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { Ad, Sponsor } from '@/lib/data/app'

const COLOR_GRADIENTS = {
  primary: 'from-emerald-500 to-teal-600',
  secondary: 'from-sky-500 to-blue-600',
  accent: 'from-red-500 to-rose-600',
  warning: 'from-amber-500 to-orange-600',
}

const AUTOPLAY_INTERVAL = 5000 // 5 seconds per slide

// ─── AdCarousel ─────────────────────────────────────────────

export function AdCarousel({ ads }: { ads: Ad[] }) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % ads.length)
  }, [ads.length])

  const prev = () => {
    setIndex((i) => (i - 1 + ads.length) % ads.length)
  }

  useEffect(() => {
    if (paused || ads.length <= 1) return
    const interval = setInterval(next, AUTOPLAY_INTERVAL)
    return () => clearInterval(interval)
  }, [paused, next, ads.length])

  if (ads.length === 0) return null
  const ad = ads[index]

  return (
    <Card
      className="overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
          <Sparkles className="h-3 w-3 text-amber-500" />
          <span>OFFRE DU JOUR</span>
          <span className="text-[10px] font-normal text-muted-foreground/70">
            Publicité
          </span>
        </div>
        {ads.length > 1 && (
          <div className="flex items-center gap-1">
            {ads.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={cn(
                  'h-1.5 rounded-full transition-all',
                  i === index ? 'w-4 bg-primary' : 'w-1.5 bg-muted-foreground/30'
                )}
                aria-label={`Publicité ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div
        className={cn(
          'bg-gradient-to-br p-4 text-white transition-all',
          COLOR_GRADIENTS[ad.color]
        )}
      >
        <div className="flex items-start gap-3">
          <div className="text-4xl">{ad.emoji}</div>
          <div className="flex-1">
            <h3 className="font-bold leading-tight">{ad.title}</h3>
            <p className="mt-1 text-sm text-white/90">{ad.description}</p>

            {(ad.price || ad.oldPrice) && (
              <div className="mt-3 flex items-baseline gap-2">
                {ad.price && (
                  <span className="text-xl font-bold">{ad.price}</span>
                )}
                {ad.oldPrice && (
                  <span className="text-sm text-white/70 line-through">
                    {ad.oldPrice}
                  </span>
                )}
              </div>
            )}

            {ad.where && (
              <p className="mt-2 text-xs text-white/80">📍 {ad.where}</p>
            )}

            <button className="mt-3 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-gray-900 hover:bg-white/90 tap-feedback">
              {ad.cta}
            </button>
          </div>
        </div>
      </div>

      {/* Navigation arrows */}
      {ads.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-1 top-1/2 -translate-y-1/2 rounded-full bg-black/30 p-1 text-white opacity-0 transition-opacity hover:bg-black/50 group-hover:opacity-100"
            aria-label="Précédent"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={next}
            className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full bg-black/30 p-1 text-white opacity-0 transition-opacity hover:bg-black/50 group-hover:opacity-100"
            aria-label="Suivant"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </>
      )}
    </Card>
  )
}

// ─── SponsorCarousel ────────────────────────────────────────

export function SponsorCarousel({ sponsors }: { sponsors: Sponsor[] }) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % sponsors.length)
  }, [sponsors.length])

  const prev = () => {
    setIndex((i) => (i - 1 + sponsors.length) % sponsors.length)
  }

  useEffect(() => {
    if (paused || sponsors.length <= 1) return
    const interval = setInterval(next, AUTOPLAY_INTERVAL)
    return () => clearInterval(interval)
  }, [paused, next, sponsors.length])

  if (sponsors.length === 0) return null
  const sponsor = sponsors[index]

  return (
    <Card
      className="overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
          <span className="h-2 w-2 rounded-full bg-primary" />
          <span>SPONSORS</span>
          <span className="text-[10px] font-normal text-muted-foreground/70">
            Nos partenaires
          </span>
        </div>
        {sponsors.length > 1 && (
          <div className="flex items-center gap-1">
            {sponsors.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={cn(
                  'h-1.5 rounded-full transition-all',
                  i === index ? 'w-4 bg-primary' : 'w-1.5 bg-muted-foreground/30'
                )}
                aria-label={`Sponsor ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="bg-medical-gradient-soft p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-white text-2xl shadow-sm">
            {sponsor.logo}
          </div>
          <div className="flex-1">
            <span className="inline-block rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
              {sponsor.category}
            </span>
            <h3 className="mt-1 font-bold leading-tight">{sponsor.name}</h3>
            <p className="mt-0.5 text-sm font-medium text-primary">
              {sponsor.tagline}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              {sponsor.description}
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {sponsor.phone && (
                <a
                  href={`tel:${sponsor.phone.replace(/\s/g, '')}`}
                  className="inline-flex items-center gap-1 rounded-lg border bg-card px-2.5 py-1 text-xs font-medium hover:bg-muted tap-feedback"
                >
                  <Phone className="h-3 w-3" />
                  Appeler
                </a>
              )}
              {sponsor.website && (
                <a
                  href={sponsor.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-lg border bg-card px-2.5 py-1 text-xs font-medium hover:bg-muted tap-feedback"
                >
                  <ExternalLink className="h-3 w-3" />
                  Site web
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation arrows */}
      {sponsors.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-1 top-1/2 -translate-y-1/2 rounded-full bg-black/30 p-1 text-white opacity-0 transition-opacity hover:bg-black/50 group-hover:opacity-100"
            aria-label="Précédent"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={next}
            className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full bg-black/30 p-1 text-white opacity-0 transition-opacity hover:bg-black/50 group-hover:opacity-100"
            aria-label="Suivant"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </>
      )}
    </Card>
  )
}
