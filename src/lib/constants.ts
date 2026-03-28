export const SITE_NAME = 'Your Name';
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://yourdomain.com';
export const SITE_DESCRIPTION = 'Developer, builder, and writer.';
export const SITE_DESCRIPTION_ZH = '开发者、产品构建者与写作者。';

export const SOCIAL_LINKS = {
  twitter: 'https://x.com/yourusername',
  github: 'https://github.com/yourusername',
  youtube: '',
  linkedin: 'https://linkedin.com/in/yourusername',
  email: 'mailto:hello@yourdomain.com',
} as const;

export const DEFAULT_OG_IMAGE = `${SITE_URL}/og?title=${encodeURIComponent(SITE_NAME)}`;
