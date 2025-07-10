'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ExternalLink, ThumbsUp, Calendar, Users, Loader2, Heart, Star, Sparkles, Filter, Grid3X3, List } from 'lucide-react'

export default function ModernToolsGrid({ searchQuery = '', categoryFilter = 'all' }) {
  const [tools, setTools] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [pagination, setPagination] = useState({ page: 1, hasMore: true })
  const [error, setError] = useState(null)
  const [viewMode, setViewMode] = useState('grid')
  const [sortBy, setSortBy] = useState('featured_at')

  // Load tools from API
  const loadTools = async (page = 1, search = '', category = 'all', append = false) => {
    const loadingState = page === 1 ? setLoading : setLoadingMore
    loadingState(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
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
      // Sync Product Hunt
      const phResponse = await fetch('/api/ai-tools/sync', {
        method: 'POST'
      })
      
      // Sync AITools.fyi
      const aitoolsResponse = await fetch('/api/ai-tools/sync-aitools', {
        method: 'POST'
      })
      
      if (phResponse.ok || aitoolsResponse.ok) {
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

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Get category color
  const getCategoryColor = (category) => {
    const colors = {
      'Content Creation': 'bg-gradient-to-r from-purple-500 to-pink-500',
      'Image Generation': 'bg-gradient-to-r from-blue-500 to-teal-500',
      'Productivity': 'bg-gradient-to-r from-green-500 to-yellow-500',
      'Marketing': 'bg-gradient-to-r from-orange-500 to-red-500',
      'Chatbots': 'bg-gradient-to-r from-indigo-500 to-purple-500',
      'Automation': 'bg-gradient-to-r from-cyan-500 to-blue-500',
      'Analytics': 'bg-gradient-to-r from-pink-500 to-rose-500',
      'General': 'bg-gradient-to-r from-gray-500 to-gray-600'
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
            {/* View Mode Toggle */}
            <div className="flex items-center bg-white/10 backdrop-blur-lg rounded-full p-1 border border-white/20">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-full transition-all ${viewMode === 'grid' ? 'bg-white/20' : 'hover:bg-white/10'}`}
              >
                <Grid3X3 className="w-4 h-4 text-white" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-full transition-all ${viewMode === 'list' ? 'bg-white/20' : 'hover:bg-white/10'}`}
              >
                <List className="w-4 h-4 text-white" />
              </button>
            </div>
            
            {/* Sort Options */}
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-full px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/30"
            >
              <option value="featured_at" className="bg-gray-800 text-white">Latest</option>
              <option value="votes" className="bg-gray-800 text-white">Most Popular</option>
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

        {/* Tools Grid */}
        <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'space-y-4'} gap-6`}>
          {tools.map((tool, index) => (
            <Card 
              key={tool.id} 
              className={`glass-card border-white/20 bg-white/5 backdrop-blur-lg text-white card-3d transition-all duration-300 hover:bg-white/10 ${
                viewMode === 'list' ? 'flex flex-row items-center p-4' : 'flex flex-col h-full'
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {viewMode === 'grid' ? (
                <>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-semibold text-white leading-tight mb-2">
                          {tool.name}
                        </CardTitle>
                        <CardDescription className="text-gray-300 text-sm">
                          {tool.tagline}
                        </CardDescription>
                      </div>
                      <Badge className={`${getCategoryColor(tool.category)} text-white border-0 ml-2`}>
                        {tool.category}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="flex-1 pt-0">
                    <p className="text-sm text-gray-300 line-clamp-3 mb-4">
                      {tool.description}
                    </p>
                    
                    <div className="flex items-center text-xs text-gray-400 space-x-4 mb-3">
                      <div className="flex items-center">
                        <ThumbsUp className="w-3 h-3 mr-1" />
                        <span>{tool.votes}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        <span>{formatDate(tool.featured_at)}</span>
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-400 mb-3">
                      <Badge variant="outline" className="border-white/20 text-gray-300">
                        {tool.source}
                      </Badge>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="pt-3">
                    <div className="flex gap-2 w-full">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 border-gray-500 text-gray-800 bg-gray-100 hover:bg-gray-200 hover:text-gray-900"
                        onClick={() => window.open(tool.url, '_blank')}
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        View
                      </Button>
                      {tool.website && (
                        <Button 
                          size="sm" 
                          className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white"
                          onClick={() => window.open(tool.website, '_blank')}
                        >
                          <Heart className="w-3 h-3 mr-1" />
                          Try
                        </Button>
                      )}
                    </div>
                  </CardFooter>
                </>
              ) : (
                <div className="flex items-center justify-between w-full">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-semibold text-white">{tool.name}</h3>
                      <Badge className={`${getCategoryColor(tool.category)} text-white border-0`}>
                        {tool.category}
                      </Badge>
                    </div>
                    <p className="text-gray-300 text-sm mt-1">{tool.tagline}</p>
                    <div className="flex items-center text-xs text-gray-400 space-x-4 mt-2">
                      <div className="flex items-center">
                        <ThumbsUp className="w-3 h-3 mr-1" />
                        <span>{tool.votes}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        <span>{formatDate(tool.featured_at)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="border-gray-500 text-gray-800 bg-gray-100 hover:bg-gray-200 hover:text-gray-900"
                      onClick={() => window.open(tool.url, '_blank')}
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      View
                    </Button>
                    {tool.website && (
                      <Button 
                        size="sm"
                        className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white"
                        onClick={() => window.open(tool.website, '_blank')}
                      >
                        <Heart className="w-3 h-3 mr-1" />
                        Try
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </Card>
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
                  Load More Happy Tools
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}