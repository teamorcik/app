import { LibSQLVector } from '@mastra/libsql';
import { bgeEmbedding } from '../ai/provider';
import path from 'path';

// LibSQL configuration for file-based storage
export const vectorStore = new LibSQLVector({
  connectionUrl: `file:${path.join(process.cwd(), 'data', 'vectors.db')}`,
});

// RAG configuration
export const RAG_CONFIG = {
  // Vector database settings
  vectorStore,
  embeddingModel: bgeEmbedding,
  
  // Collection names
  DOCUMENTS_COLLECTION: 'firstaid_documents',
  
  // Embedding settings
  VECTOR_DIMENSION: 1024, // BGE-M3 dimension
  
  // Document processing settings
  CHUNK_SIZE: 512,
  CHUNK_OVERLAP: 50,
  
  // Search settings
  TOP_K: 7,
  MIN_SIMILARITY_SCORE: 0.6,
} as const;
