import { mastra } from '@/src/mastra';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    console.log(">> Messages:", messages);
    const myAgent = mastra.getAgent('weatherAgent');
    const stream = await myAgent.stream(messages);

    return stream.toDataStreamResponse();
  } catch (error) {
    console.error('Error in chat stream:', error);
    return new Response('Error processing chat request', { status: 500 });
  }
}