"use client";

interface WelcomeScreenProps {
  onLogin: () => void;
  onDismiss: () => void;
}

export default function WelcomeScreen({ onLogin, onDismiss }: WelcomeScreenProps) {
  return (
    <div className="absolute inset-0 z-[950] flex items-center justify-center p-5">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />

      <div className="relative w-full max-w-sm rounded-3xl bg-white p-7 text-center shadow-2xl">
        <div className="mb-1 flex items-center justify-center">
          <span className="font-serif text-2xl font-bold wordmark-velvet">Rhova</span>
        </div>
        <p className="mb-6 text-sm text-ink-soft">
          Find gap year placements worldwide, verified by real phone calls.
        </p>

        <button
          onClick={onLogin}
          className="mb-2.5 w-full rounded-xl bg-coral py-3 text-sm font-semibold text-white hover:bg-coral-deep"
        >
          Log in
        </button>
        <button
          onClick={onLogin}
          className="mb-5 w-full rounded-xl border border-mist-deep py-3 text-sm font-semibold text-ink hover:bg-mist"
        >
          Sign up
        </button>

        <button onClick={onDismiss} className="text-xs font-medium text-ink-soft underline hover:text-ink">
          Explore the map without an account
        </button>
      </div>
    </div>
  );
}
