const fetch = require('node-fetch')
const cheerio = require('cheerio')

async function testAitoolsFyiScraping() {
  try {
    console.log('Testing aitools.fyi scraping...')
    
    const response = await fetch('https://aitools.fyi/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    })
    
    if (!response.ok) {
      console.error('Failed to fetch aitools.fyi:', response.status)
      return
    }
    
    const html = await response.text()
    console.log('✅ aitools.fyi fetched successfully, HTML length:', html.length)
    
    const $ = cheerio.load(html)
    const tools = []
    
    // Look for various selectors that might contain tools
    const selectors = [
      'h1', 'h2', 'h3', 'h4', 
      '.title', '.name', '.tool-name',
      '.card-title', '.item-title',
      '[class*="title"]', '[class*="name"]'
    ]
    
    for (const selector of selectors) {
      $(selector).each((index, element) => {
        if (tools.length >= 10) return false
        
        const $elem = $(element)
        const name = $elem.text().trim()
        
        if (name && name.length > 2 && name.length < 100 && 
            !name.toLowerCase().includes('aitools') &&
            !name.toLowerCase().includes('browse') &&
            !name.toLowerCase().includes('submit')) {
          
          const parent = $elem.parent()
          const description = parent.find('p, .description, .tagline').first().text().trim()
          
          tools.push({
            name: name,
            description: description.substring(0, 150),
            selector: selector
          })
        }
      })
      
      if (tools.length > 0) {
        console.log(`Found ${tools.length} tools with selector: ${selector}`)
        break
      }
    }
    
    console.log('✅ Found AI tools:')
    tools.forEach((tool, index) => {
      console.log(`${index + 1}. ${tool.name} - ${tool.description}`)
    })
    
  } catch (error) {
    console.error('Error testing aitools.fyi scraping:', error)
  }
}

testAitoolsFyiScraping()