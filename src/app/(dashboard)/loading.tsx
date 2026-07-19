export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="animate-fade-in">
        <div className="mb-2 h-8 w-64 animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-80 animate-pulse rounded bg-slate-200" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
                <div className="h-7 w-16 animate-pulse rounded bg-slate-200" />
                <div className="h-3 w-32 animate-pulse rounded bg-slate-200" />
              </div>
              <div className="h-10 w-10 animate-pulse rounded-lg bg-slate-200" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 animate-pulse rounded-lg bg-slate-200" />
              <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="mb-4 h-5 w-36 animate-pulse rounded bg-slate-200" />
            <div className="space-y-3">
              {[1, 2, 3].map((j) => (
                <div
                  key={j}
                  className="flex items-center justify-between rounded-lg border border-slate-100 p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 animate-pulse rounded-full bg-slate-200" />
                    <div>
                      <div className="mb-1 h-4 w-24 animate-pulse rounded bg-slate-200" />
                      <div className="h-3 w-16 animate-pulse rounded bg-slate-200" />
                    </div>
                  </div>
                  <div className="h-5 w-16 animate-pulse rounded-full bg-slate-200" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
