'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Sparkles, TrendingUp, Zap, Heart, Star, Users, Bot } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function ModernHeroSection({ onSearch, onCategoryFilter }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [isLoaded, setIsLoaded] = useState(false)

  const categories = [
    { id: 'all', name: 'All Tools', icon: '🔥', color: 'gradient-bg' },
    { id: 'content-creation', name: 'Content', icon: '✍️', color: 'gradient-bg-2' },
    { id: 'image-generation', name: 'Images', icon: '🎨', color: 'gradient-bg-3' },
    { id: 'productivity', name: 'Productivity', icon: '⚡', color: 'gradient-bg-4' },
    { id: 'marketing', name: 'Marketing', icon: '📈', color: 'gradient-bg-5' },
    { id: 'chatbots', name: 'Chatbots', icon: '🤖', color: 'gradient-bg' },
    { id: 'automation', name: 'Automation', icon: '🔄', color: 'gradient-bg-2' },
    { id: 'analytics', name: 'Analytics', icon: '📊', color: 'gradient-bg-3' }
  ]

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  const handleSearch = () => {
    if (onSearch) {
      onSearch(searchQuery)
    }
  }

  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId)
    if (onCategoryFilter) {
      onCategoryFilter(categoryId)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 grid-pattern opacity-20"></div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 gradient-bg rounded-full blur-xl floating-element opacity-60"></div>
      <div className="absolute top-40 right-20 w-32 h-32 gradient-bg-2 rounded-full blur-xl floating-element opacity-40" style={{ animationDelay: '2s' }}></div>
      <div className="absolute bottom-20 left-20 w-24 h-24 gradient-bg-3 rounded-full blur-xl floating-element opacity-50" style={{ animationDelay: '4s' }}></div>
      <div className="absolute top-60 right-40 w-16 h-16 gradient-bg-4 morphing-blob blur-xl floating-element opacity-60" style={{ animationDelay: '1s' }}></div>
      
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-6xl mx-auto text-center">
          {/* Logo and Brand */}
          <div className={`inline-flex items-center bg-white/10 backdrop-blur-lg rounded-full px-6 py-3 mb-8 border border-white/20 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 rounded-full flex items-center justify-center mr-3">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-bold text-lg">HappyTools</span>
            <div className="ml-3 bg-gradient-to-r from-green-400 to-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
              AI Discovery
            </div>
          </div>
          
          {/* Main Heading */}
          <h1 className={`text-responsive-xl font-bold text-white mb-8 leading-tight transition-all duration-1000 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            Discover Amazing{' '}
            <span className="bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 bg-clip-text text-transparent neon-text">
              AI Tools
            </span>{' '}
            That Make You{' '}
            <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
              Happy
            </span>
          </h1>
          
          {/* Subheading */}
          <p className={`text-responsive-md text-gray-300 mb-12 max-w-3xl mx-auto transition-all duration-1000 delay-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            Your daily dose of happiness-inducing AI tools, curated from the best sources. 
            Find tools that spark joy and boost your creativity, productivity, and success.
          </p>
          
          {/* Search Bar */}
          <div className={`max-w-2xl mx-auto mb-12 transition-all duration-1000 delay-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="relative">
              <div className="glass-card rounded-2xl p-2 border border-white/20">
                <div className="flex items-center">
                  <div className="absolute left-6 top-1/2 transform -translate-y-1/2 z-10">
                    <Search className="w-5 h-5 text-gray-300" />
                  </div>
                  <Input
                    type="text"
                    placeholder="Search for happiness-inducing AI tools..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="pl-12 pr-4 py-4 w-full bg-transparent border-0 text-white placeholder-gray-300 text-lg focus:ring-0"
                  />
                  <Button 
                    onClick={handleSearch}
                    className="bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 hover:from-yellow-500 hover:to-pink-600 text-white rounded-xl px-8 py-4 font-semibold transition-all duration-300 transform hover:scale-105 pulse-glow"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Category Filter */}
          <div className={`mb-16 transition-all duration-1000 delay-900 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="flex flex-wrap justify-center gap-3">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category.id)}
                  className={`category-chip px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center space-x-2 ${
                    selectedCategory === category.id 
                      ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg' 
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  <span className="text-lg">{category.icon}</span>
                  <span>{category.name}</span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Stats */}
          <div className={`grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl mx-auto transition-all duration-1000 delay-1100 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="glass-card rounded-2xl p-6 text-center card-3d">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mb-4">
                <Star className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">1000+</h3>
              <p className="text-gray-300">Happy Tools</p>
            </div>
            <div className="glass-card rounded-2xl p-6 text-center card-3d">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-full mb-4">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Daily</h3>
              <p className="text-gray-300">Fresh Updates</p>
            </div>
            <div className="glass-card rounded-2xl p-6 text-center card-3d">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">50K+</h3>
              <p className="text-gray-300">Happy Users</p>
            </div>
            <div className="glass-card rounded-2xl p-6 text-center card-3d">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full mb-4">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">AI</h3>
              <p className="text-gray-300">Curated</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}