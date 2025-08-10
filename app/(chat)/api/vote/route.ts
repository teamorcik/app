import { auth } from '@/app/(auth)/auth';
import { getVotesByChatId, voteMessage } from '@/lib/db/queries';
import { verifyToken, extractTokenFromHeader } from '@/lib/auth/token';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const chatId = searchParams.get('chatId');

  if (!chatId) {
    return new Response('chatId is required', { status: 400 });
  }

  // Try token auth first
  let userId: string | undefined;
  const authHeader = request.headers.get('authorization');
  if (authHeader) {
    const token = extractTokenFromHeader(authHeader);
    if (token) {
      const payload = await verifyToken(token);
      if (payload) {
        userId = payload.id;
      }
    }
  }

  // If no token or invalid token, try session auth
  if (!userId) {
    const session = await auth();
    if (session?.user?.id) {
      userId = session.user.id;
    }
  }

  // If no valid auth found
  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const votes = await getVotesByChatId({ id: chatId });
    return Response.json(votes, { status: 200 });
  } catch (error) {
    return Response.json([], { status: 200 });
  }
}

export async function PATCH(request: Request) {
  const {
    chatId,
    messageId,
    type,
  }: { chatId: string; messageId: string; type: 'up' | 'down' } =
    await request.json();

  if (!chatId || !messageId || !type) {
    return new Response('messageId and type are required', { status: 400 });
  }

  // Try token auth first
  let userId: string | undefined;
  const authHeader = request.headers.get('authorization');
  if (authHeader) {
    const token = extractTokenFromHeader(authHeader);
    if (token) {
      const payload = await verifyToken(token);
      if (payload) {
        userId = payload.id;
      }
    }
  }

  // If no token or invalid token, try session auth
  if (!userId) {
    const session = await auth();
    if (session?.user?.id) {
      userId = session.user.id;
    }
  }

  // If no valid auth found
  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    await voteMessage({
      chatId,
      messageId,
      type: type,
    });
    return new Response('Message voted', { status: 200 });
  } catch (error) {
    return new Response('Vote failed', { status: 200 }); // Return 200 even if vote fails
  }
}
