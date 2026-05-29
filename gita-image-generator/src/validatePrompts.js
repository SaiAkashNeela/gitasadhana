import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from './logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function validatePrompts() {
  try {
    logger.info('Starting prompt validation...');

    // Read prompts and metadata
    const promptsPath = path.join(__dirname, '..', 'data', 'prompts.json');
    const metadataPath = path.join(__dirname, '..', 'data', 'metadata.json');

    const prompts = JSON.parse(await fs.readFile(promptsPath, 'utf-8'));
    const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf-8'));

    logger.info(`Validating ${prompts.length} prompts...`);

    // Validation checks
    const validationReport = {
      totalPrompts: prompts.length,
      totalMetadata: metadata.length,
      checks: {
        promptStructure: 0,
        imagePromptPresent: 0,
        validMetadata: 0,
        tokenEstimate: 0,
      },
      issues: [],
      summary: {},
    };

    // Check prompts structure
    for (let i = 0; i < prompts.length; i++) {
      const prompt = prompts[i];

      // Check structure
      if (prompt.imagePrompt && typeof prompt.imagePrompt === 'string') {
        validationReport.checks.promptStructure++;
      } else {
        validationReport.issues.push(`Prompt ${i}: Missing or invalid imagePrompt`);
      }

      // Check image prompt content
      if (prompt.imagePrompt && prompt.imagePrompt.length > 50) {
        validationReport.checks.imagePromptPresent++;
      }

      // Check token estimate
      if (prompt.estimatedTokens && prompt.estimatedTokens > 0) {
        validationReport.checks.tokenEstimate++;
      }
    }

    // Check metadata structure
    for (let i = 0; i < metadata.length; i++) {
      const meta = metadata[i];

      if (meta.id && meta.type && meta.r2Path && meta.status) {
        validationReport.checks.validMetadata++;
      } else {
        validationReport.issues.push(
          `Metadata ${i}: Missing required fields (id, type, r2Path, status)`
        );
      }
    }

    // Calculate statistics
    validationReport.summary = {
      promptsPass: `${validationReport.checks.promptStructure}/${prompts.length}`,
      metadataPass: `${validationReport.checks.validMetadata}/${metadata.length}`,
      completionPercent: Math.round(
        (validationReport.checks.promptStructure / prompts.length) * 100
      ),
    };

    // Save report
    const reportPath = path.join(__dirname, '..', 'data', 'validation-report.json');
    await fs.writeFile(reportPath, JSON.stringify(validationReport, null, 2));

    logger.info('✓ Validation Report:');
    logger.info(JSON.stringify(validationReport.summary, null, 2));

    if (validationReport.issues.length > 0) {
      logger.warn(`Found ${validationReport.issues.length} issues`);
      validationReport.issues.slice(0, 5).forEach(issue => logger.warn(`  - ${issue}`));
    }

    return validationReport;

  } catch (error) {
    logger.error('Error during validation:', error);
    throw error;
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  validatePrompts().catch(err => {
    logger.error('Fatal error:', err);
    process.exit(1);
  });
}

export { validatePrompts };
