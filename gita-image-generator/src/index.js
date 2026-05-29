import logger from './logger.js';
import config from './config.js';
import { generateAllPrompts } from './generatePrompts.js';
import { generateImages } from './generateImages.js';
import { validatePrompts } from './validatePrompts.js';
import { uploadToR2 } from './uploadToR2.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function orchestratePipeline() {
  const startTime = Date.now();

  try {
    logger.info('═══════════════════════════════════════════════════════');
    logger.info('  Bhagavad Gita Image Generation Pipeline');
    logger.info('═══════════════════════════════════════════════════════\n');

    // Ensure data directory exists
    const dataDir = path.join(__dirname, '..', 'data');
    await fs.mkdir(dataDir, { recursive: true });

    const logsDir = path.join(__dirname, '..', 'logs');
    await fs.mkdir(logsDir, { recursive: true });

    // Step 1: Generate Prompts
    logger.info('\n[STEP 1/4] Generating Image Prompts');
    logger.info('─────────────────────────────────────');
    const { prompts, metadata } = await generateAllPrompts();
    logger.info(`✓ Generated ${prompts.length} prompts\n`);

    // Step 2: Validate Prompts
    logger.info('[STEP 2/4] Validating Prompts');
    logger.info('─────────────────────────────────────');
    const validationReport = await validatePrompts();
    logger.info(`✓ Validation complete\n`);

    // Step 3: Generate Images (if enabled)
    let generatedImages = [];
    if (config.imageGenerationEnabled) {
      logger.info('[STEP 3/4] Generating Images with Imagen 4 Ultra');
      logger.info('─────────────────────────────────────');
      logger.warn('NOTE: Image generation is ENABLED. Each image costs $0.06');
      logger.info(`This will process prompts in batches of ${config.batchSize}\n`);

      // Auto-proceed in non-interactive mode (Docker, CI/CD)
      // In interactive mode, require explicit --yes flag
      const isInteractive = process.stdin.isTTY;
      const hasYesFlag = process.argv.includes('--yes') || process.argv.includes('--no-confirm');
      
      if (isInteractive && !hasYesFlag) {
        logger.warn('Skipping image generation. Use --yes flag to proceed.');
        logger.info('Run: npm run generate-images\n');
      } else {
        generatedImages = await generateImages();
        logger.info(`✓ Image generation complete\n`);
      }
    } else {
      logger.info('[STEP 3/4] Skipping Image Generation (disabled in config)');
      logger.info('─────────────────────────────────────');
      logger.info('Set IMAGE_GENERATION_ENABLED=true to enable\n');
    }

    // Step 4: Upload to R2 (if enabled)
    if (config.uploadToR2Enabled && generatedImages.length > 0) {
      logger.info('[STEP 4/4] Uploading to Cloudflare R2');
      logger.info('─────────────────────────────────────');
      await uploadToR2();
      logger.info(`✓ Upload complete\n`);
    } else {
      logger.info('[STEP 4/4] Skipping R2 Upload');
      logger.info('─────────────────────────────────────');
      if (!config.uploadToR2Enabled) {
        logger.info('Upload disabled in config');
      } else if (generatedImages.length === 0) {
        logger.info('No images to upload');
      }
      logger.info('Run: bun run src/uploadToR2.js\n');
    }

    // Summary
    const elapsed = Date.now() - startTime;
    logger.info('═══════════════════════════════════════════════════════');
    logger.info('  Pipeline Summary');
    logger.info('═══════════════════════════════════════════════════════');
    logger.info(`✓ Prompts Generated: ${prompts.length}`);
    logger.info(`✓ Prompts Valid: ${validationReport.checks.promptStructure}/${prompts.length}`);
    logger.info(`✓ Images Generated: ${generatedImages.length}`);
    logger.info(`✓ Pipeline Time: ${(elapsed / 1000 / 60).toFixed(2)} minutes`);
    logger.info('═══════════════════════════════════════════════════════\n');

    logger.info('Output files:');
    logger.info(`  - data/prompts.json`);
    logger.info(`  - data/metadata.json`);
    logger.info(`  - data/validation-report.json`);
    if (generatedImages.length > 0) {
      logger.info(`  - data/generation-results.json`);
      logger.info(`  - data/upload-results.json`);
      logger.info(`  - data/r2-manifest.json`);
    }
    logger.info('');

  } catch (error) {
    logger.error('Pipeline failed:', error);
    process.exit(1);
  }
}

// Run orchestration
orchestratePipeline();
