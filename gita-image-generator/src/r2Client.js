import axios from 'axios';
import { Readable } from 'stream';
import crypto from 'crypto';
import logger from './logger.js';
import config from './config.js';

class R2Client {
  constructor() {
    this.accessKeyId = config.r2.accessKeyId;
    this.secretAccessKey = config.r2.secretAccessKey;
    this.endpoint = config.r2.endpoint;
    this.bucketName = config.r2.bucketName;
  }

  // AWS Signature V4 signing for R2
  sign(method, path, headers = {}, body = '') {
    const now = new Date();
    const amzDate = now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const datestamp = amzDate.slice(0, 8);

    headers['Host'] = new URL(this.endpoint).hostname;
    headers['x-amz-date'] = amzDate;
    headers['x-amz-content-sha256'] = this.hash256(body);

    const canonicalHeaders = Object.keys(headers)
      .sort()
      .map(key => `${key.toLowerCase()}:${headers[key]}`)
      .join('\n') + '\n';

    const signedHeaders = Object.keys(headers)
      .sort()
      .map(key => key.toLowerCase())
      .join(';');

    const canonicalRequest = [
      method,
      path,
      '',
      canonicalHeaders,
      signedHeaders,
      headers['x-amz-content-sha256'],
    ].join('\n');

    const canonicalRequestHash = this.hash256(canonicalRequest);

    const credentialScope = `${datestamp}/auto/s3/aws4_request`;
    const stringToSign = [
      'AWS4-HMAC-SHA256',
      amzDate,
      credentialScope,
      canonicalRequestHash,
    ].join('\n');

    const signature = this.signString(stringToSign, datestamp);
    const authorizationHeader = `AWS4-HMAC-SHA256 Credential=${this.accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

    return {
      'Authorization': authorizationHeader,
      ...headers,
    };
  }

  hash256(data) {
    if (Buffer.isBuffer(data)) {
      return crypto.createHash('sha256').update(data).digest('hex');
    }
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  signString(stringToSign, datestamp) {
    const kDate = crypto
      .createHmac('sha256', `AWS4${this.secretAccessKey}`)
      .update(datestamp)
      .digest();

    const kRegion = crypto.createHmac('sha256', kDate).update('auto').digest();
    const kService = crypto.createHmac('sha256', kRegion).update('s3').digest();
    const kSigning = crypto.createHmac('sha256', kService).update('aws4_request').digest();

    return crypto.createHmac('sha256', kSigning).update(stringToSign).digest('hex');
  }

  async headObject(key) {
    try {
      const path = `/${this.bucketName}/${key}`;
      const headers = this.sign('HEAD', path);

      const response = await axios.head(`${this.endpoint}${path}`, {
        headers,
        validateStatus: () => true, // Don't throw on 404
      });

      return {
        exists: response.status === 200,
        status: response.status,
        headers: response.headers,
      };
    } catch (error) {
      logger.error(`Error checking R2 object ${key}: ${error.message}`);
      throw error;
    }
  }

  async uploadImage(base64Data, key, mimeType = 'image/jpeg') {
    try {
      const buffer = Buffer.from(base64Data, 'base64');
      const path = `/${this.bucketName}/${key}`;
      const url = `${this.endpoint}${path}`;

      const headers = this.sign(
        'PUT',
        path,
        {
          'Content-Type': mimeType,
          'Content-Length': buffer.length.toString(),
        },
        buffer
      );

      logger.debug(`Uploading to R2:`);
      logger.debug(`  URL: ${url}`);
      logger.debug(`  Content-Length: ${buffer.length}`);
      logger.debug(`  x-amz-content-sha256: ${headers['x-amz-content-sha256']}`);
      logger.debug(`  Authorization: ${headers['Authorization'].substring(0, 50)}...`);

      const response = await axios.put(url, buffer, {
        headers,
        timeout: 60000,
        validateStatus: null,
      });

      if (response.status !== 200) {
        logger.error(`R2 Upload failed with status ${response.status}`);
        logger.error(`Response: ${JSON.stringify(response.data)}`);
        logger.error(`Headers sent: ${JSON.stringify(headers)}`);
        throw new Error(`R2 upload failed: ${response.status} ${response.statusText}`);
      }

      logger.info(`✓ Uploaded to R2: ${key}`);

      return {
        success: true,
        key,
        url: `${this.endpoint}/${this.bucketName}/${key}`,
        statusCode: response.status,
        uploadedAt: new Date().toISOString(),
      };

    } catch (error) {
      logger.error(`Error uploading to R2: ${error.message}`);
      throw error;
    }
  }

  async uploadBatchWithSkip(images) {
    const uploadResults = [];
    const skippedResults = [];

    for (const image of images) {
      try {
        // Check if image already exists in R2
        const headResult = await this.headObject(image.key);
        if (headResult.exists) {
          logger.info(`⊘ Skipped (already exists): ${image.key}`);
          skippedResults.push({
            key: image.key,
            skipped: true,
            reason: 'Image already exists in R2',
            url: `${this.endpoint}/${this.bucketName}/${image.key}`,
          });
          continue;
        }

        // Upload if not exists
        const result = await this.uploadImage(image.base64Data, image.key, image.mimeType);
        uploadResults.push({
          key: image.key,
          ...result,
          uploaded: true,
        });

      } catch (error) {
        logger.error(`Failed to process ${image.key}: ${error.message}`);
        uploadResults.push({
          key: image.key,
          error: error.message,
          uploaded: false,
        });
      }

      await new Promise(resolve => setTimeout(resolve, 500));
    }

    return { uploaded: uploadResults, skipped: skippedResults };
  }

  async uploadBatch(images) {
    const results = [];
    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      try {
        const result = await this.uploadImage(
          image.imageBase64,
          image.r2Path,
          image.mimeType
        );
        results.push({
          ...image,
          ...result,
          index: i,
        });
        logger.info(`[${i + 1}/${images.length}] Uploaded to R2`);
      } catch (error) {
        logger.error(`[${i + 1}/${images.length}] Failed to upload:`, error.message);
        results.push({
          ...image,
          success: false,
          error: error.message,
          index: i,
        });
      }

      // Small delay between uploads
      if (i < images.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    return results;
  }
}

export default R2Client;
