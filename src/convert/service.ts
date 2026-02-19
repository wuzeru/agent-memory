/**
 * File conversion utilities for universal file format support
 * Inspired by p2r3/convert - provides conversion from various formats to text
 */

import * as fs from 'fs';
import * as path from 'path';
import { ConversionOptions, ConversionResult } from '../types';

/**
 * ConvertService - Handles conversion of various file formats to text
 */
export class ConvertService {
  private supportedFormats: Set<string>;

  constructor() {
    this.supportedFormats = new Set([
      '.txt', '.md', '.json', '.yaml', '.yml',
      '.js', '.ts', '.py', '.java', '.cpp', '.c', '.go', '.rs',
      '.html', '.css', '.xml', '.csv',
      '.pdf', '.docx'
      // Note: .xlsx removed due to security vulnerabilities in xlsx package
      // Users can add XLSX support manually if needed (see SECURITY.md)
    ]);
  }

  /**
   * Check if a file format is supported
   */
  isSupported(filePath: string): boolean {
    const ext = path.extname(filePath).toLowerCase();
    return this.supportedFormats.has(ext);
  }

  /**
   * Convert a file to text
   */
  async convertToText(filePath: string, options: ConversionOptions = {}): Promise<ConversionResult> {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const ext = path.extname(filePath).toLowerCase();
    
    if (!this.isSupported(filePath)) {
      throw new Error(`Unsupported file format: ${ext}`);
    }

    // Handle different file types
    switch (ext) {
      case '.txt':
      case '.md':
      case '.json':
      case '.yaml':
      case '.yml':
      case '.js':
      case '.ts':
      case '.py':
      case '.java':
      case '.cpp':
      case '.c':
      case '.go':
      case '.rs':
      case '.html':
      case '.css':
      case '.xml':
      case '.csv':
        return this.convertPlainText(filePath, ext);
      
      case '.pdf':
        return this.convertPDF(filePath, options);
      
      case '.docx':
        return this.convertDOCX(filePath, options);
      
      // XLSX support removed due to security vulnerabilities
      // See SECURITY.md for details and alternatives
      
      default:
        throw new Error(`Conversion not implemented for: ${ext}`);
    }
  }

  /**
   * Convert plain text files
   */
  private async convertPlainText(filePath: string, format: string): Promise<ConversionResult> {
    const content = fs.readFileSync(filePath, 'utf-8');
    const words = content.split(/\s+/).filter(w => w.length > 0);
    
    return {
      content,
      metadata: {
        originalFormat: format.slice(1),
        convertedFormat: 'text',
        wordCount: words.length
      }
    };
  }

  /**
   * Convert PDF files
   */
  private async convertPDF(filePath: string, options: ConversionOptions): Promise<ConversionResult> {
    try {
      const pdfParse = require('pdf-parse');
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      
      return {
        content: data.text,
        metadata: {
          originalFormat: 'pdf',
          convertedFormat: 'text',
          pageCount: data.numpages,
          wordCount: data.text.split(/\s+/).length
        }
      };
    } catch (error) {
      if ((error as any).code === 'MODULE_NOT_FOUND') {
        throw new Error('PDF support requires "pdf-parse" package. Install it with: npm install pdf-parse');
      }
      throw new Error(`Failed to convert PDF: ${error}`);
    }
  }

  /**
   * Convert DOCX files
   */
  private async convertDOCX(filePath: string, options: ConversionOptions): Promise<ConversionResult> {
    try {
      const mammoth = require('mammoth');
      const result = await mammoth.extractRawText({ path: filePath });
      const content = result.value;
      
      return {
        content,
        metadata: {
          originalFormat: 'docx',
          convertedFormat: 'text',
          wordCount: content.split(/\s+/).length
        }
      };
    } catch (error) {
      if ((error as any).code === 'MODULE_NOT_FOUND') {
        throw new Error('DOCX support requires "mammoth" package. Install it with: npm install mammoth');
      }
      throw new Error(`Failed to convert DOCX: ${error}`);
    }
  }

  /**
   * XLSX support has been removed due to security vulnerabilities
   * in the xlsx package (ReDoS and Prototype Pollution).
   * 
   * Alternatives:
   * 1. Convert .xlsx to .csv before ingesting
   * 2. Use CSV format instead
   * 3. Manually install xlsx package at your own risk
   * 
   * See SECURITY.md for more information.
   */

  /**
   * Get list of supported formats
   */
  getSupportedFormats(): string[] {
    return Array.from(this.supportedFormats);
  }
}
