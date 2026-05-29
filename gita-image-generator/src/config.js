const config = {
  googleProjectId: 'REPLACE_ME_GCP_PROJECT_ID',
  googleRegion: 'us-central1',
  googleCredentialsPath: './gita-credentials.json',
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
  gitaDataPath: '../gita-english.json',
  promptsOutputPath: './data/prompts.json',
  metadataOutputPath: './data/metadata.json',
  imagesLocalPath: './images',
};

export default config;
