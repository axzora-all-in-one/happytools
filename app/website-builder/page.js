'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Code, 
  Eye, 
  Download, 
  Copy, 
  Check, 
  Loader2, 
  Zap, 
  Smartphone, 
  Monitor, 
  Tablet,
  RefreshCw,
  Settings,
  Play,
  AlertTriangle,
  Sparkles,
  Globe,
  Layout
} from 'lucide-react'

export default function WebsiteBuilder() {
  const [apiProvider, setApiProvider] = useState('openai')
  const [apiKey, setApiKey] = useState('')
  const [prompt, setPrompt] = useState('')
  const [generatedCode, setGeneratedCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [previewMode, setPreviewMode] = useState('desktop')
  const [showCode, setShowCode] = useState(false)
  const [copied, setCopied] = useState(false)
  const [previewSrcDoc, setPreviewSrcDoc] = useState('')
  const iframeRef = useRef(null)

  const providers = [
    { id: 'openai', name: 'OpenAI GPT-4', placeholder: 'sk-...' },
    { id: 'claude', name: 'Anthropic Claude', placeholder: 'sk-ant-...' },
    { id: 'gemini', name: 'Google Gemini', placeholder: 'AIza...' }
  ]

  const examplePrompts = [
    "Create a vibrant fitness coaching website with purple and pink gradients, hero section with workout videos, colorful service cards, and testimonials",
    "Build a modern SaaS landing page with blue to purple gradients, animated features section, pricing cards with hover effects, and colorful call-to-action",
    "Design a creative portfolio website with rainbow gradients, animated project cards, colorful skill bars, and interactive contact form",
    "Create a restaurant website with warm orange and red gradients, mouth-watering food gallery, colorful menu cards, and booking form",
    "Build a tech startup homepage with neon green and blue gradients, animated product showcase, colorful team cards, and glowing buttons",
    "Design a beauty salon website with pink and purple gradients, before/after gallery, colorful service cards, and appointment booking"
  ]

  const generateWebsite = async () => {
    if (!apiKey || !prompt) {
      setError('Please provide API key and prompt')
      return
    }

    setLoading(true)
    setError('')
    
    try {
      const response = await fetch('/api/website-builder/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider: apiProvider,
          apiKey: apiKey,
          prompt: prompt
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to generate website')
      }
      
      const data = await response.json()
      
      if (data.success) {
        setGeneratedCode(data.code)
        updatePreview(data.code)
      } else {
        setError(data.error || 'Failed to generate website')
      }
      
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const updatePreview = (code) => {
    // Create full HTML with Tailwind CSS for the preview
    const fullHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generated Website</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        primary: '#3b82f6',
                        secondary: '#64748b',
                    }
                }
            }
        }
    </script>
    <style>
        body { margin: 0; padding: 0; }
        * { box-sizing: border-box; }
    </style>
</head>
<body>
    ${code}
    <script>
        // Handle form submissions and links safely
        document.addEventListener('click', function(e) {
            if (e.target.tagName === 'A' && e.target.href) {
                e.preventDefault();
                console.log('Link clicked:', e.target.href);
            }
        });
        
        document.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Form submitted');
        });
    </script>
