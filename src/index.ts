/**
 * AgentMemory - AI Agent persistent work memory system
 * 
 * Integrates:
 * - obra/superpowers: Skill orchestration and experience tracking
 * - p2r3/convert: Universal file format conversion
 * - alibaba/zvec: In-process vector database
 */

export { AgentMemory } from './core/memory';
export { ConvertService } from './convert/service';
export { VectorStore } from './vector/store';
export { EmbeddingService } from './vector/embeddings';
export { SkillManager } from './skills/manager';
export { builtInSkills } from './skills/builtin';

export * from './types';
