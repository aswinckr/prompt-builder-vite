/**
 * Shared types for content format handling
 * Extracted to prevent circular dependencies
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
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  sanitizedContent?: string;
  detectedFormat?: ContentFormat;
  recoveryAttempts?: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Sanitization options interface
 */
export interface SanitizationOptions {
  allowHtml?: boolean;
  allowMarkdown?: boolean;
  allowedTags?: string[];
  allowedAttributes?: Record<string, string[]>;
  strictMode?: boolean;
  removeComments?: boolean;
  removeEmptyElements?: boolean;
  normalizeWhitespace?: boolean;
  preserveFormatting?: boolean;
}

/**
 * Content analysis result interface
 */
export interface ContentAnalysisResult {
  format: ContentFormat;
  confidence: number;
  hasHtml: boolean;
  hasMarkdown: boolean;
  hasVariables: boolean;
  isMixed: boolean;
  htmlTagCount: number;
  markdownPatternCount: number;
}

/**
 * Editor compatibility result
 */
export interface EditorCompatibilityResult {
  isCompatible: boolean;
  recommendedFormat: ContentFormat;
  issues: string[];
  conversionNeeded: boolean;
  preserveFormatting: boolean;
}

/**
 * Migration result interface
 */
export interface MigrationResult {
  success: boolean;
  migratedCount: number;
  failedCount: number;
  errors: string[];
  warnings: string[];
  backupPath?: string;
  timestamp: string;
}

/**
 * Backup metadata interface
 */
export interface BackupMetadata {
  version: string;
  timestamp: string;
  totalPrompts: number;
  migratedFrom: string;
  migratedTo: string;
}