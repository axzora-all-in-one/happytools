'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, Home, Bot, Grid3X3, Heart } from 'lucide-react'

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/agents', label: 'Agents', icon: Bot },
    { href: '/categories', label: 'Categories', icon: Grid3X3 }
  ]

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu Panel */}
          <div className="absolute top-0 right-0 w-80 h-full bg-slate-900/95 backdrop-blur-lg border-l border-white/10">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 rounded-full flex items-center justify-center">
                    <Heart className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xl font-bold text-white">HappyTools</span>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="space-y-4">
                {navItems.map((item) => {
                  const IconComponent = item.icon
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center space-x-3 text-gray-300 hover:text-white hover:bg-white/10 px-4 py-3 rounded-lg transition-all"
                    >
                      <IconComponent className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  )
                })}
              </nav>

              {/* Status Indicator */}
              <div className="mt-8 p-4 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center space-x-2 text-sm text-gray-300">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  <span>Daily Updates Active</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Making AI Discovery Happy
                </p>
              </div>

              {/* Footer */}
              <div className="mt-8 pt-6 border-t border-white/10">
                <p className="text-xs text-gray-400 text-center">
                  © 2024 HappyTools
                </p>
                <p className="text-xs text-gray-500 text-center mt-1">
                  Made with ❤️ for the AI community
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}