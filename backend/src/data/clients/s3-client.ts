import { S3 } from 'aws-sdk';
import * as dotenv from 'dotenv';
dotenv.config();

// Configure S3 client
const options: S3.ClientConfiguration = {
  region: process.env.AWS_REGION || 'us-east-1',
  maxRetries: 3,
  httpOptions: {
    timeout: 10000,
  }
};

// Use local endpoint for development if provided
if (process.env.S3_ENDPOINT) {
  console.log(`Using local S3 endpoint: ${process.env.S3_ENDPOINT}`);
  options.endpoint = process.env.S3_ENDPOINT;
  options.s3ForcePathStyle = true;
  options.accessKeyId = process.env.AWS_ACCESS_KEY_ID || 'minioadmin';
  options.secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || 'minioadmin';
  options.signatureVersion = 'v4';
}

// Create S3 client instance
export const s3Client = new S3(options);

export default s3Client;