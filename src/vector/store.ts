/**
 * Vector storage and retrieval service
 * Inspired by alibaba/zvec - provides in-process vector database capabilities
 */

import * as fs from 'fs';
import * as path from 'path';
import { MemoryEntry, MemoryRecallResult } from '../types';

/**
 * Simple in-memory vector store with persistence
 */
export class VectorStore {
  private vectors: Map<string, { entry: MemoryEntry; embedding: number[] }>;
  private storagePath: string;

  constructor(storagePath: string = '.agent-memory/vectors') {
    this.vectors = new Map();
    this.storagePath = storagePath;
    this.ensureStorageDirectory();
    this.loadVectors();
  }

  /**
   * Ensure storage directory exists
   */
  private ensureStorageDirectory(): void {
    if (!fs.existsSync(this.storagePath)) {
      fs.mkdirSync(this.storagePath, { recursive: true });
    }
  }

  /**
   * Store a memory entry with its embedding
   */
  async store(entry: MemoryEntry, embedding: number[]): Promise<void> {
    this.vectors.set(entry.id, { entry, embedding });
    await this.saveVectors();
  }

  /**
   * Search for similar memories using cosine similarity
   */
  async search(queryEmbedding: number[], limit: number = 5, threshold: number = 0.5): Promise<MemoryRecallResult[]> {
    const results: MemoryRecallResult[] = [];

    for (const [id, { entry, embedding }] of this.vectors.entries()) {
      const similarity = this.cosineSimilarity(queryEmbedding, embedding);
      
      if (similarity >= threshold) {
        results.push({ entry, similarity });
      }
    }

    // Sort by similarity (descending) and limit results
    results.sort((a, b) => b.similarity - a.similarity);
    return results.slice(0, limit);
  }

  /**
   * Get a specific memory by ID
   */
  async get(id: string): Promise<MemoryEntry | null> {
    const result = this.vectors.get(id);
    return result ? result.entry : null;
  }

  /**
   * Get all memories
   */
  async getAll(): Promise<MemoryEntry[]> {
    return Array.from(this.vectors.values()).map(v => v.entry);
  }

  /**
   * Delete a memory by ID
   */
  async delete(id: string): Promise<boolean> {
    const deleted = this.vectors.delete(id);
    if (deleted) {
      await this.saveVectors();
    }
    return deleted;
  }

  /**
   * Clear all memories
   */
  async clear(): Promise<void> {
    this.vectors.clear();
    await this.saveVectors();
  }

  /**
   * Get count of stored memories
   */
  count(): number {
    return this.vectors.size;
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Vectors must have the same length');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    normA = Math.sqrt(normA);
    normB = Math.sqrt(normB);

    if (normA === 0 || normB === 0) {
      return 0;
    }

    return dotProduct / (normA * normB);
  }

  /**
   * Save vectors to disk
   */
  private async saveVectors(): Promise<void> {
    const data = Array.from(this.vectors.entries()).map(([id, { entry, embedding }]) => ({
      id,
      entry,
      embedding
    }));

    const filePath = path.join(this.storagePath, 'vectors.json');
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  }

  /**
   * Load vectors from disk
   */
  private loadVectors(): void {
    const filePath = path.join(this.storagePath, 'vectors.json');
    
    if (fs.existsSync(filePath)) {
      try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        
        for (const item of data) {
          // Convert timestamp strings back to Date objects
          if (item.entry.timestamp) {
            item.entry.timestamp = new Date(item.entry.timestamp);
          }
          this.vectors.set(item.id, {
            entry: item.entry,
            embedding: item.embedding
          });
        }
      } catch (error) {
        console.warn(`Failed to load vectors: ${error}`);
      }
    }
  }
}
