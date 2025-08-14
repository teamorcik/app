import fs from 'fs/promises';
import path from 'path';
import pdfParse from 'pdf-parse';
import { MDocument } from '@mastra/rag';
import { embedMany } from 'ai';
import { RAG_CONFIG } from './config';

export interface ProcessedDocument {
  filename: string;
  chunks: Array<{
    text: string;
    metadata: {
      filename: string;
      chunkIndex: number;
      text: string;
    };
  }>;
  embeddings: number[][];
}

export class DocumentProcessor {
  private documentsPath: string;

  constructor(documentsPath: string = path.join(process.cwd(), 'documents')) {
    this.documentsPath = documentsPath;
  }

  /**
   * Process a single PDF file
   */
  async processPDFFile(filename: string): Promise<ProcessedDocument> {
    const filePath = path.join(this.documentsPath, filename);
    
    try {
      // Read PDF file
      const fileBuffer = await fs.readFile(filePath);
      const pdfData = await pdfParse(fileBuffer);
      
      // Extract text content
      const text = pdfData.text;
      if (!text || text.trim().length === 0) {
        throw new Error(`No text content found in ${filename}`);
      }

      // Create document and chunk it
      const doc = MDocument.fromText(text, { filename });
      const chunks = await doc.chunk({
        strategy: 'recursive',
        maxSize: RAG_CONFIG.CHUNK_SIZE,
        overlap: RAG_CONFIG.CHUNK_OVERLAP,
      });

      // Prepare chunks with metadata
      const processedChunks = chunks.map((chunk, index) => ({
        text: chunk.text,
        metadata: {
          filename,
          chunkIndex: index,
          text: chunk.text, // Required for vector search
        },
      }));

      // Generate embeddings for all chunks
      const texts = processedChunks.map(chunk => chunk.text);
      const { embeddings } = await embedMany({
        model: RAG_CONFIG.embeddingModel,
        values: texts,
      });

      return {
        filename,
        chunks: processedChunks,
        embeddings,
      };

    } catch (error) {
      console.error(`Error processing PDF file ${filename}:`, error);
      throw error;
    }
  }

  /**
   * Process all PDF files in the documents directory
   */
  async processAllDocuments(): Promise<ProcessedDocument[]> {
    try {
      const files = await fs.readdir(this.documentsPath);
      const pdfFiles = files.filter(file => file.toLowerCase().endsWith('.pdf'));

      console.log(`Found ${pdfFiles.length} PDF files to process`);

      const processedDocuments: ProcessedDocument[] = [];

      for (const filename of pdfFiles) {
        console.log(`Processing ${filename}...`);
        try {
          const processed = await this.processPDFFile(filename);
          processedDocuments.push(processed);
          console.log(`✓ Processed ${filename}: ${processed.chunks.length} chunks`);
        } catch (error) {
          console.error(`✗ Failed to process ${filename}:`, error);
        }
      }

      return processedDocuments;
    } catch (error) {
      console.error('Error processing documents:', error);
      throw error;
    }
  }

  /**
   * Store processed documents in vector database
   */
  async storeDocuments(processedDocuments: ProcessedDocument[]): Promise<void> {
    try {
      // Create index if it doesn't exist
      await RAG_CONFIG.vectorStore.createIndex({
        indexName: RAG_CONFIG.DOCUMENTS_COLLECTION,
        dimension: RAG_CONFIG.VECTOR_DIMENSION,
        metric: 'cosine',
      });

      for (const doc of processedDocuments) {
        console.log(`Storing ${doc.filename} in vector database...`);
        
        // Prepare data for vector store
        const vectors = doc.embeddings;
        const metadata = doc.chunks.map(chunk => chunk.metadata);
        const ids = doc.chunks.map((_, index) => `${doc.filename}_chunk_${index}`);

        // Store in vector database
        await RAG_CONFIG.vectorStore.upsert({
          indexName: RAG_CONFIG.DOCUMENTS_COLLECTION,
          vectors,
          metadata,
          ids,
        });

        console.log(`✓ Stored ${doc.filename}: ${doc.chunks.length} vectors`);
      }

      console.log('All documents stored successfully!');
    } catch (error) {
      console.error('Error storing documents:', error);
      throw error;
    }
  }

  /**
   * Complete document processing pipeline
   */
  async processAndStoreAllDocuments(): Promise<void> {
    console.log('Starting document processing pipeline...');
    
    const processedDocuments = await this.processAllDocuments();
    await this.storeDocuments(processedDocuments);
    
    console.log('Document processing pipeline completed!');
  }
}
