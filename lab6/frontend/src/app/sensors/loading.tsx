export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-10 space-y-8 animate-in fade-in duration-500">
      <div className="space-y-4">
        <div className="h-10 w-64 bg-muted rounded-lg animate-pulse" />
        <div className="h-4 w-96 bg-muted rounded animate-pulse" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="rounded-2xl border bg-card p-6 space-y-4">
            <div className="flex justify-between">
              <div className="h-12 w-12 bg-muted rounded-xl animate-pulse" />
              <div className="h-6 w-16 bg-muted rounded-full animate-pulse" />
            </div>
            <div className="h-6 w-32 bg-muted rounded animate-pulse" />
            <div className="h-4 w-24 bg-muted rounded animate-pulse" />
            <div className="flex justify-between pt-4">
              <div className="h-8 w-20 bg-muted rounded animate-pulse" />
              <div className="h-8 w-8 bg-muted rounded-full animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
