'use client';

import { useState } from 'react';
import { Github, Twitter, Youtube, Mail, Linkedin, Calendar } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { CustomLink } from '@/components/ui/custom-link';
import { LocaleSwitcher } from '@/components/ui/locale-switcher';
import { FeedbackButton } from '@/components/feedback/feedback-button';
import { BookingModal } from '@/components/booking/booking-modal';
import { SOCIAL_LINKS, LOCATION } from '@/lib/constants';
import { localizedText } from '@/lib/localized-content';
import type { PostPreview } from '@/types';

interface HomeClientProps {
  name: string;
  posts: PostPreview[];
}

export function HomeClient({ name, posts }: HomeClientProps) {
  const locale = useLocale();
  const t = useTranslations('home');
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const prefix = locale === 'zh' ? '/zh' : '';

  const getPostTitle = (post: PostPreview) =>
    localizedText(locale, post.title_en, post.title_zh);

  return (
    <div className="min-h-screen bg-white dark:bg-[#050505]">
      <main className="w-full mt-0 md:mt-16">
        <div className="max-w-[640px] mx-auto px-6 pt-10 pb-20 md:pt-0">

          {/* Name row: H1 on left, actions on right */}
          <div className="flex justify-between items-baseline mb-1">
            <div className="flex items-baseline gap-3">
              <h1 className="text-[22px] md:text-[30px] font-medium leading-[3.5rem]">
                {name}
              </h1>
              <span className="text-[11px] text-neutral-400 dark:text-neutral-600">
                {locale === 'zh' ? LOCATION.displayZh : LOCATION.display}
              </span>
            </div>
            <div className="flex items-center gap-3.5 pb-1">
              <button
                onClick={() => setIsBookingOpen(true)}
                className="text-neutral-400 dark:text-neutral-600 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                aria-label="Schedule a meeting"
              >
                <Calendar className="w-[15px] h-[15px]" strokeWidth={1.5} />
              </button>
              <LocaleSwitcher />
            </div>
          </div>

          <p className="text-[13px] md:text-[15px] leading-relaxed text-neutral-500 dark:text-neutral-500 mb-6">
            {t('tagline')}
          </p>

          <p className="text-copy my-6">
            {t.rich('bio1', {
              developerLink: (chunks) => <CustomLink href={`${prefix}/projects`}>{chunks}</CustomLink>,
              pinganLink: (chunks) => (
                <CustomLink href="https://group.pingan.com/" external>
                  {chunks}
                </CustomLink>
              ),
              sfLink: (chunks) => (
                <CustomLink href="https://www.sf-express.com/" external>
                  {chunks}
                </CustomLink>
              ),
              plaudLink: (chunks) => (
                <CustomLink href="https://www.plaud.ai/" external>
                  {chunks}
                </CustomLink>
              ),
            })}
          </p>

          <p className="text-copy my-6">
            {t('bio2')}
          </p>

          <p className="text-copy my-6">{t('writingTitle')}</p>
          <ul className="text-copy pl-0 space-y-1">
            {posts.map((post) => (
              <li key={post.id}>
                <CustomLink href={`${prefix}/blog/${post.slug}`}>
                  {getPostTitle(post)}
                </CustomLink>
              </li>
            ))}
          </ul>

          <p className="text-copy my-6">{t('projectsTitle')}</p>
          <ul className="text-copy pl-0 space-y-1">
            <li>
              <CustomLink href={`${prefix}/projects/ozon-catalog`}>
                {t('ozonCatalogProject')}
              </CustomLink>
            </li>
          </ul>

          <p className="text-copy my-6">
            {t.rich('footer', {
              blogLink: (chunks) => <CustomLink href={`${prefix}/blog`}>{chunks}</CustomLink>,
              projectsLink: (chunks) => <CustomLink href={`${prefix}/projects`}>{chunks}</CustomLink>,
              followLink: (chunks) => <CustomLink href={SOCIAL_LINKS.twitter} external>{chunks}</CustomLink>,
              contactLink: (chunks) => <CustomLink href={SOCIAL_LINKS.email} external>{chunks}</CustomLink>,
            })}
          </p>

          <p className="text-[11px] md:text-[13px] uppercase tracking-wider text-neutral-400 dark:text-neutral-600 mt-10 mb-4">
            {locale === 'zh' ? '探索更多' : 'Explore'}
          </p>
          <div className="text-copy flex flex-wrap gap-x-4 gap-y-2">
            <CustomLink href={`${prefix}/about`}>{locale === 'zh' ? '关于' : 'About'}</CustomLink>
            <CustomLink href={`${prefix}/uses`}>Uses</CustomLink>
            <CustomLink href={`${prefix}/notes`}>Notes</CustomLink>
            <CustomLink href={`${prefix}/newsletter`}>{locale === 'zh' ? '订阅' : 'Newsletter'}</CustomLink>
            <CustomLink href={`${prefix}/guestbook`}>{locale === 'zh' ? '留言板' : 'Guestbook'}</CustomLink>
          </div>

          {/* Social links */}
          <div className="mt-12 flex items-center gap-5 text-neutral-400 dark:text-neutral-600">
            {SOCIAL_LINKS.twitter && (
              <a
                href={SOCIAL_LINKS.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                aria-label="Twitter / X"
              >
                <Twitter className="w-[17px] h-[17px]" strokeWidth={1.5} />
              </a>
            )}
            {SOCIAL_LINKS.github && (
              <a
                href={SOCIAL_LINKS.github}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-[17px] h-[17px]" strokeWidth={1.5} />
              </a>
            )}
            {SOCIAL_LINKS.youtube && (
              <a
                href={SOCIAL_LINKS.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="w-[17px] h-[17px]" strokeWidth={1.5} />
              </a>
            )}
            {SOCIAL_LINKS.linkedin && (
              <a
                href={SOCIAL_LINKS.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-[17px] h-[17px]" strokeWidth={1.5} />
              </a>
            )}
            <a
              href={SOCIAL_LINKS.email}
              className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
              aria-label="Email"
            >
              <Mail className="w-[17px] h-[17px]" strokeWidth={1.5} />
            </a>
          </div>

        </div>
      </main>

      <FeedbackButton />
      <BookingModal isOpen={isBookingOpen} onClose={() => setIsBookingOpen(false)} />
    </div>
  );
}
