import { MongoClient } from 'mongodb'
import { v4 as uuidv4 } from 'uuid'
import { NextResponse } from 'next/server'
import * as cheerio from 'cheerio'
import { getClient } from '@/lib/apollo-client'
import { GET_AI_TOOLS, SEARCH_AI_TOOLS, isAITool } from '@/lib/producthunt'
import TargetedAiToolsScraper from '@/lib/scrapers/targeted-aitools-scraper'

// Cricbuzz scraping functions with real-time data
async function scrapeCricbuzzLiveMatches() {
  try {
    console.log('Fetching REAL LIVE cricket data...')
    
    let scrapedMatches = []
    
    // Try to scrape from Cricbuzz
    try {
      const response = await fetch('https://www.cricbuzz.com/', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        timeout: 5000
      })
    
    if (!response.ok) {
      console.error('Failed to fetch Cricbuzz:', response.status, response.statusText)
      throw new Error(`HTTP ${response.status}`)
    }
    
    const html = await response.text()
    console.log('Successfully fetched Cricbuzz HTML, length:', html.length)
    
    const $ = cheerio.load(html)
    const matches = []
    
    // Look for actual match data in script tags or data attributes
    const scriptTags = $('script').get()
    let matchData = null
    
    // Try to find JSON data in script tags
    for (const script of scriptTags) {
      const scriptContent = $(script).html()
      if (scriptContent && scriptContent.includes('matches') && scriptContent.includes('teams')) {
        try {
          // Extract JSON data if present
          const jsonMatch = scriptContent.match(/window\.__INITIAL_STATE__\s*=\s*({.*?});/)
          if (jsonMatch) {
            matchData = JSON.parse(jsonMatch[1])
            console.log('Found match data in script tag')
            break
          }
        } catch (e) {
          // Continue to next script
        }
      }
    }
    
    // Look for live cricket patterns in the text
    const cricketPatterns = [
      // Pattern for team codes
      /([A-Z]{3,4})\s+vs\s+([A-Z]{3,4}).*?(\d+\/\d+|\d+-\d+)/g,
      // Pattern for full country names  
      /(India|England|Australia|Pakistan|Bangladesh|Sri Lanka|South Africa|New Zealand|West Indies|Zimbabwe|Afghanistan|Ireland)\s+vs\s+(India|England|Australia|Pakistan|Bangladesh|Sri Lanka|South Africa|New Zealand|West Indies|Zimbabwe|Afghanistan|Ireland)/gi,
      // Pattern for match status
      /(live|complete|stumps|innings break)/gi
    ]
    
    for (const pattern of cricketPatterns) {
      const matches = [...bodyText.matchAll(pattern)]
      for (const match of matches) {
        if (scrapedMatches.length >= 5) break
        
        let team1 = match[1]?.trim()
        let team2 = match[2]?.trim()
        
        if (team1 && team2 && team1 !== team2) {
          const status = bodyText.toLowerCase().includes('live') ? 'live' : 
                       bodyText.toLowerCase().includes('complete') ? 'completed' : 'upcoming'
          
          scrapedMatches.push({
            id: uuidv4(),
            status: status,
            series: 'Current Cricket Match',
            matchType: 'International',
            format: 'Cricket',
            venue: 'Cricket Ground',
            team1: {
              name: expandTeamName(team1),
              code: team1.length <= 4 ? team1.toUpperCase() : team1.substring(0, 3).toUpperCase(),
              score: match[3] || 'TBC',
              overs: '0'
            },
            team2: {
              name: expandTeamName(team2),
              code: team2.length <= 4 ? team2.toUpperCase() : team2.substring(0, 3).toUpperCase(),
              score: 'TBC',
              overs: '0'
            },
            commentary: 'Live cricket updates...',
            toss: 'Toss details pending',
            timeAgo: 'Live',
            keyStats: [{ label: 'Status', value: status }]
          })
          
          console.log(`✅ Scraped: ${team1} vs ${team2} (${status})`)
        }
      }
    }
    
    // Method 2: If no matches found, try to extract from text content and look for any cricket data
    if (matches.length === 0) {
      console.log('No matches found with selectors, trying text extraction...')
      
      const fullText = $('body').text()
      console.log('Full page text length:', fullText.length)
      
      // Look for any cricket-related content
      const lines = fullText.split('\n').filter(line => line.trim().length > 10)
      console.log('Total lines to process:', lines.length)
      
      // Look for common cricket patterns
      const patterns = [
        /([A-Z]{3,4})\s+vs\s+([A-Z]{3,4})/g,
        /([A-Za-z\s]+)\s+vs\s+([A-Za-z\s]+).*(?:live|complete|preview)/i,
        /(\d+\/\d+).*vs.*(\d+\/\d+)/g,
        /(England|India|Australia|Pakistan|Bangladesh|Sri Lanka|South Africa|New Zealand|West Indies|Zimbabwe|Afghanistan|Ireland).*vs.*(England|India|Australia|Pakistan|Bangladesh|Sri Lanka|South Africa|New Zealand|West Indies|Zimbabwe|Afghanistan|Ireland)/i
      ]
      
      let foundMatches = 0
      
      for (const line of lines) {
        if (matches.length >= 10) break
        
        for (const pattern of patterns) {
          const lineMatches = [...line.matchAll(pattern)]
          
          for (const match of lineMatches) {
            if (matches.length >= 10) break
            
            let team1, team2
            
            if (pattern.source.includes('A-Z]{3,4')) {
              // Short team codes pattern
              team1 = match[1]
              team2 = match[2]
            } else if (pattern.source.includes('England|India')) {
              // Full team names pattern
              team1 = match[1]
              team2 = match[2]
            } else {
              continue
            }
            
            // Validate teams
            if (!team1 || !team2 || team1.length < 2 || team2.length < 2 ||
                team1.toLowerCase().includes('news') ||
                team2.toLowerCase().includes('news') ||
                team1.toLowerCase().includes('video') ||
                team2.toLowerCase().includes('video') ||
                team1.toLowerCase().includes('app') ||
                team2.toLowerCase().includes('app')) {
              continue
            }
            
            // Skip duplicate teams
            const isDuplicate = matches.some(m => 
              (m.team1.name === expandTeamName(team1) && m.team2.name === expandTeamName(team2)) ||
              (m.team2.name === expandTeamName(team1) && m.team1.name === expandTeamName(team2))
            )
            
            if (isDuplicate) continue
            
            let status = 'upcoming'
            if (line.toLowerCase().includes('live') || line.toLowerCase().includes('batting')) {
              status = 'live'
            } else if (line.toLowerCase().includes('complete') || line.toLowerCase().includes('won')) {
              status = 'completed'
            } else if (line.toLowerCase().includes('stumps')) {
              status = 'live'
            }
            
            // Extract scores if present
            const scorePattern = /(\d+\/\d+|\d+\-\d+)/g
            const scores = line.match(scorePattern) || []
            
            const cricketMatch = {
              id: uuidv4(),
              status: status,
              series: extractSeriesFromLine(line) || 'Current Cricket Match',
              matchType: 'International',
              format: getFormatFromText(line),
              venue: extractVenueFromLine(line) || 'Cricket Ground',
              team1: {
                name: expandTeamName(team1),
                code: team1.length <= 4 ? team1.toUpperCase() : team1.substring(0, 3).toUpperCase(),
                score: scores[0] || 'TBC',
                overs: extractOversFromScore(scores[0]) || '0'
              },
              team2: {
                name: expandTeamName(team2),
                code: team2.length <= 4 ? team2.toUpperCase() : team2.substring(0, 3).toUpperCase(),
                score: scores[1] || 'TBC',
                overs: extractOversFromScore(scores[1]) || '0'
              },
              commentary: extractCommentaryFromLine(line) || 'Cricket match updates coming soon...',
              toss: 'Toss details available soon',
              timeAgo: status === 'live' ? 'Live' : 'Recently',
              keyStats: [{ label: 'Status', value: status.charAt(0).toUpperCase() + status.slice(1) }]
            }
            
            matches.push(cricketMatch)
            foundMatches++
            console.log(`✅ Pattern match found: ${team1} vs ${team2} - ${status} (Pattern: ${pattern.source.substring(0, 30)}...)`)
          }
        }
      }
      
      console.log(`✅ Found ${foundMatches} cricket matches from text patterns`)
    }

// Additional helper functions for line-based extraction
function extractSeriesFromLine(line) {
  const seriesPatterns = [
    /(T20\s*World\s*Cup[^,\n]*)/i,
    /(World\s*Cup[^,\n]*)/i,
    /(Test\s*Series[^,\n]*)/i,
    /(ODI\s*Series[^,\n]*)/i,
    /(T20I?\s*Series[^,\n]*)/i,
    /(Major\s*League[^,\n]*)/i,
    /([A-Za-z\s]+\s*tour\s*of\s*[A-Za-z\s]+)/i,
    /(India\s*vs\s*England[^,\n]*)/i,
    /(Australia\s*vs\s*West\s*Indies[^,\n]*)/i
  ]
  
  for (const pattern of seriesPatterns) {
    const match = line.match(pattern)
    if (match) return match[1].trim()
  }
  return null
}

function extractVenueFromLine(line) {
  const venuePatterns = [
    /(Lord's[^,\n]*)/i,
    /(MCG|SCG|Wankhede|Eden\s*Gardens|The\s*Oval|Old\s*Trafford)/i,
    /([A-Za-z\s]+(?:Ground|Stadium|Oval|Park)[^,\n]*)/i
  ]
  
  for (const pattern of venuePatterns) {
    const match = line.match(pattern)
    if (match) return match[1].trim()
  }
  return null
}

function extractCommentaryFromLine(line) {
  const commentaryPatterns = [
    /(.*won\s+by\s+\d+\s+(?:runs?|wickets?)[^,\n]*)/i,
    /(.*need\s+\d+\s+runs?[^,\n]*)/i,
    /(Day\s+\d+[^,\n]*)/i,
    /(Stumps[^,\n]*)/i,
    /(Live[^,\n]*)/i
  ]
  
  for (const pattern of commentaryPatterns) {
    const match = line.match(pattern)
    if (match) return match[1].trim()
  }
  return null
}
    
    console.log(`✅ Total REAL matches scraped: ${matches.length}`)
    
    // Return real scraped data or empty array (no mock fallback)
    return matches.length > 0 ? matches : []
    
  } catch (error) {
    console.error('Error scraping REAL live matches:', error)
    return [] // Return empty array instead of mock data
  }
}

// Helper functions for better parsing
function getMatchTypeFromText(text) {
  if (text.toLowerCase().includes('international')) return 'International'
  if (text.toLowerCase().includes('domestic')) return 'Domestic'
  if (text.toLowerCase().includes('ipl')) return 'IPL'
  if (text.toLowerCase().includes('bbl')) return 'BBL'
  return 'Cricket'
}

function getFormatFromText(text) {
  if (text.toLowerCase().includes('test')) return 'Test'
  if (text.toLowerCase().includes('odi')) return 'ODI'  
  if (text.toLowerCase().includes('t20')) return 'T20'
  return 'Cricket'
}

function extractOversFromScore(score) {
  if (!score) return '0'
  const overMatch = score.match(/\(([^)]+)\)/)
  return overMatch ? overMatch[1] : '0'
}

function generateKeyStatsFromText(text, status) {
  const stats = []
  
  if (status === 'live') {
    stats.push({ label: 'Status', value: 'Live' })
    
    const runRateMatch = text.match(/(\d+\.?\d*)\s*rpo/i)
    if (runRateMatch) {
      stats.push({ label: 'Run Rate', value: runRateMatch[1] })
    }
    
    const requiredMatch = text.match(/need\s+(\d+)\s+runs?/i)
    if (requiredMatch) {
      stats.push({ label: 'Required', value: `${requiredMatch[1]} runs` })
    }
  } else {
    stats.push({ label: 'Format', value: getFormatFromText(text) })
  }
  
  return stats
}

// Helper functions for better data extraction
function getMatchStatusType(status) {
  if (!status) return 'upcoming'
  const statusLower = status.toLowerCase()
  if (statusLower.includes('live') || statusLower.includes('inprogress')) return 'live'
  if (statusLower.includes('complete') || statusLower.includes('won')) return 'completed'
  if (statusLower.includes('stumps') || statusLower.includes('innings')) return 'live'
  if (statusLower.includes('preview') || statusLower.includes('upcoming')) return 'upcoming'
  return 'live'
}

function getMatchType(text) {
  if (text.toLowerCase().includes('international') || text.toLowerCase().includes('india') || text.toLowerCase().includes('england')) return 'International'
  if (text.toLowerCase().includes('ipl')) return 'IPL'
  if (text.toLowerCase().includes('domestic')) return 'Domestic'
  return 'Cricket'
}

function getMatchFormat(text) {
  if (text.toLowerCase().includes('test')) return 'Test'
  if (text.toLowerCase().includes('odi')) return 'ODI'
  if (text.toLowerCase().includes('t20') || text.toLowerCase().includes('t-20')) return 'T20'
  return 'Cricket'
}

function extractSeriesFromText(text) {
  // Look for series patterns
  const seriesPatterns = [
    /([A-Za-z\s]+(?:Cup|Series|Trophy|League|Championship|Tour)[^,\n]*)/i,
    /([A-Za-z\s]+\d{4}[^,\n]*)/,
    /(Major League Cricket[^,\n]*)/i,
    /(India tour of[^,\n]*)/i,
    /(England.*tour[^,\n]*)/i
  ]
  
  for (const pattern of seriesPatterns) {
    const match = text.match(pattern)
    if (match) return match[1].trim()
  }
  return null
}

