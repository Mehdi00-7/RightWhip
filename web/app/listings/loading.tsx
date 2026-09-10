export default function Loading() {
  return (
    <main className="max-w-6xl w-full mx-auto p-4 sm:p-6 flex flex-col sm:flex-row gap-6">
      <div className="w-full sm:w-64 h-96 bg-white border border-slate-200 rounded-xl animate-pulse" />
      <div className="flex-1">
        <div className="h-11 bg-white border border-slate-200 rounded-xl animate-pulse mb-6" />
        <div className="h-8 w-40 bg-slate-200 rounded animate-pulse mb-5" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="h-40 bg-slate-100 animate-pulse" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-slate-200 rounded animate-pulse w-3/4" />
                <div className="h-5 bg-slate-200 rounded animate-pulse w-1/3" />
                <div className="h-3 bg-slate-100 rounded animate-pulse w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
