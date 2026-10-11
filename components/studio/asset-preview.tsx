'use client';
import { useEffect, useState } from 'react';
import { FileText, FileJson, Loader2, Music2 } from 'lucide-react';
import type { Asset } from '@/lib/mock/types';
import { MockService } from '@/lib/mock/service';
export function AssetPreview({asset,className='',controls=true}:{asset:Asset;className?:string;controls?:boolean}){
 const [url,setUrl]=useState(asset.url),[error,setError]=useState('');
 useEffect(()=>{let active=true,created='';setUrl(asset.url);setError('');if(!asset.url)void MockService.assetUrl(asset).then(value=>{created=value;if(active)setUrl(value);else if(value.startsWith('blob:'))URL.revokeObjectURL(value);}).catch(()=>{if(active)setError('素材无法预览，请尝试下载原文件。');});return()=>{active=false;if(created.startsWith('blob:'))URL.revokeObjectURL(created);};},[asset.id,asset.url,asset.blobId]);
 if(error)return <div className={`flex min-h-36 items-center justify-center p-6 text-sm text-muted-foreground ${className}`}>{error}</div>;
 if(asset.kind==='image')return url?<img src={url} alt={asset.name} loading="lazy" className={`max-h-[70vh] w-full object-cover ${className}`}/>:<Loader2 className="m-8 animate-spin"/>;
 if(asset.kind==='video')return <video src={url||undefined} controls={controls} preload="metadata" playsInline className={`max-h-[70vh] w-full rounded-lg ${className}`} aria-label={asset.name} poster="/media/gallery-06.jpg"/>;
 if(asset.kind==='audio')return <div data-asset-kind="audio" className={`flex flex-col items-center justify-center gap-5 rounded-xl bg-secondary/50 p-6 ${className}`}><Music2 size={36} className="text-primary"/>{controls&&<><span className="text-sm">{asset.name}</span><audio src={url||undefined} controls preload="metadata" className="w-full max-w-md" aria-label={asset.name}/></>}</div>;
 return <div className={`rounded-xl bg-secondary/30 p-5 ${className}`}>{asset.kind==='setup'||asset.kind==='canvas'?<FileJson className="mb-3 text-primary"/>:<FileText className="mb-3 text-primary"/>}<h4 className="mb-2 text-sm font-medium">{asset.name}</h4><pre className="max-h-72 overflow-auto whitespace-pre-wrap font-sans text-sm leading-7 text-muted-foreground">{asset.content||'本地文档素材，可以下载原始文件。'}</pre></div>;
}
