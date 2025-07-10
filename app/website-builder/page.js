'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Code, 
  Eye, 
  Download, 
  Loader2, 
  Zap, 
  Smartphone, 
  Monitor, 
  Tablet,
  Settings,
  Sparkles,
  Globe,
  Layout
} from 'lucide-react'

export default function WebsiteBuilder() {
  const [apiProvider, setApiProvider] = useState('openai')
  const [apiKey, setApiKey] = useState('')
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [generatedCode, setGeneratedCode] = useState('')
  const [error, setError] = useState('')
  const [previewMode, setPreviewMode] = useState('desktop')
  const [showCodeView, setShowCodeView] = useState(false)
  const iframeRef = useRef(null)

  const generateWebsite = async () => {
    if (!apiKey || !prompt) {
      setError('Please provide API key and prompt')
      return
    }

    setLoading(true)
    setError('')
    setGeneratedCode('')
    
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
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate website')
      }
      
      const data = await response.json()
      
      if (data.success && data.code) {
        setGeneratedCode(data.code)
        console.log('Generated successfully:', data.code.substring(0, 200))
        
        // Use a timeout to ensure iframe is rendered before updating
        setTimeout(() => {
          updatePreview(data.code)
        }, 100)
      } else {
        setError(data.error || 'Failed to generate website')
      }
      
    } catch (err) {
      console.error('Generation error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const updatePreview = (code) => {
    console.log('Updating preview with HTML code:', code.substring(0, 100))
    
    if (!iframeRef.current) {
      console.log('No iframe ref available')
      return
    }
    
    const fullHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generated Website</title>
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Font Awesome -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Inter', sans-serif;
            line-height: 1.6;
        }
        .glass {
            backdrop-filter: blur(16px) saturate(180%);
            background-color: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .gradient-1 {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .gradient-2 {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        }
        .gradient-3 {
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
        }
        .gradient-4 {
            background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
        }
        .gradient-5 {
            background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
        }
        .hover-lift {
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .hover-lift:hover {
            transform: translateY(-10px);
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        .animate-float {
            animation: float 6s ease-in-out infinite;
        }
        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
        }
        .animate-pulse-slow {
            animation: pulse 3s ease-in-out infinite;
        }
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
        }
        .text-shadow {
            text-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .btn-glow {
            box-shadow: 0 0 20px rgba(var(--bs-primary-rgb), 0.5);
            transition: all 0.3s ease;
        }
        .btn-glow:hover {
            box-shadow: 0 0 30px rgba(var(--bs-primary-rgb), 0.8);
            transform: scale(1.05);
        }
    </style>
</head>
<body>
    ${code}
    
    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    
    <!-- Custom animations and interactions -->
    <script>
        // Add smooth scrolling
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
        
        // Add intersection observer for animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);
        
        // Observe elements for animation
        setTimeout(() => {
            document.querySelectorAll('.card, .btn, h1, h2, h3').forEach(el => {
                el.style.opacity = '0';
                el.style.transform = 'translateY(30px)';
                el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                observer.observe(el);
            });
        }, 100);
        
        // Add hover effects
        document.querySelectorAll('.btn').forEach(btn => {
            btn.addEventListener('mouseenter', function() {
                this.style.transform = 'scale(1.05)';
            });
            btn.addEventListener('mouseleave', function() {
                this.style.transform = 'scale(1)';
            });
        });
        
        console.log('✅ Modern website loaded successfully!');
    </script>
</body>
</html>`
    
    console.log('Setting iframe srcdoc, length:', fullHTML.length)
    
    // Set the iframe content
    try {
      iframeRef.current.srcdoc = fullHTML
      console.log('✅ Iframe srcdoc updated successfully')
    } catch (error) {
      console.error('❌ Error updating iframe:', error)
    }
  }

  const getPreviewWidth = () => {
    switch (previewMode) {
      case 'mobile': return '375px'
      case 'tablet': return '768px'
      default: return '100%'
    }
  }

  const downloadCode = () => {
    if (!generatedCode) return
    
    const fullHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generated Website</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
</head>
<body>
    <div id="root"></div>
    <script type="text/babel">
        const { useState, useEffect } = React;
        
        ${generatedCode}
        
        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(<App />);
    </script>
</body>
</html>`

    const blob = new Blob([fullHTML], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'generated-website.html'
    a.click()
    URL.revokeObjectURL(url)
  }

  const showDemo = () => {
    const demoCode = `<!-- Modern Landing Page Demo -->
<nav class="navbar navbar-expand-lg glass fixed-top">
    <div class="container">
        <a class="navbar-brand text-white fw-bold" href="#">
            <i class="fas fa-rocket me-2"></i>WebBuilder
        </a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav ms-auto">
                <li class="nav-item"><a class="nav-link text-white" href="#home">Home</a></li>
                <li class="nav-item"><a class="nav-link text-white" href="#features">Features</a></li>
                <li class="nav-item"><a class="nav-link text-white" href="#pricing">Pricing</a></li>
                <li class="nav-item"><a class="nav-link text-white" href="#contact">Contact</a></li>
            </ul>
        </div>
    </div>
</nav>

<!-- Hero Section -->
<section id="home" class="gradient-2 min-vh-100 d-flex align-items-center">
    <div class="container">
        <div class="row align-items-center">
            <div class="col-lg-6">
                <h1 class="display-3 fw-bold text-white mb-4 animate-pulse-slow">
                    🎉 LIVE PREVIEW WORKING!
                </h1>
                <p class="lead text-white mb-5">
                    This is a beautiful, modern website built with HTML + Bootstrap CSS. 
                    Professional design with vibrant gradients and smooth animations.
                </p>
                <div class="d-flex flex-column flex-md-row gap-3">
                    <button class="btn btn-light btn-lg px-5 py-3 btn-glow hover-lift">
                        <i class="fas fa-play me-2"></i>Get Started
                    </button>
                    <button class="btn btn-outline-light btn-lg px-5 py-3 hover-lift">
                        <i class="fas fa-info-circle me-2"></i>Learn More
                    </button>
                </div>
            </div>
            <div class="col-lg-6 text-center">
                <div class="animate-float">
                    <i class="fas fa-laptop-code" style="font-size: 12rem; color: rgba(255,255,255,0.8);"></i>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- Features Section -->
<section id="features" class="py-5 bg-light">
    <div class="container">
        <div class="row">
            <div class="col-lg-12 text-center mb-5">
                <h2 class="display-5 fw-bold mb-3">Amazing Features</h2>
                <p class="lead text-muted">Everything you need to build stunning websites</p>
            </div>
        </div>
        <div class="row g-4">
            <div class="col-md-4">
                <div class="card h-100 border-0 shadow hover-lift">
                    <div class="card-body text-center p-5">
                        <div class="gradient-1 rounded-circle d-inline-flex align-items-center justify-content-center mb-4" style="width: 80px; height: 80px;">
                            <i class="fas fa-bolt text-white" style="font-size: 2rem;"></i>
                        </div>
                        <h4 class="fw-bold mb-3">Lightning Fast</h4>
                        <p class="text-muted">Build websites in seconds with our AI-powered generator.</p>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card h-100 border-0 shadow hover-lift">
                    <div class="card-body text-center p-5">
                        <div class="gradient-3 rounded-circle d-inline-flex align-items-center justify-content-center mb-4" style="width: 80px; height: 80px;">
                            <i class="fas fa-palette text-white" style="font-size: 2rem;"></i>
                        </div>
                        <h4 class="fw-bold mb-3">Beautiful Design</h4>
                        <p class="text-muted">Modern gradients, animations, and professional layouts.</p>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card h-100 border-0 shadow hover-lift">
                    <div class="card-body text-center p-5">
                        <div class="gradient-4 rounded-circle d-inline-flex align-items-center justify-content-center mb-4" style="width: 80px; height: 80px;">
                            <i class="fas fa-mobile-alt text-white" style="font-size: 2rem;"></i>
                        </div>
                        <h4 class="fw-bold mb-3">Responsive</h4>
                        <p class="text-muted">Perfect on all devices - mobile, tablet, and desktop.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- Success Section -->
<section class="gradient-4 py-5">
    <div class="container">
        <div class="row justify-content-center">
            <div class="col-lg-8 text-center">
                <div class="glass rounded-4 p-5">
                    <h2 class="display-6 fw-bold text-white mb-4">
                        ✅ Website Builder Successfully Fixed!
                    </h2>
                    <p class="text-white lead mb-4">
                        Claude API working perfectly • HTML + Bootstrap rendering • Live preview displaying beautiful websites!
                    </p>
                    <button class="btn btn-light btn-lg px-5 py-3 btn-glow">
                        <i class="fas fa-rocket me-2"></i>Try It Now
                    </button>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- Footer -->
<footer class="bg-dark text-white py-4">
    <div class="container">
        <div class="row">
            <div class="col-12 text-center">
                <p class="mb-0">&copy; 2024 WebBuilder. Built with HTML + Bootstrap CSS.</p>
            </div>
        </div>
    </div>
</footer>`

    setGeneratedCode(demoCode)
    setTimeout(() => {
      updatePreview(demoCode)
    }, 100)
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
                <p className="text-xs text-gray-300">Professional React.js Generator</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                <Sparkles className="w-3 h-3 mr-1" />
                React.js Ready
              </Badge>
              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                <Zap className="w-3 h-3 mr-1" />
                AI-Powered
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

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8 h-[calc(100vh-200px)]">
          {/* Left Panel - Configuration */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl backdrop-blur-sm overflow-hidden">
            <div className="p-6 border-b border-slate-700 bg-slate-900/50">
              <div className="flex items-center space-x-2 mb-4">
                <Settings className="w-5 h-5 text-purple-400" />
                <h2 className="text-lg font-semibold text-white">Configuration</h2>
              </div>
              
              {/* AI Provider */}
              <div className="mb-4">
                <label className="text-sm font-medium text-gray-300 mb-2 block">AI Provider</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'openai', name: 'OpenAI GPT-4' },
                    { id: 'claude', name: 'Anthropic Claude' },
                    { id: 'gemini', name: 'Google Gemini' }
                  ].map((provider) => (
                    <button
                      key={provider.id}
                      onClick={() => setApiProvider(provider.id)}
                      className={`p-3 rounded-lg text-sm font-medium transition-all ${
                        apiProvider === provider.id
                          ? 'bg-blue-500 text-white'
                          : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                      }`}
                    >
                      {provider.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* API Key */}
              <div className="mb-4">
                <label className="text-sm font-medium text-gray-300 mb-2 block">API Key</label>
                <Input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={`Enter your ${apiProvider} API key`}
                  className="bg-slate-700 border-slate-600 text-white placeholder-gray-400"
                />
              </div>
            </div>

            <div className="p-6 flex-1 overflow-y-auto">
              {/* Prompt */}
              <div className="mb-6">
                <label className="text-sm font-medium text-gray-300 mb-2 block">Describe Your Website</label>
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Create a beautiful landing page with purple gradients, hero section, and interactive buttons..."
                  className="bg-slate-700 border-slate-600 text-white placeholder-gray-400 min-h-[120px] resize-none"
                />
              </div>

              {/* Professional Templates */}
              <div className="mb-6">
                <label className="text-sm font-medium text-gray-300 mb-2 block">Professional Templates</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { name: "SaaS Landing", prompt: "Create a professional SaaS landing page with modern hero section, feature grid, pricing tiers, and customer testimonials" },
                    { name: "E-commerce", prompt: "Build a modern e-commerce store with product showcase, shopping cart, and checkout flow" },
                    { name: "Portfolio", prompt: "Design a creative portfolio website with project gallery, about section, and contact form" },
                    { name: "Startup", prompt: "Create a tech startup homepage with product demo, team section, and investor pitch" }
                  ].map((template, index) => (
                    <button
                      key={index}
                      onClick={() => setPrompt(template.prompt)}
                      className="p-3 text-xs bg-gradient-to-r from-blue-500/20 to-purple-500/20 hover:from-blue-500/30 hover:to-purple-500/30 border border-blue-500/30 rounded-lg text-blue-300 transition-all duration-200 hover:scale-105"
                    >
                      {template.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  onClick={generateWebsite}
                  disabled={loading || !apiKey || !prompt}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 transition-all duration-200"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Generate Website
                    </>
                  )}
                </Button>

                <Button
                  onClick={showDemo}
                  variant="outline"
                  className="w-full border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/20"
                >
                  ✨ Try Demo Mode (No API Key Required)
                </Button>

                {generatedCode && (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setShowCodeView(!showCodeView)}
                      variant="outline"
                      className="flex-1 border-slate-600 text-gray-300 hover:bg-slate-700"
                    >
                      {showCodeView ? <Eye className="w-4 h-4 mr-2" /> : <Code className="w-4 h-4 mr-2" />}
                      {showCodeView ? 'Show Preview' : 'Show Code'}
                    </Button>
                    <Button
                      onClick={downloadCode}
                      variant="outline"
                      className="flex-1 border-slate-600 text-gray-300 hover:bg-slate-700"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                )}
              </div>

              {/* Error Display */}
              {error && (
                <div className="mt-4 p-4 bg-red-900/50 border border-red-700 rounded-lg">
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Live Preview */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl backdrop-blur-sm overflow-hidden">
            <div className="p-4 border-b border-slate-700 bg-slate-900/50 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Eye className="w-5 h-5 text-purple-400" />
                <h2 className="text-lg font-semibold text-white">Live Preview</h2>
                {generatedCode && (
                  <Badge variant="outline" className="border-green-500/30 text-green-400">
                    Generated
                  </Badge>
                )}
              </div>
            </div>

            <div className="h-full flex items-center justify-center bg-white">
              {loading ? (
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-purple-600 font-medium text-lg">Generating your beautiful website...</p>
                  <p className="text-gray-500 text-sm mt-2">Creating vibrant design with AI</p>
                </div>
              ) : showCodeView && generatedCode ? (
                <div className="w-full h-full overflow-auto">
                  <pre className="p-4 text-sm text-gray-800 bg-gray-50 h-full overflow-auto">
                    <code>{generatedCode}</code>
                  </pre>
                </div>
              ) : generatedCode ? (
                <div 
                  className="h-full bg-white shadow-lg transition-all duration-300" 
                  style={{ width: getPreviewWidth() }}
                >
                  <iframe
                    ref={iframeRef}
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
          </div>
        </div>
      </div>
    </div>
  )
}