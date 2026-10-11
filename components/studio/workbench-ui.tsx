"use client";
import { Input } from './lobe-ui';

import { useId, useRef, useState } from 'react';
import { Check, FilePlus2, FolderOpen, Paperclip, X } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, Select, Checkbox, WorkbenchButton } from './lobe-ui';
import { MockService } from '@/lib/mock/service';
import { useDemoState } from '@/lib/mock/use-demo';
import { AssetPreview } from './asset-preview';
import type { Asset } from '@/lib/mock/types';

export function WorkbenchSelect({ value, onChange, options, label, disabled = false, compact = false }: {
  value: string; onChange: (value:string)=>void; options: (string | {value:string;label:string})[]; label:string; disabled?:boolean; compact?:boolean;
}) {
  const id = useId();
  return <><label className="sr-only" htmlFor={id}>{label}</label><Select id={id} value={value || undefined} disabled={disabled} className="wb-select" size="small"
    classNames={{ trigger: 'wb-select-trigger' }} placeholder={`选择${label}`}
    onChange={next => { if (typeof next === 'string') onChange(next); }}
    options={options.map(option => typeof option === 'string' ? { value: option, label: option } : option)}
    labelRender={option => <span aria-label={`${label}：${option.label}`}>{compact && <span className="wb-param-label">{label}</span>}{option.label}</span>}/></>
}

export function AttachmentPicker({ ids, onChange, max = 10 }: {ids:string[];onChange:(ids:string[])=>void;max?:number}) {
  const state = useDemoState();
  const fileInput = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [busy, setBusy] = useState(false);
  const selected = ids.map(id=>state.assets.find(asset=>asset.id===id)).filter(Boolean) as Asset[];
  const assets = state.assets.filter(asset=>asset.name.toLowerCase().includes(search.toLowerCase()));
  async function importFiles(files:File[]) {
    setBusy(true);
    try {
      const imported = await MockService.importFiles(files.slice(0,Math.max(0,max-ids.length)));
      onChange([...new Set([...ids,...imported.map(asset=>asset.id)])].slice(0,max));
      toast.success(`已导入 ${imported.length} 个本地文件`);
    } catch(error) { toast.error(error instanceof Error?error.message:'文件导入失败'); }
    finally { setBusy(false); if(fileInput.current) fileInput.current.value=''; }
  }
  return <div className="wb-attachment-picker">
    <input type="file" ref={fileInput} hidden multiple onChange={event=>{void importFiles(Array.from(event.target.files||[]));}} />
    <div className="wb-row wb-wrap">
      <WorkbenchButton className="wb-button wb-subtle" type="button" disabled={busy || ids.length>=max} onClick={()=>fileInput.current?.click()}><Paperclip size={15}/>{busy?'正在导入…':'本地文件'}</WorkbenchButton>
      <WorkbenchButton className="wb-button wb-subtle" type="button" onClick={()=>setOpen(true)}><FolderOpen size={15}/>引用素材</WorkbenchButton>
      <span className="wb-muted wb-small">{ids.length}/{max}</span>
    </div>
    {selected.length>0 && <div className="wb-attached">{selected.map(asset=><span className="wb-attachment" key={asset.id}><FilePlus2 size={13}/><span title={asset.name}>{asset.name}</span><button aria-label={`移除 ${asset.name}`} onClick={()=>onChange(ids.filter(id=>id!==asset.id))} type="button"><X size={12}/></button></span>)}</div>}
    <Dialog open={open} onOpenChange={setOpen}><DialogContent className="wb-modal"><DialogHeader><DialogTitle>引用你的素材</DialogTitle><DialogDescription>选择其他工作台的成果或已导入的文件，最多 {max} 个。</DialogDescription></DialogHeader>
      <Input className="wb-input" value={search} onChange={e=>setSearch(e.target.value)} placeholder="搜索素材名称" aria-label="搜索素材名称" />
      <div className="wb-picker-grid">{assets.slice(0,60).map(asset=><button key={asset.id} type="button" className={`wb-picker-card ${ids.includes(asset.id)?'is-selected':''}`} onClick={()=>{if(ids.includes(asset.id))onChange(ids.filter(id=>id!==asset.id));else if(ids.length<max)onChange([...ids,asset.id]);else toast.info(`最多引用 ${max} 个素材`);}}>
        <AssetPreview asset={asset} controls={false} className="wb-picker-preview"/><span>{asset.name}</span><Checkbox checked={ids.includes(asset.id)} aria-hidden tabIndex={-1} className="pointer-events-none"/>
      </button>)}{assets.length===0&&<p className="wb-empty">还没有匹配的素材，可先选择本地文件。</p>}</div>
      <WorkbenchButton className="wb-button wb-primary" type="button" onClick={()=>setOpen(false)}><Check size={16}/>完成选择</WorkbenchButton>
    </DialogContent></Dialog>
  </div>;
}

export function readableDate(time:number) { return new Intl.DateTimeFormat('zh-CN',{month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'}).format(time); }
