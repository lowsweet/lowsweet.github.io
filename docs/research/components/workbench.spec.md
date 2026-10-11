# 创作工作台规格
目标 components/studio/agent-workbench.tsx、model-workbench.tsx、canvas-workbench.tsx、独立workbench.css。导出 AgentWorkbench({agentId,projectId?,initialPrompt?,onOpenProject?})、ModelWorkbench({initialKind?,initialModelId?})。全部client，不改rootglobals/store/catalog/其他模块。
视觉Beautiful UI：深灰面板，柔蓝强调色，细分隔线、透明小chips，标题清晰、留白，输入栏圆角16px；正文16px控件14px；手机从两列折叠单列，工作区侧栏由根shell管理。
AGENTS、MODELS、SKILLS来自lib/mock/catalog；types已在lib/mock/types。所有45入口由同一个AgentDefinition表单+stages动态驱动，务必保留special字段对应真实差异（Logo锁定、小说分章、数字人profile、canvas、collaboration、installer）。
MockService统一操作；useDemoState()来自lib/mock/use-demo.ts；根正实现store，API如下：
createProject(agentId,inputs):string；updateProject(id,Partial<Project>)；startProject(id,failOnce=false)；approveStage(id,content?)；saveVersion(id,content,title?)；selectVersion(id,index)；restoreVersion(id,index)；duplicateProject(id):string；deleteProject(id)/restoreProject；pauseTask/resumeTask/cancelTask/retryTask(taskId)。任务约1秒阶段，有progress/log状态。审批必须用户点击；最终成功产生素材/消费。刷新running→paused。
importFiles(File[]):Promise<Asset[]>；toggleFavoriteAsset(id)；publishAsset(id,published?)；removeAsset(id)；assetUrl(asset):Promise<string>（blob URL root处理）；addProfile({name,imageAssetId,voice})；setPreferences(Partial<Preferences>)；addMemory(text)/removeMemory(id)。
createConversation(modelId):string；sendMessage(conversationId,text,attachmentIds=[],parameters={}):Promise<void>；togglePinnedModel(id)。聊天调用不会联网。image/video/audio可用 MockService.generateMedia(modelId,prompt,parameters,attachmentIds):Promise<Asset[]>。
导出 root lib/mock/export.ts：exportProject(project,format:'txt'|'docx'|'pptx'|'zip'):Promise<void>、downloadAsset(asset)、downloadAssets(assets,filename?)、downloadText(text,filename,mime?)。导出源当前chosen version；UI编辑保存后再export保证内容对应。
附件真实inputfile/onChange import；资产选择Dialog（跨工作区引用）。预览组件 root components/studio/asset-preview.tsx export AssetPreview({asset,className?,controls?}) 提供images/video/audio/content。
创作：左侧描述/参数/引用；主面板阶段steps、Progress日志、需求/方案审批card、当前产物编辑textarea和版本picker、成果缩略图/下载；取消失败重试暂停、模拟失败开关可测试；历史实时从state关联。
品牌VI：logo阶段展示三个方向，选按钮updateProject inputs.logo，再approveStage；不选禁止继续。小说/剧本：世界观/大纲确认后章节可分别编辑；编辑形成version、导出txt/docx。PPT导出pptx。视频：角色、场景、分镜可编辑确认，frames确认，最终video/audio可播放；profile引用保存与选已有档案。
Canvas采用@xyflow/react已安装，Text/Image/Video节点增删拖动连线、zoom、fit、保存/恢复project.inputs.canvasJSON、执行生成创建关联Asset，不要只画静态图。
Collaboration：多选回答模型+独立汇总模型→并行固定答案→汇总；全内容在Projectversion/Conversation持久化。Installer：操作系统/默认模型/演示endpoint配置预览，阶段模拟安装最终下载JSON，不能执行系统命令。
模型：24filters/vendor/search/pin/detail价格route；四生成studio通过selectedmodel打开，parameters perkind、真attachments、localhistory、memory管理、skills toggles、EnterToSend toggle。快速试用/历史切换，输出preview/download。
必要UIprimitive用components/ui，包括Dialog、Select、Switch、Checkbox、Slider、Tabs、Progress，不改vendored文件。Typecheck自己文件，勿修别人。
