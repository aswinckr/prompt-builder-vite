/**
 * Tests for legacy data migration scenarios
 * Task Group 5.1: Write 2-4 focused tests for migration scenarios
 */

import {
  identifyPromptsForMigration,
  migratePromptContent,
  migratePromptBatch,
  createMigrationBackup,
  validateMigrationIntegrity,
  rollbackMigration,
  generateMigrationReport,
  MigrationConfig
} from '../utils/contentMigrationUtils';
import { SavedPrompt } from '../types/SavedPrompt';

describe('Content Migration Tests', () => {
  // Sample data for testing
  const samplePrompts: SavedPrompt[] = [
    {
      user_id: 'test-user', id: '1',
      title: 'Plain Text Prompt',
      description: 'Simple plain text',
      content: 'This is a plain text prompt with {{variable}}.',
      created_at: new Date(),
      updated_at: new Date(),
      project_id: null,
      tags: []
    },
    {
      user_id: 'test-user', id: '2',
      title: 'HTML Prompt',
      description: 'Already HTML formatted',
      content: '<p>This is <strong>HTML</strong> content with {{variable}}.</p>',
      created_at: new Date(),
      updated_at: new Date(),
      project_id: null,
      tags: []
    },
    {
      user_id: 'test-user', id: '3',
      title: 'Markdown Prompt',
      description: 'Markdown formatted content',
      content: `# Title

This is **bold** and *italic* text with {{placeholder}}.

## Points to consider
- Point 1
- Point 2

Code: \`console.log('hello')\``,
      created_at: new Date(),
      updated_at: new Date(),
      project_id: null,
      tags: []
    },
    {
      user_id: 'test-user', id: '4',
      title: 'Mixed Content',
      description: 'Content with mixed formats',
      content: 'This has {{variables}} and <em>some HTML</em> but mostly plain text.',
      created_at: new Date(),
      updated_at: new Date(),
      project_id: null,
      tags: []
    },
    {
      user_id: 'test-user', id: '5',
      title: 'Empty Content',
      description: 'Empty prompt',
      content: '',
      created_at: new Date(),
      updated_at: new Date(),
      project_id: null,
      tags: []
    }
  ];

  describe('Plain Text to HTML Conversion', () => {
    test('should convert plain text prompts to HTML', () => {
      const plainTextPrompt = samplePrompts.find(p => p.id === '1')!;
      const result = migratePromptContent(plainTextPrompt);

      expect(result.success).toBe(true);
      expect(result.originalFormat).toBe('plain-text');
      expect(result.finalFormat).toBe('html');
      expect(result.migratedContent).toContain('<p>');
      expect(result.migratedContent).toContain('{{variable}}');
    });

    test('should preserve variable placeholders during conversion', () => {
      const contentWithVars = 'Use {{name}}, {{email}}, and {{phone}} in this template.';
      const prompt: SavedPrompt = {
        user_id: 'test-user', id: 'test-1',
        title: 'Variable Test',
        description: 'Test variables',
        content: contentWithVars,
        created_at: new Date(),
        updated_at: new Date(),
        project_id: null,
        tags: []
      };

      const result = migratePromptContent(prompt);

      expect(result.success).toBe(true);
      expect(result.migratedContent).toContain('{{name}}');
      expect(result.migratedContent).toContain('{{email}}');
      expect(result.migratedContent).toContain('{{phone}}');
      expect(result.migratedContent).toContain('<p>');
    });

    test('should handle multi-line plain text correctly', () => {
      const multiLineText = `First line of content.
Second line with {{var1}}.
Third line with {{var2}}.`;

      const prompt: SavedPrompt = {
        user_id: 'test-user', id: 'test-2',
        title: 'Multi-line Test',
        description: 'Multi-line content',
        content: multiLineText,
        created_at: new Date(),
        updated_at: new Date(),
        project_id: null,
        tags: []
      };

      const result = migratePromptContent(prompt);

      expect(result.success).toBe(true);
      expect(result.migratedContent).toContain('<p>First line of content.</p>');
      expect(result.migratedContent).toContain('<p>Second line');
      expect(result.migratedContent).toContain('<p>Third line');
    });
  });

  describe('Migration Rollback Functionality', () => {
    test('should create and restore from backup correctly', () => {
      // Create backup
      const backupData = createMigrationBackup(samplePrompts);
      expect(backupData).toContain('timestamp');
      expect(backupData).toContain('version');
      expect(backupData).toContain('prompts');

      // Restore from backup
      const restoredPrompts = rollbackMigration(backupData);
      expect(restoredPrompts).toHaveLength(samplePrompts.length);

      // Verify content integrity
      restoredPrompts.forEach((restored, index) => {
        const original = samplePrompts[index];
        expect(restored.id).toBe(original.id);
        expect(restored.title).toBe(original.title);
        expect(restored.content).toBe(original.content);
      });
    });

    test('should handle corrupted backup data gracefully', () => {
      const corruptedBackups = [
        'invalid json',
        '{"incomplete": "data"',
        '{"prompts": "not an array"}',
        '{"version": "1.0.0"}' // missing prompts
      ];

      corruptedBackups.forEach(backup => {
        expect(() => {
          rollbackMigration(backup);
        }).toThrow();
      });
    });

    test('should preserve migration metadata in backup', () => {
      const promptWithMetadata: SavedPrompt = {
        user_id: 'test-user', id: 'test-metadata',
        title: 'Metadata Test',
        description: 'Test',
        content: 'Test content',
        created_at: new Date('2023-01-01'),
        updated_at: new Date('2023-12-31'),
        project_id: 'project-123',
        tags: []
      };

      const backup = createMigrationBackup([promptWithMetadata]);
      const restored = rollbackMigration(backup);

      expect(restored[0].project_id).toBe('project-123');
      expect(restored[0].id).toBe('test-metadata');
    });
  });

  describe('Data Integrity After Migration', () => {
    test('should validate migration integrity successfully', () => {
      // Migrate prompts
      const migrationResults = samplePrompts.map(prompt => migratePromptContent(prompt));

      // Validate integrity
      const validation = validateMigrationIntegrity(samplePrompts, migrationResults);

      expect(validation.summary.totalChecked).toBe(samplePrompts.length);
      expect(validation.summary.passed).toBeGreaterThan(0);
      expect(validation.issues.length).toBeLessThan(samplePrompts.length); // Some might fail, but not all
    });

    test('should detect content preservation issues', () => {
      const originalPrompt: SavedPrompt = {
        user_id: 'test-user', id: 'corruption-test',
        title: 'Corruption Test',
        description: 'Test corruption detection',
        content: 'This is original content with important data.',
        created_at: new Date(),
        updated_at: new Date(),
        project_id: null,
        tags: []
      };

      // Simulate a bad migration that loses content
      const badMigrationResult = {
        user_id: 'test-user', id: 'corruption-test',
        success: true,
        originalFormat: 'plain-text',
        finalFormat: 'html',
        issues: [],
        migratedContent: '<p>Minimal content</p>' // Lost most of original content
      };

      const validation = validateMigrationIntegrity([originalPrompt], [badMigrationResult]);

      expect(validation.isValid).toBe(false);
      expect(validation.issues.some(issue => issue.includes('Content preservation issue'))).toBe(true);
    });

    test('should detect variable count mismatches', () => {
      const promptWithManyVars: SavedPrompt = {
        user_id: 'test-user', id: 'var-test',
        title: 'Variable Test',
        description: 'Test variable preservation',
        content: 'Use {{var1}}, {{var2}}, {{var3}} in this template.',
        created_at: new Date(),
        updated_at: new Date(),
        project_id: null,
        tags: []
      };

      // Simulate migration that loses a variable
      const incompleteMigrationResult = {
        user_id: 'test-user', id: 'var-test',
        success: true,
        originalFormat: 'plain-text',
        finalFormat: 'html',
        issues: [],
        migratedContent: '<p>Use {{var1}}, {{var3}} in this template.</p>' // Missing {{var2}}
      };

      const validation = validateMigrationIntegrity([promptWithManyVars], [incompleteMigrationResult]);

      expect(validation.issues.some(issue => issue.includes('Variable count mismatch'))).toBe(true);
    });
  });

  describe('Batch Migration Processing', () => {
    test('should process migrations in batches', async () => {
      const config: MigrationConfig = {
        batchSize: 2,
        maxRetries: 1,
        enableBackup: false,
        dryRun: false,
        contentValidation: true
      };

      const { results, status } = await migratePromptBatch(samplePrompts, config);

      expect(results).toHaveLength(samplePrompts.length);
      expect(status.total).toBe(samplePrompts.length);
      expect(status.migrated + status.failed).toBe(samplePrompts.length);
      expect(status.inProgress).toBe(0); // Should be 0 after completion
    });

    test('should identify prompts that need migration', () => {
      const promptsNeedingMigration = identifyPromptsForMigration(samplePrompts);

      // Should identify prompts that are not already valid HTML
      expect(promptsNeedingMigration.length).toBeGreaterThan(0);

      // Should include plain text prompt
      expect(promptsNeedingMigration.some(p => p.id === '1')).toBe(true);

      // Should include markdown prompt
      expect(promptsNeedingMigration.some(p => p.id === '3')).toBe(true);

      // Might skip already valid HTML prompt
      const htmlPrompt = promptsNeedingMigration.find(p => p.id === '2');
      if (htmlPrompt) {
        // If included, it's because of validation issues or low confidence
        expect(htmlPrompt.content).toBe('<p>This is <strong>HTML</strong> content with {{variable}}.</p>');
      }
    });

    test('should handle dry run mode correctly', async () => {
      const config: MigrationConfig = {
        batchSize: 5,
        maxRetries: 1,
        enableBackup: true,
        dryRun: true, // Dry run mode
        contentValidation: false
      };

      const { results } = await migratePromptBatch(samplePrompts, config);

      // Should still process all prompts to determine what would happen
      expect(results).toHaveLength(samplePrompts.length);

      // Results should indicate what would happen in real migration
      results.forEach(result => {
        expect(result.id).toBeDefined();
        expect(result.originalFormat).toBeDefined();
        expect(result.finalFormat).toBeDefined();
      });
    });
  });

  describe('Migration Report Generation', () => {
    test('should generate comprehensive migration report', () => {
      const migrationResults = samplePrompts.map(prompt => migratePromptContent(prompt));
      const validation = validateMigrationIntegrity(samplePrompts, migrationResults);

      const report = generateMigrationReport(migrationResults, validation);

      expect(report).toContain('# Migration Report');
      expect(report).toContain('## Summary');
      expect(report).toContain('## Original Format Breakdown');
      expect(report).toContain('## Validation Results');
      expect(report).toContain('## Issues Found');
      expect(report).toContain('## Recommendations');

      // Should include specific numbers
      expect(report).toContain('Total Prompts:');
      expect(report).toContain('Successfully Migrated:');
      expect(report).toContain('Failed:');
      expect(report).toContain('Success Rate:');
    });

    test('should handle report generation with no issues', () => {
      const perfectResults: any[] = samplePrompts.map(prompt => ({
        id: prompt.id,
        success: true,
        originalFormat: 'plain-text',
        finalFormat: 'html',
        issues: [],
        migratedContent: '<p>Perfect content</p>'
      }));

      const perfectValidation = {
        isValid: true,
        issues: [],
        summary: { totalChecked: samplePrompts.length, passed: samplePrompts.length, failed: 0 }
      };

      const report = generateMigrationReport(perfectResults, perfectValidation);

      expect(report).toContain('No issues detected');
      expect(report).toContain('✅ Yes'); // Overall valid indicator
    });
  });
});