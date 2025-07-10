import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'AI Tools Discovery Platform | Axzora',
  description: 'Discover the latest AI tools and innovations every day. Your daily dose of cutting-edge AI tools, curated from Product Hunt and beyond.',
  keywords: 'AI tools, artificial intelligence, Product Hunt, AI discovery, machine learning, automation, AI products',
  authors: [{ name: 'Axzora Inc' }],
  creator: 'Axzora Inc',
  publisher: 'Axzora Inc',
  openGraph: {
    title: 'AI Tools Discovery Platform | Axzora',
    description: 'Discover the latest AI tools and innovations every day',
    url: 'https://axzorait.com',
    siteName: 'AI Tools Discovery Platform',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'AI Tools Discovery Platform',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Tools Discovery Platform | Axzora',
    description: 'Discover the latest AI tools and innovations every day',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-white">
          <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">AI</span>
                  </div>
                  <span className="text-xl font-bold text-gray-900">
                    AI Tools Discovery
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600 hidden md:inline">
                    Powered by Axzora
                  </span>
                </div>
              </div>
            </div>
          </header>
          <main>
            {children}
          </main>
          <footer className="bg-gray-50 border-t border-gray-200 py-8">
            <div className="container mx-auto px-4">
              <div className="text-center">
                <p className="text-gray-600 mb-2">
                  © 2024 Axzora Inc. All rights reserved.
                </p>
                <p className="text-sm text-gray-500">
                  Discover the latest AI tools and innovations every day
                </p>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}