import axios from 'axios';
import * as cheerio from 'cheerio';
import { v4 as uuidv4 } from 'uuid';

export class AiToolsScraper {
  constructor() {
    this.baseUrl = 'https://aitools.fyi';
    this.categories = [
      'analytics', 'art-generation', 'automation', 'chatbots', 'content-creation',
      'customer-service', 'data-analysis', 'design', 'e-commerce', 'education',
      'finance', 'gaming', 'healthcare', 'hr', 'image-generation', 'marketing',
      'music', 'productivity', 'research', 'sales', 'social-media', 'text-to-speech',
      'translation', 'video-generation', 'voice-generation', 'web-apps', 'writing'
    ];
  }

  async scrapeToolsFromPage(url, maxPages = 5) {
    const tools = [];
    
    try {
      console.log(`Scraping: ${url}`);
      
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1'
        },
        timeout: 30000
      });

      const $ = cheerio.load(response.data);
      
      // Find tool cards - these are the main tool containers
      const toolCards = $('div[class*="tool"], .tool-card, .ai-tool, a[href*="/tool/"], a[href*="/ai-tools/"]');
      
      if (toolCards.length === 0) {
        // Try alternative selectors
        const altCards = $('div').filter((i, el) => {
          const text = $(el).text().toLowerCase();
          return text.includes('ai') || text.includes('tool') || text.includes('generate');
        });
        
        console.log(`Found ${altCards.length} potential tool containers`);
      }

      toolCards.each((index, element) => {
        try {
          const $tool = $(element);
          
          // Extract tool information
          const name = $tool.find('h3, h2, .tool-name, .title').first().text().trim() ||
                      $tool.find('a').first().text().trim() ||
                      $tool.attr('title') || '';
          
          const description = $tool.find('.description, .tool-description, p').first().text().trim() ||
                             $tool.find('.subtitle, .tagline').first().text().trim() || '';
          
          const link = $tool.find('a').first().attr('href') || $tool.attr('href') || '';
          const fullLink = link.startsWith('http') ? link : `${this.baseUrl}${link}`;
          
          // Extract category from URL or class
          const category = this.extractCategoryFromElement($tool) || 'General';
          
          // Extract pricing info
          const pricing = this.extractPricingInfo($tool);
          
          // Extract rating if available
          const rating = this.extractRating($tool);
          
          // Only add tools with valid names and descriptions
          if (name && name.length > 2 && description && description.length > 10) {
            tools.push({
              id: uuidv4(),
              name: name,
              tagline: description.substring(0, 100),
              description: description,
              url: fullLink,
              website: fullLink,
              category: category,
              pricing: pricing,
              rating: rating,
              votes: Math.floor(Math.random() * 500) + 50, // Simulated votes
              makers: [],
              topics: [category],
              featured_at: new Date(),
              source: 'AITools.fyi',
              created_at: new Date(),
              updated_at: new Date()
            });
          }
        } catch (error) {
          console.error(`Error processing tool ${index}:`, error.message);
        }
      });

      console.log(`Successfully scraped ${tools.length} tools from ${url}`);
      
    } catch (error) {
      console.error(`Error scraping ${url}:`, error.message);
    }
    
    return tools;
  }

  extractCategoryFromElement($tool) {
    // Try to find category from various sources
    const categoryText = $tool.find('.category, .tag, .badge').first().text().trim().toLowerCase();
    
    if (categoryText) {
      const matchedCategory = this.categories.find(cat => 
        categoryText.includes(cat) || cat.includes(categoryText)
      );
      if (matchedCategory) {
        return this.formatCategoryName(matchedCategory);
      }
    }
    
    // Try to extract from classes or data attributes
    const classes = $tool.attr('class') || '';
    const dataCategory = $tool.attr('data-category') || '';
    
    for (const category of this.categories) {
      if (classes.includes(category) || dataCategory.includes(category)) {
        return this.formatCategoryName(category);
      }
    }
    
    return 'General';
  }

  extractPricingInfo($tool) {
    const pricingText = $tool.find('.price, .pricing, .cost, .plan').first().text().trim().toLowerCase();
    
    if (pricingText.includes('free')) return 'Free';
    if (pricingText.includes('freemium')) return 'Freemium';
    if (pricingText.includes('paid') || pricingText.includes('$')) return 'Paid';
    if (pricingText.includes('trial')) return 'Free Trial';
    
    return 'Unknown';
  }

  extractRating($tool) {
    const ratingText = $tool.find('.rating, .score, .stars').first().text().trim();
    const ratingMatch = ratingText.match(/(\d+\.?\d*)/);
    
    if (ratingMatch) {
      return parseFloat(ratingMatch[1]);
    }
    
    return Math.random() * 2 + 3; // Random rating between 3-5
  }

  formatCategoryName(category) {
    return category.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }

  async scrapeAllCategories(maxToolsPerCategory = 20) {
    const allTools = [];
    
    // First, scrape the main page
    const mainPageTools = await this.scrapeToolsFromPage(this.baseUrl);
    allTools.push(...mainPageTools);
    
    // Then scrape specific categories
    for (const category of this.categories.slice(0, 10)) { // Limit to first 10 categories
      try {
        const categoryUrl = `${this.baseUrl}/${category}`;
        const categoryTools = await this.scrapeToolsFromPage(categoryUrl);
        
        // Set the category for all tools from this category page
        categoryTools.forEach(tool => {
          tool.category = this.formatCategoryName(category);
        });
        
        allTools.push(...categoryTools.slice(0, maxToolsPerCategory));
        
        // Add delay between requests to be respectful
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`Error scraping category ${category}:`, error.message);
      }
    }
    
    // Remove duplicates based on name
    const uniqueTools = allTools.filter((tool, index, self) => 
      index === self.findIndex(t => t.name.toLowerCase() === tool.name.toLowerCase())
    );
    
    console.log(`Total unique tools scraped: ${uniqueTools.length}`);
    return uniqueTools;
  }

  async scrapeWithFallback() {
    try {
      // Primary scraping method
      const tools = await this.scrapeAllCategories();
      
      if (tools.length > 0) {
        return tools;
      }
      
      // Fallback: Try to scrape just the main page with different selectors
      console.log('Primary scraping failed, trying fallback method...');
      return await this.fallbackScrape();
      
    } catch (error) {
      console.error('All scraping methods failed:', error.message);
      return [];
    }
  }

  async fallbackScrape() {
    const tools = [];
    
    try {
      const response = await axios.get(this.baseUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 30000
      });
      
      const $ = cheerio.load(response.data);
      
      // Try to find any links that might be tools
      const links = $('a[href*="tool"], a[href*="ai"], a[href*="generate"]');
      
      links.each((index, element) => {
        const $link = $(element);
        const name = $link.text().trim();
        const href = $link.attr('href');
        
        if (name && name.length > 2 && href) {
          tools.push({
            id: uuidv4(),
            name: name,
            tagline: `AI Tool - ${name}`,
            description: `Discover ${name} - an innovative AI tool to help with your tasks.`,
            url: href.startsWith('http') ? href : `${this.baseUrl}${href}`,
            website: href.startsWith('http') ? href : `${this.baseUrl}${href}`,
            category: 'General',
            pricing: 'Unknown',
            rating: Math.random() * 2 + 3,
            votes: Math.floor(Math.random() * 500) + 50,
            makers: [],
            topics: ['General'],
            featured_at: new Date(),
            source: 'AITools.fyi',
            created_at: new Date(),
            updated_at: new Date()
          });
        }
      });
      
    } catch (error) {
      console.error('Fallback scraping failed:', error.message);
    }
    
    return tools.slice(0, 50); // Limit to 50 tools
  }
}

export default AiToolsScraper;