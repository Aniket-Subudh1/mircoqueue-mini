import { S3 } from 'aws-sdk';
import { config } from '../../common/config';

// Configure S3 client
const options: S3.ClientConfiguration = {
  maxRetries: config.s3.maxRetries,
  httpOptions: {
    timeout: config.s3.timeout,
  },
};

// Use local endpoint for development if provided
if (process.env.S3_ENDPOINT) {
  options.endpoint = process.env.S3_ENDPOINT;
  options.s3ForcePathStyle = true;
}

// Create S3 client instance
export const s3Client = new S3(options);

export default s3Client;