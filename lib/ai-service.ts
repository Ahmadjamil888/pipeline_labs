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
  usage?: unknown;
}

const OPENROUTER_MODEL = 'meta-llama/llama-3.1-8b-instruct:free';

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
    if (!apiKey) throw new Error('DeepSeek API key not configured');

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
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
      throw new Error(`DeepSeek API error: ${response.status} - ${await response.text()}`);
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
    if (!apiKey) throw new Error('Gemini API key not configured');

    const contents = [];
    let systemPrompt = '';

    for (const msg of messages) {
      if (msg.role === 'system') {
        systemPrompt = msg.content;
        continue;
      }
      contents.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: systemPrompt ? `${systemPrompt}\n\n${msg.content}` : msg.content }],
      });
      systemPrompt = '';
    }

    const model = this.config.model || 'gemini-1.5-flash';
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature,
          maxOutputTokens: maxTokens,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} - ${await response.text()}`);
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
    if (!apiKey) throw new Error('OpenRouter API key not configured');

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        'X-Title': 'Pipeline Labs',
      },
      body: JSON.stringify({
        model: this.config.model || OPENROUTER_MODEL,
        messages,
        temperature,
        max_tokens: maxTokens,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status} - ${await response.text()}`);
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
    if (!apiKey) throw new Error('Groq API key not configured');

    const model = this.config.model || 'llama-3.1-8b-instant';

    for (let attempt = 1; attempt <= retries; attempt += 1) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
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
          throw new Error(`Groq API error: ${response.status} - ${await response.text()}`);
        }

        const data = await response.json();
        return {
          content: data.choices?.[0]?.message?.content || '',
          model: data.model,
          provider: 'groq',
          usage: data.usage,
        };
      } catch (error) {
        if (attempt === retries) {
          throw new Error(`GROQ_TIMEOUT:${error instanceof Error ? error.message : 'Unknown error'}`);
        }

        await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt - 1) * 1000));
      }
    }

    throw new Error('Groq API failed after all retry attempts');
  }
}
