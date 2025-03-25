import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as path from 'path';

interface ApiStackProps extends cdk.StackProps {
  stage: string;
  tables: {
    topicsTable: dynamodb.Table;
    messagesTable: dynamodb.Table;
    consumerGroupsTable: dynamodb.Table;
    offsetsTable: dynamodb.Table;
  };
  buckets: {
    messagesBucket: s3.Bucket;
    archiveBucket: s3.Bucket;
  };
}

export class ApiStack extends cdk.Stack {
  public readonly apis: {
    mainApi: apigateway.RestApi;
  };

  public readonly functions: {
    [key: string]: lambda.Function;
  } = {};

  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    const stage = props.stage;
    const { tables, buckets } = props;

    // Common Lambda configuration
    const lambdaEnvironment = {
      STAGE: stage,
      TOPICS_TABLE: tables.topicsTable.tableName,
      MESSAGES_TABLE: tables.messagesTable.tableName,
      CONSUMER_GROUPS_TABLE: tables.consumerGroupsTable.tableName,
      OFFSETS_TABLE: tables.offsetsTable.tableName,
      MESSAGES_BUCKET: buckets.messagesBucket.bucketName,
      ARCHIVE_BUCKET: buckets.archiveBucket.bucketName,
    };

    const lambdaDefaultProps = {
      runtime: lambda.Runtime.NODEJS_18_X,
      memorySize: 256,
      timeout: cdk.Duration.seconds(30),
      environment: lambdaEnvironment,
      tracing: lambda.Tracing.ACTIVE,
      logRetention: logs.RetentionDays.ONE_WEEK,
    };

