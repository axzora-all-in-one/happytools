'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ExternalLink, Loader2, Heart, Sparkles, TrendingUp } from 'lucide-react'

export default function SimplifiedToolsGrid({ searchQuery = '', categoryFilter = 'all' }) {
  const [tools, setTools] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [pagination, setPagination] = useState({ page: 1, hasMore: true })
  const [error, setError] = useState(null)
  const [sortBy, setSortBy] = useState('featured_at')

  // Load tools from API
  const loadTools = async (page = 1, search = '', category = 'all', append = false) => {
    const loadingState = page === 1 ? setLoading : setLoadingMore
    loadingState(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '24', // Increased limit for simplified view
        sort: sortBy
      })
      
      if (search) {
        params.set('search', search)
      }
      
      if (category && category !== 'all') {
        params.set('category', category)
      }

      const response = await fetch(`/api/ai-tools?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch tools')
      }

      const data = await response.json()
      
      if (append) {
        setTools(prev => [...prev, ...data.tools])
      } else {
        setTools(data.tools)
      }
      
      setPagination(data.pagination)
    } catch (err) {
      setError(err.message)
      console.error('Error loading tools:', err)
    } finally {
      loadingState(false)
    }
  }

  // Load more tools
  const handleLoadMore = () => {
    if (!loadingMore && pagination.hasMore) {
      loadTools(pagination.page + 1, searchQuery, categoryFilter, true)
    }
  }

  // Sync with scrapers
  const syncTools = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/ai-tools/sync-aitools', {
        method: 'POST'
      })
      
      if (response.ok) {
        console.log('Sync successful')
        loadTools(1, searchQuery, categoryFilter, false)
      }
    } catch (err) {
      console.error('Sync error:', err)
    }
  }

  // Initial load and updates
  useEffect(() => {
    loadTools(1, searchQuery, categoryFilter, false)
  }, [searchQuery, categoryFilter, sortBy])

  // Get category color
  const getCategoryColor = (category) => {
    const colors = {
      'Content Creation': 'bg-purple-500',
      'Image Generation': 'bg-blue-500',
      'Productivity': 'bg-green-500',
      'Marketing': 'bg-orange-500',
      'Chatbots': 'bg-indigo-500',
      'Automation': 'bg-cyan-500',
      'Analytics': 'bg-pink-500',
      'General': 'bg-gray-500'
    }
    return colors[category] || colors['General']
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="loading-dots mb-4">
                <div></div>
                <div></div>
                <div></div>
                <div></div>
              </div>
              <p className="text-gray-300 text-lg">Loading amazing AI tools...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center py-20">
            <div className="glass-card rounded-2xl p-8 max-w-md mx-auto">
              <h3 className="text-xl font-bold text-white mb-4">Oops! Something went wrong</h3>
              <p className="text-gray-300 mb-6">{error}</p>
              <div className="space-y-3">
                <Button 
                  onClick={() => loadTools(1, searchQuery, categoryFilter, false)} 
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                >
                  Try Again
                </Button>
                <Button 
                  onClick={syncTools} 
                  className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600"
                >
                  Sync New Tools
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Empty state
  if (tools.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center py-20">
            <div className="glass-card rounded-2xl p-8 max-w-md mx-auto">
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">
                {searchQuery || categoryFilter !== 'all' ? 'No tools found' : 'Let\'s discover some tools!'}
              </h3>
              <p className="text-gray-300 mb-6">
                {searchQuery || categoryFilter !== 'all' ? 
                  'Try a different search or category.' :
                  'Let\'s sync with our sources to find amazing AI tools for you!'
                }
              </p>
              <Button 
                onClick={syncTools} 
                className="bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 hover:from-yellow-500 hover:to-pink-600 text-white font-semibold px-8 py-3 rounded-full"
              >
                <Heart className="w-4 h-4 mr-2" />
                Discover Tools
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-12">
          <div className="mb-6 md:mb-0">
            <h2 className="text-3xl font-bold text-white mb-2">
              {searchQuery ? `Search Results for "${searchQuery}"` : 
               categoryFilter !== 'all' ? `${categoryFilter} Tools` : 'Amazing AI Tools'}
            </h2>
            <p className="text-gray-300">
              {pagination.total || tools.length} tools found • Updated daily with love ❤️
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Sort Options */}
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-full px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/30"
            >
              <option value="featured_at" className="bg-gray-800 text-white">Latest</option>
              <option value="votes" className="bg-gray-800 text-white">Popular</option>
              <option value="name" className="bg-gray-800 text-white">Name</option>
            </select>
            
            <Button 
              onClick={syncTools}
              className="bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white rounded-full px-6 py-2 hidden md:inline-flex"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Sync Latest
            </Button>
          </div>
        </div>

        {/* Simplified Tools Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {tools.map((tool, index) => (
            <div 
              key={tool.id} 
              className="glass-card border-white/20 bg-white/5 backdrop-blur-lg text-white transition-all duration-300 hover:bg-white/10 rounded-lg p-4"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Tool Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white leading-tight mb-1">
                    {tool.name}
                  </h3>
                  <p className="text-gray-300 text-sm line-clamp-2">
                    {tool.tagline}
                  </p>
                </div>
                <Badge className={`${getCategoryColor(tool.category)} text-white border-0 ml-2 text-xs`}>
                  {tool.category}
                </Badge>
              </div>

              {/* Tool Stats */}
              <div className="flex items-center text-xs text-gray-400 space-x-3 mb-4">
                <div className="flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  <span>{tool.votes}</span>
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-1"></span>
                  <span>{tool.source}</span>
                </div>
              </div>

              {/* Action Button */}
              <Button 
                onClick={() => window.open(tool.url, '_blank')}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg py-2 text-sm"
              >
                <ExternalLink className="w-3 h-3 mr-2" />
                View Tool
              </Button>
            </div>
          ))}
        </div>

        {/* Load More Button */}
        {pagination.hasMore && (
          <div className="flex justify-center mt-16">
            <Button 
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 hover:from-yellow-500 hover:to-pink-600 text-white px-8 py-3 rounded-full text-lg font-semibold min-w-[200px] pulse-glow"
            >
              {loadingMore ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading More...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Load More Tools
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}