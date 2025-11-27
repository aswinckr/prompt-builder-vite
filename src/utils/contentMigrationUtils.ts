/**
 * Legacy Data Migration Utilities
 * Task Group 5: Legacy Data Migration
 */

import { SavedPrompt } from '../types/SavedPrompt';
import { convertToHtml, detectContentFormat, analyzeContentForStorage, processContentForStorage } from './contentFormatUtils';
import { validateContentForStorage } from './contentValidationUtils';

/**
 * Backup prompt data structure (from JSON backup)
 */
interface BackupPrompt {
  id: string;
  user_id?: string;
  title: string;
  description?: string;
  content: string;
  backupMetadata?: {
    userId?: string;
    createdAt?: string | Date;
    updatedAt?: string | Date;
    projectId?: string;
  };
}

/**
 * Migration status tracking
 */
export interface MigrationStatus {
  total: number;
  migrated: number;
  failed: number;
  skipped: number;
  inProgress: number;
}

/**
 * Migration result for individual prompt
 */
export interface MigrationResult {
  id: string;
  success: boolean;
  originalFormat: string;
  finalFormat: string;
  issues: string[];
  migratedContent?: string;
  error?: string;
}

/**
 * Migration batch configuration
 */
export interface MigrationConfig {
  batchSize: number;
  maxRetries: number;
  enableBackup: boolean;
  dryRun: boolean;
  contentValidation: boolean;
}

/**
 * Identify prompts that need migration
 */
export function identifyPromptsForMigration(prompts: SavedPrompt[]): SavedPrompt[] {
  return prompts.filter(prompt => {
    if (!prompt.content) return false;

    const analysis = analyzeContentForStorage(prompt.content);
    const detection = detectContentFormat(prompt.content);

    // Needs migration if:
    // 1. Not in HTML format
    // 2. Has validation issues
    // 3. Low confidence detection
    return (
      analysis.requiresMigration ||
      detection.format !== 'html' ||
      detection.confidence < 0.7 ||
      !analysis.validationResult?.isValid
    );
  });
}

/**
 * Migrate a single prompt content
 */
