/**
 * Basic example: Ingesting and recalling memories
 */

import { AgentMemory } from '../src';

async function main() {
  console.log('=== Basic Example: Ingest & Recall ===\n');

  // Create and initialize AgentMemory
  const memory = new AgentMemory({
    storagePath: '.agent-memory-example'
  });

  await memory.initialize();

  // Ingest some text memories
  console.log('📝 Ingesting memories...');
  
  await memory.ingestText(
    'The project uses TypeScript with Node.js. The main framework is Express.js for the API.',
    { type: 'document', tags: ['tech-stack'] }
  );

  await memory.ingestText(
    'Database: PostgreSQL for persistent storage, Redis for caching. All queries use prepared statements.',
    { type: 'document', tags: ['database'] }
  );

  await memory.ingestText(
    'Deployment: Docker containers orchestrated by Kubernetes. CI/CD via GitHub Actions.',
    { type: 'document', tags: ['deployment'] }
  );

  console.log('✅ Memories ingested!\n');

  // Recall memories
  console.log('🔍 Recalling memories...\n');

  const results1 = await memory.recall('What database do we use?', { limit: 2 });
  console.log('Query: "What database do we use?"');
  results1.forEach(r => {
    console.log(`- [${(r.similarity * 100).toFixed(1)}%] ${r.entry.content.substring(0, 100)}...`);
  });
  console.log('');

  const results2 = await memory.recall('How do we deploy?', { limit: 2 });
  console.log('Query: "How do we deploy?"');
  results2.forEach(r => {
    console.log(`- [${(r.similarity * 100).toFixed(1)}%] ${r.entry.content.substring(0, 100)}...`);
  });
  console.log('');

  // Show statistics
  const stats = await memory.getStats();
  console.log('📊 Statistics:');
  console.log(`Total memories: ${stats.totalMemories}`);
  console.log(`Memory types:`, stats.memoryTypes);
}

main().catch(console.error);
