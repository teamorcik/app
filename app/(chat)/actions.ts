'use server';

import { type CoreUserMessage, generateText } from 'ai';
import { cookies } from 'next/headers';

import { customModel } from '@/lib/ai';
import { DEFAULT_MODEL_NAME } from '@/lib/ai/models';
import {
  deleteMessagesByChatIdAfterTimestamp,
  getMessageById,
  updateChatModeById,
} from '@/lib/db/queries';
import type { ModeType } from '@/lib/mode';

export async function saveModelId(model: string) {
  const cookieStore = await cookies();
  cookieStore.set('model-id', model);
}

export async function generateTitleFromUserMessage({
  message,
}: {
  message: CoreUserMessage;
}) {
  const { text: title } = await generateText({
    model: customModel(DEFAULT_MODEL_NAME),
    system: `\n
    * Kullanıcı bir konuşmaya başladığında, ilk mesajına göre kısa bir başlık oluştur
* Başlık 80 karakterden uzun olmamalı
* Başlık, kullanıcının mesajının özeti olmalı
* Tırnak işareti veya iki nokta kullanılmamalı
* Başlık dışında başka hiçbir şey söyleme
* Başlıkta başlık dışında başka karakter kullanma
* Markdown kullanma
`,
    prompt: JSON.stringify(message),
  });

  return title;
}

export async function deleteTrailingMessages({ id }: { id: string }) {
  try {
    const messages = await getMessageById({ id });
    
    if (!messages || messages.length === 0) {
      console.warn(`No message found with ID: ${id}`);
      return;
    }
    
    const [message] = messages;

    await deleteMessagesByChatIdAfterTimestamp({
      chatId: message.chatId,
      timestamp: message.createdAt,
    });
  } catch (error) {
    console.error('Error in deleteTrailingMessages:', error);
    throw error;
  }
}

export async function updateChatMode({
  chatId,
  mode,
}: {
  chatId: string;
  mode: ModeType;
}) {
  await updateChatModeById({ chatId, mode });
}
