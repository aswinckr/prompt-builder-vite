/**
 * Enhanced Content Validation and Error Handling Utilities
 * Task Group 4: Enhanced Validation and Error Handling
 */

import { sanitizeHtml } from './markdownUtils';
import { detectContentFormat, ContentFormat } from './contentFormatUtils';

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  sanitizedContent?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Content sanitization options
 */
export interface SanitizationOptions {
  removeComments?: boolean;
  removeEmptyElements?: boolean;
  normalizeWhitespace?: boolean;
  preserveFormatting?: boolean;
  allowedTags?: string[];
}

/**
 * Enhanced content validation rules
 */
export interface ValidationRule {
  name: string;
  validator: (content: string) => ValidationResult;
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
}

/**
 * Comprehensive HTML content validator with security checks
 */
export function validateHtmlContent(content: string, options?: SanitizationOptions): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';

  if (!content || typeof content !== 'string') {
    return {
      isValid: false,
      errors: ['Content must be a non-empty string'],
      warnings: [],
      severity: 'critical'
    };
  }

  try {
    // Basic content checks
    if (content.trim().length === 0) {
      errors.push('Content cannot be empty');
      severity = 'high';
    }

    // Security checks
    const dangerousPatterns = [
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<script[^>]*>/gi,
      /<iframe[^>]*>/gi,
      /<object[^>]*>/gi,
      /<embed[^>]*>/gi,
      /vbscript:/gi,
      /data:text\/html/gi
    ];

    dangerousPatterns.forEach(pattern => {
      if (pattern.test(content)) {
        errors.push('Content contains potentially dangerous elements');
        severity = 'critical';
      }
    });

    // HTML structure validation
    const tagCount = (content.match(/<[^>]+>/g) || []).length;
    if (tagCount > 0) {
      // Check for balanced tags
      const openTags = (content.match(/<([a-zA-Z][a-zA-Z0-9]*)[^>]*>/g) || [])
        .map(tag => tag.match(/<([a-zA-Z][a-zA-Z0-9]*)/)?.[1])
        .filter(Boolean);

      const closeTags = (content.match(/<\/([a-zA-Z][a-zA-Z0-9]*)>/g) || [])
        .map(tag => tag.match(/<\/([a-zA-Z][a-zA-Z0-9]*)/)?.[1])
        .filter(Boolean);

      const selfClosingTags = ['br', 'hr', 'img', 'input', 'meta', 'link'];
      const openNonSelfClosing = openTags.filter(tag => !selfClosingTags.includes(tag?.toLowerCase() || ''));

      if (openNonSelfClosing.length !== closeTags.length) {
        warnings.push('HTML tags may not be properly balanced');
        if (severity !== 'critical') severity = 'medium';
      }
    }

    // Content quality checks
    const textOnly = content.replace(/<[^>]*>/g, '');
    if (textOnly.trim().length < 10 && tagCount > 0) {
      warnings.push('Content has extensive markup but little actual text');
      severity = severity === 'low' ? 'low' : 'medium';
    }

    // Variable placeholder validation
    const variablePattern = /\{\{[^}]+\}\}/g;
    const variables = content.match(variablePattern) || [];
    if (variables.length > 20) {
      warnings.push(`High number of variables (${variables.length}). Consider reducing complexity.`);
      severity = severity === 'low' ? 'low' : 'medium';
    }

    // Validate variable syntax
    variables.forEach(variable => {
      if (!/^\{\{[a-zA-Z_][a-zA-Z0-9_]*\}\}$/.test(variable)) {
        errors.push(`Invalid variable syntax: ${variable}`);
        if (severity !== 'critical') severity = 'high';
      }
    });

    // Sanitize content if needed
    let sanitizedContent: string | undefined;
    if (errors.length > 0 || warnings.length > 0) {
      sanitizedContent = sanitizeHtmlForValidation(content, options);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      sanitizedContent,
      severity
    };

  } catch (error) {
    console.error('Error validating HTML content:', error);
    return {
      isValid: false,
      errors: ['Validation process encountered an error'],
      warnings: [],
      severity: 'critical'
    };
  }
}

/**
 * Client-side content validation for immediate feedback
 */
export function validateContentForEditor(content: string, format: ContentFormat): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';

  if (!content || typeof content !== 'string') {
    return {
      isValid: false,
      errors: ['Content must be a non-empty string'],
      warnings: [],
      severity: 'critical'
    };
  }

  try {
    // Format-specific validation
    const formatDetection = detectContentFormat(content);
    if (formatDetection.format !== format && formatDetection.confidence > 0.8) {
      warnings.push(`Content appears to be ${formatDetection.format} but expected ${format}`);
      severity = 'low';
    }

    // Length validation
    if (content.length > 50000) {
      warnings.push('Content is very long and may impact performance');
      severity = 'medium';
    }

    if (content.length < 10) {
      errors.push('Content is too short');
      severity = 'high';
    }

    // Character encoding checks
    if (/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(content)) {
      errors.push('Content contains invalid control characters');
      severity = 'high';
    }

    // Markdown-specific validation
    if (format === 'markdown') {
      const lines = content.split('\n');
      let consecutiveEmptyLines = 0;
      let maxConsecutiveEmpty = 0;

      lines.forEach(line => {
        if (line.trim() === '') {
          consecutiveEmptyLines++;
          maxConsecutiveEmpty = Math.max(maxConsecutiveEmpty, consecutiveEmptyLines);
        } else {
          consecutiveEmptyLines = 0;
        }
      });

      if (maxConsecutiveEmpty > 5) {
        warnings.push('Excessive empty lines detected');
        severity = 'low';
      }
    }

    // HTML-specific validation
    if (format === 'html') {
      const validation = validateHtmlContent(content);
      errors.push(...validation.errors);
      warnings.push(...validation.warnings);
      severity = getHigherSeverity(severity, validation.severity);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      severity
    };

  } catch (error) {
    console.error('Error validating content for editor:', error);
    return {
      isValid: false,
      errors: ['Editor validation encountered an error'],
      warnings: [],
      severity: 'critical'
    };
  }
}

