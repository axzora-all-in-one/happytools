'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ExternalLink, ThumbsUp, Calendar, Users, Loader2 } from 'lucide-react'

export default function AIToolsGrid({ searchQuery = '', onLoadMoreClick }) {
  const [tools, setTools] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [pagination, setPagination] = useState({ page: 1, hasMore: true })
  const [error, setError] = useState(null)

  // Load tools from API
  const loadTools = async (page = 1, search = '', append = false) => {
    const loadingState = page === 1 ? setLoading : setLoadingMore
    loadingState(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12'
      })
      
      if (search) {
        params.set('search', search)
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
      loadTools(pagination.page + 1, searchQuery, true)
    }
  }

  // Initial load and search updates
  useEffect(() => {
    loadTools(1, searchQuery, false)
  }, [searchQuery])

  // Sync data with Product Hunt
  const syncWithProductHunt = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/ai-tools/sync', {
        method: 'POST'
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('Sync successful:', data)
        // Reload tools after sync
        loadTools(1, searchQuery, false)
      }
    } catch (err) {
      console.error('Sync error:', err)
    }
  }

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading AI tools...</span>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Tools</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <div className="space-y-2">
              <Button onClick={() => loadTools(1, searchQuery, false)} variant="outline">
                Try Again
              </Button>
              <Button onClick={syncWithProductHunt} variant="default">
                Sync with Product Hunt
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Empty state
  if (tools.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 max-w-md mx-auto">
            <h3 className="text-lg font-medium text-gray-800 mb-2">No AI Tools Found</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery ? 
                `No tools found matching "${searchQuery}". Try a different search term.` :
                'No AI tools available yet. Let\'s sync with Product Hunt to get started!'
              }
            </p>
            <Button onClick={syncWithProductHunt} className="bg-blue-600 hover:bg-blue-700">
              Sync with Product Hunt
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            {searchQuery ? `Search Results for "${searchQuery}"` : 'Latest AI Tools'}
          </h2>
          <p className="text-gray-600 mt-1">
            {pagination.total} tools found • Updated daily from Product Hunt
          </p>
        </div>
        <Button 
          onClick={syncWithProductHunt}
          variant="outline"
          className="hidden md:inline-flex"
        >
          Sync Latest
        </Button>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {tools.map((tool) => (
          <Card key={tool.id} className="h-full flex flex-col hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg font-semibold text-gray-900 leading-tight">
                    {tool.name}
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-600 mt-1">
                    {tool.tagline}
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-800">
                  {tool.source}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="flex-1 pt-0">
              <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                {tool.description}
              </p>
              
              {/* Stats */}
              <div className="flex items-center text-xs text-gray-500 space-x-4 mb-3">
                <div className="flex items-center">
                  <ThumbsUp className="w-3 h-3 mr-1" />
                  <span>{tool.votes}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="w-3 h-3 mr-1" />
                  <span>{formatDate(tool.featured_at)}</span>
                </div>
              </div>
              
              {/* Makers */}
              {tool.makers && tool.makers.length > 0 && (
                <div className="mb-3">
                  <div className="flex items-center text-xs text-gray-500 mb-1">
                    <Users className="w-3 h-3 mr-1" />
                    <span>Made by</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {tool.makers.slice(0, 3).map((maker) => (
                      <div key={maker.id} className="flex items-center bg-gray-100 rounded-full px-2 py-1">
                        {maker.profileImage && (
                          <img 
                            src={maker.profileImage} 
                            alt={maker.name} 
                            className="w-4 h-4 rounded-full mr-1"
                          />
                        )}
                        <span className="text-xs text-gray-700">{maker.name}</span>
                      </div>
                    ))}
                    {tool.makers.length > 3 && (
                      <div className="flex items-center bg-gray-100 rounded-full px-2 py-1">
                        <span className="text-xs text-gray-700">+{tool.makers.length - 3} more</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Topics */}
              {tool.topics && tool.topics.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {tool.topics.slice(0, 3).map((topic) => (
                    <Badge key={topic} variant="outline" className="text-xs">
                      {topic}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
            
            <CardFooter className="pt-3">
              <div className="flex gap-2 w-full">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => window.open(tool.url, '_blank')}
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  View on PH
                </Button>
                {tool.website && (
                  <Button 
                    size="sm" 
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    onClick={() => window.open(tool.website, '_blank')}
                  >
                    Visit Site
                  </Button>
                )}
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Load More Button */}
      {pagination.hasMore && (
        <div className="flex justify-center mt-12">
          <Button 
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="min-w-[200px] bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {loadingMore ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading More...
              </>
            ) : (
              'Load More Tools'
            )}
          </Button>
        </div>
      )}
    </div>
  )
}