/**
 * AgentMemory - Core memory management system
 * Integrates conversion, vector storage, and skill orchestration
 */

import * as crypto from 'crypto';
import { ConvertService } from '../convert/service';
import { VectorStore } from '../vector/store';
import { EmbeddingService } from '../vector/embeddings';
import { SkillManager } from '../skills/manager';
import { builtInSkills } from '../skills/builtin';
import {
  AgentMemoryConfig,
  MemoryEntry,
  MemoryMetadata,
  IngestionOptions,
  RecallOptions,
  MemoryRecallResult,
  MemoryStats,
  Skill,
  SkillContext,
  SkillRecommendation
} from '../types';

/**
 * Main AgentMemory class
 */
export class AgentMemory {
  private convertService: ConvertService;
  private vectorStore: VectorStore;
  private embeddingService: EmbeddingService;
  private skillManager: SkillManager;
  private config: AgentMemoryConfig;
  private isInitialized: boolean = false;

  constructor(config: AgentMemoryConfig = {}) {
    this.config = {
      storagePath: config.storagePath || '.agent-memory',
      embeddingModel: config.embeddingModel || 'Xenova/all-MiniLM-L6-v2',
      maxMemories: config.maxMemories || 10000,
      similarityThreshold: config.similarityThreshold || 0.5
    };

    this.convertService = new ConvertService();
    this.vectorStore = new VectorStore(this.config.storagePath + '/vectors');
    this.embeddingService = new EmbeddingService(this.config.embeddingModel);
    this.skillManager = new SkillManager(this.config.storagePath + '/skills');

    // Register built-in skills
    builtInSkills.forEach(skill => this.skillManager.registerSkill(skill));
  }

  /**
   * Initialize the AgentMemory system
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    console.log('Initializing AgentMemory...');
    await this.embeddingService.initialize();
    console.log('AgentMemory initialized successfully');
    
    this.isInitialized = true;
  }

  /**
   * Ingest a file into memory
   */
  async ingest(filePath: string, options: IngestionOptions = {}): Promise<string> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    console.log(`Ingesting file: ${filePath}`);

    // Convert file to text
    const conversionResult = await this.convertService.convertToText(filePath);
    
    // Split content into chunks if needed
    const chunks = this.chunkText(conversionResult.content, options.chunkSize || 1000);
    
    const memoryIds: string[] = [];

    // Create memory entries for each chunk
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const memoryId = this.generateId();

      // Generate embedding
      const embedding = options.generateEmbedding !== false 
        ? await this.embeddingService.embed(chunk)
        : [];

      // Create memory entry
      const metadata: MemoryMetadata = {
        source: options.source || filePath,
        type: 'document',
        tags: options.tags || [],
        context: {
          chunkIndex: i,
          totalChunks: chunks.length,
          originalFormat: conversionResult.metadata.originalFormat
        }
      };

      const entry: MemoryEntry = {
        id: memoryId,
        content: chunk,
        metadata,
        embedding,
        timestamp: new Date()
      };

