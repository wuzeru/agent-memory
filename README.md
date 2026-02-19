# AgentMemory - AI Agent 持久化工作记忆系统

[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/typescript-5.3%2B-blue.svg)](https://www.typescriptlang.org)
[![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)](https://nodejs.org)

🧠 **让 AI Agent 拥有持久化、可检索、可转换的工作记忆系统**

## 📊 项目信息

**创新方法**: 跨项目整合  
**灵感来源**: GitHub Trending 多项目组合  
**整合项目**:
- 🎯 [obra/superpowers](https://github.com/obra/superpowers) - Agentic skills 框架 (54K⭐)
- 🔄 [p2r3/convert](https://github.com/p2r3/convert) - 万能文件转换器 (1.2K⭐)
- 🔍 [alibaba/zvec](https://github.com/alibaba/zvec) - 进程内向量数据库 (4.8K⭐)

**日期**: 2026-02-18

---

## 🎯 核心创新

将三个优秀项目的能力整合，创造全新的 Agent 记忆系统：

| 来源项目 | 原能力 | 整合后的新能力 |
|---------|--------|---------------|
| **superpowers** | Skill 编排、子 agent 分发 | **记忆驱动的 skill 调度** - 基于历史经验选择最佳 skill |
| **convert** | 200+ 格式文件转换 | **万能知识摄取** - 任何文件格式 → 结构化知识 |
| **zvec** | 轻量高速向量检索 | **语义记忆检索** - 毫秒级找到相关历史上下文 |
| **新增** | - | **经验学习引擎** - 从成功/失败经历中积累智慧 |

---

## ✨ 核心功能

### 1. 万能知识摄取管线 🔄

**任意格式 → 结构化知识 → 永久记忆**

```typescript
import { AgentMemory } from 'agent-memory';

const memory = new AgentMemory();
await memory.initialize();

// Agent 阅读 PDF 文档
await memory.ingest('architecture-design.pdf');

// Agent 阅读 Excel 数据
await memory.ingest('sales-report.xlsx');

// Agent 阅读代码文件
await memory.ingest('api-service.ts');

// 之后任何时候都能检索
const results = await memory.recall('数据库选型是什么?');
console.log(results[0].entry.content);
// → "文档第23页: 推荐 PostgreSQL + Redis..."
```

**支持的文件格式**:
- 📄 文档: PDF, DOCX, TXT, MD
- 📊 数据: CSV, JSON, YAML
- 💻 代码: JS, TS, PY, JAVA, GO, RUST, C, C++
- 🌐 Web: HTML, CSS, XML

> **注意**: XLSX 格式支持已移除，因为 xlsx 包存在安全漏洞。请使用 CSV 格式替代，或先将 XLSX 转换为 CSV。详见 [SECURITY.md](SECURITY.md)

### 2. 经验驱动的 Skill 选择 🎯

**从历史中学习，自动选择最佳方案**

```typescript
// Agent 第一次处理 Django 性能问题
await memory.executeSkill('db-optimization', 'Django 项目慢了');
// 成功率: 95%

await memory.executeSkill('code-review', 'Django 项目慢了');
// 成功率: 60%

// 下次遇到类似问题，自动推荐最佳方案
const recommendations = await memory.recommendSkills('Django 性能优化');
console.log(recommendations[0]);
// {
//   skill: { name: 'Database Optimization', ... },
//   confidence: 0.95,
//   reason: 'high success rate (95%)',
//   historicalSuccessRate: 0.95
// }
```

**内置技能**:
- ✅ **code-review** - 代码审查
- 📝 **doc-generation** - 文档生成
- 🧪 **test-generation** - 测试生成
- 🗄️ **db-optimization** - 数据库优化
- 🔧 **refactoring** - 代码重构

### 3. 跨会话知识传递 🔗

**一次学习，永久记忆**

```typescript
// 会话 1: Agent 学习项目部署流程
await memory.ingestText(
  '部署流程: 1. npm build 2. docker build 3. kubectl apply',
  { type: 'document', tags: ['deployment'] }
);

// 会话 2: Agent 自动检索相关记忆
const memories = await memory.recall('如何部署项目?', { limit: 3 });
// 无需重新学习，立即获得部署流程

// 会话 3: 结合历史经验给出更好建议
const skills = await memory.recommendSkills('部署项目到生产环境');
// 推荐基于历史成功经验的最佳实践
```

---

## 🚀 快速开始

### 安装

```bash
# 克隆项目
git clone https://github.com/wuzeru/forge-workspace.git
cd forge-workspace/projects/2026-02-18-agent-memory

# 安装依赖
npm install

# 构建项目
npm run build

# 链接到全局（可选）
npm link
```

### 基础使用

#### 命令行界面

```bash
# 初始化 AgentMemory
agent-memory init

# 摄取文件
agent-memory ingest ./docs/README.md
agent-memory ingest ./data/report.pdf --tags "report,2026"

# 检索记忆
agent-memory recall "如何部署项目?"

# 查看可用技能
agent-memory skills

# 执行技能
agent-memory execute code-review "审查登录模块的安全性"

# 获取技能推荐
agent-memory recommend "Django 性能优化"

# 查看统计信息
agent-memory stats

# 清除所有记忆
agent-memory clear
```

#### 编程接口

```typescript
import { AgentMemory } from 'agent-memory';

const memory = new AgentMemory({
  storagePath: '.agent-memory',
  embeddingModel: 'Xenova/all-MiniLM-L6-v2',
  maxMemories: 10000,
  similarityThreshold: 0.5
});

// 初始化
await memory.initialize();

// 摄取文件
await memory.ingest('document.pdf', {
  tags: ['docs', 'important'],
  source: 'project-docs'
});

// 直接摄取文本
await memory.ingestText('This is important information', {
  type: 'conversation',
  tags: ['meeting']
});

// 检索记忆
const results = await memory.recall('important information', {
  limit: 5,
  threshold: 0.7,
  filters: {
    type: 'conversation',
    tags: ['meeting']
  }
});

// 执行技能
const result = await memory.executeSkill('code-review', 'Review login.ts');

// 获取推荐
const recommendations = await memory.recommendSkills('optimize database');

// 注册自定义技能
memory.registerSkill({
  id: 'custom-skill',
  name: 'Custom Skill',
  description: 'My custom skill',
  execute: async (context) => {
    return {
      success: true,
      output: 'Done!'
    };
  }
});

// 查看统计
const stats = await memory.getStats();
console.log(stats);
```

---

## 🎯 使用场景

### 场景 1: 新人 Agent 快速上手

```typescript
// 将项目所有文档一次性摄取
const docs = [
  './docs/README.md',
  './docs/architecture.md',
  './docs/api-reference.md',
  './confluence-export.pdf',
  './design-spec.docx'
];

for (const doc of docs) {
  await memory.ingest(doc, { tags: ['onboarding'] });
}

// Agent 立即拥有完整项目知识
const knowledge = await memory.recall('项目架构是什么?');
// 可以立即开始工作
```

### 场景 2: 持续改进的开发助手

```typescript
// 记录每次 code review 反馈
await memory.ingestText(
  'Code Review 反馈: 建议使用 try-catch 包裹异步操作',
  { type: 'experience', tags: ['code-review', 'best-practice'] }
);

// 记录 bug fix 模式
await memory.ingestText(
  'Bug Fix: 空指针异常 - 添加 null 检查',
  { type: 'experience', tags: ['bug-fix', 'null-safety'] }
);

// 下次遇到类似问题，自动应用历史最佳方案
const similar = await memory.recall('异步操作错误处理');
// 自动找到相关的最佳实践
```

### 场景 3: 团队知识共享

```typescript
// 团队成员 A 的经验
await memory.ingestText(
  '部署到 K8s: 需要先设置 imagePullSecrets',
  { type: 'experience', tags: ['deployment', 'k8s'] }
);

// 团队成员 B 可以直接检索
const deployment = await memory.recall('如何部署到 K8s?');
// 无需重复踩坑
```

---

## 🏗️ 技术架构

```
[任意文件] → [ConvertService 转换层] → [文本/结构化数据]
                                              ↓
[VectorStore 向量库] ← [EmbeddingService] ← [知识块]
       ↓
[SkillManager 技能引擎] ← [记忆检索] ← [当前上下文]
       ↓
[最佳 Skill 组合执行]
```

### 核心组件

#### 1. ConvertService - 文件转换层
- 支持 18+ 文件格式（PDF, DOCX, CSV, 代码文件等）
- 统一转换为文本格式
- 保留结构化信息
- 注意: XLSX 支持已移除（安全原因）

#### 2. EmbeddingService - 向量嵌入
- 使用 `@xenova/transformers` 本地生成
- 模型: `all-MiniLM-L6-v2`
- 无需外部 API，完全本地化
- **Note**: 首次使用时会下载模型（约 23MB），需要网络连接
- 如果模型下载失败，系统会自动使用简单的基于哈希的备用嵌入方案

#### 3. VectorStore - 向量存储
- 本地进程内存储
- 余弦相似度搜索
- JSON 持久化

#### 4. SkillManager - 技能编排
- 技能注册和执行
- 历史追踪
- 智能推荐

#### 5. AgentMemory - 核心协调器
- 整合所有组件
- 提供统一 API
- 自动化工作流

---

## 📋 API 文档

### AgentMemory

#### `constructor(config?: AgentMemoryConfig)`
创建 AgentMemory 实例

```typescript
const memory = new AgentMemory({
  storagePath: '.agent-memory',
  embeddingModel: 'Xenova/all-MiniLM-L6-v2',
  maxMemories: 10000,
  similarityThreshold: 0.5
});
```

#### `initialize(): Promise<void>`
初始化系统（必须在使用前调用）

#### `ingest(filePath: string, options?: IngestionOptions): Promise<string>`
摄取文件到记忆系统

#### `ingestText(text: string, metadata?: Partial<MemoryMetadata>): Promise<string>`
直接摄取文本到记忆系统

#### `recall(query: string, options?: RecallOptions): Promise<MemoryRecallResult[]>`
检索相关记忆

#### `executeSkill(skillId: string, query: string): Promise<any>`
执行特定技能

#### `recommendSkills(query: string, limit?: number): Promise<SkillRecommendation[]>`
获取技能推荐

#### `registerSkill(skill: Skill): void`
注册自定义技能

#### `getSkills(): Skill[]`
获取所有可用技能

#### `getStats(): Promise<MemoryStats>`
获取记忆统计信息

#### `clear(): Promise<void>`
清除所有记忆

---

## 🧪 开发指南

### 本地开发

```bash
# 安装依赖
npm install

# 开发模式（支持热重载）
npm run dev

# 构建项目
npm run build

# 运行测试
npm test

# 代码检查
npm run lint

# 代码格式化
npm run format
```

### 添加自定义技能

```typescript
import { Skill, SkillContext, SkillResult } from 'agent-memory';

const mySkill: Skill = {
  id: 'my-custom-skill',
  name: 'My Custom Skill',
  description: 'Does something amazing',
  execute: async (context: SkillContext): Promise<SkillResult> => {
    // 访问相关记忆
    const memories = context.memories;
    
    // 执行技能逻辑
    const output = {
      result: 'Success!',
      data: { /* ... */ }
    };
    
    return {
      success: true,
      output,
      metadata: {
        timestamp: new Date()
      }
    };
  }
};

// 注册技能
memory.registerSkill(mySkill);
```

---

## 📂 项目结构

```
agent-memory/
├── src/
│   ├── core/
│   │   └── memory.ts          # AgentMemory 核心类
│   ├── convert/
│   │   └── service.ts         # 文件转换服务
│   ├── vector/
│   │   ├── store.ts           # 向量存储
│   │   └── embeddings.ts      # 嵌入生成
│   ├── skills/
│   │   ├── manager.ts         # 技能管理器
│   │   └── builtin.ts         # 内置技能
│   ├── types/
│   │   └── index.ts           # 类型定义
│   ├── cli.ts                 # CLI 接口
│   └── index.ts               # 主入口
├── examples/                  # 示例代码
├── tests/                     # 测试文件
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🔒 安全说明

### 依赖安全性

AgentMemory 努力使用安全的依赖包。请注意以下安全考虑：

#### XLSX 文件支持（可选）

Excel 文件（.xlsx）支持通过 `xlsx` 包提供，该包目前存在已知的安全漏洞：
- **CVE**: Regular Expression Denial of Service (ReDoS)
- **CVE**: Prototype Pollution
- **影响版本**: < 0.20.2（修复版本尚未发布）

**当前状态**: xlsx 被标记为**可选依赖**

**安全建议**:
1. ⚠️ **仅在信任的环境中使用** XLSX 文件转换功能
2. ✅ **验证输入**: 在处理前验证 XLSX 文件来源和内容
3. ✅ **限制文件大小**: 设置合理的文件大小限制
4. ✅ **沙箱环境**: 在隔离环境中处理不受信任的文件
5. 💡 **替代方案**: 考虑使用 CSV 格式或其他安全的表格格式

**如何使用**:
```bash
# 默认安装不包含 xlsx
npm install

# 如果需要 XLSX 支持，手动安装（风险自负）
npm install xlsx

# 或者不安装 xlsx，系统会给出清晰的错误提示
```

**代码示例**（安全实践）:
```typescript
import * as fs from 'fs';
import { AgentMemory } from 'agent-memory';

const memory = new AgentMemory();

// 在处理 XLSX 前进行验证
async function safeIngestXLSX(filePath: string) {
  // 1. 检查文件大小
  const stats = fs.statSync(filePath);
  if (stats.size > 10 * 1024 * 1024) { // 10MB 限制
    throw new Error('File too large');
  }
  
  // 2. 验证文件来源
  if (!isTrustedSource(filePath)) {
    throw new Error('Untrusted file source');
  }
  
  // 3. 在隔离环境中处理
  try {
    await memory.ingest(filePath);
  } catch (error) {
    console.error('Failed to ingest XLSX:', error);
  }
}
```

### 其他安全最佳实践

1. **定期更新依赖**: 运行 `npm audit` 检查已知漏洞
2. **输入验证**: 始终验证用户输入和文件路径
3. **最小权限**: 运行时使用最小必要权限
4. **监控日志**: 记录异常行为和错误

### 报告安全问题

如果发现安全漏洞，请通过 GitHub Issues 报告，或直接联系维护者。

---

## 🔗 整合对比

### 与原项目的区别

| 维度 | 原项目 | AgentMemory |
|------|--------|-------------|
| **superpowers** | 独立的 skill 框架 | **记忆驱动** 的 skill 选择 |
| **convert** | 纯文件转换工具 | 转换 + **自动向量化** + 存储 |
| **zvec** | 通用向量数据库 | 专为 Agent **记忆优化** 的向量存储 |
| **新增** | - | **经验学习引擎** + **跨会话记忆** |

### 核心创新点

1. ✅ **三位一体整合**: 不是简单拼接，而是深度融合
2. ✅ **经验驱动**: Skill 选择基于历史成功率
3. ✅ **零依赖外部服务**: 完全本地化运行
4. ✅ **持久化记忆**: 跨会话知识传递
5. ✅ **自动化管线**: 文件 → 转换 → 向量化 → 存储一气呵成

---

## 🚧 实现状态

### Phase 1: 基础整合 ✅
- [x] Convert wrapper: 文件 → 文本管线
- [x] Vector store: 本地向量存储
- [x] Embedding service: 本地嵌入生成
- [x] 基础记忆存取 API

### Phase 2: 智能功能 ✅
- [x] 经验驱动 skill 选择
- [x] 跨会话知识传递
- [x] Skill 执行历史追踪
- [x] 智能推荐引擎

### Phase 3: 产品化 🚧
- [ ] 记忆可视化 Dashboard
- [ ] 记忆导出/导入
- [ ] 团队共享记忆
- [ ] 更多文件格式支持
- [ ] 性能优化

---

## 🤝 贡献指南

欢迎贡献！特别欢迎：

- 🐛 Bug 修复
- ✨ 新功能
- 📝 文档改进
- 🧪 测试用例
- 🎨 新的内置技能

---

## 📄 开源协议

MIT License - 详见 [LICENSE](LICENSE) 文件

---

## 🙏 致谢

- [obra/superpowers](https://github.com/obra/superpowers) - Skill 编排灵感
- [p2r3/convert](https://github.com/p2r3/convert) - 文件转换能力
- [alibaba/zvec](https://github.com/alibaba/zvec) - 向量存储架构
- [@xenova/transformers](https://github.com/xenova/transformers.js) - 本地嵌入模型

---

## 💡 为什么选这个创新方向？

1. **痛点明确**: AI Agent 都是"失忆"状态，每次对话都从零开始
2. **整合有机**: 三个项目能力互补，组合后 1+1+1>3
3. **技术可行**: 都是成熟技术，整合风险低
4. **应用广泛**: 任何需要记忆的 Agent 场景都能用
5. **差异化价值**:
   - ✅ 完全本地化（vs 依赖外部 API）
   - ✅ 经验驱动（vs 静态规则）
   - ✅ 持久化记忆（vs 临时会话）
   - ✅ 万能摄取（vs 单一格式）

---

**🚀 让每个 AI Agent 都拥有永不遗忘的智慧！**