</body>
</html>`
    
    setPreviewSrcDoc(fullHTML)
  }

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(generatedCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy: ', err)
    }
  }

  const downloadCode = () => {
    const blob = new Blob([generatedCode], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'generated-website.html'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getPreviewWidth = () => {
    switch (previewMode) {
      case 'mobile':
        return '375px'
      case 'tablet':
        return '768px'
      default:
        return '100%'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="border-b border-white/10 bg-slate-900/50 backdrop-blur-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <Layout className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Website Builder</h1>
                <p className="text-xs text-gray-300">AI-Powered Website Generator</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                Live Preview
              </Badge>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPreviewMode('mobile')}
                  className={`p-2 rounded-lg transition-colors ${
                    previewMode === 'mobile' ? 'bg-white/20 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPreviewMode('tablet')}
                  className={`p-2 rounded-lg transition-colors ${
                    previewMode === 'tablet' ? 'bg-white/20 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Tablet className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPreviewMode('desktop')}
                  className={`p-2 rounded-lg transition-colors ${
                    previewMode === 'desktop' ? 'bg-white/20 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Monitor className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Panel - Prompt & Settings */}
        <div className="w-1/2 border-r border-white/10 bg-slate-900/30 backdrop-blur-lg flex flex-col">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Configuration
            </h2>
            
            {/* API Provider Selection */}
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                AI Provider
              </label>
              <div className="grid grid-cols-3 gap-2">
                {providers.map((provider) => (
                  <button
                    key={provider.id}
                    onClick={() => setApiProvider(provider.id)}
                    className={`p-3 rounded-lg text-sm font-medium transition-all ${
                      apiProvider === provider.id
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                    }`}
                  >
                    {provider.name}
                  </button>
                ))}
              </div>
            </div>

            {/* API Key Input */}
            <div className="mb-6">
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                API Key
              </label>
              <Input
                type="password"
                placeholder={providers.find(p => p.id === apiProvider)?.placeholder}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="bg-white/5 border-white/20 text-white placeholder-gray-400"
              />
            </div>
          </div>

          {/* Prompt Area */}
          <div className="flex-1 p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center">
                <Zap className="w-5 h-5 mr-2" />
                Describe Your Website
              </h2>
              <Button
                onClick={generateWebsite}
                disabled={loading || !apiKey || !prompt}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Generate
                  </>
                )}
              </Button>
            </div>

            <Textarea
              placeholder="Describe the website you want to create. Be specific about design, layout, colors, content, and functionality..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="flex-1 bg-white/5 border-white/20 text-white placeholder-gray-400 resize-none"
              rows={12}
            />

            {/* Example Prompts */}
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-300 mb-2">Example Prompts:</p>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {examplePrompts.map((example, index) => (
                  <button
                    key={index}
                    onClick={() => setPrompt(example)}
                    className="w-full text-left text-xs text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded transition-colors"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                <div className="flex items-center">
                  <AlertTriangle className="w-4 h-4 text-red-400 mr-2" />
                  <span className="text-red-400 text-sm">{error}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Preview & Code */}
        <div className="w-1/2 flex flex-col">
          {/* Preview Header */}
          <div className="p-4 border-b border-white/10 bg-slate-900/30 backdrop-blur-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h2 className="text-lg font-semibold text-white flex items-center">
                  <Eye className="w-5 h-5 mr-2" />
                  Live Preview
                </h2>
                <div className="text-sm text-gray-300">
                  {previewMode.charAt(0).toUpperCase() + previewMode.slice(1)} View
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowCode(!showCode)}
                  className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                    showCode ? 'bg-white/20 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Code className="w-4 h-4 mr-1 inline" />
                  Code
                </button>
                
                {generatedCode && (
                  <>
                    <Button
                      onClick={copyCode}
                      size="sm"
                      variant="outline"
                      className="border-white/20 text-gray-300 hover:bg-white/10"
                    >
                      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    </Button>
                    <Button
                      onClick={downloadCode}
                      size="sm"
                      variant="outline"
                      className="border-white/20 text-gray-300 hover:bg-white/10"
                    >
                      <Download className="w-3 h-3" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Preview Content */}
          <div className="flex-1 bg-white">
            {showCode ? (
              <div className="h-full p-4 bg-gray-900">
                <pre className="text-sm text-gray-300 overflow-auto h-full">
                  <code>{generatedCode || '// Generated code will appear here...'}</code>
                </pre>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center bg-gray-100">
                {generatedCode ? (
                  <div 
                    className="h-full bg-white shadow-lg transition-all duration-300" 
                    style={{ width: getPreviewWidth() }}
                  >
                    <iframe
                      ref={iframeRef}
                      srcDoc={previewSrcDoc}
                      className="w-full h-full border-0"
                      title="Website Preview"
                      sandbox="allow-scripts allow-same-origin"
                    />
                  </div>
                ) : (
                  <div className="text-center text-gray-500">
                    <Globe className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">Your website preview will appear here</p>
                    <p className="text-sm">Enter your API key and describe your website to get started</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}