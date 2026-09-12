import { Phone, AlertTriangle } from 'lucide-react'
import { EMERGENCY_NUMBERS } from '@/lib/data/centres'

export function EmergencyCard() {
  return (
    <div className="rounded-2xl border border-destructive/30 bg-emergency-gradient p-5 text-white shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <AlertTriangle className="h-5 w-5" />
        <h3 className="font-bold">Numéros d&apos;urgence</h3>
      </div>
      <p className="mb-4 text-sm text-white/90">
        En cas d&apos;urgence vitale, composez immédiatement l&apos;un de ces numéros.
      </p>
      <ul className="space-y-2">
        {EMERGENCY_NUMBERS.map((e) => (
          <li key={e.number}>
            <a
              href={`tel:${e.number}`}
              className="flex items-center justify-between rounded-xl bg-white/15 px-4 py-3 backdrop-blur transition hover:bg-white/25"
            >
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5" />
                <span className="font-medium">{e.label}</span>
              </div>
              <span className="text-lg font-bold tabular-nums">{e.number}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
