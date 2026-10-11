'use client';

import { useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import { AnimatePresence, motion, useIsPresent, useReducedMotion } from 'motion/react';
import { Home, Menu, Moon, Search, Star, Sun } from 'lucide-react';
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react';
import { AiBrain02Icon, AiGenerateIcon, AiNetworkIcon, ApiIcon, FolderLibraryIcon, ImageCompositionIcon, Task01Icon } from '@hugeicons/core-free-icons';
import { toast } from 'sonner';
import Link from 'next/link';
import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, Drawer, Input, Select, WorkspaceTheme, useWorkspaceTokens } from './lobe-ui';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { DemoProvider, useDemoState } from '@/lib/mock/use-demo';
import { MockService } from '@/lib/mock/service';
import { readWorkspaceTheme } from '@/lib/workspace-theme';
import { useWorkspaceEntry } from '@/components/transitions/workspace-entry-transition';
import { AGENTS, CATEGORY_LABELS, MODELS } from '@/lib/mock/catalog';
import type { ModelKind, StudioView } from '@/lib/mock/types';
import { AgentWorkbench } from './agent-workbench';
import { ModelWorkbench } from './model-workbench';
import { Explorer } from './explorer';
import { DeveloperCenter } from './developer-center';
import { AccountHelp } from './account-help';
import { EmptyState, StudioIcon } from './studio-shared';
import { ModelBrand } from './model-brand';
import { CreditCrystal } from './credit-crystal';
import './studio.css';
import './workspace-layout.css';

type Route = { view: StudioView; agent?: string; project?: string; prompt?: string; kind?: ModelKind; model?: string };
const modules: { view: StudioView; label: string; en: string; icon: IconSvgElement }[] = [
  { view: 'models', label: '大模型', en: 'Models', icon: AiBrain02Icon }, { view: 'agents', label: '智能体', en: 'Agents', icon: AiNetworkIcon },
  { view: 'inspiration', label: '灵感广场', en: 'Explore', icon: AiGenerateIcon }, { view: 'api', label: '开放 API', en: 'API', icon: ApiIcon },
];
const personalModules: { view: StudioView; label: string; en: string; icon: IconSvgElement }[] = [
  { view: 'assets', label: '素材库', en: 'Assets', icon: ImageCompositionIcon }, { view: 'projects', label: '我的项目', en: 'Projects', icon: FolderLibraryIcon },
  { view: 'tasks', label: '任务列表', en: 'Tasks', icon: Task01Icon },
];
const kinds = [['all', '全部', 'All'], ['chat', '对话', 'Chat'], ['image', '图片', 'Image'], ['video', '视频', 'Video'], ['audio', '音频', 'Audio']] as const;
const agentKinds = [['all', '全部', 'All'], ['document', '文档', 'Docs'], ['image', '图片', 'Image'], ['video', '视频', 'Video'], ['tool', '工具', 'Tools']] as const;
const kindNames: Record<ModelKind, string> = { chat: '对话', image: '图片', video: '视频', audio: '音频' };
const defaultModel = MODELS.find(model => model.vendor === 'Suno') ?? MODELS[0];
const readRoute = (search: string): Route => {
  const q = new URLSearchParams(search);
  const view = q.get('view') as StudioView;
  return { view: ['agents', 'models', 'inspiration', 'assets', 'projects', 'tasks', 'api', 'account', 'help'].includes(view) ? view : 'models',
    agent: q.get('agent') ?? undefined, project: q.get('project') ?? undefined, prompt: q.get('prompt') ?? undefined,
    kind: q.get('kind') as ModelKind || undefined, model: q.get('model') ?? undefined };
};

