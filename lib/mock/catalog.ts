import type { AgentDefinition, AgentCategory, InputField, StageDefinition, ModelDefinition, Asset } from './types';
const f=(id:string,label:string,type:InputField['type']='text', options?:string[],defaultValue?:string):InputField=>({id,label,type,options,defaultValue,required:id==='brief'||id==='subject',placeholder:id==='brief'?'描述你的目标、受众和交付要求…':undefined});
const stage=(id:string,title:string,description:string,approval=true):StageDefinition=>({id,title,description,approval});
const stages = {
 document:[stage('requirements','需求与方向','确认目标、受众和约束'),stage('outline','结构大纲','调整章节、论点和内容顺序'),stage('draft','分章生成','逐章编辑正文并确认内容'),stage('delivery','审校与导出','整理当前版本及交付文件',false)],
 image:[stage('requirements','需求访谈','确认平台、画幅与参考素材'),stage('plan','创作方案','选择风格、图片数量和文案方向'),stage('generate','批量出图','逐张查看、选择或重新生成'),stage('delivery','文案与交付','归档图片和文案，下载素材包',false)],
 video:[stage('requirements','故事与需求','确认内容、时长和视觉风格'),stage('characters','角色与场景','锁定人物形象和场景，保持一致性'),stage('storyboard','分镜确认','编辑镜头、画面、配音及字幕'),stage('frames','首帧与声音','确认关键帧和音轨'),stage('delivery','合成与成片','预览本地示例成片并下载',false)],
 tool:[stage('requirements','工作区配置','设置模型、目标和输入资料'),stage('plan','执行方案','确认操作步骤与权限范围'),stage('delivery','执行与交付','完成本地演示并保存结果',false)]
};
const raw: [string,string,AgentCategory,string,string,string[]][] = [
 ['video-proposal','AI 视频策划','document','从创意到可执行的拍摄方案','Clapperboard',['TVC','策划']],
 ['stock-research','AI 投研','document','梳理研究框架与模拟报告','ChartNoAxesCombined',['投研','报告']],
 ['novel-studio','AI 小说工作室','document','设定世界观，逐章完成你的故事','BookOpen',['小说','长篇']],
 ['script-studio','AI 剧本工作室','document','将灵感转化为可拍摄的剧本','ScrollText',['剧本','短剧']],
 ['official-docs','AI 公文','document','从提纲到规范的文稿','FileText',['公文','写作']],
 ['business-docs','AI 商业文书','document','商业计划、标书与项目方案','BriefcaseBusiness',['商务','方案']],
 ['lesson-prep','AI 备课','document','教案、课堂活动与练习设计','GraduationCap',['教育','教案']],
 ['admissions','AI 高考志愿','document','模拟志愿咨询与规划报告','School',['咨询','规划']],
 ['ppt','一键 PPT','document','将主题和材料整理成演示文稿','Presentation',['PPT','演示']],
 ['ecommerce-images-s2','电商图片 S2','image','产品主图、详情页与销售文案','ShoppingBag',['电商','主图']],
 ['xiaohongshu','小红书爆款笔记','image','封面视觉与可编辑的笔记文案','Heart',['社交','种草']],
 ['wechat','公众号创作工作室','image','头图、配图和文章成套创作','Newspaper',['公众号','文章']],
 ['universal-images-s2','万能图片 S2','image','从创作方案到成组视觉','Sparkles',['通用','创意']],
 ['portrait','AI 写真工作室','image','风格写真与多场景人像','Camera',['人像','写真']],
 ['brand-vi','AI 品牌 VI 工作室','image','先锁定 Logo，再延展品牌物料','Fingerprint',['品牌','设计']],
 ['poster','AI 海报工厂','image','活动、产品和主题海报','PanelTop',['海报','视觉']],
 ['picture-book','AI 绘本工作室','image','保持角色一致的故事绘本','BookImage',['绘本','儿童']],
 ['packaging','AI 包装设计','image','包装概念与展示效果','Package',['包装','产品']],
 ['wedding','AI 婚纱工作室','image','婚纱照、请柬与仪式视觉','Gem',['婚纱','浪漫']],
 ['educourse','AI 教育课程视觉','image','课程封面与知识可视化','NotebookPen',['课程','教育']],
 ['interior','AI 家装设计','image','空间风格与室内效果','House',['家装','空间']],
 ['pet','AI 宠物工作室','image','宠物写真与品牌周边','PawPrint',['宠物','写真']],
 ['fitting','AI 试衣间','image','服装搭配与试穿视觉','Shirt',['时尚','试穿']],
 ['restaurant','AI 餐饮视觉','image','菜品、菜单与门店视觉','Utensils',['餐饮','菜单']],
 ['ecommerce-image','电商一键生图','image','轻量电商图片快速创作','ShoppingCart',['电商','经典']],
 ['universal-image','万能一键生图','image','一句描述生成创意图片','WandSparkles',['通用','经典']],
 ['story-video','故事成片','video','从故事到角色、分镜与视频','Film',['故事','成片']],
 ['music-video','音乐 MV','video','让音乐拥有完整的视觉叙事','Music',['音乐','MV']],
 ['digital-human','数字人','video','复用形象和声音档案制作口播','UserRound',['数字人','口播']],
 ['ecommerce-video-s2','电商视频 S2','video','多镜头产品展示与营销视频','ShoppingBag',['电商','视频']],
 ['ecommerce-video','电商一键视频','video','图片到产品短片的轻量流程','Video',['电商','经典']],
 ['comic-s2','AI 漫画 S2.0','video','角色、剧本、分镜和漫画成片','Palette',['漫画','S2']],
 ['comic-story','AI 漫剧·故事版','video','故事驱动的连贯漫剧','BookOpenText',['漫剧','故事']],
 ['comic-commentary','AI 漫剧·解说版','video','以解说为主线的漫剧创作','Mic',['漫剧','解说']],
 ['multiframe','智能多帧','video','多关键帧与镜头连续性','Layers',['多帧','视频']],
 ['canvas-s2','无限画布 S2','tool','连接文字、图像和视频的创作节点','Workflow',['画布','流程']],
 ['canvas','无限画布','tool','自由排布素材与生成节点','Network',['画布','经典']],
 ['collaboration','多模型协作','tool','并行回答，交叉比较与汇总','MessagesSquare',['模型','协作']],
 ['aichat','AIChat','tool','本地模拟客户端配置向导','MessageCircle',['客户端','配置']],
 ['codex','Codex Assistant','tool','模拟 CLI 配置与安装检查','Terminal',['开发','CLI']],
 ['workbuddy','WorkBuddy Assistant','tool','模拟工作助手与技能配置','Briefcase',['办公','配置']],
 ['zcode','ZCode Assistant','tool','模拟代码助手环境配置','Code2',['开发','配置']],
 ['deepseek-harness','DeepSeek Harness Desktop','tool','模拟桌面客户端连接流程','Monitor',['桌面','配置']],
 ['opencode','OpenCode Assistant','tool','模拟开放代码助手配置','SquareTerminal',['开发','CLI']],
 ['openclaw','OpenClaw','tool','模拟本地代理与工作区配置','Bot',['代理','配置']]
];
const baseFields=(category:AgentCategory):InputField[] => category==='document'?[f('brief','创作需求','textarea'),f('audience','目标读者'),f('style','表达风格','select',['专业清晰','简洁有力','生动叙事','正式规范'],'专业清晰'),f('length','章节 / 页数','number',undefined,'4')]:category==='image'?[f('brief','创作需求','textarea'),f('platform','发布平台','select',['通用','淘宝 / 天猫','小红书','公众号','抖音'],'通用'),f('style','视觉风格','select',['电影质感','写实摄影','极简设计','3D 艺术','手绘插画'],'电影质感'),f('count','图片数量','number',undefined,'4'),f('ratio','画幅比例','select',['1:1','3:4','16:9','9:16'],'3:4')]:category==='video'?[f('brief','故事 / 口播内容','textarea'),f('style','视觉风格','select',['电影感','写实','动漫','水彩'],'电影感'),f('ratio','视频比例','select',['16:9','9:16','1:1'],'16:9'),f('duration','时长（秒）','select',['15','30','60'],'30'),f('voice','配音声音','select',['温暖女声','沉稳男声','清亮童声'],'温暖女声'),f('language','内容语言','select',['中文','英语','日语'],'中文')]:[f('brief','工作目标','textarea'),f('model','默认模型','select',['GPT-4.1','Claude Sonnet 4.5','DeepSeek V3.2'],'GPT-4.1')];
export const AGENTS:AgentDefinition[]=raw.map(([id,name,category,subtitle,icon,tags])=>{
 let fields=baseFields(category), ss=[...stages[category]], special:AgentDefinition['special'];
 if(id==='novel-studio'){special='novel';fields=[f('brief','故事灵感','textarea'),f('intent','创作方式','select',['新作','续写','重写','前传','插章'],'新作'),f('genre','小说题材','select',['科幻','都市','悬疑','奇幻','言情'],'科幻'),f('length','章节数量','number',undefined,'4')];ss=[stage('direction','故事方向','选定一句话梗概与核心冲突'),stage('world','世界观与人物','确认设定、人物动机和关系'),...stages.document.slice(1)];}
 if(id==='script-studio'){special='script';fields=[f('brief','剧本需求 / 故事素材','textarea'),f('format','剧本形式','select',['竖屏短剧','电视剧','电影','广播剧'],'竖屏短剧'),f('source','创作来源','select',['原创','小说改编'],'原创'),f('length','集数','number',undefined,'4')];}
 if(id==='brand-vi'){special='vi';fields=[f('brief','品牌定位','textarea'),f('brand','品牌名称'),f('industry','所属行业'),f('style','品牌风格','select',['极简现代','自然有机','先锋科技','优雅经典'],'极简现代')];ss=[stage('requirements','品牌访谈','明确定位、受众与品牌个性'),stage('logo','Logo 方案','选择并锁定一个 Logo 方向'),stage('materials','VI 物料延展','基于锁定的 Logo 延展名片、包装与海报'),stage('delivery','规范与交付','输出品牌规范及素材包',false)];}
 if(id==='digital-human'){special='digital-human';fields=[f('brief','口播脚本','textarea'),f('profile','形象档案','select',['新建形象','林晓 · 温暖女声','陈川 · 沉稳男声'],'新建形象'),f('voice','声音','select',['温暖女声','沉稳男声'],'温暖女声'),f('scene','场景','select',['演播室','办公室','户外'],'演播室')];}
 if(id==='stock-research')fields=[f('brief','研究对象（虚构）','textarea'),f('type','报告类型','select',['行业研究','公司研究','财报解读','组合分析'],'行业研究'),f('focus','研究重点'),f('length','章节数量','number',undefined,'4')];
 if(id==='admissions')fields=[f('brief','咨询需求（模拟）','textarea'),f('province','省份'),f('subject','选科组合'),f('score','模拟分数','number',undefined,'580'),f('interest','专业兴趣')];
 if(id==='lesson-prep')fields=[f('brief','课程主题','textarea'),f('grade','年级'),f('subject','学科'),f('duration','课时','number',undefined,'2')];
 if(id==='official-docs')fields=[f('brief','文稿需求','textarea'),f('type','文稿类型','select',['讲话稿','工作总结','实施方案','会议纪要','通知'],'工作总结'),f('organization','单位 / 部门')];
 if(id==='business-docs')fields=[f('brief','项目需求','textarea'),f('type','文书类型','select',['商业计划书','投标文件','可行性报告','项目申报','实施方案'],'商业计划书'),f('industry','行业')];
 if(id==='video-proposal')fields=[f('brief','项目需求','textarea'),f('type','策划类型','select',['宣传片','TVC','纪录片','微短剧','账号运营'],'宣传片'),f('budget','模拟预算'),f('audience','目标受众')];
 if(id==='music-video')fields=[f('brief','歌词 / 音乐主题','textarea'),f('style','视觉风格','select',['电影叙事','抽象艺术','青春记录'],'电影叙事'),f('ratio','画幅','select',['16:9','9:16'],'16:9')];
 if(id.startsWith('canvas'))special='canvas'; else if(id==='collaboration')special='collaboration'; else if(category==='tool'){special='installer';fields=[f('brief','配置说明','textarea'),f('platform','操作系统','select',['macOS','Windows','Linux'],'macOS'),f('model','默认模型','select',['GPT-4.1','Claude Sonnet 4.5','DeepSeek V3.2'],'GPT-4.1')];ss=[stage('requirements','选择配置','确定系统和模型'),stage('plan','检查与预览','查看安装步骤与配置文件'),stage('delivery','模拟安装完成','下载演示配置文件',false)];}
 return {id,name,category,subtitle,icon,tags,fields,stages:ss,special,output:category==='document'?'document':category==='image'?'image':category==='video'?'video':special==='canvas'?'canvas':special==='installer'?'setup':'document',color:category==='document'?'#99afff':category==='image'?'#c39df9':category==='video'?'#7bcdbf':'#e7b47b',cost:category==='video'?15:category==='image'?8:3};
});
export const CATEGORY_LABELS:Record<AgentCategory,string>={document:'文档创作',image:'图像设计',video:'视频制作',tool:'工具与协作'};
const modelRows:[string,string,ModelDefinition['kind'],string][]=[['GPT-4.1','OpenAI','chat','细致写作、代码与通用推理'],['Claude Sonnet 4.5','Anthropic','chat','长文创作和逻辑分析'],['Gemini 2.5 Pro','Google','chat','多模态理解与复杂任务'],['DeepSeek V3.2','DeepSeek','chat','中文写作与深度推理'],['Qwen3','Alibaba','chat','中文知识与结构化输出'],['Grok 4.1','xAI','chat','创意讨论与逻辑推理'],['GLM 4.6','Zhipu','chat','多轮对话与代码辅助'],['Llama 4','Meta','chat','开放模型与通用对话'],['GPT Image','OpenAI','image','文字与图片编辑'],['Flux 2','Black Forest Labs','image','写实图像与视觉设计'],['Midjourney','Midjourney','image','艺术风格与创意表达'],['Imagen 4','Google','image','写实摄影与细节'],['万相 2.5','Alibaba','image','中文场景与创意'],['Recraft V3','Recraft','image','品牌与设计视觉'],['Sora 2','OpenAI','video','电影感与运动镜头'],['Veo 3','Google','video','自然运动与场景'],['可灵 2.6','Kuaishou','video','人物运动与镜头表达'],['Runway Gen-4','Runway','video','视觉叙事与创作'],['海螺 2.3','MiniMax','video','动态镜头与故事'],['万相视频','Alibaba','video','图生视频与多帧'],['Suno V5','Suno','audio','歌曲创作与音乐'],['ElevenLabs','ElevenLabs','audio','自然配音与多音色'],['CosyVoice','Alibaba','audio','中文语音合成'],['Whisper','OpenAI','audio','音频转写与理解']];
export const MODELS:ModelDefinition[]=modelRows.map(([name,vendor,kind,description],i)=>({id:`model-${i+1}`,name,vendor,kind,description,price:kind==='chat'?1+i%3:kind==='image'?4+i%3:kind==='video'?15+i%4:3,context:kind==='chat'?'128K':kind==='image'?'2048px':kind==='video'?'1080p':'48kHz',tags:[kind==='chat'?'对话':kind==='image'?'图像':kind==='video'?'视频':'音频',i%3===0?'精选':'标准'],routes:['智能优选','稳定线路','高速线路']}));
const titles=['暗黑光影：深红镜片下的冷峻型男','灵动暖橘：KAWS艺术空间下的潮流美学','凝水成字：极简透明水凝胶字体','凝望光影的灿烂笑颜','暗夜极速：力量与光影的爆发瞬间','星夜私语：月亮船上的治愈梦境','潮玩跨界：知名品牌的石器时代奇遇','绚烂彩纸下的纯粹喜悦时刻','港口微光：黑白工业序章','裂纹中的版图：生命的非洲地图','微缩时空：工业时代的冰封美味','俯瞰都市的冷静优雅','创意涂鸦：当AI主页遭遇毒舌吐槽','提笔入禅：光与墨的寂静对话','时光刻痕：极简电影感定制挂历','从日常到高定：AI实现的时尚华丽蜕变','跨次元角力：挑战大力水手的麒麟臂','魅影夜色：铂金女神的度假村序曲','金秋街角的电影感邂逅','都市绅士：黑钻座驾与优雅瞬间'];
export const GALLERY:Asset[]=titles.map((name,i)=>({id:`gallery-${i+1}`,name,kind:'image',url:`/media/gallery-${String(i+1).padStart(2,'0')}.${i===6?'png':'jpg'}`,mime:i===6?'image/png':'image/jpeg',size:220000,createdAt:Date.UTC(2026,8,20)-i*86400000,prompt:`${name}。电影级光影，精细纹理，主体突出，保持自然的构图。`,tags:i%3===0?['人像','摄影']:i%3===1?['创意','设计']:['艺术','灵感'],favorite:false,published:true,views:840+(i*37)%156}));
export const SKILLS=['文案润色','代码审查','结构化写作','分镜设计','品牌策略','图像提示词'];
export const QUICK_PROMPTS=['帮我策划一支新品宣传视频','写一个发生在星际旅行中的故事','为咖啡品牌设计一套视觉','总结上传的资料并生成大纲'];
