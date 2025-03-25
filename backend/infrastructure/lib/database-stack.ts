import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';

export interface DatabaseStackProps extends cdk.StackProps {
  stage: string;
}

export class DatabaseStack extends cdk.Stack {
  public readonly tables: {
    topicsTable: dynamodb.Table;
    messagesTable: dynamodb.Table;
    consumerGroupsTable: dynamodb.Table;
    offsetsTable: dynamodb.Table;
  };

  public readonly buckets: {
    messagesBucket: s3.Bucket;
    archiveBucket: s3.Bucket;
  };

  constructor(scope: Construct, id: string, props: DatabaseStackProps) {
    super(scope, id, props);

    const stage = props.stage;
    const removalPolicy = stage === 'prod' 
      ? cdk.RemovalPolicy.RETAIN 
      : cdk.RemovalPolicy.DESTROY;

    // Create DynamoDB Tables
    
    // Topics Table
    const topicsTable = new dynamodb.Table(this, 'TopicsTable', {
      tableName: `MicroQueue-Topics-${stage}`,
      partitionKey: {
        name: 'topicId',
        type: dynamodb.AttributeType.STRING
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy,
      pointInTimeRecovery: true,
    });

    // Messages Table
    const messagesTable = new dynamodb.Table(this, 'MessagesTable', {
      tableName: `MicroQueue-Messages-${stage}`,
      partitionKey: {
        name: 'topicId',
        type: dynamodb.AttributeType.STRING
      },
      sortKey: {
        name: 'sequenceNumber',
        type: dynamodb.AttributeType.NUMBER
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy,
      pointInTimeRecovery: true,
      timeToLiveAttribute: 'expiresAt',
    });

    // Global Secondary Index for messageId lookup
    messagesTable.addGlobalSecondaryIndex({
      indexName: 'MessageIdIndex',
      partitionKey: {
        name: 'messageId',
        type: dynamodb.AttributeType.STRING
      },
      projectionType: dynamodb.ProjectionType.ALL
    });

    // Consumer Groups Table
    const consumerGroupsTable = new dynamodb.Table(this, 'ConsumerGroupsTable', {
      tableName: `MicroQueue-ConsumerGroups-${stage}`,
      partitionKey: {
        name: 'groupId',
        type: dynamodb.AttributeType.STRING
      },
      sortKey: {
        name: 'topicId',
        type: dynamodb.AttributeType.STRING
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy,
      pointInTimeRecovery: true,
    });

    // Consumer Offsets Table
    const offsetsTable = new dynamodb.Table(this, 'OffsetsTable', {
      tableName: `MicroQueue-Offsets-${stage}`,
      partitionKey: {
        name: 'groupId',
        type: dynamodb.AttributeType.STRING
      },
      sortKey: {
        name: 'topicId',
        type: dynamodb.AttributeType.STRING
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy,
      pointInTimeRecovery: true,
    });

    // Create S3 Buckets
    
    // Messages Bucket
    const messagesBucket = new s3.Bucket(this, 'MessagesBucket', {
      bucketName: `microqueue-messages-${stage}-${this.account}`,
      removalPolicy,
      autoDeleteObjects: stage !== 'prod',
      versioned: true,
      lifecycleRules: [
        {
          id: 'archive-after-90-days',
          enabled: true,
          transitions: [
            {
              storageClass: s3.StorageClass.INFREQUENT_ACCESS,
              transitionAfter: cdk.Duration.days(30),
            },
            {
              storageClass: s3.StorageClass.GLACIER,
              transitionAfter: cdk.Duration.days(90),
            }
          ]
        }
      ],
      cors: [
        {
          allowedMethods: [
            s3.HttpMethods.GET,
            s3.HttpMethods.HEAD,
          ],
          allowedOrigins: ['*'],
          allowedHeaders: ['*'],
          maxAge: 3000,
        },
      ],
      encryption: s3.BucketEncryption.S3_MANAGED,
    });

    // Archive Bucket (for backup and long-term storage)
    const archiveBucket = new s3.Bucket(this, 'ArchiveBucket', {
      bucketName: `microqueue-archive-${stage}-${this.account}`,
      removalPolicy,
      autoDeleteObjects: stage !== 'prod',
      versioned: true,
      lifecycleRules: [
        {
          id: 'move-to-glacier',
          enabled: true,
          transitions: [
            {
              storageClass: s3.StorageClass.GLACIER,
              transitionAfter: cdk.Duration.days(1),
            }
          ]
        }
      ],
      encryption: s3.BucketEncryption.S3_MANAGED,
    });

    // Export tables and buckets
    this.tables = {
      topicsTable,
      messagesTable,
      consumerGroupsTable,
      offsetsTable
    };

    this.buckets = {
      messagesBucket,
      archiveBucket
    };

    // Outputs
    new cdk.CfnOutput(this, 'TopicsTableName', {
      value: topicsTable.tableName,
      description: 'The name of the topics table',
      exportName: `${id}-TopicsTableName`,
    });

    new cdk.CfnOutput(this, 'MessagesTableName', {
      value: messagesTable.tableName,
      description: 'The name of the messages table',
      exportName: `${id}-MessagesTableName`,
    });

    new cdk.CfnOutput(this, 'ConsumerGroupsTableName', {
      value: consumerGroupsTable.tableName,
      description: 'The name of the consumer groups table',
      exportName: `${id}-ConsumerGroupsTableName`,
    });

    new cdk.CfnOutput(this, 'OffsetsTableName', {
      value: offsetsTable.tableName,
      description: 'The name of the offsets table',
      exportName: `${id}-OffsetsTableName`,
    });

    new cdk.CfnOutput(this, 'MessagesBucketName', {
      value: messagesBucket.bucketName,
      description: 'The name of the messages bucket',
      exportName: `${id}-MessagesBucketName`,
    });

    new cdk.CfnOutput(this, 'ArchiveBucketName', {
      value: archiveBucket.bucketName,
      description: 'The name of the archive bucket',
      exportName: `${id}-ArchiveBucketName`,
    });
  }
}