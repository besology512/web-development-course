export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl space-y-8 animate-in fade-in duration-500">
      <div className="h-4 w-32 bg-muted rounded animate-pulse" />

      <div className="rounded-3xl border bg-card shadow-lg overflow-hidden h-[400px]">
        <div className="bg-primary/5 p-8 border-b h-24 flex flex-col gap-2">
           <div className="h-8 w-64 bg-muted rounded animate-pulse" />
           <div className="h-4 w-48 bg-muted rounded animate-pulse" />
        </div>
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="space-y-6">
              <div className="h-4 w-24 bg-muted rounded animate-pulse" />
              <div className="h-16 w-48 bg-muted rounded animate-pulse" />
              <div className="h-8 w-64 bg-muted rounded-full animate-pulse" />
           </div>
           <div className="rounded-2xl bg-muted/50 p-6 space-y-4">
              <div className="h-6 w-32 bg-muted rounded animate-pulse" />
              <div className="space-y-3">
                 <div className="h-4 w-full bg-muted rounded animate-pulse" />
                 <div className="h-4 w-full bg-muted rounded animate-pulse" />
                 <div className="h-4 w-full bg-muted rounded animate-pulse" />
              </div>
           </div>
        </div>
      </div>
      
      <div className="flex justify-center flex-col items-center gap-4 py-10">
        <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium animate-pulse">Contacting IoT Gateway...</p>
      </div>
    </div>
  );
}
