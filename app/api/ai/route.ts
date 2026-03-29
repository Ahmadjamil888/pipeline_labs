import { NextRequest, NextResponse } from 'next/server';

export type AIProvider = 'openrouter' | 'deepseek' | 'gemini' | 'groq';

interface AIServiceConfig {
  provider: AIProvider;
  model?: string;
  apiKey?: string;
}

interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface AIResponse {
  content: string;
  model: string;
  provider: AIProvider;
  usage?: any;
}

// AI Service that routes to different providers
export class AIService {
  private config: AIServiceConfig;

  constructor(config: AIServiceConfig) {
    this.config = config;
  }

  async chat(messages: AIMessage[], temperature = 0.7, maxTokens = 1500): Promise<AIResponse> {
    switch (this.config.provider) {
      case 'deepseek':
        return this.callDeepSeek(messages, temperature, maxTokens);
      case 'gemini':
        return this.callGemini(messages, temperature, maxTokens);
      case 'groq':
        return this.callGroq(messages, temperature, maxTokens);
      case 'openrouter':
      default:
        return this.callOpenRouter(messages, temperature, maxTokens);
    }
  }

  private async callDeepSeek(messages: AIMessage[], temperature: number, maxTokens: number): Promise<AIResponse> {
    const apiKey = this.config.apiKey || process.env.DEEPSEEK_API_KEY;
    
    if (!apiKey) {
      throw new Error('DeepSeek API key not configured');
    }

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.config.model || 'deepseek-chat',
        messages,
        temperature,
        max_tokens: maxTokens,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`DeepSeek API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    
    return {
      content: data.choices?.[0]?.message?.content || '',
      model: data.model,
      provider: 'deepseek',
      usage: data.usage,
    };
  }

  private async callGemini(messages: AIMessage[], temperature: number, maxTokens: number): Promise<AIResponse> {
    const apiKey = this.config.apiKey || process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error('Gemini API key not configured');
    }

    // Convert messages to Gemini format
    const contents = [];
    let systemPrompt = '';

    for (const msg of messages) {
      if (msg.role === 'system') {
        systemPrompt = msg.content;
        continue;
      }
      contents.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: systemPrompt ? `${systemPrompt}\n\n${msg.content}` : msg.content }]
      });
      systemPrompt = ''; // Only use system prompt once
    }

    const model = this.config.model || 'gemini-1.5-flash';
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature,
          maxOutputTokens: maxTokens,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    
    return {
      content: data.candidates?.[0]?.content?.parts?.[0]?.text || '',
      model: data.modelVersion || model,
      provider: 'gemini',
      usage: data.usageMetadata,
    };
  }

  private async callOpenRouter(messages: AIMessage[], temperature: number, maxTokens: number): Promise<AIResponse> {
    const apiKey = this.config.apiKey || process.env.OPENROUTER_API_KEY;
    
    if (!apiKey) {
      throw new Error('OpenRouter API key not configured');
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        'X-Title': 'Pipeline Labs',
      },
      body: JSON.stringify({
        model: this.config.model || 'meta-llama/llama-3.1-8b-instruct:free',
        messages,
        temperature,
        max_tokens: maxTokens,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    
    return {
      content: data.choices?.[0]?.message?.content || '',
      model: data.model,
      provider: 'openrouter',
      usage: data.usage,
    };
  }

  private async callGroq(messages: AIMessage[], temperature: number, maxTokens: number, retries = 3): Promise<AIResponse> {
    const apiKey = this.config.apiKey || process.env.GROQ_API_KEY;
    
    if (!apiKey) {
      throw new Error('Groq API key not configured');
    }

    const model = this.config.model || 'llama-3.1-8b-instant';
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            messages,
            temperature,
            max_tokens: maxTokens,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const error = await response.text();
          throw new Error(`Groq API error: ${response.status} - ${error}`);
        }

        const data = await response.json();
        
        return {
          content: data.choices?.[0]?.message?.content || '',
          model: data.model,
          provider: 'groq',
          usage: data.usage,
        };
      } catch (error: any) {
        console.error(`Groq attempt ${attempt} failed:`, error.message);
        
        // Check if it's a connection timeout
        if (error.message?.includes('timeout') || error.message?.includes('ConnectTimeoutError')) {
          console.error('Groq API connection timeout - check network/firewall settings');
        }
        
        if (attempt === retries) {
          // Return a special error that the UI can handle
          throw new Error(`GROQ_TIMEOUT:${error.message}`);
        }
        
        // Exponential backoff: wait 1s, 2s, 4s between retries
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt - 1) * 1000));
      }
    }
    
    throw new Error('Groq API failed after all retry attempts');
  }
}

// API Route Handler
export async function POST(req: NextRequest) {
  try {
    const { message, history, systemPrompt, provider = 'groq', model } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const messages: AIMessage[] = [
      ...(systemPrompt ? [{ role: 'system' as const, content: systemPrompt }] : []),
      ...(history || []).map((h: any) => ({ 
        role: h.role as 'user' | 'assistant', 
        content: h.content 
      })),
      { role: 'user', content: message }
    ];

    const aiService = new AIService({ provider: provider as AIProvider, model });
    const result = await aiService.chat(messages);

    return NextResponse.json(result);

  } catch (error: any) {
    console.error('AI Service error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process request' },
      { status: 500 }
    );
  }
}

// Get available providers and models
export async function GET() {
  const providers = [
    {
      id: 'groq',
      name: 'Groq (Fast)',
      models: [
        { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B (560 t/s)', free: false },
        { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B (280 t/s)', free: false },
        { id: 'openai/gpt-oss-120b', name: 'GPT-OSS 120B (500 t/s)', free: false },
        { id: 'openai/gpt-oss-20b', name: 'GPT-OSS 20B (1000 t/s)', free: false },
      ]
    },
    {
      id: 'openrouter',
      name: 'OpenRouter',
      models: [
        { id: 'meta-llama/llama-3.1-8b-instruct:free', name: 'Llama 3.1 8B (Free)', free: true },
        { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', free: false },
      ]
    },
    {
      id: 'deepseek',
      name: 'DeepSeek',
      models: [
        { id: 'deepseek-chat', name: 'DeepSeek Chat', free: false },
        { id: 'deepseek-reasoner', name: 'DeepSeek Reasoner', free: false },
      ]
    },
    {
      id: 'gemini',
      name: 'Google Gemini',
      models: [
        { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', free: false },
        { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', free: false },
      ]
    },
  ];

  return NextResponse.json({ providers });
}
