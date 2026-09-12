'use client'

import { useState } from 'react'
import { Play, Image as ImageIcon } from 'lucide-react'
import { detectMediaType } from '@/lib/media'

/**
 * Renders a media (video/image) in a post or comment.
 * Supports: YouTube, Vimeo, direct MP4/WebM, images.
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
      <div
        className={`relative aspect-video overflow-hidden rounded-xl bg-black ${
          className ?? ''
        }`}
      >
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
      <div
        className={`relative aspect-video overflow-hidden rounded-xl bg-black ${
          className ?? ''
        }`}
      >
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
      <div
        className={`relative aspect-video overflow-hidden rounded-xl bg-black ${
          className ?? ''
        }`}
      >
        <video
          src={url}
          controls
          playsInline
          className="absolute inset-0 h-full w-full"
          preload="metadata"
          poster={detected.thumbnail}
        >
          Votre navigateur ne supporte pas la lecture vidéo.
        </video>
      </div>
    )
  }

  if (type === 'image' && !imageError) {
    return (
      <div
        className={`relative overflow-hidden rounded-xl bg-muted ${
          className ?? ''
        }`}
      >
        <img
          src={url}
          alt="Média"
          className="max-h-96 w-full object-cover"
          loading="lazy"
          onError={() => setImageError(true)}
        />
      </div>
    )
  }

  // Fallback: link
  if (imageError || !type) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={`flex items-center gap-2 rounded-xl border bg-muted/50 p-3 text-sm hover:bg-muted ${
          className ?? ''
        }`}
      >
        {type === 'image' ? (
          <ImageIcon className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4" />
        )}
        <span className="truncate">{url}</span>
      </a>
    )
  }

  return null
}
