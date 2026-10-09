import { Loader2, AlertTriangle } from "lucide-react";

export function Loading({ label = "Loading data…" }) {
  return (
    <div className="flex items-center justify-center gap-2.5 py-16 text-ink-400">
      <Loader2 size={18} className="animate-spin" />
      <span className="text-sm">{label}</span>
    </div>
  );
}

export function ErrorState({ error, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <span className="grid place-items-center w-11 h-11 rounded-xl bg-coral-500/10 text-coral-500">
        <AlertTriangle size={20} />
      </span>
      <p className="text-sm text-ink-600 max-w-sm">
        Couldn&apos;t reach the API{error?.message ? `: ${error.message}` : "."}
        <br />
        Make sure the backend is running at the configured API base URL.
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-1 text-sm font-semibold text-brand-600 hover:text-brand-700"
        >
          Retry
        </button>
      )}
    </div>
  );
}
