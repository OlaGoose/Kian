import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#050505',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 14,
            top: 76,
            width: 152,
            height: 44,
            border: '5px solid #e8d4bc',
            borderRadius: '9999px',
            transform: 'rotate(-26deg)',
            opacity: 0.95,
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: 39,
            top: 36,
            width: 102,
            height: 102,
            borderRadius: '9999px',
            background:
              'radial-gradient(circle at 32% 28%, #ffb366 0%, #e85d04 42%, #7a2f0a 100%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: 52,
            top: 48,
            width: 36,
            height: 26,
            borderRadius: '9999px',
            backgroundColor: 'rgba(255,255,255,0.22)',
            transform: 'rotate(-12deg)',
          }}
        />
      </div>
    ),
    { ...size },
  );
}
