import type { Asset, Project } from './types';
import { AGENTS } from './catalog';
import { MockService } from './service';
const safeName=(name:string)=>name.replace(/[\\/:*?"<>|\u0000-\u001F]/g,'-').slice(0,100)||'LinkeAI';
export function saveBlob(blob:Blob,filename:string){const url=URL.createObjectURL(blob);const anchor=document.createElement('a');anchor.href=url;anchor.download=safeName(filename);document.body.appendChild(anchor);anchor.click();anchor.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);}
export function downloadText(text:string,filename:string,mime='text/plain;charset=utf-8'){saveBlob(new Blob([text],{type:mime}),filename);}
export function projectContent(project:Project){return project.versions[project.versionIndex]?.content||project.results[project.results.length-1]?.content||project.brief||project.inputs.brief||project.name;}
function jsonContent(content:string){const match=content.match(/```json\s*([\s\S]*?)```/);if(match){try{return JSON.stringify(JSON.parse(match[1]),null,2);}catch{}}try{return JSON.stringify(JSON.parse(content),null,2);}catch{return JSON.stringify({simulation:true,content},null,2);}}
const extension=(asset:Asset)=>asset.kind==='image'?(asset.mime==='image/png'?'png':asset.mime==='image/svg+xml'?'svg':'jpg'):asset.kind==='video'?'mp4':asset.kind==='audio'?'wav':asset.kind==='canvas'||asset.kind==='setup'?'json':'txt';
export async function downloadAsset(asset:Asset){
 let blob=await MockService.assetBlob(asset);
 if(asset.content&&(asset.kind==='setup'||asset.kind==='canvas'))blob=new Blob([jsonContent(asset.content)],{type:'application/json'});
 const originalImported=!!asset.blobId;
 const suffix=extension(asset);
 saveBlob(blob,originalImported||asset.name.toLowerCase().endsWith('.'+suffix)?asset.name:`${asset.name}.${suffix}`);
}
export async function downloadAssets(assets:Asset[],filename='LinkeAI-素材包.zip'){
 const {default:JSZip}=await import('jszip');const zip=new JSZip();
 for(const [index,asset] of assets.entries()){let blob=await MockService.assetBlob(asset);if(asset.content&&(asset.kind==='setup'||asset.kind==='canvas'))blob=new Blob([jsonContent(asset.content)],{type:'application/json'});zip.file(`${String(index+1).padStart(2,'0')}-${safeName(asset.name)}${asset.blobId?'':'.'+extension(asset)}`,await blob.arrayBuffer());}
 zip.file('README.txt','LinkeAI 本地 Demo 素材包\n所有生成结果为演示样例；文件仅保存在当前浏览器。');
 saveBlob(await zip.generateAsync({type:'blob'}),filename);
}
async function docxBlob(project:Project,content:string){
 const {Document,Packer,Paragraph,TextRun,HeadingLevel,AlignmentType}=await import('docx');
 const paragraphs=content.split('\n').map(line=>{
 const heading=line.match(/^(#{1,3})\s+(.+)$/);return new Paragraph({heading:heading?(heading[1].length===1?HeadingLevel.TITLE:heading[1].length===2?HeadingLevel.HEADING_1:HeadingLevel.HEADING_2):undefined,spacing:{after:line?140:80},children:[new TextRun({text:heading?heading[2]:line.replace(/^[-*]\s/,'• '),font:'Microsoft YaHei',size:heading?undefined:22})]});
 });
 const doc=new Document({creator:'LinkeAI Local Demo',title:project.name,description:'当前项目版本的本地演示导出',sections:[{properties:{page:{margin:{top:1100,bottom:1100,left:1100,right:1100}}},children:[...paragraphs,new Paragraph({alignment:AlignmentType.RIGHT,spacing:{before:400},children:[new TextRun({text:'LinkeAI · 本地演示',size:18,color:'888888'})]})]}]});
 return Packer.toBlob(doc);
}
async function pptxBlob(project:Project,content:string){
 const {default:PptxGenJS}=await import('pptxgenjs');const deck=new PptxGenJS();deck.layout='LAYOUT_WIDE';deck.author='LinkeAI Local Demo';deck.subject='当前项目内容';deck.title=project.name;deck.company='LinkeAI';deck.theme={headFontFace:'Microsoft YaHei',bodyFontFace:'Microsoft YaHei'};
 const cover=deck.addSlide();cover.background={color:'172437'};cover.addText(project.name,{x:.7,y:2.05,w:11.8,h:1.4,fontSize:36,bold:true,color:'F4F8FC',breakLine:false});cover.addText('LinkeAI · 当前编辑版本',{x:.74,y:4.15,w:10,h:.4,fontSize:16,color:'8FB9EC'});
 const sections=content.split(/\n(?=#{2,3}\s)/).filter(Boolean);let slides=0;
 for(const section of sections){const lines=section.replace(/^#\s+.*\n/,'').split('\n');const heading=lines[0].replace(/^#{1,3}\s*/,'')||project.name;let body=lines.slice(1).join('\n').replace(/#{1,3}\s*/g,'').trim();if(!body)body=project.brief;
 // Split long sections rather than truncate the exported edit.
 const pages=body.match(/[\s\S]{1,620}/g)||[''];for(const [part,page] of pages.entries()){const slide=deck.addSlide();slide.background={color:'F4F7FB'};slide.addText(heading+(pages.length>1?' · '+(part+1):''),{x:.65,y:.5,w:11.95,h:.7,fontSize:26,bold:true,color:'172437',margin:0});slide.addShape(deck.ShapeType.line,{x:.65,y:1.34,w:11.95,h:0,line:{color:'9DBAF3',width:2}});slide.addText(page,{x:.7,y:1.7,w:11.75,h:4.55,fontSize:17,color:'374254',valign:'top',breakLine:false,margin:0,fit:'shrink'});slide.addText(`${++slides}  /  LinkeAI`,{x:10.85,y:7.03,w:1.75,h:.2,fontSize:10,color:'7C8A9D',align:'right'});}}
 return await deck.write({outputType:'blob'}) as Blob;
}
export async function exportProject(project:Project,format:'txt'|'docx'|'pptx'|'zip'){
 const content=projectContent(project), name=safeName(project.name);
 if(format==='txt'){downloadText(content,`${name}.txt`);return;}
 if(format==='docx'){saveBlob(await docxBlob(project,content),`${name}.docx`);return;}
 if(format==='pptx'){saveBlob(await pptxBlob(project,content),`${name}.pptx`);return;}
 const {default:JSZip}=await import('jszip');const zip=new JSZip();zip.file(`${name}.txt`,content);zip.file('project.json',JSON.stringify({...project,simulation:true},null,2));
 const agent=AGENTS.find(a=>a.id===project.agentId);
 if(agent?.output==='document')zip.file(`${name}.docx`,await(await docxBlob(project,content)).arrayBuffer());
 if(agent?.id==='ppt')zip.file(`${name}.pptx`,await(await pptxBlob(project,content)).arrayBuffer());
 if(agent?.special==='installer')zip.file('demo-config.json',jsonContent(content));
 if(agent?.special==='canvas')zip.file('canvas.json',project.inputs.canvasJSON||JSON.stringify({nodes:[],edges:[],simulation:true},null,2));
 const assets=MockService.getState().assets.filter(a=>project.assetIds.includes(a.id));
 for(const [i,asset] of assets.entries())zip.file(`assets/${i+1}-${safeName(asset.name)}.${extension(asset)}`,await(await MockService.assetBlob(asset)).arrayBuffer());
 zip.file('README.txt','LinkeAI 本地 Demo\n文档对应当前选择的版本；图片和音视频为固定的本地演示素材。');saveBlob(await zip.generateAsync({type:'blob'}),`${name}.zip`);
}
