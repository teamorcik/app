#!/usr/bin/env tsx

import { DocumentProcessor } from '../lib/rag/document-processor';
import path from 'path';

async function main() {
  console.log('🚀 Starting document processing...');
  
  try {
    const documentsPath = path.join(process.cwd(), 'documents');
    const processor = new DocumentProcessor(documentsPath);
    
    // Ensure data directory exists
    const fs = await import('fs/promises');
    const dataDir = path.join(process.cwd(), 'data');
    const chromaDir = path.join(dataDir, 'chroma');
    
    try {
      await fs.mkdir(dataDir, { recursive: true });
      await fs.mkdir(chromaDir, { recursive: true });
      console.log('✓ Data directories created');
    } catch (error) {
      console.log('✓ Data directories already exist');
    }
    
    // Process and store all documents
    await processor.processAndStoreAllDocuments();
    
    console.log('✅ Document processing completed successfully!');
    console.log('📊 Your RAG system is now ready to use.');
    
  } catch (error) {
    console.error('❌ Error during document processing:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
