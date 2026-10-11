import { AGENTS, MODELS } from './catalog';
import { MockService } from './service';
interface Tool { name:string; title:string; description:string; inputSchema:object; annotations:{readOnlyHint:boolean}; execute:(input:unknown)=>unknown|Promise<unknown>; }
interface ModelContext { registerTool:(tool:Tool,options:{signal:AbortSignal})=>void|Promise<void>; }
function object(input:unknown){if(!input||typeof input!=='object'||Array.isArray(input))throw Error('输入必须为对象');return input as Record<string,unknown>;}
export function registerDemoTools(){
 const context=(document as Document&{modelContext?:ModelContext}).modelContext;
 if(!context?.registerTool)return ()=>{};
 const life=new AbortController();
 const tools:Tool[]=[
 {name:'linkeai_list_catalog',title:'查看演示目录',description:'读取本地演示的智能体和模型目录。',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true},execute(){return {agents:AGENTS.map(a=>({id:a.id,name:a.name,category:a.category})),models:MODELS.map(m=>({id:m.id,name:m.name,kind:m.kind}))};}},
 {name:'linkeai_list_projects',title:'读取本地项目',description:'读取当前浏览器中已保存的项目及阶段状态。',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true},execute(){return {projects:MockService.getState().projects.filter(p=>!p.deleted).map(p=>({id:p.id,name:p.name,agentId:p.agentId,status:p.status,stageIndex:p.stageIndex}))};}},
 {name:'linkeai_create_project',title:'创建演示项目',description:'在当前浏览器创建一个草稿项目，不开始生成。',inputSchema:{type:'object',properties:{agentId:{type:'string'},brief:{type:'string'}},required:['agentId','brief'],additionalProperties:false},annotations:{readOnlyHint:false},async execute(input){const data=object(input);if(typeof data.agentId!=='string'||!AGENTS.some(a=>a.id===data.agentId)||typeof data.brief!=='string'||!data.brief.trim())throw Error('请提供有效的智能体 ID 和需求文本');await MockService.initialize();const id=MockService.createProject(data.agentId,{brief:data.brief});return {id,status:'draft'};}},
 ];
 for(const tool of tools){try{void Promise.resolve(context.registerTool(tool,{signal:life.signal})).catch(()=>{});}catch{/* Optional browser proposal; normal UI remains available. */}}
 return()=>life.abort();
}