// Presence keeps outgoing content long enough to fade, while inert prevents
// actions from being sent to a workbench that the user has already left.
function WorkspaceScene({ children, className, sceneKey, axis = 'y', active = true, resetScroll = false }: {
  children: ReactNode; className: string; sceneKey: string; axis?: 'x' | 'y'; active?: boolean; resetScroll?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const present = useIsPresent();
  const reducedMotion = useReducedMotion();
  const enterOffset = reducedMotion ? 0 : 6;
  const leaveOffset = reducedMotion ? 0 : -4;

  useLayoutEffect(() => {
    if (resetScroll) ref.current?.closest('.st-main')?.scrollTo({ top: 0 });
  }, [resetScroll]);

  return <motion.div ref={ref} className={className} data-scene={sceneKey} data-present={present} inert={!present || !active}
    initial={{ opacity: 0, x: axis === 'x' ? enterOffset : 0, y: axis === 'y' ? enterOffset : 0 }}
    animate={{ opacity: active ? 1 : 0, x: !active && axis === 'x' ? leaveOffset : 0, y: !active && axis === 'y' ? leaveOffset : 0 }}
    exit={{ opacity: 0, x: axis === 'x' ? leaveOffset : 0, y: axis === 'y' ? leaveOffset : 0,
      transition: { duration: reducedMotion ? 0 : .08, ease: 'easeIn' } }}
    transition={{ duration: reducedMotion ? 0 : .18, ease: [.22, 1, .36, 1] }}>
    {children}
  </motion.div>;
}

function ToolDirectory({ route, navigate, busy, onClose }: { route: Route; navigate: (route: Route) => void; busy: boolean; onClose?: () => void }) {
  const state = useDemoState();
  const [filter, setFilter] = useState<string>(route.kind ?? 'all');
  const [savedOnly, setSavedOnly] = useState(false);
  const [vendor, setVendor] = useState('all');
  const [query, setQuery] = useState('');
  const english = state.preferences.language === 'en';
  const go = (next: Route) => { navigate(next); onClose?.(); };
  const models = MODELS.filter(model => (filter === 'all' || model.kind === filter)
    && (!savedOnly || state.preferences.pinnedModels.includes(model.id)) && (vendor === 'all' || model.vendor === vendor)
    && `${model.name} ${model.vendor} ${model.description}`.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => Number(b.id === defaultModel.id) - Number(a.id === defaultModel.id) || Number(state.preferences.pinnedModels.includes(b.id)) - Number(state.preferences.pinnedModels.includes(a.id)));
  const agents = AGENTS.filter(agent => (filter === 'all' || agent.category === filter)
    && (!savedOnly || state.preferences.favoriteAgents.includes(agent.id))
    && `${agent.name} ${agent.subtitle} ${agent.tags.join(' ')}`.toLowerCase().includes(query.toLowerCase()));
  const selectedModel = MODELS.find(model => model.id === route.model) ?? MODELS.find(model => model.kind === route.kind) ?? defaultModel;
  const selectedAgent = route.agent ?? AGENTS[0].id;
  return <aside className="ws-navigation" aria-label={english ? 'Tool directory' : '工具目录'}>
    <header className="ws-directory-header">
      <h2 className="ws-directory-title">{route.view === 'models' ? english ? 'Models' : '大模型' : english ? 'Agents' : '智能体'}</h2>
        <Input className="ws-search-input" prefix={<Search size={15}/>} allowClear size="middle" aria-label={route.view === 'models' ? '搜索模型' : '搜索智能体'}
          placeholder={route.view === 'models' ? english ? 'Search models…' : '搜索模型或功能…' : english ? 'Search agents…' : '搜索智能体…'} value={query} onChange={event => setQuery(event.target.value)}/>
        <div className="ws-category-filters" role="group" aria-label={english ? 'Filter by capability' : '按能力筛选'}>
          {(route.view === 'models' ? kinds : agentKinds).map(([value, label, en]) => <button key={value} type="button" aria-pressed={filter === value}
            onClick={() => { setFilter(value); setVendor('all'); }}>{english ? en : label}</button>)}</div>
        <div className="ws-saved-filter-row"><button type="button" className="ws-saved-filter" aria-pressed={savedOnly} onClick={() => setSavedOnly(!savedOnly)}>
          <Star size={12} aria-hidden="true" fill={savedOnly ? 'currentColor' : 'none'}/>{route.view === 'models' ? english ? 'Pinned' : '已置顶' : english ? 'Favorites' : '已收藏'}</button>
          <span>{route.view === 'models' ? models.length : agents.length} {english ? route.view === 'models' ? 'models' : 'agents' : route.view === 'models' ? '个模型' : '个智能体'}</span></div>
        <div className="ws-filter-row">{route.view === 'models' && <><label className="sr-only" htmlFor="workspace-vendor">按厂商筛选</label><Select id="workspace-vendor" size="small" variant="borderless" value={vendor} onChange={value => { if(typeof value === 'string') setVendor(value); }}
          classNames={{trigger:'ws-vendor-trigger'}} options={[{value:'all',label:english ? 'All providers' : '全部厂商'},...[...new Set(MODELS.map(model => model.vendor))].map(name => ({value:name,label:name}))]} /></>}</div>
    </header>
    <div className="ws-tool-list">
      {route.view === 'models' ? models.map(model => <article key={model.id} className={`ws-tool-item ${selectedModel.id === model.id ? 'is-active' : ''}`}>
        <button type="button" className="ws-tool-select" disabled={busy} aria-pressed={selectedModel.id === model.id} aria-label={`选择 ${model.name}`}
          onClick={() => go({ view: 'models', model: model.id, kind: model.kind })}>
          <ModelBrand model={model} size={34} /><span><strong>{model.name}</strong><small>{model.description}</small></span>
          <span className="ws-type-label">{kindNames[model.kind]}</span>
        </button><button className="ws-tool-pin" type="button" aria-label={`${state.preferences.pinnedModels.includes(model.id) ? '取消置顶' : '置顶'} ${model.name}`}
          onClick={() => MockService.togglePinnedModel(model.id)}><Star size={13} fill={state.preferences.pinnedModels.includes(model.id) ? 'currentColor' : 'none'} /></button>
      </article>) : route.view === 'agents' ? agents.map(agent => <article key={agent.id} className={`ws-tool-item ${selectedAgent === agent.id ? 'is-active' : ''}`}>
        <button type="button" className="ws-tool-select" aria-pressed={selectedAgent === agent.id} aria-label={`选择 ${agent.name}`} onClick={() => go({ view: 'agents', agent: agent.id })}>
          <span className="ws-agent-symbol"><StudioIcon name={agent.icon} size={25} /></span><span><strong>{agent.name}</strong><small>{agent.subtitle}</small></span>
          <span className="ws-type-label">{CATEGORY_LABELS[agent.category].slice(0, 2)}</span>
        </button><button className="ws-tool-pin" type="button" aria-label={`收藏 ${agent.name}`} onClick={() => MockService.toggleFavoriteAgent(agent.id)}>
          <Star size={13} fill={state.preferences.favoriteAgents.includes(agent.id) ? 'currentColor' : 'none'} /></button>
      </article>) : null}
      {(route.view === 'models' && models.length === 0 || route.view === 'agents' && agents.length === 0) && <div className="ws-no-match"><p>没有找到匹配的工具</p>
        <Button variant="quiet" size="sm" onClick={() => { setQuery(''); setFilter('all'); setVendor('all'); setSavedOnly(false); }}>清除筛选</Button></div>}
    </div>
  </aside>;
}

function Navigation({ route, navigate, busy, onClose, showDirectory = true }: { route: Route; navigate: (route: Route) => void; busy: boolean; onClose?: () => void; showDirectory?: boolean }) {
  const state = useDemoState();
  const tokens = useWorkspaceTokens();
  const english = state.preferences.language === 'en';
  const running = state.tasks.filter(task => task.state === 'running').length;
  const toolView = route.view === 'models' || route.view === 'agents';
  const directoryVisible = showDirectory && toolView && !route.project;
  const activeView = route.project ? 'projects' : route.view;
  const go = (next: Route) => { navigate(next); onClose?.(); };
  const navItem = (item: typeof modules[number]) => {
    return <button key={item.view} className="ws-rail-link" type="button" aria-current={activeView === item.view ? 'page' : undefined}
      onClick={() => go({ view: item.view })}><span className="ws-rail-icon"><HugeiconsIcon icon={item.icon} size={20} strokeWidth={activeView === item.view ? 2 : 1.5} color="currentColor" aria-hidden="true"/>
        {item.view === 'tasks' && running > 0 && <span className="ws-rail-badge" aria-label={english ? `${running} running tasks` : `${running} 个任务进行中`}>{running > 99 ? '99+' : running}</span>}
      </span><span>{english ? item.en : item.label}</span></button>;
  };
  return <div className={`ws-sidebar ${onClose ? 'ws-sidebar-drawer' : ''}`} style={tokens}>
    <aside className="ws-primary-rail" aria-label={english ? 'Workspace navigation' : '工作区导航'}>
      <div className="ws-rail-header"><Link href="/" className="ws-rail-brand">LinkeAI</Link>
        {onClose && <Button variant="quiet" size="icon" aria-label={english ? 'Close navigation' : '收起导航'} onClick={onClose}><PanelLeftClose size={17}/></Button>}</div>
      <div className="ws-rail-sections"><nav className="ws-primary-navigation" aria-label={english ? 'Creation tools' : '创作工具'}>{modules.map(navItem)}</nav>
        <nav className="ws-personal-navigation" aria-label={english ? 'Your content' : '个人内容'}>{personalModules.map(navItem)}</nav></div>
      <footer className="ws-rail-footer"><button className="ws-rail-account" type="button" aria-current={route.view === 'account' ? 'page' : undefined}
        aria-label={`${english ? 'Account and settings' : '我的账号与设置'} · ${state.account.name}`}
        title={`${state.account.name} · ${english ? 'Account and settings' : '账号与设置'}`} onClick={() => go({ view: 'account' })}>
        <span className="st-avatar" aria-hidden="true">{state.account.name.slice(0, 1)}</span>
      </button></footer>
    </aside>
    <div className="ws-directory-slot" data-open={directoryVisible} inert={!directoryVisible}>
      <AnimatePresence initial={false} mode="wait">
        {toolView && <WorkspaceScene key={route.view} sceneKey={route.view} className="ws-directory-scene" axis="x" active={directoryVisible}>
          <ToolDirectory route={route} navigate={navigate} busy={busy} onClose={onClose}/>
        </WorkspaceScene>}
      </AnimatePresence>
    </div>
  </div>;
}

const subscribeRoute = (callback: () => void) => { window.addEventListener('popstate', callback); window.addEventListener('linkeai-workspace-route', callback); return () => { window.removeEventListener('popstate', callback); window.removeEventListener('linkeai-workspace-route', callback); }; };
const routeSnapshot = () => window.location.search;

function WorkspaceView() {
  const state = useDemoState();
  const { workspaceReady } = useWorkspaceEntry();
  const tokens = useWorkspaceTokens();
  const mobile = useIsMobile();
  const [directoryOpen, setDirectoryOpen] = useState(false);
  const [drawerHasDirectory, setDrawerHasDirectory] = useState(false);
  const [desktopDirectory, setDesktopDirectory] = useState(true);
  const search = useSyncExternalStore(subscribeRoute, routeSnapshot, () => '');
  const route = useMemo(() => readRoute(search), [search]);
  const [busy, setBusy] = useState(false);
  const navigate = (next: Route) => {
    const q = new URLSearchParams(); Object.entries(next).forEach(([key, value]) => { if (value) q.set(key, String(value)); });
    window.history.pushState(null, '', `/app${window.location.pathname.endsWith('/') ? '/' : ''}?${q}`); window.dispatchEvent(new Event('linkeai-workspace-route'));
  };
  const openProject = (id: string) => { const project = MockService.getState().projects.find(project => project.id === id && !project.deleted);
    if (!project) { toast.error('项目不存在或已移入回收站'); return; } navigate({ view: 'agents', agent: project.agentId, project: id }); };
  const agentId = route.agent ?? AGENTS[0].id;
  const agent = AGENTS.find(agent => agent.id === agentId);
  const model = MODELS.find(model => model.id === route.model) ?? MODELS.find(model => model.kind === route.kind) ?? defaultModel;
  const toolView = route.view === 'models' || route.view === 'agents';
  const directoryView = toolView && !route.project;
  const sceneKey = route.view === 'models' ? `model:${model.id}` : route.view === 'agents' ? `agent:${route.project ?? agentId}` : route.view;
  const extraLabels: Partial<Record<StudioView, string>> = { assets: '素材库', projects: '我的项目', tasks: '任务中心', account: '账号', help: '帮助中心' };

  useEffect(() => {
    if (!state.hydrated || search !== window.location.search) return;
    // Two frames allow restored preferences, the target route, and responsive
    // layout effects to commit and paint underneath the entry mask.
    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => workspaceReady(window.location.pathname + search));
    });
    return () => cancelAnimationFrame(frame);
  }, [state.hydrated, state.preferences.theme, state.preferences.language, mobile, search, workspaceReady]);

  return <div className={`studio-shell studio-workspace ${state.preferences.theme === 'light' ? 'studio-light' : 'dark'}`} style={tokens} data-workspace-ready={state.hydrated}>
      {!mobile && <Navigation route={route} navigate={navigate} busy={busy} showDirectory={desktopDirectory}/>}
      {mobile && <Drawer placement="left" open={directoryOpen} onClose={() => setDirectoryOpen(false)} width={drawerHasDirectory ? 'min(360px, 92vw)' : 80} noHeader closable={false}
        styles={{bodyContent:{padding:0,height:'100%'}}}>
        <Navigation route={route} navigate={navigate} busy={busy} showDirectory={drawerHasDirectory} onClose={() => setDirectoryOpen(false)}/>
      </Drawer>}
      <div className="st-inset"><header className="st-topbar ws-topbar">
        <div className="ws-top-left">{(mobile || directoryView) && <Button variant="quiet" size="icon" aria-label={mobile ? '展开工作区导航' : desktopDirectory ? '收起工具目录' : '展开工具目录'} aria-expanded={mobile ? directoryOpen : desktopDirectory}
          onClick={() => { if (mobile) { setDrawerHasDirectory(directoryView); setDirectoryOpen(true); } else setDesktopDirectory(!desktopDirectory); }}>{!mobile && desktopDirectory ? <PanelLeftClose size={18}/> : <PanelLeftOpen size={18}/>}</Button>}
          {!toolView && <span className="ws-current-view">{modules.find(item => item.view === route.view)?.label ?? extraLabels[route.view]}</span>}</div>
        <div className="ws-top-right"><Button variant="quiet" size="md" onClick={() => navigate({ view: 'account' })}><CreditCrystal appearance={state.preferences.theme} />{state.points.toLocaleString()}</Button>
          <DropdownMenu><DropdownMenuTrigger asChild><Button variant="quiet" size="icon" aria-label="更多功能"><Menu size={18} /></Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end"><DropdownMenuItem onSelect={() => navigate({ view: 'assets' })}>素材库</DropdownMenuItem><DropdownMenuItem onSelect={() => navigate({ view: 'projects' })}>我的项目</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => navigate({ view: 'account' })}>账号与设置</DropdownMenuItem><DropdownMenuItem onSelect={() => navigate({ view: 'help' })}>帮助中心</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => MockService.setPreferences({ theme: state.preferences.theme === 'dark' ? 'light' : 'dark' })}><span className="ws-menu-item-inline">{state.preferences.theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}<span>切换主题</span></span></DropdownMenuItem>
              <DropdownMenuItem asChild><Link href="/"><span className="ws-menu-item-inline"><Home size={15} /><span>返回首页</span></span></Link></DropdownMenuItem></DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>{state.storageError && <div className="st-storage-warning">{state.storageError}</div>}
      <main className="st-main ws-content-stage" tabIndex={-1}>
        <AnimatePresence initial={false} mode="wait">
          <WorkspaceScene key={sceneKey} sceneKey={sceneKey} className={`ws-scene ${toolView ? 'ws-tool-host' : 'ws-library-host'}`} resetScroll>
        {route.view === 'models' ? <ModelWorkbench key={model.id} embedded initialKind={model.kind} initialModelId={model.id} onBusyChange={setBusy} />
          : route.view === 'agents' ? agent ? <AgentWorkbench key={route.project ?? agentId} agentId={agentId} projectId={route.project} initialPrompt={route.prompt} onOpenProject={openProject} />
            : <EmptyState title="未找到该智能体" action={<Button onClick={() => navigate({ view: 'agents' })}>返回智能体</Button>} />
          : route.view === 'api' ? <DeveloperCenter /> : route.view === 'account' || route.view === 'help' ? <AccountHelp view={route.view} />
          : <Explorer view={route.view} onOpenAgent={(agent, prompt) => navigate({ view: 'agents', agent, prompt })} onOpenProject={openProject} />}
          </WorkspaceScene>
        </AnimatePresence>
      </main></div>
  </div>;
}

function WorkspaceContent() {
  const state = useDemoState();
  const appearance = state.preferences.theme === 'light' ? 'light' : 'dark';
  useLayoutEffect(() => {
    document.documentElement.dataset.workspaceTheme = state.hydrated ? appearance : readWorkspaceTheme();
    return () => { delete document.documentElement.dataset.workspaceTheme; };
  }, [state.hydrated, appearance]);

  if (!state.hydrated) return <div className="workspace-theme-loading" role="status" aria-live="polite">正在载入工作台…</div>;
  return <WorkspaceTheme appearance={appearance}><WorkspaceView/></WorkspaceTheme>;
}
export default function Workspace() { return <DemoProvider><WorkspaceContent /></DemoProvider>; }
