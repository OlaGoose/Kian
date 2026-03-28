import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get('title') ?? 'Your Name';
  const subtitle = searchParams.get('subtitle') ?? '';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'flex-end',
          padding: '80px',
          backgroundColor: '#050505',
          fontFamily: 'Georgia, serif',
        }}
      >
        {/* Subtle grid texture */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }}>
          {subtitle ? (
            <div
              style={{
                fontSize: '16px',
                color: '#666',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                fontFamily: 'system-ui, sans-serif',
              }}
            >
              {subtitle}
            </div>
          ) : null}

          <div
            style={{
              fontSize: title.length > 40 ? '42px' : '56px',
              fontWeight: 700,
              color: '#f5f5f5',
              lineHeight: 1.1,
              maxWidth: '900px',
            }}
          >
            {title}
          </div>

          {/* Bottom separator line */}
          <div
            style={{
              width: '48px',
              height: '2px',
              backgroundColor: '#444',
              marginTop: '8px',
            }}
          />
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
