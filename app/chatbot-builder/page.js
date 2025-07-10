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
  FileText, 
  Globe, 
  Upload,
  Wand2,
  Loader2,
  Copy,
  Check,
  Settings,
  Code,
  MessageSquare,
  Brain,
  Database,
  Link,
  Plus,
  Trash2,
  Eye,
  Download
} from 'lucide-react'

export default function ChatbotBuilder() {
  const [step, setStep] = useState(1)
  const [chatbotData, setChatbotData] = useState({
    name: '',
    description: '',
    personality: 'helpful',
    knowledge: {
      documents: [],
      urls: [],
      textContent: ''
    }
  })
  const [loading, setLoading] = useState(false)
  const [generatedChatbot, setGeneratedChatbot] = useState(null)
  const [embedCode, setEmbedCode] = useState('')
  const [copied, setCopied] = useState(false)

  const personalities = [
    { id: 'helpful', name: 'Helpful Assistant', description: 'Professional and informative' },
    { id: 'friendly', name: 'Friendly Buddy', description: 'Casual and approachable' },
    { id: 'expert', name: 'Subject Expert', description: 'Authoritative and knowledgeable' },
    { id: 'creative', name: 'Creative Partner', description: 'Imaginative and inspiring' },
    { id: 'formal', name: 'Formal Advisor', description: 'Professional and structured' }
  ]

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      setChatbotData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }))
    } else {
      setChatbotData(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  const addUrl = () => {
    setChatbotData(prev => ({
      ...prev,
      knowledge: {
        ...prev.knowledge,
        urls: [...prev.knowledge.urls, '']
      }
    }))
  }

  const updateUrl = (index, value) => {
    setChatbotData(prev => ({
      ...prev,
      knowledge: {
        ...prev.knowledge,
        urls: prev.knowledge.urls.map((url, i) => i === index ? value : url)
      }
    }))
  }

  const removeUrl = (index) => {
    setChatbotData(prev => ({
      ...prev,
      knowledge: {
        ...prev.knowledge,
        urls: prev.knowledge.urls.filter((_, i) => i !== index)
      }
    }))
  }

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files)
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        setChatbotData(prev => ({
          ...prev,
          knowledge: {
            ...prev.knowledge,
            documents: [...prev.knowledge.documents, {
              name: file.name,
              content: e.target.result,
              type: file.type
            }]
          }
        }))
      }
      reader.readAsText(file)
    })
  }

  const removeDocument = (index) => {
    setChatbotData(prev => ({
      ...prev,
      knowledge: {
        ...prev.knowledge,
        documents: prev.knowledge.documents.filter((_, i) => i !== index)
      }
    }))
  }

  const createChatbot = async () => {
    setLoading(true)
    
    try {
      const response = await fetch('/api/chatbot/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(chatbotData)
      })
      
      if (!response.ok) {
        throw new Error('Failed to create chatbot')
      }
      
      const result = await response.json()
      setGeneratedChatbot(result)
      
      // Generate embed code
      const embedScript = `
<!-- HappyTools Chatbot -->
<div id="happytools-chatbot-${result.id}"></div>
<script>
(function() {
  var script = document.createElement('script');
  script.src = 'https://happytools.ai/embed/chatbot.js';
  script.setAttribute('data-chatbot-id', '${result.id}');
  script.setAttribute('data-chatbot-name', '${chatbotData.name}');
  document.head.appendChild(script);
})();
</script>`.trim()
      
      setEmbedCode(embedScript)
      setStep(4)
      
    } catch (error) {
      console.error('Error creating chatbot:', error)
      alert('Failed to create chatbot. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const copyEmbedCode = async () => {
    try {
      await navigator.clipboard.writeText(embedCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy: ', err)
    }
  }

  const testChatbot = () => {
    // Open chatbot in new window for testing
    const testWindow = window.open('', '_blank', 'width=400,height=600')
    testWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Test Chatbot - ${chatbotData.name}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f0f2f5; }
          .chatbot-container { max-width: 400px; margin: 0 auto; }
        </style>
      </head>
      <body>
        <div class="chatbot-container">
          <h2>Testing: ${chatbotData.name}</h2>
          ${embedCode}
        </div>
      </body>
      </html>
    `)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center bg-white/10 backdrop-blur-lg rounded-full px-6 py-3 mb-8 border border-white/20">
            <Bot className="w-5 h-5 text-white mr-2" />
            <span className="text-white font-semibold">Chatbot Builder</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Build Your{' '}
            <span className="bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 bg-clip-text text-transparent">
              AI Chatbot
            </span>
          </h1>
          
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Create intelligent chatbots with your own knowledge base. No coding required - just add your content and get an embeddable chatbot!
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center space-x-4">
            {[1, 2, 3, 4].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= stepNum 
                    ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white' 
                    : 'bg-white/20 text-gray-400'
                }`}>
                  {stepNum}
                </div>
                {stepNum < 4 && (
                  <div className={`w-16 h-1 mx-2 ${
                    step > stepNum ? 'bg-gradient-to-r from-yellow-400 to-orange-500' : 'bg-white/20'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <Card className="glass-card border-white/20 bg-white/5 backdrop-blur-lg text-white">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl">
                  <Settings className="w-6 h-6 mr-3" />
                  Basic Information
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Set up your chatbot's basic details and personality
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Chatbot Name
                  </label>
                  <Input
                    placeholder="e.g., Support Bot, FAQ Assistant"
                    value={chatbotData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="bg-white/5 border-white/20 text-white placeholder-gray-400"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Description
                  </label>
                  <Textarea
                    placeholder="Describe what your chatbot does..."
                    value={chatbotData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="bg-white/5 border-white/20 text-white placeholder-gray-400"
                    rows={3}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-3 block">
                    Personality Type
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {personalities.map((personality) => (
                      <div
                        key={personality.id}
                        onClick={() => handleInputChange('personality', personality.id)}
                        className={`p-4 rounded-lg border cursor-pointer transition-all ${
                          chatbotData.personality === personality.id
                            ? 'border-yellow-400 bg-yellow-400/10'
                            : 'border-white/20 bg-white/5 hover:bg-white/10'
                        }`}
                      >
                        <div className="font-medium text-white">{personality.name}</div>
                        <div className="text-sm text-gray-300">{personality.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
              
              <CardFooter>
                <Button
                  onClick={() => setStep(2)}
                  disabled={!chatbotData.name}
                  className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600"
                >
                  Next: Add Knowledge Base
                </Button>
              </CardFooter>
            </Card>
          )}

          {/* Step 2: Knowledge Base */}
          {step === 2 && (
            <Card className="glass-card border-white/20 bg-white/5 backdrop-blur-lg text-white">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl">
                  <Database className="w-6 h-6 mr-3" />
                  Knowledge Base
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Add documents, URLs, and content for your chatbot to learn from
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-8">
                {/* Documents */}
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-3 block flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    Upload Documents
                  </label>
                  <div className="border-2 border-dashed border-white/20 rounded-lg p-6">
                    <input
                      type="file"
                      multiple
                      accept=".txt,.md,.pdf,.doc,.docx"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-gray-300">Click to upload files</span>
                      <span className="text-sm text-gray-400">Supports: TXT, MD, PDF, DOC</span>
                    </label>
                  </div>
                  
                  {chatbotData.knowledge.documents.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {chatbotData.knowledge.documents.map((doc, index) => (
                        <div key={index} className="flex items-center justify-between bg-white/5 p-3 rounded-lg">
                          <span className="text-sm text-gray-300">{doc.name}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeDocument(index)}
                            className="border-red-400 text-red-400 hover:bg-red-400/10"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* URLs */}
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-3 block flex items-center">
                    <Globe className="w-4 h-4 mr-2" />
                    Website URLs
                  </label>
                  <div className="space-y-3">
                    {chatbotData.knowledge.urls.map((url, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Input
                          placeholder="https://example.com"
                          value={url}
                          onChange={(e) => updateUrl(index, e.target.value)}
                          className="bg-white/5 border-white/20 text-white placeholder-gray-400"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeUrl(index)}
                          className="border-red-400 text-red-400 hover:bg-red-400/10"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      onClick={addUrl}
                      variant="outline"
                      className="w-full border-white/20 text-gray-300 hover:bg-white/10"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add URL
                    </Button>
                  </div>
                </div>

                {/* Text Content */}
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-3 block flex items-center">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Additional Text Content
                  </label>
                  <Textarea
                    placeholder="Add any additional information, FAQs, or content for your chatbot..."
                    value={chatbotData.knowledge.textContent}
                    onChange={(e) => handleInputChange('knowledge.textContent', e.target.value)}
                    className="bg-white/5 border-white/20 text-white placeholder-gray-400"
                    rows={6}
                  />
                </div>
              </CardContent>
              
              <CardFooter className="flex space-x-4">
                <Button
                  onClick={() => setStep(1)}
                  variant="outline"
                  className="flex-1 border-white/20 text-gray-300 hover:bg-white/10"
                >
                  Back
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600"
                >
                  Next: Review & Create
                </Button>
              </CardFooter>
            </Card>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <Card className="glass-card border-white/20 bg-white/5 backdrop-blur-lg text-white">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl">
                  <Eye className="w-6 h-6 mr-3" />
                  Review & Create
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Review your chatbot configuration and create it
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium text-white mb-2">Basic Info</h3>
                    <div className="space-y-2 text-sm">
                      <div><span className="text-gray-400">Name:</span> {chatbotData.name}</div>
                      <div><span className="text-gray-400">Personality:</span> {personalities.find(p => p.id === chatbotData.personality)?.name}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-white mb-2">Knowledge Base</h3>
                    <div className="space-y-2 text-sm">
                      <div><span className="text-gray-400">Documents:</span> {chatbotData.knowledge.documents.length}</div>
                      <div><span className="text-gray-400">URLs:</span> {chatbotData.knowledge.urls.filter(url => url.trim()).length}</div>
                      <div><span className="text-gray-400">Text Content:</span> {chatbotData.knowledge.textContent ? 'Added' : 'None'}</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/5 p-4 rounded-lg">
                  <h4 className="font-medium text-white mb-2">Description</h4>
                  <p className="text-gray-300 text-sm">{chatbotData.description || 'No description provided'}</p>
                </div>
              </CardContent>
              
              <CardFooter className="flex space-x-4">
                <Button
                  onClick={() => setStep(2)}
                  variant="outline"
                  className="flex-1 border-white/20 text-gray-300 hover:bg-white/10"
                >
                  Back
                </Button>
                <Button
                  onClick={createChatbot}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating Chatbot...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4 mr-2" />
                      Create Chatbot
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          )}

          {/* Step 4: Success & Embed */}
          {step === 4 && generatedChatbot && (
            <Card className="glass-card border-white/20 bg-white/5 backdrop-blur-lg text-white">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl">
                  <Check className="w-6 h-6 mr-3 text-green-400" />
                  Chatbot Created Successfully!
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Your chatbot is ready. Use the embed code to add it to your website.
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                  <h3 className="font-medium text-green-400 mb-2">✅ Chatbot Details</h3>
                  <div className="space-y-1 text-sm">
                    <div><span className="text-gray-400">ID:</span> {generatedChatbot.id}</div>
                    <div><span className="text-gray-400">Name:</span> {chatbotData.name}</div>
                    <div><span className="text-gray-400">Status:</span> <span className="text-green-400">Active</span></div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-white mb-3 flex items-center">
                    <Code className="w-4 h-4 mr-2" />
                    Embed Code
                  </h3>
                  <div className="relative">
                    <pre className="bg-gray-900/50 p-4 rounded-lg text-sm text-gray-300 overflow-x-auto">
{embedCode}
                    </pre>
                    <Button
                      onClick={copyEmbedCode}
                      size="sm"
                      className="absolute top-2 right-2 bg-white/10 hover:bg-white/20"
                    >
                      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    </Button>
                  </div>
                </div>
                
                <div className="text-sm text-gray-400 bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <h4 className="font-medium text-blue-400 mb-2">💡 How to use:</h4>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Copy the embed code above</li>
                    <li>Paste it into your website's HTML</li>
                    <li>The chatbot will appear automatically</li>
                    <li>Customize the styling as needed</li>
                  </ol>
                </div>
              </CardContent>
              
              <CardFooter className="flex space-x-4">
                <Button
                  onClick={testChatbot}
                  variant="outline"
                  className="flex-1 border-white/20 text-gray-300 hover:bg-white/10"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Test Chatbot
                </Button>
                <Button
                  onClick={() => {
                    setChatbotData({ name: '', description: '', personality: 'helpful', knowledge: { documents: [], urls: [], textContent: '' }})
                    setStep(1)
                    setGeneratedChatbot(null)
                  }}
                  className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Another
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}