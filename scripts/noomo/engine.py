"""Deterministic engine patches for the archived Noomo entry bundle.

This module only transforms source text. Asset URLs and generated output are
owned by the migration entry point; the immutable source archive stays intact.
"""

from __future__ import annotations


CURSOR_SHADER_GUARD = r'''updateShader(){
  const linkeWidth=Math.floor(Number(this.width)*Number(this.canvasDPI));
  const linkeHeight=Math.floor(Number(this.height)*Number(this.canvasDPI));
  if(this.destroyed||!Number.isSafeInteger(linkeWidth)||!Number.isSafeInteger(linkeHeight)||linkeWidth<1||linkeHeight<1||!Number.isSafeInteger(linkeWidth*linkeHeight*4))return;
  if(this.canvas.width!==linkeWidth)this.canvas.width=linkeWidth;
  if(this.canvas.height!==linkeHeight)this.canvas.height=linkeHeight;
  const U='''

CURSOR_REBUILD_JS = r'''function Y(L,U=1,N=1.2,Z=1.05,B=1.1){
  const le=s.value,me=o.value;
  if(!le||!me||!m)return;
  linkeCursorPending=[L,U,N,Z,B];
  const Be=Number(le.offsetHeight),linkeWidth=Number(L);
  if(!le.isConnected||!Number.isFinite(Be)||Be<1||!Number.isFinite(linkeWidth)||linkeWidth<1)return;
  linkeCursorPending=null;
  const previous=m,next=new f({width:L,height:Be,fragment:previous.fragment});
  le.appendChild(next.svg),m=next,P(me,m.id,U,N,Z,B),previous.destroy();
}'''


