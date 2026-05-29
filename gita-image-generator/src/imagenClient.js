import pkg from '@google-cloud/aiplatform';
const { ImageGenerationServiceClient } = pkg;
import logger from './logger.js';
import config from './config.js';

class ImagenClient {
  constructor() {
    this.client = new ImageGenerationServiceClient({
      projectId: config.googleProjectId,
      apiEndpoint: `${config.googleRegion}-aiplatform.googleapis.com`,
    });
    this.model = `projects/${config.googleProjectId}/locations/${config.googleRegion}/publishers/google/models/${config.imagenModel}`;
  }

  async generateImage(prompt, imageName = 'generated_image') {
    try {
      logger.debug(`Generating image for prompt: ${prompt.substring(0, 100)}...`);

      const request = {
        parent: `projects/${config.googleProjectId}/locations/${config.googleRegion}`,
        instances: [
          {
            prompt,
          },
        ],
        parameters: {
          sampleCount: 1,
          aspectRatio: '1:1', // Square format for mobile
          outputMimeType: config.imagenOutputMimeType,
        },
      };

      const [response] = await this.client.generateImages(request);

      if (!response.predictions || response.predictions.length === 0) {
        throw new Error('No image generated from Imagen');
      }

      const prediction = response.predictions[0];
      
      // Base64 encoded image
      const imageBase64 = prediction.bytesBase64Encoded;
      if (!imageBase64) {
        throw new Error('No base64 image data returned');
      }

      logger.info(`✓ Successfully generated image: ${imageName}`);

      return {
        success: true,
        imageBase64,
        mimeType: config.imagenOutputMimeType,
        imageName,
        generatedAt: new Date().toISOString(),
      };

    } catch (error) {
      logger.error(`Error generating image: ${error.message}`);
      throw error;
    }
  }

  async generateImageBatch(prompts) {
    const results = [];
    for (let i = 0; i < prompts.length; i++) {
      const prompt = prompts[i];
      try {
        const result = await this.generateImage(
          prompt.imagePrompt,
          prompt.imageName || `image_${i}`
        );
        results.push({
          ...prompt,
          ...result,
          index: i,
        });
        logger.info(`[${i + 1}/${prompts.length}] Image generated`);
      } catch (error) {
        logger.error(`[${i + 1}/${prompts.length}] Failed to generate image:`, error.message);
        results.push({
          ...prompt,
          success: false,
          error: error.message,
          index: i,
        });
      }
      
      // Add small delay between requests to avoid rate limiting
      if (i < prompts.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    return results;
  }
}

export default ImagenClient;
