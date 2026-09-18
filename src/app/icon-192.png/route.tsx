import { ImageResponse } from 'next/og';

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 120,
          background: 'linear-gradient(135deg, #059669, #0d9488)',
        }}
      >
        🌱
      </div>
    ),
    { width: 192, height: 192 }
  );
}
