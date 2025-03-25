import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as cloudwatchActions from 'aws-cdk-lib/aws-cloudwatch-actions';

interface MonitoringStackProps extends cdk.StackProps {
  stage: string;
  apis: {
    mainApi: apigateway.RestApi;
  };
  functions: {
    [key: string]: lambda.Function;
  };
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

export class MonitoringStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: MonitoringStackProps) {
    super(scope, id, props);

    const { apis, functions, tables, buckets, stage } = props;

    // Create SNS Topic for alarms
    const alarmTopic = new sns.Topic(this, 'AlarmTopic', {
      topicName: `MicroQueue-Alarms-${stage}`,
      displayName: `MicroQueue Mini Alarms (${stage})`,
    });

    // Create CloudWatch Dashboard
    const dashboard = new cloudwatch.Dashboard(this, 'MicroQueueDashboard', {
      dashboardName: `MicroQueue-Dashboard-${stage}`,
    });

    // API Gateway Metrics
    const apiMetricsWidget = new cloudwatch.GraphWidget({
      title: 'API Gateway',
      left: [
        new cloudwatch.Metric({
          namespace: 'AWS/ApiGateway',
          metricName: 'Count',
          dimensionsMap: {
            ApiName: apis.mainApi.restApiName,
            Stage: stage,
          },
          statistic: 'Sum',
          period: cdk.Duration.minutes(1),
        }),
        new cloudwatch.Metric({
          namespace: 'AWS/ApiGateway',
          metricName: '4XXError',
          dimensionsMap: {
            ApiName: apis.mainApi.restApiName,
            Stage: stage,
          },
          statistic: 'Sum',
          period: cdk.Duration.minutes(1),
        }),
        new cloudwatch.Metric({
          namespace: 'AWS/ApiGateway',
          metricName: '5XXError',
          dimensionsMap: {
            ApiName: apis.mainApi.restApiName,
            Stage: stage,
          },
          statistic: 'Sum',
          period: cdk.Duration.minutes(1),
        }),
      ],
      right: [
        new cloudwatch.Metric({
          namespace: 'AWS/ApiGateway',
          metricName: 'Latency',
          dimensionsMap: {
            ApiName: apis.mainApi.restApiName,
            Stage: stage,
          },
          statistic: 'Average',
          period: cdk.Duration.minutes(1),
        }),
        new cloudwatch.Metric({
          namespace: 'AWS/ApiGateway',
          metricName: 'IntegrationLatency',
          dimensionsMap: {
            ApiName: apis.mainApi.restApiName,
            Stage: stage,
          },
          statistic: 'Average',
          period: cdk.Duration.minutes(1),
        }),
      ],
      width: 24,
      height: 6,
    });

    // Lambda Metrics
    const lambdaMetricsWidgets = Object.entries(functions).map(([name, fn]) => {
      return new cloudwatch.GraphWidget({
        title: `Lambda - ${name}`,
        left: [
          new cloudwatch.Metric({
            namespace: 'AWS/Lambda',
            metricName: 'Invocations',
            dimensionsMap: {
              FunctionName: fn.functionName,
            },
            statistic: 'Sum',
            period: cdk.Duration.minutes(1),
          }),
          new cloudwatch.Metric({
            namespace: 'AWS/Lambda',
            metricName: 'Errors',
            dimensionsMap: {
              FunctionName: fn.functionName,
            },
            statistic: 'Sum',
            period: cdk.Duration.minutes(1),
          }),
        ],
        right: [
          new cloudwatch.Metric({
            namespace: 'AWS/Lambda',
            metricName: 'Duration',
            dimensionsMap: {
              FunctionName: fn.functionName,
            },
            statistic: 'Average',
            period: cdk.Duration.minutes(1),
          }),
          new cloudwatch.Metric({
            namespace: 'AWS/Lambda',
            metricName: 'Throttles',
            dimensionsMap: {
              FunctionName: fn.functionName,
            },
            statistic: 'Sum',
            period: cdk.Duration.minutes(1),
          }),
        ],
        width: 12,
        height: 6,
      });
    });

    // DynamoDB Metrics
    const dynamoDbMetricsWidgets = Object.entries(tables).map(([name, table]) => {
      return new cloudwatch.GraphWidget({
        title: `DynamoDB - ${name}`,
        left: [
          new cloudwatch.Metric({
            namespace: 'AWS/DynamoDB',
            metricName: 'ConsumedReadCapacityUnits',
            dimensionsMap: {
              TableName: table.tableName,
            },
            statistic: 'Sum',
            period: cdk.Duration.minutes(1),
          }),
          new cloudwatch.Metric({
            namespace: 'AWS/DynamoDB',
            metricName: 'ConsumedWriteCapacityUnits',
            dimensionsMap: {
              TableName: table.tableName,
            },
            statistic: 'Sum',
            period: cdk.Duration.minutes(1),
          }),
        ],
        right: [
          new cloudwatch.Metric({
            namespace: 'AWS/DynamoDB',
            metricName: 'ThrottledRequests',
            dimensionsMap: {
              TableName: table.tableName,
            },
            statistic: 'Sum',
            period: cdk.Duration.minutes(1),
          }),
          new cloudwatch.Metric({
            namespace: 'AWS/DynamoDB',
            metricName: 'SuccessfulRequestLatency',
            dimensionsMap: {
              TableName: table.tableName,
            },
            statistic: 'Average',
            period: cdk.Duration.minutes(1),
          }),
        ],
        width: 12,
        height: 6,
      });
    });

