import { NextRequest, NextResponse } from 'next/server';
import { AIProvider, AIService } from '@/lib/ai-service';

type AIMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

type RequestHistoryMessage = {
  role: 'user' | 'assistant';
  content: string;
};

// API Route Handler
export async function POST(req: NextRequest) {
  try {
    const { message, history, systemPrompt, provider = 'groq', model } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const messages: AIMessage[] = [
      ...(systemPrompt ? [{ role: 'system' as const, content: systemPrompt }] : []),
      ...((history || []) as RequestHistoryMessage[]).map((h) => ({ 
        role: h.role as 'user' | 'assistant', 
        content: h.content 
      })),
      { role: 'user', content: message }
    ];

    const aiService = new AIService({ provider: provider as AIProvider, model });
    const result = await aiService.chat(messages);

    return NextResponse.json(result);

  } catch (error) {
    console.error('AI Service error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process request' },
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
