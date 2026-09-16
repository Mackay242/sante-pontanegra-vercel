'use client'

import { useState, useRef, useEffect } from 'react'
import { Play, Pause, Image as ImageIcon, Volume2 } from 'lucide-react'
import { detectMediaType } from '@/lib/media'
import { cn } from '@/lib/utils'

/**
 * Renders a media (video/image/audio) in a post, comment, or chat.
 * Supports: YouTube, Vimeo, direct MP4/WebM, images, audio.
 */
export function MediaDisplay({
  url,
  type: explicitType,
  className,
}: {
  url: string
  type?: string
  className?: string
}) {
  const detected = detectMediaType(url)
  const type = explicitType ?? detected.type
  const [imageError, setImageError] = useState(false)

  if (type === 'youtube' && detected.embedUrl) {
    return (
      <div className={`relative aspect-video overflow-hidden rounded-xl bg-black ${className ?? ''}`}>
        <iframe
          src={detected.embedUrl}
          title="Vidéo YouTube"
          className="absolute inset-0 h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
      </div>
    )
  }

  if (type === 'vimeo' && detected.embedUrl) {
    return (
      <div className={`relative aspect-video overflow-hidden rounded-xl bg-black ${className ?? ''}`}>
        <iframe
          src={detected.embedUrl}
          title="Vidéo Vimeo"
          className="absolute inset-0 h-full w-full"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
      </div>
    )
  }

  if (type === 'video') {
    return (
      <div className={`relative aspect-video overflow-hidden rounded-xl bg-black ${className ?? ''}`}>
        <video src={url} controls playsInline className="absolute inset-0 h-full w-full" preload="metadata" poster={detected.thumbnail}>
          Votre navigateur ne supporte pas la lecture vidéo.
        </video>
      </div>
    )
  }

  if (type === 'audio') {
    return <AudioPlayer url={url} className={className} />
  }

  if (type === 'image' && !imageError) {
    return (
      <div className={`relative overflow-hidden rounded-xl bg-muted ${className ?? ''}`}>
        <img src={url} alt="Média" className="max-h-96 w-full object-cover" loading="lazy" onError={() => setImageError(true)} />
      </div>
    )
  }

  // Fallback: link
  if (imageError || !type) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-2 rounded-xl border bg-muted/50 p-3 text-sm hover:bg-muted ${className ?? ''}`}>
        {type === 'image' ? <ImageIcon className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        <span className="truncate">{url}</span>
      </a>
    )
  }

  return null
}

// ─── Audio Player (WhatsApp-style) ───────────────────────

function AudioPlayer({ url, className }: { url: string; className?: string }) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    function onTimeUpdate() {
      if (!audioRef.current) return
      const a = audioRef.current
      setCurrentTime(a.currentTime)
      if (a.duration > 0) {
        setProgress((a.currentTime / a.duration) * 100)
      }
    }
    function onLoadedMetadata() {
      if (!audioRef.current) return
      setDuration(audioRef.current.duration)
    }
    function onEnded() {
      setPlaying(false)
      setProgress(0)
      setCurrentTime(0)
    }

    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('loadedmetadata', onLoadedMetadata)
    audio.addEventListener('ended', onEnded)

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('loadedmetadata', onLoadedMetadata)
      audio.removeEventListener('ended', onEnded)
    }
  }, [])

  function togglePlay() {
    const audio = audioRef.current
    if (!audio) return
    if (playing) {
      audio.pause()
      setPlaying(false)
    } else {
      audio.play()
      setPlaying(true)
    }
  }

  function seek(e: React.MouseEvent<HTMLDivElement>) {
    const audio = audioRef.current
    if (!audio || !audio.duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = (e.clientX - rect.left) / rect.width
    audio.currentTime = ratio * audio.duration
    setProgress(ratio * 100)
  }

  return (
    <div className={cn('flex items-center gap-3 rounded-xl border bg-muted/30 p-3', className)}>
      <audio ref={audioRef} src={url} preload="metadata" />

      {/* Play/Pause button */}
      <button
        onClick={togglePlay}
        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground hover:opacity-90 tap-feedback"
        title={playing ? 'Pause' : 'Écouter'}
      >
        {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 fill-current" />}
      </button>

      {/* Progress bar + time */}
      <div className="flex-1">
        <div
          className="h-2 cursor-pointer rounded-full bg-muted-foreground/30"
          onClick={seek}
        >
          <div
            className="h-2 rounded-full bg-primary transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-1 flex items-center justify-between text-[10px] text-muted-foreground">
          <span>{formatTime(currentTime)}</span>
          <span className="flex items-center gap-1">
            <Volume2 className="h-3 w-3" />
            {duration > 0 ? formatTime(duration) : '--:--'}
          </span>
        </div>
      </div>
    </div>
  )
}

function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