    // S3 Bucket Metrics
    const s3MetricsWidgets = Object.entries(buckets).map(([name, bucket]) => {
      return new cloudwatch.GraphWidget({
        title: `S3 - ${name}`,
        left: [
          new cloudwatch.Metric({
            namespace: 'AWS/S3',
            metricName: 'AllRequests',
            dimensionsMap: {
              BucketName: bucket.bucketName,
            },
            statistic: 'Sum',
            period: cdk.Duration.minutes(1),
          }),
          new cloudwatch.Metric({
            namespace: 'AWS/S3',
            metricName: 'GetRequests',
            dimensionsMap: {
              BucketName: bucket.bucketName,
            },
            statistic: 'Sum',
            period: cdk.Duration.minutes(1),
          }),
          new cloudwatch.Metric({
            namespace: 'AWS/S3',
            metricName: 'PutRequests',
            dimensionsMap: {
              BucketName: bucket.bucketName,
            },
            statistic: 'Sum',
            period: cdk.Duration.minutes(1),
          }),
        ],
        right: [
          new cloudwatch.Metric({
            namespace: 'AWS/S3',
            metricName: '4xxErrors',
            dimensionsMap: {
              BucketName: bucket.bucketName,
            },
            statistic: 'Sum',
            period: cdk.Duration.minutes(1),
          }),
          new cloudwatch.Metric({
            namespace: 'AWS/S3',
            metricName: '5xxErrors',
            dimensionsMap: {
              BucketName: bucket.bucketName,
            },
            statistic: 'Sum',
            period: cdk.Duration.minutes(1),
          }),
          new cloudwatch.Metric({
            namespace: 'AWS/S3',
            metricName: 'FirstByteLatency',
            dimensionsMap: {
              BucketName: bucket.bucketName,
            },
            statistic: 'Average',
            period: cdk.Duration.minutes(1),
          }),
        ],
        width: 12,
        height: 6,
      });
    });

    // Add all widgets to dashboard
    dashboard.addWidgets(apiMetricsWidget);
    
    // Add Lambda widgets in rows of 2
    for (let i = 0; i < lambdaMetricsWidgets.length; i += 2) {
      dashboard.addWidgets(...lambdaMetricsWidgets.slice(i, Math.min(i + 2, lambdaMetricsWidgets.length)));
    }
    
    // Add DynamoDB widgets in rows of 2
    for (let i = 0; i < dynamoDbMetricsWidgets.length; i += 2) {
      dashboard.addWidgets(...dynamoDbMetricsWidgets.slice(i, Math.min(i + 2, dynamoDbMetricsWidgets.length)));
    }
    
    // Add S3 widgets in rows of 2
    for (let i = 0; i < s3MetricsWidgets.length; i += 2) {
      dashboard.addWidgets(...s3MetricsWidgets.slice(i, Math.min(i + 2, s3MetricsWidgets.length)));
    }
    
    // Create Alarms
    
    // API Gateway 5XX Error Alarm
    const api5xxAlarm = new cloudwatch.Alarm(this, 'Api5xxErrorAlarm', {
      alarmName: `MicroQueue-API-5XX-${stage}`,
      alarmDescription: 'API Gateway 5XX Error Rate exceeds threshold',
      metric: new cloudwatch.Metric({
        namespace: 'AWS/ApiGateway',
        metricName: '5XXError',
        dimensionsMap: {
          ApiName: apis.mainApi.restApiName,
          Stage: stage,
        },
        statistic: 'Sum',
        period: cdk.Duration.minutes(1),
      }),
      threshold: 5,
      evaluationPeriods: 3,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    });
    api5xxAlarm.addAlarmAction(new cloudwatchActions.SnsAction(alarmTopic));
    
    // Lambda Error Rate Alarms for critical functions
    ['publishMessage', 'consumeMessages'].forEach(funcName => {
      const fn = functions[funcName];
      const errorAlarm = new cloudwatch.Alarm(this, `${funcName}ErrorAlarm`, {
        alarmName: `MicroQueue-${funcName}-Errors-${stage}`,
        alarmDescription: `${funcName} Lambda Error Rate exceeds threshold`,
        metric: new cloudwatch.Metric({
          namespace: 'AWS/Lambda',
          metricName: 'Errors',
          dimensionsMap: {
            FunctionName: fn.functionName,
          },
          statistic: 'Sum',
          period: cdk.Duration.minutes(1),
        }),
        threshold: 3,
        evaluationPeriods: 2,
        comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
        treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
      });
      errorAlarm.addAlarmAction(new cloudwatchActions.SnsAction(alarmTopic));
    });
    
    // DynamoDB Throttle Alarm
    Object.entries(tables).forEach(([name, table]) => {
      const throttleAlarm = new cloudwatch.Alarm(this, `${name}ThrottleAlarm`, {
        alarmName: `MicroQueue-${name}-Throttles-${stage}`,
        alarmDescription: `${name} DynamoDB Throttled Requests exceeds threshold`,
        metric: new cloudwatch.Metric({
          namespace: 'AWS/DynamoDB',
          metricName: 'ThrottledRequests',
          dimensionsMap: {
            TableName: table.tableName,
          },
          statistic: 'Sum',
          period: cdk.Duration.minutes(5),
        }),
        threshold: 5,
        evaluationPeriods: 3,
        comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
        treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
      });
      throttleAlarm.addAlarmAction(new cloudwatchActions.SnsAction(alarmTopic));
    });
    
    // Output alarms topic ARN
    new cdk.CfnOutput(this, 'AlarmTopicArn', {
      value: alarmTopic.topicArn,
      description: 'The ARN of the SNS topic for alarms',
      exportName: `${id}-AlarmTopicArn`,
    });
  }
}