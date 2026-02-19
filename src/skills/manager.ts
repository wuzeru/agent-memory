/**
 * Skill management and orchestration system
 * Inspired by obra/superpowers - provides skill execution and experience tracking
 */

import * as fs from 'fs';
import * as path from 'path';
import { 
  Skill, 
  SkillContext, 
  SkillResult, 
  SkillExecutionHistory, 
  SkillRecommendation 
} from '../types';

/**
 * Manages skills and their execution history
 */
export class SkillManager {
  private skills: Map<string, Skill>;
  private executionHistory: SkillExecutionHistory[];
  private storagePath: string;

  constructor(storagePath: string = '.agent-memory/skills') {
    this.skills = new Map();
    this.executionHistory = [];
    this.storagePath = storagePath;
    this.ensureStorageDirectory();
    this.loadHistory();
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
   * Register a new skill
   */
  registerSkill(skill: Skill): void {
    this.skills.set(skill.id, skill);
  }

  /**
   * Execute a skill and record the result
   */
  async executeSkill(skillId: string, context: SkillContext): Promise<SkillResult> {
    const skill = this.skills.get(skillId);
    
    if (!skill) {
      throw new Error(`Skill not found: ${skillId}`);
    }

    const startTime = Date.now();
    let result: SkillResult;

    try {
      result = await skill.execute(context);
    } catch (error) {
      result = {
        success: false,
        output: null,
        error: error instanceof Error ? error.message : String(error)
      };
    }

    const executionTime = Date.now() - startTime;

    // Record execution history
    const historyEntry: SkillExecutionHistory = {
      skillId,
      context,
      result,
      timestamp: new Date()
    };

    this.executionHistory.push(historyEntry);
    await this.saveHistory();

    return result;
  }

  /**
   * Get skill recommendations based on context and historical success
   */
  recommendSkills(context: SkillContext, limit: number = 3): SkillRecommendation[] {
    const recommendations: SkillRecommendation[] = [];

    for (const [skillId, skill] of this.skills.entries()) {
      const successRate = this.calculateSuccessRate(skillId, context);
      const relevanceScore = this.calculateRelevance(skill, context);
      const confidence = (successRate + relevanceScore) / 2;

      recommendations.push({
        skill,
        confidence,
        reason: this.generateRecommendationReason(skill, successRate, relevanceScore),
        historicalSuccessRate: successRate
      });
    }

    // Sort by confidence and limit results
    recommendations.sort((a, b) => b.confidence - a.confidence);
    return recommendations.slice(0, limit);
  }

  /**
   * Calculate success rate for a skill in similar contexts
   */
  private calculateSuccessRate(skillId: string, context: SkillContext): number {
    const relevantHistory = this.executionHistory.filter(h => {
      return h.skillId === skillId && this.isSimilarContext(h.context, context);
    });

    if (relevantHistory.length === 0) {
      return 0.5; // Default neutral score
    }

    const successfulExecutions = relevantHistory.filter(h => h.result.success).length;
    return successfulExecutions / relevantHistory.length;
  }

  /**
   * Check if two contexts are similar
   */
  private isSimilarContext(context1: SkillContext, context2: SkillContext): boolean {
    // Simple similarity check - can be enhanced with more sophisticated matching
    const query1 = context1.query.toLowerCase();
    const query2 = context2.query.toLowerCase();
    
    // Check for common words
    const words1 = new Set(query1.split(/\s+/));
    const words2 = new Set(query2.split(/\s+/));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    // Jaccard similarity
    return intersection.size / union.size > 0.3;
  }

  /**
   * Calculate relevance of a skill to the context
   */
  private calculateRelevance(skill: Skill, context: SkillContext): number {
    const queryLower = context.query.toLowerCase();
    const skillName = skill.name.toLowerCase();
    const skillDesc = skill.description.toLowerCase();
    
    let relevance = 0;
    
    // Check if skill name or description matches query keywords
    const keywords = queryLower.split(/\s+/).filter(w => w.length > 3);
    
    for (const keyword of keywords) {
      if (skillName.includes(keyword)) {
        relevance += 0.3;
      }
      if (skillDesc.includes(keyword)) {
        relevance += 0.2;
      }
    }
    
    return Math.min(relevance, 1.0);
  }

  /**
   * Generate explanation for recommendation
   */
  private generateRecommendationReason(
    skill: Skill, 
    successRate: number, 
    relevanceScore: number
  ): string {
    const reasons: string[] = [];
    
    if (successRate > 0.7) {
      reasons.push(`high success rate (${(successRate * 100).toFixed(0)}%)`);
    }
    
    if (relevanceScore > 0.5) {
      reasons.push('strong relevance to query');
    }
    
    if (reasons.length === 0) {
      return 'potential match';
    }
    
    return reasons.join(', ');
  }

  /**
   * Get all registered skills
   */
  getSkills(): Skill[] {
    return Array.from(this.skills.values());
  }

  /**
   * Get execution history for a specific skill
   */
  getSkillHistory(skillId: string): SkillExecutionHistory[] {
    return this.executionHistory.filter(h => h.skillId === skillId);
  }

  /**
   * Clear execution history
   */
  async clearHistory(): Promise<void> {
    this.executionHistory = [];
    await this.saveHistory();
  }

  /**
   * Save execution history to disk
   */
  private async saveHistory(): Promise<void> {
    const filePath = path.join(this.storagePath, 'history.json');
    fs.writeFileSync(filePath, JSON.stringify(this.executionHistory, null, 2));
  }

  /**
   * Load execution history from disk
   */
  private loadHistory(): void {
    const filePath = path.join(this.storagePath, 'history.json');
    
    if (fs.existsSync(filePath)) {
      try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        
        // Convert timestamp strings back to Date objects
        this.executionHistory = data.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }));
      } catch (error) {
        console.warn(`Failed to load skill history: ${error}`);
      }
    }
  }
}
