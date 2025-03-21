"use strict";var ue=Object.create;var h=Object.defineProperty;var pe=Object.getOwnPropertyDescriptor;var Ee=Object.getOwnPropertyNames;var le=Object.getPrototypeOf,me=Object.prototype.hasOwnProperty;var v=(e,r)=>()=>(r||e((r={exports:{}}).exports,r),r.exports),de=(e,r)=>{for(var t in r)h(e,t,{get:r[t],enumerable:!0})},V=(e,r,t,n)=>{if(r&&typeof r=="object"||typeof r=="function")for(let i of Ee(r))!me.call(e,i)&&i!==t&&h(e,i,{get:()=>r[i],enumerable:!(n=pe(r,i))||n.enumerable});return e};var b=(e,r,t)=>(t=e!=null?ue(le(e)):{},V(r||!e||!e.__esModule?h(t,"default",{value:e,enumerable:!0}):t,e)),ge=e=>V(h({},"__esModule",{value:!0}),e);var B=v((pr,$)=>{var Te="useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";$.exports={urlAlphabet:Te}});var Q=v((Er,H)=>{var Y=require("crypto"),{urlAlphabet:K}=B(),_e=128,O,A,k=e=>{!O||O.length<e?(O=Buffer.allocUnsafe(e*_e),Y.randomFillSync(O),A=0):A+e>O.length&&(Y.randomFillSync(O),A=0),A+=e},j=e=>(k(e|=0),O.subarray(A-e,A)),X=(e,r,t)=>{let n=(2<<31-Math.clz32(e.length-1|1))-1,i=Math.ceil(1.6*n*r/e.length);return(o=r)=>{let s="";for(;;){let u=t(i),d=i;for(;d--;)if(s+=e[u[d]&n]||"",s.length===o)return s}}},fe=(e,r=21)=>X(e,r,j),Ne=(e=21)=>{k(e|=0);let r="";for(let t=A-e;t<A;t++)r+=K[O[t]&63];return r};H.exports={nanoid:Ne,customAlphabet:fe,customRandom:X,urlAlphabet:K,random:j}});var ee=v((Or,Ce)=>{Ce.exports={name:"dotenv",version:"16.4.7",description:"Loads environment variables from .env file",main:"lib/main.js",types:"lib/main.d.ts",exports:{".":{types:"./lib/main.d.ts",require:"./lib/main.js",default:"./lib/main.js"},"./config":"./config.js","./config.js":"./config.js","./lib/env-options":"./lib/env-options.js","./lib/env-options.js":"./lib/env-options.js","./lib/cli-options":"./lib/cli-options.js","./lib/cli-options.js":"./lib/cli-options.js","./package.json":"./package.json"},scripts:{"dts-check":"tsc --project tests/types/tsconfig.json",lint:"standard",pretest:"npm run lint && npm run dts-check",test:"tap run --allow-empty-coverage --disable-coverage --timeout=60000","test:coverage":"tap run --show-full-coverage --timeout=60000 --coverage-report=lcov",prerelease:"npm test",release:"standard-version"},repository:{type:"git",url:"git://github.com/motdotla/dotenv.git"},funding:"https://dotenvx.com",keywords:["dotenv","env",".env","environment","variables","config","settings"],readmeFilename:"README.md",license:"BSD-2-Clause",devDependencies:{"@types/node":"^18.11.3",decache:"^4.6.2",sinon:"^14.0.1",standard:"^17.0.0","standard-version":"^9.5.0",tap:"^19.2.0",typescript:"^4.8.4"},engines:{node:">=12"},browser:{fs:!1}}});var L=v((Ar,f)=>{var w=require("fs"),M=require("path"),ye=require("os"),Re=require("crypto"),he=ee(),G=he.version,ve=/(?:^|^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\\'|[^'])*'|\s*"(?:\\"|[^"])*"|\s*`(?:\\`|[^`])*`|[^#\r\n]+)?\s*(?:#.*)?(?:$|$)/mg;function Ie(e){let r={},t=e.toString();t=t.replace(/\r\n?/mg,`
`);let n;for(;(n=ve.exec(t))!=null;){let i=n[1],o=n[2]||"";o=o.trim();let s=o[0];o=o.replace(/^(['"`])([\s\S]*)\1$/mg,"$2"),s==='"'&&(o=o.replace(/\\n/g,`
`),o=o.replace(/\\r/g,"\r")),r[i]=o}return r}function xe(e){let r=oe(e),t=p.configDotenv({path:r});if(!t.parsed){let s=new Error(`MISSING_DATA: Cannot parse ${r} for an unknown reason`);throw s.code="MISSING_DATA",s}let n=te(e).split(","),i=n.length,o;for(let s=0;s<i;s++)try{let u=n[s].trim(),d=we(t,u);o=p.decrypt(d.ciphertext,d.key);break}catch(u){if(s+1>=i)throw u}return p.parse(o)}function De(e){console.log(`[dotenv@${G}][INFO] ${e}`)}function be(e){console.log(`[dotenv@${G}][WARN] ${e}`)}function I(e){console.log(`[dotenv@${G}][DEBUG] ${e}`)}function te(e){return e&&e.DOTENV_KEY&&e.DOTENV_KEY.length>0?e.DOTENV_KEY:process.env.DOTENV_KEY&&process.env.DOTENV_KEY.length>0?process.env.DOTENV_KEY:""}function we(e,r){let t;try{t=new URL(r)}catch(u){if(u.code==="ERR_INVALID_URL"){let d=new Error("INVALID_DOTENV_KEY: Wrong format. Must be in valid uri format like dotenv://:key_1234@dotenvx.com/vault/.env.vault?environment=development");throw d.code="INVALID_DOTENV_KEY",d}throw u}let n=t.password;if(!n){let u=new Error("INVALID_DOTENV_KEY: Missing key part");throw u.code="INVALID_DOTENV_KEY",u}let i=t.searchParams.get("environment");if(!i){let u=new Error("INVALID_DOTENV_KEY: Missing environment part");throw u.code="INVALID_DOTENV_KEY",u}let o=`DOTENV_VAULT_${i.toUpperCase()}`,s=e.parsed[o];if(!s){let u=new Error(`NOT_FOUND_DOTENV_ENVIRONMENT: Cannot locate environment ${o} in your .env.vault file.`);throw u.code="NOT_FOUND_DOTENV_ENVIRONMENT",u}return{ciphertext:s,key:n}}function oe(e){let r=null;if(e&&e.path&&e.path.length>0)if(Array.isArray(e.path))for(let t of e.path)w.existsSync(t)&&(r=t.endsWith(".vault")?t:`${t}.vault`);else r=e.path.endsWith(".vault")?e.path:`${e.path}.vault`;else r=M.resolve(process.cwd(),".env.vault");return w.existsSync(r)?r:null}function re(e){return e[0]==="~"?M.join(ye.homedir(),e.slice(1)):e}function Me(e){De("Loading env from encrypted .env.vault");let r=p._parseVault(e),t=process.env;return e&&e.processEnv!=null&&(t=e.processEnv),p.populate(t,r,e),{parsed:r}}function Ge(e){let r=M.resolve(process.cwd(),".env"),t="utf8",n=Boolean(e&&e.debug);e&&e.encoding?t=e.encoding:n&&I("No encoding is specified. UTF-8 is used by default");let i=[r];if(e&&e.path)if(!Array.isArray(e.path))i=[re(e.path)];else{i=[];for(let d of e.path)i.push(re(d))}let o,s={};for(let d of i)try{let S=p.parse(w.readFileSync(d,{encoding:t}));p.populate(s,S,e)}catch(S){n&&I(`Failed to load ${d} ${S.message}`),o=S}let u=process.env;return e&&e.processEnv!=null&&(u=e.processEnv),p.populate(u,s,e),o?{parsed:s,error:o}:{parsed:s}}function Le(e){if(te(e).length===0)return p.configDotenv(e);let r=oe(e);return r?p._configVault(e):(be(`You set DOTENV_KEY but you are missing a .env.vault file at ${r}. Did you forget to build it?`),p.configDotenv(e))}function Ue(e,r){let t=Buffer.from(r.slice(-64),"hex"),n=Buffer.from(e,"base64"),i=n.subarray(0,12),o=n.subarray(-16);n=n.subarray(12,-16);try{let s=Re.createDecipheriv("aes-256-gcm",t,i);return s.setAuthTag(o),`${s.update(n)}${s.final()}`}catch(s){let u=s instanceof RangeError,d=s.message==="Invalid key length",S=s.message==="Unsupported state or unable to authenticate data";if(u||d){let R=new Error("INVALID_DOTENV_KEY: It must be 64 characters long (or more)");throw R.code="INVALID_DOTENV_KEY",R}else if(S){let R=new Error("DECRYPTION_FAILED: Please check your DOTENV_KEY");throw R.code="DECRYPTION_FAILED",R}else throw s}}function Pe(e,r,t={}){let n=Boolean(t&&t.debug),i=Boolean(t&&t.override);if(typeof r!="object"){let o=new Error("OBJECT_REQUIRED: Please check the processEnv argument being passed to populate");throw o.code="OBJECT_REQUIRED",o}for(let o of Object.keys(r))Object.prototype.hasOwnProperty.call(e,o)?(i===!0&&(e[o]=r[o]),n&&I(i===!0?`"${o}" is already defined and WAS overwritten`:`"${o}" is already defined and was NOT overwritten`)):e[o]=r[o]}var p={configDotenv:Ge,_configVault:Me,_parseVault:xe,config:Le,decrypt:Ue,parse:Ie,populate:Pe};f.exports.configDotenv=p.configDotenv;f.exports._configVault=p._configVault;f.exports._parseVault=p._parseVault;f.exports.config=p.config;f.exports.decrypt=p.decrypt;f.exports.parse=p.parse;f.exports.populate=p.populate;f.exports=p});var cr={};de(cr,{handler:()=>ar});module.exports=ge(cr);var q=b(Q());var Oe={DEV:"dev",STAGING:"staging",PROD:"prod"},C=process.env.STAGE||Oe.DEV,E={TOPICS:process.env.TOPICS_TABLE||`MicroQueue-Topics-${C}`,MESSAGES:process.env.MESSAGES_TABLE||`MicroQueue-Messages-${C}`,CONSUMER_GROUPS:process.env.CONSUMER_GROUPS_TABLE||`MicroQueue-ConsumerGroups-${C}`,OFFSETS:process.env.OFFSETS_TABLE||`MicroQueue-Offsets-${C}`},lr={MESSAGES:process.env.MESSAGES_BUCKET||`microqueue-messages-${C}`,ARCHIVE:process.env.ARCHIVE_BUCKET||`microqueue-archive-${C}`},y={MAX_TOPIC_NAME_LENGTH:100,MAX_DESCRIPTION_LENGTH:500,MAX_MESSAGE_SIZE_BYTES:256*1024,MAX_METADATA_KEYS:10,MAX_METADATA_KEY_LENGTH:128,MAX_METADATA_VALUE_LENGTH:256,MAX_RETENTION_HOURS:7*24,DEFAULT_RETENTION_HOURS:24,MAX_MESSAGES_PER_CONSUME:100,DEFAULT_MESSAGES_PER_CONSUME:10,MAX_WAIT_TIME_SECONDS:20,DEFAULT_WAIT_TIME_SECONDS:0},g={INTERNAL_ERROR:"INTERNAL_ERROR",VALIDATION_ERROR:"VALIDATION_ERROR",RESOURCE_NOT_FOUND:"RESOURCE_NOT_FOUND",TOPIC_NOT_FOUND:"TOPIC_NOT_FOUND",TOPIC_ALREADY_EXISTS:"TOPIC_ALREADY_EXISTS",MESSAGE_NOT_FOUND:"MESSAGE_NOT_FOUND",MESSAGE_TOO_LARGE:"MESSAGE_TOO_LARGE",INVALID_MESSAGE_FORMAT:"INVALID_MESSAGE_FORMAT",CONSUMER_GROUP_NOT_FOUND:"CONSUMER_GROUP_NOT_FOUND",CONSUMER_GROUP_ALREADY_EXISTS:"CONSUMER_GROUP_ALREADY_EXISTS",RATE_LIMIT_EXCEEDED:"RATE_LIMIT_EXCEEDED",SERVICE_UNAVAILABLE:"SERVICE_UNAVAILABLE"},T={OK:200,CREATED:201,BAD_REQUEST:400,UNAUTHORIZED:401,FORBIDDEN:403,NOT_FOUND:404,CONFLICT:409,PAYLOAD_TOO_LARGE:413,UNPROCESSABLE_ENTITY:422,TOO_MANY_REQUESTS:429,INTERNAL_SERVER_ERROR:500,SERVICE_UNAVAILABLE:503};var m=class extends Error{constructor(t,n,i,o){super(n);this.code=t,this.statusCode=i,this.details=o,this.name="AppError",Error.captureStackTrace&&Error.captureStackTrace(this,m)}toResponse(){return{success:!1,error:{code:this.code,message:this.message,details:this.details}}}},c={internalError:(e="An internal server error occurred",r)=>new m(g.INTERNAL_ERROR,e,T.INTERNAL_SERVER_ERROR,r),validationError:(e="Validation error",r)=>new m(g.VALIDATION_ERROR,e,T.BAD_REQUEST,r),resourceNotFound:(e,r)=>new m(g.RESOURCE_NOT_FOUND,`${e} with id '${r}' not found`,T.NOT_FOUND),topicNotFound:e=>new m(g.TOPIC_NOT_FOUND,`Topic '${e}' not found`,T.NOT_FOUND),topicAlreadyExists:e=>new m(g.TOPIC_ALREADY_EXISTS,`Topic with name '${e}' already exists`,T.CONFLICT),messageNotFound:e=>new m(g.MESSAGE_NOT_FOUND,`Message '${e}' not found`,T.NOT_FOUND),messageTooLarge:(e,r)=>new m(g.MESSAGE_TOO_LARGE,`Message size (${e} bytes) exceeds maximum allowed size (${r} bytes)`,T.PAYLOAD_TOO_LARGE),consumerGroupNotFound:e=>new m(g.CONSUMER_GROUP_NOT_FOUND,`Consumer group '${e}' not found`,T.NOT_FOUND),consumerGroupAlreadyExists:(e,r)=>new m(g.CONSUMER_GROUP_ALREADY_EXISTS,`Consumer group with name '${e}' already exists for topic '${r}'`,T.CONFLICT),rateLimitExceeded:()=>new m(g.RATE_LIMIT_EXCEEDED,"Rate limit exceeded",T.TOO_MANY_REQUESTS),serviceUnavailable:(e="Service temporarily unavailable")=>new m(g.SERVICE_UNAVAILABLE,e,T.SERVICE_UNAVAILABLE)},J=e=>{if(console.error("Error:",e),e instanceof m)return{statusCode:e.statusCode,body:JSON.stringify(e.toResponse()),headers:{"Content-Type":"application/json"}};if(e.code==="ConditionalCheckFailedException"){let t=c.resourceNotFound("Resource","unknown");return{statusCode:t.statusCode,body:JSON.stringify(t.toResponse()),headers:{"Content-Type":"application/json"}}}if(e.code==="ThrottlingException"){let t=c.rateLimitExceeded();return{statusCode:t.statusCode,body:JSON.stringify(t.toResponse()),headers:{"Content-Type":"application/json"}}}let r=c.internalError(e.message||"An unexpected error occurred");return{statusCode:r.statusCode,body:JSON.stringify(r.toResponse()),headers:{"Content-Type":"application/json"}}};var Ae=(e,r=16)=>{let t=(0,q.nanoid)(r);return e?`${e}_${t}`:t};var W=()=>Ae("consumer");var Se=e=>({success:!0,data:e}),Z=(e,r=200)=>({statusCode:r,body:JSON.stringify(Se(e)),headers:{"Content-Type":"application/json"}});var z=e=>{if(!e)throw c.validationError("Request body is required");try{return JSON.parse(e)}catch{throw c.validationError("Invalid JSON in request body")}};var ne=require("aws-sdk"),se=b(L());se.config();var ie={region:process.env.AWS_REGION||"us-east-1",maxRetries:3,httpOptions:{timeout:5e3},...process.env.IS_LOCAL&&{accessKeyId:"localstack",secretAccessKey:"localstack"}};process.env.DYNAMODB_ENDPOINT&&(console.log(`Using local DynamoDB endpoint: ${process.env.DYNAMODB_ENDPOINT}`),ie.endpoint=process.env.DYNAMODB_ENDPOINT);var l=new ne.DynamoDB.DocumentClient(ie);var ae=b(L());ae.config();var Fe={error:0,warn:1,info:2,debug:3},Ve=process.env.LOG_LEVEL||"info",$e=process.env.LOG_FORMAT||"json",x=Fe[Ve]||2,D=(e,r,t)=>{let n=new Date().toISOString(),i=process.env.AWS_REQUEST_ID||"-";if($e==="json"){let s={timestamp:n,level:e,message:r,requestId:i,service:"MicroQueue-Mini",version:"1.0.0",env:process.env.STAGE||"dev",...t?{data:t}:{}};return JSON.stringify(s)}let o=`[${n}] [${e.toUpperCase()}] [${i}] ${r}`;return t&&(o+=` ${JSON.stringify(t)}`),o},U=class{error(r,t){x>=0&&console.error(D("error",r,t))}warn(r,t){x>=1&&console.warn(D("warn",r,t))}info(r,t){x>=2&&console.info(D("info",r,t))}debug(r,t){x>=3&&console.debug(D("debug",r,t))}},a=new U,_=a;var Be=async e=>{a.debug("Creating consumer group",{groupId:e.groupId,topicId:e.topicId});try{return await l.put({TableName:E.CONSUMER_GROUPS,Item:e,ConditionExpression:"attribute_not_exists(groupId) AND attribute_not_exists(topicId)"}).promise(),e}catch(r){throw a.error("Error creating consumer group",{error:r,consumerGroup:e}),r.code==="ConditionalCheckFailedException"?c.consumerGroupAlreadyExists(e.name,e.topicId):r}},Ye=async(e,r)=>{a.debug("Getting consumer group",{groupId:e,topicId:r});try{let t=await l.get({TableName:E.CONSUMER_GROUPS,Key:{groupId:e,topicId:r}}).promise();if(!t.Item)throw c.consumerGroupNotFound(e);return t.Item}catch(t){throw a.error("Error getting consumer group",{error:t,groupId:e,topicId:r}),t.code==="ResourceNotFoundException"?c.consumerGroupNotFound(e):t}},Ke=async(e,r)=>{a.debug("Getting consumer group by name",{name:e,topicId:r});try{let t=await l.scan({TableName:E.CONSUMER_GROUPS,FilterExpression:"#name = :name AND topicId = :topicId",ExpressionAttributeNames:{"#name":"name"},ExpressionAttributeValues:{":name":e,":topicId":r},Limit:1}).promise();return t.Items&&t.Items.length>0?t.Items[0]:null}catch(t){throw a.error("Error getting consumer group by name",{error:t,name:e,topicId:r}),t}},ke=async e=>{a.debug("Listing consumer groups",{topicId:e});try{return(await l.query({TableName:E.CONSUMER_GROUPS,KeyConditionExpression:"topicId = :topicId",ExpressionAttributeValues:{":topicId":e}}).promise()).Items||[]}catch(r){throw a.error("Error listing consumer groups",{error:r,topicId:e}),r}},je=async(e,r)=>{a.debug("Deleting consumer group",{groupId:e,topicId:r});try{await l.delete({TableName:E.CONSUMER_GROUPS,Key:{groupId:e,topicId:r},ConditionExpression:"attribute_exists(groupId) AND attribute_exists(topicId)"}).promise(),await l.delete({TableName:E.OFFSETS,Key:{groupId:e,topicId:r}}).promise()}catch(t){throw a.error("Error deleting consumer group",{error:t,groupId:e,topicId:r}),t.code==="ConditionalCheckFailedException"?c.consumerGroupNotFound(e):t}},Xe=async(e,r,t)=>{a.debug("Updating consumer group timestamp",{groupId:e,topicId:r,timestamp:t});try{await l.update({TableName:E.CONSUMER_GROUPS,Key:{groupId:e,topicId:r},UpdateExpression:"SET lastConsumedTimestamp = :ts",ExpressionAttributeValues:{":ts":t},ConditionExpression:"attribute_exists(groupId) AND attribute_exists(topicId)"}).promise()}catch(n){throw a.error("Error updating consumer group timestamp",{error:n,groupId:e,topicId:r}),n.code==="ConditionalCheckFailedException"?c.consumerGroupNotFound(e):n}},He=async(e,r)=>{a.debug("Getting consumer offset",{groupId:e,topicId:r});try{let t=await l.get({TableName:E.OFFSETS,Key:{groupId:e,topicId:r}}).promise();return t.Item?t.Item:null}catch(t){throw a.error("Error getting consumer offset",{error:t,groupId:e,topicId:r}),t}},Qe=async e=>{a.debug("Updating consumer offset",{groupId:e.groupId,topicId:e.topicId,sequenceNumber:e.lastSequenceNumber});try{await l.put({TableName:E.OFFSETS,Item:e}).promise()}catch(r){throw a.error("Error updating consumer offset",{error:r,offset:e}),r}},N={createConsumerGroup:Be,getConsumerGroup:Ye,getConsumerGroupByName:Ke,listConsumerGroups:ke,deleteConsumerGroup:je,updateConsumerGroupTimestamp:Xe,getConsumerOffset:He,updateConsumerOffset:Qe};var Je=async e=>{a.debug("Creating topic",{topicId:e.topicId});try{return await l.put({TableName:E.TOPICS,Item:e,ConditionExpression:"attribute_not_exists(topicId)"}).promise(),e}catch(r){throw a.error("Error creating topic",{error:r,topic:e}),r.code==="ConditionalCheckFailedException"?c.topicAlreadyExists(e.name):r}},P=async e=>{a.debug("Getting topic",{topicId:e});try{let r=await l.get({TableName:E.TOPICS,Key:{topicId:e}}).promise();if(!r.Item)throw c.topicNotFound(e);return r.Item}catch(r){throw a.error("Error getting topic",{error:r,topicId:e}),r.code==="ResourceNotFoundException"?c.topicNotFound(e):r}},qe=async e=>{a.debug("Getting topic by name",{name:e});try{let r=await l.scan({TableName:E.TOPICS,FilterExpression:"#name = :name",ExpressionAttributeNames:{"#name":"name"},ExpressionAttributeValues:{":name":e},Limit:1}).promise();return r.Items&&r.Items.length>0?r.Items[0]:null}catch(r){throw a.error("Error getting topic by name",{error:r,name:e}),r}},We=async()=>{a.debug("Listing topics");try{return(await l.scan({TableName:E.TOPICS}).promise()).Items||[]}catch(e){throw a.error("Error listing topics",{error:e}),e}},Ze=async e=>{a.debug("Deleting topic",{topicId:e});try{await l.delete({TableName:E.TOPICS,Key:{topicId:e},ConditionExpression:"attribute_exists(topicId)"}).promise()}catch(r){throw a.error("Error deleting topic",{error:r,topicId:e}),r.code==="ConditionalCheckFailedException"?c.topicNotFound(e):r}},ze=async(e,r)=>{a.debug("Incrementing topic message count",{topicId:e,timestamp:r});try{await l.update({TableName:E.TOPICS,Key:{topicId:e},UpdateExpression:"SET messageCount = messageCount + :inc, lastMessageTimestamp = :ts",ExpressionAttributeValues:{":inc":1,":ts":r},ConditionExpression:"attribute_exists(topicId)"}).promise()}catch(t){throw a.error("Error incrementing message count",{error:t,topicId:e}),t.code==="ConditionalCheckFailedException"?c.topicNotFound(e):t}},er=async(e,r)=>{a.debug("Updating topic",{topicId:e,updates:r});let t=[],n={},i={};if(Object.entries(r).forEach(([o,s])=>{s!==void 0&&(t.push(`#${o} = :${o}`),n[`#${o}`]=o,i[`:${o}`]=s)}),t.length===0)return P(e);try{return await l.update({TableName:E.TOPICS,Key:{topicId:e},UpdateExpression:`SET ${t.join(", ")}`,ExpressionAttributeNames:n,ExpressionAttributeValues:i,ConditionExpression:"attribute_exists(topicId)",ReturnValues:"NONE"}).promise(),P(e)}catch(o){throw a.error("Error updating topic",{error:o,topicId:e}),o.code==="ConditionalCheckFailedException"?c.topicNotFound(e):o}},F={createTopic:Je,getTopic:P,getTopicByName:qe,listTopics:We,deleteTopic:Ze,incrementMessageCount:ze,updateTopic:er};var rr=async e=>{if(_.debug("Creating consumer group",{request:e}),!e.name)throw c.validationError("Consumer group name is required");if(e.name.length>y.MAX_TOPIC_NAME_LENGTH)throw c.validationError(`Consumer group name cannot exceed ${y.MAX_TOPIC_NAME_LENGTH} characters`);if(e.description&&e.description.length>y.MAX_DESCRIPTION_LENGTH)throw c.validationError(`Consumer group description cannot exceed ${y.MAX_DESCRIPTION_LENGTH} characters`);if(await F.getTopic(e.topicId),await N.getConsumerGroupByName(e.name,e.topicId))throw c.consumerGroupAlreadyExists(e.name,e.topicId);let t={groupId:W(),topicId:e.topicId,name:e.name,description:e.description,createdAt:Date.now()};return N.createConsumerGroup(t)},tr=async(e,r)=>(_.debug("Getting consumer group",{groupId:e,topicId:r}),N.getConsumerGroup(e,r)),or=async e=>(_.debug("Listing consumer groups",{topicId:e}),await F.getTopic(e),N.listConsumerGroups(e)),nr=async(e,r)=>(_.debug("Deleting consumer group",{groupId:e,topicId:r}),N.deleteConsumerGroup(e,r)),sr=async(e,r)=>(_.debug("Getting consumer offset",{groupId:e,topicId:r}),N.getConsumerOffset(e,r)),ir=async(e,r)=>{_.debug("Resetting consumer group offset",{groupId:e,topicId:r}),await N.getConsumerGroup(e,r),await N.updateConsumerOffset({groupId:e,topicId:r,lastSequenceNumber:0,lastConsumedTimestamp:Date.now()})},ce={createConsumerGroup:rr,getConsumerGroup:tr,listConsumerGroups:or,deleteConsumerGroup:nr,getConsumerOffset:sr,resetConsumerGroupOffset:ir};var ar=async e=>{try{_.debug("Create consumer group request",{event:e});let r=z(e.body),t=await ce.createConsumerGroup(r);return Z(t,201)}catch(r){return _.error("Error creating consumer group",{error:r}),J(r)}};0&&(module.exports={handler});
//# sourceMappingURL=create.js.map
