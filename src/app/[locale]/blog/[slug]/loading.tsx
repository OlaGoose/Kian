export default function BlogPostLoading() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#050505]">
      <main className="w-full mt-0 md:mt-16">
        <div className="max-w-[640px] mx-auto px-6 pt-10 pb-20 md:pt-0">
          {/* Back link skeleton */}
          <div className="h-4 w-24 bg-neutral-100 dark:bg-neutral-900 rounded-[2px] animate-pulse mb-8" />

          {/* Article header */}
          <article>
            <header className="mb-10">
              <div className="h-8 w-4/5 bg-neutral-100 dark:bg-neutral-900 rounded-[2px] animate-pulse mb-2" />
              <div className="h-7 w-1/2 bg-neutral-100 dark:bg-neutral-900 rounded-[2px] animate-pulse mb-4" />

              <div className="flex items-center gap-4">
                <div className="h-3 w-28 bg-neutral-100 dark:bg-neutral-900 rounded-[2px] animate-pulse" />
                <div className="h-3 w-16 bg-neutral-100 dark:bg-neutral-900 rounded-[2px] animate-pulse" />
              </div>

              <div className="flex items-center gap-3 mt-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-3 w-12 bg-neutral-100 dark:bg-neutral-900 rounded-[2px] animate-pulse" />
                ))}
              </div>
            </header>

            <div className="h-[1px] bg-neutral-100 dark:bg-neutral-900 mb-10" />

            {/* Content skeleton */}
            <div className="space-y-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="h-5 bg-neutral-100 dark:bg-neutral-900 rounded-[2px] animate-pulse"
                  style={{ width: `${75 + Math.floor((i * 13) % 25)}%` }}
                />
              ))}
              <div className="h-8 w-40 bg-neutral-100 dark:bg-neutral-900 rounded-[2px] animate-pulse mt-8" />
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={`b-${i}`}
                  className="h-5 bg-neutral-100 dark:bg-neutral-900 rounded-[2px] animate-pulse"
                  style={{ width: `${60 + Math.floor((i * 17) % 35)}%` }}
                />
              ))}
            </div>
          </article>
        </div>
      </main>
    </div>
  );
}
