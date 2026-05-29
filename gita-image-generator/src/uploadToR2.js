import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from './logger.js';
import config from './config.js';
import R2Client from './r2Client.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function uploadToR2(startIndex = 0, limit = null) {
  try {
    if (!config.uploadToR2Enabled) {
      logger.warn('R2 upload is disabled');
      return;
    }

    logger.info('Starting R2 upload...');

    // Read generation results
    const resultsPath = path.join(__dirname, '..', 'data', 'generation-results.json');
    const generatedImages = JSON.parse(await fs.readFile(resultsPath, 'utf-8'));

    logger.info(`Total generated images: ${generatedImages.length}`);

    // Filter successful generations and slice based on start index and limit
    const imagesToUpload = generatedImages
      .filter(img => img.success && img.imageBase64)
      .slice(startIndex, limit ? startIndex + limit : undefined);

    logger.info(`Uploading ${imagesToUpload.length} images to R2...`);

    if (imagesToUpload.length === 0) {
      logger.warn('No images to upload');
      return;
    }

    // Initialize R2 client
    const r2Client = new R2Client();

    // Upload in batches
    const batchSize = config.batchSize;
    const uploadResults = [];

    for (let i = 0; i < imagesToUpload.length; i += batchSize) {
      const batch = imagesToUpload.slice(i, Math.min(i + batchSize, imagesToUpload.length));
      const batchNum = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(imagesToUpload.length / batchSize);

      logger.info(`\n--- Upload Batch ${batchNum}/${totalBatches} ---`);

      for (const image of batch) {
        try {
          // Check if image already exists in R2
          const headResult = await r2Client.headObject(image.r2Path);
          
          if (headResult.exists) {
            logger.info(`⊘ Skipped (already exists): ${image.r2Path}`);
            uploadResults.push({
              ...image,
              uploadSuccess: true,
              skipped: true,
              reason: 'Image already exists in R2',
            });
            continue;
          }

          // Upload only if not exists
          const result = await r2Client.uploadImage(
            image.imageBase64,
            image.r2Path,
            image.mimeType
          );

          uploadResults.push({
            ...image,
            ...result,
            uploadSuccess: true,
            skipped: false,
          });

          logger.info(`✓ Uploaded: ${image.r2Path}`);

        } catch (error) {
          logger.error(`Failed to upload ${image.r2Path}: ${error.message}`);
          uploadResults.push({
            ...image,
            uploadSuccess: false,
            uploadError: error.message,
          });
        }

        // Rate limit
        await new Promise(resolve => setTimeout(resolve, 800));
      }
    }

    // Save upload results
    const uploadResultsPath = path.join(__dirname, '..', 'data', 'upload-results.json');
    await fs.writeFile(uploadResultsPath, JSON.stringify(uploadResults, null, 2));

    const successCount = uploadResults.filter(img => img.uploadSuccess).length;
    const skippedCount = uploadResults.filter(img => img.skipped).length;
    const uploadedCount = successCount - skippedCount;
    
    logger.info(`\n✓ Upload complete: ${uploadedCount} uploaded, ${skippedCount} skipped, ${uploadResults.length} total`);

    // Save manifest
    const manifest = uploadResults
      .filter(img => img.uploadSuccess)
      .map(img => ({
        id: img.verseKey || `ch-${img.chapterNumber}`,
        type: img.type || 'verse_image',
        r2Path: img.r2Path,
        url: img.url,
        uploadedAt: img.uploadedAt,
      }));

    const manifestPath = path.join(__dirname, '..', 'data', 'r2-manifest.json');
    await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));

    logger.info(`✓ Manifest saved to ${manifestPath}`);

    return uploadResults;

  } catch (error) {
    logger.error('Error during R2 upload:', error);
    throw error;
  }
}

// CLI support
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const startIndex = parseInt(args[0]) || 0;
  const limit = args[1] ? parseInt(args[1]) : null;

  uploadToR2(startIndex, limit).catch(err => {
    logger.error('Fatal error:', err);
    process.exit(1);
  });
}

export { uploadToR2 };
