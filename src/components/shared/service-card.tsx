import Link from 'next/link'
import {
  Video,
  MessageCircle,
  MapPin,
  FileText,
  Calendar,
  Syringe,
  Pill,
  Baby,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Service } from '@/lib/data/app'

const ICONS: Record<string, LucideIcon> = {
  video: Video,
  'message-circle': MessageCircle,
  'map-pin': MapPin,
  'file-text': FileText,
  calendar: Calendar,
  syringe: Syringe,
  pill: Pill,
  baby: Baby,
}

const COLOR_CLASSES: Record<Service['color'], string> = {
  primary: 'bg-primary/10 text-primary',
  secondary: 'bg-secondary/10 text-secondary-foreground bg-[#1a5f7a]/10 text-[#1a5f7a] dark:text-[#4a9eff]',
  accent: 'bg-destructive/10 text-destructive',
  muted: 'bg-muted text-muted-foreground',
}

export function ServiceCard({ service }: { service: Service }) {
  const Icon = ICONS[service.icon] ?? FileText
  const inner = (
    <div
      className={cn(
        'group relative h-full rounded-2xl border bg-card p-5 transition-all hover:shadow-lg hover:-translate-y-0.5',
        service.soon && 'opacity-70'
      )}
    >
      <div
        className={cn(
          'mb-3 flex h-12 w-12 items-center justify-center rounded-xl',
          COLOR_CLASSES[service.color]
        )}
      >
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="font-semibold leading-tight">{service.title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{service.sub}</p>
      {service.soon && (
        <span className="absolute right-3 top-3 rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase">
          Bientôt
        </span>
      )}
    </div>
  )

  if (service.soon || !service.href) return inner
  return (
    <Link href={service.href} className="block h-full">
      {inner}
    </Link>
  )
}
