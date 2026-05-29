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
    const r2Client = new R2Client();

    // Process in batches
    const batchSize = config.batchSize;
    const generatedResults = [];

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

          // Parse verseKey (format: "chapter-verse")
          const [chapter, verse] = prompt.verseKey 
            ? prompt.verseKey.split('-').map(Number)
            : ['unknown', 'unknown'];
          
          const r2Path = `images/chapters/${chapter}/${chapter}_${verse}.jpg`;

          // Upload to R2 immediately (no local storage)
          const uploadResult = await r2Client.uploadImage(
            result.imageBase64,
            r2Path,
            'image/jpeg'
          );

          // Store metadata with R2 path
          const resultMetadata = {
            verseKey: prompt.verseKey,
            chapter,
            verse,
            success: true,
            generatedAt: result.generatedAt,
            r2Path: r2Path,
            r2Uploaded: true,
            r2UploadedAt: new Date().toISOString(),
          };

          generatedResults.push(resultMetadata);

          logger.info(`✓ Generated & Uploaded to R2: ${prompt.verseKey}`);

        } catch (error) {
          logger.error(`Failed to generate/upload image: ${error.message}`);
          logger.error('STOPPING PROCESS: R2 upload must succeed for every image');
          throw error; // Stop the entire process on upload failure
        }

        // Rate limit
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
    }

    // Save generation results (metadata only, no base64)
    const resultsPath = path.join(__dirname, '..', 'data', 'generation-results.json');
    await fs.writeFile(resultsPath, JSON.stringify(generatedResults, null, 2));

    const successCount = generatedResults.filter(img => img.success).length;
    logger.info(`\n✓ Generation complete: ${successCount}/${generatedResults.length} successful`);

    return generatedResults;

  } catch (error) {
    logger.error('Error during image generation:', error);
    throw error;
  }
}



// Images are uploaded directly to R2 during generation
// No local storage needed

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
