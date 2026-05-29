import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from './logger.js';
import config from './config.js';
import ImagenClient from './imagenClient.js';
import R2Client from './r2Client.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function generateImages(startIndex = 0, limit = null) {
  try {
    if (!config.imageGenerationEnabled) {
      logger.warn('Image generation is disabled');
      return;
    }

    logger.info('Starting image generation from prompts...');

    // Read prompts
    const promptsPath = path.join(__dirname, '..', 'data', 'prompts.json');
    const prompts = JSON.parse(await fs.readFile(promptsPath, 'utf-8'));

    logger.info(`Total prompts available: ${prompts.length}`);

    // Slice based on start index and limit
    const promptsToProcess = limit
      ? prompts.slice(startIndex, startIndex + limit)
      : prompts.slice(startIndex);

    logger.info(`Processing ${promptsToProcess.length} prompts (from ${startIndex})`);

    // Initialize Imagen client
    const imagenClient = new ImagenClient();

    // Process in batches
    const batchSize = config.batchSize;
    const generatedImages = [];

    for (let i = 0; i < promptsToProcess.length; i += batchSize) {
      const batch = promptsToProcess.slice(i, Math.min(i + batchSize, promptsToProcess.length));
      const batchNum = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(promptsToProcess.length / batchSize);

      logger.info(`\n--- Batch ${batchNum}/${totalBatches} ---`);

      for (const prompt of batch) {
        try {
          const result = await imagenClient.generateImage(
            prompt.imagePrompt,
            prompt.verseKey || `image_${prompt.chapterNumber || 'unknown'}`
          );

          const imageData = {
            ...prompt,
            imageBase64: result.imageBase64,
            mimeType: result.mimeType,
            generatedAt: result.generatedAt,
            success: true,
          };

          generatedImages.push(imageData);

          logger.info(`✓ Generated: ${prompt.verseKey || `Chapter ${prompt.chapterNumber}`}`);

          // Save locally
          await saveImageLocally(imageData);

        } catch (error) {
          logger.error(`Failed to generate image: ${error.message}`);
          generatedImages.push({
            ...prompt,
            success: false,
            error: error.message,
          });
        }

        // Rate limit
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
    }

    // Save generation results
    const resultsPath = path.join(__dirname, '..', 'data', 'generation-results.json');
    await fs.writeFile(resultsPath, JSON.stringify(generatedImages, null, 2));

    const successCount = generatedImages.filter(img => img.success).length;
    logger.info(`\n✓ Generation complete: ${successCount}/${generatedImages.length} successful`);

    return generatedImages;

  } catch (error) {
    logger.error('Error during image generation:', error);
    throw error;
  }
}

async function saveImageLocally(imageData) {
  try {
    const imagesDir = path.join(__dirname, '..', config.imagesLocalPath);
    await fs.mkdir(imagesDir, { recursive: true });

    let filename = imageData.verseKey || `image_${imageData.chapterNumber || 'unknown'}`;
    filename = filename.replace(/\//g, '_');
    const filepath = path.join(imagesDir, `${filename}.jpg`);

    const buffer = Buffer.from(imageData.imageBase64, 'base64');
    await fs.writeFile(filepath, buffer);

    logger.debug(`Saved locally: ${filename}.jpg`);

  } catch (error) {
    logger.warn(`Could not save image locally: ${error.message}`);
  }
}

// CLI support
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const startIndex = parseInt(args[0]) || 0;
  const limit = args[1] ? parseInt(args[1]) : null;

  generateImages(startIndex, limit).catch(err => {
    logger.error('Fatal error:', err);
    process.exit(1);
  });
}

export { generateImages };
