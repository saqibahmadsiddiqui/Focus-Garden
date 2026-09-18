import { ImageResponse } from 'next/og';

export const alt = 'Focus Garden — Grow While You Focus';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #06251c 0%, #0a3d2c 45%, #0d5c3f 100%)',
          color: '#ecfdf5',
        }}
      >
        <div style={{ display: 'flex', fontSize: 140 }}>🌱</div>
        <div style={{ display: 'flex', fontSize: 72, fontWeight: 700, marginTop: 8 }}>
          Focus Garden
        </div>
        <div style={{ display: 'flex', fontSize: 30, color: '#6ee7b7', marginTop: 16 }}>
          Grow a living garden every time you focus
        </div>
      </div>
    ),
    { ...size }
  );
}
