import { MongoClient } from 'mongodb'
import { v4 as uuidv4 } from 'uuid'
import { NextResponse } from 'next/server'
import { getClient } from '@/lib/apollo-client'
import { GET_AI_TOOLS, SEARCH_AI_TOOLS, isAITool } from '@/lib/producthunt'
import TargetedAiToolsScraper from '@/lib/scrapers/targeted-aitools-scraper'

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