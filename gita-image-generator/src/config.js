import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.dirname(__dirname);

const config = {
  googleProjectId: 'project-7f37abfa-24e2-4383-824',
  googleRegion: 'us-central1',
  googleCredentialsPath: path.join(projectRoot, 'gcp-creds.json'),
  imagenModel: 'imagen-4.0-ultra-generate-001',
  imagenOutputMimeType: 'image/jpeg',
  r2: {
    accessKeyId: '***REMOVED***',
    secretAccessKey: '***REMOVED***',
    endpoint: 'https://21bcf6a2def0a1f1b96480afa6bf33ec.r2.cloudflarestorage.com',
    bucketName: 'gita-audio',
  },
  batchSize: 5,
  maxRetries: 3,
  imageGenerationEnabled: true,
  uploadToR2Enabled: true,
  logLevel: 'info',
  gitaDataPath: path.join(projectRoot, 'gita-english.json'),
  promptsOutputPath: './data/prompts.json',
  metadataOutputPath: './data/metadata.json',
  imagesLocalPath: './images',
};

export default config;
