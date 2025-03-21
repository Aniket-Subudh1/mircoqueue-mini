"use strict";var oe=Object.create;var I=Object.defineProperty;var ie=Object.getOwnPropertyDescriptor;var ne=Object.getOwnPropertyNames;var se=Object.getPrototypeOf,ae=Object.prototype.hasOwnProperty;var P=(e,t)=>()=>(e&&(t=e(e=0)),t);var U=(e,t)=>()=>(t||e((t={exports:{}}).exports,t),t.exports),w=(e,t)=>{for(var r in t)I(e,r,{get:t[r],enumerable:!0})},b=(e,t,r,E)=>{if(t&&typeof t=="object"||typeof t=="function")for(let n of ne(t))!ae.call(e,n)&&n!==r&&I(e,n,{get:()=>t[n],enumerable:!(E=ie(t,n))||E.enumerable});return e};var ce=(e,t,r)=>(r=e!=null?oe(se(e)):{},b(t||!e||!e.__esModule?I(r,"default",{value:e,enumerable:!0}):r,e)),v=e=>b(I({},"__esModule",{value:!0}),e);var F=U((Pe,G)=>{var Ee="useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";G.exports={urlAlphabet:Ee}});var K=U((Ue,Y)=>{var $=require("crypto"),{urlAlphabet:X}=F(),Te=128,m,_,H=e=>{!m||m.length<e?(m=Buffer.allocUnsafe(e*Te),$.randomFillSync(m),_=0):_+e>m.length&&($.randomFillSync(m),_=0),_+=e},B=e=>(H(e|=0),m.subarray(_-e,_)),V=(e,t,r)=>{let E=(2<<31-Math.clz32(e.length-1|1))-1,n=Math.ceil(1.6*E*t/e.length);return(s=t)=>{let l="";for(;;){let re=r(n),D=n;for(;D--;)if(l+=e[re[D]&E]||"",l.length===s)return l}}},pe=(e,t=21)=>V(e,t,B),ue=(e=21)=>{H(e|=0);let t="";for(let r=_-e;r<_;r++)t+=X[m[r]&63];return t};Y.exports={nanoid:ue,customAlphabet:pe,customRandom:V,urlAlphabet:X,random:B}});var N,u,A,we,i,T,p,S=P(()=>{"use strict";N={DEV:"dev",STAGING:"staging",PROD:"prod"},u=process.env.STAGE||N.DEV,A={TOPICS:process.env.TOPICS_TABLE||`MicroQueue-Topics-${u}`,MESSAGES:process.env.MESSAGES_TABLE||`MicroQueue-Messages-${u}`,CONSUMER_GROUPS:process.env.CONSUMER_GROUPS_TABLE||`MicroQueue-ConsumerGroups-${u}`,OFFSETS:process.env.OFFSETS_TABLE||`MicroQueue-Offsets-${u}`},we={MESSAGES:process.env.MESSAGES_BUCKET||`microqueue-messages-${u}`,ARCHIVE:process.env.ARCHIVE_BUCKET||`microqueue-archive-${u}`},i={MAX_TOPIC_NAME_LENGTH:100,MAX_DESCRIPTION_LENGTH:500,MAX_MESSAGE_SIZE_BYTES:256*1024,MAX_METADATA_KEYS:10,MAX_METADATA_KEY_LENGTH:128,MAX_METADATA_VALUE_LENGTH:256,MAX_RETENTION_HOURS:7*24,DEFAULT_RETENTION_HOURS:24,MAX_MESSAGES_PER_CONSUME:100,DEFAULT_MESSAGES_PER_CONSUME:10,MAX_WAIT_TIME_SECONDS:20,DEFAULT_WAIT_TIME_SECONDS:0},T={INTERNAL_ERROR:"INTERNAL_ERROR",VALIDATION_ERROR:"VALIDATION_ERROR",RESOURCE_NOT_FOUND:"RESOURCE_NOT_FOUND",TOPIC_NOT_FOUND:"TOPIC_NOT_FOUND",TOPIC_ALREADY_EXISTS:"TOPIC_ALREADY_EXISTS",MESSAGE_NOT_FOUND:"MESSAGE_NOT_FOUND",MESSAGE_TOO_LARGE:"MESSAGE_TOO_LARGE",INVALID_MESSAGE_FORMAT:"INVALID_MESSAGE_FORMAT",CONSUMER_GROUP_NOT_FOUND:"CONSUMER_GROUP_NOT_FOUND",CONSUMER_GROUP_ALREADY_EXISTS:"CONSUMER_GROUP_ALREADY_EXISTS",RATE_LIMIT_EXCEEDED:"RATE_LIMIT_EXCEEDED",SERVICE_UNAVAILABLE:"SERVICE_UNAVAILABLE"},p={OK:200,CREATED:201,BAD_REQUEST:400,UNAUTHORIZED:401,FORBIDDEN:403,NOT_FOUND:404,CONFLICT:409,PAYLOAD_TOO_LARGE:413,UNPROCESSABLE_ENTITY:422,TOO_MANY_REQUESTS:429,INTERNAL_SERVER_ERROR:500,SERVICE_UNAVAILABLE:503}});var q={};w(q,{config:()=>R,default:()=>M});var le,Z,me,R,M,C=P(()=>{"use strict";S();le={serviceName:"MicroQueue-Mini",version:"1.0.0",dynamodb:{maxRetries:3,timeout:5e3},s3:{maxRetries:3,timeout:1e4},api:{corsOrigins:"*",rateLimit:{windowMs:60*1e3,max:100}},logging:{level:"info",format:"json"},topics:{maxTopicsPerAccount:100,defaultRetentionHours:i.DEFAULT_RETENTION_HOURS},messages:{maxSizeBytes:i.MAX_MESSAGE_SIZE_BYTES,batchSize:25},consumers:{defaultMaxMessages:i.DEFAULT_MESSAGES_PER_CONSUME,defaultWaitTimeSeconds:i.DEFAULT_WAIT_TIME_SECONDS}},Z={[N.DEV]:{logging:{level:"debug"},topics:{maxTopicsPerAccount:20}},[N.STAGING]:{logging:{level:"debug"},topics:{maxTopicsPerAccount:50}},[N.PROD]:{logging:{level:"info"},topics:{maxTopicsPerAccount:100},api:{rateLimit:{windowMs:60*1e3,max:200}}}},me=Z[u]||Z[N.DEV],R={...le,...me,env:u},M=R});var ye={};w(ye,{handler:()=>Le});module.exports=v(ye);var j=ce(K());S();S();var a=class extends Error{constructor(r,E,n,s){super(E);this.code=r,this.statusCode=n,this.details=s,this.name="AppError",Error.captureStackTrace&&Error.captureStackTrace(this,a)}toResponse(){return{success:!1,error:{code:this.code,message:this.message,details:this.details}}}},o={internalError:(e="An internal server error occurred",t)=>new a(T.INTERNAL_ERROR,e,p.INTERNAL_SERVER_ERROR,t),validationError:(e="Validation error",t)=>new a(T.VALIDATION_ERROR,e,p.BAD_REQUEST,t),resourceNotFound:(e,t)=>new a(T.RESOURCE_NOT_FOUND,`${e} with id '${t}' not found`,p.NOT_FOUND),topicNotFound:e=>new a(T.TOPIC_NOT_FOUND,`Topic '${e}' not found`,p.NOT_FOUND),topicAlreadyExists:e=>new a(T.TOPIC_ALREADY_EXISTS,`Topic with name '${e}' already exists`,p.CONFLICT),messageNotFound:e=>new a(T.MESSAGE_NOT_FOUND,`Message '${e}' not found`,p.NOT_FOUND),messageTooLarge:(e,t)=>new a(T.MESSAGE_TOO_LARGE,`Message size (${e} bytes) exceeds maximum allowed size (${t} bytes)`,p.PAYLOAD_TOO_LARGE),consumerGroupNotFound:e=>new a(T.CONSUMER_GROUP_NOT_FOUND,`Consumer group '${e}' not found`,p.NOT_FOUND),consumerGroupAlreadyExists:(e,t)=>new a(T.CONSUMER_GROUP_ALREADY_EXISTS,`Consumer group with name '${e}' already exists for topic '${t}'`,p.CONFLICT),rateLimitExceeded:()=>new a(T.RATE_LIMIT_EXCEEDED,"Rate limit exceeded",p.TOO_MANY_REQUESTS),serviceUnavailable:(e="Service temporarily unavailable")=>new a(T.SERVICE_UNAVAILABLE,e,p.SERVICE_UNAVAILABLE)},Q=e=>{if(console.error("Error:",e),e instanceof a)return{statusCode:e.statusCode,body:JSON.stringify(e.toResponse()),headers:{"Content-Type":"application/json"}};if(e.code==="ConditionalCheckFailedException"){let r=o.resourceNotFound("Resource","unknown");return{statusCode:r.statusCode,body:JSON.stringify(r.toResponse()),headers:{"Content-Type":"application/json"}}}if(e.code==="ThrottlingException"){let r=o.rateLimitExceeded();return{statusCode:r.statusCode,body:JSON.stringify(r.toResponse()),headers:{"Content-Type":"application/json"}}}let t=o.internalError(e.message||"An unexpected error occurred");return{statusCode:t.statusCode,body:JSON.stringify(t.toResponse()),headers:{"Content-Type":"application/json"}}};var ge=(e,t=16)=>{let r=(0,j.nanoid)(t);return e?`${e}_${r}`:r},J=()=>ge("topic");var de=e=>({success:!0,data:e}),k=(e,t=200)=>({statusCode:t,body:JSON.stringify(de(e)),headers:{"Content-Type":"application/json"}});var W=(e,t)=>{if(!e||!e[t])throw o.validationError(`Path parameter '${t}' is required`);return e[t]};S();var z=require("aws-sdk");C();var ee={maxRetries:R.dynamodb.maxRetries,httpOptions:{timeout:R.dynamodb.timeout}};process.env.DYNAMODB_ENDPOINT&&(ee.endpoint=process.env.DYNAMODB_ENDPOINT);var O=new z.DynamoDB.DocumentClient(ee);S();var f=(C(),v(q));var _e={error:0,warn:1,info:2,debug:3},x=_e[f.logging.level]||2,h=(e,t,r)=>{let E=new Date().toISOString(),n=process.env.AWS_REQUEST_ID||"-";if(f.logging.format==="json"){let l={timestamp:E,level:e,message:t,requestId:n,service:f.serviceName,version:f.version,env:f.env,...r?{data:r}:{}};return JSON.stringify(l)}let s=`[${E}] [${e.toUpperCase()}] [${n}] ${t}`;return r&&(s+=` ${JSON.stringify(r)}`),s},L=class{error(t,r){x>=0&&console.error(h("error",t,r))}warn(t,r){x>=1&&console.warn(h("warn",t,r))}info(t,r){x>=2&&console.info(h("info",t,r))}debug(t,r){x>=3&&console.debug(h("debug",t,r))}},c=new L,g=c;var Ae=async e=>{c.debug("Creating topic",{topicId:e.topicId});try{return await O.put({TableName:A.TOPICS,Item:e,ConditionExpression:"attribute_not_exists(topicId)"}).promise(),e}catch(t){throw c.error("Error creating topic",{error:t,topic:e}),t.code==="ConditionalCheckFailedException"?o.topicAlreadyExists(e.name):t}},y=async e=>{c.debug("Getting topic",{topicId:e});try{let t=await O.get({TableName:A.TOPICS,Key:{topicId:e}}).promise();if(!t.Item)throw o.topicNotFound(e);return t.Item}catch(t){throw c.error("Error getting topic",{error:t,topicId:e}),t.code==="ResourceNotFoundException"?o.topicNotFound(e):t}},Oe=async e=>{c.debug("Getting topic by name",{name:e});try{let t=await O.scan({TableName:A.TOPICS,FilterExpression:"#name = :name",ExpressionAttributeNames:{"#name":"name"},ExpressionAttributeValues:{":name":e},Limit:1}).promise();return t.Items&&t.Items.length>0?t.Items[0]:null}catch(t){throw c.error("Error getting topic by name",{error:t,name:e}),t}},Ne=async()=>{c.debug("Listing topics");try{return(await O.scan({TableName:A.TOPICS}).promise()).Items||[]}catch(e){throw c.error("Error listing topics",{error:e}),e}},Se=async e=>{c.debug("Deleting topic",{topicId:e});try{await O.delete({TableName:A.TOPICS,Key:{topicId:e},ConditionExpression:"attribute_exists(topicId)"}).promise()}catch(t){throw c.error("Error deleting topic",{error:t,topicId:e}),t.code==="ConditionalCheckFailedException"?o.topicNotFound(e):t}},Re=async(e,t)=>{c.debug("Incrementing topic message count",{topicId:e,timestamp:t});try{await O.update({TableName:A.TOPICS,Key:{topicId:e},UpdateExpression:"SET messageCount = messageCount + :inc, lastMessageTimestamp = :ts",ExpressionAttributeValues:{":inc":1,":ts":t},ConditionExpression:"attribute_exists(topicId)"}).promise()}catch(r){throw c.error("Error incrementing message count",{error:r,topicId:e}),r.code==="ConditionalCheckFailedException"?o.topicNotFound(e):r}},fe=async(e,t)=>{c.debug("Updating topic",{topicId:e,updates:t});let r=[],E={},n={};if(Object.entries(t).forEach(([s,l])=>{l!==void 0&&(r.push(`#${s} = :${s}`),E[`#${s}`]=s,n[`:${s}`]=l)}),r.length===0)return y(e);try{return await O.update({TableName:A.TOPICS,Key:{topicId:e},UpdateExpression:`SET ${r.join(", ")}`,ExpressionAttributeNames:E,ExpressionAttributeValues:n,ConditionExpression:"attribute_exists(topicId)",ReturnValues:"NONE"}).promise(),y(e)}catch(s){throw c.error("Error updating topic",{error:s,topicId:e}),s.code==="ConditionalCheckFailedException"?o.topicNotFound(e):s}},d={createTopic:Ae,getTopic:y,getTopicByName:Oe,listTopics:Ne,deleteTopic:Se,incrementMessageCount:Re,updateTopic:fe};C();var Ie=async e=>{if(g.debug("Creating topic",{request:e}),!e.name)throw o.validationError("Topic name is required");if(e.name.length>i.MAX_TOPIC_NAME_LENGTH)throw o.validationError(`Topic name cannot exceed ${i.MAX_TOPIC_NAME_LENGTH} characters`);if(e.description&&e.description.length>i.MAX_DESCRIPTION_LENGTH)throw o.validationError(`Topic description cannot exceed ${i.MAX_DESCRIPTION_LENGTH} characters`);let t=e.retentionPeriodHours||i.DEFAULT_RETENTION_HOURS;if(t<1)throw o.validationError("Retention period must be at least 1 hour");if(t>i.MAX_RETENTION_HOURS)throw o.validationError(`Retention period cannot exceed ${i.MAX_RETENTION_HOURS} hours`);if(await d.getTopicByName(e.name))throw o.topicAlreadyExists(e.name);if((await d.listTopics()).length>=M.topics.maxTopicsPerAccount)throw o.validationError(`Maximum number of topics (${M.topics.maxTopicsPerAccount}) reached`);let n={topicId:J(),name:e.name,description:e.description,createdAt:Date.now(),retentionPeriodHours:t,messageCount:0};return d.createTopic(n)},Me=async e=>(g.debug("Getting topic",{topicId:e}),d.getTopic(e)),Ce=async()=>(g.debug("Listing topics"),d.listTopics()),xe=async e=>(g.debug("Deleting topic",{topicId:e}),d.deleteTopic(e)),he=async(e,t)=>{if(g.debug("Updating topic",{topicId:e,updates:t}),t.name&&t.name.length>i.MAX_TOPIC_NAME_LENGTH)throw o.validationError(`Topic name cannot exceed ${i.MAX_TOPIC_NAME_LENGTH} characters`);if(t.description&&t.description.length>i.MAX_DESCRIPTION_LENGTH)throw o.validationError(`Topic description cannot exceed ${i.MAX_DESCRIPTION_LENGTH} characters`);if(t.retentionPeriodHours){if(t.retentionPeriodHours<1)throw o.validationError("Retention period must be at least 1 hour");if(t.retentionPeriodHours>i.MAX_RETENTION_HOURS)throw o.validationError(`Retention period cannot exceed ${i.MAX_RETENTION_HOURS} hours`)}if(t.name){let r=await d.getTopicByName(t.name);if(r&&r.topicId!==e)throw o.topicAlreadyExists(t.name)}return d.updateTopic(e,t)},te={createTopic:Ie,getTopic:Me,listTopics:Ce,deleteTopic:xe,updateTopic:he};var Le=async e=>{try{g.debug("Delete topic request",{event:e});let t=W(e.pathParameters,"topicId");return await te.deleteTopic(t),k({message:`Topic ${t} deleted successfully`})}catch(t){return g.error("Error deleting topic",{error:t}),Q(t)}};0&&(module.exports={handler});
//# sourceMappingURL=delete.js.map
