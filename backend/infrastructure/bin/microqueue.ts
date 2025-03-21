import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { MicroQueueStack } from '../lib/microqueue-stack';
import { DatabaseStack } from '../lib/database-stack';
import { ApiStack } from '../lib/api-stack';
import { MonitoringStack } from '../lib/monitoring-stack';

const app = new cdk.App();

// Environment configuration
const env = { 
  account: process.env.CDK_DEFAULT_ACCOUNT, 
  region: process.env.CDK_DEFAULT_REGION || 'us-east-1'
};

// Stack names
const appName = 'MicroQueueMini';
const stage = process.env.STAGE || 'dev';

// Database stack for DynamoDB tables and S3 buckets
const databaseStack = new DatabaseStack(app, `${appName}-Database-${stage}`, {
  env,
  stage,
  description: 'DynamoDB tables and S3 buckets for MicroQueue Mini'
});

// API stack for API Gateway and Lambda functions
const apiStack = new ApiStack(app, `${appName}-API-${stage}`, {
  env,
  stage,
  tables: databaseStack.tables,
  buckets: databaseStack.buckets,
  description: 'API Gateway and Lambda functions for MicroQueue Mini'
});

// Monitoring stack for CloudWatch dashboards and alarms
const monitoringStack = new MonitoringStack(app, `${appName}-Monitoring-${stage}`, {
  env,
  stage,
  apis: apiStack.apis,
  functions: apiStack.functions,
  tables: databaseStack.tables,
  buckets: databaseStack.buckets,
  description: 'CloudWatch dashboards and alarms for MicroQueue Mini'
});

// Main stack that contains references to all other stacks
new MicroQueueStack(app, `${appName}-${stage}`, {
  env,
  stage,
  description: 'Main stack for MicroQueue Mini'
});

// Tag all resources
cdk.Tags.of(app).add('app', appName);
cdk.Tags.of(app).add('stage', stage);