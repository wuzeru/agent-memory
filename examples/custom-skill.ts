/**
 * Custom skill example: Creating and registering a custom skill
 */

import { AgentMemory, Skill, SkillContext, SkillResult } from '../src';

// Define a custom skill
const securityAuditSkill: Skill = {
  id: 'security-audit',
  name: 'Security Audit',
  description: 'Perform a security audit on code or system',
  execute: async (context: SkillContext): Promise<SkillResult> => {
    // Simulate security audit
    const findings = [
      'SQL injection vulnerability in user input',
      'XSS vulnerability in comment rendering',
      'Weak password policy'
    ];

    const recommendations = [
      'Use parameterized queries for all database operations',
      'Sanitize user input before rendering',
      'Enforce minimum password requirements: 12+ chars, special chars'
    ];

    return {
      success: true,
      output: {
        severity: 'high',
        findings,
        recommendations,
        checkedItems: 15,
        issuesFound: findings.length
      },
      metadata: {
        auditType: 'security',
        timestamp: new Date()
      }
    };
  }
};

async function main() {
  console.log('=== Custom Skill Example ===\n');

  const memory = new AgentMemory();
  await memory.initialize();

  // Register the custom skill
  console.log('📝 Registering custom security audit skill...');
  memory.registerSkill(securityAuditSkill);
  console.log('✅ Custom skill registered!\n');

  // List all skills (including custom)
  console.log('📋 All available skills:');
  const skills = memory.getSkills();
  skills.forEach(skill => {
    console.log(`- ${skill.name} (${skill.id})`);
  });
  console.log('');

  // Execute the custom skill
  console.log('⚡ Executing security audit skill...');
  const result = await memory.executeSkill(
    'security-audit',
    'Audit the user authentication system'
  );
  
  console.log('\nAudit Result:');
  console.log(`Severity: ${result.output.severity}`);
  console.log(`Checked Items: ${result.output.checkedItems}`);
  console.log(`Issues Found: ${result.output.issuesFound}`);
  console.log('\nFindings:');
  result.output.findings.forEach((finding: string, i: number) => {
    console.log(`  ${i + 1}. ${finding}`);
  });
  console.log('\nRecommendations:');
  result.output.recommendations.forEach((rec: string, i: number) => {
    console.log(`  ${i + 1}. ${rec}`);
  });
  console.log('');

  // The skill execution is automatically stored in memory
  console.log('🔍 Recalling security-related memories...');
  const memories = await memory.recall('security audit findings', { limit: 3 });
  console.log(`Found ${memories.length} related memories`);
  memories.forEach(m => {
    console.log(`- [${(m.similarity * 100).toFixed(1)}%] ${m.entry.content.substring(0, 80)}...`);
  });
}

main().catch(console.error);
