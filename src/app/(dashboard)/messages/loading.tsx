export default function MessagesLoading() {
  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      <div className="w-80 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-4 h-6 w-32 animate-pulse rounded bg-slate-200" />
        <div className="mb-4 h-10 w-full animate-pulse rounded-lg bg-slate-200" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-3 rounded-lg p-3">
              <div className="h-10 w-10 animate-pulse rounded-full bg-slate-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
                <div className="h-3 w-36 animate-pulse rounded bg-slate-200" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-200 p-4">
          <div className="h-10 w-10 animate-pulse rounded-full bg-slate-200" />
          <div className="space-y-2">
            <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
            <div className="h-3 w-20 animate-pulse rounded bg-slate-200" />
          </div>
        </div>
        <div className="flex flex-col justify-end p-4" style={{ minHeight: 'calc(100vh - 16rem)' }}>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`h-12 ${i % 2 === 0 ? 'w-48' : 'w-56'} animate-pulse rounded-xl bg-slate-200`}
                />
              </div>
            ))}
          </div>
        </div>
        <div className="border-t border-slate-200 p-4">
          <div className="flex gap-2">
            <div className="h-10 flex-1 animate-pulse rounded-lg bg-slate-200" />
            <div className="h-10 w-24 animate-pulse rounded-lg bg-slate-200" />
          </div>
        </div>
      </div>
    </div>
  );
}
