const AWS = require('aws-sdk');

const dynamodb = new AWS.DynamoDB({
  region: 'us-east-1',
  endpoint: 'http://localhost:8000',
  accessKeyId: 'localstack',
  secretAccessKey: 'localstack',
});

async function describeTables() {
  try {
    const result = await dynamodb.describeTable({
      TableName: 'MicroQueue-Messages-dev',
    }).promise();
    console.log('Messages Table Schema:', JSON.stringify(result.Table, null, 2));
  } catch (error) {
    console.error('Error describing table:', error);
  }
}

describeTables();