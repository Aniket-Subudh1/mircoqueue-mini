"use strict";var ce=Object.create;var D=Object.defineProperty;var ue=Object.getOwnPropertyDescriptor;var le=Object.getOwnPropertyNames;var pe=Object.getPrototypeOf,me=Object.prototype.hasOwnProperty;var X=(e,t)=>()=>(t||e((t={exports:{}}).exports,t),t.exports),Ee=(e,t)=>{for(var s in t)D(e,s,{get:t[s],enumerable:!0})},W=(e,t,s,r)=>{if(t&&typeof t=="object"||typeof t=="function")for(let n of le(t))!me.call(e,n)&&n!==s&&D(e,n,{get:()=>t[n],enumerable:!(r=ue(t,n))||r.enumerable});return e};var F=(e,t,s)=>(s=e!=null?ce(pe(e)):{},W(t||!e||!e.__esModule?D(s,"default",{value:e,enumerable:!0}):s,e)),de=e=>W(D({},"__esModule",{value:!0}),e);var Q=X((He,ge)=>{ge.exports={name:"dotenv",version:"16.4.7",description:"Loads environment variables from .env file",main:"lib/main.js",types:"lib/main.d.ts",exports:{".":{types:"./lib/main.d.ts",require:"./lib/main.js",default:"./lib/main.js"},"./config":"./config.js","./config.js":"./config.js","./lib/env-options":"./lib/env-options.js","./lib/env-options.js":"./lib/env-options.js","./lib/cli-options":"./lib/cli-options.js","./lib/cli-options.js":"./lib/cli-options.js","./package.json":"./package.json"},scripts:{"dts-check":"tsc --project tests/types/tsconfig.json",lint:"standard",pretest:"npm run lint && npm run dts-check",test:"tap run --allow-empty-coverage --disable-coverage --timeout=60000","test:coverage":"tap run --show-full-coverage --timeout=60000 --coverage-report=lcov",prerelease:"npm test",release:"standard-version"},repository:{type:"git",url:"git://github.com/motdotla/dotenv.git"},funding:"https://dotenvx.com",keywords:["dotenv","env",".env","environment","variables","config","settings"],readmeFilename:"README.md",license:"BSD-2-Clause",devDependencies:{"@types/node":"^18.11.3",decache:"^4.6.2",sinon:"^14.0.1",standard:"^17.0.0","standard-version":"^9.5.0",tap:"^19.2.0",typescript:"^4.8.4"},engines:{node:">=12"},browser:{fs:!1}}});var Y=X((Je,_)=>{var G=require("fs"),$=require("path"),Te=require("os"),Ne=require("crypto"),Se=Q(),B=Se.version,_e=/(?:^|^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\\'|[^'])*'|\s*"(?:\\"|[^"])*"|\s*`(?:\\`|[^`])*`|[^#\r\n]+)?\s*(?:#.*)?(?:$|$)/mg;function Oe(e){let t={},s=e.toString();s=s.replace(/\r\n?/mg,`
`);let r;for(;(r=_e.exec(s))!=null;){let n=r[1],o=r[2]||"";o=o.trim();let i=o[0];o=o.replace(/^(['"`])([\s\S]*)\1$/mg,"$2"),i==='"'&&(o=o.replace(/\\n/g,`
`),o=o.replace(/\\r/g,"\r")),t[n]=o}return t}function Ae(e){let t=Z(e),s=p.configDotenv({path:t});if(!s.parsed){let i=new Error(`MISSING_DATA: Cannot parse ${t} for an unknown reason`);throw i.code="MISSING_DATA",i}let r=J(e).split(","),n=r.length,o;for(let i=0;i<n;i++)try{let a=r[i].trim(),m=he(s,a);o=p.decrypt(m.ciphertext,m.key);break}catch(a){if(i+1>=n)throw a}return p.parse(o)}function fe(e){console.log(`[dotenv@${B}][INFO] ${e}`)}function Re(e){console.log(`[dotenv@${B}][WARN] ${e}`)}function b(e){console.log(`[dotenv@${B}][DEBUG] ${e}`)}function J(e){return e&&e.DOTENV_KEY&&e.DOTENV_KEY.length>0?e.DOTENV_KEY:process.env.DOTENV_KEY&&process.env.DOTENV_KEY.length>0?process.env.DOTENV_KEY:""}function he(e,t){let s;try{s=new URL(t)}catch(a){if(a.code==="ERR_INVALID_URL"){let m=new Error("INVALID_DOTENV_KEY: Wrong format. Must be in valid uri format like dotenv://:key_1234@dotenvx.com/vault/.env.vault?environment=development");throw m.code="INVALID_DOTENV_KEY",m}throw a}let r=s.password;if(!r){let a=new Error("INVALID_DOTENV_KEY: Missing key part");throw a.code="INVALID_DOTENV_KEY",a}let n=s.searchParams.get("environment");if(!n){let a=new Error("INVALID_DOTENV_KEY: Missing environment part");throw a.code="INVALID_DOTENV_KEY",a}let o=`DOTENV_VAULT_${n.toUpperCase()}`,i=e.parsed[o];if(!i){let a=new Error(`NOT_FOUND_DOTENV_ENVIRONMENT: Cannot locate environment ${o} in your .env.vault file.`);throw a.code="NOT_FOUND_DOTENV_ENVIRONMENT",a}return{ciphertext:i,key:r}}function Z(e){let t=null;if(e&&e.path&&e.path.length>0)if(Array.isArray(e.path))for(let s of e.path)G.existsSync(s)&&(t=s.endsWith(".vault")?s:`${s}.vault`);else t=e.path.endsWith(".vault")?e.path:`${e.path}.vault`;else t=$.resolve(process.cwd(),".env.vault");return G.existsSync(t)?t:null}function H(e){return e[0]==="~"?$.join(Te.homedir(),e.slice(1)):e}function Ce(e){fe("Loading env from encrypted .env.vault");let t=p._parseVault(e),s=process.env;return e&&e.processEnv!=null&&(s=e.processEnv),p.populate(s,t,e),{parsed:t}}function Ie(e){let t=$.resolve(process.cwd(),".env"),s="utf8",r=Boolean(e&&e.debug);e&&e.encoding?s=e.encoding:r&&b("No encoding is specified. UTF-8 is used by default");let n=[t];if(e&&e.path)if(!Array.isArray(e.path))n=[H(e.path)];else{n=[];for(let m of e.path)n.push(H(m))}let o,i={};for(let m of n)try{let N=p.parse(G.readFileSync(m,{encoding:s}));p.populate(i,N,e)}catch(N){r&&b(`Failed to load ${m} ${N.message}`),o=N}let a=process.env;return e&&e.processEnv!=null&&(a=e.processEnv),p.populate(a,i,e),o?{parsed:i,error:o}:{parsed:i}}function Me(e){if(J(e).length===0)return p.configDotenv(e);let t=Z(e);return t?p._configVault(e):(Re(`You set DOTENV_KEY but you are missing a .env.vault file at ${t}. Did you forget to build it?`),p.configDotenv(e))}function ye(e,t){let s=Buffer.from(t.slice(-64),"hex"),r=Buffer.from(e,"base64"),n=r.subarray(0,12),o=r.subarray(-16);r=r.subarray(12,-16);try{let i=Ne.createDecipheriv("aes-256-gcm",s,n);return i.setAuthTag(o),`${i.update(r)}${i.final()}`}catch(i){let a=i instanceof RangeError,m=i.message==="Invalid key length",N=i.message==="Unsupported state or unable to authenticate data";if(a||m){let S=new Error("INVALID_DOTENV_KEY: It must be 64 characters long (or more)");throw S.code="INVALID_DOTENV_KEY",S}else if(N){let S=new Error("DECRYPTION_FAILED: Please check your DOTENV_KEY");throw S.code="DECRYPTION_FAILED",S}else throw i}}function ve(e,t,s={}){let r=Boolean(s&&s.debug),n=Boolean(s&&s.override);if(typeof t!="object"){let o=new Error("OBJECT_REQUIRED: Please check the processEnv argument being passed to populate");throw o.code="OBJECT_REQUIRED",o}for(let o of Object.keys(t))Object.prototype.hasOwnProperty.call(e,o)?(n===!0&&(e[o]=t[o]),r&&b(n===!0?`"${o}" is already defined and WAS overwritten`:`"${o}" is already defined and was NOT overwritten`)):e[o]=t[o]}var p={configDotenv:Ie,_configVault:Ce,_parseVault:Ae,config:Me,decrypt:ye,parse:Oe,populate:ve};_.exports.configDotenv=p.configDotenv;_.exports._configVault=p._configVault;_.exports._parseVault=p._parseVault;_.exports.config=p.config;_.exports.decrypt=p.decrypt;_.exports.parse=p.parse;_.exports.populate=p.populate;_.exports=p});var We={};Ee(We,{handler:()=>Xe});module.exports=de(We);var ee=require("aws-sdk"),te=F(Y());te.config();var se={region:process.env.AWS_REGION||"us-east-1",maxRetries:3,httpOptions:{timeout:5e3},...process.env.IS_LOCAL&&{accessKeyId:"localstack",secretAccessKey:"localstack"}};process.env.DYNAMODB_ENDPOINT&&(console.log(`Using local DynamoDB endpoint: ${process.env.DYNAMODB_ENDPOINT}`),se.endpoint=process.env.DYNAMODB_ENDPOINT);var c=new ee.DynamoDB.DocumentClient(se);var De={DEV:"dev",STAGING:"staging",PROD:"prod"},I=process.env.STAGE||De.DEV,u={TOPICS:process.env.TOPICS_TABLE||`MicroQueue-Topics-${I}`,MESSAGES:process.env.MESSAGES_TABLE||`MicroQueue-Messages-${I}`,CONSUMER_GROUPS:process.env.CONSUMER_GROUPS_TABLE||`MicroQueue-ConsumerGroups-${I}`,OFFSETS:process.env.OFFSETS_TABLE||`MicroQueue-Offsets-${I}`},et={MESSAGES:process.env.MESSAGES_BUCKET||`microqueue-messages-${I}`,ARCHIVE:process.env.ARCHIVE_BUCKET||`microqueue-archive-${I}`},tt={MAX_TOPIC_NAME_LENGTH:100,MAX_DESCRIPTION_LENGTH:500,MAX_MESSAGE_SIZE_BYTES:256*1024,MAX_METADATA_KEYS:10,MAX_METADATA_KEY_LENGTH:128,MAX_METADATA_VALUE_LENGTH:256,MAX_RETENTION_HOURS:7*24,DEFAULT_RETENTION_HOURS:24,MAX_MESSAGES_PER_CONSUME:100,DEFAULT_MESSAGES_PER_CONSUME:10,MAX_WAIT_TIME_SECONDS:20,DEFAULT_WAIT_TIME_SECONDS:0},d={INTERNAL_ERROR:"INTERNAL_ERROR",VALIDATION_ERROR:"VALIDATION_ERROR",RESOURCE_NOT_FOUND:"RESOURCE_NOT_FOUND",TOPIC_NOT_FOUND:"TOPIC_NOT_FOUND",TOPIC_ALREADY_EXISTS:"TOPIC_ALREADY_EXISTS",MESSAGE_NOT_FOUND:"MESSAGE_NOT_FOUND",MESSAGE_TOO_LARGE:"MESSAGE_TOO_LARGE",INVALID_MESSAGE_FORMAT:"INVALID_MESSAGE_FORMAT",CONSUMER_GROUP_NOT_FOUND:"CONSUMER_GROUP_NOT_FOUND",CONSUMER_GROUP_ALREADY_EXISTS:"CONSUMER_GROUP_ALREADY_EXISTS",RATE_LIMIT_EXCEEDED:"RATE_LIMIT_EXCEEDED",SERVICE_UNAVAILABLE:"SERVICE_UNAVAILABLE"},g={OK:200,CREATED:201,BAD_REQUEST:400,UNAUTHORIZED:401,FORBIDDEN:403,NOT_FOUND:404,CONFLICT:409,PAYLOAD_TOO_LARGE:413,UNPROCESSABLE_ENTITY:422,TOO_MANY_REQUESTS:429,INTERNAL_SERVER_ERROR:500,SERVICE_UNAVAILABLE:503};var oe=F(Y());oe.config();var be={error:0,warn:1,info:2,debug:3},xe=process.env.LOG_LEVEL||"info",we=process.env.LOG_FORMAT||"json",x=be[xe]||2,w=(e,t,s)=>{let r=new Date().toISOString(),n=process.env.AWS_REQUEST_ID||"-";if(we==="json"){let i={timestamp:r,level:e,message:t,requestId:n,service:"MicroQueue-Mini",version:"1.0.0",env:process.env.STAGE||"dev",...s?{data:s}:{}};return JSON.stringify(i)}let o=`[${r}] [${e.toUpperCase()}] [${n}] ${t}`;return s&&(o+=` ${JSON.stringify(s)}`),o},K=class{error(t,s){x>=0&&console.error(w("error",t,s))}warn(t,s){x>=1&&console.warn(w("warn",t,s))}info(t,s){x>=2&&console.info(w("info",t,s))}debug(t,s){x>=3&&console.debug(w("debug",t,s))}},l=new K,T=l;var E=class extends Error{constructor(s,r,n,o){super(r);this.code=s,this.statusCode=n,this.details=o,this.name="AppError",Error.captureStackTrace&&Error.captureStackTrace(this,E)}toResponse(){return{success:!1,error:{code:this.code,message:this.message,details:this.details}}}},O={internalError:(e="An internal server error occurred",t)=>new E(d.INTERNAL_ERROR,e,g.INTERNAL_SERVER_ERROR,t),validationError:(e="Validation error",t)=>new E(d.VALIDATION_ERROR,e,g.BAD_REQUEST,t),resourceNotFound:(e,t)=>new E(d.RESOURCE_NOT_FOUND,`${e} with id '${t}' not found`,g.NOT_FOUND),topicNotFound:e=>new E(d.TOPIC_NOT_FOUND,`Topic '${e}' not found`,g.NOT_FOUND),topicAlreadyExists:e=>new E(d.TOPIC_ALREADY_EXISTS,`Topic with name '${e}' already exists`,g.CONFLICT),messageNotFound:e=>new E(d.MESSAGE_NOT_FOUND,`Message '${e}' not found`,g.NOT_FOUND),messageTooLarge:(e,t)=>new E(d.MESSAGE_TOO_LARGE,`Message size (${e} bytes) exceeds maximum allowed size (${t} bytes)`,g.PAYLOAD_TOO_LARGE),consumerGroupNotFound:e=>new E(d.CONSUMER_GROUP_NOT_FOUND,`Consumer group '${e}' not found`,g.NOT_FOUND),consumerGroupAlreadyExists:(e,t)=>new E(d.CONSUMER_GROUP_ALREADY_EXISTS,`Consumer group with name '${e}' already exists for topic '${t}'`,g.CONFLICT),rateLimitExceeded:()=>new E(d.RATE_LIMIT_EXCEEDED,"Rate limit exceeded",g.TOO_MANY_REQUESTS),serviceUnavailable:(e="Service temporarily unavailable")=>new E(d.SERVICE_UNAVAILABLE,e,g.SERVICE_UNAVAILABLE)};var re=F(require("aws-sdk")),Ue=new re.default.CloudWatch,Le=async e=>{l.debug("Calculating topic metrics",{topicId:e});try{let t=await c.get({TableName:u.TOPICS,Key:{topicId:e}}).promise();if(!t.Item)throw O.topicNotFound(e);let s=t.Item,r=Date.now()-60*60*1e3,i=((await c.scan({TableName:u.MESSAGES,FilterExpression:"#ts >= :ts",ExpressionAttributeNames:{"#ts":"timestamp"},ExpressionAttributeValues:{":ts":r},Select:"COUNT"}).promise()).Count||0)/60,m=((await c.query({TableName:u.MESSAGES,KeyConditionExpression:"topicId = :topicId AND sequenceNumber >= :minSeq",ExpressionAttributeValues:{":topicId":e,":minSeq":0},Limit:100,ScanIndexForward:!1,ProjectionExpression:"#size",ExpressionAttributeNames:{"#size":"size"}}).promise()).Items||[]).map(h=>h.size||0),N=m.reduce((h,V)=>h+V,0),S=m.length>0?Math.round(N/m.length):0,y=await c.query({TableName:u.MESSAGES,KeyConditionExpression:"topicId = :topicId AND sequenceNumber >= :minSeq",ExpressionAttributeValues:{":topicId":e,":minSeq":0},Limit:1,ScanIndexForward:!0,ProjectionExpression:"#ts",ExpressionAttributeNames:{"#ts":"timestamp"}}).promise(),f=await c.query({TableName:u.MESSAGES,KeyConditionExpression:"topicId = :topicId AND sequenceNumber >= :minSeq",ExpressionAttributeValues:{":topicId":e,":minSeq":0},Limit:1,ScanIndexForward:!1,ProjectionExpression:"#ts",ExpressionAttributeNames:{"#ts":"timestamp"}}).promise(),U=y.Items&&y.Items.length>0?y.Items[0].timestamp:0,v=f.Items&&f.Items.length>0?f.Items[0].timestamp:0,R=(await c.scan({TableName:u.CONSUMER_GROUPS,FilterExpression:"topicId = :topicId",ExpressionAttributeValues:{":topicId":e}}).promise()).Items||[],A=0;for(let h of R){let V=h.groupId,P=await c.get({TableName:u.OFFSETS,Key:{groupId:V,topicId:e}}).promise();if(P.Item){let q=P.Item.lastConsumedTimestamp||0,ae=P.Item.lastSequenceNumber||0;if(q>r){let z=(q-s.createdAt)/36e5;z>0&&(A+=ae/(z*60))}}}let L=R.length>0?A/R.length:0;return{topicId:e,name:s.name,messageCount:s.messageCount||0,publishRate:i,consumeRate:L,averageMessageSize:S,oldestMessage:U,newestMessage:v}}catch(t){throw l.error("Error calculating topic metrics",{error:t,topicId:e}),t}},Ve=async()=>{l.debug("Calculating system metrics");try{let[e,t,s]=await Promise.all([c.scan({TableName:u.TOPICS,Select:"COUNT"}).promise(),c.scan({TableName:u.MESSAGES,Select:"COUNT"}).promise(),c.scan({TableName:u.CONSUMER_GROUPS,Select:"COUNT"}).promise()]),r=e.Count||0,n=t.Count||0,o=s.Count||0,i=Date.now()-60*60*1e3,N=((await c.scan({TableName:u.MESSAGES,FilterExpression:"#ts >= :ts",ExpressionAttributeNames:{"#ts":"timestamp"},ExpressionAttributeValues:{":ts":i},Select:"COUNT"}).promise()).Count||0)/60,S=0,f=(await c.scan({TableName:u.OFFSETS,Limit:100}).promise()).Items||[];for(let A of f)A.lastConsumedTimestamp>i&&(S+=A.lastSequenceNumber||0);let U=f.length>0?S/f.length/60:0,v=0,R=((await c.scan({TableName:u.MESSAGES,Limit:100,ProjectionExpression:"#size",ExpressionAttributeNames:{"#size":"size"}}).promise()).Items||[]).map(A=>A.size||0);return R.length>0&&(v=R.reduce((L,h)=>L+h,0)/R.length*n),{totalTopics:r,totalMessages:n,totalConsumerGroups:o,averagePublishRate:N,averageConsumeRate:U,storageUsed:v}}catch(e){throw l.error("Error calculating system metrics",{error:e}),e}},Pe=async(e=[],t)=>{try{let s=new Date,r=[];for(let o of e)r.push({MetricName:"MessageCount",Dimensions:[{Name:"TopicId",Value:o.topicId},{Name:"TopicName",Value:o.name}],Value:o.messageCount,Timestamp:s,Unit:"Count"},{MetricName:"PublishRate",Dimensions:[{Name:"TopicId",Value:o.topicId},{Name:"TopicName",Value:o.name}],Value:o.publishRate,Timestamp:s,Unit:"Count/Minute"},{MetricName:"ConsumeRate",Dimensions:[{Name:"TopicId",Value:o.topicId},{Name:"TopicName",Value:o.name}],Value:o.consumeRate,Timestamp:s,Unit:"Count/Minute"},{MetricName:"AverageMessageSize",Dimensions:[{Name:"TopicId",Value:o.topicId},{Name:"TopicName",Value:o.name}],Value:o.averageMessageSize,Timestamp:s,Unit:"Bytes"});t&&r.push({MetricName:"TotalTopics",Value:t.totalTopics,Timestamp:s,Unit:"Count"},{MetricName:"TotalMessages",Value:t.totalMessages,Timestamp:s,Unit:"Count"},{MetricName:"TotalConsumerGroups",Value:t.totalConsumerGroups,Timestamp:s,Unit:"Count"},{MetricName:"AveragePublishRate",Value:t.averagePublishRate,Timestamp:s,Unit:"Count/Minute"},{MetricName:"AverageConsumeRate",Value:t.averageConsumeRate,Timestamp:s,Unit:"Count/Minute"},{MetricName:"StorageUsed",Value:t.storageUsed,Timestamp:s,Unit:"Bytes"});let n=20;for(let o=0;o<r.length;o+=n){let i=r.slice(o,o+n);await Ue.putMetricData({Namespace:"MicroQueue",MetricData:i}).promise()}}catch(s){throw l.error("Error pushing metrics to CloudWatch",{error:s}),s}},C={calculateTopicMetrics:Le,calculateSystemMetrics:Ve,pushMetricsToCloudWatch:Pe};var Fe=async e=>{l.debug("Creating topic",{topicId:e.topicId});try{return await c.put({TableName:u.TOPICS,Item:e,ConditionExpression:"attribute_not_exists(topicId)"}).promise(),e}catch(t){throw l.error("Error creating topic",{error:t,topic:e}),t.code==="ConditionalCheckFailedException"?O.topicAlreadyExists(e.name):t}},j=async e=>{l.debug("Getting topic",{topicId:e});try{let t=await c.get({TableName:u.TOPICS,Key:{topicId:e}}).promise();if(!t.Item)throw O.topicNotFound(e);return t.Item}catch(t){throw l.error("Error getting topic",{error:t,topicId:e}),t.code==="ResourceNotFoundException"?O.topicNotFound(e):t}},Ge=async e=>{l.debug("Getting topic by name",{name:e});try{let t=await c.scan({TableName:u.TOPICS,FilterExpression:"#name = :name",ExpressionAttributeNames:{"#name":"name"},ExpressionAttributeValues:{":name":e},Limit:1}).promise();return t.Items&&t.Items.length>0?t.Items[0]:null}catch(t){throw l.error("Error getting topic by name",{error:t,name:e}),t}},$e=async()=>{l.debug("Listing topics");try{return(await c.scan({TableName:u.TOPICS}).promise()).Items||[]}catch(e){throw l.error("Error listing topics",{error:e}),e}},Be=async e=>{l.debug("Deleting topic",{topicId:e});try{await c.delete({TableName:u.TOPICS,Key:{topicId:e},ConditionExpression:"attribute_exists(topicId)"}).promise()}catch(t){throw l.error("Error deleting topic",{error:t,topicId:e}),t.code==="ConditionalCheckFailedException"?O.topicNotFound(e):t}},Ye=async(e,t)=>{l.debug("Incrementing topic message count",{topicId:e,timestamp:t});try{await c.update({TableName:u.TOPICS,Key:{topicId:e},UpdateExpression:"SET messageCount = messageCount + :inc, lastMessageTimestamp = :ts",ExpressionAttributeValues:{":inc":1,":ts":t},ConditionExpression:"attribute_exists(topicId)"}).promise()}catch(s){throw l.error("Error incrementing message count",{error:s,topicId:e}),s.code==="ConditionalCheckFailedException"?O.topicNotFound(e):s}},Ke=async(e,t)=>{l.debug("Updating topic",{topicId:e,updates:t});let s=[],r={},n={};if(Object.entries(t).forEach(([o,i])=>{i!==void 0&&(s.push(`#${o} = :${o}`),r[`#${o}`]=o,n[`:${o}`]=i)}),s.length===0)return j(e);try{return await c.update({TableName:u.TOPICS,Key:{topicId:e},UpdateExpression:`SET ${s.join(", ")}`,ExpressionAttributeNames:r,ExpressionAttributeValues:n,ConditionExpression:"attribute_exists(topicId)",ReturnValues:"NONE"}).promise(),j(e)}catch(o){throw l.error("Error updating topic",{error:o,topicId:e}),o.code==="ConditionalCheckFailedException"?O.topicNotFound(e):o}},M={createTopic:Fe,getTopic:j,getTopicByName:Ge,listTopics:$e,deleteTopic:Be,incrementMessageCount:Ye,updateTopic:Ke};var je=async e=>(T.debug("Getting topic metrics",{topicId:e}),await M.getTopic(e),C.calculateTopicMetrics(e)),ke=async()=>{T.debug("Getting all topic metrics");let t=(await M.listTopics()).map(s=>C.calculateTopicMetrics(s.topicId));return Promise.all(t)},k=async()=>(T.debug("Getting system metrics"),C.calculateSystemMetrics()),qe=async()=>{T.debug("Collecting and publishing metrics");try{let e=await k(),s=(await M.listTopics()).slice(0,10),r=await Promise.all(s.map(n=>C.calculateTopicMetrics(n.topicId)));await C.pushMetricsToCloudWatch(r,e),T.info("Metrics published successfully")}catch(e){T.error("Error collecting and publishing metrics",{error:e})}},ze=async()=>{T.debug("Getting dashboard metrics");let e=await k(),s=(await M.listTopics()).slice(0,20),r=await Promise.all(s.map(n=>C.calculateTopicMetrics(n.topicId)));return r.sort((n,o)=>o.messageCount-n.messageCount),{system:e,topics:r}},ne={getTopicMetrics:je,getAllTopicMetrics:ke,getSystemMetrics:k,collectAndPublishMetrics:qe,getDashboardMetrics:ze};var Xe=async(e,t)=>{T.info("Starting metrics aggregation",{event:e});try{return await ne.collectAndPublishMetrics(),T.info("Metrics aggregation completed"),{success:!0}}catch(s){return T.error("Error during metrics aggregation",{error:s}),{success:!1}}};0&&(module.exports={handler});
//# sourceMappingURL=metrics-aggregator.js.map
