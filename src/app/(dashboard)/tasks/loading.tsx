export default function TasksLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-48 animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-64 animate-pulse rounded bg-slate-200" />
        </div>
        <div className="h-10 w-36 animate-pulse rounded-lg bg-slate-200" />
      </div>

      <div className="flex gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-9 w-24 animate-pulse rounded-lg bg-slate-200"
          />
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="h-5 w-32 animate-pulse rounded bg-slate-200" />
              <div className="h-5 w-20 animate-pulse rounded-full bg-slate-200" />
            </div>
            <div className="mb-4 h-4 w-48 animate-pulse rounded bg-slate-200" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 animate-pulse rounded-full bg-slate-200" />
                <div className="h-4 w-20 animate-pulse rounded bg-slate-200" />
              </div>
              <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
