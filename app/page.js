'use client'

import { useState } from 'react'
import ModernHeroSection from '@/components/ModernHeroSection'
import SimplifiedToolsGrid from '@/components/SimplifiedToolsGrid'

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')

  const handleSearch = (query) => {
    setSearchQuery(query)
  }

  const handleCategoryFilter = (category) => {
    setCategoryFilter(category)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <ModernHeroSection 
        onSearch={handleSearch} 
        onCategoryFilter={handleCategoryFilter}
      />
      <SimplifiedToolsGrid 
        searchQuery={searchQuery} 
        categoryFilter={categoryFilter}
      />
    </div>
  )
}