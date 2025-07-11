'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  Workflow, 
  Sparkles, 
  Download, 
  Settings, 
  Code,
  Wand2,
  Loader2,
  Copy,
  Check,
  Eye,
  Plus,
  ArrowRight,
  Mail,
  Database,
  Calendar,
  MessageSquare,
  Globe,
  FileText,
  Zap,
  Clock,
  Share2,
  Filter,
  Bot
} from 'lucide-react'

export default function WorkflowBuilder() {
  const [step, setStep] = useState(1)
  const [workflowData, setWorkflowData] = useState({
    name: '',
    description: '',
    provider: 'openai',
    apiKey: '',
    automationDescription: '',
    templateId: null
  })
  const [loading, setLoading] = useState(false)
  const [generatedWorkflow, setGeneratedWorkflow] = useState(null)
  const [workflowJson, setWorkflowJson] = useState('')
  const [copied, setCopied] = useState(false)
  const [platform, setPlatform] = useState('n8n')

  const providers = [
    { id: 'openai', name: 'OpenAI GPT-4', description: 'Most versatile, great for complex workflows' },
    { id: 'claude', name: 'Claude 3.5', description: 'Excellent for detailed, structured workflows' },
    { id: 'gemini', name: 'Google Gemini', description: 'Great for Google services integration' }
  ]

  const templates = [
    {
      id: 'email-form',
      name: 'Email on Form Submit',
      description: 'Send email notifications when a form is submitted',
      icon: Mail,
      category: 'Communication',
      complexity: 'Simple',
      nodes: ['HTTP Request', 'Email'],
      useCase: 'Get notified instantly when someone fills out your contact form'
    },
    {
      id: 'social-media-automation',
      name: 'Social Media Automation',
      description: 'Post content across multiple social platforms',
      icon: Share2,
      category: 'Marketing',
      complexity: 'Medium',
      nodes: ['Scheduler', 'Twitter', 'LinkedIn', 'Facebook'],
      useCase: 'Automatically post your content to all social media platforms'
    },
    {
      id: 'data-processing',
      name: 'Data Processing Pipeline',
      description: 'Process and transform data from multiple sources',
      icon: Database,
      category: 'Data',
      complexity: 'Advanced',
      nodes: ['HTTP Request', 'Data Transform', 'Database', 'Email'],
      useCase: 'Clean, transform, and store data from various APIs'
    },
    {
      id: 'calendar-booking',
      name: 'Calendar Booking System',
      description: 'Automated booking confirmation and reminders',
      icon: Calendar,
      category: 'Business',
      complexity: 'Medium',
      nodes: ['Webhook', 'Calendar', 'Email', 'SMS'],
      useCase: 'Automatically handle bookings and send confirmations'
    },
    {
      id: 'content-generation',
      name: 'AI Content Generation',
      description: 'Generate and publish content automatically',
      icon: Bot,
      category: 'Content',
      complexity: 'Medium',
      nodes: ['Scheduler', 'OpenAI', 'Content CMS', 'Social Media'],
      useCase: 'Create and publish blog posts or social content using AI'
    },
    {
      id: 'lead-management',
      name: 'Lead Management Flow',
      description: 'Capture, qualify, and nurture leads automatically',
      icon: Filter,
      category: 'Sales',
      complexity: 'Advanced',
      nodes: ['Form Submit', 'CRM', 'Email Sequence', 'Slack'],
      useCase: 'Automatically process and nurture new leads'
    },
    {
      id: 'file-processing',
      name: 'File Processing Automation',
      description: 'Process uploaded files and generate reports',
      icon: FileText,
      category: 'Productivity',
      complexity: 'Medium',
      nodes: ['File Upload', 'Data Parser', 'Report Generator', 'Email'],
      useCase: 'Automatically process CSV/Excel files and generate reports'
    },
    {
      id: 'monitoring-alerts',
      name: 'System Monitoring & Alerts',
      description: 'Monitor systems and send alerts when issues occur',
      icon: Zap,
      category: 'Operations',
      complexity: 'Simple',
      nodes: ['HTTP Monitor', 'Condition', 'Email', 'Slack'],
      useCase: 'Get notified when your website or API goes down'
    }
  ]

  const categories = ['All', 'Communication', 'Marketing', 'Data', 'Business', 'Content', 'Sales', 'Productivity', 'Operations']
  const [selectedCategory, setSelectedCategory] = useState('All')

  const filteredTemplates = selectedCategory === 'All' 
    ? templates 
    : templates.filter(template => template.category === selectedCategory)

  const handleInputChange = (field, value) => {
    setWorkflowData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleTemplateSelect = (template) => {
    setWorkflowData(prev => ({
      ...prev,
      templateId: template.id,
      name: template.name,
      description: template.description,
      automationDescription: `I want to create a workflow for: ${template.useCase}. This should include: ${template.nodes.join(', ')}.`
    }))
    setStep(2)
  }

  const generateWorkflow = async () => {
    setLoading(true)
    
    try {
      const response = await fetch('/api/workflow-builder/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...workflowData,
          platform
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to generate workflow')
      }
      
      const result = await response.json()
      setGeneratedWorkflow(result)
      setWorkflowJson(JSON.stringify(result.workflow, null, 2))
      setStep(4)
      
    } catch (error) {
      console.error('Error generating workflow:', error)
      alert('Failed to generate workflow. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const downloadWorkflow = () => {
    const blob = new Blob([workflowJson], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${workflowData.name.replace(/\s+/g, '-').toLowerCase()}-${platform}-workflow.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const copyWorkflow = async () => {
    try {
      await navigator.clipboard.writeText(workflowJson)
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
            <Workflow className="w-5 h-5 text-white mr-2" />
            <span className="text-white font-semibold">Workflow Builder</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Build{' '}
            <span className="bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 bg-clip-text text-transparent">
              Automation Workflows
            </span>
          </h1>
          
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Create powerful automation workflows for n8n and Make.com. Just describe what you want to automate, and our AI will generate the complete workflow for you!
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

        <div className="max-w-6xl mx-auto">
          {/* Step 1: Templates */}
          {step === 1 && (
            <div className="space-y-8">
              <Card className="glass-card border-white/20 bg-white/5 backdrop-blur-lg text-white">
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl">
                    <Sparkles className="w-6 h-6 mr-3" />
                    Choose a Template or Start from Scratch
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    Select a pre-built template for common automation scenarios, or create a custom workflow
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="flex justify-center mb-8">
                    <Button
                      onClick={() => setStep(2)}
                      variant="outline"
                      className="border-white/20 text-gray-300 hover:bg-white/10"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Start from Scratch
                    </Button>
                  </div>
                  
                  <div className="text-center mb-6">
                    <span className="text-lg font-medium text-gray-300">Or choose from our templates:</span>
                  </div>
                </CardContent>
              </Card>

              {/* Category Filter */}
              <div className="flex flex-wrap justify-center gap-3 mb-8">
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
                    {category} {category !== 'All' && `(${templates.filter(t => t.category === category).length})`}
                  </button>
                ))}
              </div>

              {/* Templates Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredTemplates.map((template) => {
                  const IconComponent = template.icon
                  return (
                    <Card 
                      key={template.id}
                      className="glass-card border-white/20 bg-white/5 backdrop-blur-lg text-white card-3d transition-all duration-300 hover:bg-white/10 cursor-pointer"
                      onClick={() => handleTemplateSelect(template)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <IconComponent className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex flex-col">
                            <Badge className="bg-white/10 text-white border-white/20 text-xs mb-1">
                              {template.category}
                            </Badge>
                            <Badge 
                              className={`text-xs ${
                                template.complexity === 'Simple' ? 'bg-green-500/20 text-green-400 border-green-500/20' :
                                template.complexity === 'Medium' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20' :
                                'bg-red-500/20 text-red-400 border-red-500/20'
                              }`}
                            >
                              {template.complexity}
                            </Badge>
                          </div>
                        </div>
                        <CardTitle className="text-lg font-semibold text-white">
                          {template.name}
                        </CardTitle>
                        <CardDescription className="text-gray-300 text-sm">
                          {template.description}
                        </CardDescription>
                      </CardHeader>
                      
                      <CardContent className="py-2">
                        <div className="space-y-2">
                          <div className="text-xs text-gray-400">Nodes included:</div>
                          <div className="flex flex-wrap gap-1">
                            {template.nodes.map((node, index) => (
                              <Badge key={index} variant="outline" className="border-gray-600 text-gray-300 text-xs">
                                {node}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                      
                      <CardFooter className="pt-3">
                        <div className="flex items-center justify-between w-full">
                          <span className="text-sm text-gray-400">Use Case</span>
                          <ArrowRight className="w-4 h-4 text-gray-300" />
                        </div>
                      </CardFooter>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}

          {/* Step 2: Configuration */}
          {step === 2 && (
            <Card className="glass-card border-white/20 bg-white/5 backdrop-blur-lg text-white">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl">
                  <Settings className="w-6 h-6 mr-3" />
                  Workflow Configuration
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Configure your workflow details and AI provider
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">
                      Workflow Name
                    </label>
                    <Input
                      placeholder="e.g., Email Notification System"
                      value={workflowData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="bg-white/5 border-white/20 text-white placeholder-gray-400"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">
                      Target Platform
                    </label>
                    <select
                      value={platform}
                      onChange={(e) => setPlatform(e.target.value)}
                      className="w-full bg-white/5 border border-white/20 text-white rounded-md px-3 py-2 focus:border-white/40 focus:outline-none"
                    >
                      <option value="n8n" className="bg-gray-800">n8n</option>
                      <option value="make" className="bg-gray-800">Make.com</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Description
                  </label>
                  <Textarea
                    placeholder="Brief description of what this workflow does..."
                    value={workflowData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="bg-white/5 border-white/20 text-white placeholder-gray-400"
                    rows={3}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-3 block">
                    AI Provider
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {providers.map((provider) => (
                      <div
                        key={provider.id}
                        onClick={() => handleInputChange('provider', provider.id)}
                        className={`p-4 rounded-lg border cursor-pointer transition-all ${
                          workflowData.provider === provider.id
                            ? 'border-yellow-400 bg-yellow-400/10'
                            : 'border-white/20 bg-white/5 hover:bg-white/10'
                        }`}
                      >
                        <div className="font-medium text-white">{provider.name}</div>
                        <div className="text-sm text-gray-300">{provider.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block flex items-center">
                    API Key
                    <Badge variant="outline" className="border-yellow-400 text-yellow-400 text-xs ml-2">
                      Required
                    </Badge>
                  </label>
                  <Input
                    type="password"
                    placeholder={`Enter your ${providers.find(p => p.id === workflowData.provider)?.name} API key`}
                    value={workflowData.apiKey}
                    onChange={(e) => handleInputChange('apiKey', e.target.value)}
                    className="bg-white/5 border-white/20 text-white placeholder-gray-400"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Describe Your Automation
                  </label>
                  <Textarea
                    placeholder="Describe what you want to automate in detail. For example: 'When someone submits a contact form on my website, I want to send them a welcome email and add their information to my CRM system.'"
                    value={workflowData.automationDescription}
                    onChange={(e) => handleInputChange('automationDescription', e.target.value)}
                    className="bg-white/5 border-white/20 text-white placeholder-gray-400"
                    rows={5}
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
                  disabled={!workflowData.name || !workflowData.apiKey || !workflowData.automationDescription}
                  className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600"
                >
                  Next: Review & Generate
                </Button>
              </CardFooter>
            </Card>
          )}

          {/* Step 3: Review & Generate */}
          {step === 3 && (
            <Card className="glass-card border-white/20 bg-white/5 backdrop-blur-lg text-white">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl">
                  <Eye className="w-6 h-6 mr-3" />
                  Review & Generate
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Review your workflow configuration and generate the automation
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium text-white mb-3">Workflow Details</h3>
                    <div className="space-y-2 text-sm">
                      <div><span className="text-gray-400">Name:</span> {workflowData.name}</div>
                      <div><span className="text-gray-400">Platform:</span> {platform}</div>
                      <div><span className="text-gray-400">Provider:</span> {providers.find(p => p.id === workflowData.provider)?.name}</div>
                      <div><span className="text-gray-400">Template:</span> {workflowData.templateId ? templates.find(t => t.id === workflowData.templateId)?.name : 'Custom'}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-white mb-3">Configuration</h3>
                    <div className="space-y-2 text-sm">
                      <div><span className="text-gray-400">API Key:</span> ••••••••••••••••</div>
                      <div><span className="text-gray-400">Description:</span> {workflowData.description ? 'Added' : 'None'}</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/5 p-4 rounded-lg">
                  <h4 className="font-medium text-white mb-2">Automation Description</h4>
                  <p className="text-gray-300 text-sm">{workflowData.automationDescription}</p>
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
                  onClick={generateWorkflow}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating Workflow...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4 mr-2" />
                      Generate Workflow
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          )}

          {/* Step 4: Generated Workflow */}
          {step === 4 && generatedWorkflow && (
            <div className="space-y-8">
              <Card className="glass-card border-white/20 bg-white/5 backdrop-blur-lg text-white">
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl">
                    <Check className="w-6 h-6 mr-3 text-green-400" />
                    Workflow Generated Successfully!
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    Your {platform} workflow is ready. Download the JSON file or copy the code.
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                    <h3 className="font-medium text-green-400 mb-2">✅ Workflow Summary</h3>
                    <div className="space-y-1 text-sm">
                      <div><span className="text-gray-400">Name:</span> {workflowData.name}</div>
                      <div><span className="text-gray-400">Platform:</span> {platform}</div>
                      <div><span className="text-gray-400">Nodes:</span> {generatedWorkflow.nodeCount || 'Multiple'}</div>
                      <div><span className="text-gray-400">Status:</span> <span className="text-green-400">Ready for Import</span></div>
                    </div>
                  </div>
                  
                  {/* Visual Workflow Preview */}
                  {generatedWorkflow.visualPreview && (
                    <div className="bg-white/5 p-4 rounded-lg">
                      <h3 className="font-medium text-white mb-3">Visual Preview</h3>
                      <div className="text-sm text-gray-300">
                        {generatedWorkflow.visualPreview}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex space-x-4">
                    <Button
                      onClick={downloadWorkflow}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download JSON
                    </Button>
                    <Button
                      onClick={copyWorkflow}
                      variant="outline"
                      className="flex-1 border-white/20 text-gray-300 hover:bg-white/10"
                    >
                      {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                      {copied ? 'Copied!' : 'Copy JSON'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              {/* JSON Code Display */}
              <Card className="glass-card border-white/20 bg-white/5 backdrop-blur-lg text-white">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Code className="w-5 h-5 mr-3" />
                    Generated Workflow JSON
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <pre className="bg-gray-900/50 p-4 rounded-lg text-sm text-gray-300 overflow-x-auto max-h-96">
                      {workflowJson}
                    </pre>
                  </div>
                </CardContent>
                <CardFooter className="flex space-x-4">
                  <Button
                    onClick={() => {
                      setWorkflowData({ name: '', description: '', provider: 'openai', apiKey: '', automationDescription: '', templateId: null })
                      setStep(1)
                      setGeneratedWorkflow(null)
                    }}
                    variant="outline"
                    className="flex-1 border-white/20 text-gray-300 hover:bg-white/10"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Another
                  </Button>
                  <Button
                    onClick={() => window.open(platform === 'n8n' ? 'https://n8n.io/docs/getting-started/' : 'https://www.make.com/en/help/getting-started', '_blank')}
                    className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600"
                  >
                    <Globe className="w-4 h-4 mr-2" />
                    How to Import
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}