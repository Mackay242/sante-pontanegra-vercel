/**
 * Media helpers — detect YouTube / Vimeo / MP4 / image URLs.
 */

export type MediaType = 'youtube' | 'vimeo' | 'video' | 'image' | null

export function detectMediaType(url: string): {
  type: MediaType
  embedUrl?: string
  thumbnail?: string
} {
  if (!url) return { type: null }

  const trimmed = url.trim()

  // YouTube
  const youtubeMatch = trimmed.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/
  )
  if (youtubeMatch) {
    const videoId = youtubeMatch[1]
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube.com/embed/${videoId}`,
      thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    }
  }

  // Vimeo
  const vimeoMatch = trimmed.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  if (vimeoMatch) {
    const videoId = vimeoMatch[1]
    return {
      type: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${videoId}`,
    }
  }

  // Direct video file
  if (/\.(mp4|webm|ogg|mov|m4v)(\?|$)/i.test(trimmed)) {
    return { type: 'video' }
  }

  // Direct image file
  if (/\.(jpg|jpeg|png|gif|webp|avif|svg)(\?|$)/i.test(trimmed)) {
    return { type: 'image' }
  }

  // Default: try as video
  return { type: 'video' }
}
