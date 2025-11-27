/**
 * Content Format Classification and Detection Utilities
 * Task Group 1.4: Create content format classification system
 * Enhanced with validation and error handling from Task Group 4
 */

import { htmlToText, markdownToHtml } from './markdownUtils';
import {
  validateHtmlContent,
  validateContentForEditor,
  validateContentForStorage,
  recoverProblematicContent,
  ValidationResult,
  SanitizationOptions
} from './contentValidationUtils';

/**
 * Content format types
 */
export type ContentFormat = 'html' | 'plain-text' | 'markdown' | 'mixed' | 'unknown';

/**
 * Content format validation result
 */
export interface ContentFormatValidation {
  format: ContentFormat;
  confidence: number; // 0-1 scale
  issues: string[];
  isSanitized: boolean;
  validationResult?: ValidationResult;
}

/**
 * Robust HTML content detection
 * Uses multiple heuristics to accurately identify HTML content
 * Enhanced with error handling and validation
 */
export function isHtmlContent(content: string): boolean {
  try {
    if (!content || typeof content !== 'string') {
      return false;
    }

    // Check for actual HTML tags, not just angle brackets
    const htmlTagRegex = /<\/?[a-z][\s\S]*>/i;

    // Must have opening and closing tags or self-closing tags
    if (!htmlTagRegex.test(content)) {
      return false;
    }

    // Look for common HTML patterns that indicate real HTML
    const htmlPatterns = [
      /<p\b[^>]*>/i,
      /<div\b[^>]*>/i,
      /<strong\b[^>]*>/i,
      /<em\b[^>]*>/i,
      /<h[1-6]\b[^>]*>/i,
      /<ul\b[^>]*>/i,
      /<ol\b[^>]*>/i,
      /<li\b[^>]*>/i,
      /<span\b[^>]*>/i,
      /<br\s*\/?>/i
    ];

    // Must have at least one common HTML element
    return htmlPatterns.some(pattern => pattern.test(content));

  } catch (error) {
    console.error('Error detecting HTML content:', error);
    return false;
  }
}

/**
 * Detect content format using multiple heuristics
 * Enhanced with validation and error handling
 */
