export default function BlogPostLoading() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#050505]">
      <main className="w-full mt-0 md:mt-16">
        <div className="mx-auto max-w-[720px] px-6 pb-20 pt-10 md:pt-0">
          <div className="mb-8 h-4 w-24 animate-pulse rounded-[2px] bg-neutral-100 dark:bg-neutral-900" />

          <article>
            <header className="mb-10 border-b border-neutral-100 pb-10 dark:border-neutral-900">
              <div className="mb-4 flex gap-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-3 w-16 animate-pulse rounded-[2px] bg-neutral-100 dark:bg-neutral-900"
                  />
                ))}
              </div>
              <div className="mb-4 h-8 w-4/5 max-w-xl animate-pulse rounded-[2px] bg-neutral-100 dark:bg-neutral-900" />
              <div className="mb-6 h-16 max-w-[600px] animate-pulse rounded-[2px] bg-neutral-100 dark:bg-neutral-900" />

              <div className="flex flex-wrap gap-3">
                <div className="h-3 w-28 animate-pulse rounded-[2px] bg-neutral-100 dark:bg-neutral-900" />
                <div className="h-3 w-20 animate-pulse rounded-[2px] bg-neutral-100 dark:bg-neutral-900" />
                <div className="h-3 w-24 animate-pulse rounded-[2px] bg-neutral-100 dark:bg-neutral-900" />
              </div>
            </header>

            <div className="mb-10 h-24 animate-pulse rounded-[2px] border border-neutral-100 bg-neutral-50 dark:border-neutral-800 dark:bg-[#0a0a0a]" />

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
