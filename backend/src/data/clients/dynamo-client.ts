import { DynamoDB } from 'aws-sdk';
import * as dotenv from 'dotenv';
dotenv.config();

// Configure DynamoDB client
const options: DynamoDB.ClientConfiguration = {
  region: process.env.AWS_REGION || 'us-east-1',
  maxRetries: 3,
  httpOptions: {
    timeout: 5000,
  },
  ...(process.env.IS_LOCAL && {
    accessKeyId: 'localstack',
    secretAccessKey: 'localstack',
  })
};


if (process.env.DYNAMODB_ENDPOINT) {
  console.log(`Using local DynamoDB endpoint: ${process.env.DYNAMODB_ENDPOINT}`);
  options.endpoint = process.env.DYNAMODB_ENDPOINT;
}


export const dynamoClient = new DynamoDB.DocumentClient(options);

export default dynamoClient;