export function detectContentFormat(content: string): ContentFormatValidation {
  try {
    const trimmedContent = content?.trim() || '';
    const issues: string[] = [];

    if (!trimmedContent) {
      return {
        format: 'unknown',
        confidence: 0,
        issues: ['Empty content'],
        isSanitized: false
      };
    }

    // Basic validation without circular dependency
    let validationIssues: string[] = [];

    // Basic validation
    if (trimmedContent.length < 10) {
      validationIssues.push('Content is too short');
    }

    // Character encoding check
    if (/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(trimmedContent)) {
      validationIssues.push('Content contains invalid control characters');
    }

    // Check for HTML content
    if (isHtmlContent(trimmedContent)) {
      // Additional validation for HTML
      const textVersion = htmlToText(trimmedContent);
      const hasSubstantialText = textVersion.length > trimmedContent.length * 0.3;

      if (!hasSubstantialText) {
        issues.push('HTML content may have too much markup');
      }

      return {
        format: 'html',
        confidence: hasSubstantialText ? 0.9 : 0.6,
        issues: [...issues, ...validationIssues],
        isSanitized: validationIssues.length === 0,
        validationResult: {
          isValid: validationIssues.length === 0,
          errors: validationIssues,
          warnings: [],
          severity: validationIssues.length > 0 ? 'high' : 'low'
        }
      };
    }

    // Check for markdown patterns
    const markdownPatterns = [
      /^#+\s+/m,           // Headers
      /^\*+\s+/m,           // Lists
      /^-\s+/m,             // Dash lists
      /^\d+\. \s+/m,        // Numbered lists
      /\*\*.*?\*\*/,        // Bold
      /\*.*?\*/,            // Italic
      /```[\s\S]*?```/,    // Code blocks
      /`[^`]+`/,           // Inline code
      /\[.*?\]\(.*?\)/     // Links
    ];

    const markdownMatches = markdownPatterns.filter(pattern => pattern.test(trimmedContent));

    if (markdownMatches.length >= 2) {
      return {
        format: 'markdown',
        confidence: 0.8,
        issues: validationIssues,
        isSanitized: validationIssues.length === 0,
        validationResult: {
          isValid: validationIssues.length === 0,
          errors: validationIssues,
          warnings: [],
          severity: validationIssues.length > 0 ? 'medium' : 'low'
        }
      };
    }

    // Check for mixed content (plain text with HTML-like elements)
    const hasAngleBrackets = trimmedContent.includes('<') && trimmedContent.includes('>');
    const hasVariables = /\{\{[^}]+\}\}/.test(trimmedContent); // {{variable}} patterns

    if (hasAngleBrackets && !isHtmlContent(trimmedContent)) {
      return {
        format: 'plain-text',
        confidence: 0.7,
        issues: ['Contains angle brackets but not valid HTML', ...validationIssues],
        isSanitized: validationIssues.length === 0,
        validationResult: {
          isValid: validationIssues.length === 0,
          errors: validationIssues,
          warnings: [],
          severity: validationIssues.length > 0 ? 'medium' : 'low'
        }
      };
    }

    // Default to plain text
    return {
      format: 'plain-text',
      confidence: 0.8,
      issues: hasVariables ? validationIssues : ['Consider using markdown for better formatting', ...validationIssues],
      isSanitized: validationIssues.length === 0,
      validationResult: {
        isValid: validationIssues.length === 0,
        errors: validationIssues,
        warnings: [],
        severity: validationIssues.length > 0 ? 'low' : 'low'
      }
    };

  } catch (error) {
    console.error('Error detecting content format:', error);
    return {
      format: 'unknown',
      confidence: 0,
      issues: ['Content format detection failed'],
      isSanitized: false
    };
  }
}

/**
 * Convert content to HTML format for TipTapEditor
 * Handles different input formats appropriately with enhanced error handling
 */
export function convertToHtml(content: string, format?: ContentFormat, options?: SanitizationOptions): { html: string; format: ContentFormat; validationResult?: ValidationResult } {
  try {
    if (!content || typeof content !== 'string') {
      return { html: '', format: 'unknown' };
    }

    // Validate content first
    const validation = validateContentForEditor(content, format || 'unknown');

    if (!validation.isValid && validation.severity === 'critical') {
      console.warn('Content has critical validation issues, attempting recovery');
      const recoveredContent = recoverProblematicContent(content, validation);
      return convertToHtml(recoveredContent, format, options);
    }

    // Detect format if not provided
    const detectedFormat = format || detectContentFormat(content).format;

    let html = '';
    try {
      switch (detectedFormat) {
        case 'html':
          // Content is already HTML, validate and use
          const htmlValidation = validateHtmlContent(content, options);
          html = htmlValidation.sanitizedContent || content;
          break;

        case 'markdown':
          // Convert markdown to HTML with error handling
          html = markdownToHtml(content);
          break;

        case 'plain-text':
        case 'mixed':
        case 'unknown':
        default:
          // Convert plain text to HTML with proper paragraph structure
          const lines = content.split('\n').filter(line => line.trim());
          if (lines.length === 1) {
            html = `<p>${content}</p>`;
          } else {
            const htmlLines = lines.map(line => `<p>${line}</p>`).join('');
            html = htmlLines;
          }
          break;
      }
    } catch (conversionError) {
      console.error('Error converting content to HTML:', conversionError);
      // Fallback to simple paragraph wrapping
      html = `<p>${content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>`;
    }

    // Final validation of converted content
    const finalValidation = validateHtmlContent(html, options);

    return {
      html,
      format: detectedFormat,
      validationResult: finalValidation
    };

  } catch (error) {
    console.error('Fatal error in convertToHtml:', error);
    return {
      html: `<p>Content conversion failed</p>`,
      format: 'unknown'
    };
  }
}

/**
 * Validate content format compatibility with enhanced error handling
 */
export function validateContentCompatibility(content: string, expectedFormat: ContentFormat): {
  isCompatible: boolean;
  issues: string[];
  recommendation: string;
  validationResult?: ValidationResult;
} {
  try {
    const detection = detectContentFormat(content);
    const issues: string[] = [...detection.issues];

    if (detection.format === expectedFormat) {
      return {
        isCompatible: true,
        issues,
        recommendation: 'Content format matches expected format',
        validationResult: detection.validationResult
      };
    }

    if (expectedFormat === 'html' && detection.format !== 'html') {
      issues.push('Content is not in HTML format');
      return {
        isCompatible: false,
        issues,
        recommendation: 'Convert content to HTML format using convertToHtml()',
        validationResult: detection.validationResult
      };
    }

    return {
      isCompatible: detection.confidence > 0.5,
      issues,
      recommendation: `Content detected as ${detection.format} (confidence: ${detection.confidence})`,
      validationResult: detection.validationResult
    };

  } catch (error) {
    console.error('Error validating content compatibility:', error);
    return {
      isCompatible: false,
      issues: ['Validation process encountered an error'],
      recommendation: 'Content could not be validated'
    };
  }
}

/**
 * Content format classification for database storage with validation
 */
export interface ContentFormatMetadata {
  originalFormat: ContentFormat;
  storageFormat: 'html'; // Always store as HTML
  conversionNotes: string[];
  requiresMigration: boolean;
  validationResult?: ValidationResult;
}

/**
 * Analyze content for database storage with comprehensive validation
 */
export function analyzeContentForStorage(content: string): ContentFormatMetadata {
  try {
    const detection = detectContentFormat(content);
    const storageValidation = validateContentForStorage(content);
    const conversionNotes: string[] = [];

    if (detection.format !== 'html') {
      conversionNotes.push(`Converting from ${detection.format} to HTML for storage`);
    }

    if (!storageValidation.isValid) {
      conversionNotes.push(`Content has validation issues: ${storageValidation.errors.join(', ')}`);
    }

    if (storageValidation.warnings.length > 0) {
      conversionNotes.push(`Content warnings: ${storageValidation.warnings.join(', ')}`);
    }

    return {
      originalFormat: detection.format,
      storageFormat: 'html',
      conversionNotes,
      requiresMigration: detection.format !== 'html' || !storageValidation.isValid,
      validationResult: storageValidation
    };

  } catch (error) {
    console.error('Error analyzing content for storage:', error);
    return {
      originalFormat: 'unknown',
      storageFormat: 'html',
      conversionNotes: ['Analysis failed, using fallback'],
      requiresMigration: true
    };
  }
}

/**
 * Enhanced content processing for storage with comprehensive validation
 */
export function processContentForStorage(content: string): {
  processedContent: string;
  metadata: ContentFormatMetadata;
  isValid: boolean;
} {
  try {
    // Analyze content first
    const metadata = analyzeContentForStorage(content);

    // Convert to HTML if needed
    const conversion = convertToHtml(content, metadata.originalFormat, {
      removeComments: true,
      removeEmptyElements: true,
      normalizeWhitespace: true
    });

    // Validate final content
    const finalValidation = validateContentForStorage(conversion.html);

    return {
      processedContent: conversion.html,
      metadata: {
        ...metadata,
        validationResult: finalValidation
      },
      isValid: finalValidation.isValid
    };

  } catch (error) {
    console.error('Error processing content for storage:', error);

    // Fallback processing
    const fallbackContent = `<p>${String(content).replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>`;

    return {
      processedContent: fallbackContent,
      metadata: {
        originalFormat: 'unknown',
        storageFormat: 'html',
        conversionNotes: ['Processing failed, used fallback'],
        requiresMigration: true
      },
      isValid: false
    };
  }
}