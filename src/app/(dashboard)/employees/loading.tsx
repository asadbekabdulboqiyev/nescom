export default function EmployeesLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-56 animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-72 animate-pulse rounded bg-slate-200" />
        </div>
        <div className="h-10 w-40 animate-pulse rounded-lg bg-slate-200" />
      </div>

      <div className="flex gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-9 w-28 animate-pulse rounded-lg bg-slate-200" />
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="h-12 w-12 animate-pulse rounded-full bg-slate-200" />
              <div className="space-y-2">
                <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />
                <div className="h-3 w-20 animate-pulse rounded bg-slate-200" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <div className="h-3 w-16 animate-pulse rounded bg-slate-200" />
                <div className="h-3 w-24 animate-pulse rounded bg-slate-200" />
              </div>
              <div className="flex justify-between">
                <div className="h-3 w-16 animate-pulse rounded bg-slate-200" />
                <div className="h-3 w-20 animate-pulse rounded bg-slate-200" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
