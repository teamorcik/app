import {
	type Message,
	convertToCoreMessages,
	createDataStreamResponse,
	streamText,
} from 'ai';
import { customModel } from '@/lib/ai';
import { models } from '@/lib/ai/models';
import { systemPrompt } from '@/lib/ai/prompts';
import { generateUUID } from '@/lib/utils';

export async function POST(request: Request) {
	try {
		console.log(">> Request received");
		const { messages, modelId = 'gpt-4' } = await request.json();
		console.log(">> Messages:", messages);

		const model = models.find((m) => m.id === modelId) || models[0];
		const coreMessages = convertToCoreMessages(messages);
		const userMessageId = generateUUID();

		return createDataStreamResponse({
			execute: (dataStream) => {
				dataStream.writeData({
					type: 'user-message-id',
					content: userMessageId,
				});

				const result = streamText({
					model: customModel(model.apiIdentifier),
					system: systemPrompt,
					messages: coreMessages,
					maxSteps: 5,
				});

				result.mergeIntoDataStream(dataStream);
			},
		});

	} catch (error) {
		console.error("API Error:", error);
		return new Response(
			JSON.stringify({ error: "Failed to generate response" }),
			{ 
				status: 500,
				headers: {
					'Content-Type': 'application/json',
				}
			}
		);
	}
}

export async function GET() {
	return new Response('Ready', { status: 200 });
}
