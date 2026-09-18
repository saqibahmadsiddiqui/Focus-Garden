import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Focus Garden — Grow While You Focus',
    short_name: 'Focus Garden',
    description:
      'A calm Pomodoro-style focus timer that grows a living plant while you work, and lets it wilt if you give up.',
    start_url: '/',
    display: 'standalone',
    background_color: '#fbfbfa',
    theme_color: '#059669',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
