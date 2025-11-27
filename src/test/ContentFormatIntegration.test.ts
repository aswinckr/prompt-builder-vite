/**
 * Strategic Integration Tests for Content Format Handling
 * Task Group 6.3: Write up to 8 additional strategic tests for critical coverage gaps
 * Focus: End-to-end workflows and integration points
 */

import {
  isHtmlContent,
  detectContentFormat,
  convertToHtml,
  validateContentCompatibility,
  processContentForStorage,
  analyzeContentForStorage
} from '../utils/contentFormatUtils';
import { htmlToMarkdown, markdownToHtml, htmlToText } from '../utils/markdownUtils';
import { validateContentForStorage, validateContentForEditor } from '../utils/contentValidationUtils';
import {
  identifyPromptsForMigration,
  migratePromptContent,
  validateMigrationIntegrity
} from '../utils/contentMigrationUtils';
import { SavedPrompt } from '../types/SavedPrompt';

describe('Content Format Integration Tests', () => {
  describe('Complete CRUD Workflow Integration', () => {
    test('should maintain content integrity through full create-read-update-delete cycle', () => {
      // Create: User inputs markdown content
      const userInput = `# Customer Support Response Template

Dear {{customer_name}},

Thank you for contacting us about {{issue_topic}}.

## Resolution Steps
1. Acknowledge the concern
2. Provide solution for {{specific_problem}}
3. Offer additional assistance

Best regards,
{{support_agent_name}}`;

      // Process for storage (Create operation)
      const createResult = convertToHtml(userInput);
      expect(createResult.format).toBe('markdown');
      expect(createResult.html).toContain('<h1>');
      expect(createResult.html).toContain('<h2>');
      expect(createResult.html).toContain('<ol>');
      expect(createResult.html).toContain('{{customer_name}}');

      // Read: Retrieve and validate for editor
      const readValidation = validateContentForEditor(createResult.html, 'html');
      expect(readValidation.isValid).toBe(true);

      // Update: Simulate editor modifications
      const editorModifiedContent = createResult.html
        .replace('Customer Support Response', 'Technical Support Response')
        .replace('Best regards', 'Sincerely');

      const updateValidation = validateContentCompatibility(editorModifiedContent, 'html');
      expect(updateValidation.isCompatible).toBe(true);

      // Read again: Verify content remains valid
      const finalValidation = validateContentForStorage(editorModifiedContent);
      expect(finalValidation.isValid).toBe(true);

      // Verify key content preserved throughout cycle
      const finalText = htmlToText(editorModifiedContent);
      expect(finalText).toContain('Dear {{customer_name}}');
      expect(finalText).toContain('{{issue_topic}}');
      expect(finalText).toContain('{{support_agent_name}}');
      expect(finalText).toContain('Technical Support Response');
    });

    test('should handle complex variable placeholders in all formats', () => {
      const complexContent = `# Complex Variable Template

User: {{user.name}} ({{user.email}})
Order: {{order.id}} - {{order.amount}}
Date: {{date.format('YYYY-MM-DD')}}

{% if user.premium %}
  Premium content for {{user.name}}
{% endif %}

Context: {{context.get('ticket_details')}}`;

      // Test detection
      const detection = detectContentFormat(complexContent);
      expect(detection.format).toBe('markdown');

      // Test conversion
      const conversion = convertToHtml(complexContent);
      expect(conversion.html).toContain('{{user.name}}');
      expect(conversion.html).toContain('{{user.email}}');
      expect(conversion.html).toContain('{{order.id}}');
      expect(conversion.html).toContain('{{date.format');
      expect(conversion.html).toContain('{% if user.premium %}');

      // Test preservation through round-trip
      const backToMarkdown = htmlToMarkdown(conversion.html);
      expect(backToMarkdown).toContain('{{user.name}}');
      expect(backToMarkdown).toContain('{{user.email}}');
    });

    test('should handle edge case content formats gracefully', () => {
      const edgeCases = [
        // Empty or minimal content
        '',
        '   ',
        '{{just_variables}}',

        // Content with special characters
        'Use < > <= >= symbols in math: 5 < 10 > 2',
        'JSON: {"key": "value", "nested": {"item": "{{variable}}"}}',
        'Email: user@domain.com',

        // Mixed formatting edge cases
        '# Mixed **bold** and <em>HTML</em> content',
        'Text with {{var}} and <script>alert("xss")</script> malicious content',

        // Very long content
        'A'.repeat(10000) + ' with {{variable}} at end'
      ];

      edgeCases.forEach((content, index) => {
        expect(() => {
          const detection = detectContentFormat(content);
          const conversion = convertToHtml(content);
          const validation = validateContentForStorage(conversion.html);

          expect(detection).toBeDefined();
          expect(conversion.html).toBeDefined();
          expect(validation).toBeDefined();
        }).not.toThrow();
      });
    });
  });

  describe('TipTapEditor Integration', () => {
    test('should prepare content correctly for TipTapEditor initialization', () => {
      const testContents = [
        // HTML content
        '<p><strong>Bold</strong> text with {{variable}}</p>',

        // Markdown content (should be converted)
        '# Title\n\n**Bold** text with {{placeholder}}',

        // Plain text content
        'Simple text with {{simple_var}}',

        // Complex mixed content
        `# Complex Content

This has **formatting** and {{variables}}.

- List item 1 with {{item1_var}}
- List item 2 with <em>HTML</em> formatting

Code: \`console.log('{{debug_var}}')\``
      ];

      testContents.forEach((content, index) => {
        // Process content for editor (Read operation)
        const processed = convertToHtml(content);
        const editorValidation = validateContentForEditor(processed.html, 'html');

        expect(editorValidation.isValid).toBe(true);
        expect(processed.html).toContain('{{'); // Variables should be preserved

        // Simulate editor update
        const editorOutput = processed.html.replace('{{variable}}', '{{edited_variable}}');
        const updateValidation = validateContentCompatibility(editorOutput, 'html');

        expect(updateValidation.isCompatible).toBe(true);
      });
    });

    test('should handle editor output validation and sanitization', () => {
      // Simulate TipTapEditor output (potentially containing user modifications)
      const editorOutputs = [
        // Clean editor output
        '<p>Clean content with {{variable}}</p>',

        // Editor output with formatting
        '<h2>Modified Title</h2><p>Content with <strong>bold</strong> and {{user_var}}</p>',

        // Editor output with potential issues
        '<p>Content with <span onclick="alert(\'xss\')">dangerous</span> formatting</p>',

        // Malformed HTML from editor
        '<p>Unclosed paragraph with {{variable}}',

        // Empty content
        '',
        '<p></p>'
      ];

      editorOutputs.forEach((output, index) => {
        const validation = validateContentForStorage(output);

        expect(validation).toBeDefined();
        expect(typeof validation.isValid).toBe('boolean');
        expect(Array.isArray(validation.errors)).toBe(true);
        expect(Array.isArray(validation.warnings)).toBe(true);

        // Should not crash on any editor output
        expect(() => {
          const detection = detectContentFormat(output);
          const compatibility = validateContentCompatibility(output, 'html');
        }).not.toThrow();
      });
    });
  });

  describe('Migration Workflow Integration', () => {
    test('should handle complete migration workflow with integrity validation', () => {
      // Create sample prompts representing various legacy formats
      const legacyPrompts: SavedPrompt[] = [
        {
          id: 'legacy-1',
          user_id: 'test-user',
          title: 'Plain Text Legacy',
          description: 'Old plain text prompt',
          content: 'This is old plain text content with {{placeholder}}.',
          created_at: new Date('2023-01-01'),
          updated_at: new Date('2023-01-01'),
          project_id: null,
          tags: []
        },
        {
          id: 'legacy-2',
          user_id: 'test-user',
          title: 'Malformed HTML Legacy',
          description: 'Old malformed HTML',
          content: '<div>Malformed content with <strong>bold</strong> and {{variable}}</div>',
          created_at: new Date('2023-02-01'),
          updated_at: new Date('2023-02-01'),
          project_id: null,
          tags: []
        },
        {
          id: 'legacy-3',
          user_id: 'test-user',
          title: 'Already Valid HTML',
          description: 'Already correct format',
          content: '<p>Already valid <em>HTML</em> content with {{valid_var}}.</p>',
          created_at: new Date('2023-03-01'),
          updated_at: new Date('2023-03-01'),
          project_id: null,
          tags: []
        },
        {
          id: 'legacy-4',
          user_id: 'test-user',
          title: 'Complex Mixed Content',
          description: 'Mixed format content',
          content: `# Title
Paragraph with **markdown** and {{var1}}.
<span class="custom">HTML content</span> with {{var2}}.`,
          created_at: new Date('2023-04-01'),
          updated_at: new Date('2023-04-01'),
          project_id: null,
          tags: []
        }
      ];

      // Step 1: Identify prompts needing migration
      const promptsNeedingMigration = identifyPromptsForMigration(legacyPrompts);
      expect(promptsNeedingMigration.length).toBeGreaterThan(0);
      expect(promptsNeedingMigration.length).toBeLessThanOrEqual(legacyPrompts.length);

      // Step 2: Migrate identified prompts
      const migrationResults = promptsNeedingMigration.map(prompt =>
        migratePromptContent(prompt)
      );

      // Step 3: Validate migration integrity
      const integrityValidation = validateMigrationIntegrity(
        promptsNeedingMigration,
        migrationResults
      );

      expect(integrityValidation.summary.totalChecked).toBe(promptsNeedingMigration.length);
      expect(integrityValidation.issues.length).toBeLessThan(promptsNeedingMigration.length);

      // Step 4: Verify migrated content quality
      migrationResults.forEach(result => {
        if (result.success) {
          expect(result.migratedContent).toBeDefined();
          expect(result.migratedContent).toContain('<'); // Should be HTML
          expect(result.migratedContent).toContain('{{'); // Variables preserved

          const finalValidation = validateContentForStorage(result.migratedContent!);
          expect(finalValidation.isValid).toBe(true);
        }
      });
    });

    test('should handle migration error recovery and rollback scenarios', () => {
      // Create prompts that will cause various migration issues
      const problematicPrompts: SavedPrompt[] = [
        {
          id: 'problem-1',
          user_id: 'test-user',
          title: 'Empty Content',
          description: 'No content to migrate',
          content: '',
          created_at: new Date(),
          updated_at: new Date(),
          project_id: null,
          tags: []
        },
        {
          id: 'problem-2',
          user_id: 'test-user',
          title: 'Very Long Content',
          description: 'Extremely long content',
          content: 'A'.repeat(100000) + ' with {{end_variable}}',
          created_at: new Date(),
          updated_at: new Date(),
          project_id: null,
          tags: []
        },
        {
          id: 'problem-3',
          user_id: 'test-user',
          title: 'Null Content',
          description: 'Null content handling',
          content: null as any,
          created_at: new Date(),
          updated_at: new Date(),
          project_id: null,
          tags: []
        }
      ];

      // All problematic prompts should be handled gracefully
      const migrationResults = problematicPrompts.map(prompt =>
        migratePromptContent(prompt)
      );

      migrationResults.forEach((result, index) => {
        expect(result).toBeDefined();
        expect(result.id).toBe(problematicPrompts[index].id);
        expect(typeof result.success).toBe('boolean');

        // Should always provide some kind of result or error
        expect(result.issues).toBeDefined();
        expect(Array.isArray(result.issues)).toBe(true);

        // Should not crash
        expect(() => {
          const detection = detectContentFormat(result.migratedContent || '');
        }).not.toThrow();
      });
    });
  });

  describe('Performance and Stress Testing', () => {
    test('should handle high-volume content processing efficiently', () => {
      // Generate large dataset of content
      const largeDataset = Array.from({ length: 100 }, (_, index) => ({
        id: `stress-test-${index}`,
        content: `# Test Prompt ${index}

This is test content for prompt number {{prompt_number}}.

## Features
- Feature 1 for {{feature_name}}
- Feature 2 with {{additional_var}}
- Feature 3 containing <strong>HTML formatting</strong>

Content with **markdown formatting** and ${'more text. '.repeat(50)} End of content {{end_var}}.`
      }));

      // Process all content efficiently
      const startTime = Date.now();
      const results = largeDataset.map(item => ({
        id: item.id,
        detection: detectContentFormat(item.content),
        conversion: convertToHtml(item.content),
        validation: validateContentForStorage(convertToHtml(item.content).html)
      }));
      const endTime = Date.now();

      // Should complete within reasonable time (5 seconds for 100 items)
      expect(endTime - startTime).toBeLessThan(5000);

      // All results should be valid
      results.forEach(result => {
        expect(result.detection.format).toBeDefined();
        expect(result.conversion.html).toBeDefined();
        expect(result.validation.isValid).toBeDefined();
      });

      // Should preserve variables in all conversions
      results.forEach(result => {
        expect(result.conversion.html).toContain('{{prompt_number}}');
        expect(result.conversion.html).toContain('{{feature_name}}');
        expect(result.conversion.html).toContain('{{end_var}}');
      });
    });

    test('should handle memory efficiently during large operations', () => {
      // Test with very large single content
      const largeContent = `
# Very Large Prompt

${'This is repeated content with {{variable_' + '}}. '.repeat(10000)}

## End Section

Final content with {{final_variable}}.`;

      // Should not cause memory issues
      expect(() => {
        const detection = detectContentFormat(largeContent);
        const conversion = convertToHtml(largeContent);
        const validation = validateContentForStorage(conversion.html);

        expect(detection.format).toBe('markdown');
        expect(conversion.html.length).toBeGreaterThan(largeContent.length); // HTML should be larger
        expect(validation.warnings.length).toBeGreaterThanOrEqual(0); // May have warnings about size
      }).not.toThrow();
    });
  });

  describe('Real-World Scenarios', () => {
    test('should handle typical user content patterns', () => {
      const realWorldContents = [
        // Customer service template
        `Dear {{customer_name}},

Thank you for your order {{order_number}}.

We've processed your request for {{product_name}}.
Total amount: \${{amount}}.

Best regards,
{{agent_name}}`,

        // Technical documentation
        `# API Documentation for {{api_name}}

## Authentication
Use this API key: {{api_key}}

## Endpoints
- GET {{base_url}}/users/{{user_id}}
- POST {{base_url}}/data/{{dataset_id}}

## Example Response
\`\`\`json
{
  "status": "{{status}}",
  "data": "{{response_data}}"
}
\`\`\``,

        // Marketing content
        `# {{product_name}} - {{tagline}}

## Why Choose {{product_name}}?

### Benefits
- {{benefit_1}}
- {{benefit_2}}
- {{benefit_3}}

### Pricing
Starting at \${{price}}/month

### Contact
{{sales_email}} | {{phone_number}}`,

        // Educational content
        `# Lesson: {{lesson_title}}

## Objectives
After this lesson, you will understand:
- {{objective_1}}
- {{objective_2}}

## Prerequisites
{{prerequisite_content}}

## Exercises
1. Complete {{exercise_1}}
2. Submit {{assignment_name}}

Grade: {{student_grade}}`
      ];

      realWorldContents.forEach((content, index) => {
        // Should handle all real-world content patterns
        const detection = detectContentFormat(content);
        const conversion = convertToHtml(content);
        const storageValidation = validateContentForStorage(conversion.html);
        const editorValidation = validateContentForEditor(conversion.html, 'html');

        expect(detection.confidence).toBeGreaterThan(0.5);
        expect(conversion.html).toContain('{{'); // Variables preserved
        expect(storageValidation.isValid).toBe(true);
        expect(editorValidation.isValid).toBe(true);

        // Should preserve all variables through conversion
        const variables = content.match(/\{\{[^}]+\}\}/g) || [];
        variables.forEach(variable => {
          expect(conversion.html).toContain(variable);
        });
      });
    });
  });
});