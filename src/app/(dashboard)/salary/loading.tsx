export default function SalaryLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-8 w-56 animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-72 animate-pulse rounded bg-slate-200" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-4 w-20 animate-pulse rounded bg-slate-200" />
                <div className="h-7 w-16 animate-pulse rounded bg-slate-200" />
                <div className="h-3 w-28 animate-pulse rounded bg-slate-200" />
              </div>
              <div className="h-10 w-10 animate-pulse rounded-lg bg-slate-200" />
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 h-5 w-48 animate-pulse rounded bg-slate-200" />
        <div className="flex items-center justify-center h-[280px]">
          <div className="h-32 w-32 animate-pulse rounded-full bg-slate-200" />
        </div>
      </div>

      <div className="flex gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-9 w-24 animate-pulse rounded-lg bg-slate-200" />
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="p-4">
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg border border-slate-100 p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 animate-pulse rounded-full bg-slate-200" />
                  <div className="space-y-2">
                    <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />
                    <div className="h-3 w-20 animate-pulse rounded bg-slate-200" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-20 animate-pulse rounded bg-slate-200" />
                  <div className="h-3 w-16 animate-pulse rounded bg-slate-200" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
