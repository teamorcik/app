import { createOpenAI } from '@ai-sdk/openai';

// Centralized OpenAI provider instance
export const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL,
});

// Optional thin wrapper matching existing usage in some routes
export const myProvider = {
  languageModel: (modelName: string) => openai(modelName),
  imageModel: (modelName: string) => openai.image(modelName),
};


