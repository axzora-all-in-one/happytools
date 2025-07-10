'use client'

import { useState } from 'react'
import HeroSection from '@/components/HeroSection'
import AIToolsGrid from '@/components/AIToolsGrid'

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (query) => {
    setSearchQuery(query)
  }

  return (
    <div className="min-h-screen bg-white">
      <HeroSection onSearch={handleSearch} />
      <AIToolsGrid searchQuery={searchQuery} />
    </div>
  )
}