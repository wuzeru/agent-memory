#!/usr/bin/env node
/**
 * CLI interface for AgentMemory
 */

import { Command } from 'commander';
import * as inquirer from 'inquirer';
import * as chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';
import { AgentMemory } from './core/memory';

const program = new Command();

program
  .name('agent-memory')
  .description('AI Agent persistent work memory system')
  .version('1.0.0');

// Initialize command
program
  .command('init')
  .description('Initialize AgentMemory in the current directory')
  .action(async () => {
    console.log(chalk.blue('🚀 Initializing AgentMemory...'));
    
    const memory = new AgentMemory();
    await memory.initialize();
    
    console.log(chalk.green('✅ AgentMemory initialized successfully!'));
    console.log(chalk.gray('Storage location: .agent-memory/'));
  });

// Ingest command
program
  .command('ingest <file>')
  .description('Ingest a file into memory')
  .option('-t, --tags <tags>', 'Comma-separated tags', '')
  .option('-s, --source <source>', 'Source identifier')
  .action(async (file: string, options: any) => {
    if (!fs.existsSync(file)) {
      console.error(chalk.red(`❌ File not found: ${file}`));
      process.exit(1);
    }

    console.log(chalk.blue(`📥 Ingesting file: ${file}`));
    
    const memory = new AgentMemory();
    await memory.initialize();
    
    const tags = options.tags ? options.tags.split(',').map((t: string) => t.trim()) : [];
    
    try {
      const memoryId = await memory.ingest(file, {
        tags,
        source: options.source || file
      });
      
      console.log(chalk.green('✅ File ingested successfully!'));
      console.log(chalk.gray(`Memory IDs: ${memoryId}`));
    } catch (error) {
      console.error(chalk.red(`❌ Failed to ingest file: ${error}`));
      process.exit(1);
    }
  });

// Recall command
program
  .command('recall <query>')
  .description('Recall memories based on a query')
  .option('-l, --limit <number>', 'Maximum number of results', '5')
  .option('-t, --threshold <number>', 'Similarity threshold', '0.5')
  .action(async (query: string, options: any) => {
    console.log(chalk.blue(`🔍 Searching for: ${query}`));
    
    const memory = new AgentMemory();
    await memory.initialize();
    
    try {
      const results = await memory.recall(query, {
        limit: parseInt(options.limit),
        threshold: parseFloat(options.threshold)
      });
      
      console.log(chalk.green(`\n✅ Found ${results.length} memories:\n`));
      
      results.forEach((result, index) => {
        console.log(chalk.yellow(`[${index + 1}] Similarity: ${(result.similarity * 100).toFixed(1)}%`));
        console.log(chalk.gray(`Source: ${result.entry.metadata.source || 'unknown'}`));
        console.log(chalk.gray(`Type: ${result.entry.metadata.type}`));
        console.log(chalk.white(result.entry.content.substring(0, 200) + '...'));
        console.log('');
      });
    } catch (error) {
      console.error(chalk.red(`❌ Failed to recall: ${error}`));
      process.exit(1);
    }
  });

// Skills command
program
  .command('skills')
  .description('List all available skills')
  .action(async () => {
    const memory = new AgentMemory();
    const skills = memory.getSkills();
    
    console.log(chalk.blue(`\n📋 Available Skills (${skills.length}):\n`));
    
    skills.forEach((skill, index) => {
      console.log(chalk.yellow(`[${index + 1}] ${skill.name}`));
      console.log(chalk.gray(`    ID: ${skill.id}`));
      console.log(chalk.gray(`    Description: ${skill.description}`));
      console.log('');
    });
  });

// Execute skill command
program
  .command('execute <skillId> <query>')
  .description('Execute a skill with a query')
  .action(async (skillId: string, query: string) => {
    console.log(chalk.blue(`⚡ Executing skill: ${skillId}`));
    console.log(chalk.gray(`Query: ${query}\n`));
    
    const memory = new AgentMemory();
    await memory.initialize();
    
    try {
      const result = await memory.executeSkill(skillId, query);
      
      if (result.success) {
        console.log(chalk.green('✅ Skill executed successfully!\n'));
        console.log(chalk.white(JSON.stringify(result.output, null, 2)));
      } else {
        console.log(chalk.red('❌ Skill execution failed!'));
        console.log(chalk.gray(`Error: ${result.error}`));
      }
    } catch (error) {
      console.error(chalk.red(`❌ Failed to execute skill: ${error}`));
      process.exit(1);
    }
  });

// Recommend command
program
  .command('recommend <query>')
  .description('Get skill recommendations for a query')
  .option('-l, --limit <number>', 'Number of recommendations', '3')
  .action(async (query: string, options: any) => {
    console.log(chalk.blue(`💡 Getting recommendations for: ${query}\n`));
    
    const memory = new AgentMemory();
    await memory.initialize();
    
    try {
      const recommendations = await memory.recommendSkills(query, parseInt(options.limit));
      
      console.log(chalk.green(`✅ Top ${recommendations.length} Recommendations:\n`));
      
      recommendations.forEach((rec, index) => {
        console.log(chalk.yellow(`[${index + 1}] ${rec.skill.name}`));
        console.log(chalk.gray(`    Confidence: ${(rec.confidence * 100).toFixed(1)}%`));
        console.log(chalk.gray(`    Reason: ${rec.reason}`));
        if (rec.historicalSuccessRate !== undefined) {
          console.log(chalk.gray(`    Historical Success: ${(rec.historicalSuccessRate * 100).toFixed(1)}%`));
        }
        console.log('');
      });
    } catch (error) {
      console.error(chalk.red(`❌ Failed to get recommendations: ${error}`));
      process.exit(1);
    }
  });

// Stats command
program
  .command('stats')
  .description('Show memory statistics')
  .action(async () => {
    const memory = new AgentMemory();
    await memory.initialize();
    
    try {
      const stats = await memory.getStats();
      
      console.log(chalk.blue('\n📊 Memory Statistics:\n'));
      console.log(chalk.white(`Total Memories: ${stats.totalMemories}`));
      console.log(chalk.white('\nMemory Types:'));
      
      Object.entries(stats.memoryTypes).forEach(([type, count]) => {
        console.log(chalk.gray(`  ${type}: ${count}`));
      });
      
      if (stats.oldestMemory) {
        console.log(chalk.white(`\nOldest Memory: ${stats.oldestMemory.toLocaleString()}`));
      }
      if (stats.newestMemory) {
        console.log(chalk.white(`Newest Memory: ${stats.newestMemory.toLocaleString()}`));
      }
      console.log('');
    } catch (error) {
      console.error(chalk.red(`❌ Failed to get stats: ${error}`));
      process.exit(1);
    }
  });

// Clear command
program
  .command('clear')
  .description('Clear all memories (irreversible!)')
  .action(async () => {
    const answers = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: 'Are you sure you want to clear all memories? This cannot be undone.',
        default: false
      }
    ]);
    
    if (!answers.confirm) {
      console.log(chalk.gray('Cancelled.'));
      return;
    }
    
    const memory = new AgentMemory();
    await memory.initialize();
    
    try {
      await memory.clear();
      console.log(chalk.green('✅ All memories cleared!'));
    } catch (error) {
      console.error(chalk.red(`❌ Failed to clear memories: ${error}`));
      process.exit(1);
    }
  });

program.parse(process.argv);
