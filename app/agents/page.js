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
  Shield
} from 'lucide-react'

export default function AgentsPage() {
  const [selectedAgent, setSelectedAgent] = useState(null)
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const agents = [
    // Communication & Email
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
      id: 'follow-up-writer',
      name: 'Follow-Up Writer',
      description: 'Create professional follow-up emails for any situation',
      icon: Send,
      color: 'from-green-500 to-teal-500',
      category: 'Communication',
      inputs: [
        { name: 'apiKey', label: 'OpenAI API Key', type: 'password', placeholder: 'sk-...' },
        { name: 'previousEmail', label: 'Previous Email/Conversation', type: 'textarea', placeholder: 'Paste the previous email or conversation...' },
        { name: 'recipient', label: 'Recipient Name', type: 'input', placeholder: 'Who are you following up with?' },
        { name: 'purpose', label: 'Follow-up Purpose', type: 'select', options: ['Check Status', 'Provide Update', 'Request Response', 'Schedule Meeting', 'Thank You'] }
      ],
      apiRequired: true
    },
    // Finance & Trading
    {
      id: 'stock-finder',
      name: 'Most Traded Stocks',
      description: 'Find the most actively traded stocks with real-time data',
      icon: TrendingUp,
      color: 'from-emerald-500 to-green-500',
      category: 'Finance',
      inputs: [
        { name: 'apiKey', label: 'RapidAPI Key (Yahoo Finance)', type: 'password', placeholder: 'Your RapidAPI key for Yahoo Finance' },
        { name: 'market', label: 'Market', type: 'select', options: ['US', 'NASDAQ', 'NYSE', 'Global'] },
        { name: 'timeframe', label: 'Time Frame', type: 'select', options: ['Today', 'This Week', 'This Month'] },
        { name: 'limit', label: 'Number of Stocks', type: 'select', options: ['5', '10', '20', '50'] }
      ],
      apiRequired: true
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
    // Learning & Content
    {
      id: 'ai-detector',
      name: 'AI or Human Detector',
      description: 'Analyze text to determine if it was written by AI or human',
      icon: Eye,
      color: 'from-purple-500 to-pink-500',
      category: 'Content',
      inputs: [
        { name: 'apiKey', label: 'OpenAI API Key', type: 'password', placeholder: 'sk-...' },
        { name: 'text', label: 'Text to Analyze', type: 'textarea', placeholder: 'Paste the text you want to analyze...' }
      ],
      apiRequired: true
    },
    {
      id: 'seo-writer',
      name: 'SEO Blog Writer',
      description: 'Generate SEO-optimized blog posts with keywords',
      icon: PenTool,
      color: 'from-indigo-500 to-purple-500',
      category: 'Content',
      inputs: [
        { name: 'apiKey', label: 'OpenAI API Key', type: 'password', placeholder: 'sk-...' },
        { name: 'topic', label: 'Blog Topic', type: 'input', placeholder: 'Main topic for your blog post' },
        { name: 'keywords', label: 'SEO Keywords', type: 'input', placeholder: 'keyword1, keyword2, keyword3' },
        { name: 'length', label: 'Article Length', type: 'select', options: ['Short (500 words)', 'Medium (1000 words)', 'Long (1500+ words)'] },
        { name: 'tone', label: 'Writing Tone', type: 'select', options: ['Professional', 'Conversational', 'Technical', 'Beginner-friendly'] }
      ],
      apiRequired: true
    },
    // Document Tools
    {
      id: 'pdf-explainer',
      name: 'PDF Explainer',
      description: 'Upload PDF and get summaries, explanations, or Q&A',
      icon: FileText,
      color: 'from-red-500 to-pink-500',
      category: 'Documents',
      inputs: [
        { name: 'apiKey', label: 'OpenAI API Key', type: 'password', placeholder: 'sk-...' },
        { name: 'pdfText', label: 'PDF Content', type: 'textarea', placeholder: 'Copy and paste text from your PDF here...' },
        { name: 'task', label: 'What do you want?', type: 'select', options: ['Summary', 'Key Points', 'Q&A', 'Explanation', 'Action Items'] }
      ],
      apiRequired: true
    },
    {
      id: 'fine-print-checker',
      name: 'Fine Print Checker',
      description: 'Analyze contracts and policies for hidden clauses',
      icon: Shield,
      color: 'from-orange-500 to-red-500',
      category: 'Documents',
      inputs: [
        { name: 'apiKey', label: 'OpenAI API Key', type: 'password', placeholder: 'sk-...' },
        { name: 'document', label: 'Contract/Policy Text', type: 'textarea', placeholder: 'Paste the contract or policy text here...' },
        { name: 'focus', label: 'Focus Area', type: 'select', options: ['All Issues', 'Financial Terms', 'Cancellation Policy', 'Privacy Concerns', 'Liability'] }
      ],
      apiRequired: true
    },
    // Personal Growth
    {
      id: 'clara-coach',
      name: 'Clara - Growth Coach',
      description: 'Your personal AI coach for motivation and growth',
      icon: Heart,
      color: 'from-pink-500 to-rose-500',
      category: 'Personal',
      inputs: [
        { name: 'apiKey', label: 'OpenAI API Key', type: 'password', placeholder: 'sk-...' },
        { name: 'situation', label: 'Current Situation', type: 'textarea', placeholder: 'Tell Clara what\'s going on in your life...' },
        { name: 'mood', label: 'Current Mood', type: 'select', options: ['Motivated', 'Stressed', 'Confused', 'Excited', 'Overwhelmed', 'Confident'] },
        { name: 'goal', label: 'What do you want help with?', type: 'select', options: ['Motivation', 'Decision Making', 'Goal Setting', 'Overcoming Obstacles', 'Building Confidence'] }
      ],
      apiRequired: true
    },
    // Original agents
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
    },
    {
      id: 'content-writer',
      name: 'Content Writer',
      description: 'Generate blog posts, articles, and marketing copy',
      icon: Bot,
      color: 'from-green-500 to-teal-500',
      category: 'Content',
      inputs: [
        { name: 'topic', label: 'Topic', type: 'input', placeholder: 'Write about...' },
        { name: 'tone', label: 'Tone', type: 'select', options: ['Professional', 'Casual', 'Friendly', 'Formal'] },
        { name: 'length', label: 'Length', type: 'select', options: ['Short', 'Medium', 'Long'] }
      ],
      apiRequired: false
    },
    {
      id: 'code-generator',
      name: 'Code Generator',
      description: 'Generate code snippets in various programming languages',
      icon: Code,
      color: 'from-orange-500 to-red-500',
      category: 'Development',
      inputs: [
        { name: 'language', label: 'Programming Language', type: 'select', options: ['Python', 'JavaScript', 'Java', 'C++', 'Go'] },
        { name: 'description', label: 'What should the code do?', type: 'textarea', placeholder: 'Create a function that...' }
      ],
      apiRequired: false
    },
    {
      id: 'email-writer',
      name: 'Email Writer',
      description: 'Write professional emails for any purpose',
      icon: Mail,
      color: 'from-indigo-500 to-purple-500',
      category: 'Communication',
      inputs: [
        { name: 'purpose', label: 'Email Purpose', type: 'select', options: ['Business', 'Follow-up', 'Apology', 'Request', 'Thank You'] },
        { name: 'recipient', label: 'Recipient', type: 'input', placeholder: 'Who are you writing to?' },
        { name: 'context', label: 'Context', type: 'textarea', placeholder: 'Brief context about the email...' }
      ],
      apiRequired: false
    },
    {
      id: 'social-media',
      name: 'Social Media Post',
      description: 'Create engaging social media posts for any platform',
      icon: MessageSquare,
      color: 'from-pink-500 to-rose-500',
      category: 'Content',
      inputs: [
        { name: 'platform', label: 'Platform', type: 'select', options: ['Twitter', 'LinkedIn', 'Instagram', 'Facebook'] },
        { name: 'topic', label: 'Topic', type: 'input', placeholder: 'What to post about?' },
        { name: 'style', label: 'Style', type: 'select', options: ['Professional', 'Casual', 'Inspirational', 'Funny'] }
      ],
      apiRequired: false
    },
    {
      id: 'translator',
      name: 'Language Translator',
      description: 'Translate text between different languages',
      icon: Globe,
      color: 'from-teal-500 to-blue-500',
      category: 'Utility',
      inputs: [
        { name: 'text', label: 'Text to Translate', type: 'textarea', placeholder: 'Enter text to translate...' },
        { name: 'fromLang', label: 'From Language', type: 'select', options: ['English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese'] },
        { name: 'toLang', label: 'To Language', type: 'select', options: ['English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese'] }
      ],
      apiRequired: false
    },
    {
      id: 'data-analyzer',
      name: 'Data Analyzer',
      description: 'Analyze and interpret data patterns',
      icon: BarChart3,
      color: 'from-yellow-500 to-orange-500',
      category: 'Utility',
      inputs: [
        { name: 'data', label: 'Data (CSV format)', type: 'textarea', placeholder: 'Paste your CSV data here...' },
        { name: 'question', label: 'What do you want to analyze?', type: 'input', placeholder: 'Find trends, patterns, insights...' }
      ],
      apiRequired: false
    }
  ]

  const categories = [
    'All', 
    'Communication', 
    'Finance', 
    'Content', 
    'Documents', 
    'Personal', 
    'Creative', 
    'Development', 
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
            <span className="text-white font-semibold">AI Agents</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            No-Code{' '}
            <span className="bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 bg-clip-text text-transparent">
              AI Agents
            </span>
          </h1>
          
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Simple AI agents that work with just your inputs. No coding required - just add your details and let AI do the magic!
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