    // Lambda execution role with permissions to access DynamoDB and S3
    const lambdaExecutionRole = new iam.Role(this, 'LambdaExecutionRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
        iam.ManagedPolicy.fromAwsManagedPolicyName('AWSXRayDaemonWriteAccess'),
      ]
    });

    // Grant permissions to DynamoDB tables
    tables.topicsTable.grantReadWriteData(lambdaExecutionRole);
    tables.messagesTable.grantReadWriteData(lambdaExecutionRole);
    tables.consumerGroupsTable.grantReadWriteData(lambdaExecutionRole);
    tables.offsetsTable.grantReadWriteData(lambdaExecutionRole);

    // Grant permissions to S3 buckets
    buckets.messagesBucket.grantReadWrite(lambdaExecutionRole);
    buckets.archiveBucket.grantReadWrite(lambdaExecutionRole);

    // Create Lambda functions for API endpoints
    
    // Topics functions
    const createTopicFunction = new lambda.Function(this, 'CreateTopicFunction', {
      ...lambdaDefaultProps,
      functionName: `microqueue-create-topic-${stage}`,
      handler: 'lambdas/api/topics/create.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../dist')),
      role: lambdaExecutionRole,
    });
    this.functions['createTopic'] = createTopicFunction;

    const listTopicsFunction = new lambda.Function(this, 'ListTopicsFunction', {
      ...lambdaDefaultProps,
      functionName: `microqueue-list-topics-${stage}`,
      handler: 'lambdas/api/topics/list.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../dist')),
      role: lambdaExecutionRole,
    });
    this.functions['listTopics'] = listTopicsFunction;

    const deleteTopicFunction = new lambda.Function(this, 'DeleteTopicFunction', {
      ...lambdaDefaultProps,
      functionName: `microqueue-delete-topic-${stage}`,
      handler: 'lambdas/api/topics/delete.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../dist')),
      role: lambdaExecutionRole,
    });
    this.functions['deleteTopic'] = deleteTopicFunction;

    // Messages functions
    const publishMessageFunction = new lambda.Function(this, 'PublishMessageFunction', {
      ...lambdaDefaultProps,
      functionName: `microqueue-publish-message-${stage}`,
      handler: 'lambdas/api/messages/publish.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../dist')),
      role: lambdaExecutionRole,
      timeout: cdk.Duration.seconds(10),
    });
    this.functions['publishMessage'] = publishMessageFunction;

    const consumeMessagesFunction = new lambda.Function(this, 'ConsumeMessagesFunction', {
      ...lambdaDefaultProps,
      functionName: `microqueue-consume-messages-${stage}`,
      handler: 'lambdas/api/messages/consume.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../dist')),
      role: lambdaExecutionRole,
      timeout: cdk.Duration.seconds(20),
    });
    this.functions['consumeMessages'] = consumeMessagesFunction;

    // Consumer groups functions
    const createConsumerGroupFunction = new lambda.Function(this, 'CreateConsumerGroupFunction', {
      ...lambdaDefaultProps,
      functionName: `microqueue-create-consumer-group-${stage}`,
      handler: 'lambdas/api/consumer-groups/create.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../dist')),
      role: lambdaExecutionRole,
    });
    this.functions['createConsumerGroup'] = createConsumerGroupFunction;

    const listConsumerGroupsFunction = new lambda.Function(this, 'ListConsumerGroupsFunction', {
      ...lambdaDefaultProps,
      functionName: `microqueue-list-consumer-groups-${stage}`,
      handler: 'lambdas/api/consumer-groups/list.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../dist')),
      role: lambdaExecutionRole,
    });
    this.functions['listConsumerGroups'] = listConsumerGroupsFunction;

    // Metrics function
    const getMetricsFunction = new lambda.Function(this, 'GetMetricsFunction', {
      ...lambdaDefaultProps,
      functionName: `microqueue-get-metrics-${stage}`,
      handler: 'lambdas/api/metrics/get.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../dist')),
      role: lambdaExecutionRole,
    });
    this.functions['getMetrics'] = getMetricsFunction;

    // Background processing functions
    const messageProcessorFunction = new lambda.Function(this, 'MessageProcessorFunction', {
      ...lambdaDefaultProps,
      functionName: `microqueue-message-processor-${stage}`,
      handler: 'lambdas/processors/message-publisher.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../dist')),
      role: lambdaExecutionRole,
      timeout: cdk.Duration.minutes(5),
      memorySize: 512,
    });
    this.functions['messageProcessor'] = messageProcessorFunction;

    const messageCleanupFunction = new lambda.Function(this, 'MessageCleanupFunction', {
      ...lambdaDefaultProps,
      functionName: `microqueue-message-cleanup-${stage}`,
      handler: 'lambdas/maintenance/cleanup.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../dist')),
      role: lambdaExecutionRole,
      timeout: cdk.Duration.minutes(15),
      memorySize: 512,
    });
    this.functions['messageCleanup'] = messageCleanupFunction;

    const metricsAggregatorFunction = new lambda.Function(this, 'MetricsAggregatorFunction', {
      ...lambdaDefaultProps,
      functionName: `microqueue-metrics-aggregator-${stage}`,
      handler: 'lambdas/maintenance/metrics-aggregator.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../dist')),
      role: lambdaExecutionRole,
      timeout: cdk.Duration.minutes(5),
      memorySize: 512,
    });
    this.functions['metricsAggregator'] = metricsAggregatorFunction;

    // Create API Gateway
    const api = new apigateway.RestApi(this, 'MicroQueueApi', {
      restApiName: `MicroQueue-API-${stage}`,
      description: 'API for MicroQueue Mini',
      deployOptions: {
        stageName: stage,
        metricsEnabled: true,
        loggingLevel: apigateway.MethodLoggingLevel.INFO,
        dataTraceEnabled: true,
      },
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: [
          'Content-Type',
          'X-Amz-Date',
          'Authorization',
          'X-Api-Key',
          'X-Amz-Security-Token',
        ],
      },
    });

    // Define API resources
    const topicsResource = api.root.addResource('topics');
    const topicResource = topicsResource.addResource('{topicId}');
    const messagesResource = topicResource.addResource('messages');
    const consumerGroupsResource = api.root.addResource('consumer-groups');
    const metricsResource = api.root.addResource('metrics');

    // Define API methods
    
    // Topics endpoints
    topicsResource.addMethod('POST', new apigateway.LambdaIntegration(createTopicFunction));
    topicsResource.addMethod('GET', new apigateway.LambdaIntegration(listTopicsFunction));
    topicResource.addMethod('DELETE', new apigateway.LambdaIntegration(deleteTopicFunction));
    
    // Messages endpoints
    messagesResource.addMethod('POST', new apigateway.LambdaIntegration(publishMessageFunction));
    messagesResource.addMethod('GET', new apigateway.LambdaIntegration(consumeMessagesFunction));
    
    // Consumer Groups endpoints
    consumerGroupsResource.addMethod('POST', new apigateway.LambdaIntegration(createConsumerGroupFunction));
    consumerGroupsResource.addMethod('GET', new apigateway.LambdaIntegration(listConsumerGroupsFunction));
    
    // Metrics endpoint
    metricsResource.addMethod('GET', new apigateway.LambdaIntegration(getMetricsFunction));

    // Store API references
    this.apis = {
      mainApi: api,
    };

    // Outputs
    new cdk.CfnOutput(this, 'ApiEndpoint', {
      value: api.url,
      description: 'The endpoint URL of the API',
      exportName: `${id}-ApiEndpoint`,
    });
  }
}