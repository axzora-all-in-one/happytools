import './globals.css'
import { Plus_Jakarta_Sans } from 'next/font/google'
import Link from 'next/link'

const plusJakartaSans = Plus_Jakarta_Sans({ 
  subsets: ['latin'],
  weights: ['300', '400', '500', '600', '700', '800']
})

export const metadata = {
  title: 'HappyTools - Discover Amazing AI Tools That Make You Happy',
  description: 'Your daily dose of happiness-inducing AI tools, curated from Product Hunt, AITools.fyi, and more. Find tools that spark joy and boost your creativity, productivity, and success.',
  keywords: 'AI tools, artificial intelligence, happy tools, Product Hunt, AI discovery, machine learning, automation, AI products, productivity tools, creative AI',
  authors: [{ name: 'HappyTools Team' }],
  creator: 'HappyTools',
  publisher: 'HappyTools',
  metadataBase: new URL('https://happytools.ai'),
  openGraph: {
    title: 'HappyTools - Discover Amazing AI Tools That Make You Happy',
    description: 'Your daily dose of happiness-inducing AI tools, curated from the best sources',
    url: 'https://happytools.ai',
    siteName: 'HappyTools',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'HappyTools - AI Tools Discovery Platform',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HappyTools - Discover Amazing AI Tools',
    description: 'Your daily dose of happiness-inducing AI tools',
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
    <html lang="en" className="scroll-smooth">
      <body className={plusJakartaSans.className}>
        <div className="min-h-screen">
          <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/90 backdrop-blur-lg border-b border-white/10">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <Link href="/" className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">❤️</span>
                  </div>
                  <div>
                    <span className="text-xl font-bold text-white">
                      HappyTools
                    </span>
                    <div className="text-xs text-gray-300">
                      AI Tools Discovery
                    </div>
                  </div>
                </Link>
                <div className="flex items-center space-x-6">
                  <nav className="hidden md:flex items-center space-x-6">
                    <Link href="/" className="text-gray-300 hover:text-white transition-colors">
                      Home
                    </Link>
                    <Link href="/agents" className="text-gray-300 hover:text-white transition-colors">
                      Agents
                    </Link>
                    <Link href="/categories" className="text-gray-300 hover:text-white transition-colors">
                      Categories
                    </Link>
                  </nav>
                  <div className="flex items-center space-x-4">
                    <div className="hidden md:flex items-center space-x-2 text-sm text-gray-300">
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                      <span>Daily Updates</span>
                    </div>
                    <div className="text-sm text-gray-400 hidden lg:block">
                      Making AI Discovery Happy
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </header>
          <main className="pt-20">
            {children}
          </main>
          <footer className="bg-slate-900 border-t border-white/10 py-12">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">❤️</span>
                    </div>
                    <span className="text-lg font-bold text-white">HappyTools</span>
                  </div>
                  <p className="text-gray-300 text-sm">
                    Discover amazing AI tools that make you happy. Updated daily with love.
                  </p>
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-4">Sources</h4>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li>• Product Hunt</li>
                    <li>• AITools.fyi</li>
                    <li>• Daily Curation</li>
                    <li>• Community Submissions</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-4">Categories</h4>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li>• Content Creation</li>
                    <li>• Image Generation</li>
                    <li>• Productivity</li>
                    <li>• Marketing</li>
                  </ul>
                </div>
              </div>
              <div className="border-t border-white/10 mt-8 pt-8 text-center">
                <p className="text-gray-400 text-sm">
                  © 2024 HappyTools. Made with ❤️ for the AI community.
                </p>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}