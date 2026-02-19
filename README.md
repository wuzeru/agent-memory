# AgentMemory - AI Agent Persistent Work Memory System

[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/typescript-5.3%2B-blue.svg)](https://www.typescriptlang.org)
[![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)](https://nodejs.org)

🧠 **Give AI Agents a persistent, retrievable, and transformable work memory system**

## 📊 Project Information

**Innovation Method**: Cross-project Integration  
**Inspiration Source**: GitHub Trending Multi-project Combination  
**Integrated Projects**:
- 🎯 [obra/superpowers](https://github.com/obra/superpowers) - Agentic skills framework (54K⭐)
- 🔄 [p2r3/convert](https://github.com/p2r3/convert) - Universal file converter (1.2K⭐)
- 🔍 [alibaba/zvec](https://github.com/alibaba/zvec) - In-process vector database (4.8K⭐)

**Date**: 2026-02-18

---

## 🎯 Core Innovation

Integrate the capabilities of three excellent projects to create a brand new Agent memory system:

| Source Project | Original Capability | New Capability After Integration |
|---------|--------|---------------|
| **superpowers** | Skill orchestration, sub-agent dispatch | **Memory-driven skill scheduling** - Select best skill based on historical experience |
| **convert** | 200+ format file conversion | **Universal knowledge ingestion** - Any file format → Structured knowledge |
| **zvec** | Lightweight high-speed vector search | **Semantic memory retrieval** - Find relevant historical context in milliseconds |
| **New** | - | **Experience learning engine** - Accumulate wisdom from success/failure experiences |

---

## ✨ Core Features

### 1. Universal Knowledge Ingestion Pipeline 🔄

**Any Format → Structured Knowledge → Permanent Memory**

```typescript
import { AgentMemory } from 'agent-memory';

const memory = new AgentMemory();
await memory.initialize();

// Agent reads PDF documents
await memory.ingest('architecture-design.pdf');

// Agent reads Excel data
await memory.ingest('sales-report.xlsx');

// Agent reads code files
await memory.ingest('api-service.ts');

// Can retrieve at any time later
const results = await memory.recall('What is the database selection?');
console.log(results[0].entry.content);
// → "Page 23 of document: Recommend PostgreSQL + Redis..."
```

**Supported File Formats**:
- 📄 Documents: PDF, DOCX, TXT, MD
- 📊 Data: CSV, JSON, YAML
- 💻 Code: JS, TS, PY, JAVA, GO, RUST, C, C++
- 🌐 Web: HTML, CSS, XML

> **Note**: XLSX format support has been removed due to security vulnerabilities in the xlsx package. Please use CSV format instead, or convert XLSX to CSV first. See [SECURITY.md](SECURITY.md)

### 2. Experience-Driven Skill Selection 🎯

**Learn from history, automatically select the best approach**

```typescript
// Agent handles Django performance issue for the first time
await memory.executeSkill('db-optimization', 'Django project is slow');
// Success rate: 95%

await memory.executeSkill('code-review', 'Django project is slow');
// Success rate: 60%

// Next time encountering similar issues, automatically recommend the best approach
const recommendations = await memory.recommendSkills('Django performance optimization');
console.log(recommendations[0]);
// {
//   skill: { name: 'Database Optimization', ... },
//   confidence: 0.95,
//   reason: 'high success rate (95%)',
//   historicalSuccessRate: 0.95
// }
```

**Built-in Skills**:
- ✅ **code-review** - Code review
- 📝 **doc-generation** - Documentation generation
- 🧪 **test-generation** - Test generation
- 🗄️ **db-optimization** - Database optimization
- 🔧 **refactoring** - Code refactoring

### 3. Cross-Session Knowledge Transfer 🔗

**Learn once, remember forever**

```typescript
// Session 1: Agent learns project deployment process
await memory.ingestText(
  'Deployment process: 1. npm build 2. docker build 3. kubectl apply',
  { type: 'document', tags: ['deployment'] }
);

// Session 2: Agent automatically retrieves relevant memories
const memories = await memory.recall('How to deploy the project?', { limit: 3 });
// No need to relearn, immediately get deployment process

// Session 3: Provide better advice based on historical experience
const skills = await memory.recommendSkills('Deploy project to production');
// Recommend best practices based on historical successful experiences
```

---

## 🚀 Quick Start

### Installation

```bash
# Clone the project
git clone https://github.com/wuzeru/forge-workspace.git
cd forge-workspace/projects/2026-02-18-agent-memory

# Install dependencies
npm install

# Build the project
npm run build

# Link to global (optional)
npm link
```

### Basic Usage

#### Command Line Interface

```bash
# Initialize AgentMemory
agent-memory init

# Ingest files
agent-memory ingest ./docs/README.md
agent-memory ingest ./data/report.pdf --tags "report,2026"

# Retrieve memories
agent-memory recall "How to deploy the project?"

# View available skills
agent-memory skills

# Execute a skill
agent-memory execute code-review "Review security of login module"

# Get skill recommendations
agent-memory recommend "Django performance optimization"

# View statistics
agent-memory stats

# Clear all memories
agent-memory clear
```

#### Programming Interface

```typescript
import { AgentMemory } from 'agent-memory';

const memory = new AgentMemory({
  storagePath: '.agent-memory',
  embeddingModel: 'Xenova/all-MiniLM-L6-v2',
  maxMemories: 10000,
  similarityThreshold: 0.5
});

// Initialize
await memory.initialize();

// Ingest file
await memory.ingest('document.pdf', {
  tags: ['docs', 'important'],
  source: 'project-docs'
});

// Directly ingest text
await memory.ingestText('This is important information', {
  type: 'conversation',
  tags: ['meeting']
});

// Retrieve memories
const results = await memory.recall('important information', {
  limit: 5,
  threshold: 0.7,
  filters: {
    type: 'conversation',
    tags: ['meeting']
  }
});

// Execute a skill
const result = await memory.executeSkill('code-review', 'Review login.ts');

// Get recommendations
const recommendations = await memory.recommendSkills('optimize database');

// Register custom skill
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

// View statistics
const stats = await memory.getStats();
console.log(stats);
```

---

## 🎯 Use Cases

### Scenario 1: New Agent Quick Onboarding

```typescript
// Ingest all project documentation at once
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

// Agent immediately has complete project knowledge
const knowledge = await memory.recall('What is the project architecture?');
// Can start working immediately
```

### Scenario 2: Continuously Improving Development Assistant

```typescript
// Record every code review feedback
await memory.ingestText(
  'Code Review Feedback: Suggest using try-catch for async operations',
  { type: 'experience', tags: ['code-review', 'best-practice'] }
);

// Record bug fix patterns
await memory.ingestText(
  'Bug Fix: Null pointer exception - Add null checks',
  { type: 'experience', tags: ['bug-fix', 'null-safety'] }
);

// Next time encountering similar issues, automatically apply historical best approaches
const similar = await memory.recall('async operation error handling');
// Automatically find relevant best practices
```

### Scenario 3: Team Knowledge Sharing

```typescript
// Team member A's experience
await memory.ingestText(
  'Deploy to K8s: Need to set imagePullSecrets first',
  { type: 'experience', tags: ['deployment', 'k8s'] }
);

// Team member B can directly retrieve
const deployment = await memory.recall('How to deploy to K8s?');
// No need to repeat mistakes
```

---

## 🏗️ Technical Architecture

```
[Any File] → [ConvertService Conversion Layer] → [Text/Structured Data]
                                              ↓
[VectorStore Vector DB] ← [EmbeddingService] ← [Knowledge Blocks]
       ↓
[SkillManager Skill Engine] ← [Memory Retrieval] ← [Current Context]
       ↓
[Execute Best Skill Combination]
```

### Core Components

#### 1. ConvertService - File Conversion Layer
- Supports 18+ file formats (PDF, DOCX, CSV, code files, etc.)
- Unified conversion to text format
- Preserves structured information
- Note: XLSX support removed (security reasons)

#### 2. EmbeddingService - Vector Embedding
- Uses `@xenova/transformers` for local generation
- Model: `all-MiniLM-L6-v2`
- No external API needed, completely local
- **Note**: Downloads model on first use (~23MB), requires internet connection
- If model download fails, system automatically uses a simple hash-based fallback embedding approach

#### 3. VectorStore - Vector Storage
- Local in-process storage
- Cosine similarity search
- JSON persistence

#### 4. SkillManager - Skill Orchestration
- Skill registration and execution
- Historical tracking
- Intelligent recommendations

#### 5. AgentMemory - Core Coordinator
- Integrates all components
- Provides unified API
- Automated workflow

---

## 📋 API Documentation

### AgentMemory

#### `constructor(config?: AgentMemoryConfig)`
Create AgentMemory instance

```typescript
const memory = new AgentMemory({
  storagePath: '.agent-memory',
  embeddingModel: 'Xenova/all-MiniLM-L6-v2',
  maxMemories: 10000,
  similarityThreshold: 0.5
});
```

#### `initialize(): Promise<void>`
Initialize the system (must be called before use)

#### `ingest(filePath: string, options?: IngestionOptions): Promise<string>`
Ingest file into memory system

#### `ingestText(text: string, metadata?: Partial<MemoryMetadata>): Promise<string>`
Directly ingest text into memory system

#### `recall(query: string, options?: RecallOptions): Promise<MemoryRecallResult[]>`
Retrieve relevant memories

#### `executeSkill(skillId: string, query: string): Promise<any>`
Execute a specific skill

#### `recommendSkills(query: string, limit?: number): Promise<SkillRecommendation[]>`
Get skill recommendations

#### `registerSkill(skill: Skill): void`
Register a custom skill

#### `getSkills(): Skill[]`
Get all available skills

#### `getStats(): Promise<MemoryStats>`
Get memory statistics

#### `clear(): Promise<void>`
Clear all memories

---

## 🧪 Development Guide

### Local Development

```bash
# Install dependencies
npm install

# Development mode (with hot reload)
npm run dev

# Build the project
npm run build

# Run tests
npm test

# Code linting
npm run lint

# Code formatting
npm run format
```

### Adding Custom Skills

```typescript
import { Skill, SkillContext, SkillResult } from 'agent-memory';

const mySkill: Skill = {
  id: 'my-custom-skill',
  name: 'My Custom Skill',
  description: 'Does something amazing',
  execute: async (context: SkillContext): Promise<SkillResult> => {
    // Access relevant memories
    const memories = context.memories;
    
    // Execute skill logic
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

// Register the skill
memory.registerSkill(mySkill);
```

---

## 📂 Project Structure

```
agent-memory/
├── src/
│   ├── core/
│   │   └── memory.ts          # AgentMemory core class
│   ├── convert/
│   │   └── service.ts         # File conversion service
│   ├── vector/
│   │   ├── store.ts           # Vector storage
│   │   └── embeddings.ts      # Embedding generation
│   ├── skills/
│   │   ├── manager.ts         # Skill manager
│   │   └── builtin.ts         # Built-in skills
│   ├── types/
│   │   └── index.ts           # Type definitions
│   ├── cli.ts                 # CLI interface
│   └── index.ts               # Main entry point
├── examples/                  # Example code
├── tests/                     # Test files
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🔒 Security Notes

### Dependency Security

AgentMemory strives to use secure dependencies. Please note the following security considerations:

#### XLSX File Support (Optional)

Excel file (.xlsx) support is provided through the `xlsx` package, which currently has known security vulnerabilities:
- **CVE**: Regular Expression Denial of Service (ReDoS)
- **CVE**: Prototype Pollution
- **Affected versions**: < 0.20.2 (fixed version not yet released)

**Current status**: xlsx is marked as an **optional dependency**

**Security recommendations**:
1. ⚠️ **Use XLSX file conversion feature only in trusted environments**
2. ✅ **Validate input**: Verify XLSX file source and content before processing
3. ✅ **Limit file size**: Set reasonable file size limits
4. ✅ **Sandbox environment**: Process untrusted files in isolated environments
5. 💡 **Alternative**: Consider using CSV format or other secure spreadsheet formats

**How to use**:
```bash
# Default installation does not include xlsx
npm install

# If you need XLSX support, manually install (at your own risk)
npm install xlsx

# Or don't install xlsx, the system will give clear error messages
```

**Code example** (security best practices):
```typescript
import * as fs from 'fs';
import { AgentMemory } from 'agent-memory';

const memory = new AgentMemory();

// Validate before processing XLSX
async function safeIngestXLSX(filePath: string) {
  // 1. Check file size
  const stats = fs.statSync(filePath);
  if (stats.size > 10 * 1024 * 1024) { // 10MB limit
    throw new Error('File too large');
  }
  
  // 2. Validate file source
  if (!isTrustedSource(filePath)) {
    throw new Error('Untrusted file source');
  }
  
  // 3. Process in isolated environment
  try {
    await memory.ingest(filePath);
  } catch (error) {
    console.error('Failed to ingest XLSX:', error);
  }
}
```

### Other Security Best Practices

1. **Regular dependency updates**: Run `npm audit` to check for known vulnerabilities
2. **Input validation**: Always validate user input and file paths
3. **Minimum privileges**: Run with minimum necessary privileges
4. **Monitor logs**: Log abnormal behavior and errors

### Report Security Issues

If you discover a security vulnerability, please report it through GitHub Issues or contact the maintainers directly.

---

## 🔗 Integration Comparison

### Differences from Original Projects

| Dimension | Original Projects | AgentMemory |
|------|--------|-------------|
| **superpowers** | Independent skill framework | **Memory-driven** skill selection |
| **convert** | Pure file conversion tool | Conversion + **auto-vectorization** + storage |
| **zvec** | General vector database | Vector storage **optimized for Agent memory** |
| **New** | - | **Experience learning engine** + **cross-session memory** |

### Core Innovation Points

1. ✅ **Trinity integration**: Not simple concatenation, but deep fusion
2. ✅ **Experience-driven**: Skill selection based on historical success rate
3. ✅ **Zero external dependencies**: Fully localized operation
4. ✅ **Persistent memory**: Cross-session knowledge transfer
5. ✅ **Automated pipeline**: File → Conversion → Vectorization → Storage in one go

---

## 🚧 Implementation Status

### Phase 1: Basic Integration ✅
- [x] Convert wrapper: File → Text pipeline
- [x] Vector store: Local vector storage
- [x] Embedding service: Local embedding generation
- [x] Basic memory access API

### Phase 2: Intelligent Features ✅
- [x] Experience-driven skill selection
- [x] Cross-session knowledge transfer
- [x] Skill execution history tracking
- [x] Intelligent recommendation engine

### Phase 3: Productization 🚧
- [ ] Memory visualization Dashboard
- [ ] Memory export/import
- [ ] Team shared memory
- [ ] More file format support
- [ ] Performance optimization

---

## 🤝 Contributing Guide

Contributions welcome! Especially:

- 🐛 Bug fixes
- ✨ New features
- 📝 Documentation improvements
- 🧪 Test cases
- 🎨 New built-in skills

---

## 📄 License

MIT License - See [LICENSE](LICENSE) file for details

---

## 🙏 Acknowledgements

- [obra/superpowers](https://github.com/obra/superpowers) - Skill orchestration inspiration
- [p2r3/convert](https://github.com/p2r3/convert) - File conversion capabilities
- [alibaba/zvec](https://github.com/alibaba/zvec) - Vector storage architecture
- [@xenova/transformers](https://github.com/xenova/transformers.js) - Local embedding model

---

## 💡 Why This Innovation Direction?

1. **Clear pain point**: AI Agents are "amnesiac", starting from scratch in every conversation
2. **Organic integration**: Three projects complement each other, 1+1+1>3 when combined
3. **Technical feasibility**: All mature technologies, low integration risk
4. **Wide application**: Can be used in any Agent scenario requiring memory
5. **Differentiated value**:
   - ✅ Fully localized (vs relying on external APIs)
   - ✅ Experience-driven (vs static rules)
   - ✅ Persistent memory (vs temporary sessions)
   - ✅ Universal ingestion (vs single format)

---

**🚀 Give every AI Agent the wisdom that never forgets!**
