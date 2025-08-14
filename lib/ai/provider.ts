import { createOpenAI } from '@ai-sdk/openai';
import { createOllama } from 'ollama-ai-provider';







// Centralized OpenAI provider instance
export const openai = createOllama({
  baseURL: process.env.OPENAI_BASE_URL,
});

// BGE-M3 embedding model for RAG
export const bgeEmbedding = openai.textEmbeddingModel('bge-m3');

// Optional thin wrapper matching existing usage in some routes
export const myProvider = {
  languageModel: (modelName: string) => openai(modelName),
  embeddingModel: () => bgeEmbedding,
};


