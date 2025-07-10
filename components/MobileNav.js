'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, Home, Bot, Grid3X3, Heart, Sparkles, TrendingUp } from 'lucide-react'

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)

  const navItems = [
    { href: '/', label: 'Home', icon: Home, description: 'Discover AI Tools' },
    { href: '/agents', label: 'AI Agents', icon: Bot, description: 'Professional AI Agents' },
    { href: '/chatbot-builder', label: 'Chatbot Builder', icon: Grid3X3, description: 'Build Custom Chatbots' }
  ]

  const quickActions = [
    { 
      action: () => {
        fetch('/api/ai-tools/sync-aitools', { method: 'POST' })
        setIsOpen(false)
      }, 
      label: 'Sync Tools', 
      icon: Sparkles, 
      description: 'Get latest AI tools' 
    },
    { 
      href: '/agents', 
      label: 'Try Agents', 
      icon: Bot, 
      description: 'Use AI agents now' 
    }
  ]

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
        aria-label="Toggle mobile menu"
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
          <div className="absolute top-0 right-0 w-full max-w-sm h-full bg-slate-900/95 backdrop-blur-lg border-l border-white/10">
            <div className="p-6 h-full flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 rounded-full flex items-center justify-center">
                    <Heart className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <span className="text-xl font-bold text-white">HappyTools</span>
                    <div className="text-xs text-gray-300">AI Discovery</div>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="space-y-2 mb-8">
                <div className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wide">
                  Navigation
                </div>
                {navItems.map((item) => {
                  const IconComponent = item.icon
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center space-x-3 text-gray-300 hover:text-white hover:bg-white/10 px-4 py-3 rounded-lg transition-all group"
                    >
                      <div className="p-2 bg-white/5 rounded-lg group-hover:bg-white/10">
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-medium">{item.label}</div>
                        <div className="text-xs text-gray-400">{item.description}</div>
                      </div>
                    </Link>
                  )
                })}
              </nav>

              {/* Quick Actions */}
              <div className="space-y-2 mb-8">
                <div className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wide">
                  Quick Actions
                </div>
                {quickActions.map((action, index) => {
                  const IconComponent = action.icon
                  return action.href ? (
                    <Link
                      key={index}
                      href={action.href}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center space-x-3 text-gray-300 hover:text-white hover:bg-white/10 px-4 py-3 rounded-lg transition-all group"
                    >
                      <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                        <IconComponent className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="font-medium">{action.label}</div>
                        <div className="text-xs text-gray-400">{action.description}</div>
                      </div>
                    </Link>
                  ) : (
                    <button
                      key={index}
                      onClick={action.action}
                      className="w-full flex items-center space-x-3 text-gray-300 hover:text-white hover:bg-white/10 px-4 py-3 rounded-lg transition-all group"
                    >
                      <div className="p-2 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg">
                        <IconComponent className="w-4 h-4 text-white" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium">{action.label}</div>
                        <div className="text-xs text-gray-400">{action.description}</div>
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Status Indicator */}
              <div className="p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg border border-white/10 mb-6">
                <div className="flex items-center space-x-2 text-sm text-gray-300 mb-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  <span className="font-medium">System Status: Online</span>
                </div>
                <div className="text-xs text-gray-400">
                  Daily updates active • All agents ready
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  <TrendingUp className="w-3 h-3 text-green-400" />
                  <span className="text-xs text-green-400">68 tools available</span>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-auto pt-6 border-t border-white/10">
                <div className="text-center">
                  <p className="text-xs text-gray-400">
                    © 2024 HappyTools
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Made with ❤️ for the AI community
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}