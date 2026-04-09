export const SITE_NAME = 'Kian Xu';

export const LOCATION = {
  display: 'Shenzhen, China',
  displayZh: '中国·深圳',
  timezone: 'GMT+8',
} as const;
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://kianxu.com';
export const SITE_DESCRIPTION = 'Merchant by day. Dad by evening. Builder by night.';
export const SITE_DESCRIPTION_ZH = '白天经商，傍晚陪伴家人，夜里构建产品。';

export const TWITTER_CREATOR = '@MKian2958';

export const SOCIAL_LINKS = {
  twitter: 'https://x.com/MKian2958',
  github: 'https://github.com/KianMX',
  youtube: '',
  linkedin: 'https://www.linkedin.com/in/kian73348a398/',
  email: 'mailto:kianm.aitech@gmail.com',
} as const;

export const DEFAULT_OG_IMAGE = `${SITE_URL}/api/og?title=${encodeURIComponent(SITE_NAME)}`;

export const FEATURES = {
  feedback: process.env.NEXT_PUBLIC_FEEDBACK_ENABLED !== 'false',
  booking: process.env.NEXT_PUBLIC_BOOKING_ENABLED !== 'false',
} as const;
