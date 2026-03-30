export default function ProjectsLoading() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#050505]">
      <main className="w-full mt-0 md:mt-16">
        <div className="max-w-[640px] mx-auto px-6 pt-10 pb-20 md:pt-0">
          {/* Header skeleton */}
          <div className="mb-8 flex items-center justify-between">
            <div className="h-4 w-24 bg-neutral-100 dark:bg-neutral-900 rounded-[2px] animate-pulse" />
            <div className="h-4 w-16 bg-neutral-100 dark:bg-neutral-900 rounded-[2px] animate-pulse" />
          </div>

          {/* H1 skeleton */}
          <div className="h-8 w-28 bg-neutral-100 dark:bg-neutral-900 rounded-[2px] animate-pulse mb-3" />
          <div className="h-4 w-56 bg-neutral-100 dark:bg-neutral-900 rounded-[2px] animate-pulse mb-10" />

          {/* Section label */}
          <div className="h-3 w-16 bg-neutral-100 dark:bg-neutral-900 rounded-[2px] animate-pulse mb-6" />

          {/* Project card skeletons */}
          <div className="space-y-0">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="py-8 border-b border-neutral-100 dark:border-neutral-900 last:border-0"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-5 w-32 bg-neutral-100 dark:bg-neutral-900 rounded-[2px] animate-pulse" />
                      <div className="h-3 w-10 bg-neutral-100 dark:bg-neutral-900 rounded-[2px] animate-pulse" />
                    </div>
                    <div className="h-4 w-full bg-neutral-100 dark:bg-neutral-900 rounded-[2px] animate-pulse mb-3" />
                    <div className="flex gap-3">
                      {Array.from({ length: 3 }).map((_, j) => (
                        <div key={j} className="h-3 w-12 bg-neutral-100 dark:bg-neutral-900 rounded-[2px] animate-pulse" />
                      ))}
                    </div>
                  </div>
                  <div className="h-4 w-4 bg-neutral-100 dark:bg-neutral-900 rounded-[2px] animate-pulse flex-shrink-0 mt-0.5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
