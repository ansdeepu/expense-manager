import type { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'FinBudgetManager',
    short_name: 'Budget',
    description: 'Comprehensive personal finance and budget management application.',
    id: '/',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    orientation: 'portrait',
    prefer_related_applications: false,
    categories: ['finance', 'productivity'],
    shortcuts: [
      {
        name: 'Dashboard',
        url: '/dashboard',
        icons: [{ src: '/app-icon.png', sizes: '192x192' }]
      }
    ],
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
      },
    ],
  }
}
