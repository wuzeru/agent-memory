/**
 * Skills example: Using and recommending skills
 */

import { AgentMemory } from '../src';

async function main() {
  console.log('=== Skills Example ===\n');

  const memory = new AgentMemory();
  await memory.initialize();

  // List available skills
  console.log('📋 Available Skills:');
  const skills = memory.getSkills();
  skills.forEach(skill => {
    console.log(`- ${skill.name}: ${skill.description}`);
  });
  console.log('');

  // Execute a skill
  console.log('⚡ Executing code review skill...');
  const reviewResult = await memory.executeSkill(
    'code-review',
    'Review the login authentication module'
  );
  console.log('Result:', JSON.stringify(reviewResult.output, null, 2));
  console.log('');

  // Execute another skill with different context
  console.log('⚡ Executing database optimization skill...');
  const dbResult = await memory.executeSkill(
    'db-optimization',
    'The user query endpoint is slow'
  );
  console.log('Result:', JSON.stringify(dbResult.output, null, 2));
  console.log('');

  // Get skill recommendations
  console.log('💡 Getting skill recommendations...');
  const recommendations = await memory.recommendSkills(
    'The application is running slowly',
    3
  );
  
  console.log('\nRecommendations:');
  recommendations.forEach((rec, index) => {
    console.log(`${index + 1}. ${rec.skill.name}`);
    console.log(`   Confidence: ${(rec.confidence * 100).toFixed(1)}%`);
    console.log(`   Reason: ${rec.reason}`);
    console.log('');
  });

  // Show statistics
  const stats = await memory.getStats();
  console.log('📊 Total memories (including skill executions):', stats.totalMemories);
}

main().catch(console.error);
