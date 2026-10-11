import { openDB, type IDBPDatabase } from 'idb';
import { AGENTS, GALLERY, MODELS } from './catalog';
import type { AgentDefinition, Asset, DemoState, Project, Task, Preferences, HumanProfile, ApiLog } from './types';

const uid=(prefix='id')=>`${prefix}-${typeof crypto!=='undefined'&&crypto.randomUUID?crypto.randomUUID():Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,9)}`;
const stamp=Date.UTC(2026,9,9,6);
export const DEFAULT_PREFERENCES:Preferences={theme:'dark',language:'zh-CN',privacy:false,enterToSend:true,memoryEnabled:true,pinnedModels:['model-1','model-2','model-4'],favoriteAgents:['novel-studio','brand-vi','story-video'],selectedSkills:['文案润色','结构化写作']};
const firstContent='# 星河咖啡 · 新品视觉方案\n\n## 创作目标\n以一杯咖啡的温度连接城市与自然，为秋季新品设计一组电影感主图。\n\n## 核心视觉\n暖金色晨光、天然材质、柔和的背景景深。产品保持清晰，留出品牌信息空间。\n\n## 文案\n慢下来，让一杯好咖啡点亮今天。\n\n## 交付清单\n产品主图、场景图、品牌海报与可编辑的文案。';
function initialState():DemoState {
 const project:Project={id:'project-coffee',agentId:'ecommerce-images-s2',name:'星河咖啡 · 秋日新品',brief:'为星河咖啡设计秋日新品主图和宣传文案',inputs:{brief:'为星河咖啡设计秋日新品主图和宣传文案',style:'电影质感',count:'4',ratio:'3:4'},stageIndex:3,status:'completed',results:[{stageId:'delivery',content:firstContent,approved:true,assetIds:['sample-coffee']}],versions:[{id:'version-coffee',title:'已完成 · 视觉方案',content:firstContent,stageId:'delivery',createdAt:stamp}],versionIndex:0,assetIds:['sample-coffee'],createdAt:stamp-86400000,updatedAt:stamp};
 const novel:Project={id:'project-novel',agentId:'novel-studio',name:'最后一盏星灯',brief:'一个星际修灯师寻找消失的故乡',inputs:{brief:'一个星际修灯师寻找消失的故乡',genre:'科幻',length:'4',intent:'新作'},stageIndex:1,status:'awaiting',results:[{stageId:'world',content:'# 最后一盏星灯\n\n## 世界观\n星际航路由古老的星灯维系，每盏星灯保存一段旅行者的记忆。\n\n## 人物\n林舟：星灯修理师，寻找被地图抹去的故乡。\n阿澄：记录星灯信号的导航员。\n\n## 核心冲突\n修好最后一盏灯意味着失去一段最珍贵的记忆。',approved:false,assetIds:[]}],versions:[],versionIndex:0,assetIds:[],createdAt:stamp-3600000,updatedAt:stamp};
 return {hydrated:false,projects:[project,novel],tasks:[],assets:[...GALLERY,{...GALLERY[1],id:'sample-coffee',name:'秋日新品 · 示例主图',projectId:project.id,published:false}, {id:'sample-video',name:'星夜短片 · 视频示例',kind:'video',url:'/media/demo-video.mp4',mime:'video/mp4',size:1600000,prompt:'星夜梦境的缓慢镜头，电影感光影',tags:['视频','示例'],favorite:false,published:true,createdAt:stamp},{id:'sample-audio',name:'星河序曲 · 音乐示例',kind:'audio',url:'/media/demo-audio.wav',mime:'audio/wav',size:700000,prompt:'轻柔的合成音色与舒缓旋律',tags:['音频','示例'],favorite:false,published:false,createdAt:stamp}],conversations:[],ledger:[{id:'ledger-welcome',label:'演示账号初始积分',amount:1000,createdAt:stamp}],keys:[{id:'key-default',name:'我的演示密钥',value:'sk-demo-linkeai-local-0001',createdAt:stamp,enabled:true}],apiLogs:[],memories:[{id:'memory-1',text:'回答默认使用简体中文，表达简洁清晰。',createdAt:stamp},{id:'memory-2',text:'星河咖啡品牌偏好温暖的电影感光影。',createdAt:stamp}],profiles:[{id:'profile-lin',name:'林晓 · 温暖女声',imageAssetId:'gallery-4',voice:'温暖女声'},{id:'profile-chen',name:'陈川 · 沉稳男声',imageAssetId:'gallery-1',voice:'沉稳男声'}],feedback:[],points:1000,account:{loggedIn:true,name:'演示创作者',email:'creator@demo.invalid'},preferences:{...DEFAULT_PREFERENCES}};
}
let state=initialState();
const serverState=state;
const listeners=new Set<()=>void>();
const timers=new Map<string,ReturnType<typeof setTimeout>>();
let db:IDBPDatabase|undefined;
let initPromise:Promise<void>|undefined;
let persistence:Promise<unknown>=Promise.resolve();
const emit=()=>listeners.forEach(fn=>fn());
function persist(){
 if(!state.hydrated)return;
 const snapshot={...state,hydrated:false,storageError:undefined};
 persistence=persistence.catch(()=>{}).then(async()=>{if(db)await db.put('state',snapshot,'current');});
 persistence.catch(()=>{state={...state,storageError:'本地存储写入失败，请检查可用空间。当前页面仍可使用。'};emit();});
 try{localStorage.setItem('linkeai-preferences',JSON.stringify(state.preferences));}catch{/* IndexedDB retains the snapshot when preference storage is unavailable. */}
}
function change(update:(current:DemoState)=>DemoState){state=update(state);emit();persist();}
function patchProject(id:string,patch:Partial<Project>){change(s=>({...s,projects:s.projects.map(p=>p.id===id?{...p,...patch,updatedAt:Date.now()}:p)}));}
function projectById(id:string){const p=state.projects.find(p=>p.id===id&&!p.deleted);if(!p)throw Error('项目不存在或已移入回收站');return p;}
function agentById(id:string){const a=AGENTS.find(a=>a.id===id);if(!a)throw Error('未找到智能体');return a;}
const delay=(ms:number)=>new Promise<void>(resolve=>setTimeout(resolve,ms));
function chapterCount(p:Project){return Math.min(20,Math.max(1,parseInt(p.inputs.length||'4')||4));}
const hash=(text:string)=>[...text].reduce((h,c)=>(h*31+c.charCodeAt(0))>>>0,7);
function mockContent(a:AgentDefinition,p:Project,stageId:string){
 const brief=p.inputs.brief||p.brief||p.name;
 const intro=`# ${p.name}\n\n创作需求：${brief}\n\n`;
 if(a.special==='installer'){
 const config={client:a.name,endpoint:p.inputs.endpoint||'https://api.demo.invalid/v1',apiKey:'sk-demo-local-only',model:p.inputs.model||'GPT-4.1',platform:p.inputs.platform||'macOS',simulation:true};
 return intro+'## 配置预览\n```json\n'+JSON.stringify(config,null,2)+'\n```\n\n## 本地模拟步骤\n1. 检查系统与目录\n2. 生成配置文件\n3. 模拟连接检查\n4. 完成演示安装\n\n这些步骤仅记录在本地项目中。';
 }
 if(stageId==='requirements'||stageId==='direction')return intro+`## 需求确认\n目标：${brief}\n受众：${p.inputs.audience||'对主题感兴趣的创作者'}\n风格：${p.inputs.style||p.inputs.genre||'专业、清晰、富有表现力'}\n\n## 创作方向\n围绕一个明确的主题建立叙事，用具体细节传达情感，以完整可编辑的内容交付。\n\n## 本次交付\n${a.output==='video'?'角色、场景、分镜、配音和示例成片':a.output==='image'?'视觉方案、图片及配套文案':a.output==='document'?'结构大纲、完整正文和可编辑文件':'配置方案与本地演示结果'}`;
 if(stageId==='world')return intro+'## 世界设定\n在跨越星河的航路上，每一盏灯记录了一座城的故事。\n\n## 主要人物\n林舟：沉默而执着的修灯师，对故乡保留模糊记忆。\n阿澄：好奇、敏锐的领航员，能辨认微弱的星灯信号。\n\n## 人物关系\n他们因为一次偶然维修相遇，在共同旅途中学会信任。\n\n## 核心冲突\n寻找答案需要作出选择，而每次选择都会改变记忆。';
 if(stageId==='outline')return intro+'## 内容大纲\n'+Array.from({length:chapterCount(p)},(_,i)=>`### ${a.id==='ppt'?'第 '+(i+1)+' 页':'第 '+(i+1)+' 章'} · ${['出发与目标','线索与选择','变化与冲突','答案与新旅程'][i%4]}\n${i===0?'交代主题、背景与核心问题。':i===chapterCount(p)-1?'回扣主题，形成完整结论与行动建议。':'通过关键细节展开内容，呈现过程与转折。'}`).join('\n\n');
 if(stageId==='characters')return intro+'## 角色锁定\n主角：林晓，年轻创作者，干净利落的服装，始终保持相同面部特征。\n配角：陈川，沉稳温和的同行者。\n\n## 场景锁定\n清晨的城市街角、温暖室内和开阔星空。\n\n## 风格一致性\n电影感柔光，低饱和蓝与暖金，镜头克制。\n\n## 声音\n'+(p.inputs.voice||'温暖女声');
 if(stageId==='storyboard')return intro+'## 分镜脚本\n'+Array.from({length:4},(_,i)=>`### 镜头 ${i+1} · ${i*5}–${(i+1)*5} 秒\n画面：${['远景建立环境，晨光缓缓进入画面','中景展示主体，镜头轻轻推进','近景记录细节，表现关键动作','远景收束，主题文字浮现'][i]}\n运镜：${['缓慢推入','平移','细节特写','拉远'][i]}\n配音：${['每个灵感，都从一个瞬间开始。','我们用细节，让它逐渐清晰。','让想象有形，让表达有声。','你的下一个故事，就从这里开始。'][i]}\n字幕：与配音同步，保持两行以内。`).join('\n\n');
 if(stageId==='logo')return intro+'## Logo 方向\n### 方向 1 · 星环\n几何圆环与留白，传递连接和探索。\n### 方向 2 · 光点\n简洁的聚合形态，强调灵感与生长。\n### 方向 3 · 字标\n围绕品牌名称建立易辨认的字标。\n\n请选择一个方向，再延展品牌物料。';
 if(stageId==='materials')return intro+`## 已锁定 Logo\n${p.inputs.logo||'方向 1'}\n\n## 品牌色\n午夜蓝 #172437、星光白 #F4F8FC、晨光金 #D6AD71。\n\n## 延展物料\n名片、包装、社交媒体头像、品牌海报。全部遵循同一 Logo 与色彩规范。\n\n## 使用规范\n保留安全区域，避免拉伸，确保浅色与深色背景的辨识度。`;
 if(a.special==='collaboration')return intro+'## 模型 A · 结构\n先明确目标与约束，再将工作分为研究、创作和审校三个阶段。\n\n## 模型 B · 表达\n从一个具体场景出发，使用简洁语言建立清晰的叙事线索。\n\n## 模型 C · 执行\n每个阶段设置可检查的产物，完成后再继续下一步。\n\n## 汇总建议\n结合结构、表达与执行三个角度，先确认大纲，再完善细节。';
 if(a.category==='document'){
 const oldOutline=p.results.find(r=>r.stageId==='outline')?.content;
 const source=p.results.find(r=>r.stageId==='draft')?.content;
 if(stageId==='delivery'&&source)return source+'\n\n---\n审校完成：本版本保留已确认的结构与正文，可继续编辑后导出。';
 if(a.special==='novel'||a.special==='script')return intro+Array.from({length:chapterCount(p)},(_,i)=>`## 第 ${i+1} ${a.special==='script'?'集':'章'} · ${['星灯亮起','消失的航路','记忆的边缘','回到光里'][i%4]}\n\n${a.special==='script'?'场景：星际港口，夜。\n人物：林舟、阿澄。\n动作：一束微弱的光穿过窗口。\n林舟：这盏灯，还记得我们来过。\n阿澄：那就跟着它，再走一次。':'林舟推开维修舱的门，微弱的星光落在他的指尖。远处的航路像一条安静的河，等待着有人读懂它留下的信号。\n\n阿澄将一张旧地图铺在桌上。那张地图的边缘被时间磨得发白，却仍然标记着一个没有名字的地方。他们决定从这里出发，把失落的故事重新连接起来。'}\n\n创作主题：${brief}`).join('\n\n');
 return intro+(oldOutline?oldOutline.replace(/^#.*\n/,'')+'\n\n':'')+Array.from({length:chapterCount(p)},(_,i)=>`## ${a.id==='ppt'?'第 '+(i+1)+' 页':'章节 '+(i+1)} · ${['背景与目标','核心分析','实施路径','总结与建议'][i%4]}\n\n${brief}。本节围绕主题展开，明确可观察的问题、使用场景和交付标准。以清晰的结构组织信息，用具体事例说明观点，并在末尾形成可以执行的建议。\n\n要点：\n- 确定目标和约束。\n- 梳理必要的材料与步骤。\n- 按阶段确认结果并保留版本。`).join('\n\n')+(a.id==='stock-research'?'\n\n示例公司与数值均为虚构，本报告仅用于演示。':'');
 }
 if(a.category==='image')return intro+`## 视觉方案\n风格：${p.inputs.style||'电影质感'}\n画幅：${p.inputs.ratio||'3:4'}\n数量：${Math.min(12,parseInt(p.inputs.count||'4')||4)}\n\n## 图片清单\n1. 主体展示：保持清晰的层次与留白。\n2. 使用场景：自然光线与真实的空间感。\n3. 细节表达：呈现材质、纹理与关键特征。\n4. 品牌海报：简洁文案与一致的视觉风格。\n\n## 配套文案\n让每一个灵感，都成为可以看见的作品。\n\n${a.special==='vi'?'锁定 Logo：'+p.inputs.logo+'。所有物料遵循同一方向。':'示例图片来自本地素材，用于呈现生成流程。'}`;
 if(a.category==='video')return intro+'## 成片交付\n已整理角色、场景、分镜、配音与字幕。\n\n示例成片和音轨可在右侧预览。你可以回到任何一个阶段，调整内容后再次生成。\n\n## 字幕\n1\n00:00:00,000 --> 00:00:04,000\n每个灵感，都从一个瞬间开始。\n\n2\n00:00:04,000 --> 00:00:08,000\n让想象有形，让表达有声。';
 return intro+'## 工作方案\n已确认输入、模型与执行步骤。\n\n## 本地演示结果\n配置与创作结果已保存，可继续编辑或导出。';
}
function newMedia(kind:Asset['kind'],name:string,prompt:string,index=0,projectId?:string):Asset {
 const image=GALLERY[index%GALLERY.length];
 return {id:uid('asset'),name,kind,url:kind==='video'?'/media/demo-video.mp4':kind==='audio'?'/media/demo-audio.wav':kind==='image'?image.url:'',mime:kind==='video'?'video/mp4':kind==='audio'?'audio/wav':kind==='image'?image.mime:'text/plain',size:kind==='video'?1600000:kind==='audio'?700000:image.size,projectId,prompt,tags:[kind==='image'?'图像':kind==='video'?'视频':kind==='audio'?'音频':'文档','本地生成'],favorite:false,published:false,createdAt:Date.now()};
}
function outputAssets(a:AgentDefinition,p:Project,content:string,stageId:string):Asset[]{
 const seed=hash(a.id+p.brief), count=Math.min(12,Math.max(1,parseInt(p.inputs.count||'4')||4));
 if(stageId==='logo')return Array.from({length:3},(_,i)=>({...newMedia('image',`Logo 方向 ${i+1}`,content,(seed+i)%20,p.id),url:`/media/logo-${i+1}.svg`,mime:'image/svg+xml',tags:['Logo','方案','本地示例']}));
 if(stageId==='frames')return [newMedia('image','关键帧 01',p.brief,5,p.id),newMedia('image','关键帧 02',p.brief,8,p.id),newMedia('audio','配音示例音轨',p.brief,0,p.id)];
 if(stageId!==a.stages[a.stages.length-1].id&&stageId!=='generate')return [];
 if(a.output==='image')return Array.from({length:count},(_,i)=>newMedia('image',`${p.name} · ${String(i+1).padStart(2,'0')}`,content,(seed+i)%20,p.id));
 if(a.output==='video')return [newMedia('video',`${p.name} · 示例成片`,p.brief,0,p.id),newMedia('audio',`${p.name} · 示例音轨`,p.brief,0,p.id)];
 return [{...newMedia(a.output,p.name,p.brief,0,p.id),content,mime:a.output==='setup'||a.output==='canvas'?'application/json':'text/plain',size:new Blob([content]).size}];
}
function stopTimer(id:string){const timer=timers.get(id);if(timer)clearTimeout(timer);timers.delete(id);}
function scheduleTask(taskId:string){
 stopTimer(taskId);
 const tick=()=>{
 const task=state.tasks.find(t=>t.id===taskId);if(!task||task.state!=='running')return;
 const project=state.projects.find(p=>p.id===task.projectId);if(!project||project.deleted){stopTimer(taskId);return;}
 const progress=Math.min(100,task.progress+11);
 if(task.failOnce&&progress>=55){change(s=>({...s,tasks:s.tasks.map(t=>t.id===taskId?{...t,state:'failed',progress,logs:[...t.logs,'模拟错误：生成服务暂时不可用。可以重试。'],updatedAt:Date.now()}:t),projects:s.projects.map(p=>p.id===project.id?{...p,status:'failed',updatedAt:Date.now()}:p)}));stopTimer(taskId);return;}
 if(progress<100){change(s=>({...s,tasks:s.tasks.map(t=>t.id===taskId?{...t,progress,updatedAt:Date.now(),logs:progress===33?[...t.logs,'正在组织内容与生成示例…']:progress===77?[...t.logs,'正在校验结果并保存到本地…']:t.logs}:t)}));timers.set(taskId,setTimeout(tick,140));return;}
 const a=agentById(project.agentId), stage=a.stages[task.stageIndex], content=mockContent(a,project,stage.id), assets=outputAssets(a,project,content,stage.id), last=task.stageIndex===a.stages.length-1;
 const version={id:uid('version'),title:`${stage.title} · v${project.versions.length+1}`,content,stageId:stage.id,createdAt:Date.now()};
 change(s=>({...s,tasks:s.tasks.map(t=>t.id===taskId?{...t,state:'completed',progress:100,logs:[...t.logs,'阶段结果已保存。'],updatedAt:Date.now()}:t),projects:s.projects.map(p=>p.id===project.id?{...p,status:last?'completed':'awaiting',stageIndex:task.stageIndex,results:[...p.results.filter(r=>r.stageId!==stage.id),{stageId:stage.id,content,approved:last,assetIds:assets.map(a=>a.id)}],versions:[...p.versions,version],versionIndex:p.versions.length,assetIds:[...p.assetIds,...assets.map(a=>a.id)],updatedAt:Date.now()}:p),assets:[...assets,...s.assets],points:last?s.points-a.cost:s.points,ledger:last?[{id:uid('ledger'),label:`${a.name} · 项目生成`,amount:-a.cost,projectId:project.id,createdAt:Date.now()},...s.ledger]:s.ledger}));stopTimer(taskId);
 };
 timers.set(taskId,setTimeout(tick,140));
}
export const MockService={
 getState:()=>state,
 getSnapshot:()=>state,
 getServerSnapshot:()=>serverState,
 subscribe:(listener:()=>void)=>{listeners.add(listener);return ()=>{listeners.delete(listener);};},
 initialize:():Promise<void>=>{
 if(initPromise)return initPromise;
 initPromise=(async()=>{
 let saved:Partial<DemoState>|undefined, storageError:string|undefined;
 try{db=await openDB('linkeai-local-demo',1,{upgrade(db){db.createObjectStore('state');db.createObjectStore('blobs');}});saved=await db.get('state','current');}catch{storageError='当前浏览器无法使用本地持久存储，刷新后会恢复初始演示数据。';}
 const defaults=initialState();
 state={...defaults,...saved,preferences:{...DEFAULT_PREFERENCES,...saved?.preferences},hydrated:true,storageError,feedback:saved?.feedback||[]};
 try{const stored=localStorage.getItem('linkeai-preferences');if(stored)state.preferences={...state.preferences,...JSON.parse(stored)};}catch{}
 state={...state,tasks:state.tasks.map(t=>t.state==='running'?{...t,state:'paused',logs:[...t.logs,'页面刷新，任务已暂停；点击继续恢复。']}:t),projects:state.projects.map(p=>p.status==='running'?{...p,status:'paused'}:p)};
 emit();persist();
 })();return initPromise;
 },
 flush:async()=>{await persistence;},
 createProject:(agentId:string,inputs:Record<string,string>={})=>{
 const a=agentById(agentId), defaults=Object.fromEntries(a.fields.map(f=>[f.id,f.defaultValue||'']));
 const data={...defaults,...inputs}, name=data.name||data.brand||data.brief?.trim().slice(0,24)||`${a.name} · 新项目`;
 const p:Project={id:uid('project'),agentId,name,brief:data.brief||'',inputs:data,stageIndex:0,status:'draft',results:[],versions:[],versionIndex:0,assetIds:[],createdAt:Date.now(),updatedAt:Date.now()};
 change(s=>({...s,projects:[p,...s.projects]}));return p.id;
 },
 updateProject:(id:string,patch:Partial<Project>)=>{projectById(id);patchProject(id,patch);},
 startProject:(id:string,failOnce=false)=>{
 const p=projectById(id), a=agentById(p.agentId);
 if(!state.account.loggedIn)throw Error('请先登录演示账号');
 if(state.tasks.some(t=>t.projectId===id&&t.state==='running'))return;
 if(state.points<a.cost)throw Error('演示积分不足，请在账号页模拟充值');
 const stageIndex=Math.min(p.stageIndex,a.stages.length-1);
 const task:Task={id:uid('task'),projectId:id,stageIndex,title:a.stages[stageIndex].title,state:'running',progress:0,logs:['任务已创建，正在读取项目输入…'],createdAt:Date.now(),updatedAt:Date.now(),failOnce};
 change(s=>({...s,projects:s.projects.map(p=>p.id===id?{...p,status:'running',updatedAt:Date.now()}:p),tasks:[task,...s.tasks]}));scheduleTask(task.id);
 },
 approveStage:(id:string,content?:string)=>{
 const p=projectById(id),a=agentById(p.agentId),stage=a.stages[p.stageIndex];
 if(p.status!=='awaiting')return;
 if(a.special==='vi'&&stage.id==='logo'&&!p.inputs.logo)throw Error('请先选择并锁定一个 Logo 方向');
 const finalContent=content??p.results.find(r=>r.stageId===stage.id)?.content??'';
 patchProject(id,{results:p.results.map(r=>r.stageId===stage.id?{...r,content:finalContent,approved:true}:r),stageIndex:Math.min(p.stageIndex+1,a.stages.length-1),status:'draft'});
 MockService.startProject(id);
 },
 pauseTask:(id:string)=>{stopTimer(id);const t=state.tasks.find(t=>t.id===id);if(!t||t.state!=='running')return;change(s=>({...s,tasks:s.tasks.map(t=>t.id===id?{...t,state:'paused',logs:[...t.logs,'任务已暂停。']}:t),projects:s.projects.map(p=>p.id===t.projectId?{...p,status:'paused'}:p)}));},
 resumeTask:(id:string)=>{const t=state.tasks.find(t=>t.id===id);if(!t||t.state!=='paused')return;change(s=>({...s,tasks:s.tasks.map(t=>t.id===id?{...t,state:'running',logs:[...t.logs,'继续执行任务。']}:t),projects:s.projects.map(p=>p.id===t.projectId?{...p,status:'running'}:p)}));scheduleTask(id);},
 cancelTask:(id:string)=>{stopTimer(id);const t=state.tasks.find(t=>t.id===id);if(!t||t.state==='completed')return;change(s=>({...s,tasks:s.tasks.map(t=>t.id===id?{...t,state:'cancelled',logs:[...t.logs,'任务已取消，已有内容仍保留。']}:t),projects:s.projects.map(p=>p.id===t.projectId?{...p,status:'cancelled'}:p)}));},
 retryTask:(id:string)=>{const t=state.tasks.find(t=>t.id===id);if(!t||!['failed','cancelled'].includes(t.state))return;change(s=>({...s,tasks:s.tasks.map(t=>t.id===id?{...t,state:'running',progress:0,failOnce:false,logs:[...t.logs,'重试任务，重新开始当前阶段。']}:t),projects:s.projects.map(p=>p.id===t.projectId?{...p,status:'running'}:p)}));scheduleTask(id);},
 saveVersion:(id:string,content:string,title?:string)=>{const p=projectById(id);const stageId=agentById(p.agentId).stages[p.stageIndex].id;const version={id:uid('version'),content,title:title||`手动编辑 · v${p.versions.length+1}`,stageId,createdAt:Date.now()};change(s=>({...s,projects:s.projects.map(p=>p.id===id?{...p,versions:[...p.versions,version],versionIndex:p.versions.length,results:p.results.map(r=>r.stageId===stageId?{...r,content}:r),updatedAt:Date.now()}:p),assets:s.assets.map(a=>a.projectId===id&&a.kind==='document'?{...a,content,size:new Blob([content]).size}:a)}));},
 selectVersion:(id:string,index:number)=>{const p=projectById(id);if(index>=0&&index<p.versions.length)patchProject(id,{versionIndex:index});},
 restoreVersion:(id:string,index:number)=>{const p=projectById(id),v=p.versions[index];if(v)MockService.saveVersion(id,v.content,`恢复：${v.title}`);},
 duplicateProject:(id:string)=>{const p=projectById(id),newId=uid('project');change(s=>({...s,projects:[{...structuredClone(p),id:newId,name:`${p.name} · 副本`,status:'draft',deleted:false,createdAt:Date.now(),updatedAt:Date.now()},...s.projects]}));return newId;},
 deleteProject:(id:string)=>{state.tasks.filter(t=>t.projectId===id&&t.state==='running').forEach(t=>MockService.cancelTask(t.id));patchProject(id,{deleted:true});},
 restoreProject:(id:string)=>{patchProject(id,{deleted:false});},
 setPreferences:(patch:Partial<Preferences>)=>change(s=>({...s,preferences:{...s.preferences,...patch}})),
 togglePinnedModel:(id:string)=>change(s=>({...s,preferences:{...s.preferences,pinnedModels:s.preferences.pinnedModels.includes(id)?s.preferences.pinnedModels.filter(x=>x!==id):[...s.preferences.pinnedModels,id]}})),
 toggleFavoriteAgent:(id:string)=>change(s=>({...s,preferences:{...s.preferences,favoriteAgents:s.preferences.favoriteAgents.includes(id)?s.preferences.favoriteAgents.filter(x=>x!==id):[...s.preferences.favoriteAgents,id]}})),
 toggleFavoriteAsset:(id:string)=>change(s=>({...s,assets:s.assets.map(a=>a.id===id?{...a,favorite:!a.favorite}:a)})),
 publishAsset:(id:string,published=true)=>change(s=>({...s,assets:s.assets.map(a=>a.id===id?{...a,published}:a)})),
 renameAsset:(id:string,name:string)=>{if(name.trim())change(s=>({...s,assets:s.assets.map(a=>a.id===id?{...a,name:name.trim()}:a)}));},
 removeAsset:(id:string)=>change(s=>({...s,assets:s.assets.filter(a=>a.id!==id)})),
 addAsset:(data:Partial<Asset>)=>{const asset={...newMedia(data.kind||'image',data.name||'新素材',data.prompt||''),...data,id:uid('asset')};change(s=>({...s,assets:[asset,...s.assets]}));return asset.id;},
 importFiles:async(files:File[])=>{
 await MockService.initialize();const assets:Asset[]=[];
 for(const file of files){if(file.size>100*1024*1024)throw Error(`${file.name} 超过100MB的本地演示限制`);const kind:Asset['kind']=file.type.startsWith('image/')?'image':file.type.startsWith('video/')?'video':file.type.startsWith('audio/')?'audio':'document';const id=uid('asset');if(db)await db.put('blobs',file,id);const content=kind==='document'&&(/text|json/.test(file.type)||/\.(txt|md|json|csv)$/i.test(file.name))?await file.text():undefined;assets.push({id,blobId:id,name:file.name,kind,url:db?'':URL.createObjectURL(file),mime:file.type||'application/octet-stream',size:file.size,prompt:'本地导入素材',tags:['本地导入'],favorite:false,published:false,createdAt:Date.now(),content});}
 change(s=>({...s,assets:[...assets,...s.assets]}));return assets;
 },
 assetBlob:async(asset:Asset):Promise<Blob>=>{
 await MockService.initialize();if(asset.blobId&&db){const blob=await db.get('blobs',asset.blobId);if(blob)return blob;}
 if(asset.content!==undefined)return new Blob([asset.content],{type:asset.mime});
 if(!asset.url)throw Error('素材文件不可用');const response=await fetch(asset.url);if(!response.ok)throw Error('本地示例文件加载失败');return response.blob();
 },
 assetUrl:async(asset:Asset)=>asset.url||URL.createObjectURL(await MockService.assetBlob(asset)),
 addMemory:(text:string)=>{if(text.trim())change(s=>({...s,memories:[{id:uid('memory'),text:text.trim(),createdAt:Date.now()},...s.memories]}));},
 removeMemory:(id:string)=>change(s=>({...s,memories:s.memories.filter(m=>m.id!==id)})),
 addProfile:(profile:Omit<HumanProfile,'id'>)=>{const id=uid('profile');change(s=>({...s,profiles:[{...profile,id},...s.profiles]}));return id;},
 createConversation:(modelId:string)=>{const id=uid('conversation');change(s=>({...s,conversations:[{id,title:'新的对话',modelId,messages:[],createdAt:Date.now()},...s.conversations]}));return id;},
 sendMessage:async(conversationId:string,text:string,attachments:string[]=[],parameters:Record<string,string>={})=>{
 const c=state.conversations.find(c=>c.id===conversationId);if(!c)throw Error('会话不存在');if(!text.trim()&&!attachments.length)throw Error('请输入内容或添加附件');if(!state.account.loggedIn)throw Error('请先登录演示账号');const model=MODELS.find(m=>m.id===c.modelId)||MODELS[0];if(state.points<model.price)throw Error('演示积分不足');
 const msg={id:uid('message'),role:'user' as const,content:text,attachments,modelId:c.modelId,createdAt:Date.now()};change(s=>({...s,conversations:s.conversations.map(c=>c.id===conversationId?{...c,title:c.messages.length?c.title:text.slice(0,24)||'附件对话',messages:[...c.messages,msg]}:c)}));
 await delay(700);
 const answer=`这是 ${model.name} 的本地模拟回答。\n\n针对「${text||'所选附件'}」，可以从以下几个方面展开：\n\n1. 明确目标：将需求拆分为可以检查的交付结果。\n2. 组织内容：先建立结构，再用具体场景与细节补充。\n3. 形成方案：保留可编辑版本，根据反馈逐步调整。\n\n${attachments.length?`已引用 ${attachments.length} 份本地素材，仅在当前浏览器中使用。\n\n`:''}${state.preferences.memoryEnabled&&state.memories.length?'已应用偏好：'+state.memories[0].text+'\n\n':''}${parameters.route?'模拟线路：'+parameters.route+'。':''}你可以继续提问，或把这个思路交给创作智能体。`;
 change(s=>({...s,conversations:s.conversations.map(c=>c.id===conversationId?{...c,messages:[...c.messages,{id:uid('message'),role:'assistant',content:answer,attachments:[],modelId:c.modelId,createdAt:Date.now()}]}:c),points:s.points-model.price,ledger:[{id:uid('ledger'),label:`${model.name} · 模拟对话`,amount:-model.price,createdAt:Date.now()},...s.ledger]}));
 },
 generateMedia:async(modelId:string,prompt:string,parameters:Record<string,string>={},attachmentIds:string[]=[])=>{
 const model=MODELS.find(m=>m.id===modelId)||MODELS[8];if(!state.account.loggedIn)throw Error('请先登录演示账号');if(state.points<model.price)throw Error('演示积分不足');if(!prompt.trim())throw Error('请输入创作描述');await delay(1000);const kind:Asset['kind']=model.kind==='video'?'video':model.kind==='audio'?'audio':'image';const count=kind==='image'?Math.min(8,Math.max(1,parseInt(parameters.count||'1')||1)):1;
 const assets=Array.from({length:count},(_,i)=>newMedia(kind,`${model.name} · ${prompt.slice(0,20)}${count>1?' · '+(i+1):''}`,prompt,hash(prompt+modelId)+i));
 assets.forEach(a=>{a.tags.push(parameters.ratio||'示例画幅');if(attachmentIds.length)a.tags.push('引用素材');});change(s=>({...s,assets:[...assets,...s.assets],points:s.points-model.price,ledger:[{id:uid('ledger'),label:`${model.name} · 模拟生成`,amount:-model.price,createdAt:Date.now()},...s.ledger]}));return assets;
 },
 addApiKey:(name:string)=>{const id=uid('key');change(s=>({...s,keys:[{id,name:name.trim()||'新演示密钥',value:`sk-demo-${uid('local')}`,createdAt:Date.now(),enabled:true},...s.keys]}));return id;},
 toggleApiKey:(id:string)=>change(s=>({...s,keys:s.keys.map(k=>k.id===id?{...k,enabled:!k.enabled}:k)})),
 deleteApiKey:(id:string)=>change(s=>({...s,keys:s.keys.filter(k=>k.id!==id)})),
 callApi:async(endpoint:string,modelId:string,prompt:string,forceError=false):Promise<ApiLog>=>{
 const model=MODELS.find(m=>m.id===modelId)||MODELS[0];await delay(600);const status=forceError?429:200;
 let payload:unknown=endpoint.includes('models')?{data:MODELS.map(m=>({id:m.id,object:'model',owned_by:m.vendor}))}:endpoint.includes('balance')?{balance:state.points,currency:'demo_points'}:endpoint.includes('tasks')?{data:state.tasks}:endpoint.includes('memory')?{data:state.memories}:model.kind==='chat'?{id:uid('completion'),object:'chat.completion',model:model.name,choices:[{message:{role:'assistant',content:`本地模拟响应：${prompt||'Hello LinkeAI'}`},finish_reason:'stop'}],usage:{prompt_tokens:32,completion_tokens:96,total_tokens:128}}:{id:uid('generation'),status:'completed',data:[{url:model.kind==='image'?GALLERY[5].url:model.kind==='video'?'/media/demo-video.mp4':'/media/demo-audio.wav'}]};
 if(forceError)payload={error:{code:'rate_limit_exceeded',message:'模拟限流：请稍后重试。'}};
 const log:ApiLog={id:uid('api'),endpoint,model:model.name,status,latency:284+hash(endpoint)%180,tokens:128,createdAt:Date.now(),request:JSON.stringify({model:model.id,prompt},null,2),response:JSON.stringify(payload,null,2)};
 change(s=>({...s,apiLogs:[log,...s.apiLogs],points:status===200?Math.max(0,s.points-1):s.points,ledger:status===200?[{id:uid('ledger'),label:'API 模拟调用',amount:-1,createdAt:Date.now()},...s.ledger]:s.ledger}));return log;
 },
 login:(email:string,name='演示创作者')=>{if(!email.includes('@'))throw Error('请输入有效的演示邮箱');change(s=>({...s,account:{loggedIn:true,name,email}}));},
 logout:()=>change(s=>({...s,account:{...s.account,loggedIn:false}})),
 register:(name:string,email:string)=>MockService.login(email,name||'新创作者'),
 recharge:(points:number)=>{if(points<=0||!Number.isFinite(points))return;change(s=>({...s,points:s.points+points,ledger:[{id:uid('ledger'),label:'演示积分充值',amount:points,createdAt:Date.now()},...s.ledger]}));},
 addFeedback:(text:string,category='反馈')=>{if(!text.trim())throw Error('请输入反馈内容');const id=uid('feedback');change(s=>({...s,feedback:[{id,text:text.trim(),category,createdAt:Date.now()},...s.feedback]}));return id;},
};
export const mockService=MockService;
