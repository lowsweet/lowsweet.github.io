'use client';
import { useEffect, useSyncExternalStore, type ReactNode } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { MockService } from './service';
import { registerDemoTools } from './webmcp';
export function useDemoState(){return useSyncExternalStore(MockService.subscribe,MockService.getSnapshot,MockService.getServerSnapshot);}
export function DemoProvider({children}:{children:ReactNode}){
 const state=useDemoState();
 useEffect(()=>{void MockService.initialize();return registerDemoTools();},[]);
 useEffect(()=>{if(!state.hydrated)return;document.documentElement.dataset.theme=state.preferences.theme;document.documentElement.classList.toggle('dark',state.preferences.theme==='dark');document.documentElement.lang=state.preferences.language;return()=>{delete document.documentElement.dataset.theme;document.documentElement.classList.remove('dark');document.documentElement.lang='zh-CN';};},[state.hydrated,state.preferences.theme,state.preferences.language]);
 return <>{children}<Toaster theme={state.preferences.theme} richColors position="bottom-right"/></>;
}
