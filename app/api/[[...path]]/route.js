import { MongoClient } from 'mongodb'
import { v4 as uuidv4 } from 'uuid'
import { NextResponse } from 'next/server'
import { getClient } from '@/lib/apollo-client'
import { GET_AI_TOOLS, SEARCH_AI_TOOLS, isAITool } from '@/lib/producthunt'
import AiToolsScraper from '@/lib/scrapers/aitools-scraper'

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

    // AI Tools endpoints - GET /api/ai-tools
    if (route === '/ai-tools' && method === 'GET') {
      const searchParams = new URL(request.url).searchParams;
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '12');
      const search = searchParams.get('search') || '';
      const category = searchParams.get('category') || '';
      const source = searchParams.get('source') || 'all';
      const sort = searchParams.get('sort') || 'featured_at';
      
      const skip = (page - 1) * limit;
      
      // Build query
      let query = {};
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { tagline: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }
      if (category && category !== 'all') {
        query.category = { $regex: category, $options: 'i' };
      }
      if (source !== 'all') {
        query.source = source;
      }
      
      // Build sort object
      let sortObj = {};
      switch (sort) {
        case 'votes':
          sortObj = { votes: -1 };
          break;
        case 'name':
          sortObj = { name: 1 };
          break;
        case 'rating':
          sortObj = { rating: -1 };
          break;
        default:
          sortObj = { featured_at: -1 };
      }
      
      const aiTools = await db.collection('ai_tools')
        .find(query)
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .toArray();
      
      const total = await db.collection('ai_tools').countDocuments(query);
      
      // Remove MongoDB's _id field from response
      const cleanedTools = aiTools.map(({ _id, ...rest }) => rest);
      
      return handleCORS(NextResponse.json({
        tools: cleanedTools,
        pagination: {
          page,
          limit,
          total,
          hasMore: skip + limit < total
        }
      }));
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

    // AI Tools sync endpoint - POST /api/ai-tools/sync-aitools (AITools.fyi)
    if (route === '/ai-tools/sync-aitools' && method === 'POST') {
      try {
        const scraper = new AiToolsScraper();
        const scrapedTools = await scraper.scrapeWithFallback();
        
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
          message: `Successfully synced ${syncedCount} new AI tools from AITools.fyi`,
          synced: syncedCount,
          total_found: scrapedTools.length
        }));
        
      } catch (error) {
        console.error('Error syncing AI tools from AITools.fyi:', error);
        return handleCORS(NextResponse.json(
          { error: 'Failed to sync AI tools from AITools.fyi' },
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

    // AI Agents run endpoint - POST /api/agents/run
    if (route === '/agents/run' && method === 'POST') {
      try {
        const body = await request.json()
        const { agentId, inputs } = body
        
        let result = ''
        
        switch (agentId) {
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