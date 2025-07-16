const cheerio = require('cheerio')

async function testCricbuzzScraping() {
  try {
    console.log('Testing Cricbuzz scraping...')
    
    const response = await fetch('https://www.cricbuzz.com/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    })
    
    if (!response.ok) {
      console.error('Failed to fetch Cricbuzz:', response.status)
      return
    }
    
    const html = await response.text()
    console.log('✅ Cricbuzz fetched successfully, HTML length:', html.length)
    
    const $ = cheerio.load(html)
    
    // Look for any cricket matches in the text
    const bodyText = $('body').text()
    
    // Check for cricket team patterns
    const teamPatterns = [
      /([A-Z]{3,4})\s+vs\s+([A-Z]{3,4})/g,
      /(India|England|Australia|Pakistan|Bangladesh|Sri Lanka|South Africa|New Zealand|West Indies|Zimbabwe)\s+vs\s+(India|England|Australia|Pakistan|Bangladesh|Sri Lanka|South Africa|New Zealand|West Indies|Zimbabwe)/gi
    ]
    
    let foundMatches = []
    
    for (const pattern of teamPatterns) {
      const matches = [...bodyText.matchAll(pattern)]
      for (const match of matches) {
        if (foundMatches.length >= 5) break
        
        const team1 = match[1]?.trim()
        const team2 = match[2]?.trim()
        
        if (team1 && team2 && team1 !== team2) {
          foundMatches.push({
            team1: team1,
            team2: team2,
            pattern: pattern.source.substring(0, 30) + '...'
          })
        }
      }
    }
    
    console.log('✅ Found cricket matches:', foundMatches.length)
    foundMatches.forEach((match, index) => {
      console.log(`${index + 1}. ${match.team1} vs ${match.team2} (Pattern: ${match.pattern})`)
    })
    
  } catch (error) {
    console.error('Error in Cricbuzz scraping:', error)
  }
}

testCricbuzzScraping()