export function migratePromptContent(prompt: SavedPrompt, config: MigrationConfig = {
  batchSize: 10,
  maxRetries: 3,
  enableBackup: true,
  dryRun: false,
  contentValidation: true
}): MigrationResult {
  try {
    if (!prompt.content) {
      return {
        id: prompt.id,
        success: false,
        originalFormat: 'empty',
        finalFormat: 'empty',
        issues: ['Empty content'],
        error: 'No content to migrate'
      };
    }

    const originalDetection = detectContentFormat(prompt.content);
    const originalAnalysis = analyzeContentForStorage(prompt.content);

    // If content is already valid HTML, skip migration
    if (originalDetection.format === 'html' &&
        originalDetection.confidence > 0.8 &&
        !originalAnalysis.requiresMigration) {
      return {
        id: prompt.id,
        success: true,
        originalFormat: originalDetection.format,
        finalFormat: originalDetection.format,
        issues: ['Content already in correct format'],
        migratedContent: prompt.content
      };
    }

    // Process content for storage
    const processing = processContentForStorage(prompt.content);

    // Validate the processed content
    const validation = validateContentForStorage(processing.processedContent);

    if (!validation.isValid && config.contentValidation) {
      return {
        id: prompt.id,
        success: false,
        originalFormat: originalDetection.format,
        finalFormat: 'html',
        issues: ['Content validation failed', ...validation.errors],
        error: `Validation errors: ${validation.errors.join(', ')}`
      };
    }

    return {
      id: prompt.id,
      success: true,
      originalFormat: originalDetection.format,
      finalFormat: 'html',
      issues: processing.metadata.conversionNotes,
      migratedContent: processing.processedContent
    };

  } catch (error) {
    return {
      id: prompt.id,
      success: false,
      originalFormat: 'unknown',
      finalFormat: 'unknown',
      issues: ['Migration failed'],
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Migrate a batch of prompts
 */
export async function migratePromptBatch(
  prompts: SavedPrompt[],
  config: MigrationConfig = {
    batchSize: 10,
    maxRetries: 3,
    enableBackup: true,
    dryRun: false,
    contentValidation: true
  }
): Promise<{
    results: MigrationResult[];
    status: MigrationStatus;
  }> {
  const results: MigrationResult[] = [];
  const status: MigrationStatus = {
    total: prompts.length,
    migrated: 0,
    failed: 0,
    skipped: 0,
    inProgress: 0
  };

  // Process in batches
  for (let i = 0; i < prompts.length; i += config.batchSize) {
    const batch = prompts.slice(i, i + config.batchSize);

    for (const prompt of batch) {
      status.inProgress++;

      try {
        const result = migratePromptContent(prompt, config);
        results.push(result);

        if (result.success) {
          status.migrated++;
        } else {
          status.failed++;
        }
      } catch (error) {
        results.push({
          id: prompt.id,
          success: false,
          originalFormat: 'unknown',
          finalFormat: 'unknown',
          issues: ['Batch processing failed'],
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        status.failed++;
      }

      status.inProgress--;
    }

    // Small delay between batches to prevent overwhelming
    if (i + config.batchSize < prompts.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  return { results, status };
}

/**
 * Create backup of prompt data before migration
 */
export function createMigrationBackup(prompts: SavedPrompt[]): string {
  const backupData = {
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    prompts: prompts.map(prompt => ({
      id: prompt.id,
      title: prompt.title,
      description: prompt.description,
      content: prompt.content,
      originalFormat: detectContentFormat(prompt.content || '').format,
      backupMetadata: {
        createdAt: prompt.created_at,
        updatedAt: prompt.updated_at,
        projectId: prompt.project_id
      }
    }))
  };

  return JSON.stringify(backupData, null, 2);
}

/**
 * Validate migration integrity
 */
export function validateMigrationIntegrity(
  originalPrompts: SavedPrompt[],
  migrationResults: MigrationResult[]
): {
  isValid: boolean;
  issues: string[];
  summary: {
    totalChecked: number;
    passed: number;
    failed: number;
  };
} {
  const issues: string[] = [];
  let passed = 0;
  let failed = 0;

  for (const original of originalPrompts) {
    const result = migrationResults.find(r => r.id === original.id);

    if (!result) {
      issues.push(`No migration result found for prompt ${original.id}`);
      failed++;
      continue;
    }

    // Check content integrity
    if (result.success && result.migratedContent) {
      const originalText = (original.content || '').replace(/<[^>]*>/g, '').trim();
      const migratedText = result.migratedContent.replace(/<[^>]*>/g, '').trim();

      // Check that key content is preserved (allowing for HTML formatting differences)
      const originalWords = originalText.split(/\s+/).filter(word => word.length > 0);
      const migratedWords = migratedText.split(/\s+/).filter(word => word.length > 0);

      // Should preserve at least 80% of words (allowing for some formatting differences)
      const preservationRatio = Math.min(originalWords.length, migratedWords.length) / Math.max(originalWords.length, migratedWords.length);

      if (preservationRatio < 0.8) {
        issues.push(`Content preservation issue for prompt ${original.id}: ${Math.round(preservationRatio * 100)}% preserved`);
        failed++;
      } else {
        passed++;
      }

      // Check that variables are preserved
      const originalVars = (original.content || '').match(/\{\{[^}]+\}\}/g) || [];
      const migratedVars = result.migratedContent.match(/\{\{[^}]+\}\}/g) || [];

      if (originalVars.length !== migratedVars.length) {
        issues.push(`Variable count mismatch for prompt ${original.id}: ${originalVars.length} -> ${migratedVars.length}`);
      }
    } else if (!result.success) {
      issues.push(`Migration failed for prompt ${original.id}: ${result.error}`);
      failed++;
    }
  }

  return {
    isValid: issues.length === 0,
    issues,
    summary: {
      totalChecked: originalPrompts.length,
      passed,
      failed
    }
  };
}

/**
 * Rollback migration from backup
 */
export function rollbackMigration(backupData: string): SavedPrompt[] {
  try {
    const backup = JSON.parse(backupData);

    if (!backup.prompts || !Array.isArray(backup.prompts)) {
      throw new Error('Invalid backup format');
    }

    return backup.prompts.map((prompt: BackupPrompt) => ({
      id: prompt.id,
      user_id: prompt.backupMetadata?.userId || prompt.user_id || 'unknown',
      title: prompt.title,
      description: prompt.description,
      content: prompt.content,
      created_at: prompt.backupMetadata?.createdAt || new Date(),
      updated_at: prompt.backupMetadata?.updatedAt || new Date(),
      project_id: prompt.backupMetadata?.projectId || null,
      tags: []
    } as SavedPrompt));

  } catch (error) {
    throw new Error(`Failed to rollback migration: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate migration report
 */
export function generateMigrationReport(
  migrationResults: MigrationResult[],
  validation: ReturnType<typeof validateMigrationIntegrity>
): string {
  const successful = migrationResults.filter(r => r.success).length;
  const failed = migrationResults.filter(r => !r.success).length;
  const formatBreakdown = migrationResults.reduce((acc, result) => {
    acc[result.originalFormat] = (acc[result.originalFormat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const report = `# Migration Report

## Summary
- **Total Prompts**: ${migrationResults.length}
- **Successfully Migrated**: ${successful}
- **Failed**: ${failed}
- **Success Rate**: ${Math.round((successful / migrationResults.length) * 100)}%

## Original Format Breakdown
${Object.entries(formatBreakdown)
  .map(([format, count]) => `- ${format}: ${count}`)
  .join('\n')}

## Validation Results
- **Total Checked**: ${validation.summary.totalChecked}
- **Passed Validation**: ${validation.summary.passed}
- **Failed Validation**: ${validation.summary.failed}
- **Overall Valid**: validation.isValid ? '✅ Yes' : '❌ No'}

## Issues Found
${validation.issues.length > 0 ? validation.issues.map(issue => `- ${issue}`).join('\n') : 'No issues detected'}

## Recommendations
${failed > 0
  ? 'Review failed migrations and consider manual intervention for problematic content.'
  : 'All migrations completed successfully.'}

${
  !validation.isValid
    ? 'Content integrity issues detected. Review the specific issues above.'
    : 'Content integrity maintained through migration.'
}
`;

  return report;
}