ENGINE_JS = r'''
// LinkeAI: preserve the source renderer and add a narrow host interface.
function __linkeStoryIsMobile(){return typeof window!=="undefined"&&window.innerWidth<1024;}
function __linkeStoryViewportHeight(){return Math.max(1,__linkeStoryIsMobile()?(window.visualViewport?.height||window.innerHeight):window.innerHeight);}
function __linkeStorySectionValues(mobile=__linkeStoryIsMobile()){return aH(!mobile).map(section=>({...section}));}
function __linkeStoryPixelsAt(progress,sections,height){
  const time=Math.max(0,Math.min(20,Number(progress)||0));
  const whole=Math.min(sections.length,Math.floor(time));
  let total=0;
  for(let index=0;index<whole;index++)total+=sections[index].scrollLength;
  if(whole<sections.length)total+=(time-whole)*sections[whole].scrollLength;
  return total*height/100;
}
function __linkeStoryRuntime(){return typeof window!=="undefined"?window.__LINKE_STORY_RUNTIME__:null;}
function __linkeStoryLayoutProgress(fallback){
  const target=__linkeStoryRuntime()?.layoutTargetProgress;
  return Number.isFinite(target)?target:fallback;
}
function __linkeStoryScrollShouldPause(runtime){
  const store=runtime.store;
  return !!(runtime.paused||document.hidden||!store.getSceneLoaded||store.getCurrentPage==="cases"||store.getMobileMenuOpen||store.isTransitionActive);
}
function __linkeStorySyncScrollDiagnostics(){
  const runtime=__linkeStoryRuntime();
  if(!runtime?.store)return;
  const values=runtime.getDiagnostics();
  document.documentElement.dataset.linkeStoryLayoutTarget=values.layoutTargetProgress==null?"":String(values.layoutTargetProgress);
  document.documentElement.dataset.linkeStoryScrollPaused=String(values.scrollPaused);
  document.documentElement.dataset.linkeStoryPage=values.page||"";
  document.documentElement.dataset.linkeStoryTimelineTime=values.engineTimelineTime==null?"":String(values.engineTimelineTime);
  document.documentElement.dataset.linkeStoryCrystalsNdc=JSON.stringify(values.crystals.map(project=>({
    id:project.id,position:project.position,ndc:project.screenNDC,
    meshVisible:project.visible,labelVisible:project.viewportVisible,screen:project.screenPosition
  })));
}
function __linkeStoryDiagnostic(phase){
  const runtime=__linkeStoryRuntime();
  if(!runtime)return;
  runtime.phase=phase;
  document.documentElement.dataset.linkeStoryPhase=phase;
  document.documentElement.dataset.linkeStoryEngine="three-r179";
  document.documentElement.dataset.linkeStoryCrystals="4";
}
function __linkeStoryLocalMessage(type,detail={}){
  window.postMessage({namespace:"linke-story",type,...detail},window.location.origin);
}
function __linkeStoryAttachStore(store){
  const runtime=window.__LINKE_STORY_RUNTIME__||(window.__LINKE_STORY_RUNTIME__={});
  if(runtime.store===store)return runtime;
  Object.assign(runtime,{
    store,scene:X,settings:X.settings,gsap:ba,scrollTrigger:vt,
    ready:false,phase:"loading",paused:false,disposed:false,engine:null,
    projects:[],renderedFrames:0,validFrames:0,armed:false,
    projectViewportRevision:0,
    layoutTargetProgress:null,layoutLockUntil:0,layoutLockEpoch:0,
    layout:{mobile:__linkeStoryIsMobile(),width:window.innerWidth,height:__linkeStoryViewportHeight()},
    sectionValues:__linkeStorySectionValues,
    sectionLengths:mobile=>__linkeStorySectionValues(mobile).map(section=>section.scrollLength),
    getDiagnostics:()=>({
      phase:runtime.phase,ready:runtime.ready,paused:runtime.paused,
      soundEnabled:store.isSoundEnabled,firstClick:store.getFirstClick,
      scrollPaused:store.getScroll?.paused?.()??false,page:store.getCurrentPage,
      engineTimelineTime:runtime.armed?dr.instance.time:null,
      layoutTargetProgress:runtime.layoutTargetProgress,
      rendererRevision:nv,projectCount:runtime.projects.length,
      progress:store.getScrollProgress,nativeScrollY:window.scrollY,
      smoothScrollY:store.getScroll?.scrollTop?.()??null,
      velocity:store.getScroll?.getVelocity?.()??0,
      width:X.viewport?.x??window.innerWidth,height:X.viewport?.y??window.innerHeight,
      mobile:runtime.layout.mobile,fov:X.camera?.fov??null,
      loadedAssets:Object.values(X.assetsManager?.assets||{}).filter(asset=>asset.loaded).length,
      expectedAssets:Object.keys(X.assetsManager?.assets||{}).length,
      renderedFrames:runtime.renderedFrames,
      crystals:runtime.projects.map(project=>({
        id:project.id,visible:project.mesh.visible,
        position:project.mesh.position.toArray(),icon:project.mesh.insideMesh?.name,
        screenNDC:project.ndc?.toArray?.()??null,
        viewportVisible:!!project.linkeViewportVisible,
        screenPosition:project.linkePublishedNDC?{
          x:project.linkePublishedNDC.x*.5+.5,y:project.linkePublishedNDC.y*.5+.5
        }:null
      }))
    }),
    setIceTransition:value=>store.setIceTransition(Math.max(0,Math.min(1,Number(value)||0))),
    setCaseVideo:element=>store.setVideoElement(element),
    seek:progress=>{
      const time=Math.max(0,Math.min(20,Number(progress)||0));
      if(Number.isFinite(runtime.layoutTargetProgress))runtime.layoutTargetProgress=time;
      const pixels=__linkeStoryPixelsAt(time,store.getScrollSections,__linkeStoryViewportHeight());
      store.getScroll?.scrollTop?.(pixels);
      store.setScrollProgress(time);
      runtime.engine?.seek(time);
      return time;
    },
    restoreProgress:progress=>{
      const time=Math.max(0,Math.min(20,Number(progress)||0));
      runtime.layoutLockEpoch++;
      clearTimeout(runtime.layoutSettleTimer);
      cancelAnimationFrame(runtime.layoutFinalFrame||0);
      runtime.layoutTargetProgress=null;
      runtime.layoutLockUntil=0;
      store.setScrollProgress(time);
      runtime.engine?.seek(time);
      runtime.refresh({progress:time});
      __linkeStorySyncScrollDiagnostics();
      return time;
    },
    scheduleLayoutSettle:()=>{
      clearTimeout(runtime.layoutSettleTimer);
      runtime.layoutSettleTimer=setTimeout(()=>{
        if(runtime.disposed||!Number.isFinite(runtime.layoutTargetProgress))return;
        if(performance.now()<runtime.layoutLockUntil){runtime.scheduleLayoutSettle();return;}
        runtime.refresh({progress:runtime.layoutTargetProgress,layoutFinal:true});
      },Math.max(1,runtime.layoutLockUntil-performance.now()));
    },
    beginLayoutResize:progress=>{
      const existing=Number.isFinite(runtime.layoutTargetProgress);
      if(!existing){
        runtime.layoutTargetProgress=Math.max(0,Math.min(20,Number(progress)||0));
      }
      runtime.layoutLockEpoch++;
      runtime.layoutLockUntil=performance.now()+1800;
      // ScrollSmoother.paused also disables its source normalizeScroll observer.
      store.getScroll?.paused?.(true);
      store.setScrollProgress(runtime.layoutTargetProgress);
      runtime.scheduleLayoutSettle();
      return runtime.layoutTargetProgress;
    },
    refresh:(options={})=>{
      const requested=Number.isFinite(options.progress)?options.progress:store.getScrollProgress;
      const progress=__linkeStoryLayoutProgress(requested);
      const layoutEpoch=runtime.layoutLockEpoch;
      if(Number.isFinite(runtime.layoutTargetProgress)&&!options.layoutFinal){
        runtime.layoutLockUntil=Math.max(runtime.layoutLockUntil,performance.now()+600);
        store.getScroll?.paused?.(true);
        runtime.scheduleLayoutSettle();
      }
      const height=__linkeStoryViewportHeight();
      document.documentElement.style.setProperty("--app-vh",`${height*.01}px`);
      cancelAnimationFrame(runtime.refreshFrame||0);
      runtime.refreshFrame=requestAnimationFrame(()=>{
        if(runtime.disposed)return;
        X.viewport?.update?.();
        runtime.projectViewportRevision++;
        const smoother=store.getScroll;
        smoother?.scrollTrigger?.refresh?.();
        vt.refresh();
        if(options.preserveProgress!==false){
          const pixels=__linkeStoryPixelsAt(progress,store.getScrollSections,height);
          smoother?.scrollTop?.(pixels);
          store.setScrollProgress(progress);
          runtime.engine?.seek(progress);
        }
        vt.update();
        if(Number.isFinite(runtime.layoutTargetProgress)){
          store.setScrollProgress(runtime.layoutTargetProgress);
          runtime.engine?.seek(runtime.layoutTargetProgress);
        }else{
          smoother?.paused?.(__linkeStoryScrollShouldPause(runtime));
          if(options.preserveProgress!==false){
            const pixels=__linkeStoryPixelsAt(progress,store.getScrollSections,height);
            smoother?.scrollTop?.(pixels);
            vt.update();
            store.setScrollProgress(progress);
            runtime.engine?.seek(progress);
          }
        }
        __linkeStorySyncScrollDiagnostics();
        document.documentElement.dataset.linkeStoryLayout=runtime.layout.mobile?"mobile":"desktop";
        if(options.layoutFinal){
          runtime.layoutFinalFrame=requestAnimationFrame(()=>{
            if(runtime.disposed||layoutEpoch!==runtime.layoutLockEpoch)return;
            if(performance.now()<runtime.layoutLockUntil){runtime.scheduleLayoutSettle();return;}
            const target=runtime.layoutTargetProgress;
            if(!Number.isFinite(target))return;
            const pixels=__linkeStoryPixelsAt(target,store.getScrollSections,__linkeStoryViewportHeight());
            smoother?.paused?.(__linkeStoryScrollShouldPause(runtime));
            smoother?.scrollTop?.(pixels);
            vt.update();
            store.setScrollProgress(target);
            runtime.engine?.seek(target);
            runtime.layoutTargetProgress=null;
            runtime.layoutLockUntil=0;
            __linkeStorySyncScrollDiagnostics();
            __linkeStoryLocalMessage("layout-settled",{progress:target});
          });
        }
      });
    },
    setLayout:(mobile,{progress=__linkeStoryLayoutProgress(store.getScrollProgress),notify=true}={})=>{
      const changed=runtime.layout.mobile!==!!mobile;
      const resized=changed||runtime.layout.width!==window.innerWidth||runtime.layout.height!==__linkeStoryViewportHeight();
      if(resized&&!Number.isFinite(runtime.layoutTargetProgress))progress=runtime.beginLayoutResize(progress);
      progress=__linkeStoryLayoutProgress(progress);
      runtime.layout={mobile:!!mobile,width:window.innerWidth,height:__linkeStoryViewportHeight()};
      if(changed||store.getScrollSections[17]?.scrollLength!==(mobile?1100:560)){
        store.scrollSections=__linkeStorySectionValues(!!mobile);
      }
      if(runtime.engine){
        X.settings.isMobile=!!mobile;
        runtime.engine.setUseMobileTimeline(!!mobile);
      }
      runtime.refresh({progress});
      if(changed&&notify){
        window.dispatchEvent(new CustomEvent("linke-layout",{detail:{mobile:!!mobile,progress}}));
        __linkeStoryLocalMessage("layout-changed",{mobile:!!mobile,progress});
      }
      return runtime.layout;
    },
    syncLayout:()=>runtime.setLayout(__linkeStoryIsMobile()),
    pause:()=>{
      if(runtime.paused||runtime.disposed)return;
      runtime.paused=true;
      runtime.soundBeforePause=store.isSoundEnabled;
      store.getScroll?.paused?.(true);
      store.setEnableSound(false);
      __linkeStorySyncScrollDiagnostics();
    },
    resume:()=>{
      if(!runtime.paused||runtime.disposed)return;
      runtime.paused=false;
      store.getScroll?.paused?.(__linkeStoryScrollShouldPause(runtime)||Number.isFinite(runtime.layoutTargetProgress));
      if(runtime.soundBeforePause&&store.getFirstClick)store.setEnableSound(true);
      runtime.refresh();
    },
    dispose:()=>{
      if(runtime.disposed)return;
      runtime.disposed=true;
      runtime.ready=false;
      store.setEnableSound(false);
      document.querySelectorAll("audio").forEach(audio=>audio.pause());
      cancelAnimationFrame(runtime.refreshFrame||0);
      cancelAnimationFrame(runtime.layoutFinalFrame||0);
      clearTimeout(runtime.resizeTimer);
      clearTimeout(runtime.layoutSettleTimer);
      runtime.engine?.destroy();
      window.removeEventListener("resize",runtime.onResize);
      window.visualViewport?.removeEventListener("resize",runtime.onResize);
      document.removeEventListener("visibilitychange",runtime.onVisibility);
      __linkeStoryDiagnostic("disposed");
    }
  });
  store.scrollSections=__linkeStorySectionValues();
  document.documentElement.style.setProperty("--app-vh",`${runtime.layout.height*.01}px`);
  runtime.onResize=()=>{
    clearTimeout(runtime.resizeTimer);
    const progress=runtime.beginLayoutResize(__linkeStoryLayoutProgress(store.getScrollProgress));
    runtime.resizeTimer=setTimeout(()=>runtime.setLayout(__linkeStoryIsMobile(),{progress}),120);
  };
  runtime.onVisibility=()=>document.hidden?runtime.pause():runtime.resume();
  window.addEventListener("resize",runtime.onResize);
  window.visualViewport?.addEventListener("resize",runtime.onResize);
  document.addEventListener("visibilitychange",runtime.onVisibility);
  window.addEventListener("pagehide",event=>event.persisted?runtime.pause():runtime.dispose());
  window.addEventListener("pageshow",event=>{if(event.persisted)runtime.resume();});
  __linkeStoryDiagnostic("loading");
  return runtime;
}
function __linkeStoryAttachScene(engine){
  const runtime=__linkeStoryRuntime();
  if(!runtime?.store)return;
  runtime.engine=engine;
  runtime.scene=X;
  runtime.settings=X.settings;
  X.settings.isMobile=runtime.layout.mobile;
  ae.on(_c.error,({url})=>{
    __linkeStoryDiagnostic("error");
    __linkeStoryLocalMessage("renderer-error",{message:"Scene asset could not be loaded",url});
  });
}
function __linkeStorySetProjects(projects){
  const runtime=__linkeStoryRuntime();
  if(runtime)runtime.projects=projects;
}
function __linkeStoryArmReady(){
  const runtime=__linkeStoryRuntime();
  if(!runtime)return;
  runtime.armed=true;
  runtime.validFrames=0;
  __linkeStoryDiagnostic("rendering");
  const canvas=X.pipeline?.renderer?.domElement;
  if(canvas){canvas.dataset.linkeStoryScene="true";canvas.dataset.engineRevision=nv;}
}
function __linkeStoryFrameRendered(){
  const runtime=__linkeStoryRuntime();
  if(!runtime||runtime.disposed||runtime.paused)return;
  runtime.renderedFrames++;
  const now=performance.now();
  if(runtime.lastFrameDiagnosticsAt==null||now-runtime.lastFrameDiagnosticsAt>=50){
    runtime.lastFrameDiagnosticsAt=now;
    __linkeStorySyncScrollDiagnostics();
  }
  if(!runtime.armed||runtime.ready||!runtime.store.getSceneLoaded)return;
  const renderer=X.pipeline?.renderer,canvas=renderer?.domElement;
  if(!canvas?.isConnected||!canvas.width||!canvas.height||renderer.getContext().isContextLost())return;
  if(runtime.projects.length!==4||!Object.values(X.assetsManager.assets).every(asset=>asset.loaded))return;
  if(!renderer.info.render.calls)return;
  if(++runtime.validFrames<2)return;
  runtime.ready=true;
  __linkeStoryDiagnostic("ready");
  document.documentElement.dataset.linkeStoryReady="true";
  __linkeStoryLocalMessage("renderer-ready",{revision:nv,projectCount:4});
}
// Repack the first four source tracks instead of stretching them over the
// original seven-crystal layout. Keep the source easing, horizontal stagger,
// depth, rotation and scale; normalize only each crystal's vertical travel.
const __linkeStoryCrystalLayouts={
  desktop:{
    startY:-2,gap:.85,travel:6.35,
    sourceStart:[-2,-2.700000048,-3.400000095,-4.300000191],
    sourceTravel:[10.432461739,10.43246007,10.432460308,10.432460308]
  },
  mobile:{
    startY:-1.8,gap:1.45,travel:9.5,phaseScale:.7,
    sourceStart:[-1.689186096,-3.062046289,-4.476172924,-5.845598221],
    sourceTravel:[16.122772217,15.695651293,15.504780293,15.279187202],
    // Source GLB easing samples; stretch mobile travel over the four-item section.
    sourceCurves:[[0.0,0.020159,0.045114,0.074903,0.109503,0.148812,0.192633,0.240653,0.292429,0.347374,0.404755,0.4637,0.523225,0.582264,0.639721,0.694523,0.74567,0.792281,0.833627,0.86914,0.898424,0.921235,0.937467,0.947127,0.950313,0.950879,0.95282,0.95668,0.963472,0.975471,1.0],[0.0,0.01986,0.044445,0.073792,0.107878,0.146604,0.189775,0.237084,0.288092,0.342222,0.398751,0.456822,0.515464,0.573627,0.630233,0.684222,0.73461,0.78053,0.821262,0.856249,0.885098,0.907571,0.923562,0.933079,0.936218,0.936944,0.939435,0.944391,0.953109,0.968512,1.0],[0.0,0.019577,0.043811,0.072739,0.106339,0.144512,0.187067,0.2337,0.28398,0.337338,0.39306,0.450302,0.508107,0.56544,0.621238,0.674456,0.724125,0.76939,0.80954,0.844028,0.872466,0.894617,0.91038,0.919761,0.922856,0.923734,0.926747,0.932741,0.943285,0.961916,1.0],[0.0,0.019129,0.042809,0.071076,0.103907,0.141208,0.182789,0.228356,0.277487,0.329624,0.384072,0.440005,0.496488,0.552511,0.607032,0.659034,0.707567,0.751797,0.791029,0.824728,0.852515,0.874161,0.889563,0.89873,0.901753,0.902872,0.906709,0.914343,0.927771,0.951498,1.0]]
  }
};
function __linkeStoryRepositionProject(project){
  const time=dr.instance.time;
  if(time<=17||time>=18)return;
  const index=Number(project.id.slice(7));
  if(!Number.isInteger(index)||index<0||index>3)return;
  const layout=__linkeStoryCrystalLayouts[X.settings.isMobile?"mobile":"desktop"];
  const smooth=value=>{const n=Math.max(0,Math.min(1,value));return n*n*(3-2*n);};
  const weight=smooth((time-17)/.08)*(1-smooth((time-17.92)/.08));
  const sourceY=project.mesh.position.y;
  let progress=Math.max(0,Math.min(1,(sourceY-layout.sourceStart[index])/layout.sourceTravel[index]));
  if(layout.sourceCurves){
    const curve=layout.sourceCurves[index];
    const frame=Math.max(0,Math.min(curve.length-1,(time-17)*layout.phaseScale*30));
    const lower=Math.floor(frame),upper=Math.min(lower+1,curve.length-1);
    progress=curve[lower]+(curve[upper]-curve[lower])*(frame-lower);
  }
  const targetY=layout.startY-index*layout.gap+progress*layout.travel;
  // Blend while the crystals are outside the viewport, preserving the
  // feather entrance and flame exit when scrolling in either direction.
  project.mesh.position.y=sourceY+(targetY-sourceY)*weight;
}
function __linkeStorySyncProjectViewport(project){
  const runtime=__linkeStoryRuntime();
  X.camera.updateMatrixWorld();
  project.ndc.copy(project.mesh.position).project(X.camera);
  const ndc=project.ndc;
  const finite=Number.isFinite(ndc.x)&&Number.isFinite(ndc.y)&&Number.isFinite(ndc.z);
  const visible=project.mesh.visible&&finite&&ndc.x>-1.5&&ndc.x<1.5&&ndc.y>-1.5&&ndc.y<1.5&&ndc.z>=-1&&ndc.z<=1;
  const revision=runtime?.projectViewportRevision??0;
  const force=project.linkeViewportRevision!==revision;
  const first=!project.linkePublishedNDC;
  if(first)project.linkePublishedNDC=new H;
  if(!project.linkeHiddenNDC)project.linkeHiddenNDC=new H(0,3,0);
  const published=visible?ndc:project.linkeHiddenNDC;
  if(force||first||project.linkeViewportVisible!==visible||published.manhattanDistanceTo(project.linkePublishedNDC)>1e-4){
    project.linkePublishedNDC.copy(published);
    project.linkeViewportVisible=visible;
    project.linkeViewportRevision=revision;
    ae.dispatch(Jh.viewportEvent,{id:project.id,ndc:published});
  }
  project.prevNDC.copy(ndc);
}
function __linkeStoryIconGeometry(kind){
  const positions=[];
  const vertex=(point,z)=>[point[0],point[1],z];
  const triangle=(a,b,c)=>positions.push(...a,...b,...c);
  const quad=(a,b,c,d)=>{triangle(a,b,c);triangle(a,c,d);};
  const rounded=(width,height,radius,x=0,y=0)=>{
    const points=[];
    const corners=[
      [x+width/2-radius,y+height/2-radius,0],
      [x-width/2+radius,y+height/2-radius,Math.PI/2],
      [x-width/2+radius,y-height/2+radius,Math.PI],
      [x+width/2-radius,y-height/2+radius,Math.PI*1.5]
    ];
    for(const [cx,cy,start] of corners)for(let step=0;step<=5;step++){
      const angle=start+step*Math.PI/10;
      points.push([cx+Math.cos(angle)*radius,cy+Math.sin(angle)*radius]);
    }
    const clean=points.filter((point,index)=>!index||Math.hypot(point[0]-points[index-1][0],point[1]-points[index-1][1])>1e-10);
    if(Math.hypot(clean[0][0]-clean.at(-1)[0],clean[0][1]-clean.at(-1)[1])<1e-10)clean.pop();
    return clean;
  };
  const solid=(points,depth=.09)=>{
    const area=points.reduce((sum,point,index)=>{const next=points[(index+1)%points.length];return sum+point[0]*next[1]-next[0]*point[1];},0);
    if(area<0)points=points.slice().reverse();
    const front=depth/2+.015,back=-depth/2+.015;
    for(let index=1;index<points.length-1;index++){
      triangle(vertex(points[0],front),vertex(points[index],front),vertex(points[index+1],front));
      triangle(vertex(points[0],back),vertex(points[index+1],back),vertex(points[index],back));
    }
    points.forEach((point,index)=>{
      const next=points[(index+1)%points.length];
      quad(vertex(point,back),vertex(next,back),vertex(next,front),vertex(point,front));
    });
  };
  const ring=(width,height,radius,stroke,x=0,y=0)=>{
    const outer=rounded(width,height,radius,x,y);
    const inner=rounded(width-2*stroke,height-2*stroke,Math.max(.001,radius-stroke),x,y);
    const front=.06,back=-.03;
    outer.forEach((point,index)=>{
      const next=(index+1)%outer.length;
      quad(vertex(point,front),vertex(outer[next],front),vertex(inner[next],front),vertex(inner[index],front));
      quad(vertex(point,back),vertex(inner[index],back),vertex(inner[next],back),vertex(outer[next],back));
      quad(vertex(point,back),vertex(outer[next],back),vertex(outer[next],front),vertex(point,front));
      quad(vertex(inner[index],front),vertex(inner[next],front),vertex(inner[next],back),vertex(inner[index],back));
    });
  };
  if(kind===0){
    ring(.49,.34,.075,.035,0,.035);
    solid([[-.135,-.12],[-.17,-.23],[.015,-.12]]);
    for(const x of [-.12,0,.12])solid(rounded(.042,.042,.021,x,.035),.08);
  }else if(kind===1){
    ring(.5,.38,.04,.033);
    solid([[-.19,-.13],[-.04,.055],[.11,-.13]],.065);
    solid([[.02,-.13],[.115,-.025],[.2,-.13]],.065);
    solid(rounded(.077,.077,.0385,.135,.105),.065);
  }else if(kind===2){
    ring(.5,.38,.055,.031);
    solid([[-.092,-.127],[.153,0],[-.092,.127]],.10);
  }else{
    const heights=[.15,.27,.40,.27,.15];
    heights.forEach((height,index)=>solid(rounded(.044,height,.022,(index-2)*.09,0),.095));
  }
  const geometry=new Un;
  geometry.setAttribute("position",new yn(new Float32Array(positions),3));
  geometry.computeVertexNormals();
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  geometry.name=["LinkeAI conversation","LinkeAI image","LinkeAI video","LinkeAI audio"][kind];
  return geometry;
}
'''


