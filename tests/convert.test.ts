/**
 * Unit tests for ConvertService
 */

import * as fs from 'fs';
import * as path from 'path';
import { ConvertService } from '../src/convert/service';

describe('ConvertService', () => {
  let convertService: ConvertService;
  const testDir = '/tmp/agent-memory-test';

  beforeAll(() => {
    convertService = new ConvertService();
    
    // Create test directory
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
  });

  afterAll(() => {
    // Clean up test directory
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true });
    }
  });

  describe('isSupported', () => {
    it('should support text files', () => {
      expect(convertService.isSupported('test.txt')).toBe(true);
      expect(convertService.isSupported('test.md')).toBe(true);
    });

    it('should support code files', () => {
      expect(convertService.isSupported('test.ts')).toBe(true);
      expect(convertService.isSupported('test.js')).toBe(true);
      expect(convertService.isSupported('test.py')).toBe(true);
    });

    it('should support document files', () => {
      expect(convertService.isSupported('test.pdf')).toBe(true);
      expect(convertService.isSupported('test.docx')).toBe(true);
      // xlsx removed due to security vulnerabilities
      expect(convertService.isSupported('test.xlsx')).toBe(false);
    });

    it('should not support unknown formats', () => {
      expect(convertService.isSupported('test.xyz')).toBe(false);
    });
  });

  describe('convertToText', () => {
    it('should convert plain text file', async () => {
      const testFile = path.join(testDir, 'test.txt');
      const content = 'Hello World\nThis is a test file.';
      fs.writeFileSync(testFile, content);

      const result = await convertService.convertToText(testFile);

      expect(result.content).toBe(content);
      expect(result.metadata.originalFormat).toBe('txt');
      expect(result.metadata.convertedFormat).toBe('text');
      expect(result.metadata.wordCount).toBeGreaterThan(0);
    });

    it('should convert markdown file', async () => {
      const testFile = path.join(testDir, 'test.md');
      const content = '# Header\n\nThis is **bold** text.';
      fs.writeFileSync(testFile, content);

      const result = await convertService.convertToText(testFile);

      expect(result.content).toBe(content);
      expect(result.metadata.originalFormat).toBe('md');
    });

    it('should throw error for non-existent file', async () => {
      await expect(
        convertService.convertToText('/non/existent/file.txt')
      ).rejects.toThrow('File not found');
    });

    it('should throw error for unsupported format', async () => {
      const testFile = path.join(testDir, 'test.xyz');
      fs.writeFileSync(testFile, 'content');

      await expect(
        convertService.convertToText(testFile)
      ).rejects.toThrow('Unsupported file format');
    });
  });

  describe('getSupportedFormats', () => {
    it('should return array of supported formats', () => {
      const formats = convertService.getSupportedFormats();
      
      expect(Array.isArray(formats)).toBe(true);
      expect(formats.length).toBeGreaterThan(0);
      expect(formats).toContain('.txt');
      expect(formats).toContain('.md');
      expect(formats).toContain('.js');
    });
  });
});
