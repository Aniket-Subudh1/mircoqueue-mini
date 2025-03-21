const AWS = require('aws-sdk');
const dotenv = require('dotenv');

dotenv.config();

// Configure S3 client for local development
const s3 = new AWS.S3({
  region: 'us-east-1',
  endpoint: 'http://localhost:9000',
  s3ForcePathStyle: true,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'minioadmin',
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'minioadmin',
  signatureVersion: 'v4'
});

const createBuckets = async () => {
  const buckets = [
    'microqueue-messages-dev-local',
    'microqueue-archive-dev-local'
  ];

  for (const bucket of buckets) {
    try {
      console.log(`Creating bucket: ${bucket}`);
      await s3.createBucket({ Bucket: bucket }).promise();
      console.log(`Successfully created bucket: ${bucket}`);
    } catch (error) {
      if (error.code === 'BucketAlreadyOwnedByYou' || error.code === 'BucketAlreadyExists') {
        console.log(`Bucket already exists: ${bucket}`);
      } else {
        console.error(`Error creating bucket ${bucket}:`, error);
      }
    }
  }
};

createBuckets().catch(console.error);