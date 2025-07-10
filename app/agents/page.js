'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  Bot, 
  Sparkles, 
  Image, 
  FileText, 
  Code, 
  Mail, 
  MessageSquare, 
  Globe, 
  BarChart3,
  Wand2,
  Loader2,
  Copy,
  Check,
  Play,
  Settings,
  TrendingUp,
  DollarSign,
  Heart,
  Eye,
  PenTool,
  FileCheck,
  User,
  Send,
  BookOpen,
  Shield,
  Brain,
  Target,
  Briefcase,
  Search,
  Zap,
  Database,
  Clock,
  Users,
  ChartBar,
  Monitor
} from 'lucide-react'

export default function AgentsPage() {
  const [selectedAgent, setSelectedAgent] = useState(null)
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const agents = [
    // Advanced AI Assistants
    {
      id: 'business-plan-generator',
      name: 'Business Plan Generator',
      description: 'Create comprehensive business plans with financial projections',
      icon: Briefcase,
      color: 'from-emerald-500 to-green-600',
      category: 'Business',
      inputs: [
        { name: 'apiKey', label: 'OpenAI API Key', type: 'password', placeholder: 'sk-...' },
        { name: 'businessIdea', label: 'Business Idea', type: 'textarea', placeholder: 'Describe your business idea...' },
        { name: 'industry', label: 'Industry', type: 'select', options: ['Technology', 'Healthcare', 'E-commerce', 'Education', 'Finance', 'Real Estate', 'Food & Beverage', 'Other'] },
        { name: 'targetMarket', label: 'Target Market', type: 'input', placeholder: 'Who is your target audience?' },
        { name: 'budget', label: 'Initial Budget', type: 'select', options: ['Under $10K', '$10K-$50K', '$50K-$100K', '$100K-$500K', 'Over $500K'] }
      ],
      apiRequired: true
    },
    {
      id: 'competitor-analysis',
      name: 'Competitor Analysis AI',
      description: 'Analyze competitors and create strategic reports',
      icon: Target,
      color: 'from-red-500 to-pink-600',
      category: 'Business',
      inputs: [
        { name: 'apiKey', label: 'OpenAI API Key', type: 'password', placeholder: 'sk-...' },
        { name: 'company', label: 'Your Company/Product', type: 'input', placeholder: 'Your company name or product' },
        { name: 'competitors', label: 'Competitors', type: 'textarea', placeholder: 'List your main competitors (one per line)' },
        { name: 'analysisType', label: 'Analysis Type', type: 'select', options: ['SWOT Analysis', 'Market Positioning', 'Feature Comparison', 'Pricing Strategy', 'Complete Analysis'] }
      ],
      apiRequired: true
    },
    {
      id: 'meeting-summarizer',
      name: 'Meeting Summarizer Pro',
      description: 'Transform meeting transcripts into actionable summaries',
      icon: Users,
      color: 'from-blue-500 to-cyan-600',
      category: 'Business',
      inputs: [
        { name: 'apiKey', label: 'OpenAI API Key', type: 'password', placeholder: 'sk-...' },
        { name: 'transcript', label: 'Meeting Transcript', type: 'textarea', placeholder: 'Paste your meeting transcript here...' },
        { name: 'meetingType', label: 'Meeting Type', type: 'select', options: ['Team Standup', 'Client Call', 'Board Meeting', 'Project Review', 'Brainstorming', 'All Hands'] },
        { name: 'outputFormat', label: 'Output Format', type: 'select', options: ['Executive Summary', 'Action Items', 'Full Summary', 'Key Decisions'] }
      ],
      apiRequired: true
    },
    {
      id: 'sales-email-sequences',
      name: 'Sales Email Sequences',
      description: 'Generate complete sales email campaigns',
      icon: Mail,
      color: 'from-purple-500 to-indigo-600',
      category: 'Sales',
      inputs: [
        { name: 'apiKey', label: 'OpenAI API Key', type: 'password', placeholder: 'sk-...' },
        { name: 'product', label: 'Product/Service', type: 'input', placeholder: 'What are you selling?' },
        { name: 'targetAudience', label: 'Target Audience', type: 'input', placeholder: 'Who are you targeting?' },
        { name: 'sequenceType', label: 'Sequence Type', type: 'select', options: ['Cold Outreach', 'Lead Nurturing', 'Customer Onboarding', 'Re-engagement', 'Upsell Campaign'] },
        { name: 'emailCount', label: 'Number of Emails', type: 'select', options: ['3 emails', '5 emails', '7 emails', '10 emails'] }
      ],
      apiRequired: true
    },
    {
      id: 'market-research-ai',
      name: 'Market Research AI',
      description: 'Comprehensive market analysis and insights',
      icon: ChartBar,
      color: 'from-orange-500 to-red-600',
      category: 'Research',
      inputs: [
        { name: 'apiKey', label: 'OpenAI API Key', type: 'password', placeholder: 'sk-...' },
        { name: 'market', label: 'Market/Industry', type: 'input', placeholder: 'e.g., AI SaaS tools, Electric vehicles' },
        { name: 'researchType', label: 'Research Type', type: 'select', options: ['Market Size', 'Trends Analysis', 'Customer Segmentation', 'PEST Analysis', 'Complete Research'] },
        { name: 'geography', label: 'Geographic Focus', type: 'select', options: ['Global', 'North America', 'Europe', 'Asia Pacific', 'Specific Country'] },
        { name: 'timeframe', label: 'Time Frame', type: 'select', options: ['Current', '1 Year Forecast', '3 Year Forecast', '5 Year Forecast'] }
      ],
      apiRequired: true
    },
    {
      id: 'user-persona-generator',
      name: 'User Persona Generator',
      description: 'Create detailed user personas for product development',
      icon: User,
      color: 'from-teal-500 to-green-600',
      category: 'Product',
      inputs: [
        { name: 'apiKey', label: 'OpenAI API Key', type: 'password', placeholder: 'sk-...' },
        { name: 'product', label: 'Product/Service', type: 'input', placeholder: 'Describe your product or service' },
        { name: 'industry', label: 'Industry', type: 'select', options: ['B2B Software', 'E-commerce', 'Healthcare', 'Education', 'Finance', 'Gaming', 'Social Media', 'Other'] },
        { name: 'personaCount', label: 'Number of Personas', type: 'select', options: ['1 persona', '2 personas', '3 personas', '5 personas'] },
        { name: 'includeData', label: 'Include', type: 'select', options: ['Basic Info', 'Full Profile', 'Behavioral Insights', 'Pain Points & Goals'] }
      ],
      apiRequired: true
    },
    {
      id: 'financial-projections',
      name: 'Financial Projections AI',
      description: 'Generate detailed financial forecasts and budgets',
      icon: DollarSign,
      color: 'from-green-500 to-emerald-600',
      category: 'Finance',
      inputs: [
        { name: 'apiKey', label: 'OpenAI API Key', type: 'password', placeholder: 'sk-...' },
        { name: 'businessType', label: 'Business Type', type: 'select', options: ['SaaS', 'E-commerce', 'Service Business', 'Manufacturing', 'Retail', 'Consulting', 'Startup', 'Other'] },
        { name: 'revenue', label: 'Current/Expected Monthly Revenue', type: 'select', options: ['$0-$1K', '$1K-$10K', '$10K-$50K', '$50K-$100K', '$100K+', 'Not launched yet'] },
        { name: 'projectionPeriod', label: 'Projection Period', type: 'select', options: ['6 months', '1 year', '2 years', '3 years', '5 years'] },
        { name: 'includeScenarios', label: 'Include Scenarios', type: 'select', options: ['Conservative only', 'Conservative & Optimistic', 'Conservative, Realistic & Optimistic'] }
      ],
      apiRequired: true
    },
    {
      id: 'code-reviewer',
      name: 'Code Review AI',
      description: 'Advanced code review with security and optimization suggestions',
      icon: Code,
      color: 'from-indigo-500 to-purple-600',
      category: 'Development',
      inputs: [
        { name: 'apiKey', label: 'OpenAI API Key', type: 'password', placeholder: 'sk-...' },
        { name: 'code', label: 'Code to Review', type: 'textarea', placeholder: 'Paste your code here...' },
        { name: 'language', label: 'Programming Language', type: 'select', options: ['JavaScript', 'Python', 'Java', 'C#', 'Go', 'Rust', 'TypeScript', 'PHP', 'Ruby'] },
        { name: 'reviewFocus', label: 'Review Focus', type: 'select', options: ['Security Issues', 'Performance Optimization', 'Code Quality', 'Best Practices', 'Complete Review'] },
        { name: 'severity', label: 'Issue Severity', type: 'select', options: ['All Issues', 'Critical & High', 'Critical Only'] }
      ],
      apiRequired: true
    },
    {
      id: 'seo-content-optimizer',
      name: 'SEO Content Optimizer',
      description: 'Optimize content for search engines with AI analysis',
      icon: Search,
      color: 'from-yellow-500 to-orange-600',
      category: 'Marketing',
      inputs: [
        { name: 'apiKey', label: 'OpenAI API Key', type: 'password', placeholder: 'sk-...' },
        { name: 'content', label: 'Content to Optimize', type: 'textarea', placeholder: 'Paste your content here...' },
        { name: 'targetKeyword', label: 'Target Keyword', type: 'input', placeholder: 'Main keyword to rank for' },
        { name: 'contentType', label: 'Content Type', type: 'select', options: ['Blog Post', 'Product Page', 'Landing Page', 'About Page', 'Category Page'] },
        { name: 'optimizationLevel', label: 'Optimization Level', type: 'select', options: ['Basic SEO', 'Advanced SEO', 'Technical SEO', 'Complete Analysis'] }
      ],
      apiRequired: true
    },
    {
      id: 'automated-testing-generator',
      name: 'Test Case Generator',
      description: 'Generate comprehensive test cases for software applications',
      icon: Monitor,
      color: 'from-cyan-500 to-blue-600',
      category: 'Development',
      inputs: [
        { name: 'apiKey', label: 'OpenAI API Key', type: 'password', placeholder: 'sk-...' },
        { name: 'feature', label: 'Feature/Function to Test', type: 'textarea', placeholder: 'Describe the feature or function you want to test...' },
        { name: 'testType', label: 'Test Type', type: 'select', options: ['Unit Tests', 'Integration Tests', 'E2E Tests', 'API Tests', 'Performance Tests', 'Security Tests'] },
        { name: 'framework', label: 'Testing Framework', type: 'select', options: ['Jest', 'Cypress', 'Selenium', 'Playwright', 'JUnit', 'PyTest', 'RSpec', 'Other'] },
        { name: 'complexity', label: 'Test Complexity', type: 'select', options: ['Basic', 'Intermediate', 'Advanced', 'Edge Cases Only'] }
      ],
      apiRequired: true
    },
    // Original simplified agents
    {
      id: 'intro-email',
      name: 'Intro Email Generator',
      description: 'Generate perfect introduction emails between two people',
      icon: Mail,
      color: 'from-blue-500 to-cyan-500',
      category: 'Communication',
      inputs: [
        { name: 'person1', label: 'Person 1 Name', type: 'input', placeholder: 'John Smith' },
        { name: 'person2', label: 'Person 2 Name', type: 'input', placeholder: 'Jane Doe' },
        { name: 'purpose', label: 'Introduction Purpose', type: 'textarea', placeholder: 'Why are you introducing them?' },
        { name: 'context', label: 'Context/Background', type: 'textarea', placeholder: 'Additional context about both people...' }
      ],
      apiRequired: false
    },
    {
      id: 'stock-finder',
      name: 'Most Traded Stocks',
      description: 'Find the most actively traded stocks with real-time data',
      icon: TrendingUp,
      color: 'from-emerald-500 to-green-500',
      category: 'Finance',
      inputs: [
        { name: 'market', label: 'Market', type: 'select', options: ['US', 'NASDAQ', 'NYSE', 'Global'] },
        { name: 'timeframe', label: 'Time Frame', type: 'select', options: ['Today', 'This Week', 'This Month'] },
        { name: 'limit', label: 'Number of Stocks', type: 'select', options: ['5', '10', '20', '50'] }
      ],
      apiRequired: false
    },
    {
      id: 'crypto-pulse',
      name: 'Crypto Market Pulse',
      description: 'Get daily crypto market trends and top gainers/losers',
      icon: DollarSign,
      color: 'from-yellow-500 to-orange-500',
      category: 'Finance',
      inputs: [
        { name: 'focus', label: 'Market Focus', type: 'select', options: ['Top 10', 'Top 50', 'All Markets', 'Specific Coin'] },
        { name: 'metric', label: 'Key Metric', type: 'select', options: ['Price Change', 'Volume', 'Market Cap', 'All Metrics'] },
        { name: 'timeframe', label: 'Time Period', type: 'select', options: ['24h', '7d', '30d'] }
      ],
      apiRequired: false
    },
    {
      id: 'text-summarizer',
      name: 'Text Summarizer',
      description: 'Summarize long articles, documents, or any text content',
      icon: FileText,
      color: 'from-blue-500 to-cyan-500',
      category: 'Utility',
      inputs: [
        { name: 'text', label: 'Text to Summarize', type: 'textarea', placeholder: 'Paste your text here...' }
      ],
      apiRequired: false
    },
    {
      id: 'image-generator',
      name: 'Image Generator',
      description: 'Generate stunning images from text descriptions',
      icon: Image,
      color: 'from-purple-500 to-pink-500',
      category: 'Creative',
      inputs: [
        { name: 'apiKey', label: 'OpenAI API Key', type: 'password', placeholder: 'sk-...' },
        { name: 'prompt', label: 'Image Description', type: 'textarea', placeholder: 'A beautiful sunset over mountains...' }
      ],
      apiRequired: true
    }
  ]

  const categories = [
    'All', 
    'Business', 
    'Sales', 
    'Research', 
    'Product', 
    'Finance', 
    'Development', 
    'Marketing',
    'Communication', 
    'Creative', 
    'Utility'
  ]
  
  const [selectedCategory, setSelectedCategory] = useState('All')

  const filteredAgents = selectedCategory === 'All' 
    ? agents 
    : agents.filter(agent => agent.category === selectedCategory)

  const handleAgentSelect = (agent) => {
    setSelectedAgent(agent)
    setResult('')
  }

  const handleRunAgent = async (formData) => {
    setLoading(true)
    setResult('')
    
    try {
      const response = await fetch('/api/agents/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agentId: selectedAgent.id,
          inputs: formData
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to run agent')
      }
      
      const data = await response.json()
      setResult(data.result)
    } catch (error) {
      setResult(`Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy: ', err)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center bg-white/10 backdrop-blur-lg rounded-full px-6 py-3 mb-8 border border-white/20">
            <Bot className="w-5 h-5 text-white mr-2" />
            <span className="text-white font-semibold">Professional AI Agents</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Advanced{' '}
            <span className="bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 bg-clip-text text-transparent">
              AI Agents
            </span>
          </h1>
          
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Professional-grade AI agents that solve real business problems. Add your API key and get enterprise-level results instantly!
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                selectedCategory === category
                  ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'
              }`}
            >
              {category} {category !== 'All' && `(${agents.filter(a => a.category === category).length})`}
            </button>
          ))}
        </div>

        {!selectedAgent ? (
          /* Agents Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAgents.map((agent) => {
              const IconComponent = agent.icon
              return (
                <Card 
                  key={agent.id}
                  className="glass-card border-white/20 bg-white/5 backdrop-blur-lg text-white card-3d transition-all duration-300 hover:bg-white/10 cursor-pointer"
                  onClick={() => handleAgentSelect(agent)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className={`w-10 h-10 bg-gradient-to-r ${agent.color} rounded-full flex items-center justify-center`}>
                        <IconComponent className="w-5 h-5 text-white" />
                      </div>
                      <Badge className="bg-white/10 text-white border-white/20">
                        {agent.category}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg font-semibold text-white">
                      {agent.name}
                    </CardTitle>
                    <CardDescription className="text-gray-300 text-sm">
                      {agent.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardFooter className="pt-3">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center space-x-2">
                        {agent.apiRequired && (
                          <Badge variant="outline" className="border-yellow-400 text-yellow-400 text-xs">
                            API Key Required
                          </Badge>
                        )}
                        <Badge variant="outline" className="border-green-400 text-green-400 text-xs">
                          Ready
                        </Badge>
                      </div>
                      <Play className="w-4 h-4 text-gray-300" />
                    </div>
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        ) : (
          /* Agent Interface */
          <div className="max-w-4xl mx-auto">
            <div className="glass-card rounded-2xl p-8 border-white/20 bg-white/5 backdrop-blur-lg">
              {/* Agent Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 bg-gradient-to-r ${selectedAgent.color} rounded-full flex items-center justify-center`}>
                    <selectedAgent.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">{selectedAgent.name}</h2>
                    <p className="text-gray-300">{selectedAgent.description}</p>
                  </div>
                </div>
                <Button
                  onClick={() => setSelectedAgent(null)}
                  variant="outline"
                  className="border-white/20 text-gray-300 hover:bg-white/10"
                >
                  ← Back
                </Button>
              </div>

              {/* Agent Form */}
              <AgentForm agent={selectedAgent} onRun={handleRunAgent} loading={loading} />

              {/* Results */}
              {result && (
                <div className="mt-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Result</h3>
                    <Button
                      onClick={() => copyToClipboard(result)}
                      variant="outline"
                      size="sm"
                      className="border-white/20 text-gray-300 hover:bg-white/10"
                    >
                      {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                      {copied ? 'Copied!' : 'Copy'}
                    </Button>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <pre className="text-gray-300 whitespace-pre-wrap">{result}</pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function AgentForm({ agent, onRun, loading }) {
  const [formData, setFormData] = useState({})

  const handleSubmit = (e) => {
    e.preventDefault()
    onRun(formData)
  }

  const handleInputChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {agent.inputs.map((input) => (
        <div key={input.name} className="space-y-2">
          <label className="text-sm font-medium text-gray-300 flex items-center">
            {input.label}
            {input.type === 'password' && (
              <Badge variant="outline" className="border-yellow-400 text-yellow-400 text-xs ml-2">
                Required
              </Badge>
            )}
          </label>
          
          {input.type === 'textarea' ? (
            <Textarea
              placeholder={input.placeholder}
              value={formData[input.name] || ''}
              onChange={(e) => handleInputChange(input.name, e.target.value)}
              className="bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-white/40"
              rows={4}
            />
          ) : input.type === 'select' ? (
            <select
              value={formData[input.name] || ''}
              onChange={(e) => handleInputChange(input.name, e.target.value)}
              className="w-full bg-white/5 border border-white/20 text-white rounded-md px-3 py-2 focus:border-white/40 focus:outline-none"
            >
              <option value="" className="bg-gray-800">Select {input.label}</option>
              {input.options.map((option) => (
                <option key={option} value={option} className="bg-gray-800">
                  {option}
                </option>
              ))}
            </select>
          ) : (
            <Input
              type={input.type}
              placeholder={input.placeholder}
              value={formData[input.name] || ''}
              onChange={(e) => handleInputChange(input.name, e.target.value)}
              className="bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-white/40"
            />
          )}
        </div>
      ))}

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 hover:from-yellow-500 hover:to-pink-600 text-white font-semibold py-3 rounded-lg"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Running Agent...
          </>
        ) : (
          <>
            <Wand2 className="w-4 h-4 mr-2" />
            Run Agent
          </>
        )}
      </Button>
    </form>
  )
}