      // Store in vector database
      await this.vectorStore.store(entry, embedding);
      memoryIds.push(memoryId);
    }

    console.log(`Ingested ${chunks.length} chunks from ${filePath}`);
    return memoryIds.join(',');
  }

  /**
   * Ingest text directly into memory
   */
  async ingestText(text: string, metadata: Partial<MemoryMetadata> = {}): Promise<string> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const memoryId = this.generateId();

    // Generate embedding
    const embedding = await this.embeddingService.embed(text);

    // Create memory entry
    const entry: MemoryEntry = {
      id: memoryId,
      content: text,
      metadata: {
        type: metadata.type || 'conversation',
        source: metadata.source,
        tags: metadata.tags || [],
        context: metadata.context
      },
      embedding,
      timestamp: new Date()
    };

    // Store in vector database
    await this.vectorStore.store(entry, embedding);

    return memoryId;
  }

  /**
   * Recall memories based on a query
   */
  async recall(query: string, options: RecallOptions = {}): Promise<MemoryRecallResult[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    console.log(`Recalling memories for: ${query}`);

    // Generate query embedding
    const queryEmbedding = await this.embeddingService.embed(query);

    // Search vector store
    const limit = options.limit || 5;
    const threshold = options.threshold || this.config.similarityThreshold || 0.5;
    
    let results = await this.vectorStore.search(queryEmbedding, limit, threshold);

    // Apply filters if provided
    if (options.filters) {
      results = this.applyFilters(results, options.filters);
    }

    return results;
  }

  /**
   * Execute a skill with memory context
   */
  async executeSkill(skillId: string, query: string): Promise<any> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    // Recall relevant memories
    const memories = await this.recall(query, { limit: 3 });

    // Create skill context
    const context: SkillContext = {
      query,
      memories: memories.map(r => r.entry),
      metadata: {
        timestamp: new Date()
      }
    };

    // Execute skill
    const result = await this.skillManager.executeSkill(skillId, context);

    // Store execution as memory
    await this.ingestText(
      `Skill executed: ${skillId}\nQuery: ${query}\nResult: ${JSON.stringify(result.output)}`,
      {
        type: 'experience',
        tags: ['skill-execution', skillId],
        context: { skillId, success: result.success }
      }
    );

    return result;
  }

  /**
   * Get skill recommendations for a query
   */
  async recommendSkills(query: string, limit: number = 3): Promise<SkillRecommendation[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    // Recall relevant memories
    const memories = await this.recall(query, { limit: 5 });

    // Create context
    const context: SkillContext = {
      query,
      memories: memories.map(r => r.entry)
    };

    // Get recommendations
    return this.skillManager.recommendSkills(context, limit);
  }

  /**
   * Register a custom skill
   */
  registerSkill(skill: Skill): void {
    this.skillManager.registerSkill(skill);
  }

  /**
   * Get all available skills
   */
  getSkills(): Skill[] {
    return this.skillManager.getSkills();
  }

  /**
   * Get memory statistics
   */
  async getStats(): Promise<MemoryStats> {
    const memories = await this.vectorStore.getAll();
    
    const memoryTypes: Record<string, number> = {};
    let oldestMemory: Date | undefined;
    let newestMemory: Date | undefined;

    for (const memory of memories) {
      const type = memory.metadata.type;
      memoryTypes[type] = (memoryTypes[type] || 0) + 1;

      if (!oldestMemory || memory.timestamp < oldestMemory) {
        oldestMemory = memory.timestamp;
      }
      if (!newestMemory || memory.timestamp > newestMemory) {
        newestMemory = memory.timestamp;
      }
    }

    return {
      totalMemories: memories.length,
      memoryTypes,
      storageSize: 0, // Note: Storage size calculation not yet implemented. Will be added in future version.
      oldestMemory,
      newestMemory
    };
  }

  /**
   * Clear all memories
   */
  async clear(): Promise<void> {
    await this.vectorStore.clear();
    await this.skillManager.clearHistory();
  }

  /**
   * Split text into chunks
   */
  private chunkText(text: string, maxChunkSize: number): string[] {
    const chunks: string[] = [];
    const paragraphs = text.split(/\n\n+/);
    
    let currentChunk = '';
    
    for (const paragraph of paragraphs) {
      if (currentChunk.length + paragraph.length <= maxChunkSize) {
        currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
      } else {
        if (currentChunk) {
          chunks.push(currentChunk);
        }
        currentChunk = paragraph;
      }
    }
    
    if (currentChunk) {
      chunks.push(currentChunk);
    }
    
    return chunks.length > 0 ? chunks : [text];
  }

  /**
   * Apply filters to search results
   */
  private applyFilters(
    results: MemoryRecallResult[], 
    filters: NonNullable<RecallOptions['filters']>
  ): MemoryRecallResult[] {
    return results.filter(result => {
      const { entry } = result;

      if (filters.type && entry.metadata.type !== filters.type) {
        return false;
      }

      if (filters.source && entry.metadata.source !== filters.source) {
        return false;
      }

      if (filters.tags && filters.tags.length > 0) {
        const entryTags = entry.metadata.tags || [];
        const hasTag = filters.tags.some(tag => entryTags.includes(tag));
        if (!hasTag) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Generate a unique ID
   */
  private generateId(): string {
    return crypto.randomBytes(16).toString('hex');
  }
}