function extractVenue(text) {
  // Look for common venue patterns
  const venuePatterns = [
    /([A-Za-z\s]+(?:Ground|Stadium|Oval|Park)[^,\n]*)/i,
    /(Lord's[^,\n]*)/i,
    /(MCG|SCG|Wankhede|Eden Gardens)/i
  ]
  
  for (const pattern of venuePatterns) {
    const match = text.match(pattern)
    if (match) return match[1].trim()
  }
  return null
}

function extractCommentary(text) {
  // Look for commentary patterns
  const commentaryPatterns = [
    /(.*(?:need|needs|run|runs|ball|balls|over|overs)[^,\n]*)/i,
    /(.*(?:won by|lost by)[^,\n]*)/i,
    /(Day \d+[^,\n]*)/i
  ]
  
  for (const pattern of commentaryPatterns) {
    const match = text.match(pattern)
    if (match) return match[1].trim()
  }
  return null
}

function extractResult(text, team1, team2, status) {
  if (status && status.toLowerCase().includes('complete')) {
    const resultPatterns = [
      new RegExp(`${team1}\\s+won\\s+by[^,\\n]*`, 'i'),
      new RegExp(`${team2}\\s+won\\s+by[^,\\n]*`, 'i'),
      /(.*won by[^,\n]*)/i
    ]
    
    for (const pattern of resultPatterns) {
      const match = text.match(pattern)
      if (match) return match[1] || match[0]
    }
  }
  return null
}

function generateKeyStats(score1, score2, status) {
  const stats = []
  
  // Extract run rate if possible
  const runRateMatch1 = score1?.match(/\((\d+(?:\.\d+)?)\)/)
  const runRateMatch2 = score2?.match(/\((\d+(?:\.\d+)?)\)/)
  
  if (runRateMatch1) {
    stats.push({ label: 'Run Rate', value: (parseFloat(runRateMatch1[1]) / 6).toFixed(1) })
  }
  
  if (status === 'Live' || status === 'live') {
    stats.push({ label: 'Status', value: 'Live' })
  }
  
  return stats.length > 0 ? stats : [
    { label: 'Format', value: 'Cricket' },
    { label: 'Status', value: status || 'In Progress' }
  ]
}

async function scrapeCricbuzzRecentMatches() {
  try {
    console.log('Scraping REAL Cricbuzz recent matches...')
    
    // Try multiple URLs for recent matches
    const urls = [
      'https://www.cricbuzz.com/cricket-schedule/recent-matches',
      'https://www.cricbuzz.com/'
    ]
    
    for (const url of urls) {
      console.log(`Fetching: ${url}`)
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Cache-Control': 'no-cache'
        }
      })
      
      if (!response.ok) {
        console.log(`Failed to fetch ${url}:`, response.status)
        continue
      }
      
      const html = await response.text()
      const $ = cheerio.load(html)
      const matches = []
      
      // Look for completed matches
      const completedSelectors = [
        '.cb-mtch-lst-itm',
        '.cb-schdl .cb-col-100',
        '.cb-srs-mtchs .cb-col-100'
      ]
      
      for (const selector of completedSelectors) {
        $(selector).each((index, element) => {
          if (matches.length >= 6) return false
          
          const $elem = $(element)
          const elemText = $elem.text()
          
          // Look for "Complete" or "won by" in the text
          if (elemText.toLowerCase().includes('complete') || 
              elemText.toLowerCase().includes('won by') ||
              elemText.toLowerCase().includes('result')) {
            
            // Extract team vs team
            const vsPattern = /([A-Z]{2,4})\s+vs\s+([A-Z]{2,4})|([A-Za-z\s]+)\s+vs\s+([A-Za-z\s]+)/i
            const vsMatch = elemText.match(vsPattern)
            
            if (vsMatch) {
              const team1 = (vsMatch[1] || vsMatch[3])?.trim()
              const team2 = (vsMatch[2] || vsMatch[4])?.trim()
              
              if (team1 && team2 && team1.length > 1 && team2.length > 1) {
                // Extract result
                const resultPattern = /(.*won\s+by\s+\d+\s+(?:runs?|wickets?)[^,\n]*)/i
                const resultMatch = elemText.match(resultPattern)
                
                // Extract scores
                const scorePattern = /(\d+\/\d+\s*\(\d+\)|\d+\/\d+)/g
                const scores = elemText.match(scorePattern) || []
                
                // Extract series info
                let series = 'Recent Match'
                const seriesPatterns = [
                  /(Test\s*Series[^,\n]*)/i,
                  /(T20\s*Series[^,\n]*)/i,
                  /(ODI\s*Series[^,\n]*)/i,
                  /([A-Za-z\s]+\s*vs\s*[A-Za-z\s]+\s*\d{4})/i
                ]
                
                for (const pattern of seriesPatterns) {
                  const seriesMatch = elemText.match(pattern)
                  if (seriesMatch) {
                    series = seriesMatch[1].trim()
                    break
                  }
                }
                
                matches.push({
                  id: uuidv4(),
                  series: series,
                  date: 'Recently',
                  team1: {
                    name: expandTeamName(team1),
                    score: scores[0] || 'N/A'
                  },
                  team2: {
                    name: expandTeamName(team2),
                    score: scores[1] || 'N/A'
                  },
                  result: resultMatch ? resultMatch[1].trim() : `${expandTeamName(team1)} vs ${expandTeamName(team2)} - Complete`
                })
                
                console.log(`✅ Found recent match: ${team1} vs ${team2}`)
              }
            }
          }
        })
        
        if (matches.length > 0) break
      }
      
      if (matches.length > 0) {
        console.log(`✅ Found ${matches.length} recent matches from ${url}`)
        return matches
      }
    }
    
    console.log('No recent matches found in scraping')
    return [] // Return empty array instead of mock data
    
  } catch (error) {
    console.error('Error scraping recent matches:', error)
    return [] // Return empty array instead of mock data
  }
}

async function scrapeCricbuzzUpcomingMatches() {
  try {
    console.log('Scraping REAL Cricbuzz upcoming matches...')
    
    const urls = [
      'https://www.cricbuzz.com/cricket-schedule/upcoming-matches',
      'https://www.cricbuzz.com/'
    ]
    
    for (const url of urls) {
      console.log(`Fetching: ${url}`)
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Cache-Control': 'no-cache'
        }
      })
      
      if (!response.ok) {
        console.log(`Failed to fetch ${url}:`, response.status)
        continue
      }
      
      const html = await response.text()
      const $ = cheerio.load(html)
      const matches = []
      
      // Look for upcoming/preview matches
      const upcomingSelectors = [
        '.cb-mtch-lst-itm',
        '.cb-schdl .cb-col-100',
        '.cb-srs-mtchs .cb-col-100'
      ]
      
      for (const selector of upcomingSelectors) {
        $(selector).each((index, element) => {
          if (matches.length >= 6) return false
          
          const $elem = $(element)
          const elemText = $elem.text()
          
          // Look for "Preview" or upcoming keywords
          if (elemText.toLowerCase().includes('preview') || 
              elemText.toLowerCase().includes('today') ||
              elemText.toLowerCase().includes('tomorrow') ||
              elemText.toLowerCase().includes('upcoming')) {
            
            // Extract team vs team
            const vsPattern = /([A-Z]{2,4})\s+vs\s+([A-Z]{2,4})|([A-Za-z\s]+)\s+vs\s+([A-Za-z\s]+)/i
            const vsMatch = elemText.match(vsPattern)
            
            if (vsMatch) {
              const team1 = (vsMatch[1] || vsMatch[3])?.trim()
              const team2 = (vsMatch[2] || vsMatch[4])?.trim()
              
              if (team1 && team2 && team1.length > 1 && team2.length > 1) {
                // Extract timing
                const timePattern = /(Today|Tomorrow|\d{1,2}:\d{2}|GMT|IST|AM|PM)/i
                const timeMatch = elemText.match(timePattern)
                
                // Extract venue
                let venue = 'Stadium'
                const venuePattern = /([A-Za-z\s]+(?:Ground|Stadium|Oval))/i
                const venueMatch = elemText.match(venuePattern)
                if (venueMatch) venue = venueMatch[1].trim()
                
                // Extract series
                let series = 'Upcoming Match'
                const seriesPatterns = [
                  /(Test[^,\n]*)/i,
                  /(T20[^,\n]*)/i,
                  /(ODI[^,\n]*)/i,
                  /([A-Za-z\s]+\s*vs\s*[A-Za-z\s]+\s*\d{4})/i
                ]
                
                for (const pattern of seriesPatterns) {
                  const seriesMatch = elemText.match(pattern)
                  if (seriesMatch) {
                    series = seriesMatch[1].trim()
                    break
                  }
                }
                
                matches.push({
                  id: uuidv4(),
                  series: series,
                  dateTime: timeMatch ? timeMatch[1] : 'Soon',
                  timeUntil: calculateTimeUntil(timeMatch ? timeMatch[1] : ''),
                  venue: venue,
                  team1: {
                    name: expandTeamName(team1),
                    code: team1.length <= 4 ? team1.toUpperCase() : team1.substring(0, 3).toUpperCase()
                  },
                  team2: {
                    name: expandTeamName(team2),
                    code: team2.length <= 4 ? team2.toUpperCase() : team2.substring(0, 3).toUpperCase()
                  }
                })
                
                console.log(`✅ Found upcoming match: ${team1} vs ${team2}`)
              }
            }
          }
        })
        
        if (matches.length > 0) break
      }
      
      if (matches.length > 0) {
        console.log(`✅ Found ${matches.length} upcoming matches from ${url}`)
        return matches
      }
    }
    
    console.log('No upcoming matches found in scraping')
    return [] // Return empty array instead of mock data
    
  } catch (error) {
    console.error('Error scraping upcoming matches:', error)
    return [] // Return empty array instead of mock data
  }
}

// Helper functions
function expandTeamName(code) {
  const teamMap = {
    'IND': 'India',
    'ENG': 'England', 
    'AUS': 'Australia',
    'WI': 'West Indies',
    'RSA': 'South Africa',
    'ZIM': 'Zimbabwe',
    'MINY': 'MI New York',
    'WAF': 'Washington Freedom',
    'GAW': 'Guyana Amazon Warriors',
    'DCP': 'Delhi Capitals',
    'PAK': 'Pakistan',
    'NZ': 'New Zealand',
    'SL': 'Sri Lanka',
    'BAN': 'Bangladesh'
  }
  return teamMap[code] || code
}

function extractScoreFromText(text, index) {
  const scorePattern = /(\d+(?:\/\d+)?(?:\s*\(\d+(?:\.\d+)?\))?)/g
  const scores = text.match(scorePattern)
  return scores && scores[index] ? scores[index] : null
}

function calculateTimeUntil(timeStr) {
  if (!timeStr) return 'Soon'
  if (timeStr.toLowerCase().includes('today')) return 'Today'
  if (timeStr.toLowerCase().includes('tomorrow')) return 'Tomorrow'
  if (timeStr.toLowerCase().includes('preview')) return 'Soon'
  return 'Soon'
}

async function scrapeCricbuzzPlayerStats() {
  try {
    console.log('Returning player stats...')
    
    const playerStats = [
      {
        id: uuidv4(),
        name: 'Virat Kohli',
        team: 'India',
        role: 'Batsman',
        batting: { average: '52.4', runs: 12169 },
        bowling: { average: 'N/A', wickets: 4 },
        matches: 274,
        ranking: '#3 ODI Batsman'
      },
      {
        id: uuidv4(),
        name: 'Jasprit Bumrah',
        team: 'India', 
        role: 'Bowler',
        batting: { average: '8.2', runs: 89 },
        bowling: { average: '24.3', wickets: 145 },
        matches: 72,
        ranking: '#1 ODI Bowler'
      },
      {
        id: uuidv4(),
        name: 'Kane Williamson',
        team: 'New Zealand',
        role: 'Batsman',
        batting: { average: '47.8', runs: 6471 },
        bowling: { average: '51.2', wickets: 37 },
        matches: 158,
        ranking: '#5 ODI Batsman'
      },
      {
        id: uuidv4(),
        name: 'Pat Cummins',
        team: 'Australia',
        role: 'Bowler', 
        batting: { average: '15.6', runs: 789 },
        bowling: { average: '25.4', wickets: 188 },
        matches: 95,
        ranking: '#2 Test Bowler'
      }
    ]
    
    return playerStats
    
  } catch (error) {
    console.error('Error in player stats:', error)
    return createMockPlayerStats()
  }
}

async function scrapeCricbuzzMatchDetails(matchId) {
  try {
    console.log('Scraping match details for ID:', matchId)
    
    // For now, return mock match details
    return {
      id: matchId,
      series: 'T20 World Cup 2024',
      status: 'live',
      team1: { name: 'India', score: '180/4 (18.2)' },
      team2: { name: 'Australia', score: '156/8 (20)' },
      result: 'India won by 24 runs',
      commentary: 'Detailed ball-by-ball commentary...',
      scorecard: 'Full scorecard details...'
    }
    
  } catch (error) {
    console.error('Error scraping match details:', error)
    return null
  }
}

