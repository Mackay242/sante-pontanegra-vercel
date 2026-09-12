'use client'

export default function OfflinePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-medical-gradient-soft px-4 py-12 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-10 w-10 text-muted-foreground"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 3l18 18M5.636 5.636a9 9 0 1012.728 0M12 3v3m0 12v3m-9-9h3m12 0h3"
          />
        </svg>
      </div>
      <h1 className="text-3xl font-bold">Vous êtes hors ligne</h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        Santé Pontanegra ne peut pas se connecter à internet pour le moment.
        Vérifiez votre connexion puis réessayez.
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        En attendant, les pages déjà visitées restent accessibles.
      </p>
      <button
        onClick={() => location.reload()}
        className="mt-6 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 tap-feedback"
      >
        Réessayer
      </button>
    </main>
  )
}
