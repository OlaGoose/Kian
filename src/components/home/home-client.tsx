'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Github, Twitter, Youtube, Mail, Linkedin, Calendar } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { CustomLink } from '@/components/ui/custom-link';
import { LocaleSwitcher } from '@/components/ui/locale-switcher';
import { FeedbackButton } from '@/components/feedback/feedback-button';
import { BookingModal } from '@/components/booking/booking-modal';
import { SOCIAL_LINKS } from '@/lib/constants';
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
            <h1 className="text-[22px] md:text-[30px] font-medium leading-[3.5rem]">
              {name}
            </h1>
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

          <p className="text-copy my-6">
            {t.rich('bio1', {
              developerLink: (chunks) => <CustomLink href={`${prefix}/projects`}>{chunks}</CustomLink>,
              productLink: (chunks) => <CustomLink href={`${prefix}/projects`}>{chunks}</CustomLink>,
            })}
          </p>

          <p className="text-copy my-6">
            {t.rich('bio2', {
              musicLink: (chunks) => <CustomLink href="#" external>{chunks}</CustomLink>,
            })}
          </p>

          {posts.length > 0 && (
            <>
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
            </>
          )}

          <p className="text-copy my-6">
            {t.rich('aiTwin', {
              chatLink: (chunks) => (
                <Link
                  href={`${prefix}/chat`}
                  className="transition-colors underline decoration-neutral-500 decoration-1 underline-offset-[2.5px] hover:decoration-neutral-400 dark:hover:decoration-neutral-600"
                >
                  {chunks}
                </Link>
              ),
            })}
          </p>

          <p className="text-copy my-6">
            {t.rich('footer', {
              blogLink: (chunks) => <CustomLink href={`${prefix}/blog`}>{chunks}</CustomLink>,
              projectsLink: (chunks) => <CustomLink href={`${prefix}/projects`}>{chunks}</CustomLink>,
              followLink: (chunks) => <CustomLink href={SOCIAL_LINKS.twitter} external>{chunks}</CustomLink>,
              contactLink: (chunks) => <CustomLink href={SOCIAL_LINKS.email} external>{chunks}</CustomLink>,
            })}
          </p>

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