/**
 * Server-side content validation with comprehensive security checks
 */
export function validateContentForStorage(content: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';

  try {
    // Basic input validation
    if (!content || typeof content !== 'string') {
      return {
        isValid: false,
        errors: ['Invalid content type'],
        warnings: [],
        severity: 'critical'
      };
    }

    // Size limits
    if (content.length > 100000) {
      errors.push('Content exceeds maximum allowed size');
      severity = 'critical';
    }

    if (content.length < 5) {
      errors.push('Content is too short to be useful');
      severity = 'high';
    }

    // Security validation
    const htmlValidation = validateHtmlContent(content, {
      removeComments: true,
      removeEmptyElements: true,
      normalizeWhitespace: true
    });

    errors.push(...htmlValidation.errors);
    warnings.push(...htmlValidation.warnings);
    severity = getHigherSeverity(severity, htmlValidation.severity);

    // Business logic validation
    const formatDetection = detectContentFormat(content);
    if (formatDetection.confidence < 0.3) {
      warnings.push('Content format could not be reliably detected');
      severity = getHigherSeverity(severity, 'medium');
    }

    // Check for required elements (e.g., at least some text content)
    const textContent = content.replace(/<[^>]*>/g, '');
    if (textContent.trim().length === 0) {
      errors.push('Content must contain some text');
      severity = 'high';
    }

    // Check for excessive repetition (possible spam/abuse)
    const words = textContent.split(/\s+/);
    const uniqueWords = new Set(words.map(w => w.toLowerCase()));
    if (words.length > 10 && uniqueWords.size / words.length < 0.3) {
      warnings.push('Content has low word diversity');
      severity = getHigherSeverity(severity, 'low');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      sanitizedContent: htmlValidation.sanitizedContent,
      severity
    };

  } catch (error) {
    console.error('Error validating content for storage:', error);
    return {
      isValid: false,
      errors: ['Storage validation encountered an error'],
      warnings: [],
      severity: 'critical'
    };
  }
}

/**
 * Enhanced sanitization for validation purposes
 */
function sanitizeHtmlForValidation(content: string, options?: SanitizationOptions): string {
  try {
    const sanitizationOptions = {
      removeComments: options?.removeComments ?? true,
      removeEmptyElements: options?.removeEmptyElements ?? true,
      normalizeWhitespace: options?.normalizeWhitespace ?? true,
      preserveFormatting: options?.preserveFormatting ?? true
    };

    let sanitized = sanitizeHtml(content);

    if (sanitizationOptions.removeComments) {
      sanitized = sanitized.replace(/<!--[\s\S]*?-->/g, '');
    }

    if (sanitizationOptions.removeEmptyElements) {
      sanitized = sanitized.replace(/<[^>]*>\s*<\/[^>]*>/g, '');
    }

    if (sanitizationOptions.normalizeWhitespace) {
      sanitized = sanitized.replace(/\s+/g, ' ').trim();
    }

    return sanitized;

  } catch (error) {
    console.error('Error sanitizing HTML for validation:', error);
    return content; // Return original if sanitization fails
  }
}

/**
 * Utility to get the higher severity level
 */
function getHigherSeverity(
  current: 'low' | 'medium' | 'high' | 'critical',
  newSeverity: 'low' | 'medium' | 'high' | 'critical'
): 'low' | 'medium' | 'high' | 'critical' {
  const severityOrder = { low: 0, medium: 1, high: 2, critical: 3 };
  return severityOrder[newSeverity] > severityOrder[current] ? newSeverity : current;
}

/**
 * Recovery mechanisms for problematic content
 */
export function recoverProblematicContent(content: string, validation: ValidationResult): string {
  if (validation.isValid) {
    return content;
  }

  try {
    let recovered = content;

    // If we have sanitized content, use it
    if (validation.sanitizedContent) {
      recovered = validation.sanitizedContent;
    }

    // Handle critical errors with fallbacks
    if (validation.severity === 'critical') {
      // Strip all HTML as a last resort
      recovered = recovered.replace(/<[^>]*>/g, '');

      // Wrap in basic paragraph if empty
      if (recovered.trim().length === 0) {
        recovered = '<p>Content could not be processed</p>';
      } else {
        recovered = `<p>${recovered}</p>`;
      }
    }

    // Remove invalid characters
    recovered = recovered.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

    return recovered;

  } catch (error) {
    console.error('Error recovering problematic content:', error);
    return '<p>Content recovery failed</p>';
  }
}

/**
 * User-friendly error messages
 */
export function getValidationErrorMessage(validation: ValidationResult): string[] {
  const messages: string[] = [];

  if (validation.errors.length > 0) {
    messages.push('Errors that must be fixed:');
    validation.errors.forEach(error => {
      messages.push(`• ${error}`);
    });
  }

  if (validation.warnings.length > 0) {
    messages.push('\nWarnings that should be reviewed:');
    validation.warnings.forEach(warning => {
      messages.push(`• ${warning}`);
    });
  }

  return messages;
}