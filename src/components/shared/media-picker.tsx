'use client'

import { useState, useRef } from 'react'
import { Paperclip, Camera, Video as VideoIcon, Mic, Image as ImageIcon, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const MAX_FILE_SIZE = 5 * 1024 * 1024

type RecordingMode = 'audio' | 'video' | null

/**
 * Media picker button (paperclip) that reveals 4 media options when tapped.
 * Used in chat / consultation input bars.
 */
export function MediaPicker({
  onMediaSelect,
  onAudioRecord,
  onVideoRecord,
  onStopRecording,
  recording,
  disabled,
}: {
  onMediaSelect: (dataUrl: string, type: 'image' | 'video' | 'audio') => void
  onAudioRecord: () => void
  onVideoRecord: () => void
  onStopRecording: () => void
  recording: RecordingMode
  disabled?: boolean
}) {
  const [open, setOpen] = useState(false)
  const photoInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > MAX_FILE_SIZE) return
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      if (file.type.startsWith('image/')) onMediaSelect(result, 'image')
      else if (file.type.startsWith('video/')) onMediaSelect(result, 'video')
      else if (file.type.startsWith('audio/')) onMediaSelect(result, 'audio')
    }
    reader.readAsDataURL(file)
    e.target.value = ''
    setOpen(false)
  }

  function handlePhotoClick() {
    photoInputRef.current?.click()
  }

  function handleGalleryClick() {
    galleryInputRef.current?.click()
  }

  return (
    <div className="relative">
      {/* Hidden file inputs */}
      <input ref={photoInputRef} type="file" accept="image/*" capture="environment" onChange={handleFileSelect} className="hidden" />
      <input ref={galleryInputRef} type="file" accept="image/*,video/*" onChange={handleFileSelect} className="hidden" />

      {/* Paperclip toggle button */}
      <Button
        type="button"
        size="icon"
        variant="outline"
        onClick={() => setOpen((v) => !v)}
        disabled={disabled || !!recording}
        className="h-10 w-10"
        title="Joindre un média"
      >
        {open ? <X className="h-4 w-4" /> : <Paperclip className="h-4 w-4" />}
      </Button>

      {/* Popover with 4 options */}
      {open && !recording && (
        <div className="absolute bottom-full left-0 z-30 mb-2 flex gap-2 rounded-2xl border bg-card p-2 shadow-lg">
          <button
            type="button"
            onClick={() => { setOpen(false); handlePhotoClick() }}
            className="flex flex-col items-center gap-1 rounded-xl p-3 transition hover:bg-muted tap-feedback"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-blue-600">
              <Camera className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-medium">Photo</span>
          </button>

          <button
            type="button"
            onClick={() => { setOpen(false); onVideoRecord() }}
            className="flex flex-col items-center gap-1 rounded-xl p-3 transition hover:bg-muted tap-feedback"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-purple-600">
              <VideoIcon className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-medium">Vidéo</span>
          </button>

          <button
            type="button"
            onClick={() => { setOpen(false); onAudioRecord() }}
            className="flex flex-col items-center gap-1 rounded-xl p-3 transition hover:bg-muted tap-feedback"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-orange-600">
              <Mic className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-medium">Audio</span>
          </button>

          <button
            type="button"
            onClick={() => { setOpen(false); handleGalleryClick() }}
            className="flex flex-col items-center gap-1 rounded-xl p-3 transition hover:bg-muted tap-feedback"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-green-600">
              <ImageIcon className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-medium">Galerie</span>
          </button>
        </div>
      )}

      {/* If recording, show stop button instead */}
      {recording && (
        <Button
          type="button"
          size="icon"
          variant="destructive"
          onClick={onStopRecording}
          className="h-10 w-10"
          title="Arrêter"
        >
          <span className="h-3 w-3 rounded-sm bg-white" />
        </Button>
      )}
    </div>
  )
}
