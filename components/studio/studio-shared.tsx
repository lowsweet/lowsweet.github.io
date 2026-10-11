"use client";

import { useState, type ReactNode } from 'react';
import * as Icons from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './lobe-ui';
import { Button } from './lobe-ui';
import { Input } from './lobe-ui';

export function StudioIcon({name='Sparkles',size=20,className}:{name?:string;size?:number;className?:string}) {
 const Icon = (Icons as unknown as Record<string,React.ComponentType<{size:number;className?:string}>>)[name] ?? Icons.Sparkles;
 return <Icon size={size} className={className}/>;
}
export const formatDate=(date:number)=>new Date(date).toLocaleString('zh-CN',{month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'});
export const formatSize=(size:number)=>size>1048576?`${(size/1048576).toFixed(1)} MB`:`${Math.max(1,Math.round(size/1024))} KB`;
export const STATUS_LABELS:Record<string,string>={draft:'草稿',running:'生成中',paused:'已暂停',failed:'失败',cancelled:'已取消',completed:'已完成',awaiting:'待确认'};
export async function copyText(text:string) {
 try { await navigator.clipboard.writeText(text); toast.success('已复制'); }
 catch { const el=document.createElement('textarea');el.value=text;document.body.appendChild(el);el.select();document.execCommand('copy');el.remove();toast.success('已复制'); }
}
export function EmptyState({icon='Search',title,description,action}:{icon?:string;title:string;description?:string;action?:ReactNode}) {
 return <div className="st-empty"><StudioIcon name={icon} size={32}/><h3>{title}</h3>{description&&<p>{description}</p>}{action}</div>;
}
export function StudioDialog({open,onOpenChange,title,description,children,className=''}:{open:boolean;onOpenChange:(open:boolean)=>void;title:string;description?:string;children:ReactNode;className?:string}) {
 return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className={`st-dialog ${className}`}><DialogHeader><DialogTitle>{title}</DialogTitle><DialogDescription>{description??'所有操作在当前浏览器中保存。'}</DialogDescription></DialogHeader>{children}</DialogContent></Dialog>;
}
export function RenameDialog({value,title,onSave,onClose}:{value:string;title:string;onSave:(value:string)=>void;onClose:()=>void}) {
 const [text,setText]=useState(value);
 return <StudioDialog open onOpenChange={v=>!v&&onClose()} title={title}><label className="st-field">名称<Input autoFocus value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&text.trim()){onSave(text.trim());onClose();}}}/></label><div className="st-actions"><Button variant="outline" onClick={onClose}>取消</Button><Button disabled={!text.trim()} onClick={()=>{onSave(text.trim());onClose();}}>保存</Button></div></StudioDialog>;
}
