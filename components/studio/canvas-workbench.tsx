"use client";
import { Textarea } from './lobe-ui';
import { WorkbenchButton } from './lobe-ui';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ReactFlow, Background, Controls, MiniMap, Handle, Position, addEdge, useEdgesState, useNodesState, type Connection, type Edge, type Node, type NodeProps, type ReactFlowInstance } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { FileText, ImageIcon, Video, Play, RotateCcw, Save, Trash2, Loader2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { MODELS } from '@/lib/mock/catalog';
import { MockService } from '@/lib/mock/service';
import { AssetPreview } from './asset-preview';
import type { Asset, Project } from '@/lib/mock/types';

type CanvasData = { kind:'text'|'image'|'video'; label:string; prompt:string; assetId?:string; asset?:Asset; onEdit?:(id:string,prompt:string)=>void; [key:string]:unknown };
type CanvasNode = Node<CanvasData>;
function CreationNode({id,data}:NodeProps<CanvasNode>) {
  const Icon=data.kind==='text'?FileText:data.kind==='image'?ImageIcon:Video;
  return <><Handle type="target" position={Position.Left}/><div className="wb-canvas-node-title"><Icon size={14}/>{data.label}</div><Textarea resize className="wb-canvas-node-input nodrag nowheel" aria-label={`${data.label}内容`} value={data.prompt} onChange={event=>data.onEdit?.(id,event.target.value)}/>{data.asset && <AssetPreview asset={data.asset} controls={false} className="wb-canvas-node-preview"/>}<Handle type="source" position={Position.Right}/></>;
}
const nodeTypes={creation:CreationNode};
const startingNodes:CanvasNode[]=[
  {id:'idea',type:'creation',position:{x:50,y:90},data:{kind:'text',label:'故事灵感',prompt:'一位旅人在星河深处发现一座会发光的城市。'}},
  {id:'visual',type:'creation',position:{x:330,y:60},data:{kind:'image',label:'视觉生成',prompt:'蓝紫色星尘中的未来城市，暖色灯光，电影构图。'}},
  {id:'film',type:'creation',position:{x:610,y:120},data:{kind:'video',label:'视频镜头',prompt:'镜头缓慢推进城市，星尘漂浮，保持建筑一致。'}}
];
const startingEdges:Edge[]=[{id:'idea-visual',source:'idea',target:'visual'},{id:'visual-film',source:'visual',target:'film'}];

export function CanvasWorkbench({ project, agentId, onProjectCreated }:{project?:Project;agentId:string;onProjectCreated?:(id:string)=>void}) {
  const [nodes,setNodes,onNodesChange]=useNodesState<CanvasNode>(startingNodes);
  const [edges,setEdges,onEdgesChange]=useEdgesState(startingEdges);
  const [instance,setInstance]=useState<ReactFlowInstance<CanvasNode,Edge>|null>(null);
  const [busy,setBusy]=useState(false);
  const sequence=useRef(4);
  const projectRef=useRef(project);
  projectRef.current=project;
  const editNode=useCallback((id:string,prompt:string)=>setNodes(current=>current.map(node=>node.id===id?{...node,data:{...node.data,prompt}}:node)),[setNodes]);
  const bindNodes=useCallback((items:CanvasNode[])=>items.map(node=>({...node,type:'creation',data:{...node.data,onEdit:editNode,asset:MockService.getState().assets.find(asset=>asset.id===node.data.assetId)}})),[editNode]);
  const restore=useCallback(()=>{
    const json=projectRef.current?.inputs.canvasJSON;
    if(json){try{const saved=JSON.parse(json) as {nodes:CanvasNode[];edges:Edge[];viewport?:{x:number;y:number;zoom:number}};setNodes(bindNodes(saved.nodes));setEdges(saved.edges);if(saved.viewport&&instance)void instance.setViewport(saved.viewport);toast.success('已恢复保存的画布');}catch{toast.error('画布记录无法读取');}}
    else {setNodes(bindNodes(startingNodes));setEdges(startingEdges);}
  },[bindNodes,instance,setNodes,setEdges]);
  useEffect(()=>{const json=projectRef.current?.inputs.canvasJSON;if(json){try{const saved=JSON.parse(json) as {nodes:CanvasNode[];edges:Edge[]};setNodes(bindNodes(saved.nodes));setEdges(saved.edges);}catch{setNodes(bindNodes(startingNodes));}}else{setNodes(bindNodes(startingNodes));setEdges(startingEdges);}},[project?.id,bindNodes,setNodes,setEdges]);
  const connect=useCallback((connection:Connection)=>setEdges(current=>addEdge({...connection,animated:false,style:{stroke:'var(--ink-3)'}},current)),[setEdges]);
  function addNode(kind:CanvasData['kind']){const n=sequence.current++;setNodes(current=>[...current,{id:`node-${Date.now()}-${n}`,type:'creation',position:{x:70+(n%3)*250,y:70+Math.floor(n/3)*150},data:{kind,label:kind==='text'?'文本节点':kind==='image'?'图片节点':'视频节点',prompt:'',onEdit:editNode}}]);}
  function serialized(){return JSON.stringify({nodes:nodes.map(node=>({...node,data:{kind:node.data.kind,label:node.data.label,prompt:node.data.prompt,assetId:node.data.assetId}})),edges,viewport:instance?.getViewport()});}
  function save(silent=false){let id=projectRef.current?.id;if(!id){id=MockService.createProject(agentId,{brief:'无限画布创作',canvasJSON:serialized()});onProjectCreated?.(id);}else MockService.updateProject(id,{inputs:{...projectRef.current!.inputs,canvasJSON:serialized()}});if(!silent)toast.success('画布已保存，可离开后恢复');return id;}
  async function execute(){if(!nodes.length){toast.info('先添加一个节点');return;}setBusy(true);const id=save(true);const created:string[]=[];const updated:Record<string,Asset>={};const textResults:string[]=[];
    try {for(const node of nodes){let prompt=node.data.prompt.trim()||'创作一份星际旅行主题内容';const incoming=edges.filter(edge=>edge.target===node.id).map(edge=>nodes.find(n=>n.id===edge.source)?.data.prompt||'').filter(Boolean);if(incoming.length)prompt=`${incoming.join('\n')}\n${prompt}`;
      if(node.data.kind==='text'){const model=MODELS.find(item=>item.kind==='chat')!;const conversation=MockService.createConversation(model.id);await MockService.sendMessage(conversation,prompt,[],{});const response=MockService.getState().conversations.find(c=>c.id===conversation)?.messages.at(-1)?.content||'已整理创作方向。';textResults.push(`## ${node.data.label}\n${response}`);}
      else {const model=MODELS.find(item=>item.kind===node.data.kind)!;const assets=await MockService.generateMedia(model.id,prompt,{count:'1',ratio:'16:9'},created.slice(-1));if(assets[0]){updated[node.id]=assets[0];created.push(assets[0].id);}}
    }
    const nextNodes=nodes.map(node=>updated[node.id]?{...node,data:{...node.data,asset:updated[node.id],assetId:updated[node.id].id}}:node);setNodes(nextNodes);
    const current=MockService.getState().projects.find(item=>item.id===id)!;
    const json=JSON.stringify({nodes:nextNodes.map(node=>({...node,data:{kind:node.data.kind,label:node.data.label,prompt:node.data.prompt,assetId:node.data.assetId}})),edges,viewport:instance?.getViewport()});
    MockService.updateProject(id,{inputs:{...current.inputs,canvasJSON:json},assetIds:[...new Set([...current.assetIds,...created])]});
    MockService.saveVersion(id,`# 画布执行结果\n\n${textResults.join('\n\n')}\n\n图片 / 视频节点已生成 ${created.length} 个本地示例素材。`,'画布执行结果');toast.success(`画布执行完成，生成 ${created.length} 个素材`);
    }catch(error){toast.error(error instanceof Error?error.message:'执行未完成，请重试');}finally{setBusy(false);}
  }
  function removeSelected(){const ids=new Set(nodes.filter(node=>node.selected).map(node=>node.id));setNodes(current=>current.filter(node=>!ids.has(node.id)));setEdges(current=>current.filter(edge=>!edge.selected&&!ids.has(edge.source)&&!ids.has(edge.target)));}
  return <div className="wb-stack"><div className="wb-canvas-toolbar"><WorkbenchButton className="wb-button" onClick={()=>addNode('text')}><Plus size={14}/><FileText size={14}/>文本</WorkbenchButton><WorkbenchButton className="wb-button" onClick={()=>addNode('image')}><Plus size={14}/><ImageIcon size={14}/>图片</WorkbenchButton><WorkbenchButton className="wb-button" onClick={()=>addNode('video')}><Plus size={14}/><Video size={14}/>视频</WorkbenchButton><WorkbenchButton className="wb-button wb-subtle" onClick={removeSelected}><Trash2 size={14}/>删除选中</WorkbenchButton><WorkbenchButton className="wb-button wb-subtle" onClick={()=>save()}><Save size={14}/>保存</WorkbenchButton><WorkbenchButton className="wb-button wb-subtle" onClick={restore}><RotateCcw size={14}/>恢复</WorkbenchButton><WorkbenchButton className="wb-button wb-primary" disabled={busy} onClick={()=>{void execute();}}>{busy?<Loader2 size={14} className="wb-spin"/>:<Play size={14}/>}执行画布</WorkbenchButton></div>
    <div className="wb-canvas"><ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={connect} onInit={setInstance} nodeTypes={nodeTypes} fitView minZoom={.25} maxZoom={2} deleteKeyCode={['Backspace','Delete']} defaultEdgeOptions={{style:{stroke:'var(--ink-3)',strokeWidth:1.5}}}><Background color="var(--line-strong)" gap={22} size={1}/><Controls/><MiniMap nodeColor="var(--ink-3)" maskColor="var(--field)" style={{background:'var(--canvas)',width:120,height:78}}/></ReactFlow></div><p className="wb-note">拖动节点改变布局，拖动左右连接点建立流程。画布保存在本地；执行时沿节点输入生成固定演示文字与可播放素材。</p>
  </div>;
}
