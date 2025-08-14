import { type CoreMessage, type Message, createDataStreamResponse, smoothStream, streamText } from 'ai';

import { auth } from '@/app/(auth)/auth';
import { openai } from '@/lib/ai/provider';
import { systemPrompt } from '@/lib/ai/prompts';
import { DocumentSearch } from '@/lib/rag/search';
import {
  deleteChatById,
  getChatById,
  saveChat,
  saveMessages,
} from '@/lib/db/queries';
import { generateUUID, getMostRecentUserMessage } from '@/lib/utils';

import { generateTitleFromUserMessage } from '../../actions';
import { BlobServiceRateLimited } from '@vercel/blob';

export const maxDuration = 60;

const documentSearch = new DocumentSearch();

export async function POST(request: Request) {
  const {
    id,
    messages,
    selectedChatModel,
  }: { id: string; messages: Array<Message>; selectedChatModel: string } =
    await request.json();

  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  const userMessage = getMostRecentUserMessage(messages as CoreMessage[]);

  if (!userMessage) {
    return new Response('No user message found', { status: 400 });
  }

  let chat = await getChatById({ id });

  if (!chat) {
    let title = 'New chat';
    try {
      title = await generateTitleFromUserMessage({ message: userMessage });
    } catch (error) {
      console.error('Failed to generate title, using fallback', error);
    }
    await saveChat({ id, userId: session.user.id, title });
  }

  await saveMessages({
    messages: [{ ...userMessage, id: generateUUID(), createdAt: new Date(), chatId: id }],
  });

  return createDataStreamResponse({
    execute: async (dataStream) => {
      try {
        // Get relevant context from documents
        const relevantContext = await documentSearch.getRelevantContext(userMessage.content as string);
        
        // Enhanced system prompt with RAG context
        let enhancedSystemPrompt = systemPrompt;
        
        if (relevantContext) {
          enhancedSystemPrompt = `${systemPrompt}

## İlgili Belgelerden Bilgiler

Aşağıda kullanıcının sorusuyla ilgili ilk yardım belgelerinden alınan bilgiler bulunmaktadır. Bu bilgileri kullanarak doğru ve güvenilir cevaplar verin:

${relevantContext}

## Önemli Notlar
- Yukarıdaki belgelerden alınan bilgileri kullanın
- Belge kaynaklarını belirtin
- Eğer sorulan soru belgelerle ilgili değilse, bu durumu kullanıcıya belirtin
- İlk yardım konularında her zaman güvenlik ve doğruluk önceliklidir
-cevapında kaynakları Belirtme`;

        } else {
          enhancedSystemPrompt = `${systemPrompt}

## İlk Yardım Asistanı
Bu sohbette ilk yardım belgelerinizde ilgili bilgi bulunamadı. Genel ilk yardım bilgilerimi kullanarak yardımcı olmaya çalışacağım, ancak acil durumlarda 112'yi arayın ve tıbbi personelden yardım alın.`;
        }

        const result = streamText({
          model: openai(selectedChatModel),
          system: enhancedSystemPrompt,
          messages,
          maxSteps: 5,
          experimental_transform: smoothStream({ chunking: 'word' }),
        });

        result.mergeIntoDataStream(dataStream);
      } catch (error) {
        console.error('Error in RAG chat:', error);
        
        // Fallback to regular chat if RAG fails
        const result = streamText({
          model: openai(selectedChatModel),
          system: systemPrompt + '\n\n(Not: Belgelerden bilgi alınamadı, genel bilgilerle yanıtlıyorum)',
          messages,
          maxSteps: 5,
          experimental_transform: smoothStream({ chunking: 'word' }),
        });

        result.mergeIntoDataStream(dataStream);
      }
    },
    onError: () => {
      return 'Oops, an error occurred!';
    },
  });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return new Response('Not Found', { status: 404 });
  }

  const session = await auth();

  if (!session || !session.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const chat = await getChatById({ id });

    if (chat.userId !== session.user.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    await deleteChatById({ id });

    return new Response('Chat deleted', { status: 200 });
  } catch (error) {
    return new Response('An error occurred while processing your request', {
      status: 500,
    });
  }
}
