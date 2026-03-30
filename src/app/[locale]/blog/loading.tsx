export default function BlogLoading() {
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
          <div className="h-8 w-32 bg-neutral-100 dark:bg-neutral-900 rounded-[2px] animate-pulse mb-3" />
          <div className="h-4 w-64 bg-neutral-100 dark:bg-neutral-900 rounded-[2px] animate-pulse mb-10" />

          {/* Post list skeleton */}
          <ul className="space-y-8">
            {Array.from({ length: 5 }).map((_, i) => (
              <li key={i}>
                <div className="flex items-start justify-between gap-4 mb-1">
                  <div className="h-5 bg-neutral-100 dark:bg-neutral-900 rounded-[2px] animate-pulse flex-1" />
                  <div className="h-4 w-6 bg-neutral-100 dark:bg-neutral-900 rounded-[2px] animate-pulse flex-shrink-0" />
                </div>
                <div className="h-4 w-4/5 bg-neutral-100 dark:bg-neutral-900 rounded-[2px] animate-pulse mb-2" />
                <div className="h-3 w-24 bg-neutral-100 dark:bg-neutral-900 rounded-[2px] animate-pulse" />
                <div className="mt-8 h-[1px] bg-neutral-100 dark:bg-neutral-900" />
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
}
