import type { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'FinBudgetManager',
    short_name: 'Budget',
    description: 'Comprehensive personal finance and budget management application.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [
      {
        src: '/app-icon.png',
        sizes: 'any',
        type: 'image/png',
      },
      {
        src: '/app-icon.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/app-icon.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
