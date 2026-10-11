export type AgentCategory = 'document' | 'image' | 'video' | 'tool';
export type OutputKind = 'document' | 'image' | 'video' | 'audio' | 'canvas' | 'setup';
export type ModelKind = 'chat' | 'image' | 'video' | 'audio';
export type TaskState = 'running' | 'paused' | 'failed' | 'cancelled' | 'completed';
export type ProjectState = 'draft' | 'running' | 'paused' | 'failed' | 'cancelled' | 'awaiting' | 'completed';
export interface InputField { id:string; label:string; type:'text'|'textarea'|'select'|'number'; placeholder?:string; options?:string[]; defaultValue?:string; required?:boolean; }
export interface StageDefinition { id:string; title:string; description:string; approval:boolean; }
export interface AgentDefinition { id:string; name:string; subtitle:string; category:AgentCategory; icon:string; color:string; tags:string[]; fields:InputField[]; stages:StageDefinition[]; output:OutputKind; cost:number; special?:'vi'|'novel'|'script'|'digital-human'|'canvas'|'collaboration'|'installer'; }
export interface ModelDefinition { id:string; name:string; vendor:string; kind:ModelKind; description:string; price:number; context:string; tags:string[]; routes:string[]; }
export interface Version { id:string; createdAt:number; content:string; title:string; stageId:string; }
export interface StageResult { stageId:string; content:string; approved:boolean; assetIds:string[]; }
export interface Project { id:string; agentId:string; name:string; brief:string; inputs:Record<string,string>; stageIndex:number; status:ProjectState; results:StageResult[]; versions:Version[]; versionIndex:number; assetIds:string[]; createdAt:number; updatedAt:number; deleted?:boolean; }
export interface Task { id:string; projectId:string; stageIndex:number; title:string; state:TaskState; progress:number; logs:string[]; createdAt:number; updatedAt:number; failOnce:boolean; }
export interface Asset { id:string; name:string; kind:OutputKind; url:string; mime:string; size:number; projectId?:string; prompt:string; tags:string[]; favorite:boolean; published:boolean; createdAt:number; blobId?:string; content?:string; views?:number; }
export interface Message { id:string; role:'user'|'assistant'; content:string; createdAt:number; attachments:string[]; modelId:string; }
export interface Conversation { id:string; title:string; modelId:string; messages:Message[]; createdAt:number; }
export interface LedgerEntry { id:string; label:string; amount:number; createdAt:number; projectId?:string; }
export interface ApiKey { id:string; name:string; value:string; createdAt:number; enabled:boolean; }
export interface ApiLog { id:string; endpoint:string; model:string; status:number; latency:number; tokens:number; createdAt:number; request:string; response:string; }
export interface Memory { id:string; text:string; createdAt:number; }
export interface HumanProfile { id:string; name:string; imageAssetId:string; voice:string; }
export interface Preferences { theme:'dark'|'light'; language:'zh-CN'|'en'; privacy:boolean; enterToSend:boolean; memoryEnabled:boolean; pinnedModels:string[]; favoriteAgents:string[]; selectedSkills:string[]; }
export interface Feedback { id:string; text:string; category:string; createdAt:number; }
export interface DemoState { hydrated:boolean; storageError?:string; projects:Project[]; tasks:Task[]; assets:Asset[]; conversations:Conversation[]; ledger:LedgerEntry[]; keys:ApiKey[]; apiLogs:ApiLog[]; memories:Memory[]; profiles:HumanProfile[]; feedback:Feedback[]; points:number; account:{loggedIn:boolean; name:string; email:string}; preferences:Preferences; }
export type StudioView = 'agents'|'models'|'inspiration'|'assets'|'projects'|'tasks'|'api'|'account'|'help';
export interface WorkspaceNavigation { onNavigate:(view:StudioView, id?:string)=>void; onOpenAgent:(id:string, inputs?:Record<string,string>)=>void; onOpenProject:(id:string)=>void; }