def _replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise ValueError(f"Noomo engine patch {label!r}: expected one anchor, found {count}")
    return text.replace(old, new, 1)


def patch_engine(text: str) -> str:
    """Return the patched entry source without reading or writing any assets."""
    if "// LinkeAI: preserve the source renderer" in text:
        raise ValueError("Noomo engine patch was already applied")

    patches = [
        (
            'updateShader(){const U=',
            CURSOR_SHADER_GUARD,
            "only generate displacement ImageData for valid dimensions",
        ),
        (
            'const N=this.width*this.canvasDPI,Z=this.height*this.canvasDPI,B=new Uint8ClampedArray(N*Z*4)',
            'const N=linkeWidth,Z=linkeHeight,B=new Uint8ClampedArray(N*Z*4)',
            "integer displacement buffer dimensions",
        ),
        (
            'destroy(){this.svg.remove(),this.canvas.remove()}',
            'destroy(){this.destroyed=!0,this.svg.remove(),this.canvas.remove()}',
            "prevent detached cursor shader updates",
        ),
        (
            'let m=null,A=0,g=0,b=0,_=0,v=0,w=null,C=null,M=null,S=0,x=0,y=!1;',
            'let m=null,A=0,g=0,b=0,_=0,v=0,w=null,C=null,M=null,S=0,x=0,y=!1,linkeCursorPending=null;',
            "pending cursor rebuild state",
        ),
        (
            'function k(){b=d(b,A,r.followSpeed),_=d(_,g,r.followSpeed),I(b,_),v=requestAnimationFrame(k)}',
            'function k(){v=requestAnimationFrame(k),b=d(b,A,r.followSpeed),_=d(_,g,r.followSpeed),I(b,_),linkeCursorPending&&Y(...linkeCursorPending)}',
            "retry cursor resize on source cursor RAF",
        ),
        (
            'const me=N.getBoundingClientRect();m.mouse.x=(L-me.left)/me.width',
            'const me=N.getBoundingClientRect();if(!(me.width>0&&me.height>0))return;m.mouse.x=(L-me.left)/me.width',
            "ignore pointer normalization while cursor is hidden",
        ),
        (
            'function Y(L,U=1,N=1.2,Z=1.05,B=1.1){const le=s.value,me=o.value;if(!le||!me||!m)return;const Be=le.offsetHeight;m.destroy(),m=new f({width:L,height:Be,fragment:m.fragment}),le.appendChild(m.svg),P(me,m.id,U,N,Z,B)}',
            CURSOR_REBUILD_JS,
            "wait for measurable cursor before replacing displacement map",
        ),
        (
            'M&&window.removeEventListener("scroll",M,!0),m?.destroy(),m=null',
            'M&&window.removeEventListener("scroll",M,!0),linkeCursorPending=null,m?.destroy(),m=null',
            "clear pending cursor rebuild on unmount",
        ),
        (
            'sH=["crystal0","crystal1","crystal2","crystal3","crystal4","crystal5","crystal6"]',
            'sH=["crystal0","crystal1","crystal2","crystal3"]',
            "four store crystal IDs",
        ),
        ('crystals:new Array(7)', 'crystals:new Array(4)', "four model assets"),
        ('crystalNormals:new Array(7)', 'crystalNormals:new Array(4)', "four normal assets"),
        (
            'rH=()=>Rn().$device,qA=()',
            'rH=()=>({...Rn().$device,isMobile:__linkeStoryIsMobile(),isDesktop:!__linkeStoryIsMobile()}),qA=()',
            "viewport base device selection",
        ),
        (
            'const i=Kn(()=>n.isTablet||e.value);return{...n,isRealTablet:i,isIpadSafari:t}',
            'const i=Kn(()=>__linkeStoryIsMobile()&&(n.isTablet||e.value));return{...n,isMobile:__linkeStoryIsMobile(),isDesktop:!__linkeStoryIsMobile(),isRealTablet:i,isIpadSafari:t}',
            "viewport device selection",
        ),
        (
            'X.settings=Object.assign(X.settings,e),new dt',
            'X.settings=Object.assign(X.settings,e),X.settings.crystalHovers=X.settings.crystalHovers.slice(0,4),new dt',
            "four hover settings",
        ),
        (
            'for(let e=0;e<X.settings.crystalHovers.length;e++)',
            'for(let e=0;e<Math.min(4,X.settings.crystalHovers.length);e++)',
            "four project instances",
        ),
        (
            'u!==null&&(u=new Gt(u.geometry,s)),this.mesh=oie(c,u,r)',
            'u=new Gt(__linkeStoryIconGeometry(Number(e.slice(7))),s),u.name=["conversation","image","video","audio"][Number(e.slice(7))],this.mesh=oie(c,u,r)',
            "replace brand geometry",
        ),
        (
            'Et(this.mesh,"position",this.timeline+".position"),Et(this.dummy,"rotation",this.timeline+".rotation")',
            'Et(this.mesh,"position",this.timeline+".position").forEach(dependency=>{dependency.afterUpdate=()=>__linkeStoryRepositionProject(this)}),Et(this.dummy,"rotation",this.timeline+".rotation")',
            "local project track layout",
        ),
        (
            'this.ndc.copy(this.mesh.position),this.ndc.project(X.camera),this.ndc.x>-1.5&&this.ndc.x<1.5&&this.ndc.y>-1.5&&this.ndc.y<1.5&&this.ndc.manhattanDistanceTo(this.prevNDC)>1e-4&&ae.dispatch(Jh.viewportEvent,{id:this.id,ndc:this.ndc}),this.prevNDC.copy(this.ndc)',
            '__linkeStorySyncProjectViewport(this)',
            "publish hidden crystal positions without per-frame store writes",
        ),
        (
            'a.getSectionColor==="dark"&&a.setIceCubePositionByIndex(l,{x:c.x,y:c.y})',
            '(a.getSectionColor==="dark"||c.y>=2)&&a.setIceCubePositionByIndex(l,{x:c.x,y:c.y})',
            "clear offstage crystal labels during light sections",
        ),
        (
            'this.projects.push(t)}ae.on(X.createdEvent,this.initialize)',
            'this.projects.push(t)}__linkeStorySetProjects(this.projects),ae.on(X.createdEvent,this.initialize)',
            "project diagnostics",
        ),
        ('class Jh{', ENGINE_JS + '\nclass Jh{', "host helpers"),
        (
            '__name:"app",setup(n){const e=so(),t=UA()',
            '__name:"app",setup(n){const e=so(),linkeRuntime=__linkeStoryAttachStore(e),t=UA()',
            "safe store attachment",
        ),
        (
            'v=Math.max(1,c()?d():window.innerHeight)',
            'v=Math.max(1,__linkeStoryViewportHeight())',
            "consistent viewport measure",
        ),
        (
            'g=b=>{const _=e.getScrollSections',
            'g=b=>{const linkeTarget=__linkeStoryRuntime()?.layoutTargetProgress;if(Number.isFinite(linkeTarget))return linkeTarget;const _=e.getScrollSections',
            "hold logical progress during delayed layout refresh",
        ),
        (
            'isMobile:t||e.value}}),r.on(_a.hoverEvent',
            'isMobile:__linkeStoryIsMobile()}}),__linkeStoryAttachScene(r),r.on(_a.hoverEvent',
            "safe scene attachment",
        ),
        (
            'await $d(700),r.seek(a.getScrollProgress)}})',
            'await $d(700),r.seek(a.getScrollProgress),__linkeStoryArmReady()}})',
            "arm readiness after source seek",
        ),
        (
            'X.pipeline.render(s),ae.dispatch(dt.afterRenderEvent,s)',
            'X.pipeline.render(s),__linkeStoryFrameRendered(),ae.dispatch(dt.afterRenderEvent,s)',
            "verify effective render",
        ),
        (
            'container;currentHoverId=null;constructor({settings:e={},container:t})',
            'container;currentHoverId=null;#frame=0;#disposed=!1;constructor({settings:e={},container:t})',
            "track scene animation frame",
        ),
        (
            'await X.assetsManager.loadAll(),requestAnimationFrame(this.#s),await X.instance.create(this.container)',
            'await X.assetsManager.loadAll(),this.#frame=requestAnimationFrame(this.#s),await X.instance.create(this.container)',
            "track initial frame",
        ),
        (
            '#s=e=>{document.hidden||ae.dispatch(dt.rawEvent,e),requestAnimationFrame(this.#s)}',
            '#s=e=>{if(this.#disposed)return;this.#frame=requestAnimationFrame(this.#s),document.hidden||__linkeStoryRuntime()?.paused||ae.dispatch(dt.rawEvent,e)}',
            "pause and cancel renderer ticks",
        ),
        (
            'releaseSpiritLight=()=>{ae.dispatch(xv.event)}}const Rie=',
            '''releaseSpiritLight=()=>{ae.dispatch(xv.event)};destroy=()=>{
              if(this.#disposed)return;this.#disposed=!0;cancelAnimationFrame(this.#frame);
              document.body.removeEventListener("mousemove",this.#e);
              document.body.removeEventListener("mousedown",this.#t);
              document.body.removeEventListener("mouseup",this.#n);
              document.body.removeEventListener("touchmove",this.#r);
              document.body.removeEventListener("touchstart",this.#i);
              document.body.removeEventListener("touchend",this.#o);
              ae.off(Jh.hoverEvent,this.#a);ae.off(Jh.viewportEvent,this.#l);
              window.removeEventListener("resize",X.viewport.debounceResize);
              X.pipeline.renderer.dispose();X.pipeline.renderer.forceContextLoss();
            }}const Rie=''',
            "dispose scene document",
        ),
        (
            'this.setOptimizationLevel(Pt.optimizationLevel+1),this.go();return}return}if(this.#t>=this.#e)',
            'this.setOptimizationLevel(Pt.optimizationLevel+1),this.go();return}this.initialOptimizationDone||(this.initialOptimizationDone=!0,ae.dispatch(Pt.initialOptimizationDoneEvent));return}if(this.#t>=this.#e)',
            "finish startup at lowest performance tier",
        ),
    ]
    for old, new, label in patches:
        text = _replace_once(text, old, new, label)
    return text
