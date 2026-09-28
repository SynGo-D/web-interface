/** Shared loading/error/empty panel — same card treatment as the rest of the dashboard, so a pending/failed fetch doesn't leave a blank area. */
export function LoadingBanner({ message }: { message: string }) {
  return (
    <div className="animate-pulse rounded-xl border border-gray-200 bg-white p-6 text-center text-gray-500 shadow-sm">
      {message}
    </div>
  );
}

export function ErrorBanner({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center shadow-sm">
      <p className="text-red-700">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 rounded-lg bg-[#4338CA] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
        >
          Try again
        </button>
      )}
    </div>
  );
}

export function EmptyBanner({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 text-center text-gray-500 shadow-sm">
      {message}
    </div>
  );
}
