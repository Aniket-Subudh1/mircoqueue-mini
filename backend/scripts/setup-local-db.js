const AWS = require('aws-sdk');
const dotenv = require('dotenv');

dotenv.config();

// Configure DynamoDB client for local development
const dynamodb = new AWS.DynamoDB({
  region: 'us-east-1',
  endpoint: 'http://localhost:8000',
  accessKeyId: 'localstack',
  secretAccessKey: 'localstack'
});

async function createTables() {
  try {
    console.log('Creating Topics table...');
    await dynamodb.createTable({
      TableName: 'MicroQueue-Topics-dev',
      AttributeDefinitions: [
        { AttributeName: 'topicId', AttributeType: 'S' }
      ],
      KeySchema: [
        { AttributeName: 'topicId', KeyType: 'HASH' }
      ],
      BillingMode: 'PAY_PER_REQUEST'
    }).promise();

    console.log('Creating Messages table...');
    await dynamodb.createTable({
      TableName: 'MicroQueue-Messages-dev',
      AttributeDefinitions: [
        { AttributeName: 'topicId', AttributeType: 'S' },
        { AttributeName: 'sequenceNumber', AttributeType: 'N' },
        { AttributeName: 'messageId', AttributeType: 'S' }
      ],
      KeySchema: [
        { AttributeName: 'topicId', KeyType: 'HASH' },
        { AttributeName: 'sequenceNumber', KeyType: 'RANGE' }
      ],
      GlobalSecondaryIndexes: [
        {
          IndexName: 'MessageIdIndex',
          KeySchema: [
            { AttributeName: 'messageId', KeyType: 'HASH' }
          ],
          Projection: { ProjectionType: 'ALL' }
        }
      ],
      BillingMode: 'PAY_PER_REQUEST'
    }).promise();

    console.log('Creating Consumer Groups table...');
    await dynamodb.createTable({
      TableName: 'MicroQueue-ConsumerGroups-dev',
      AttributeDefinitions: [
        { AttributeName: 'groupId', AttributeType: 'S' },
        { AttributeName: 'topicId', AttributeType: 'S' }
      ],
      KeySchema: [
        { AttributeName: 'groupId', KeyType: 'HASH' },
        { AttributeName: 'topicId', KeyType: 'RANGE' }
      ],
      BillingMode: 'PAY_PER_REQUEST'
    }).promise();

    console.log('Creating Offsets table...');
    await dynamodb.createTable({
      TableName: 'MicroQueue-Offsets-dev',
      AttributeDefinitions: [
        { AttributeName: 'groupId', AttributeType: 'S' },
        { AttributeName: 'topicId', AttributeType: 'S' }
      ],
      KeySchema: [
        { AttributeName: 'groupId', KeyType: 'HASH' },
        { AttributeName: 'topicId', KeyType: 'RANGE' }
      ],
      BillingMode: 'PAY_PER_REQUEST'
    }).promise();

    console.log('All tables created successfully!');
  } catch (error) {
    console.error('Error creating tables:', error);
  }
}

createTables();