/**
 * Built-in example skills for AgentMemory
 */

import { Skill, SkillContext, SkillResult } from '../types';

/**
 * Code review skill
 */
export const codeReviewSkill: Skill = {
  id: 'code-review',
  name: 'Code Review',
  description: 'Analyze code for quality, security, and best practices',
  execute: async (context: SkillContext): Promise<SkillResult> => {
    // Simulate code review
    const output = {
      findings: [
        'Code quality: Good',
        'Security: No vulnerabilities detected',
        'Best practices: Following conventions'
      ],
      recommendations: [
        'Consider adding more unit tests',
        'Update documentation'
      ]
    };

    return {
      success: true,
      output,
      metadata: {
        analysisType: 'code-review',
        timestamp: new Date()
      }
    };
  }
};

/**
 * Documentation generation skill
 */
export const docGenerationSkill: Skill = {
  id: 'doc-generation',
  name: 'Documentation Generator',
  description: 'Generate documentation from code and context',
  execute: async (context: SkillContext): Promise<SkillResult> => {
    const output = {
      documentation: `# Documentation\n\nGenerated from context: ${context.query}`,
      sections: ['Overview', 'Usage', 'API Reference']
    };

    return {
      success: true,
      output,
      metadata: {
        docType: 'api-documentation',
        timestamp: new Date()
      }
    };
  }
};

/**
 * Test generation skill
 */
export const testGenerationSkill: Skill = {
  id: 'test-generation',
  name: 'Test Generator',
  description: 'Generate unit tests for code',
  execute: async (context: SkillContext): Promise<SkillResult> => {
    const output = {
      tests: [
        'test case 1: should handle valid input',
        'test case 2: should handle invalid input',
        'test case 3: should handle edge cases'
      ],
      framework: 'jest'
    };

    return {
      success: true,
      output,
      metadata: {
        testFramework: 'jest',
        timestamp: new Date()
      }
    };
  }
};

/**
 * Database optimization skill
 */
export const dbOptimizationSkill: Skill = {
  id: 'db-optimization',
  name: 'Database Optimization',
  description: 'Analyze and optimize database queries and schema',
  execute: async (context: SkillContext): Promise<SkillResult> => {
    const output = {
      optimizations: [
        'Add index on user_id column',
        'Optimize join queries',
        'Consider query caching'
      ],
      estimatedImprovement: '40% faster'
    };

    return {
      success: true,
      output,
      metadata: {
        optimizationType: 'database',
        timestamp: new Date()
      }
    };
  }
};

/**
 * Refactoring suggestion skill
 */
export const refactorSkill: Skill = {
  id: 'refactoring',
  name: 'Code Refactoring',
  description: 'Suggest code refactoring improvements',
  execute: async (context: SkillContext): Promise<SkillResult> => {
    const output = {
      suggestions: [
        'Extract method for complex logic',
        'Reduce cyclomatic complexity',
        'Apply design patterns where appropriate'
      ],
      priority: 'medium'
    };

    return {
      success: true,
      output,
      metadata: {
        refactorType: 'general',
        timestamp: new Date()
      }
    };
  }
};

/**
 * Get all built-in skills
 */
export const builtInSkills: Skill[] = [
  codeReviewSkill,
  docGenerationSkill,
  testGenerationSkill,
  dbOptimizationSkill,
  refactorSkill
];