// Helper function to extract overs from score
function extractOvers(scoreText) {
  const match = scoreText.match(/\(([^)]+)\)/)
  return match ? match[1] : '0'
}

// Updated mock data with current real matches
function createMockLiveMatches() {
  return [
    {
      id: uuidv4(),
      status: 'completed',
      series: 'Major League Cricket 2025',
      matchType: 'T20',
      format: 'T20',
      venue: 'Grand Prairie Stadium',
      team1: {
        name: 'MI New York',
        code: 'MINY',
        score: '180/7',
        overs: '20'
      },
      team2: {
        name: 'Washington Freedom', 
        code: 'WAF',
        score: '175/5',
        overs: '20'
      },
      commentary: 'MI New York won by 5 runs',
      toss: 'MI New York won the toss and elected to bat',
      timeAgo: 'Completed',
      keyStats: [
        { label: 'Margin', value: '5 runs' },
        { label: 'Format', value: 'T20' }
      ],
      result: 'MI New York won by 5 runs'
    },
    {
      id: uuidv4(),
      status: 'live',
      series: 'India tour of England, 2025',
      matchType: 'Test',
      format: 'Test',
      venue: 'The Oval, London',
      team1: {
        name: 'England',
        code: 'ENG',
        score: '387 & 192',
        overs: 'Declared'
      },
      team2: {
        name: 'India',
        code: 'IND', 
        score: '387 & 58/4',
        overs: '18.2'
      },
      commentary: 'Day 4: Stumps - India need 135 runs',
      toss: 'England won the toss and elected to bat',
      timeAgo: 'Live',
      keyStats: [
        { label: 'Target', value: '135 runs' },
        { label: 'Day', value: 'Day 4' }
      ]
    },
    {
      id: uuidv4(),
      status: 'live',
      series: 'Australia tour of West Indies, 2025',
      matchType: 'Test',
      format: 'Test',
      venue: 'Kensington Oval, Barbados',
      team1: {
        name: 'Australia',
        code: 'AUS',
        score: '225 & 99/6',
        overs: '28.4'
      },
      team2: {
        name: 'West Indies',
        code: 'WI',
        score: '143',
        overs: '52.1'
      },
      commentary: 'Australia lead by 181 runs with 4 wickets remaining',
      toss: 'West Indies won the toss and elected to field',
      timeAgo: 'Live',
      keyStats: [
        { label: 'Lead', value: '181 runs' },
        { label: 'Day', value: 'Day 3' }
      ]
    },
    {
      id: uuidv4(),
      status: 'upcoming',
      series: 'Zimbabwe vs South Africa, 2025',
      matchType: 'Test',
      format: 'Test',
      venue: 'Harare Sports Club',
      team1: {
        name: 'Zimbabwe',
        code: 'ZIM',
        score: 'Preview',
        overs: '0'
      },
      team2: {
        name: 'South Africa',
        code: 'RSA',
        score: 'Preview',
        overs: '0'
      },
      commentary: 'Match starts in 2 hours',
      toss: 'Toss at 9:30 AM local time',
      timeAgo: 'Upcoming',
      keyStats: [
        { label: 'Time', value: '2 hours' },
        { label: 'Format', value: 'Test' }
      ]
    }
  ]
}

function createMockRecentMatches() {
  return [
    {
      id: uuidv4(),
      series: 'Major League Cricket 2025',
      date: 'Today',
      team1: { name: 'Guyana Amazon Warriors', score: '165/8 (20)' },
      team2: { name: 'Delhi Capitals', score: '158/9 (20)' },
      result: 'Guyana Amazon Warriors won by 7 runs'
    },
    {
      id: uuidv4(),
      series: 'Major League Cricket 2025 Final',
      date: 'Yesterday',
      team1: { name: 'MI New York', score: '180/7 (20)' },
      team2: { name: 'Washington Freedom', score: '175/5 (20)' },
      result: 'MI New York won by 5 runs'
    },
    {
      id: uuidv4(),
      series: 'Big Bash League 2025',
      date: '2 days ago',
      team1: { name: 'Sydney Sixers', score: '195/4 (20)' },
      team2: { name: 'Melbourne Stars', score: '178/8 (20)' },
      result: 'Sydney Sixers won by 17 runs'
    }
  ]
}

function createMockUpcomingMatches() {
  return [
    {
      id: uuidv4(),
      series: 'Zimbabwe vs South Africa, 2025',
      dateTime: 'Today, 2:30 PM GMT',
      timeUntil: '2 hours',
      venue: 'Harare Sports Club',
      team1: { name: 'Zimbabwe', code: 'ZIM' },
      team2: { name: 'South Africa', code: 'RSA' }
    },
    {
      id: uuidv4(),
      series: 'Bangladesh vs Sri Lanka T20I',
      dateTime: 'Tomorrow, 1:00 PM GMT', 
      timeUntil: '1 day',
      venue: 'Shere Bangla National Stadium',
      team1: { name: 'Bangladesh', code: 'BAN' },
      team2: { name: 'Sri Lanka', code: 'SL' }
    },
    {
      id: uuidv4(),
      series: 'Pakistan vs New Zealand ODI',
      dateTime: 'Dec 20, 10:30 AM GMT',
      timeUntil: '3 days',
      venue: 'National Stadium, Karachi',
      team1: { name: 'Pakistan', code: 'PAK' },
      team2: { name: 'New Zealand', code: 'NZ' }
    }
  ]
}

function createMockPlayerStats() {
  return [
    {
      id: uuidv4(),
      name: 'Virat Kohli',
      team: 'India',
      role: 'Batsman',
      batting: { average: '52.4', runs: 12169 },
      bowling: { average: 'N/A', wickets: 4 },
      matches: 274,
      ranking: '#3 ODI Batsman'
    },
    {
      id: uuidv4(),
      name: 'Jasprit Bumrah',
      team: 'India', 
      role: 'Bowler',
      batting: { average: '8.2', runs: 89 },
      bowling: { average: '24.3', wickets: 145 },
      matches: 72,
      ranking: '#1 ODI Bowler'
    },
    {
      id: uuidv4(),
      name: 'Kane Williamson',
      team: 'New Zealand',
      role: 'Batsman',
      batting: { average: '47.8', runs: 6471 },
      bowling: { average: '51.2', wickets: 37 },
      matches: 158,
      ranking: '#5 ODI Batsman'
    },
    {
      id: uuidv4(),
      name: 'Pat Cummins',
      team: 'Australia',
      role: 'Bowler', 
      batting: { average: '15.6', runs: 789 },
      bowling: { average: '25.4', wickets: 188 },
      matches: 95,
      ranking: '#2 Test Bowler'
    }
  ]
}

// MongoDB connection
let client
let db

async function connectToMongo() {
  if (!client) {
    client = new MongoClient(process.env.MONGO_URL)
    await client.connect()
    db = client.db(process.env.DB_NAME)
  }
  return db
}

// Helper function to handle CORS
function handleCORS(response) {
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  return response
}

// OPTIONS handler for CORS
export async function OPTIONS() {
  return handleCORS(new NextResponse(null, { status: 200 }))
}

// Helper function to create basic workflow template
function createBasicWorkflowTemplate(platform, name, description) {
  if (platform === 'n8n') {
    return {
      name: name,
      nodes: [
        {
          id: "webhook-trigger",
          name: "Webhook Trigger",
          type: "n8n-nodes-base.webhook",
          position: [250, 300],
          webhookId: "webhook-id-placeholder",
          parameters: {
            path: "webhook",
            httpMethod: "POST",
            responseMode: "onReceived"
          }
        },
        {
          id: "process-data",
          name: "Process Data",
          type: "n8n-nodes-base.function",
          position: [450, 300],
          parameters: {
            functionCode: `// Process incoming data
const items = [];
for (const item of $input.all()) {
  items.push({
    json: {
      ...item.json,
      processed: true,
      timestamp: new Date().toISOString()
    }
  });
}
return items;`
          }
        }
      ],
      connections: {
        "webhook-trigger": {
          "main": [
            [
              {
                "node": "process-data",
                "type": "main",
                "index": 0
              }
            ]
          ]
        }
      },
      settings: {
        executionOrder: "v1"
      }
    }
  } else {
    return {
      name: name,
      scenario: {
        dsl: "1.0.0",
        flow: [
          {
            id: 1,
            module: "webhook:customWebhook",
            version: 1,
            parameters: {
              hook: "webhook-id-placeholder"
            },
            mapper: {},
            metadata: {
              designer: {
                x: 0,
                y: 0
              }
            }
          },
          {
            id: 2,
            module: "util:SetVariable2",
            version: 1,
            parameters: {},
            mapper: {
              name: "processed_data",
              scope: "roundtrip",
              value: "{{1.data}}"
            },
            metadata: {
              designer: {
                x: 300,
                y: 0
              }
            }
          }
        ],
        metadata: {
          instant: true,
          version: 1,
          scenario: {
            roundtrips: 1,
            maxCycles: 1,
            autoCommit: true,
            sequential: false,
            slots: null,
            confidential: false,
            dataloss: false,
            dlq: false,
            freshVariables: false
          }
        }
      }
    }
  }
}

// Helper function to generate visual preview
function generateVisualPreview(workflowJson, platform) {
  try {
    if (platform === 'n8n') {
      const nodeCount = workflowJson.nodes ? workflowJson.nodes.length : 0
      const connectionCount = workflowJson.connections ? Object.keys(workflowJson.connections).length : 0
      
      return `📊 N8N Workflow Preview:
• ${nodeCount} nodes configured
• ${connectionCount} connections mapped
• Execution order: ${workflowJson.settings?.executionOrder || 'v1'}
• Ready for import into n8n`
    } else {
      const moduleCount = workflowJson.scenario?.flow ? workflowJson.scenario.flow.length : 0
      
      return `📊 Make.com Workflow Preview:
• ${moduleCount} modules configured
• Scenario version: ${workflowJson.scenario?.metadata?.version || 1}
• Auto-commit: ${workflowJson.scenario?.metadata?.scenario?.autoCommit ? 'enabled' : 'disabled'}
• Ready for import into Make.com`
    }
  } catch (error) {
    return `📊 Workflow Preview:
• Generated successfully
• Platform: ${platform}
• Ready for import`
  }
}

// Helper function to count nodes in workflow
function countNodes(workflowJson, platform) {
  try {
    if (platform === 'n8n') {
      return workflowJson.nodes ? workflowJson.nodes.length : 0
    } else {
      return workflowJson.scenario?.flow ? workflowJson.scenario.flow.length : 0
    }
  } catch (error) {
    return 0
  }
}

// Helper function to fetch AWS tools data
async function fetchAWSToolsData() {
  try {
    console.log('Fetching AWS tools data...')
    
    const response = await fetch('https://yw5sjxzhx6.execute-api.ap-southeast-2.amazonaws.com/prod/tools', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'HappyTools/1.0'
      }
    })
    
    if (!response.ok) {
      console.error('Failed to fetch AWS tools:', response.status)
      return []
    }
    
    const awsData = await response.json()
    console.log(`✅ Fetched ${awsData.length} tools from AWS`)
    
    // Transform AWS data to match our schema
    const transformedTools = awsData.map(tool => ({
      id: tool.tool_id,
      tool_id: tool.tool_id,
      name: tool.name || 'Unknown Tool',
      tagline: tool.tagline || '',
      description: tool.description || '',
      url: tool.url || '',
      category: mapTopicsToCategory(tool.topics || []),
      topics: tool.topics || [],
      votes: 0, // AWS doesn't provide votes
      rating: 0, // AWS doesn't provide rating
      featured_at: tool.created_at || new Date().toISOString(),
      created_at: tool.created_at || new Date().toISOString(),
      source: 'aws-dynamodb',
      maker: 'Product Hunt', // Default maker
      website: extractWebsiteFromUrl(tool.url || ''),
      launch_date: tool.created_at || new Date().toISOString(),
      is_featured: true,
      badge: 'New',
      thumbnail: generateThumbnailUrl(tool.name || 'Tool')
    }))
    
    return transformedTools
    
  } catch (error) {
    console.error('Error fetching AWS tools:', error)
    return []
  }
}

// Helper function to map topics to categories
function mapTopicsToCategory(topics) {
  const topicMap = {
    'Artificial Intelligence': 'AI & Machine Learning',
    'Design Tools': 'Design',
    'Marketing': 'Marketing',
    'Developer Tools': 'Development',
    'Sales': 'Sales',
    'SaaS': 'SaaS',
    'Audio': 'Audio & Music',
    'No-Code': 'No-Code',
    'Social Media': 'Social Media',
    'Bots': 'AI & Machine Learning',
    'Community': 'Community',
    'reddit': 'Social Media'
  }
  
  for (const topic of topics) {
    if (topicMap[topic]) {
      return topicMap[topic]
    }
  }
  
  return 'Other'
}

// Helper function to extract website from URL
function extractWebsiteFromUrl(url) {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname
  } catch (error) {
    return 'producthunt.com'
  }
}

// Helper function to generate thumbnail URL
function generateThumbnailUrl(name) {
  // Generate a placeholder thumbnail based on the tool name
  const encodedName = encodeURIComponent(name)
  return `https://via.placeholder.com/400x300/4F46E5/FFFFFF?text=${encodedName}`
}

