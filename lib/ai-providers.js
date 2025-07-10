// AI Provider Integrations for Website Builder

export async function generateWebsiteCode(provider, apiKey, prompt) {
  const systemPrompt = `You are an expert web developer and designer. Generate a complete, modern, responsive website based on the user's description. 

REQUIREMENTS:
- Use only HTML with inline Tailwind CSS classes
- Create a fully responsive design that works on mobile, tablet, and desktop
- Use modern design principles with gradients, shadows, and animations
- Include interactive elements where appropriate
- Make it visually appealing with proper spacing, typography, and colors
- Use semantic HTML structure
- Add smooth animations and hover effects using Tailwind
- Include realistic placeholder content relevant to the request
- Ensure accessibility with proper ARIA labels and alt text

IMPORTANT: 
- Return ONLY the HTML body content (no <html>, <head>, or <body> tags)
- Use Tailwind CSS classes exclusively for styling
- Make it production-ready and polished
- Include proper responsive breakpoints (sm:, md:, lg:, xl:)
- Use modern components like cards, buttons, forms, navigation
- Add subtle animations with transition and transform classes

The website should be complete and ready to use immediately.`;

  switch (provider) {
    case 'openai':
      return await generateWithOpenAI(apiKey, systemPrompt, prompt);
    case 'claude':
      return await generateWithClaude(apiKey, systemPrompt, prompt);
    case 'gemini':
      return await generateWithGemini(apiKey, systemPrompt, prompt);
    default:
      throw new Error('Unsupported AI provider');
  }
}

async function generateWithOpenAI(apiKey, systemPrompt, userPrompt) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 4000,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'OpenAI API error');
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function generateWithClaude(apiKey, systemPrompt, userPrompt) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 4000,
      system: systemPrompt,
      messages: [
        { role: 'user', content: userPrompt }
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Claude API error');
  }

  const data = await response.json();
  return data.content[0].text;
}

async function generateWithGemini(apiKey, systemPrompt, userPrompt) {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: `${systemPrompt}\n\nUser request: ${userPrompt}` }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 4000,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Gemini API error');
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}

// Extract HTML content from AI response
export function extractHTMLFromResponse(response) {
  // Remove code blocks if present
  let html = response.replace(/```html\n?/g, '').replace(/```\n?$/g, '');
  
  // Remove any surrounding whitespace
  html = html.trim();
  
  // If the response includes full HTML structure, extract just the body content
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  if (bodyMatch) {
    html = bodyMatch[1].trim();
  }
  
  // Remove html, head, and body tags if they exist
  html = html.replace(/<\/?html[^>]*>/gi, '');
  html = html.replace(/<\/?head[^>]*>/gi, '');
  html = html.replace(/<\/?body[^>]*>/gi, '');
  
  return html.trim();
}

// Validate generated HTML
export function validateHTML(html) {
  try {
    // Basic validation - check for balanced tags
    const openTags = (html.match(/<[^\/][^>]*[^\/]>/g) || []).length;
    const closeTags = (html.match(/<\/[^>]+>/g) || []).length;
    const selfClosingTags = (html.match(/<[^>]+\/>/g) || []).length;
    
    // Allow for self-closing tags
    if (openTags - selfClosingTags !== closeTags) {
      console.warn('HTML may have unbalanced tags');
    }
    
    // Check for dangerous content
    const dangerousPatterns = [
      /<script[^>]*>(?!.*tailwind).*<\/script>/gi,
      /<iframe[^>]*src=["'][^"']*(?!data:)[^"']*["']/gi,
      /javascript:/gi,
      /on\w+\s*=/gi
    ];
    
    for (const pattern of dangerousPatterns) {
      if (pattern.test(html)) {
        throw new Error('Generated HTML contains potentially unsafe content');
      }
    }
    
    return true;
  } catch (error) {
    throw new Error(`HTML validation failed: ${error.message}`);
  }
}