import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'FinBudgetManager',
    short_name: 'Budget Manager',
    description: 'Life-improving financial management and budget tracking application.',
    start_url: '/',
    id: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [
      {
        src: '/app-icon.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/app-icon.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/app-icon.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/app-icon.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      }
    ],
    categories: ['finance', 'productivity'],
    orientation: 'portrait',
    prefer_related_applications: false,
    scope: '/',
  }
}
