export default function Loading() {
  return (
    <div className="container-page max-w-5xl py-12" role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">Loading…</span>
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-1/3 rounded bg-muted" />
        <div className="h-4 w-2/3 rounded bg-muted" />
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="h-28 rounded-lg bg-muted" />
          <div className="h-28 rounded-lg bg-muted" />
          <div className="h-28 rounded-lg bg-muted" />
        </div>
        <div className="h-64 rounded-lg bg-muted" />
      </div>
    </div>
  );
}
