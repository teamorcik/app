import { auth } from '@/app/(auth)/auth';
import { saveMessages } from '@/lib/db/queries';
import { generateUUID, isValidUUID } from '@/lib/utils';
import type { Message } from 'ai';

export async function POST(request: Request) {
  try {
    const { chatId, messages }: { chatId: string; messages: Array<Message> } =
      await request.json();

    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    if (!chatId || !messages || messages.length === 0) {
      return new Response('Invalid request: chatId and messages are required', { status: 400 });
    }

    // Transform messages to include required database fields
    const messagesWithDbFields = messages.map((message) => {
      // Validate and fix message ID if it's not a proper UUID
      let messageId = message.id;
      if (!messageId || !isValidUUID(messageId)) {
        messageId = generateUUID();
        console.log(`Generated new UUID for message with invalid ID: ${message.id} -> ${messageId}`);
      }
      
      return {
        ...message,
        id: messageId,
        chatId,
        createdAt: new Date(),
      };
    });

    await saveMessages({ messages: messagesWithDbFields });

    return new Response('Messages saved successfully', { status: 200 });
  } catch (error) {
    console.error('Error saving messages:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
