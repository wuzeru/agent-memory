# AgentMemory Usage Examples

## Table of Contents

1. [Basic Usage](#basic-usage)
2. [File Ingestion](#file-ingestion)
3. [Memory Retrieval](#memory-retrieval)
4. [Skill Execution](#skill-execution)
5. [Custom Skills](#custom-skills)
6. [Advanced Scenarios](#advanced-scenarios)

---

## Basic Usage

### Initialize AgentMemory

```typescript
import { AgentMemory } from 'agent-memory';

const memory = new AgentMemory({
  storagePath: '.agent-memory',      // Storage path
  embeddingModel: 'Xenova/all-MiniLM-L6-v2',  // Embedding model
  maxMemories: 10000,                // Maximum number of memories
  similarityThreshold: 0.5           // Similarity threshold
});

// Must initialize first
await memory.initialize();
```

---

## File Ingestion

### Ingest Single File

```typescript
// Ingest PDF document
await memory.ingest('./docs/architecture.pdf', {
  tags: ['documentation', 'architecture'],
  source: 'project-docs'
});

// Ingest Excel report
await memory.ingest('./data/sales-report.xlsx', {
  tags: ['data', 'sales'],
  source: 'analytics'
});

// Ingest code file
await memory.ingest('./src/api/users.ts', {
  tags: ['code', 'api'],
  source: 'codebase'
});
```

### Batch File Ingestion

```typescript
const files = [
  './docs/README.md',
  './docs/API.md',
  './docs/deployment.md',
  './project-spec.pdf'
];

for (const file of files) {
  await memory.ingest(file, {
    tags: ['documentation'],
    source: 'project-docs'
  });
  console.log(`✅ Ingested: ${file}`);
}
```

### Direct Text Ingestion

```typescript
// Ingest conversation content
await memory.ingestText(
  'User asked about database optimization strategies',
  {
    type: 'conversation',
    tags: ['question', 'database'],
    source: 'chat-session-123'
  }
);

// Ingest important decision
await memory.ingestText(
  'Decision: We will use PostgreSQL instead of MySQL for better JSON support',
  {
    type: 'document',
    tags: ['decision', 'database'],
    context: { decidedBy: 'team', date: '2026-02-18' }
  }
);
```

---

## Memory Retrieval

### Basic Retrieval

```typescript
// Simple query
const results = await memory.recall('How to deploy the application?');

// Iterate through results
results.forEach(result => {
  console.log(`Similarity: ${(result.similarity * 100).toFixed(1)}%`);
  console.log(`Content: ${result.entry.content}`);
  console.log(`Source: ${result.entry.metadata.source}`);
  console.log('---');
});
```

### Advanced Retrieval

```typescript
// Retrieval with filter conditions
const results = await memory.recall('database optimization', {
  limit: 10,                    // Return maximum 10 results
  threshold: 0.7,               // Similarity threshold 70%
  filters: {
    type: 'document',           // Only retrieve document type
    tags: ['database'],         // Must contain database tag
    source: 'project-docs'      // Source must be project-docs
  }
});
```

### Multiple Retrieval Combination

```typescript
// Retrieve multiple related topics
const topics = ['authentication', 'authorization', 'security'];

for (const topic of topics) {
  const results = await memory.recall(topic, { limit: 3 });
  console.log(`\n=== ${topic.toUpperCase()} ===`);
  results.forEach(r => {
    console.log(`- ${r.entry.content.substring(0, 100)}...`);
  });
}
```

---

## Skill Execution

### Execute Built-in Skills

```typescript
// Code review
const reviewResult = await memory.executeSkill(
  'code-review',
  'Review the authentication module in src/auth/'
);
console.log(reviewResult.output);

// Generate documentation
const docResult = await memory.executeSkill(
  'doc-generation',
  'Generate API documentation for user endpoints'
);
console.log(docResult.output);

// Generate tests
const testResult = await memory.executeSkill(
  'test-generation',
  'Generate unit tests for the payment service'
);
console.log(testResult.output);

// Database optimization
const dbResult = await memory.executeSkill(
  'db-optimization',
  'Optimize slow queries in the orders table'
);
console.log(dbResult.output);
```

### Get Skill Recommendations

```typescript
// Get recommended skills based on problem
const recommendations = await memory.recommendSkills(
  'The application has performance issues',
  3  // Return top 3 recommendations
);

recommendations.forEach(rec => {
  console.log(`Skill: ${rec.skill.name}`);
  console.log(`Confidence: ${(rec.confidence * 100).toFixed(1)}%`);
  console.log(`Reason: ${rec.reason}`);
  if (rec.historicalSuccessRate) {
    console.log(`Historical Success: ${(rec.historicalSuccessRate * 100).toFixed(1)}%`);
  }
  console.log('---');
});
```

### View All Available Skills

```typescript
const skills = memory.getSkills();

console.log(`Available Skills (${skills.length}):`);
skills.forEach(skill => {
  console.log(`- ${skill.name} (${skill.id})`);
  console.log(`  ${skill.description}`);
});
```

---

## Custom Skills

### Create Simple Skill

```typescript
import { Skill, SkillContext, SkillResult } from 'agent-memory';

const performanceAnalysisSkill: Skill = {
  id: 'performance-analysis',
  name: 'Performance Analysis',
  description: 'Analyze application performance metrics',
  execute: async (context: SkillContext): Promise<SkillResult> => {
    // Access relevant memories
    const memories = context.memories || [];
    
    // Execute analysis logic
    const analysis = {
      slowEndpoints: ['/api/users', '/api/orders'],
      avgResponseTime: '250ms',
      recommendations: [
        'Add caching for user endpoint',
        'Optimize database queries in orders'
      ]
    };
    
    return {
      success: true,
      output: analysis,
      metadata: {
        analysisType: 'performance',
        timestamp: new Date()
      }
    };
  }
};

// Register skill
memory.registerSkill(performanceAnalysisSkill);

// Use skill
const result = await memory.executeSkill(
  'performance-analysis',
  'Analyze current application performance'
);
```

### Create Advanced Skill (Using Memory)

```typescript
const smartRefactorSkill: Skill = {
  id: 'smart-refactor',
  name: 'Smart Refactoring',
  description: 'Suggest refactoring based on past experiences',
  execute: async (context: SkillContext): Promise<SkillResult> => {
    const { query, memories } = context;
    
    // Learn from historical memories
    const pastIssues = memories?.filter(m => 
      m.metadata.tags?.includes('refactoring')
    ) || [];
    
    // Generate suggestions based on history
    const suggestions = [
      'Extract complex method into smaller functions',
      'Apply dependency injection for better testability',
      'Use design patterns (Strategy pattern recommended)'
    ];
    
    // Add historical experience
    const historicalInsights = pastIssues.map(m => 
      m.content.substring(0, 100)
    );
    
    return {
      success: true,
      output: {
        suggestions,
        historicalInsights,
        confidence: pastIssues.length > 0 ? 0.8 : 0.5
      }
    };
  }
};

memory.registerSkill(smartRefactorSkill);
```

---

## Advanced Scenarios

### Scenario 1: Project Knowledge Base

```typescript
async function buildProjectKnowledgeBase() {
  const memory = new AgentMemory({ storagePath: '.project-kb' });
  await memory.initialize();
  
  // Ingest all project documentation
  const docFiles = [
    './README.md',
    './docs/architecture.md',
    './docs/api-reference.md',
    './docs/deployment-guide.md'
  ];
  
  for (const file of docFiles) {
    await memory.ingest(file, {
      tags: ['documentation'],
      source: 'project-docs'
    });
  }
  
  // Ingest code comments and docstrings
  // (can use code parsing tools to extract)
  
  // Now can query any project-related questions
  const answer = await memory.recall('How do we handle authentication?');
  return answer;
}
```

### Scenario 2: Continuously Learning Agent

```typescript
class LearningAgent {
  private memory: AgentMemory;
  
  constructor() {
    this.memory = new AgentMemory();
  }
  
  async init() {
    await this.memory.initialize();
  }
  
  // Execute task and record experience
  async performTask(task: string) {
    // Retrieve relevant experience
    const pastExperience = await this.memory.recall(task, {
      filters: { type: 'experience' },
      limit: 5
    });
    
    // Get recommended skills
    const recommendations = await this.memory.recommendSkills(task);
    const bestSkill = recommendations[0];
    
    // Execute best skill
    const result = await this.memory.executeSkill(
      bestSkill.skill.id,
      task
    );
    
    // Record result as new experience
    await this.memory.ingestText(
      `Task: ${task}\nSkill: ${bestSkill.skill.name}\nSuccess: ${result.success}`,
      {
        type: 'experience',
        tags: ['task-execution', bestSkill.skill.id],
        context: { task, success: result.success }
      }
    );
    
    return result;
  }
}

// Usage
const agent = new LearningAgent();
await agent.init();
await agent.performTask('Optimize database queries');
```

### Scenario 3: Team Knowledge Sharing

```typescript
async function setupTeamMemory() {
  const teamMemory = new AgentMemory({ 
    storagePath: '.team-memory' 
  });
  await teamMemory.initialize();
  
  // Member A shares experience
  await teamMemory.ingestText(
    'When deploying to K8s, always set resource limits to avoid OOM issues',
    {
      type: 'experience',
      tags: ['kubernetes', 'deployment', 'best-practice'],
      context: { author: 'alice', role: 'devops' }
    }
  );
  
  // Member B shares experience
  await teamMemory.ingestText(
    'For API rate limiting, use Redis with sliding window algorithm',
    {
      type: 'experience',
      tags: ['api', 'rate-limiting', 'redis'],
      context: { author: 'bob', role: 'backend' }
    }
  );
  
  // New member C can immediately query
  const deployment = await teamMemory.recall('How to deploy to kubernetes?');
  const rateLimit = await teamMemory.recall('How to implement rate limiting?');
  
  return { deployment, rateLimit };
}
```

### Scenario 4: Versioned Memory

```typescript
async function versionedMemory() {
  const memory = new AgentMemory();
  await memory.initialize();
  
  // Record different version implementations
  await memory.ingestText(
    'v1.0: Authentication uses JWT with 1-hour expiry',
    {
      type: 'document',
      tags: ['auth', 'v1.0'],
      context: { version: '1.0.0', deprecated: false }
    }
  );
  
  await memory.ingestText(
    'v2.0: Authentication upgraded to JWT with refresh tokens, 15-min access token expiry',
    {
      type: 'document',
      tags: ['auth', 'v2.0'],
      context: { version: '2.0.0', deprecated: false }
    }
  );
  
  // Query current version
  const current = await memory.recall('current authentication', {
    filters: { tags: ['v2.0'] }
  });
  
  // Query historical versions
  const historical = await memory.recall('authentication history', {
    filters: { tags: ['auth'] },
    limit: 10
  });
  
  return { current, historical };
}
```

---

## Command Line Usage Examples

### Basic Commands

```bash
# Initialize
agent-memory init

# Ingest files
agent-memory ingest ./README.md
agent-memory ingest ./data/report.pdf --tags "report,2026" --source "analytics"

# Retrieve memories
agent-memory recall "database configuration"
agent-memory recall "deployment process" --limit 3 --threshold 0.7

# View skills
agent-memory skills

# Execute skills
agent-memory execute code-review "Review authentication module"
agent-memory execute db-optimization "Slow query performance"

# Get recommendations
agent-memory recommend "performance issues"

# View statistics
agent-memory stats

# Clear memories
agent-memory clear
```

### Actual Workflow Example

```bash
# 1. Project onboarding
agent-memory ingest ./docs/*.md
agent-memory ingest ./README.md
agent-memory recall "project architecture"

# 2. Code review
agent-memory execute code-review "Review PR #123"
agent-memory recall "code review findings"

# 3. Performance optimization
agent-memory recommend "application is slow"
agent-memory execute db-optimization "optimize user queries"

# 4. View progress
agent-memory stats
```

---

## Best Practices

### 1. Structured Tagging

```typescript
// Use consistent tagging system
const tagScheme = {
  type: ['documentation', 'code', 'data', 'experience'],
  domain: ['frontend', 'backend', 'devops', 'data'],
  priority: ['high', 'medium', 'low'],
  status: ['active', 'deprecated', 'archived']
};

await memory.ingestText(content, {
  tags: ['documentation', 'backend', 'high', 'active']
});
```

### 2. Context Enrichment

```typescript
// Add rich context information
await memory.ingestText(content, {
  type: 'experience',
  tags: ['bug-fix', 'security'],
  context: {
    date: new Date(),
    author: 'alice',
    project: 'ecommerce-api',
    severity: 'critical',
    resolved: true,
    timeToResolve: '2 hours'
  }
});
```

### 3. Regular Cleanup

```typescript
// Implement memory cleanup strategy
async function pruneOldMemories() {
  const stats = await memory.getStats();
  
  if (stats.totalMemories > 10000) {
    // Export important memories
    const important = await memory.recall('', {
      filters: { tags: ['important'] },
      limit: 1000
    });
    
    // Clear and re-import
    await memory.clear();
    
    for (const result of important) {
      await memory.ingestText(
        result.entry.content,
        result.entry.metadata
      );
    }
  }
}
```

---

For more examples, please refer to the code files in the `/examples` directory.
