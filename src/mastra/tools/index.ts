import { createTool } from '@mastra/core';
import { z } from 'zod';
import { DocumentSearch } from '../../../lib/rag/search';

const documentSearch = new DocumentSearch();

export const searchDocumentsTool = createTool({
  id: 'search_documents',
  description: 'İlk yardım belgelerinde arama yapar ve konuyla ilgili bilgileri getirir',
  inputSchema: z.object({
    query: z.string().describe('Aranacak kelime veya soru'),
    topK: z.number().optional().default(5).describe('Getrilecek sonuç sayısı'),
  }),
  execute: async ({ context }) => {
    try {
      const { query, topK } = context;
      const results = await documentSearch.searchDocuments(query, topK);
      
      if (results.length === 0) {
        return {
          success: false,
          message: 'Bu konuyla ilgili belgede bilgi bulunamadı.',
          results: [],
        };
      }

      return {
        success: true,
        message: `${results.length} adet ilgili bilgi bulundu.`,
        results: results.map(result => ({
          text: result.text,
          source: `${result.filename} (Bölüm ${result.chunkIndex + 1})`,
          relevanceScore: Math.round(result.score * 100),
        })),
      };
    } catch (error) {
      console.error('Error searching documents:', error);
      return {
        success: false,
        message: 'Arama sırasında bir hata oluştu.',
        error: error instanceof Error ? error.message : 'Bilinmeyen hata',
      };
    }
  },
});

export const getContextTool = createTool({
  id: 'get_context_for_question',
  description: 'Sorulan soruya göre ilk yardım belgelerinden bağlam bilgisi getirir',
  inputSchema: z.object({
    question: z.string().describe('Cevaplamak için bağlam aranan soru'),
  }),
  execute: async ({ context }) => {
    try {
      const { question } = context;
      const contextText = await documentSearch.getRelevantContext(question);
      
      if (!contextText) {
        return {
          hasContext: false,
          message: 'Bu soruyla ilgili belgede bilgi bulunamadı.',
        };
      }

      return {
        hasContext: true,
        context: contextText,
        message: 'İlgili bağlam bilgileri bulundu.',
      };
    } catch (error) {
      console.error('Error getting context:', error);
      return {
        hasContext: false,
        message: 'Bağlam bilgisi alınırken hata oluştu.',
        error: error instanceof Error ? error.message : 'Bilinmeyen hata',
      };
    }
  },
});

export const ragTools = {
  searchDocumentsTool,
  getContextTool,
};
