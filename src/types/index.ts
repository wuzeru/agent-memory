/**
 * Core type definitions for AgentMemory system
 */

/**
 * Represents a memory entry in the system
 */
export interface MemoryEntry {
  id: string;
  content: string;
  metadata: MemoryMetadata;
  embedding?: number[];
  timestamp: Date;
}

/**
 * Metadata associated with a memory entry
 */
export interface MemoryMetadata {
  source?: string;
  type: 'document' | 'skill_execution' | 'conversation' | 'experience';
  tags?: string[];
  context?: Record<string, any>;
}

/**
 * Result of a memory recall/search operation
 */
export interface MemoryRecallResult {
  entry: MemoryEntry;
  similarity: number;
}

/**
 * Configuration for the AgentMemory system
 */
export interface AgentMemoryConfig {
  storagePath?: string;
  embeddingModel?: string;
  maxMemories?: number;
  similarityThreshold?: number;
}

/**
 * Represents a skill in the system
 */
export interface Skill {
  id: string;
  name: string;
  description: string;
  execute: (context: SkillContext) => Promise<SkillResult>;
}

/**
 * Context passed to a skill during execution
 */
export interface SkillContext {
  query: string;
  memories?: MemoryEntry[];
  metadata?: Record<string, any>;
}

/**
 * Result of skill execution
 */
export interface SkillResult {
  success: boolean;
  output: any;
  error?: string;
  metadata?: Record<string, any>;
}

/**
 * Historical record of skill execution
 */
export interface SkillExecutionHistory {
  skillId: string;
  context: SkillContext;
  result: SkillResult;
  timestamp: Date;
  successRate?: number;
}

/**
 * Recommendation for skill selection
 */
export interface SkillRecommendation {
  skill: Skill;
  confidence: number;
  reason: string;
  historicalSuccessRate?: number;
}

/**
 * Options for file conversion
 */
export interface ConversionOptions {
  format?: 'text' | 'markdown' | 'json';
  chunkSize?: number;
  preserveStructure?: boolean;
}

/**
 * Result of file conversion
 */
export interface ConversionResult {
  content: string;
  metadata: {
    originalFormat: string;
    convertedFormat: string;
    pageCount?: number;
    wordCount?: number;
  };
}

/**
 * Options for memory ingestion
 */
export interface IngestionOptions {
  tags?: string[];
  source?: string;
  chunkSize?: number;
  generateEmbedding?: boolean;
}

/**
 * Options for memory recall
 */
export interface RecallOptions {
  limit?: number;
  threshold?: number;
  filters?: {
    type?: MemoryMetadata['type'];
    tags?: string[];
    source?: string;
  };
}

/**
 * Statistics about the memory system
 */
export interface MemoryStats {
  totalMemories: number;
  memoryTypes: Record<string, number>;
  storageSize: number;
  oldestMemory?: Date;
  newestMemory?: Date;
}
