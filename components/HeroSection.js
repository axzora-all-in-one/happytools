'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Sparkles, TrendingUp, Zap } from 'lucide-react'
import { useState } from 'react'

export default function HeroSection({ onSearch }) {
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = () => {
    if (onSearch) {
      onSearch(searchQuery)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-20">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="container mx-auto px-4 text-center relative">
        <div className="max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center bg-gradient-to-r from-blue-100 to-purple-100 rounded-full px-4 py-2 mb-6 border border-blue-200">
            <Sparkles className="w-4 h-4 mr-2 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Discover the Future of AI</span>
          </div>
          
          {/* Main heading */}
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Discover the Latest{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AI Tools
            </span>{' '}
            Every Day
          </h1>
          
          {/* Subheading */}
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Your daily dose of cutting-edge AI tools, curated from Product Hunt and beyond. 
            Stay ahead of the curve with the latest innovations in artificial intelligence.
          </p>
          
          {/* Search bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative flex items-center">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <Search className="w-5 h-5 text-gray-400" />
              </div>
              <Input
                type="text"
                placeholder="Search for AI tools, chatbots, automation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10 pr-4 py-3 w-full text-lg border-2 border-gray-200 rounded-full focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              />
              <Button 
                onClick={handleSearch}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-full px-6"
              >
                Search
              </Button>
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-3">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">500+</h3>
              <p className="text-gray-600">AI Tools Discovered</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-3">
                <Zap className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Daily</h3>
              <p className="text-gray-600">Fresh Updates</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-full mb-3">
                <Sparkles className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Curated</h3>
              <p className="text-gray-600">Quality First</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}