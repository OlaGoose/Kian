export const SITE_NAME = 'Kian Xu';

export const LOCATION = {
  display: 'Shenzhen, China',
  displayZh: '中国·深圳',
  timezone: 'GMT+8',
} as const;
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://yourdomain.com';
export const SITE_DESCRIPTION = 'Merchant by day. Dad by evening. Builder by night.';
export const SITE_DESCRIPTION_ZH = '白天经商，傍晚陪伴家人，夜里构建产品。';

export const SOCIAL_LINKS = {
  twitter: 'https://x.com/yourusername',
  github: 'https://github.com/yourusername',
  youtube: '',
  linkedin: 'https://linkedin.com/in/yourusername',
  email: 'mailto:kianm.aitech@gmail.com',
} as const;

export const DEFAULT_OG_IMAGE = `${SITE_URL}/og?title=${encodeURIComponent(SITE_NAME)}`;
