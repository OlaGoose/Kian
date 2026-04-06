import { STIX_Two_Text } from 'next/font/google';
import '@/app/globals.css';

const stix = STIX_Two_Text({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
});

export const metadata = {
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={stix.variable}>{children}</body>
    </html>
  );
}