// Helper function to remove duplicate tools
function removeDuplicateTools(tools) {
  const seen = new Set()
  const uniqueTools = []
  
  for (const tool of tools) {
    const key = tool.tool_id || tool.id || tool.name
    if (!seen.has(key)) {
      seen.add(key)
      uniqueTools.push(tool)
    }
  }
  
  return uniqueTools
}

// Helper function to transform Product Hunt data to our format
function transformPHToolToDBFormat(phTool) {
  return {
    id: uuidv4(),
    ph_id: phTool.id,
    name: phTool.name,
    tagline: phTool.tagline,
    description: phTool.description,
    votes: phTool.votesCount,
    url: phTool.url,
    website: phTool.website,
    makers: [], // Simplified - no makers data in reduced query
    topics: [], // Simplified - no topics data in reduced query
    category: 'General',
    pricing: 'Unknown',
    rating: Math.random() * 2 + 3,
    featured_at: new Date(phTool.createdAt),
    source: 'Product Hunt',
    created_at: new Date(),
    updated_at: new Date()
  }
}

// Route handler function
async function handleRoute(request, { params }) {
  const { path = [] } = params
  const route = `/${path.join('/')}`
  const method = request.method

  try {
    const db = await connectToMongo()

    // Root endpoint - GET /api/root (since /api/ is not accessible with catch-all)
    if (route === '/root' && method === 'GET') {
      return handleCORS(NextResponse.json({ message: "Hello World" }))
    }
    // Root endpoint - GET /api/root (since /api/ is not accessible with catch-all)
    if (route === '/' && method === 'GET') {
      return handleCORS(NextResponse.json({ message: "Hello World" }))
    }

    // AI Tools endpoints
    if (route.startsWith('/ai-tools')) {
      const toolsRoute = route.replace('/ai-tools', '');
      
      // Get AI tools endpoint - GET /api/ai-tools
      if (toolsRoute === '' && method === 'GET') {
        try {
          const url = new URL(request.url);
          const page = parseInt(url.searchParams.get('page') || '1');
          const limit = parseInt(url.searchParams.get('limit') || '12');
          const search = url.searchParams.get('search') || '';
          const category = url.searchParams.get('category') || '';
          const source = url.searchParams.get('source') || '';
          const sort = url.searchParams.get('sort') || 'featured_at';
          
          const skip = (page - 1) * limit;
          
          // Build query
          const query = {};
          if (search) {
            query.$or = [
              { name: { $regex: search, $options: 'i' } },
              { description: { $regex: search, $options: 'i' } },
              { tagline: { $regex: search, $options: 'i' } }
            ];
          }
          if (category) query.category = category;
          if (source) query.source = source;
          
          // Build sort
          const sortObj = {};
          if (sort === 'featured_at') sortObj.featured_at = -1;
          else if (sort === 'votes') sortObj.votes = -1;
          else if (sort === 'name') sortObj.name = 1;
          else if (sort === 'rating') sortObj.rating = -1;
          else sortObj.featured_at = -1;
          
          // Fetch from database
          const tools = await db.collection('ai_tools').find(query)
            .sort(sortObj)
            .skip(skip)
            .limit(limit)
            .toArray();
          
          // Fetch fresh data from AWS API and merge
          const awsTools = await fetchAWSToolsData();
          
          // Combine and deduplicate tools
          const combinedTools = [...awsTools, ...tools];
          const uniqueTools = removeDuplicateTools(combinedTools);
          
          // Apply pagination to combined results
          const paginatedTools = uniqueTools.slice(skip, skip + limit);
          
          const totalCount = uniqueTools.length;
          const totalPages = Math.ceil(totalCount / limit);
          
          return handleCORS(NextResponse.json({
            tools: paginatedTools,
            pagination: {
              currentPage: page,
              totalPages: totalPages,
              totalCount: totalCount,
              hasNextPage: page < totalPages,
              hasPrevPage: page > 1
            }
          }));
          
        } catch (error) {
          console.error('Error fetching AI tools:', error);
          return handleCORS(NextResponse.json(
            { error: 'Failed to fetch AI tools' },
            { status: 500 }
          ));
        }
      }

      // Sync AWS tools endpoint - POST /api/ai-tools/sync-aws
      if (toolsRoute === '/sync-aws' && method === 'POST') {
        try {
          const awsTools = await fetchAWSToolsData();
          
          // Store in database with AWS source
          for (const tool of awsTools) {
            await db.collection('ai_tools').updateOne(
              { tool_id: tool.tool_id },
              { 
                $set: {
                  ...tool,
                  source: 'aws-dynamodb',
                  synced_at: new Date()
                }
              },
              { upsert: true }
            );
          }
          
          return handleCORS(NextResponse.json({
            success: true,
            message: `Synced ${awsTools.length} tools from AWS DynamoDB`,
            count: awsTools.length
          }));
          
        } catch (error) {
          console.error('Error syncing AWS tools:', error);
          return handleCORS(NextResponse.json(
            { error: 'Failed to sync AWS tools' },
            { status: 500 }
          ));
        }
      }

    // AI Tools sync endpoint - POST /api/ai-tools/sync (Product Hunt)
    if (route === '/ai-tools/sync' && method === 'POST') {
      try {
        const apolloClient = getClient();
        const { data } = await apolloClient.query({
          query: GET_AI_TOOLS,
          variables: { first: 10 } // Reduced from 50 to 10 to lower complexity
        });
        
        const tools = data.posts.edges.map(edge => edge.node);
        const aiTools = tools.filter(isAITool);
        
        let syncedCount = 0;
        
        for (const tool of aiTools) {
          // Check if tool already exists
          const existingTool = await db.collection('ai_tools').findOne({ ph_id: tool.id });
          
          if (!existingTool) {
            const transformedTool = transformPHToolToDBFormat(tool);
            await db.collection('ai_tools').insertOne(transformedTool);
            syncedCount++;
          }
        }
        
        return handleCORS(NextResponse.json({
          message: `Successfully synced ${syncedCount} new AI tools from Product Hunt`,
          synced: syncedCount,
          total_found: aiTools.length
        }));
        
      } catch (error) {
        console.error('Error syncing AI tools:', error);
        return handleCORS(NextResponse.json(
          { error: 'Failed to sync AI tools from Product Hunt' },
          { status: 500 }
        ));
      }
    }

    // AI Tools sync endpoint - POST /api/ai-tools/sync-aitools (Targeted AITools.fyi)
    if (route === '/ai-tools/sync-aitools' && method === 'POST') {
      try {
        const scraper = new TargetedAiToolsScraper();
        const scrapedTools = await scraper.scrapeAllTargetPages();
        
        let syncedCount = 0;
        
        for (const tool of scrapedTools) {
          // Check if tool already exists by name and source
          const existingTool = await db.collection('ai_tools').findOne({ 
            name: tool.name, 
            source: tool.source 
          });
          
          if (!existingTool) {
            await db.collection('ai_tools').insertOne(tool);
            syncedCount++;
          } else {
            // Update existing tool with new information
            await db.collection('ai_tools').updateOne(
              { _id: existingTool._id },
              { 
                $set: { 
                  ...tool,
                  updated_at: new Date()
                }
              }
            );
          }
        }
        
        return handleCORS(NextResponse.json({
          message: `Successfully synced ${syncedCount} new AI tools from targeted pages`,
          synced: syncedCount,
          total_found: scrapedTools.length,
          pages_scraped: 20
        }));
        
      } catch (error) {
        console.error('Error syncing targeted AI tools:', error);
        return handleCORS(NextResponse.json(
          { error: 'Failed to sync AI tools from targeted sources' },
          { status: 500 }
        ));
      }
    }

    // AI Tools sync all endpoint - POST /api/ai-tools/sync-all
    if (route === '/ai-tools/sync-all' && method === 'POST') {
      try {
        let totalSynced = 0;
        
        // Sync from Product Hunt
        try {
          const apolloClient = getClient();
          const { data } = await apolloClient.query({
            query: GET_AI_TOOLS,
            variables: { first: 10 }
          });
          
          const tools = data.posts.edges.map(edge => edge.node);
          const aiTools = tools.filter(isAITool);
          
          for (const tool of aiTools) {
            const existingTool = await db.collection('ai_tools').findOne({ ph_id: tool.id });
            
            if (!existingTool) {
              const transformedTool = transformPHToolToDBFormat(tool);
              await db.collection('ai_tools').insertOne(transformedTool);
              totalSynced++;
            }
          }
        } catch (phError) {
          console.error('Product Hunt sync error:', phError);
        }
        
        // Sync from AITools.fyi
        try {
          const scraper = new AiToolsScraper();
          const scrapedTools = await scraper.scrapeWithFallback();
          
          for (const tool of scrapedTools) {
            const existingTool = await db.collection('ai_tools').findOne({ 
              name: tool.name, 
              source: tool.source 
            });
            
            if (!existingTool) {
              await db.collection('ai_tools').insertOne(tool);
              totalSynced++;
            }
          }
        } catch (scrapeError) {
          console.error('AITools.fyi sync error:', scrapeError);
        }
        
        return handleCORS(NextResponse.json({
          message: `Successfully synced ${totalSynced} new AI tools from all sources`,
          synced: totalSynced
        }));
        
      } catch (error) {
        console.error('Error syncing all AI tools:', error);
        return handleCORS(NextResponse.json(
          { error: 'Failed to sync AI tools from all sources' },
          { status: 500 }
        ));
      }
    }

    // AI Tools trending endpoint - GET /api/ai-tools/trending
    if (route === '/ai-tools/trending' && method === 'GET') {
      const limit = parseInt(new URL(request.url).searchParams.get('limit') || '10');
      
      const trendingTools = await db.collection('ai_tools')
        .find({})
        .sort({ votes: -1, featured_at: -1 })
        .limit(limit)
        .toArray();
      
      const cleanedTools = trendingTools.map(({ _id, ...rest }) => rest);
      
      return handleCORS(NextResponse.json({
        tools: cleanedTools
      }));
    }

    // AI Tools categories endpoint - GET /api/ai-tools/categories
    if (route === '/ai-tools/categories' && method === 'GET') {
      const categories = await db.collection('ai_tools')
        .distinct('category');
      
      return handleCORS(NextResponse.json({
        categories: categories.filter(cat => cat && cat !== 'General')
      }));
    }

    // AI Tools stats endpoint - GET /api/ai-tools/stats
    if (route === '/ai-tools/stats' && method === 'GET') {
      const totalTools = await db.collection('ai_tools').countDocuments();
      const categoryCounts = await db.collection('ai_tools').aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]).toArray();
      
      const sourceCounts = await db.collection('ai_tools').aggregate([
        { $group: { _id: '$source', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]).toArray();
      
      return handleCORS(NextResponse.json({
        total: totalTools,
        categories: categoryCounts,
        sources: sourceCounts
      }));
    }

    // Website Builder generation endpoint - POST /api/website-builder/generate
    if (route === '/website-builder/generate' && method === 'POST') {
      try {
        const body = await request.json()
        const { provider, apiKey, prompt } = body
        
        if (!provider || !apiKey || !prompt) {
          return handleCORS(NextResponse.json(
            { error: 'Provider, API key, and prompt are required' },
            { status: 400 }
          ))
        }
        
        // Validate provider
        const validProviders = ['openai', 'claude', 'gemini']
        if (!validProviders.includes(provider)) {
          return handleCORS(NextResponse.json(
            { error: 'Invalid provider. Must be one of: openai, claude, gemini' },
            { status: 400 }
          ))
        }
        
        const systemPrompt = `You are an expert frontend developer and modern web designer. Generate a complete, professional, production-ready website using HTML, Bootstrap CSS, and modern design patterns.

REQUIREMENTS:
- Create STUNNING, PROFESSIONAL websites that rival lovable.io and bolt.new quality
- Use HTML5 with Bootstrap 5 for responsive layouts
- Use advanced CSS with modern design patterns
- Create IMPRESSIVE, VISUALLY STRIKING designs with:
  * Complex gradient backgrounds and glass morphism effects
  * Advanced animations and micro-interactions
  * Interactive hover effects and smooth transitions
  * Modern typography and spacing
  * Professional color schemes and visual hierarchy
  * Sophisticated layouts with cards, grids, and sections

DESIGN EXCELLENCE:
- Use cutting-edge design trends: gradients, glass effects, modern UI patterns
- Create engaging hero sections with animated elements
- Add interactive components: buttons, forms, cards with hover effects
- Use modern icons and visual elements (Font Awesome, Bootstrap Icons)
- Implement responsive design with Bootstrap breakpoints
- Add sophisticated color palettes and visual depth

MODERN PATTERNS:
- Component-like structure with sections and cards
- Interactive state management with vanilla JavaScript
- Smooth animations using CSS transitions and transforms
- Modern hover effects and micro-interactions
- Professional navigation and layout patterns

STYLING GUIDELINES:
- Use Bootstrap 5 classes for layout and components
- Add custom CSS for advanced effects: backdrop-filter, gradients, animations
- Create layered backgrounds with multiple gradients
- Add shadows, borders, and visual depth
- Use advanced color combinations and transparency
- Implement smooth transitions and hover effects

STRUCTURE:
- Hero section with compelling headline and call-to-action
- Feature sections with cards and icons
- Testimonials, pricing, or portfolio sections as relevant
- Modern footer with links and contact info
- Navigation bar with smooth scrolling

IMPORTANT OUTPUT FORMAT:
- Return ONLY the HTML body content (no <html>, <head>, or <body> tags)
- Use Bootstrap 5 classes and custom CSS
- Include Font Awesome icons and modern styling
- Make it production-ready and visually stunning
- Focus on vibrant colors, gradients, and modern design
- Create responsive, mobile-first designs

Generate a complete, professional website that looks like it was built by a top-tier web agency with modern design trends.`
        
        let generatedCode = ''
        
        // Generate code based on provider
        if (provider === 'openai') {
          const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'gpt-4',
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: prompt }
              ],
              max_tokens: 4000,
              temperature: 0.7,
            }),
          })
          
          if (!response.ok) {
            const error = await response.json()
            throw new Error(error.error?.message || 'OpenAI API error')
          }
          
          const data = await response.json()
          generatedCode = data.choices[0].message.content
          
        } else if (provider === 'claude') {
          const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
              'x-api-key': apiKey,
              'Content-Type': 'application/json',
              'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify({
              model: 'claude-3-5-sonnet-20241022',
              max_tokens: 4000,
              system: systemPrompt,
              messages: [
                { role: 'user', content: prompt }
              ],
            }),
          })
          
          if (!response.ok) {
            const error = await response.json()
            throw new Error(error.error?.message || 'Claude API error')
          }
          
          const data = await response.json()
          generatedCode = data.content[0].text
          
        } else if (provider === 'gemini') {
          const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    { text: `${systemPrompt}\n\nUser request: ${prompt}` }
                  ]
                }
              ],
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 4000,
              },
            }),
          })
          
          if (!response.ok) {
            const error = await response.json()
            throw new Error(error.error?.message || 'Gemini API error')
          }
          
          const data = await response.json()
          generatedCode = data.candidates[0].content.parts[0].text
        }
        
        // Clean the generated code to extract just the HTML content
        let cleanCode = generatedCode.trim()
        
        // Remove any explanatory text before HTML
        const htmlStart = cleanCode.search(/<[^>]+>/);
        if (htmlStart > 0) {
          cleanCode = cleanCode.substring(htmlStart);
        }
        
        // Remove markdown code blocks
        cleanCode = cleanCode.replace(/^```(?:html|HTML)?\n?/gm, '')
        cleanCode = cleanCode.replace(/\n?```$/gm, '')
        
        // Remove any remaining explanatory text patterns
        cleanCode = cleanCode.replace(/^.*?(?=<)/s, '');
        
        generatedCode = cleanCode
        
        // Ensure the component ends with export default
        if (!cleanCode.includes('export default')) {
          // Try to find the main component name
          const componentMatch = cleanCode.match(/(?:const|function)\s+(\w+)\s*=/)
          if (componentMatch) {
            const componentName = componentMatch[1]
            if (!cleanCode.trim().endsWith(';')) {
              cleanCode += '\n'
            }
            cleanCode += `\nexport default ${componentName};`
          } else {
            cleanCode += '\nexport default App;'
          }
        }
        
        // Security validation - allow React.js patterns but block truly dangerous content
        const dangerousPatterns = [
          // Block external script sources (but allow inline React code)
          /<script[^>]*src=["'][^"']*(?!.*tailwind|.*react|.*babel)[^"']*["']/gi,
          // Block external iframes (but allow data: urls)
          /<iframe[^>]*src=["'][^"']*(?!data:)[^"']*["']/gi,
          // Block javascript: urls
          /javascript:\s*[^"'\s]/gi,
          // Block dangerous functions (but allow React event handlers)
          /\b(?:eval|Function|setTimeout|setInterval)\s*\(/gi,
          // Block document.write and similar
          /\b(?:document\.write|document\.writeln)\s*\(/gi
        ]
        
        // Check for dangerous patterns
        const foundDangerousPattern = dangerousPatterns.find(pattern => pattern.test(generatedCode))
        if (foundDangerousPattern) {
          console.log('Potentially unsafe content detected, cleaning code...')
          // Instead of rejecting, try to clean the code
          let cleanedCode = generatedCode
          
          // Remove dangerous script tags but preserve React code
          cleanedCode = cleanedCode.replace(/<script[^>]*src=["'][^"']*(?!.*tailwind|.*react|.*babel)[^"']*["'][^>]*>.*?<\/script>/gi, '')
          
          // Remove javascript: urls
          cleanedCode = cleanedCode.replace(/javascript:\s*[^"'\s]+/gi, '#')
          
          // Remove dangerous function calls
          cleanedCode = cleanedCode.replace(/\b(?:eval|Function)\s*\(/gi, 'console.log(')
          
          // If still dangerous after cleaning, return error
          if (dangerousPatterns.some(pattern => pattern.test(cleanedCode))) {
            return handleCORS(NextResponse.json({ 
              error: 'Unable to generate safe code. Please try a different prompt.',
              suggestion: 'Try describing your website without requesting specific JavaScript functions.'
            }, { status: 400 }))
          }
          
          generatedCode = cleanedCode
        }
        
        // Save generated website to database
        const websiteRecord = {
          id: uuidv4(),
          prompt: prompt,
          provider: provider,
          generated_code: cleanCode,
          code_length: cleanCode.length,
          created_at: new Date(),
          updated_at: new Date()
        }
        
        await db.collection('generated_websites').insertOne(websiteRecord)
        
        return handleCORS(NextResponse.json({
          success: true,
          code: cleanCode,
          metadata: {
            provider: provider,
            code_length: cleanCode.length,
            generated_at: new Date().toISOString(),
            website_id: websiteRecord.id
          }
        }))
        
      } catch (error) {
        console.error('Error generating website:', error)
        return handleCORS(NextResponse.json(
          { error: error.message || 'Failed to generate website' },
          { status: 500 }
        ))
      }
    }

    // Chatbot creation endpoint - POST /api/chatbot/create
    if (route === '/chatbot/create' && method === 'POST') {
      try {
        const body = await request.json()
        const { name, description, personality, knowledge } = body
        
        if (!name || !knowledge) {
          return handleCORS(NextResponse.json(
            { error: 'Name and knowledge base are required' },
            { status: 400 }
          ))
        }
        
        // Process knowledge base
        let knowledgeText = knowledge.textContent || ''
        
        // Add document content
        if (knowledge.documents && knowledge.documents.length > 0) {
          knowledge.documents.forEach(doc => {
            knowledgeText += `\n\n--- ${doc.name} ---\n${doc.content}`
          })
        }
        
        // Process URLs (simulated for now)
        if (knowledge.urls && knowledge.urls.length > 0) {
          const validUrls = knowledge.urls.filter(url => url.trim())
          validUrls.forEach(url => {
            knowledgeText += `\n\n--- Content from ${url} ---\nThis URL will be processed to extract content for the chatbot knowledge base.`
          })
        }
        
        // Create chatbot record
        const chatbot = {
          id: uuidv4(),
          name: name,
          description: description || '',
          personality: personality || 'helpful',
          knowledge_base: knowledgeText,
          knowledge_sources: {
            documents: knowledge.documents?.map(doc => ({ name: doc.name, type: doc.type })) || [],
            urls: knowledge.urls?.filter(url => url.trim()) || [],
            text_content: !!knowledge.textContent
          },
          status: 'active',
          created_at: new Date(),
          updated_at: new Date(),
          chat_count: 0,
          embedding_active: true
        }
        
        // Save to database
        await db.collection('chatbots').insertOne(chatbot)
        
        // Create system prompt based on personality
        const personalityPrompts = {
          helpful: 'You are a helpful and informative assistant.',
          friendly: 'You are a friendly and approachable assistant.',
          expert: 'You are a knowledgeable expert in your field.',
          creative: 'You are a creative and imaginative assistant.',
          formal: 'You are a professional and formal assistant.'
        }
        
        const systemPrompt = personalityPrompts[personality] || personalityPrompts.helpful
        
        // Update chatbot with system prompt
        await db.collection('chatbots').updateOne(
          { id: chatbot.id },
          { $set: { system_prompt: systemPrompt } }
        )
        
        return handleCORS(NextResponse.json({
          success: true,
          id: chatbot.id,
          name: chatbot.name,
          status: chatbot.status,
          knowledge_stats: {
            total_content_length: knowledgeText.length,
            documents: knowledge.documents?.length || 0,
            urls: knowledge.urls?.filter(url => url.trim()).length || 0,
            has_text_content: !!knowledge.textContent
          }
        }))
        
      } catch (error) {
        console.error('Error creating chatbot:', error)
        return handleCORS(NextResponse.json(
          { error: 'Failed to create chatbot' },
          { status: 500 }
        ))
      }
    }

    // Chatbot chat endpoint - POST /api/chatbot/chat
    if (route === '/chatbot/chat' && method === 'POST') {
      try {
        const body = await request.json()
        const { chatbotId, message, sessionId } = body
        
        if (!chatbotId || !message) {
          return handleCORS(NextResponse.json(
            { error: 'Chatbot ID and message are required' },
            { status: 400 }
          ))
        }
        
        // Get chatbot from database
        const chatbot = await db.collection('chatbots').findOne({ id: chatbotId })
        
        if (!chatbot) {
          return handleCORS(NextResponse.json(
            { error: 'Chatbot not found' },
            { status: 404 }
          ))
        }
        
        // Generate response based on knowledge base (simplified)
        let response = ''
        
        if (message.toLowerCase().includes('hello') || message.toLowerCase().includes('hi')) {
          response = `Hello! I'm ${chatbot.name}. ${chatbot.description} How can I help you today?`
        } else if (message.toLowerCase().includes('help') || message.toLowerCase().includes('what')) {
          response = `I'm here to help! I have knowledge about various topics from my training data. You can ask me questions and I'll do my best to provide helpful answers based on my knowledge base.`
        } else {
          // Simple keyword matching from knowledge base
          const knowledgeBase = chatbot.knowledge_base.toLowerCase()
          const messageWords = message.toLowerCase().split(' ')
          
          let relevantContent = ''
          for (const word of messageWords) {
            if (word.length > 3 && knowledgeBase.includes(word)) {
              const index = knowledgeBase.indexOf(word)
              const contextStart = Math.max(0, index - 100)
              const contextEnd = Math.min(knowledgeBase.length, index + 200)
              relevantContent = knowledgeBase.substring(contextStart, contextEnd)
              break
            }
          }
          
          if (relevantContent) {
            response = `Based on my knowledge: ${relevantContent.substring(0, 300)}...`
          } else {
            response = `I understand you're asking about "${message}". While I don't have specific information about that in my current knowledge base, I'm designed to help with questions related to ${chatbot.name}. Could you try rephrasing your question or ask about something more specific?`
          }
        }
        
        // Save chat interaction
        const chatInteraction = {
          id: uuidv4(),
          chatbot_id: chatbotId,
          session_id: sessionId || uuidv4(),
          user_message: message,
          bot_response: response,
          timestamp: new Date()
        }
        
        await db.collection('chat_interactions').insertOne(chatInteraction)
        
        // Update chat count
        await db.collection('chatbots').updateOne(
          { id: chatbotId },
          { $inc: { chat_count: 1 } }
        )
        
        return handleCORS(NextResponse.json({
          success: true,
          response: response,
          session_id: chatInteraction.session_id,
          timestamp: chatInteraction.timestamp
        }))
        
      } catch (error) {
        console.error('Error processing chat:', error)
        return handleCORS(NextResponse.json(
          { error: 'Failed to process chat message' },
          { status: 500 }
        ))
      }
    }

    // Get chatbot info - GET /api/chatbot/info
    if (route.startsWith('/chatbot/info/') && method === 'GET') {
      try {
        const chatbotId = route.split('/').pop()
        
        const chatbot = await db.collection('chatbots').findOne({ id: chatbotId })
        
        if (!chatbot) {
          return handleCORS(NextResponse.json(
            { error: 'Chatbot not found' },
            { status: 404 }
          ))
        }
        
        const { _id, knowledge_base, ...publicChatbot } = chatbot
        
        return handleCORS(NextResponse.json({
          success: true,
          chatbot: {
            ...publicChatbot,
            knowledge_stats: {
              content_length: knowledge_base?.length || 0,
              document_count: chatbot.knowledge_sources?.documents?.length || 0,
              url_count: chatbot.knowledge_sources?.urls?.length || 0
            }
          }
        }))
        
      } catch (error) {
        console.error('Error getting chatbot info:', error)
        return handleCORS(NextResponse.json(
          { error: 'Failed to get chatbot info' },
          { status: 500 }
        ))
      }
    }

    // AI Agents run endpoint - POST /api/agents/run
    if (route === '/agents/run' && method === 'POST') {
      try {
        const body = await request.json()
        const { agentId, inputs } = body
        
        let result = ''
        
        switch (agentId) {
          case 'business-plan-generator':
            if (!inputs.apiKey) {
              result = 'Please provide your OpenAI API key for business plan generation.'
            } else if (!inputs.businessIdea || !inputs.industry || !inputs.targetMarket) {
              result = 'Please provide business idea, industry, and target market.'
            } else {
              try {
                const response = await fetch('https://api.openai.com/v1/chat/completions', {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${inputs.apiKey}`,
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    model: "gpt-4",
                    messages: [
                      {
                        role: "system",
                        content: `You are a professional business consultant. Create a comprehensive business plan with executive summary, market analysis, financial projections, marketing strategy, and implementation timeline. Be specific and actionable.`
                      },
                      {
                        role: "user",
                        content: `Create a business plan for: ${inputs.businessIdea}. Industry: ${inputs.industry}. Target Market: ${inputs.targetMarket}. Budget: ${inputs.budget || 'Not specified'}.`
                      }
                    ],
                    max_tokens: 2000
                  })
                })
                
                if (!response.ok) {
                  throw new Error(`OpenAI API error: ${response.status}`)
                }
                
                const data = await response.json()
                result = data.choices[0].message.content
              } catch (error) {
                result = `Error generating business plan: ${error.message}`
              }
            }
            break
            
          case 'competitor-analysis':
            if (!inputs.apiKey) {
              result = 'Please provide your OpenAI API key for competitor analysis.'
            } else if (!inputs.company || !inputs.competitors) {
              result = 'Please provide your company name and list of competitors.'
            } else {
              try {
                const response = await fetch('https://api.openai.com/v1/chat/completions', {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${inputs.apiKey}`,
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    model: "gpt-4",
                    messages: [
                      {
                        role: "system",
                        content: `You are a strategic business analyst. Perform a detailed ${inputs.analysisType} for the given company and competitors. Include strengths, weaknesses, opportunities, threats, and strategic recommendations.`
                      },
                      {
                        role: "user",
                        content: `Analyze ${inputs.company} against these competitors: ${inputs.competitors}. Focus on: ${inputs.analysisType}.`
                      }
                    ],
                    max_tokens: 1500
                  })
                })
                
                if (!response.ok) {
                  throw new Error(`OpenAI API error: ${response.status}`)
                }
                
                const data = await response.json()
                result = data.choices[0].message.content
              } catch (error) {
                result = `Error performing competitor analysis: ${error.message}`
              }
            }
            break
            
          case 'meeting-summarizer':
            if (!inputs.apiKey) {
              result = 'Please provide your OpenAI API key for meeting summarization.'
            } else if (!inputs.transcript) {
              result = 'Please provide the meeting transcript.'
            } else {
              try {
                let systemPrompt = `You are a professional meeting assistant. `;
                
                switch (inputs.outputFormat) {
                  case 'Executive Summary':
                    systemPrompt += 'Create a high-level executive summary focusing on key decisions and strategic points.';
                    break;
                  case 'Action Items':
                    systemPrompt += 'Extract and organize all action items with responsible parties and deadlines.';
                    break;
                  case 'Key Decisions':
                    systemPrompt += 'Focus on decisions made and their implications.';
                    break;
                  default:
                    systemPrompt += 'Create a comprehensive summary including key points, decisions, and action items.';
                }
                
                const response = await fetch('https://api.openai.com/v1/chat/completions', {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${inputs.apiKey}`,
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    model: "gpt-4",
                    messages: [
                      {
                        role: "system",
                        content: systemPrompt
                      },
                      {
                        role: "user",
                        content: `Summarize this ${inputs.meetingType} meeting transcript: "${inputs.transcript}"`
                      }
                    ],
                    max_tokens: 1200
                  })
                })
                
                if (!response.ok) {
                  throw new Error(`OpenAI API error: ${response.status}`)
                }
                
                const data = await response.json()
                result = data.choices[0].message.content
              } catch (error) {
                result = `Error summarizing meeting: ${error.message}`
              }
            }
            break
            
          case 'sales-email-sequences':
            if (!inputs.apiKey) {
              result = 'Please provide your OpenAI API key for sales email generation.'
            } else if (!inputs.product || !inputs.targetAudience) {
              result = 'Please provide product/service and target audience information.'
            } else {
              try {
                const response = await fetch('https://api.openai.com/v1/chat/completions', {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${inputs.apiKey}`,
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    model: "gpt-4",
                    messages: [
                      {
                        role: "system",
                        content: `You are a sales copywriting expert. Create a ${inputs.emailCount} ${inputs.sequenceType} email sequence. Include subject lines, personalization tips, and timing recommendations for each email.`
                      },
                      {
                        role: "user",
                        content: `Create ${inputs.emailCount} for ${inputs.sequenceType} selling "${inputs.product}" to "${inputs.targetAudience}".`
                      }
                    ],
                    max_tokens: 2000
                  })
                })
                
                if (!response.ok) {
                  throw new Error(`OpenAI API error: ${response.status}`)
                }
                
                const data = await response.json()
                result = data.choices[0].message.content
              } catch (error) {
                result = `Error generating sales email sequence: ${error.message}`
              }
            }
            break
            
          case 'market-research-ai':
            if (!inputs.apiKey) {
              result = 'Please provide your OpenAI API key for market research.'
            } else if (!inputs.market) {
              result = 'Please specify the market or industry to research.'
            } else {
              try {
                const response = await fetch('https://api.openai.com/v1/chat/completions', {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${inputs.apiKey}`,
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    model: "gpt-4",
                    messages: [
                      {
                        role: "system",
                        content: `You are a market research analyst. Conduct ${inputs.researchType} for the specified market with focus on ${inputs.geography} over ${inputs.timeframe}. Include market size, trends, opportunities, and challenges.`
                      },
                      {
                        role: "user",
                        content: `Research the ${inputs.market} market. Focus: ${inputs.researchType}. Geography: ${inputs.geography}. Timeframe: ${inputs.timeframe}.`
                      }
                    ],
                    max_tokens: 1800
                  })
                })
                
                if (!response.ok) {
                  throw new Error(`OpenAI API error: ${response.status}`)
                }
                
                const data = await response.json()
                result = data.choices[0].message.content
              } catch (error) {
                result = `Error conducting market research: ${error.message}`
              }
            }
            break
            
          case 'user-persona-generator':
            if (!inputs.apiKey) {
              result = 'Please provide your OpenAI API key for persona generation.'
            } else if (!inputs.product) {
              result = 'Please describe your product or service.'
            } else {
              try {
                const response = await fetch('https://api.openai.com/v1/chat/completions', {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${inputs.apiKey}`,
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    model: "gpt-4",
                    messages: [
                      {
                        role: "system",
                        content: `You are a UX researcher. Create ${inputs.personaCount} detailed user personas for a ${inputs.industry} product. Include ${inputs.includeData} for each persona with demographics, behaviors, pain points, goals, and motivations.`
                      },
                      {
                        role: "user",
                        content: `Create user personas for: ${inputs.product}. Industry: ${inputs.industry}. Number: ${inputs.personaCount}. Include: ${inputs.includeData}.`
                      }
                    ],
                    max_tokens: 1600
                  })
                })
                
                if (!response.ok) {
                  throw new Error(`OpenAI API error: ${response.status}`)
                }
                
                const data = await response.json()
                result = data.choices[0].message.content
              } catch (error) {
                result = `Error generating user personas: ${error.message}`
              }
            }
            break
            
          case 'financial-projections':
            if (!inputs.apiKey) {
              result = 'Please provide your OpenAI API key for financial projections.'
            } else if (!inputs.businessType) {
              result = 'Please specify your business type.'
            } else {
              try {
                const response = await fetch('https://api.openai.com/v1/chat/completions', {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${inputs.apiKey}`,
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    model: "gpt-4",
                    messages: [
                      {
                        role: "system",
                        content: `You are a financial analyst. Create ${inputs.projectionPeriod} financial projections for a ${inputs.businessType} business with current revenue of ${inputs.revenue}. Include ${inputs.includeScenarios} scenarios with P&L, cash flow, and key metrics.`
                      },
                      {
                        role: "user",
                        content: `Generate financial projections for ${inputs.businessType} business. Current revenue: ${inputs.revenue}. Period: ${inputs.projectionPeriod}. Scenarios: ${inputs.includeScenarios}.`
                      }
                    ],
                    max_tokens: 1800
                  })
                })
                
                if (!response.ok) {
                  throw new Error(`OpenAI API error: ${response.status}`)
                }
                
                const data = await response.json()
                result = data.choices[0].message.content
              } catch (error) {
                result = `Error generating financial projections: ${error.message}`
              }
            }
            break
            
          case 'code-reviewer':
            if (!inputs.apiKey) {
              result = 'Please provide your OpenAI API key for code review.'
            } else if (!inputs.code) {
              result = 'Please provide the code to review.'
            } else {
              try {
                const response = await fetch('https://api.openai.com/v1/chat/completions', {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${inputs.apiKey}`,
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    model: "gpt-4",
                    messages: [
                      {
                        role: "system",
                        content: `You are a senior software engineer conducting a code review. Focus on ${inputs.reviewFocus} for ${inputs.language} code. Show ${inputs.severity} issues with specific line references and improvement suggestions.`
                      },
                      {
                        role: "user",
                        content: `Review this ${inputs.language} code focusing on ${inputs.reviewFocus}: ${inputs.code}`
                      }
                    ],
                    max_tokens: 1500
                  })
                })
                
                if (!response.ok) {
                  throw new Error(`OpenAI API error: ${response.status}`)
                }
                
                const data = await response.json()
                result = data.choices[0].message.content
              } catch (error) {
                result = `Error reviewing code: ${error.message}`
              }
            }
            break
            
          case 'seo-content-optimizer':
            if (!inputs.apiKey) {
              result = 'Please provide your OpenAI API key for SEO optimization.'
            } else if (!inputs.content || !inputs.targetKeyword) {
              result = 'Please provide content and target keyword.'
            } else {
              try {
                const response = await fetch('https://api.openai.com/v1/chat/completions', {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${inputs.apiKey}`,
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    model: "gpt-4",
                    messages: [
                      {
                        role: "system",
                        content: `You are an SEO expert. Perform ${inputs.optimizationLevel} optimization for a ${inputs.contentType} targeting "${inputs.targetKeyword}". Provide specific recommendations for improvements, keyword density, meta descriptions, and structure.`
                      },
                      {
                        role: "user",
                        content: `Optimize this ${inputs.contentType} content for "${inputs.targetKeyword}": ${inputs.content}`
                      }
                    ],
                    max_tokens: 1500
                  })
                })
                
                if (!response.ok) {
                  throw new Error(`OpenAI API error: ${response.status}`)
                }
                
                const data = await response.json()
                result = data.choices[0].message.content
              } catch (error) {
                result = `Error optimizing content: ${error.message}`
              }
            }
            break
            
          case 'automated-testing-generator':
            if (!inputs.apiKey) {
              result = 'Please provide your OpenAI API key for test generation.'
            } else if (!inputs.feature) {
              result = 'Please describe the feature to test.'
            } else {
              try {
                const response = await fetch('https://api.openai.com/v1/chat/completions', {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${inputs.apiKey}`,
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    model: "gpt-4",
                    messages: [
                      {
                        role: "system",
                        content: `You are a QA engineer. Generate ${inputs.complexity} ${inputs.testType} for ${inputs.framework}. Include test cases, setup, assertions, and edge cases.`
                      },
                      {
                        role: "user",
                        content: `Generate ${inputs.testType} using ${inputs.framework} for: ${inputs.feature}. Complexity: ${inputs.complexity}.`
                      }
                    ],
                    max_tokens: 1500
                  })
                })
                
                if (!response.ok) {
                  throw new Error(`OpenAI API error: ${response.status}`)
                }
                
                const data = await response.json()
                result = data.choices[0].message.content
              } catch (error) {
                result = `Error generating tests: ${error.message}`
              }
            }
            break
            
          case 'intro-email':
            if (!inputs.person1 || !inputs.person2 || !inputs.purpose) {
              result = 'Please provide both person names and introduction purpose.'
            } else {
              result = `Subject: Introduction - ${inputs.person1} and ${inputs.person2}

Dear ${inputs.person2},

I hope this email finds you well. I wanted to introduce you to ${inputs.person1}, who I believe would be a valuable connection for you.

${inputs.purpose}

${inputs.context || 'I think you both would benefit from connecting and potentially collaborating.'}

I'll let you both take it from here. ${inputs.person1}, please feel free to reach out to ${inputs.person2} directly.

Best regards,
[Your Name]

---
Introduction email generated between ${inputs.person1} and ${inputs.person2}`
            }
            break
            
          case 'follow-up-writer':
            if (!inputs.apiKey) {
              result = 'Please provide your OpenAI API key.'
            } else if (!inputs.previousEmail || !inputs.recipient) {
              result = 'Please provide the previous email/conversation and recipient name.'
            } else {
              try {
                const response = await fetch('https://api.openai.com/v1/chat/completions', {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${inputs.apiKey}`,
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    model: "gpt-3.5-turbo",
                    messages: [
                      {
                        role: "system",
                        content: `You are a professional email writer. Create a polite, professional follow-up email for the purpose: ${inputs.purpose || 'general follow-up'}`
                      },
                      {
                        role: "user", 
                        content: `Write a follow-up email to ${inputs.recipient}. Previous conversation: "${inputs.previousEmail}". Purpose: ${inputs.purpose || 'Check Status'}`
                      }
                    ],
                    max_tokens: 300
                  })
                })
                
                if (!response.ok) {
                  throw new Error(`OpenAI API error: ${response.status}`)
                }
                
                const data = await response.json()
                result = data.choices[0].message.content
              } catch (error) {
                result = `Error generating follow-up email: ${error.message}`
              }
            }
            break
            
          case 'stock-finder':
            if (!inputs.apiKey) {
              result = `Most Traded Stocks - ${inputs.market || 'US'} Market

⚠️ This agent requires a RapidAPI key for Yahoo Finance API.

To get real-time stock data:
1. Go to rapidapi.com
2. Subscribe to Yahoo Finance API
3. Add your API key above

Demo Data (${inputs.timeframe || 'Today'}):
📈 AAPL - Apple Inc. - Volume: 45.2M
📈 TSLA - Tesla Inc. - Volume: 38.7M  
📈 NVDA - NVIDIA Corp - Volume: 42.1M
📈 MSFT - Microsoft Corp - Volume: 28.9M
📈 AMZN - Amazon.com Inc - Volume: 35.6M

Note: This is demo data. Use your RapidAPI key for real-time information.`
            } else {
              result = `Most Traded Stocks - ${inputs.market || 'US'} Market (${inputs.timeframe || 'Today'})

🔄 Fetching real-time data with your API key...

Note: Real Yahoo Finance API integration would be implemented here with your provided API key.

Demo structure:
📈 Stock Symbol - Company Name - Volume: XXX
📊 Price: $XXX.XX | Change: +X.XX%
🕒 Last Updated: [Timestamp]`
            }
            break
            
          case 'crypto-pulse':
            const cryptoData = {
              'Top 10': [
                '₿ Bitcoin (BTC): $43,250 (+2.4%)',
                'Ξ Ethereum (ETH): $2,650 (+1.8%)',
                '🟢 BNB: $315 (+0.9%)',
                '💰 XRP: $0.63 (+4.2%)',
                '🔵 Cardano (ADA): $0.48 (+1.5%)'
              ],
              'All Markets': [
                '📈 Biggest Gainers: SOL (+8.2%), MATIC (+6.1%)',
                '📉 Biggest Losers: DOGE (-3.4%), SHIB (-2.8%)',
                '💹 Highest Volume: BTC, ETH, USDT'
              ]
            }
            
            const selectedData = cryptoData[inputs.focus] || cryptoData['Top 10']
            result = `Crypto Market Pulse - ${inputs.focus || 'Top 10'} (${inputs.timeframe || '24h'})

${selectedData.join('\n')}

📊 Market Overview:
• Total Market Cap: $1.68T
• 24h Volume: $68.5B
• Bitcoin Dominance: 52.3%
• Fear & Greed Index: 65 (Greed)

⏰ Data as of: ${new Date().toLocaleString()}
📡 Source: CoinGecko API (Demo Data)

Note: This is demo data. Real implementation would use CoinGecko or CoinMarketCap APIs.`
            break
            
          case 'ai-detector':
            if (!inputs.apiKey) {
              result = 'Please provide your OpenAI API key for AI detection analysis.'
            } else if (!inputs.text) {
              result = 'Please provide text to analyze.'
            } else {
              try {
                const response = await fetch('https://api.openai.com/v1/chat/completions', {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${inputs.apiKey}`,
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    model: "gpt-3.5-turbo",
                    messages: [
                      {
                        role: "system",
                        content: "You are an AI detection expert. Analyze the given text and determine if it was likely written by AI or human. Look for patterns like repetitive phrasing, overly formal language, lack of personal touch, or generic content. Provide a confidence percentage."
                      },
                      {
                        role: "user",
                        content: `Please analyze this text and determine if it was written by AI or human: "${inputs.text}"`
                      }
                    ],
                    max_tokens: 200
                  })
                })
                
                if (!response.ok) {
                  throw new Error(`OpenAI API error: ${response.status}`)
                }
                
                const data = await response.json()
                result = data.choices[0].message.content
              } catch (error) {
                result = `Error analyzing text: ${error.message}`
              }
            }
            break
            
          case 'seo-writer':
            if (!inputs.apiKey) {
              result = 'Please provide your OpenAI API key for SEO blog writing.'
            } else if (!inputs.topic) {
              result = 'Please provide a blog topic.'
            } else {
              try {
                const keywords = inputs.keywords || inputs.topic
                const length = inputs.length || 'Medium (1000 words)'
                const tone = inputs.tone || 'Professional'
                
                const response = await fetch('https://api.openai.com/v1/chat/completions', {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${inputs.apiKey}`,
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    model: "gpt-3.5-turbo",
                    messages: [
                      {
                        role: "system",
                        content: `You are an expert SEO content writer. Write a ${length} blog post about "${inputs.topic}" in a ${tone} tone. Include these keywords naturally: ${keywords}. Structure with H1, H2, H3 headers, include meta description, and optimize for search engines.`
                      },
                      {
                        role: "user",
                        content: `Write an SEO-optimized blog post about: ${inputs.topic}. Target keywords: ${keywords}. Length: ${length}. Tone: ${tone}`
                      }
                    ],
                    max_tokens: 1500
                  })
                })
                
                if (!response.ok) {
                  throw new Error(`OpenAI API error: ${response.status}`)
                }
                
                const data = await response.json()
                result = data.choices[0].message.content
              } catch (error) {
                result = `Error generating SEO blog post: ${error.message}`
              }
            }
            break
            
          case 'pdf-explainer':
            if (!inputs.apiKey) {
              result = 'Please provide your OpenAI API key for PDF analysis.'
            } else if (!inputs.pdfText) {
              result = 'Please provide the PDF content (copy and paste text from your PDF).'
            } else {
              try {
                const task = inputs.task || 'Summary'
                let systemPrompt = ''
                
                switch (task) {
                  case 'Summary':
                    systemPrompt = 'Provide a clear, concise summary of the document content.'
                    break
                  case 'Key Points':
                    systemPrompt = 'Extract and list the key points from the document in bullet format.'
                    break
                  case 'Q&A':
                    systemPrompt = 'Create relevant questions and answers based on the document content.'
                    break
                  case 'Explanation':
                    systemPrompt = 'Explain the document content in simple, easy-to-understand terms.'
                    break
                  case 'Action Items':
                    systemPrompt = 'Identify and list any action items, tasks, or next steps mentioned in the document.'
                    break
                }
                
                const response = await fetch('https://api.openai.com/v1/chat/completions', {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${inputs.apiKey}`,
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    model: "gpt-3.5-turbo",
                    messages: [
                      {
                        role: "system",
                        content: systemPrompt
                      },
                      {
                        role: "user",
                        content: `Please analyze this document: "${inputs.pdfText}"`
                      }
                    ],
                    max_tokens: 800
                  })
                })
                
                if (!response.ok) {
                  throw new Error(`OpenAI API error: ${response.status}`)
                }
                
                const data = await response.json()
                result = data.choices[0].message.content
              } catch (error) {
                result = `Error analyzing PDF: ${error.message}`
              }
            }
            break
            
          case 'fine-print-checker':
            if (!inputs.apiKey) {
              result = 'Please provide your OpenAI API key for contract analysis.'
            } else if (!inputs.document) {
              result = 'Please provide the contract or policy text to analyze.'
            } else {
              try {
                const focus = inputs.focus || 'All Issues'
                const response = await fetch('https://api.openai.com/v1/chat/completions', {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${inputs.apiKey}`,
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    model: "gpt-3.5-turbo",
                    messages: [
                      {
                        role: "system",
                        content: `You are a legal contract analyzer. Review the document and identify potential issues, focusing on: ${focus}. Highlight concerning clauses, hidden fees, unusual terms, and potential risks. Provide clear explanations in plain English.`
                      },
                      {
                        role: "user",
                        content: `Please analyze this contract/policy for potential issues (focus: ${focus}): "${inputs.document}"`
                      }
                    ],
                    max_tokens: 800
                  })
                })
                
                if (!response.ok) {
                  throw new Error(`OpenAI API error: ${response.status}`)
                }
                
                const data = await response.json()
                result = data.choices[0].message.content
              } catch (error) {
                result = `Error analyzing contract: ${error.message}`
              }
            }
            break
            
          case 'clara-coach':
            if (!inputs.apiKey) {
              result = 'Please provide your OpenAI API key so Clara can help you.'
            } else if (!inputs.situation) {
              result = 'Please tell Clara about your current situation so she can provide personalized guidance.'
            } else {
              try {
                const mood = inputs.mood || 'Neutral'
                const goal = inputs.goal || 'General guidance'
                
                const response = await fetch('https://api.openai.com/v1/chat/completions', {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${inputs.apiKey}`,
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    model: "gpt-3.5-turbo",
                    messages: [
                      {
                        role: "system",
                        content: `You are Clara, a warm, empathetic personal growth coach. You provide thoughtful, encouraging advice while being realistic and practical. The person is feeling ${mood} and needs help with ${goal}. Be supportive, ask insightful questions, and provide actionable advice. Keep responses conversational and caring.`
                      },
                      {
                        role: "user",
                        content: `Hi Clara! I'm feeling ${mood} right now. Here's my situation: ${inputs.situation}. I need help with ${goal}. Can you guide me?`
                      }
                    ],
                    max_tokens: 400
                  })
                })
                
                if (!response.ok) {
                  throw new Error(`OpenAI API error: ${response.status}`)
                }
                
                const data = await response.json()
                result = `💝 Clara says:\n\n${data.choices[0].message.content}\n\n---\n❤️ Remember: You've got this! Clara is here whenever you need support.`
              } catch (error) {
                result = `Clara is having trouble connecting right now: ${error.message}\n\nBut Clara wants you to know: Whatever you're going through, you're stronger than you think! 💪✨`
              }
            }
            break
            
          case 'text-summarizer':
            if (!inputs.text || inputs.text.length < 50) {
              result = 'Please provide a longer text to summarize (at least 50 characters).'
            } else {
              const sentences = inputs.text.split(/[.!?]+/).filter(s => s.trim().length > 10)
              const sentenceCount = Math.min(3, Math.max(1, Math.floor(sentences.length / 3)))
              const topSentences = sentences.slice(0, sentenceCount)
              result = `Summary:\n\n${topSentences.join('. ')}.`
            }
            break
            
          case 'content-writer':
            if (!inputs.topic) {
              result = 'Please provide a topic to write about.'
            } else {
              result = `# ${inputs.topic}

## Introduction
This piece explores the fascinating topic of ${inputs.topic}. In today's rapidly evolving landscape, understanding ${inputs.topic} has become increasingly important.

## Key Points
- ${inputs.topic} offers numerous benefits and opportunities
- Understanding the fundamentals is crucial for success
- Implementation requires careful planning and consideration
- Results can be measured through various metrics

## Practical Applications
The real-world applications of ${inputs.topic} are vast and varied. From personal development to business strategy, these principles can be applied in numerous scenarios.

## Conclusion
In conclusion, ${inputs.topic} represents an important area of focus that deserves our attention and understanding.

---
Generated with ${inputs.tone || 'professional'} tone in ${inputs.length || 'medium'} format.`
            }
            break
            
          case 'code-generator':
            if (!inputs.language || !inputs.description) {
              result = 'Please provide both programming language and description.'
            } else {
              const funcName = inputs.description.toLowerCase().replace(/\s+/g, '_')
              if (inputs.language === 'Python') {
                result = `def ${funcName}():
    """
    ${inputs.description}
    """
    # TODO: Implement the logic for ${inputs.description}
    pass
    
# Example usage:
# result = ${funcName}()
# print(result)`
              } else if (inputs.language === 'JavaScript') {
                result = `function ${funcName.replace(/_/g, '')}() {
    /**
     * ${inputs.description}
     */
    // TODO: Implement the logic for ${inputs.description}
    return null;
}

// Example usage:
// const result = ${funcName.replace(/_/g, '')}();
// console.log(result);`
              } else {
                result = `// ${inputs.language} code for: ${inputs.description}
// TODO: Implement the logic for ${inputs.description}`
              }
            }
            break
            
          case 'email-writer':
            if (!inputs.purpose || !inputs.recipient) {
              result = 'Please provide both purpose and recipient information.'
            } else {
              result = `Subject: ${inputs.purpose} - ${inputs.context || 'Follow-up'}

Dear ${inputs.recipient},

I hope this email finds you well. I am writing regarding ${inputs.context || 'the matter we discussed'}.

${inputs.purpose === 'Business' ? 'I would appreciate the opportunity to discuss this matter further at your convenience.' : 
  inputs.purpose === 'Follow-up' ? 'As discussed, I wanted to follow up on our recent conversation.' :
  'I would be grateful if you could help me with this matter.'}

Please let me know if you need any additional information or would like to schedule a time to discuss this further.

Thank you for your time and consideration.

Best regards,
[Your Name]

---
Email generated for ${inputs.purpose} purpose to ${inputs.recipient}`
            }
            break
            
          case 'social-media':
            if (!inputs.platform || !inputs.topic) {
              result = 'Please provide both platform and topic.'
            } else {
              const hashtag = inputs.topic.replace(/\s+/g, '')
              if (inputs.platform === 'Twitter') {
                result = `🚀 Exploring ${inputs.topic} and its impact on innovation! The possibilities are endless when we embrace new technologies and ideas. #${hashtag} #Innovation

---
Generated for ${inputs.platform} in ${inputs.style || 'professional'} style`
              } else {
                result = `The evolution of ${inputs.topic} continues to reshape our industry in fascinating ways.

Key insights:
• Innovation drives transformation
• Collaboration amplifies results
• Continuous learning is essential

What's your experience with ${inputs.topic}?

#${hashtag} #Innovation #Leadership

---
Generated for ${inputs.platform} in ${inputs.style || 'professional'} style`
              }
            }
            break
            
          case 'translator':
            if (!inputs.text || !inputs.fromLang || !inputs.toLang) {
              result = 'Please provide text, source language, and target language.'
            } else {
              result = `Original text (${inputs.fromLang}): ${inputs.text}

Translated to ${inputs.toLang}: [Demo translation - integrate with Google Translate API for actual translations]

---
Translation: ${inputs.fromLang} → ${inputs.toLang}
Note: This is a demo. For production use, integrate with translation APIs.`
            }
            break
            
          case 'data-analyzer':
            if (!inputs.data || !inputs.question) {
              result = 'Please provide both data and your analysis question.'
            } else {
              const lines = inputs.data.split('\n').filter(line => line.trim())
              const headers = lines[0]?.split(',') || []
              const rows = lines.slice(1)
              result = `Data Analysis Results:

Dataset Overview:
• Total rows: ${rows.length}
• Columns: ${headers.length} (${headers.join(', ')})
• Question: ${inputs.question}

Quick Insights:
• The dataset contains ${rows.length} records
• Key columns identified: ${headers.slice(0, 3).join(', ')}
• Data appears to be in CSV format

Recommended Next Steps:
1. Clean and validate the data
2. Perform statistical analysis
3. Create visualizations
4. Identify patterns and trends

---
Analysis for: ${inputs.question}`
            }
            break
            
          case 'image-generator':
            if (!inputs.apiKey) {
              result = 'Please provide your OpenAI API key to generate images.'
            } else if (!inputs.prompt) {
              result = 'Please provide a description for the image you want to generate.'
            } else {
              try {
                const response = await fetch('https://api.openai.com/v1/images/generations', {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${inputs.apiKey}`,
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    model: "dall-e-3",
                    prompt: inputs.prompt,
                    n: 1,
                    size: "1024x1024"
                  })
                })
                
                if (!response.ok) {
                  throw new Error(`OpenAI API error: ${response.status}`)
                }
                
                const data = await response.json()
                result = `Image generated successfully!\n\nImage URL: ${data.data[0].url}\n\nPrompt used: ${inputs.prompt}`
              } catch (error) {
                result = `Error generating image: ${error.message}`
              }
            }
            break
            
          default:
            result = 'Unknown agent type. Please select a valid agent.'
        }
        
        return handleCORS(NextResponse.json({
          success: true,
          result: result
        }))
        
      } catch (error) {
        console.error('Error running agent:', error)
        return handleCORS(NextResponse.json(
          { error: `Failed to run agent: ${error.message}` },
          { status: 500 }
        ))
      }
    }

    // Status endpoints - POST /api/status
    if (route === '/status' && method === 'POST') {
      const body = await request.json()
      
      if (!body.client_name) {
        return handleCORS(NextResponse.json(
          { error: "client_name is required" }, 
          { status: 400 }
        ))
      }

      const statusObj = {
        id: uuidv4(),
        client_name: body.client_name,
        timestamp: new Date()
      }

      await db.collection('status_checks').insertOne(statusObj)
      return handleCORS(NextResponse.json(statusObj))
    }

    // Status endpoints - GET /api/status
    if (route === '/status' && method === 'GET') {
      const statusChecks = await db.collection('status_checks')
        .find({})
        .limit(1000)
        .toArray()

      // Remove MongoDB's _id field from response
      const cleanedStatusChecks = statusChecks.map(({ _id, ...rest }) => rest)
      
      return handleCORS(NextResponse.json(cleanedStatusChecks))
    }

    // Cricket API endpoints
    if (route.startsWith('/cricket/')) {
      const cricketRoute = route.replace('/cricket/', '')
      
      // Live Matches endpoint - GET /api/cricket/live-matches
      if (cricketRoute === 'live-matches' && method === 'GET') {
        try {
          const liveMatches = await scrapeCricbuzzLiveMatches()
          
          return handleCORS(NextResponse.json({
            success: true,
            matches: liveMatches,
            lastUpdated: new Date().toISOString()
          }))
        } catch (error) {
          console.error('Error fetching live matches:', error)
          return handleCORS(NextResponse.json(
            { success: false, error: 'Failed to fetch live matches' },
            { status: 500 }
          ))
        }
      }
      
      // Recent Matches endpoint - GET /api/cricket/recent-matches
      if (cricketRoute === 'recent-matches' && method === 'GET') {
        try {
          const recentMatches = await scrapeCricbuzzRecentMatches()
          
          return handleCORS(NextResponse.json({
            success: true,
            matches: recentMatches,
            lastUpdated: new Date().toISOString()
          }))
        } catch (error) {
          console.error('Error fetching recent matches:', error)
          return handleCORS(NextResponse.json(
            { success: false, error: 'Failed to fetch recent matches' },
            { status: 500 }
          ))
        }
      }
      
      // Upcoming Matches endpoint - GET /api/cricket/upcoming-matches
      if (cricketRoute === 'upcoming-matches' && method === 'GET') {
        try {
          const upcomingMatches = await scrapeCricbuzzUpcomingMatches()
          
          return handleCORS(NextResponse.json({
            success: true,
            matches: upcomingMatches,
            lastUpdated: new Date().toISOString()
          }))
        } catch (error) {
          console.error('Error fetching upcoming matches:', error)
          return handleCORS(NextResponse.json(
            { success: false, error: 'Failed to fetch upcoming matches' },
            { status: 500 }
          ))
        }
      }
      
      // Player Stats endpoint - GET /api/cricket/player-stats
      if (cricketRoute === 'player-stats' && method === 'GET') {
        try {
          const playerStats = await scrapeCricbuzzPlayerStats()
          
          return handleCORS(NextResponse.json({
            success: true,
            stats: playerStats,
            lastUpdated: new Date().toISOString()
          }))
        } catch (error) {
          console.error('Error fetching player stats:', error)
          return handleCORS(NextResponse.json(
            { success: false, error: 'Failed to fetch player stats' },
            { status: 500 }
          ))
        }
      }
      
      // Match Details endpoint - GET /api/cricket/match-details?id=...
      if (cricketRoute === 'match-details' && method === 'GET') {
        try {
          const url = new URL(request.url)
          const matchId = url.searchParams.get('id')
          
          if (!matchId) {
            return handleCORS(NextResponse.json(
              { success: false, error: 'Match ID is required' },
              { status: 400 }
            ))
          }
          
          const matchDetails = await scrapeCricbuzzMatchDetails(matchId)
          
          return handleCORS(NextResponse.json({
            success: true,
            match: matchDetails,
            lastUpdated: new Date().toISOString()
          }))
        } catch (error) {
          console.error('Error fetching match details:', error)
          return handleCORS(NextResponse.json(
            { success: false, error: 'Failed to fetch match details' },
            { status: 500 }
          ))
        }
      }
    }

    // Workflow Builder generation endpoint - POST /api/workflow-builder/generate
    if (route === '/workflow-builder/generate' && method === 'POST') {
      try {
        const body = await request.json()
        const { name, description, provider, apiKey, automationDescription, platform, templateId } = body
        
        if (!name || !apiKey || !automationDescription || !provider || !platform) {
          return handleCORS(NextResponse.json(
            { error: 'Name, API key, automation description, provider, and platform are required' },
            { status: 400 }
          ))
        }
        
        // Validate provider
        const validProviders = ['openai', 'claude', 'gemini']
        if (!validProviders.includes(provider)) {
          return handleCORS(NextResponse.json(
            { error: 'Invalid provider. Must be one of: openai, claude, gemini' },
            { status: 400 }
          ))
        }
        
        // Validate platform
        const validPlatforms = ['n8n', 'make']
        if (!validPlatforms.includes(platform)) {
          return handleCORS(NextResponse.json(
            { error: 'Invalid platform. Must be one of: n8n, make' },
            { status: 400 }
          ))
        }
        
        const systemPrompt = `You are an expert automation workflow designer for ${platform === 'n8n' ? 'n8n' : 'Make.com'}. Generate a complete, production-ready workflow JSON that can be directly imported into ${platform === 'n8n' ? 'n8n' : 'Make.com'}.

CRITICAL REQUIREMENTS:
1. Generate VALID ${platform === 'n8n' ? 'n8n' : 'Make.com'} workflow JSON format
2. Include all necessary nodes, connections, and configurations
3. Use realistic node IDs and proper connections
4. Include error handling and proper data flow
5. Add helpful comments and descriptions
6. Make it production-ready with proper settings

${platform === 'n8n' ? `
N8N WORKFLOW STRUCTURE:
- Use proper n8n node types (HTTP Request, Email, Database, etc.)
- Include connections array with proper node linking
- Use realistic node IDs (UUIDs)
- Include proper node settings and parameters
- Add credentials placeholders where needed
- Include proper error handling nodes
` : `
MAKE.COM WORKFLOW STRUCTURE:
- Use proper Make.com module structure
- Include scenarios with modules and routes
- Use realistic module IDs
- Include proper module settings and mapping
- Add webhooks, apps, and connections
- Include error handling and filters
`}

WORKFLOW GENERATION RULES:
- Create a logical flow based on the automation description
- Include appropriate triggers (webhooks, schedules, etc.)
- Add data transformation nodes where needed
- Include proper error handling
- Add notifications and logging
- Make it scalable and maintainable

IMPORTANT: Return ONLY the JSON workflow, no explanations or markdown formatting.`
        
        let generatedWorkflow = ''
        let visualPreview = ''
        
        // Generate workflow based on provider
        if (provider === 'openai') {
          const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'gpt-4',
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: `Create a ${platform} workflow for: ${automationDescription}${description ? `\n\nAdditional context: ${description}` : ''}` }
              ],
              max_tokens: 3000,
              temperature: 0.3,
            }),
          })
          
          if (!response.ok) {
            const error = await response.json()
            throw new Error(error.error?.message || 'OpenAI API error')
          }
          
          const data = await response.json()
          generatedWorkflow = data.choices[0].message.content
          
        } else if (provider === 'claude') {
          const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
              'x-api-key': apiKey,
              'Content-Type': 'application/json',
              'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify({
              model: 'claude-3-5-sonnet-20241022',
              max_tokens: 3000,
              system: systemPrompt,
              messages: [
                { role: 'user', content: `Create a ${platform} workflow for: ${automationDescription}${description ? `\n\nAdditional context: ${description}` : ''}` }
              ],
            }),
          })
          
          if (!response.ok) {
            const error = await response.json()
            throw new Error(error.error?.message || 'Claude API error')
          }
          
          const data = await response.json()
          generatedWorkflow = data.content[0].text
          
        } else if (provider === 'gemini') {
          const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    { text: `${systemPrompt}\n\nCreate a ${platform} workflow for: ${automationDescription}${description ? `\n\nAdditional context: ${description}` : ''}` }
                  ]
                }
              ],
              generationConfig: {
                temperature: 0.3,
                maxOutputTokens: 3000,
              },
            }),
          })
          
          if (!response.ok) {
            const error = await response.json()
            throw new Error(error.error?.message || 'Gemini API error')
          }
          
          const data = await response.json()
          generatedWorkflow = data.candidates[0].content.parts[0].text
        }
        
        // Clean the generated workflow
        let cleanWorkflow = generatedWorkflow.trim()
        
        // Remove markdown code blocks
        cleanWorkflow = cleanWorkflow.replace(/^```(?:json|JSON)?\n?/gm, '')
        cleanWorkflow = cleanWorkflow.replace(/\n?```$/gm, '')
        
        // Remove any explanatory text before JSON
        const jsonStart = cleanWorkflow.indexOf('{')
        if (jsonStart > 0) {
          cleanWorkflow = cleanWorkflow.substring(jsonStart)
        }
        
        // Try to parse and validate JSON
        let workflowJson
        try {
          workflowJson = JSON.parse(cleanWorkflow)
        } catch (parseError) {
          // If JSON parsing fails, create a basic template
          workflowJson = createBasicWorkflowTemplate(platform, name, automationDescription)
        }
        
        // Generate visual preview
        visualPreview = generateVisualPreview(workflowJson, platform)
        
        // Save generated workflow to database
        const workflowRecord = {
          id: uuidv4(),
          name: name,
          description: description || '',
          platform: platform,
          provider: provider,
          automation_description: automationDescription,
          template_id: templateId || null,
          workflow_json: workflowJson,
          visual_preview: visualPreview,
          created_at: new Date(),
          updated_at: new Date()
        }
        
        await db.collection('generated_workflows').insertOne(workflowRecord)
        
        return handleCORS(NextResponse.json({
          success: true,
          workflow: workflowJson,
          visualPreview: visualPreview,
          nodeCount: countNodes(workflowJson, platform),
          metadata: {
            platform: platform,
            provider: provider,
            generated_at: new Date().toISOString(),
            workflow_id: workflowRecord.id
          }
        }))
        
      } catch (error) {
        console.error('Error generating workflow:', error)
        return handleCORS(NextResponse.json(
          { error: error.message || 'Failed to generate workflow' },
          { status: 500 }
        ))
      }
    }

    // Route not found
    return handleCORS(NextResponse.json(
      { error: `Route ${route} not found` }, 
      { status: 404 }
    ))

  } catch (error) {
    console.error('API Error:', error)
    return handleCORS(NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    ))
  }
}

// Export all HTTP methods
export const GET = handleRoute
export const POST = handleRoute
export const PUT = handleRoute
export const DELETE = handleRoute
export const PATCH = handleRoute