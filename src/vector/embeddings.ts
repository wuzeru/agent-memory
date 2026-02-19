/**
 * Embedding service for generating vector embeddings from text
 * Uses @xenova/transformers for local embedding generation (no API required)
 */

import { pipeline } from '@xenova/transformers';

/**
 * Service for generating text embeddings
 */
export class EmbeddingService {
  private embedder: any = null;
  private modelName: string;
  private isInitialized: boolean = false;

  constructor(modelName: string = 'Xenova/all-MiniLM-L6-v2') {
    this.modelName = modelName;
  }

  /**
   * Initialize the embedding model
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      this.embedder = await pipeline('feature-extraction', this.modelName);
      this.isInitialized = true;
    } catch (error) {
      console.warn(`Warning: Failed to initialize embedding model: ${error}`);
      console.warn('Embeddings will use simple text-based fallback');
      this.isInitialized = true;  // Mark as initialized with fallback
    }
  }

  /**
   * Generate embedding for a text string
   */
  async embed(text: string): Promise<number[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    // If embedder failed to initialize, use simple fallback
    if (!this.embedder) {
      return this.simpleFallbackEmbedding(text);
    }

    try {
      const output = await this.embedder(text, { pooling: 'mean', normalize: true });
      return Array.from(output.data as Float32Array);
    } catch (error) {
      console.warn(`Warning: Embedding generation failed, using fallback`);
      return this.simpleFallbackEmbedding(text);
    }
  }

  /**
   * Simple fallback embedding based on text features
   * This is a basic TF-IDF-like approach for when the model is unavailable
   */
  private simpleFallbackEmbedding(text: string): number[] {
    const words = text.toLowerCase().split(/\s+/);
    const embedding = new Array(384).fill(0); // Match MiniLM dimension
    
    // Create a simple hash-based embedding
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      for (let j = 0; j < word.length; j++) {
        const charCode = word.charCodeAt(j);
        const index = (charCode + j * 17 + i * 31) % 384;
        embedding[index] += 1 / Math.sqrt(words.length);
      }
    }
    
    // Normalize
    const norm = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    if (norm > 0) {
      for (let i = 0; i < embedding.length; i++) {
        embedding[i] /= norm;
      }
    }
    
    return embedding;
  }

  /**
   * Generate embeddings for multiple texts in batch
   */
  async embedBatch(texts: string[]): Promise<number[][]> {
    if (!this.isInitialized || !this.embedder) {
      await this.initialize();
    }

    const embeddings: number[][] = [];
    
    for (const text of texts) {
      const embedding = await this.embed(text);
      embeddings.push(embedding);
    }

    return embeddings;
  }

  /**
   * Check if the service is initialized
   */
  isReady(): boolean {
    return this.isInitialized;
  }
}
