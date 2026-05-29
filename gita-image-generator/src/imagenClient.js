import axios from 'axios';
import { readFileSync } from 'fs';
import { JWT } from 'google-auth-library';
import logger from './logger.js';
import config from './config.js';

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
      const credentials = JSON.parse(credsData);
      
      this.jwtClient = new JWT({
        email: credentials.client_email,
        key: credentials.private_key,
        scopes: ['https://www.googleapis.com/auth/cloud-platform'],
      });
      
      this.projectId = credentials.project_id;
      logger.debug('Initialized JWT client from service account credentials');
    } catch (error) {
      logger.error(`Failed to load credentials: ${error.message}`);
      throw error;
    }
  }

  async getAccessToken() {
    try {
      const { token } = await this.jwtClient.getAccessToken();
      return token;
    } catch (error) {
      logger.error(`Error getting access token: ${error.message}`);
      throw error;
    }
  }

  async generateImage(prompt, imageName = 'generated_image') {
    try {
      logger.debug(`Generating image: ${imageName}`);

      const accessToken = await this.getAccessToken();

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
        timeout: 120000,
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
