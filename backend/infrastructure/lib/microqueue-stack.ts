import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as path from 'path';

interface MicroQueueStackProps extends cdk.StackProps {
  stage: string;
}

export class MicroQueueStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: MicroQueueStackProps) {
    super(scope, id, props);
    
    const { stage } = props;
    
    // Create S3 bucket for frontend assets
    const websiteBucket = new s3.Bucket(this, 'WebsiteBucket', {
      bucketName: `microqueue-frontend-${stage}-${this.account}`,
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: 'index.html',
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: stage === 'prod' ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: stage !== 'prod',
      cors: [
        {
          allowedMethods: [s3.HttpMethods.GET],
          allowedOrigins: ['*'],
          allowedHeaders: ['*'],
          maxAge: 3000,
        },
      ],
    });

    // CloudFront Origin Access Identity
    const originAccessIdentity = new cloudfront.OriginAccessIdentity(this, 'OriginAccessIdentity', {
      comment: `OAI for MicroQueue Frontend ${stage}`,
    });

    // Grant read permissions to CloudFront
    websiteBucket.grantRead(originAccessIdentity);

    // Import API Gateway URL from ApiStack
    const apiEndpoint = cdk.Fn.importValue(`MicroQueueMini-API-${stage}-ApiEndpoint`);

    // Create CloudFront distribution
    const distribution = new cloudfront.Distribution(this, 'FrontendDistribution', {
      defaultRootObject: 'index.html',
      defaultBehavior: {
        origin: new origins.S3Origin(websiteBucket, {
          originAccessIdentity,
        }),
        compress: true,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
      },
      additionalBehaviors: {
        '/api/*': {
          origin: new origins.HttpOrigin(
            cdk.Fn.select(2, cdk.Fn.split('/', apiEndpoint)), // Extract domain from API Gateway URL
            {
              protocolPolicy: cloudfront.OriginProtocolPolicy.HTTPS_ONLY,
              originPath: `/${stage}`, // Include stage path in API Gateway URL
            }
          ),
          allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
          cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        },
      },
      errorResponses: [
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
        },
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
        },
      ],
      priceClass: cloudfront.PriceClass.PRICE_CLASS_100,
    });

    // Deploy frontend assets (commented out for now as frontend files don't exist yet)
    // Uncomment when frontend is ready
    /*
    new s3deploy.BucketDeployment(this, 'DeployWebsite', {
      sources: [s3deploy.Source.asset(path.join(__dirname, '../../../frontend/build'))],
      destinationBucket: websiteBucket,
      distribution,
      distributionPaths: ['/*'],
    });
    */

    // Outputs
    new cdk.CfnOutput(this, 'FrontendUrl', {
      value: `https://${distribution.distributionDomainName}`,
      description: 'The URL of the frontend website',
      exportName: `${id}-FrontendUrl`,
    });

    new cdk.CfnOutput(this, 'S3BucketName', {
      value: websiteBucket.bucketName,
      description: 'The name of the S3 bucket hosting the frontend',
      exportName: `${id}-S3BucketName`,
    });
  }
}