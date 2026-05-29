import axios from 'axios';
import { readFileSync } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import logger from './logger.js';
import config from './config.js';

const execAsync = promisify(exec);

class ImagenClient {
  constructor() {
    this.projectId = config.googleProjectId;
    this.region = config.googleRegion;
    this.endpoint = `https://${config.googleRegion}-aiplatform.googleapis.com/v1/projects/${config.googleProjectId}/locations/${config.googleRegion}/publishers/google/models/${config.imagenModel}:predict`;
    this.loadCredentials();
  }

  loadCredentials() {
    try {
      const credsPath = config.googleCredentialsPath;
      const credsData = readFileSync(credsPath, 'utf-8');
      this.credentials = JSON.parse(credsData);
      logger.debug('Loaded GCP credentials');
    } catch (error) {
      logger.error(`Failed to load credentials: ${error.message}`);
      throw error;
    }
  }

  async getAccessToken() {
    try {
      const { stdout } = await execAsync('gcloud auth application-default print-access-token');
      return stdout.trim();
    } catch (error) {
      logger.error('Error getting access token:', error.message);
      throw new Error('Failed to get access token. Ensure gcloud CLI is authenticated.');
    }
  }

  async generateImage(prompt, imageName = 'generated_image') {
    try {
      logger.debug(`Generating image: ${imageName}`);

      let accessToken;
      try {
        accessToken = await this.getAccessToken();
      } catch (error) {
        logger.warn('Skipping image generation (no gcloud auth)');
        throw error;
      }

      const request = {
        instances: [{ prompt }],
        parameters: {
          sampleCount: 1,
          aspectRatio: '1:1',
          outputMimeType: config.imagenOutputMimeType,
        },
      };

      const response = await axios.post(this.endpoint, request, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        timeout: 60000,
      });

      if (!response.data.predictions?.[0]) {
        throw new Error('No image in response');
      }

      const prediction = response.data.predictions[0];
      const imageBase64 = prediction.bytesBase64Encoded;

      if (!imageBase64) {
        throw new Error('No base64 data returned');
      }

      logger.info(`✓ Generated: ${imageName}`);

      return {
        imageBase64,
        mimeType: config.imagenOutputMimeType,
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
        results.push({ ...prompt, ...result, index: i });
      } catch (error) {
        logger.error(`Batch error [${i + 1}/${prompts.length}]: ${error.message}`);
        results.push({ ...prompt, error: error.message, index: i });
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    return results;
  }
}

export default ImagenClient;
