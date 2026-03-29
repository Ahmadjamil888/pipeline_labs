import { NextRequest, NextResponse } from 'next/server';

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

export async function POST(req: NextRequest) {
  try {
    const { message, history, systemPrompt, model = 'deepseek-chat' } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    if (!DEEPSEEK_API_KEY) {
      return NextResponse.json({ error: 'DeepSeek API key not configured' }, { status: 500 });
    }

    const messages = [
      { role: 'system', content: systemPrompt || 'You are a helpful AI assistant for data preprocessing and machine learning.' },
      ...(history || []).slice(-5),
      { role: 'user', content: message }
    ];

    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('DeepSeek API error:', errorText);
      return NextResponse.json(
        { error: `DeepSeek API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    return NextResponse.json({
      content,
      model: data.model,
      usage: data.usage,
      provider: 'deepseek'
    });

  } catch (error: any) {
    console.error('DeepSeek API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process request' },
      { status: 500 }
    );
  }
}
