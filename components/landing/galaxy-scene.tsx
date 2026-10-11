'use client';

import { useEffect, useRef, useState } from 'react';
import { GALAXY_CORE_HALO_CONFIG, GALAXY_ENTRANCE_CONFIG, GALAXY_KEYFRAMES, GALAXY_SCENE_CONFIG, getGalaxyDistance } from '@/lib/galaxy-config';

/** Embeds the original Stars r62 renderer without sharing its globals with the React app. */
export function GalaxyScene({ onEntranceComplete, frameTitle = '100,000 Stars galaxy background' }: { onEntranceComplete?: () => void; frameTitle?: string }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const initialScrollRef = useRef(false);
  const [enabled, setEnabled] = useState(false);
  const [ready, setReady] = useState(false);
  const config = GALAXY_SCENE_CONFIG;
  const entrance = GALAXY_ENTRANCE_CONFIG;
  const halo = GALAXY_CORE_HALO_CONFIG;
  const frameUrl = `${config.source}?background=1&seed=${config.seed}&startZ=${entrance.start.z}&startRx=${entrance.start.rx}&startRy=${entrance.start.ry}&cameraScaleZ=${entrance.start.cameraScaleZ}&endZ=${entrance.end.z}&endRy=${entrance.end.ry}&spinMs=${entrance.spinMs}&wheelReplayMs=${entrance.wheelReplayMs}&twinkleStrength=${config.twinkleStrength}&coreHalo=${halo.enabled ? 1 : 0}&haloBreathMs=${halo.breathPeriodMs}&haloRadius=${halo.radiusAmplitude}&haloBrightness=${halo.brightnessAmplitude}&haloFlowMs=${halo.flowPeriodMs}&haloWarp=${halo.uvWarp}&haloSeed=${halo.seed}&warmGlow=${halo.warmGlowEnabled ? 1 : 0}&warmGlowRadius=${halo.warmGlowRadiusAmplitude}&warmGlowBrightness=${halo.warmGlowBrightnessAmplitude}`;

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const forcedStatic = new URLSearchParams(window.location.search).get('motion') === 'static';
    const previousRestoration = history.scrollRestoration;
    history.scrollRestoration = 'manual';
    if (!initialScrollRef.current) {
      initialScrollRef.current = true;
      window.scrollTo(0, 0);
    }
    if (reducedMotion.matches || forcedStatic) {
      mount.dataset.renderMode = 'static';
      onEntranceComplete?.();
      return () => { history.scrollRestoration = previousRestoration; };
    }
    let target = 1;
    let anchors: number[] = [];
    let active = true;
    let entranceReported = false;
    const completeEntrance = () => {
      if (!active || entranceReported) return;
      entranceReported = true;
      onEntranceComplete?.();
    };
    const showStatic = (message: string) => {
      mount.dataset.renderMode = 'static';
      mount.dataset.cloneError = message;
      setReady(false);
      setEnabled(false);
      completeEntrance();
    };
    const loadingTimeout = window.setTimeout(() => showStatic('Galaxy loading timed out'), 15000);
    const post = (message: object) => frameRef.current?.contentWindow?.postMessage({ source: 'linkeai-galaxy', ...message }, window.location.origin);
    const updateTarget = () => {
      target = getGalaxyDistance(window.scrollY, anchors);
      mount.dataset.galaxyTarget = target.toFixed(4);
      post({ type: 'pause', paused: reducedMotion.matches });
      post({ type: 'distance', distance: target });
    };
    // Keep recording scroll during the entrance; the native camera catches up afterwards.
    const onScroll = () => updateTarget();
    const measure = () => {
      const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      anchors = GALAXY_KEYFRAMES.map(({ id }) => {
        const section = document.getElementById(id);
        return section ? Math.min(maxScroll, section.getBoundingClientRect().top + window.scrollY) : 0;
      });
      updateTarget();
    };
    const onMessage = (event: MessageEvent) => {
      if (!active || event.origin !== window.location.origin || event.source !== frameRef.current?.contentWindow || event.data?.source !== 'stars-galaxy-clone') return;
      if (event.data.type === 'ready') {
        window.clearTimeout(loadingTimeout);
        delete mount.dataset.cloneError;
        mount.dataset.renderMode = 'original-stars';
        mount.dataset.threeRevision = String(event.data.revision);
        mount.dataset.particles = String(event.data.particles);
        setReady(true);
        post({ type: 'pause', paused: reducedMotion.matches });
        post({ type: 'distance', distance: target });
      } else if (event.data.type === 'frame') {
        mount.dataset.galaxyDistance = Number(event.data.distance).toFixed(4);
        mount.dataset.galaxyProgress = Number(event.data.progress).toFixed(4);
        mount.dataset.galaxyIntro = event.data.intro ? 'playing' : 'complete';
        mount.dataset.galaxyOrbit = Number(event.data.orbit).toFixed(4);
        mount.dataset.galaxyPhase = String(event.data.phase);
        mount.dataset.cameraZ = Number(event.data.pose.z).toFixed(4);
        mount.dataset.cameraRx = Number(event.data.pose.rx).toFixed(6);
        mount.dataset.cameraRy = Number(event.data.pose.ry).toFixed(6);
        mount.dataset.nativeTour = String(event.data.touring);
        mount.dataset.heatVision = String(event.data.heatVision);
        if (event.data.intro === false) completeEntrance();
      } else if (event.data.type === 'intro-complete') {
        completeEntrance();
      } else if (event.data.type === 'error') {
        window.clearTimeout(loadingTimeout);
        showStatic(String(event.data.message));
      }
    };
    const onMotion = () => {
      const pause = reducedMotion.matches;
      post({ type: 'pause', paused: pause });
      mount.dataset.renderMode = pause ? 'static' : 'original-stars';
      setReady(false);
      setEnabled(!pause);
      if (pause) completeEntrance();
    };
    const observer = new ResizeObserver(measure);
    GALAXY_KEYFRAMES.forEach(({ id }) => { const element = document.getElementById(id); if (element) observer.observe(element); });
    window.addEventListener('message', onMessage);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', measure);
    reducedMotion.addEventListener('change', onMotion);
    measure();
    // Install the listeners before starting the embedded renderer on the next frame.
    const startFrame = window.requestAnimationFrame(() => {
      if (!active) return;
      setEnabled(true);
      // An existing iframe can survive Fast Refresh or a parent effect restart.
      // Request its current state instead of waiting for a second one-time ready event.
      post({ type: 'status' });
    });
    return () => {
      active = false;
      window.cancelAnimationFrame(startFrame);
      window.clearTimeout(loadingTimeout);
      post({ type: 'pause', paused: true });
      observer.disconnect();
      window.removeEventListener('message', onMessage);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', measure);
      reducedMotion.removeEventListener('change', onMotion);
      history.scrollRestoration = previousRestoration;
    };
  }, [onEntranceComplete]);

  return <div ref={mountRef} className={`galaxy-scene${ready ? ' galaxy-ready' : ''}`} aria-hidden="true" data-galaxy-distance="1.0000" data-galaxy-progress="0.0000">
    <div className="galaxy-static" />
    {enabled && <iframe ref={frameRef} src={frameUrl} title={frameTitle} tabIndex={-1} className="galaxy-original-frame" sandbox="allow-scripts allow-same-origin" />}
  </div>;
}
