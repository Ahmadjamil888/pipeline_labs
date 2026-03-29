import { NextRequest, NextResponse } from 'next/server';

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export async function POST(req: NextRequest) {
  try {
    const { message, history, systemPrompt, model = 'llama-3.1-8b-instant' } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    if (!GROQ_API_KEY) {
      return NextResponse.json({ error: 'Groq API key not configured' }, { status: 500 });
    }

    const messages = [
      { role: 'system', content: systemPrompt || 'You are a helpful AI assistant.' },
      ...(history || []).slice(-5),
      { role: 'user', content: message }
    ];

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7,
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API error:', errorText);
      return NextResponse.json(
        { error: `Groq API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    return NextResponse.json({
      content,
      model: data.model,
      usage: data.usage,
      provider: 'groq'
    });

  } catch (error: any) {
    console.error('Groq API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process request' },
      { status: 500 }
    );
  }
}
