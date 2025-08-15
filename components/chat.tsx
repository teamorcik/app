'use client';

import type { Message } from 'ai';
import { useChat } from 'ai/react';
import useSWR, { useSWRConfig } from 'swr';

import { ChatHeader } from '@/components/chat-header';
import type { Vote } from '@/lib/db/schema';
import { fetcher } from '@/lib/utils';

import { Block } from './block';
import { ChatInput } from './chat-input';
import { Messages } from './messages';
import type { ModeType } from '@/lib/mode';
import { useBlockSelector } from '@/hooks/use-block';
import { useChatMode } from '@/hooks/use-chat-mode';

export function Chat({
  id,
  initialMessages,
  selectedModelId,
  selectedModeType,
  isReadonly,
}: {
  id: string;
  initialMessages: Array<Message>;
  selectedModelId: string;
  selectedModeType: ModeType;
  isReadonly: boolean;
}) {
  const { mutate } = useSWRConfig();

  // Get the current mode from the hook (this updates when user switches modes)
  const { modeType } = useChatMode({
    chatId: id,
    initialMode: selectedModeType,
  });

  // Route to different API endpoints based on current mode
  const apiEndpoint = modeType === 'ilkyardim' ? '/api/chat-rag' : '/api/chat-open';

  const {
    messages,
    setMessages,
    handleSubmit,
    input,
    setInput,
    append,
    isLoading,
    stop,
    reload,
  } = useChat({
    api: apiEndpoint,
    id: `${id}-${modeType}`, // Add mode to ID to restart chat when mode changes
    body: { id, selectedChatModel: selectedModelId, mode: modeType },
    initialMessages,
    experimental_throttle: 100,
    onFinish: async (message) => {
      console.log('Chat finished successfully', message);
      
      // Save the assistant message to database
      try {
        await fetch('/api/save-messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chatId: id,
            messages: [message],
          }),
        });
      } catch (error) {
        console.error('Failed to save assistant message:', error);
      }
      
      mutate('/api/history');
    },
    onError: (error) => {
      console.error('Chat error:', error);
    },
    onResponse: (response) => {
      console.log('Chat response received:', response);
    },
  });

  const { data: votes } = useSWR<Array<Vote>>(
    `/api/vote?chatId=${id}`,
    fetcher,
  );

  const isBlockVisible = useBlockSelector((state) => state.isVisible);

  return (
    <>
      <div className="flex flex-col min-w-0 h-dvh bg-background">
        <ChatHeader
          chatId={id}
          selectedModelId={selectedModelId}
          selectedModeType={modeType}
          isReadonly={isReadonly}
        />

        <Messages
          chatId={id}
          isLoading={isLoading}
          votes={votes}
          messages={messages}
          setMessages={setMessages}
          reload={reload}
          isReadonly={isReadonly}
          isBlockVisible={isBlockVisible}
        />

        <form className="flex mx-auto px-4 bg-background pb-4 md:pb-6 gap-2 w-full md:max-w-3xl">
          {!isReadonly && (
            <ChatInput
              chatId={id}
              input={input}
              setInput={setInput}
              handleSubmit={handleSubmit}
              isLoading={isLoading}
              stop={stop}
              messages={messages}
              setMessages={setMessages}
              append={append}
              selectedModeType={modeType}
            />
          )}
        </form>
      </div>

      <Block
        chatId={id}
        input={input}
        setInput={setInput}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
        stop={stop}
        append={append}
        messages={messages}
        setMessages={setMessages}
        reload={reload}
        votes={votes}
        isReadonly={isReadonly}
      />
    </>
  );
}
