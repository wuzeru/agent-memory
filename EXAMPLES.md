# AgentMemory 使用示例

## 目录

1. [基础使用](#基础使用)
2. [文件摄取](#文件摄取)
3. [记忆检索](#记忆检索)
4. [技能执行](#技能执行)
5. [自定义技能](#自定义技能)
6. [高级场景](#高级场景)

---

## 基础使用

### 初始化 AgentMemory

```typescript
import { AgentMemory } from 'agent-memory';

const memory = new AgentMemory({
  storagePath: '.agent-memory',      // 存储路径
  embeddingModel: 'Xenova/all-MiniLM-L6-v2',  // 嵌入模型
  maxMemories: 10000,                // 最大记忆数量
  similarityThreshold: 0.5           // 相似度阈值
});

// 必须先初始化
await memory.initialize();
```

---

## 文件摄取

### 摄取单个文件

```typescript
// 摄取 PDF 文档
await memory.ingest('./docs/architecture.pdf', {
  tags: ['documentation', 'architecture'],
  source: 'project-docs'
});

// 摄取 Excel 报表
await memory.ingest('./data/sales-report.xlsx', {
  tags: ['data', 'sales'],
  source: 'analytics'
});

// 摄取代码文件
await memory.ingest('./src/api/users.ts', {
  tags: ['code', 'api'],
  source: 'codebase'
});
```

### 批量摄取文件

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

### 直接摄取文本

```typescript
// 摄取会话内容
await memory.ingestText(
  'User asked about database optimization strategies',
  {
    type: 'conversation',
    tags: ['question', 'database'],
    source: 'chat-session-123'
  }
);

// 摄取重要决策
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

## 记忆检索

### 基础检索

```typescript
// 简单查询
const results = await memory.recall('How to deploy the application?');

// 遍历结果
results.forEach(result => {
  console.log(`Similarity: ${(result.similarity * 100).toFixed(1)}%`);
  console.log(`Content: ${result.entry.content}`);
  console.log(`Source: ${result.entry.metadata.source}`);
  console.log('---');
});
```

### 高级检索

```typescript
// 带过滤条件的检索
const results = await memory.recall('database optimization', {
  limit: 10,                    // 最多返回 10 条
  threshold: 0.7,               // 相似度阈值 70%
  filters: {
    type: 'document',           // 只检索文档类型
    tags: ['database'],         // 必须包含 database 标签
    source: 'project-docs'      // 来源必须是 project-docs
  }
});
```

### 多次检索组合

```typescript
// 检索多个相关主题
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

## 技能执行

### 执行内置技能

```typescript
// 代码审查
const reviewResult = await memory.executeSkill(
  'code-review',
  'Review the authentication module in src/auth/'
);
console.log(reviewResult.output);

// 生成文档
const docResult = await memory.executeSkill(
  'doc-generation',
  'Generate API documentation for user endpoints'
);
console.log(docResult.output);

// 生成测试
const testResult = await memory.executeSkill(
  'test-generation',
  'Generate unit tests for the payment service'
);
console.log(testResult.output);

// 数据库优化
const dbResult = await memory.executeSkill(
  'db-optimization',
  'Optimize slow queries in the orders table'
);
console.log(dbResult.output);
```

### 获取技能推荐

```typescript
// 根据问题获取推荐技能
const recommendations = await memory.recommendSkills(
  'The application has performance issues',
  3  // 返回前 3 个推荐
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

### 查看所有可用技能

```typescript
const skills = memory.getSkills();

console.log(`Available Skills (${skills.length}):`);
skills.forEach(skill => {
  console.log(`- ${skill.name} (${skill.id})`);
  console.log(`  ${skill.description}`);
});
```

---

## 自定义技能

### 创建简单技能

```typescript
import { Skill, SkillContext, SkillResult } from 'agent-memory';

const performanceAnalysisSkill: Skill = {
  id: 'performance-analysis',
  name: 'Performance Analysis',
  description: 'Analyze application performance metrics',
  execute: async (context: SkillContext): Promise<SkillResult> => {
    // 访问相关记忆
    const memories = context.memories || [];
    
    // 执行分析逻辑
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

// 注册技能
memory.registerSkill(performanceAnalysisSkill);

// 使用技能
const result = await memory.executeSkill(
  'performance-analysis',
  'Analyze current application performance'
);
```

### 创建高级技能（使用记忆）

```typescript
const smartRefactorSkill: Skill = {
  id: 'smart-refactor',
  name: 'Smart Refactoring',
  description: 'Suggest refactoring based on past experiences',
  execute: async (context: SkillContext): Promise<SkillResult> => {
    const { query, memories } = context;
    
    // 从历史记忆中学习
    const pastIssues = memories?.filter(m => 
      m.metadata.tags?.includes('refactoring')
    ) || [];
    
    // 基于历史生成建议
    const suggestions = [
      'Extract complex method into smaller functions',
      'Apply dependency injection for better testability',
      'Use design patterns (Strategy pattern recommended)'
    ];
    
    // 添加历史经验
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

## 高级场景

### 场景 1: 项目知识库

```typescript
async function buildProjectKnowledgeBase() {
  const memory = new AgentMemory({ storagePath: '.project-kb' });
  await memory.initialize();
  
  // 摄取所有项目文档
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
  
  // 摄取代码注释和文档字符串
  // (可以使用代码解析工具提取)
  
  // 现在可以查询任何项目相关问题
  const answer = await memory.recall('How do we handle authentication?');
  return answer;
}
```

### 场景 2: 持续学习的 Agent

```typescript
class LearningAgent {
  private memory: AgentMemory;
  
  constructor() {
    this.memory = new AgentMemory();
  }
  
  async init() {
    await this.memory.initialize();
  }
  
  // 执行任务并记录经验
  async performTask(task: string) {
    // 检索相关经验
    const pastExperience = await this.memory.recall(task, {
      filters: { type: 'experience' },
      limit: 5
    });
    
    // 获取推荐技能
    const recommendations = await this.memory.recommendSkills(task);
    const bestSkill = recommendations[0];
    
    // 执行最佳技能
    const result = await this.memory.executeSkill(
      bestSkill.skill.id,
      task
    );
    
    // 记录结果作为新经验
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

// 使用
const agent = new LearningAgent();
await agent.init();
await agent.performTask('Optimize database queries');
```

### 场景 3: 团队知识共享

```typescript
async function setupTeamMemory() {
  const teamMemory = new AgentMemory({ 
    storagePath: '.team-memory' 
  });
  await teamMemory.initialize();
  
  // 成员 A 分享经验
  await teamMemory.ingestText(
    'When deploying to K8s, always set resource limits to avoid OOM issues',
    {
      type: 'experience',
      tags: ['kubernetes', 'deployment', 'best-practice'],
      context: { author: 'alice', role: 'devops' }
    }
  );
  
  // 成员 B 分享经验
  await teamMemory.ingestText(
    'For API rate limiting, use Redis with sliding window algorithm',
    {
      type: 'experience',
      tags: ['api', 'rate-limiting', 'redis'],
      context: { author: 'bob', role: 'backend' }
    }
  );
  
  // 新成员 C 可以立即查询
  const deployment = await teamMemory.recall('How to deploy to kubernetes?');
  const rateLimit = await teamMemory.recall('How to implement rate limiting?');
  
  return { deployment, rateLimit };
}
```

### 场景 4: 版本化记忆

```typescript
async function versionedMemory() {
  const memory = new AgentMemory();
  await memory.initialize();
  
  // 记录不同版本的实现
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
  
  // 查询当前版本
  const current = await memory.recall('current authentication', {
    filters: { tags: ['v2.0'] }
  });
  
  // 查询历史版本
  const historical = await memory.recall('authentication history', {
    filters: { tags: ['auth'] },
    limit: 10
  });
  
  return { current, historical };
}
```

---

## 命令行使用示例

### 基础命令

```bash
# 初始化
agent-memory init

# 摄取文件
agent-memory ingest ./README.md
agent-memory ingest ./data/report.pdf --tags "report,2026" --source "analytics"

# 检索记忆
agent-memory recall "database configuration"
agent-memory recall "deployment process" --limit 3 --threshold 0.7

# 查看技能
agent-memory skills

# 执行技能
agent-memory execute code-review "Review authentication module"
agent-memory execute db-optimization "Slow query performance"

# 获取推荐
agent-memory recommend "performance issues"

# 查看统计
agent-memory stats

# 清除记忆
agent-memory clear
```

### 实际工作流示例

```bash
# 1. 项目上手
agent-memory ingest ./docs/*.md
agent-memory ingest ./README.md
agent-memory recall "project architecture"

# 2. 代码审查
agent-memory execute code-review "Review PR #123"
agent-memory recall "code review findings"

# 3. 性能优化
agent-memory recommend "application is slow"
agent-memory execute db-optimization "optimize user queries"

# 4. 查看进度
agent-memory stats
```

---

## 最佳实践

### 1. 结构化标签

```typescript
// 使用一致的标签体系
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

### 2. 上下文丰富化

```typescript
// 添加丰富的上下文信息
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

### 3. 定期清理

```typescript
// 实现记忆清理策略
async function pruneOldMemories() {
  const stats = await memory.getStats();
  
  if (stats.totalMemories > 10000) {
    // 导出重要记忆
    const important = await memory.recall('', {
      filters: { tags: ['important'] },
      limit: 1000
    });
    
    // 清空并重新导入
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

更多示例请参考 `/examples` 目录中的代码文件。
