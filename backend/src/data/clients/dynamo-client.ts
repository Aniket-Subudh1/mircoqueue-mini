import { DynamoDB } from 'aws-sdk';
import { config } from '../../common/config';

// Configure DynamoDB client
const options: DynamoDB.ClientConfiguration = {
  maxRetries: config.dynamodb.maxRetries,
  httpOptions: {
    timeout: config.dynamodb.timeout,
  },
};

// Use local endpoint for development if provided
if (process.env.DYNAMODB_ENDPOINT) {
  options.endpoint = process.env.DYNAMODB_ENDPOINT;
}

// Create DynamoDB document client instance
export const dynamoClient = new DynamoDB.DocumentClient(options);

export default dynamoClient;