"use strict";var pe=Object.create;var b=Object.defineProperty;var me=Object.getOwnPropertyDescriptor;var Ee=Object.getOwnPropertyNames;var de=Object.getPrototypeOf,ge=Object.prototype.hasOwnProperty;var z=(e,t)=>()=>(t||e((t={exports:{}}).exports,t),t.exports),Te=(e,t)=>{for(var r in t)b(e,r,{get:t[r],enumerable:!0})},H=(e,t,r,s)=>{if(t&&typeof t=="object"||typeof t=="function")for(let n of Ee(t))!ge.call(e,n)&&n!==r&&b(e,n,{get:()=>t[n],enumerable:!(s=me(t,n))||s.enumerable});return e};var G=(e,t,r)=>(r=e!=null?pe(de(e)):{},H(t||!e||!e.__esModule?b(r,"default",{value:e,enumerable:!0}):r,e)),Ne=e=>H(b({},"__esModule",{value:!0}),e);var J=z((lt,Ae)=>{Ae.exports={name:"dotenv",version:"16.4.7",description:"Loads environment variables from .env file",main:"lib/main.js",types:"lib/main.d.ts",exports:{".":{types:"./lib/main.d.ts",require:"./lib/main.js",default:"./lib/main.js"},"./config":"./config.js","./config.js":"./config.js","./lib/env-options":"./lib/env-options.js","./lib/env-options.js":"./lib/env-options.js","./lib/cli-options":"./lib/cli-options.js","./lib/cli-options.js":"./lib/cli-options.js","./package.json":"./package.json"},scripts:{"dts-check":"tsc --project tests/types/tsconfig.json",lint:"standard",pretest:"npm run lint && npm run dts-check",test:"tap run --allow-empty-coverage --disable-coverage --timeout=60000","test:coverage":"tap run --show-full-coverage --timeout=60000 --coverage-report=lcov",prerelease:"npm test",release:"standard-version"},repository:{type:"git",url:"git://github.com/motdotla/dotenv.git"},funding:"https://dotenvx.com",keywords:["dotenv","env",".env","environment","variables","config","settings"],readmeFilename:"README.md",license:"BSD-2-Clause",devDependencies:{"@types/node":"^18.11.3",decache:"^4.6.2",sinon:"^14.0.1",standard:"^17.0.0","standard-version":"^9.5.0",tap:"^19.2.0",typescript:"^4.8.4"},engines:{node:">=12"},browser:{fs:!1}}});var Y=z((pt,f)=>{var F=require("fs"),$=require("path"),Oe=require("os"),Re=require("crypto"),he=J(),B=he.version,ye=/(?:^|^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\\'|[^'])*'|\s*"(?:\\"|[^"])*"|\s*`(?:\\`|[^`])*`|[^#\r\n]+)?\s*(?:#.*)?(?:$|$)/mg;function Me(e){let t={},r=e.toString();r=r.replace(/\r\n?/mg,`
`);let s;for(;(s=ye.exec(r))!=null;){let n=s[1],o=s[2]||"";o=o.trim();let i=o[0];o=o.replace(/^(['"`])([\s\S]*)\1$/mg,"$2"),i==='"'&&(o=o.replace(/\\n/g,`
`),o=o.replace(/\\r/g,"\r")),t[n]=o}return t}function Ie(e){let t=te(e),r=p.configDotenv({path:t});if(!r.parsed){let i=new Error(`MISSING_DATA: Cannot parse ${t} for an unknown reason`);throw i.code="MISSING_DATA",i}let s=ee(e).split(","),n=s.length,o;for(let i=0;i<n;i++)try{let a=s[i].trim(),m=be(r,a);o=p.decrypt(m.ciphertext,m.key);break}catch(a){if(i+1>=n)throw a}return p.parse(o)}function Ce(e){console.log(`[dotenv@${B}][INFO] ${e}`)}function ve(e){console.log(`[dotenv@${B}][WARN] ${e}`)}function D(e){console.log(`[dotenv@${B}][DEBUG] ${e}`)}function ee(e){return e&&e.DOTENV_KEY&&e.DOTENV_KEY.length>0?e.DOTENV_KEY:process.env.DOTENV_KEY&&process.env.DOTENV_KEY.length>0?process.env.DOTENV_KEY:""}function be(e,t){let r;try{r=new URL(t)}catch(a){if(a.code==="ERR_INVALID_URL"){let m=new Error("INVALID_DOTENV_KEY: Wrong format. Must be in valid uri format like dotenv://:key_1234@dotenvx.com/vault/.env.vault?environment=development");throw m.code="INVALID_DOTENV_KEY",m}throw a}let s=r.password;if(!s){let a=new Error("INVALID_DOTENV_KEY: Missing key part");throw a.code="INVALID_DOTENV_KEY",a}let n=r.searchParams.get("environment");if(!n){let a=new Error("INVALID_DOTENV_KEY: Missing environment part");throw a.code="INVALID_DOTENV_KEY",a}let o=`DOTENV_VAULT_${n.toUpperCase()}`,i=e.parsed[o];if(!i){let a=new Error(`NOT_FOUND_DOTENV_ENVIRONMENT: Cannot locate environment ${o} in your .env.vault file.`);throw a.code="NOT_FOUND_DOTENV_ENVIRONMENT",a}return{ciphertext:i,key:s}}function te(e){let t=null;if(e&&e.path&&e.path.length>0)if(Array.isArray(e.path))for(let r of e.path)F.existsSync(r)&&(t=r.endsWith(".vault")?r:`${r}.vault`);else t=e.path.endsWith(".vault")?e.path:`${e.path}.vault`;else t=$.resolve(process.cwd(),".env.vault");return F.existsSync(t)?t:null}function Z(e){return e[0]==="~"?$.join(Oe.homedir(),e.slice(1)):e}function De(e){Ce("Loading env from encrypted .env.vault");let t=p._parseVault(e),r=process.env;return e&&e.processEnv!=null&&(r=e.processEnv),p.populate(r,t,e),{parsed:t}}function xe(e){let t=$.resolve(process.cwd(),".env"),r="utf8",s=Boolean(e&&e.debug);e&&e.encoding?r=e.encoding:s&&D("No encoding is specified. UTF-8 is used by default");let n=[t];if(e&&e.path)if(!Array.isArray(e.path))n=[Z(e.path)];else{n=[];for(let m of e.path)n.push(Z(m))}let o,i={};for(let m of n)try{let S=p.parse(F.readFileSync(m,{encoding:r}));p.populate(i,S,e)}catch(S){s&&D(`Failed to load ${m} ${S.message}`),o=S}let a=process.env;return e&&e.processEnv!=null&&(a=e.processEnv),p.populate(a,i,e),o?{parsed:i,error:o}:{parsed:i}}function we(e){if(ee(e).length===0)return p.configDotenv(e);let t=te(e);return t?p._configVault(e):(ve(`You set DOTENV_KEY but you are missing a .env.vault file at ${t}. Did you forget to build it?`),p.configDotenv(e))}function Le(e,t){let r=Buffer.from(t.slice(-64),"hex"),s=Buffer.from(e,"base64"),n=s.subarray(0,12),o=s.subarray(-16);s=s.subarray(12,-16);try{let i=Re.createDecipheriv("aes-256-gcm",r,n);return i.setAuthTag(o),`${i.update(s)}${i.final()}`}catch(i){let a=i instanceof RangeError,m=i.message==="Invalid key length",S=i.message==="Unsupported state or unable to authenticate data";if(a||m){let _=new Error("INVALID_DOTENV_KEY: It must be 64 characters long (or more)");throw _.code="INVALID_DOTENV_KEY",_}else if(S){let _=new Error("DECRYPTION_FAILED: Please check your DOTENV_KEY");throw _.code="DECRYPTION_FAILED",_}else throw i}}function Ue(e,t,r={}){let s=Boolean(r&&r.debug),n=Boolean(r&&r.override);if(typeof t!="object"){let o=new Error("OBJECT_REQUIRED: Please check the processEnv argument being passed to populate");throw o.code="OBJECT_REQUIRED",o}for(let o of Object.keys(t))Object.prototype.hasOwnProperty.call(e,o)?(n===!0&&(e[o]=t[o]),s&&D(n===!0?`"${o}" is already defined and WAS overwritten`:`"${o}" is already defined and was NOT overwritten`)):e[o]=t[o]}var p={configDotenv:xe,_configVault:De,_parseVault:Ie,config:we,decrypt:Le,parse:Me,populate:Ue};f.exports.configDotenv=p.configDotenv;f.exports._configVault=p._configVault;f.exports._parseVault=p._parseVault;f.exports.config=p.config;f.exports.decrypt=p.decrypt;f.exports.parse=p.parse;f.exports.populate=p.populate;f.exports=p});var et={};Te(et,{handler:()=>Ze});module.exports=Ne(et);var Se={DEV:"dev",STAGING:"staging",PROD:"prod"},M=process.env.STAGE||Se.DEV,c={TOPICS:process.env.TOPICS_TABLE||`MicroQueue-Topics-${M}`,MESSAGES:process.env.MESSAGES_TABLE||`MicroQueue-Messages-${M}`,CONSUMER_GROUPS:process.env.CONSUMER_GROUPS_TABLE||`MicroQueue-ConsumerGroups-${M}`,OFFSETS:process.env.OFFSETS_TABLE||`MicroQueue-Offsets-${M}`},rt={MESSAGES:process.env.MESSAGES_BUCKET||`microqueue-messages-${M}`,ARCHIVE:process.env.ARCHIVE_BUCKET||`microqueue-archive-${M}`},_e={MAX_TOPIC_NAME_LENGTH:100,MAX_DESCRIPTION_LENGTH:500,MAX_MESSAGE_SIZE_BYTES:256*1024,MAX_METADATA_KEYS:10,MAX_METADATA_KEY_LENGTH:128,MAX_METADATA_VALUE_LENGTH:256,MAX_RETENTION_HOURS:7*24,DEFAULT_RETENTION_HOURS:24,MAX_MESSAGES_PER_CONSUME:100,DEFAULT_MESSAGES_PER_CONSUME:10,MAX_WAIT_TIME_SECONDS:20,DEFAULT_WAIT_TIME_SECONDS:0},g={INTERNAL_ERROR:"INTERNAL_ERROR",VALIDATION_ERROR:"VALIDATION_ERROR",RESOURCE_NOT_FOUND:"RESOURCE_NOT_FOUND",TOPIC_NOT_FOUND:"TOPIC_NOT_FOUND",TOPIC_ALREADY_EXISTS:"TOPIC_ALREADY_EXISTS",MESSAGE_NOT_FOUND:"MESSAGE_NOT_FOUND",MESSAGE_TOO_LARGE:"MESSAGE_TOO_LARGE",INVALID_MESSAGE_FORMAT:"INVALID_MESSAGE_FORMAT",CONSUMER_GROUP_NOT_FOUND:"CONSUMER_GROUP_NOT_FOUND",CONSUMER_GROUP_ALREADY_EXISTS:"CONSUMER_GROUP_ALREADY_EXISTS",RATE_LIMIT_EXCEEDED:"RATE_LIMIT_EXCEEDED",SERVICE_UNAVAILABLE:"SERVICE_UNAVAILABLE"},T={OK:200,CREATED:201,BAD_REQUEST:400,UNAUTHORIZED:401,FORBIDDEN:403,NOT_FOUND:404,CONFLICT:409,PAYLOAD_TOO_LARGE:413,UNPROCESSABLE_ENTITY:422,TOO_MANY_REQUESTS:429,INTERNAL_SERVER_ERROR:500,SERVICE_UNAVAILABLE:503};var E=class extends Error{constructor(r,s,n,o){super(s);this.code=r,this.statusCode=n,this.details=o,this.name="AppError",Error.captureStackTrace&&Error.captureStackTrace(this,E)}toResponse(){return{success:!1,error:{code:this.code,message:this.message,details:this.details}}}},d={internalError:(e="An internal server error occurred",t)=>new E(g.INTERNAL_ERROR,e,T.INTERNAL_SERVER_ERROR,t),validationError:(e="Validation error",t)=>new E(g.VALIDATION_ERROR,e,T.BAD_REQUEST,t),resourceNotFound:(e,t)=>new E(g.RESOURCE_NOT_FOUND,`${e} with id '${t}' not found`,T.NOT_FOUND),topicNotFound:e=>new E(g.TOPIC_NOT_FOUND,`Topic '${e}' not found`,T.NOT_FOUND),topicAlreadyExists:e=>new E(g.TOPIC_ALREADY_EXISTS,`Topic with name '${e}' already exists`,T.CONFLICT),messageNotFound:e=>new E(g.MESSAGE_NOT_FOUND,`Message '${e}' not found`,T.NOT_FOUND),messageTooLarge:(e,t)=>new E(g.MESSAGE_TOO_LARGE,`Message size (${e} bytes) exceeds maximum allowed size (${t} bytes)`,T.PAYLOAD_TOO_LARGE),consumerGroupNotFound:e=>new E(g.CONSUMER_GROUP_NOT_FOUND,`Consumer group '${e}' not found`,T.NOT_FOUND),consumerGroupAlreadyExists:(e,t)=>new E(g.CONSUMER_GROUP_ALREADY_EXISTS,`Consumer group with name '${e}' already exists for topic '${t}'`,T.CONFLICT),rateLimitExceeded:()=>new E(g.RATE_LIMIT_EXCEEDED,"Rate limit exceeded",T.TOO_MANY_REQUESTS),serviceUnavailable:(e="Service temporarily unavailable")=>new E(g.SERVICE_UNAVAILABLE,e,T.SERVICE_UNAVAILABLE)},W=e=>{if(console.error("Error:",e),e instanceof E)return{statusCode:e.statusCode,body:JSON.stringify(e.toResponse()),headers:{"Content-Type":"application/json"}};if(e.code==="ConditionalCheckFailedException"){let r=d.resourceNotFound("Resource","unknown");return{statusCode:r.statusCode,body:JSON.stringify(r.toResponse()),headers:{"Content-Type":"application/json"}}}if(e.code==="ThrottlingException"){let r=d.rateLimitExceeded();return{statusCode:r.statusCode,body:JSON.stringify(r.toResponse()),headers:{"Content-Type":"application/json"}}}let t=d.internalError(e.message||"An unexpected error occurred");return{statusCode:t.statusCode,body:JSON.stringify(t.toResponse()),headers:{"Content-Type":"application/json"}}};var fe=e=>({success:!0,data:e}),Q=(e,t=200)=>({statusCode:t,body:JSON.stringify(fe(e)),headers:{"Content-Type":"application/json"}});var re=require("aws-sdk"),oe=G(Y());oe.config();var se={region:process.env.AWS_REGION||"us-east-1",maxRetries:3,httpOptions:{timeout:5e3},...process.env.IS_LOCAL&&{accessKeyId:"localstack",secretAccessKey:"localstack"}};process.env.DYNAMODB_ENDPOINT&&(console.log(`Using local DynamoDB endpoint: ${process.env.DYNAMODB_ENDPOINT}`),se.endpoint=process.env.DYNAMODB_ENDPOINT);var u=new re.DynamoDB.DocumentClient(se);var ne=G(Y());ne.config();var Pe={error:0,warn:1,info:2,debug:3},Ve=process.env.LOG_LEVEL||"info",Ge=process.env.LOG_FORMAT||"json",x=Pe[Ve]||2,w=(e,t,r)=>{let s=new Date().toISOString(),n=process.env.AWS_REQUEST_ID||"-";if(Ge==="json"){let i={timestamp:s,level:e,message:t,requestId:n,service:"MicroQueue-Mini",version:"1.0.0",env:process.env.STAGE||"dev",...r?{data:r}:{}};return JSON.stringify(i)}let o=`[${s}] [${e.toUpperCase()}] [${n}] ${t}`;return r&&(o+=` ${JSON.stringify(r)}`),o},K=class{error(t,r){x>=0&&console.error(w("error",t,r))}warn(t,r){x>=1&&console.warn(w("warn",t,r))}info(t,r){x>=2&&console.info(w("info",t,r))}debug(t,r){x>=3&&console.debug(w("debug",t,r))}},l=new K,N=l;var ie=G(require("aws-sdk")),Fe=new ie.default.CloudWatch,$e=async e=>{l.debug("Calculating topic metrics",{topicId:e});try{let t=await u.get({TableName:c.TOPICS,Key:{topicId:e}}).promise();if(!t.Item)throw d.topicNotFound(e);let r=t.Item,s=Date.now()-60*60*1e3,i=((await u.query({TableName:c.MESSAGES,KeyConditionExpression:"topicId = :topicId AND sequenceNumber > :seq",FilterExpression:"#ts >= :ts",ExpressionAttributeNames:{"#ts":"timestamp"},ExpressionAttributeValues:{":topicId":e,":seq":0,":ts":s},Select:"COUNT"}).promise()).Count||0)/60,m=((await u.query({TableName:c.MESSAGES,KeyConditionExpression:"topicId = :topicId",ExpressionAttributeValues:{":topicId":e},Limit:100,ScanIndexForward:!1,ProjectionExpression:"size"}).promise()).Items||[]).map(h=>h.size||0),S=m.reduce((h,P)=>h+P,0),_=m.length>0?Math.round(S/m.length):0,C=await u.query({TableName:c.MESSAGES,KeyConditionExpression:"topicId = :topicId",ExpressionAttributeValues:{":topicId":e},Limit:1,ScanIndexForward:!0,ProjectionExpression:"timestamp"}).promise(),O=await u.query({TableName:c.MESSAGES,KeyConditionExpression:"topicId = :topicId",ExpressionAttributeValues:{":topicId":e},Limit:1,ScanIndexForward:!1,ProjectionExpression:"timestamp"}).promise(),L=C.Items&&C.Items.length>0?C.Items[0].timestamp:0,v=O.Items&&O.Items.length>0?O.Items[0].timestamp:0,R=(await u.query({TableName:c.CONSUMER_GROUPS,KeyConditionExpression:"topicId = :topicId",ExpressionAttributeValues:{":topicId":e}}).promise()).Items||[],A=0;for(let h of R){let P=h.groupId,V=await u.get({TableName:c.OFFSETS,Key:{groupId:P,topicId:e}}).promise();if(V.Item){let X=V.Item.lastConsumedTimestamp||0,ue=V.Item.lastSequenceNumber||0;if(X>s){let le=ue,q=(X-r.createdAt)/(60*60*1e3);q>0&&(A+=le/(q*60))}}}let U=R.length>0?A/R.length:0;return{topicId:e,name:r.name,messageCount:r.messageCount||0,publishRate:i,consumeRate:U,averageMessageSize:_,oldestMessage:L,newestMessage:v}}catch(t){throw l.error("Error calculating topic metrics",{error:t,topicId:e}),t}},Be=async()=>{l.debug("Calculating system metrics");try{let[e,t,r]=await Promise.all([u.scan({TableName:c.TOPICS,Select:"COUNT"}).promise(),u.scan({TableName:c.MESSAGES,Select:"COUNT"}).promise(),u.scan({TableName:c.CONSUMER_GROUPS,Select:"COUNT"}).promise()]),s=e.Count||0,n=t.Count||0,o=r.Count||0,i=Date.now()-60*60*1e3,S=((await u.scan({TableName:c.MESSAGES,FilterExpression:"#ts >= :ts",ExpressionAttributeNames:{"#ts":"timestamp"},ExpressionAttributeValues:{":ts":i},Select:"COUNT"}).promise()).Count||0)/60,_=0,O=(await u.scan({TableName:c.OFFSETS,Limit:100}).promise()).Items||[];for(let A of O)A.lastConsumedTimestamp>i&&(_+=A.lastSequenceNumber||0);let L=O.length>0?_/O.length/60:0,v=0,R=((await u.scan({TableName:c.MESSAGES,Limit:100,ProjectionExpression:"size"}).promise()).Items||[]).map(A=>A.size||0);return R.length>0&&(v=R.reduce((U,h)=>U+h,0)/R.length*n),{totalTopics:s,totalMessages:n,totalConsumerGroups:o,averagePublishRate:S,averageConsumeRate:L,storageUsed:v}}catch(e){throw l.error("Error calculating system metrics",{error:e}),e}},Ye=async(e=[],t)=>{try{let r=new Date,s=[];for(let o of e)s.push({MetricName:"MessageCount",Dimensions:[{Name:"TopicId",Value:o.topicId},{Name:"TopicName",Value:o.name}],Value:o.messageCount,Timestamp:r,Unit:"Count"},{MetricName:"PublishRate",Dimensions:[{Name:"TopicId",Value:o.topicId},{Name:"TopicName",Value:o.name}],Value:o.publishRate,Timestamp:r,Unit:"Count/Minute"},{MetricName:"ConsumeRate",Dimensions:[{Name:"TopicId",Value:o.topicId},{Name:"TopicName",Value:o.name}],Value:o.consumeRate,Timestamp:r,Unit:"Count/Minute"},{MetricName:"AverageMessageSize",Dimensions:[{Name:"TopicId",Value:o.topicId},{Name:"TopicName",Value:o.name}],Value:o.averageMessageSize,Timestamp:r,Unit:"Bytes"});t&&s.push({MetricName:"TotalTopics",Value:t.totalTopics,Timestamp:r,Unit:"Count"},{MetricName:"TotalMessages",Value:t.totalMessages,Timestamp:r,Unit:"Count"},{MetricName:"TotalConsumerGroups",Value:t.totalConsumerGroups,Timestamp:r,Unit:"Count"},{MetricName:"AveragePublishRate",Value:t.averagePublishRate,Timestamp:r,Unit:"Count/Minute"},{MetricName:"AverageConsumeRate",Value:t.averageConsumeRate,Timestamp:r,Unit:"Count/Minute"},{MetricName:"StorageUsed",Value:t.storageUsed,Timestamp:r,Unit:"Bytes"});let n=20;for(let o=0;o<s.length;o+=n){let i=s.slice(o,o+n);await Fe.putMetricData({Namespace:"MicroQueue",MetricData:i}).promise()}}catch(r){l.error("Error pushing metrics to CloudWatch",{error:r})}},y={calculateTopicMetrics:$e,calculateSystemMetrics:Be,pushMetricsToCloudWatch:Ye};var Ke=async e=>{l.debug("Creating topic",{topicId:e.topicId});try{return await u.put({TableName:c.TOPICS,Item:e,ConditionExpression:"attribute_not_exists(topicId)"}).promise(),e}catch(t){throw l.error("Error creating topic",{error:t,topic:e}),t.code==="ConditionalCheckFailedException"?d.topicAlreadyExists(e.name):t}},j=async e=>{l.debug("Getting topic",{topicId:e});try{let t=await u.get({TableName:c.TOPICS,Key:{topicId:e}}).promise();if(!t.Item)throw d.topicNotFound(e);return t.Item}catch(t){throw l.error("Error getting topic",{error:t,topicId:e}),t.code==="ResourceNotFoundException"?d.topicNotFound(e):t}},je=async e=>{l.debug("Getting topic by name",{name:e});try{let t=await u.scan({TableName:c.TOPICS,FilterExpression:"#name = :name",ExpressionAttributeNames:{"#name":"name"},ExpressionAttributeValues:{":name":e},Limit:1}).promise();return t.Items&&t.Items.length>0?t.Items[0]:null}catch(t){throw l.error("Error getting topic by name",{error:t,name:e}),t}},ke=async()=>{l.debug("Listing topics");try{return(await u.scan({TableName:c.TOPICS}).promise()).Items||[]}catch(e){throw l.error("Error listing topics",{error:e}),e}},Xe=async e=>{l.debug("Deleting topic",{topicId:e});try{await u.delete({TableName:c.TOPICS,Key:{topicId:e},ConditionExpression:"attribute_exists(topicId)"}).promise()}catch(t){throw l.error("Error deleting topic",{error:t,topicId:e}),t.code==="ConditionalCheckFailedException"?d.topicNotFound(e):t}},qe=async(e,t)=>{l.debug("Incrementing topic message count",{topicId:e,timestamp:t});try{await u.update({TableName:c.TOPICS,Key:{topicId:e},UpdateExpression:"SET messageCount = messageCount + :inc, lastMessageTimestamp = :ts",ExpressionAttributeValues:{":inc":1,":ts":t},ConditionExpression:"attribute_exists(topicId)"}).promise()}catch(r){throw l.error("Error incrementing message count",{error:r,topicId:e}),r.code==="ConditionalCheckFailedException"?d.topicNotFound(e):r}},ze=async(e,t)=>{l.debug("Updating topic",{topicId:e,updates:t});let r=[],s={},n={};if(Object.entries(t).forEach(([o,i])=>{i!==void 0&&(r.push(`#${o} = :${o}`),s[`#${o}`]=o,n[`:${o}`]=i)}),r.length===0)return j(e);try{return await u.update({TableName:c.TOPICS,Key:{topicId:e},UpdateExpression:`SET ${r.join(", ")}`,ExpressionAttributeNames:s,ExpressionAttributeValues:n,ConditionExpression:"attribute_exists(topicId)",ReturnValues:"NONE"}).promise(),j(e)}catch(o){throw l.error("Error updating topic",{error:o,topicId:e}),o.code==="ConditionalCheckFailedException"?d.topicNotFound(e):o}},I={createTopic:Ke,getTopic:j,getTopicByName:je,listTopics:ke,deleteTopic:Xe,incrementMessageCount:qe,updateTopic:ze};var He=async e=>(N.debug("Getting topic metrics",{topicId:e}),await I.getTopic(e),y.calculateTopicMetrics(e)),We=async()=>{N.debug("Getting all topic metrics");let t=(await I.listTopics()).map(r=>y.calculateTopicMetrics(r.topicId));return Promise.all(t)},k=async()=>(N.debug("Getting system metrics"),y.calculateSystemMetrics()),Qe=async()=>{N.debug("Collecting and publishing metrics");try{let e=await k(),r=(await I.listTopics()).slice(0,10),s=await Promise.all(r.map(n=>y.calculateTopicMetrics(n.topicId)));await y.pushMetricsToCloudWatch(s,e),N.info("Metrics published successfully")}catch(e){N.error("Error collecting and publishing metrics",{error:e})}},Je=async()=>{N.debug("Getting dashboard metrics");let e=await k(),r=(await I.listTopics()).slice(0,20),s=await Promise.all(r.map(n=>y.calculateTopicMetrics(n.topicId)));return s.sort((n,o)=>o.messageCount-n.messageCount),{system:e,topics:s}},ae={getTopicMetrics:He,getAllTopicMetrics:We,getSystemMetrics:k,collectAndPublishMetrics:Qe,getDashboardMetrics:Je};var Ze=async e=>{try{N.debug("Get metrics request",{event:e});let t=await ae.getDashboardMetrics();return Q(t)}catch(t){return N.error("Error getting metrics",{error:t}),W(t)}};0&&(module.exports={handler});
//# sourceMappingURL=get.js.map
