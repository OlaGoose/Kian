import { GoogleGenAI } from '@google/genai';
import { NextRequest } from 'next/server';

const SITE_CONTEXT = `
You are the AI assistant on this personal website. You are trained on the author's writings, projects, and thinking.
The author is a full-stack developer and builder who focuses on creating fast, accessible, and useful software products.
Answer questions in a minimalist, direct, and helpful style — reflecting the author's personality.
If asked about specific personal details you don't know, be honest but redirect to what you do know.
`;

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json({ error: 'AI not configured' }, { status: 503 });
  }

  try {
    const { messages, locale = 'en' } = await req.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return Response.json({ error: 'Invalid messages' }, { status: 400 });
    }

    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `${SITE_CONTEXT}\nRespond in ${locale === 'zh' ? 'Chinese (Simplified)' : 'English'}.`;

    // Convert messages to Gemini format (skip the initial model greeting)
    const history = messages
      .slice(0, -1) // All but last
      .filter((m: { role: string; text: string }) => m.text)
      .map((m: { role: string; text: string }) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }],
      }));

    const lastMessage = messages[messages.length - 1];

    // Use streaming for better UX
    const stream = ai.models.generateContentStream({
      model: 'gemini-2.0-flash',
      contents: [
        ...history,
        { role: 'user', parts: [{ text: lastMessage.text }] },
      ],
      config: { systemInstruction },
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of await stream) {
            const text = chunk.text;
            if (text) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
