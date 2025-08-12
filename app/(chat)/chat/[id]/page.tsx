import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';

import { auth } from '@/app/(auth)/auth';
import { Chat } from '@/components/chat';
import { DEFAULT_MODEL_NAME, models } from '@/lib/ai/models';
import { getChatById, getMessagesByChatId } from '@/lib/db/queries';
import { convertToUIMessages } from '@/lib/utils';
import { DataStreamHandler } from '@/components/data-stream-handler';

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;
  const chat = await getChatById({ id });
  // Do not 404 if chat doesn't exist yet. This avoids a race during first message
  // where the client updates the URL before the chat is saved server-side.

  const session = await auth();
  const isOwner = !!session?.user?.id && session?.user?.id === chat?.userId;
  const isReadonly = chat
    ? chat.mode === 'ilkyardim'
      ? !isOwner
      : session?.user?.id !== chat.userId
    : false;

  const messagesFromDb = await getMessagesByChatId({
    id,
  });

  const cookieStore = await cookies();
  const modelIdFromCookie = cookieStore.get('model-id')?.value;
  const selectedModelId =
    models.find((model) => model.id === modelIdFromCookie)?.id ||
    DEFAULT_MODEL_NAME;

  return (
    <>
      <Chat
        id={chat?.id ?? id}
        initialMessages={convertToUIMessages(messagesFromDb)}
        selectedModelId={selectedModelId}
        selectedModeType={(chat?.mode as any) ?? 'ilkyardim'}
        isReadonly={isReadonly}
      />
      <DataStreamHandler id={id} />
    </>
  );
}
