export function SkeletonEventCard() {
  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-lg bg-white dark:bg-zinc-900 transition overflow-hidden animate-pulse">
      <div className="relative aspect-[16/9] w-full bg-zinc-200 dark:bg-zinc-800" />
      <div className="pb-2 pt-4 px-5">
        <div className="h-6 bg-zinc-200 dark:bg-zinc-700 rounded w-3/4 mb-2" />
        <div className="flex gap-2 mb-2">
          <div className="h-5 w-20 bg-zinc-200 dark:bg-zinc-700 rounded-full" />
          <div className="h-5 w-24 bg-zinc-200 dark:bg-zinc-700 rounded-full" />
        </div>
      </div>
      <div className="space-y-2 px-5 pb-5">
        <div className="h-4 w-1/2 bg-zinc-200 dark:bg-zinc-700 rounded" />
        <div className="h-4 w-1/3 bg-zinc-200 dark:bg-zinc-700 rounded" />
        <div className="h-4 w-1/4 bg-zinc-200 dark:bg-zinc-700 rounded" />
      </div>
    </div>
  );
} 