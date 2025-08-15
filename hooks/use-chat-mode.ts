'use client';

import { updateChatMode } from '@/app/(chat)/actions';
import type { ModeType } from '@/lib/mode';
import { Chat } from '@/lib/db/schema';
import { useMemo } from 'react';
import useSWR, { useSWRConfig } from 'swr';

export function useChatMode({
  chatId,
  initialMode,
}: {
  chatId: string;
  initialMode: ModeType;
}) {
  const { mutate, cache } = useSWRConfig();
  const history: Array<Chat> = cache.get('/api/history')?.data;

  const { data: localMode, mutate: setLocalMode } = useSWR(
    `${chatId}-mode`,
    null,
    {
      fallbackData: initialMode,
    },
  );

  const modeType = useMemo(() => {
    if (!history) return localMode;
    const chat = history.find((chat) => chat.id === chatId);
    if (!chat) return localMode; // For new chats, use localMode instead of defaulting to 'ilkyardim'
    return chat.mode as ModeType;
  }, [history, chatId, localMode]);

  const setModeType = (updatedModeType: ModeType) => {
    setLocalMode(updatedModeType);

    mutate<Array<Chat>>(
      '/api/history',
      (history) => {
        return history
          ? history.map((chat) => {
              if (chat.id === chatId) {
                return {
                  ...chat,
                  mode: updatedModeType,
                };
              }
              return chat;
            })
          : [];
      },
      { revalidate: false },
    );

    updateChatMode({
      chatId: chatId,
      mode: updatedModeType,
    });
  };

  return { modeType, setModeType };
}


