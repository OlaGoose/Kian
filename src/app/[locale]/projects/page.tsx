import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { ArrowUpRight, Github } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { SiteHeader } from '@/components/layout/site-header';
import { FeedbackButton } from '@/components/feedback/feedback-button';
import { localizedText } from '@/lib/localized-content';
import { getAlternates } from '@/lib/metadata';
import { buildSoftwareAppListLd } from '@/lib/structured-data';
import type { Project } from '@/types';
import type { Tables } from '@/lib/supabase/database.types';

export const revalidate = 3600;

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'projects' });
  const siteT = await getTranslations({ locale, namespace: 'site' });
  const alternates = getAlternates(locale, 'projects');

  return {
    title: t('title'),
    description: t('description'),
    alternates,
    openGraph: {
      title: `${t('title')} — ${siteT('name')}`,
      description: t('description'),
      url: alternates.canonical,
    },
  };
}

function StatusBadge({ status, label }: { status: Project['status']; label: string }) {
  const colors = {
    live: 'text-emerald-600 dark:text-emerald-500',
    wip: 'text-amber-600 dark:text-amber-500',
    archived: 'text-neutral-400',
  };

  return (
    <span className={`text-[10px] md:text-[12px] font-sans uppercase tracking-wider ${colors[status]}`}>
      {label}
    </span>
  );
}

export default async function ProjectsPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'projects' });
  const siteT = await getTranslations({ locale, namespace: 'site' });

  const supabase = await createClient();
  const { data: rawProjects } = await supabase
    .from('projects')
    .select('*')
    .order('featured', { ascending: false })
    .order('display_order', { ascending: true });

  const projects = rawProjects as Tables<'projects'>[] | null;

  const getDescription = (p: Project) =>
    localizedText(locale, p.description_en, p.description_zh);

  const featured = projects?.filter((p) => p.featured) ?? [];
  const others = projects?.filter((p) => !p.featured) ?? [];

  const jsonLd = buildSoftwareAppListLd({
    name: t('title'),
    items:
      projects?.map((p, i) => ({
        position: i + 1,
        name: p.name,
        description: getDescription(p),
        url: p.url,
      })) ?? [],
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-white dark:bg-[#050505]">
        <main className="w-full mt-0 md:mt-16">
          <div className="max-w-[640px] mx-auto px-6 pt-10 pb-20 md:pt-0">
          <SiteHeader name={siteT('name')} />

          <section>
            <h1 className="text-[22px] md:text-[30px] font-medium leading-tight mb-2">
              {t('title')}
            </h1>
            <p className="text-copy text-neutral-500 dark:text-neutral-500 mb-10">
              {t('description')}
            </p>

            {featured.length > 0 && (
              <div className="mb-12">
                <h2 className="text-[11px] md:text-[13px] uppercase tracking-wider text-neutral-400 dark:text-neutral-600 mb-6">
                  {t('featured')}
                </h2>
                <div className="space-y-0">
                  {featured.map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      description={getDescription(project)}
                      visitLabel={t('visitSite')}
                      codeLabel={t('viewCode')}
                      statusLabels={{
                        live: t('status.live'),
                        wip: t('status.wip'),
                        archived: t('status.archived'),
                      }}
                      featured
                    />
                  ))}
                </div>
              </div>
            )}

            {others.length > 0 && (
              <div>
                {featured.length > 0 && (
                  <h2 className="text-[11px] md:text-[13px] uppercase tracking-wider text-neutral-400 dark:text-neutral-600 mb-6">
                    Other
                  </h2>
                )}
                <div className="space-y-0">
                  {others.map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      description={getDescription(project)}
                      visitLabel={t('visitSite')}
                      codeLabel={t('viewCode')}
                      statusLabels={{
                        live: t('status.live'),
                        wip: t('status.wip'),
                        archived: t('status.archived'),
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {(!projects || projects.length === 0) && (
              <p className="text-copy text-neutral-500 dark:text-neutral-500">No projects yet.</p>
            )}
          </section>
          </div>
        </main>

        <FeedbackButton />
      </div>
    </>
  );
}

function ProjectCard({
  project,
  description,
  visitLabel,
  codeLabel,
  statusLabels,
  featured,
}: {
  project: Project;
  description: string | null;
  visitLabel: string;
  codeLabel: string;
  statusLabels: Record<string, string>;
  featured?: boolean;
}) {
  return (
    <div
      className={`group py-6 border-b border-neutral-100 dark:border-neutral-900 last:border-0 ${
        featured ? 'py-8' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <h3 className={`font-medium text-neutral-900 dark:text-neutral-100 ${featured ? 'text-[16px] md:text-[20px]' : 'text-[15px] md:text-[18px]'}`}>
              {project.name}
            </h3>
            <StatusBadge status={project.status} label={statusLabels[project.status]} />
          </div>

          {description && (
            <p className="text-[14px] md:text-[18px] leading-relaxed text-neutral-500 dark:text-neutral-500 mb-3">
              {description}
            </p>
          )}

          {project.tech.length > 0 && (
            <div className="flex flex-wrap gap-x-3 gap-y-1 mb-4">
              {project.tech.map((tech) => (
                <span
                  key={tech}
                  className="text-[11px] md:text-[13px] font-mono text-neutral-400 dark:text-neutral-600"
                >
                  {tech}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 flex-shrink-0 mt-0.5">
          {project.github_url && (
            <a
              href={project.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-400 dark:text-neutral-600 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
              aria-label={`${codeLabel}: ${project.name}`}
            >
              <Github className="w-4 h-4" strokeWidth={1.5} />
            </a>
          )}
          {project.url && (
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-400 dark:text-neutral-600 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
              aria-label={`${visitLabel}: ${project.name}`}
            >
              <ArrowUpRight className="w-4 h-4" strokeWidth={1.5} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
