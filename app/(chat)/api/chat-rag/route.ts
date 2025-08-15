import { type CoreMessage, type Message, createDataStreamResponse, smoothStream, streamText } from 'ai';

import { auth } from '@/app/(auth)/auth';
import { openai } from '@/lib/ai/provider';
import { getSystemPromptForMode } from '@/lib/ai/prompts';
import { DocumentSearch } from '@/lib/rag/search';
import {
  deleteChatById,
  getChatById,
  saveChat,
  saveMessages,
} from '@/lib/db/queries';
import { generateUUID, getMostRecentUserMessage } from '@/lib/utils';
import type { ModeType } from '@/lib/mode';

// UUID validation function
function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

import { generateTitleFromUserMessage } from '../../actions';


export const maxDuration = 60;

const documentSearch = new DocumentSearch();

export async function POST(request: Request) {
  const {
    id,
    messages,
    selectedChatModel,
    mode,
  }: { 
    id: string; 
    messages: Array<Message>; 
    selectedChatModel: string;
    mode?: ModeType;
  } = await request.json();

  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    return new Response('Yetkisiz erişim', { status: 401 });
  }

  const userMessage = getMostRecentUserMessage(messages as CoreMessage[]);

  if (!userMessage) {
    return new Response('Kullanıcı mesajı bulunamadı', { status: 400 });
  }

  let chat = await getChatById({ id });

  if (!chat) {
    let title = 'Yeni sohbet';
    try {
      title = await generateTitleFromUserMessage({ message: userMessage });
    } catch (error) {
      console.error('Failed to generate title, using fallback', error);
    }
    await saveChat({ id, userId: session.user.id, title });
  }

  // Validate and fix user message ID if needed
  // Note: CoreUserMessage doesn't have id property, so we generate a new one
  const messageId = generateUUID();

  await saveMessages({
    messages: [{ ...userMessage, id: messageId, createdAt: new Date(), chatId: id }],
  });

  return createDataStreamResponse({
    execute: async (dataStream) => {
      // Get mode-specific system prompt
      const baseSystemPrompt = getSystemPromptForMode(mode || 'ilkyardim');
      
      try {
        // Get relevant context from documents
        const relevantContext = await documentSearch.getRelevantContext(userMessage.content as string);
        
        // Enhanced system prompt with RAG context
        let enhancedSystemPrompt = baseSystemPrompt;
        
        if (relevantContext) {
          enhancedSystemPrompt = `${baseSystemPrompt}

═══════════════════════════════════════════════════════════════
## 📚 İLK YARDIM BELGELERİNDEN ALINAN BİLGİLER
═══════════════════════════════════════════════════════════════

Aşağıdaki bilgiler kullanıcının sorusuyla doğrudan ilgili olan ilk yardım belgelerinden alınmıştır. Bu bilgileri MUTLAKA cevabınızın temelini oluşturmak için kullanın:

${relevantContext}

═══════════════════════════════════════════════════════════════
## ⚠️ ÖNEMLI TALİMATLAR
═══════════════════════════════════════════════════════════════

- MUTLAKA yukarıdaki belge içeriklerini kullanarak cevap verin
- Belgelerden alınan bilgileri TAM OLARAK aktarın, kısaltmayın
- Belgelerden referans alarak kapsamlı açıklamalar yapın  
- Adım adım prosedürleri belgelerden alıntılayarak detaylandırın
- Bu belgeler sizin birincil bilgi kaynağınızdır
- Cevabınızı bu belgelerden alınan bilgilerle destekleyin`;

        } else {
          enhancedSystemPrompt = `${baseSystemPrompt}

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
          system: baseSystemPrompt + '\n\n(Not: Belgelerden bilgi alınamadı, genel bilgilerle yanıtlıyorum)',
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
