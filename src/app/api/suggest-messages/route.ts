import { streamText, UIMessage, convertToModelMessages } from 'ai';
import { google } from '@ai-sdk/google';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const rawMessages = Array.isArray(body?.messages) ? body.messages : [];

    const uiMessages: UIMessage[] = rawMessages
      .map((msg: unknown) => {
        if (!msg || typeof msg !== 'object') return null;
        const role = (msg as { role?: unknown }).role;
        const content = (msg as { content?: unknown }).content;

        if ((role === 'user' || role === 'assistant' || role === 'system') && typeof content === 'string') {
          return {
            role,
            parts: [{ type: 'text', text: content }],
          } as UIMessage;
        }

        return null;
      })
      .filter((msg: UIMessage | null): msg is UIMessage => msg !== null);

    if (uiMessages.length === 0) {
      uiMessages.push({
        role: 'user',
        parts: [{ type: 'text', text: 'Generate 3 friendly anonymous message prompts.' }],
      } as UIMessage);
    }
  
    const prompt = "Create a list of three open-ended and engaging questions formatted as a single string. Each question should be separated by '||'. These questions are for an anonymous social messaging platform, like Qooh.me, and should be suitable for a diverse audience. Avoid personal or sensitive topics, focusing instead on universal themes that encourage friendly interaction. For example, your output should be structured like this: 'What’s a hobby you’ve recently started?||If you could have dinner with any historical figure, who would it be?||What’s a simple thing that makes you happy?'. Ensure the questions are intriguing, foster curiosity, and contribute to a positive and welcoming conversational environment."
    
    const result = streamText({
      model: google('gemini-2.5-flash'),
      messages: await convertToModelMessages(uiMessages),
      system: prompt,
    });

  return result.toUIMessageStreamResponse();
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error in /api/suggest-messages:", error);
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    } else {
      console.error("Unknown error in /api/suggest-messages:", error);
        return new Response(JSON.stringify({ error: "An unknown error occurred." }), { status: 500 });
    }
  }
}