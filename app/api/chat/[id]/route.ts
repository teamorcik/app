import { verifyToken, extractTokenFromHeader } from '@/lib/auth/token';
import { getChatById, getMessagesByChatId } from '@/lib/db/queries';
import { NextResponse } from 'next/server';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const resolvedParams = await params;
        console.log('>> params', resolvedParams);
        const id = resolvedParams.id;

        if (!id) {
            return new NextResponse('Chat ID is required', { status: 400 });
        }

        // Try token auth
        let userId: string | undefined;
        const authHeader = req.headers.get('authorization');
        if (authHeader) {
            const token = extractTokenFromHeader(authHeader);
            if (token) {
                const payload = await verifyToken(token);
                if (payload) {
                    userId = payload.id;
                }
            }
        }

        if (!userId) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        console.log('before getChatById');
        const messages = await getMessagesByChatId({ id });
        if (!messages) {
            return new NextResponse('Chat not found', { status: 404 });
        }

        // Check if chat belongs to user
        // if (chat.userId !== userId) {
        //     return new NextResponse('Unauthorized', { status: 401 });
        // }

        return NextResponse.json(messages);
    } catch (error) {
        console.error('Error getting chat:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
