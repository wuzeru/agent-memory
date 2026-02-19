/**
 * Unit tests for VectorStore
 */

import * as fs from 'fs';
import { VectorStore } from '../src/vector/store';
import { MemoryEntry } from '../src/types';

describe('VectorStore', () => {
  let vectorStore: VectorStore;
  const testStoragePath = '/tmp/agent-memory-vector-test';

  beforeEach(() => {
    // Clean up before each test
    if (fs.existsSync(testStoragePath)) {
      fs.rmSync(testStoragePath, { recursive: true });
    }
    vectorStore = new VectorStore(testStoragePath);
  });

  afterEach(() => {
    // Clean up after each test
    if (fs.existsSync(testStoragePath)) {
      fs.rmSync(testStoragePath, { recursive: true });
    }
  });

  describe('store and get', () => {
    it('should store and retrieve a memory entry', async () => {
      const entry: MemoryEntry = {
        id: 'test-1',
        content: 'Test content',
        metadata: {
          type: 'document',
          tags: ['test']
        },
        timestamp: new Date()
      };
      const embedding = [0.1, 0.2, 0.3];

      await vectorStore.store(entry, embedding);
      const retrieved = await vectorStore.get('test-1');

      expect(retrieved).not.toBeNull();
      expect(retrieved?.id).toBe('test-1');
      expect(retrieved?.content).toBe('Test content');
    });

    it('should return null for non-existent entry', async () => {
      const retrieved = await vectorStore.get('non-existent');
      expect(retrieved).toBeNull();
    });
  });

  describe('search', () => {
    it('should find similar memories', async () => {
      const entry1: MemoryEntry = {
        id: 'test-1',
        content: 'Machine learning is awesome',
        metadata: { type: 'document' },
        timestamp: new Date()
      };
      const embedding1 = [1.0, 0.0, 0.0];

      const entry2: MemoryEntry = {
        id: 'test-2',
        content: 'Deep learning is great',
        metadata: { type: 'document' },
        timestamp: new Date()
      };
      const embedding2 = [0.9, 0.1, 0.0];

      await vectorStore.store(entry1, embedding1);
      await vectorStore.store(entry2, embedding2);

      const queryEmbedding = [0.95, 0.05, 0.0];
      const results = await vectorStore.search(queryEmbedding, 5, 0.5);

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].entry.id).toBeDefined();
      expect(results[0].similarity).toBeGreaterThan(0);
    });

    it('should respect similarity threshold', async () => {
      const entry: MemoryEntry = {
        id: 'test-1',
        content: 'Test content',
        metadata: { type: 'document' },
        timestamp: new Date()
      };
      const embedding = [1.0, 0.0, 0.0];

      await vectorStore.store(entry, embedding);

      const queryEmbedding = [0.0, 1.0, 0.0]; // Orthogonal vector
      const results = await vectorStore.search(queryEmbedding, 5, 0.9);

      expect(results.length).toBe(0);
    });

    it('should respect limit parameter', async () => {
      // Store multiple entries
      for (let i = 0; i < 5; i++) {
        const entry: MemoryEntry = {
          id: `test-${i}`,
          content: `Content ${i}`,
          metadata: { type: 'document' },
          timestamp: new Date()
        };
        const embedding = [1.0, 0.0, 0.0];
        await vectorStore.store(entry, embedding);
      }

      const queryEmbedding = [1.0, 0.0, 0.0];
      const results = await vectorStore.search(queryEmbedding, 3, 0.5);

      expect(results.length).toBeLessThanOrEqual(3);
    });
  });

  describe('delete and clear', () => {
    it('should delete a memory entry', async () => {
      const entry: MemoryEntry = {
        id: 'test-1',
        content: 'Test content',
        metadata: { type: 'document' },
        timestamp: new Date()
      };
      const embedding = [0.1, 0.2, 0.3];

      await vectorStore.store(entry, embedding);
      expect(await vectorStore.get('test-1')).not.toBeNull();

      const deleted = await vectorStore.delete('test-1');
      expect(deleted).toBe(true);
      expect(await vectorStore.get('test-1')).toBeNull();
    });

    it('should return false when deleting non-existent entry', async () => {
      const deleted = await vectorStore.delete('non-existent');
      expect(deleted).toBe(false);
    });

    it('should clear all memories', async () => {
      // Store multiple entries
      for (let i = 0; i < 3; i++) {
        const entry: MemoryEntry = {
          id: `test-${i}`,
          content: `Content ${i}`,
          metadata: { type: 'document' },
          timestamp: new Date()
        };
        await vectorStore.store(entry, [0.1, 0.2, 0.3]);
      }

      expect(vectorStore.count()).toBe(3);

      await vectorStore.clear();
      expect(vectorStore.count()).toBe(0);
    });
  });

  describe('persistence', () => {
    it('should persist and reload memories', async () => {
      const entry: MemoryEntry = {
        id: 'test-1',
        content: 'Test content',
        metadata: { type: 'document' },
        timestamp: new Date()
      };
      const embedding = [0.1, 0.2, 0.3];

      await vectorStore.store(entry, embedding);
      expect(vectorStore.count()).toBe(1);

      // Create new instance (should load from disk)
      const newVectorStore = new VectorStore(testStoragePath);
      expect(newVectorStore.count()).toBe(1);

      const retrieved = await newVectorStore.get('test-1');
      expect(retrieved).not.toBeNull();
      expect(retrieved?.content).toBe('Test content');
    });
  });
});
