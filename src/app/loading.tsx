import { Skeleton } from "@/components/ui/misc";

export default function Loading() {
  return (
    <div className="container-site space-y-4 py-4 lg:py-6">
      <div className="rounded-2xl border border-ink-100 bg-white p-4 shadow-xs sm:p-5">
        <Skeleton className="h-3 w-40" />
        <div className="mt-4 flex items-center gap-3">
          <Skeleton className="h-12 w-12 rounded-2xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-56" />
            <Skeleton className="h-3 w-full max-w-xl" />
          </div>
        </div>
      </div>

      <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="rounded-2xl border border-ink-100 bg-white p-3.5 shadow-xs"
          >
            <Skeleton className="h-9 w-9 rounded-lg" />
            <Skeleton className="mt-3 h-3 w-20" />
            <Skeleton className="mt-2 h-4 w-28" />
          </div>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="rounded-2xl border border-ink-100 bg-white p-3 shadow-xs"
          >
            <Skeleton className="aspect-square w-full rounded-xl" />
            <Skeleton className="mt-3 h-3.5 w-4/5" />
            <Skeleton className="mt-2 h-3.5 w-3/5" />
            <Skeleton className="mt-4 h-5 w-1/2" />
            <Skeleton className="mt-3 h-9 w-full rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}
