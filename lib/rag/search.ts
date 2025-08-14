import { embed } from 'ai';
import { RAG_CONFIG } from './config';

export interface SearchResult {
  id: string;
  text: string;
  filename: string;
  chunkIndex: number;
  score: number;
}

export class DocumentSearch {
  /**
   * Search for relevant documents based on a query
   */
  async searchDocuments(query: string, topK: number = RAG_CONFIG.TOP_K): Promise<SearchResult[]> {
    try {
      // Generate embedding for the query
      const { embedding } = await embed({
        model: RAG_CONFIG.embeddingModel,
        value: query,
      });

      // Search in vector database
      const results = await RAG_CONFIG.vectorStore.query({
        indexName: RAG_CONFIG.DOCUMENTS_COLLECTION,
        queryVector: embedding,
        topK,
        includeVector: false,
      });

      // Transform results to our format
      const searchResults: SearchResult[] = results
        .filter(result => result.score >= RAG_CONFIG.MIN_SIMILARITY_SCORE)
        .map(result => ({
          id: result.id,
          text: result.metadata?.text || '',
          filename: result.metadata?.filename || 'unknown',
          chunkIndex: result.metadata?.chunkIndex || 0,
          score: result.score,
        }));

      return searchResults;
    } catch (error) {
      console.error('Error searching documents:', error);
      throw error;
    }
  }

  /**
   * Get context for RAG-enhanced chat
   */
  async getRelevantContext(query: string): Promise<string> {
    const results = await this.searchDocuments(query);
    
    if (results.length === 0) {
      return '';
    }

    // Format context for the LLM
    const context = results
      .map((result, index) => {
        const sourceInfo = `[Kaynak: ${result.filename}, Bölüm: ${result.chunkIndex + 1}]`;
        return `${index + 1}. ${result.text}\n${sourceInfo}`;
      })
      .join('\n\n');

    return context;
  }

  /**
   * Check if vector database has documents
   */
  async hasDocuments(): Promise<boolean> {
    try {
      const stats = await RAG_CONFIG.vectorStore.describeIndex({
        indexName: RAG_CONFIG.DOCUMENTS_COLLECTION,
      });
      return stats.count > 0;
    } catch (error) {
      console.log('Vector database not initialized or empty');
      return false;
    }
  }
}
