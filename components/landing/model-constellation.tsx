'use client';

import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import type { ModelMeteorDefinition } from '@/lib/model-meteor-config';
import { MODEL_STAR_CONFIG, ModelStarDeck, nextStarSwap, starPoses, starRandom, type ModelStarPose } from '@/lib/model-constellation';
import './model-constellation.css';

type Status = 'paused' | 'running' | 'still';
interface Star extends ModelStarPose {
  modelId: number;
  createdAt: number;
  nextSwap: number;
  fade: 'in' | 'out';
  replacementAt?: number;
}
type Variables = CSSProperties & Record<`--${string}`, string | number>;

export function ModelConstellation({ enabled, models, label }: {
  enabled: boolean;
  models: readonly ModelMeteorDefinition[];
  label: string;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [stars, setStars] = useState<Star[]>([]);
  const [status, setStatus] = useState<Status>('paused');
  const poolKey = models.map(model => model.id).join(',');
  const iconKey = [...new Set(models.map(model => model.iconSrc))].join(',');
  const modelById = useMemo(() => new Map(models.map(model => [model.id, model])), [models]);

  useEffect(() => {
    // Warm the thirteen tiny local SVGs before the first model replacement.
    const images = iconKey.split(',').map(src => {
      const image = new window.Image();
      image.src = src;
      return image;
    });
    return () => { for (const image of images) image.onload = image.onerror = null; };
  }, [iconKey]);

  useEffect(() => {
    const host = hostRef.current;
    if (!enabled || !host || !poolKey) return;
    const ids = [...new Set(poolKey.split(',').map(Number))];
    const random = starRandom(MODEL_STAR_CONFIG.seed);
    const deck = new ModelStarDeck(ids, random);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const forcedStatic = new URLSearchParams(window.location.search).get('motion') === 'static';
    const galaxy = document.querySelector<HTMLElement>('.galaxy-scene');
    let active: Star[] = [];
    let clock = 0;
    let previousTime: number | undefined;
    let raf = 0;
    let visible = false;
    let disposed = false;
    let mode: Status = 'paused';

    const publish = () => { if (!disposed) setStars(active.map(star => ({ ...star }))); };
    const tick = (time: number) => {
      raf = 0;
      if (disposed || mode !== 'running') return;
      if (previousTime !== undefined) clock += time - previousTime;
      previousTime = time;
      let changed = false;
      for (const star of active) {
        if (star.replacementAt !== undefined && clock >= star.replacementAt) {
          const next = deck.take(new Set(active.map(item => item.modelId)));
          if (next !== null) star.modelId = next;
          star.fade = 'in';
          star.replacementAt = undefined;
          star.nextSwap = nextStarSwap(clock, star, random);
          changed = true;
        } else if (star.replacementAt === undefined && clock >= star.nextSwap) {
          star.fade = 'out';
          star.replacementAt = clock + MODEL_STAR_CONFIG.fadeMs;
          changed = true;
        }
      }
      if (changed) publish();
      raf = requestAnimationFrame(tick);
    };
    const sync = () => {
      cancelAnimationFrame(raf);
      raf = 0;
      previousTime = undefined;
      const previousMode = mode;
      mode = reduced.matches || forcedStatic || galaxy?.dataset.renderMode === 'static'
        ? 'still' : visible && !document.hidden ? 'running' : 'paused';
      host.dataset.state = mode;
      setStatus(mode);
      if (previousMode === 'still' && mode !== 'still') {
        for (const star of active) star.createdAt = clock;
        publish();
      }
      if (mode === 'still') {
        for (const star of active) { star.fade = 'in'; star.replacementAt = undefined; }
        publish();
      }
      if (mode === 'running') raf = requestAnimationFrame(tick);
    };
    const layout = () => {
      const bounds = host.getBoundingClientRect();
      const copy = host.parentElement?.querySelector('.landing-text-block')?.getBoundingClientRect();
      const navigation = document.querySelector('.landing-nav')?.getBoundingClientRect();
      const exclusions = [copy].flatMap(rect => rect ? [{ left: rect.left - bounds.left, right: rect.right - bounds.left,
        top: rect.top - bounds.top, bottom: rect.bottom - bounds.top }] : []);
      // The fixed header occupies this band when the section is snapped into view.
      // Measuring while offscreen must not change the eventual model positions.
      if (navigation && window.innerWidth > 900) exclusions.push({ left: navigation.left - bounds.left,
        right: navigation.right - bounds.left, top: 0, bottom: navigation.height });
      const poses = starPoses(bounds.width, bounds.height, window.innerWidth, exclusions).slice(0, ids.length);
      const slots = new Set(poses.map(pose => pose.slot));
      const taken = new Set(active.filter(star => slots.has(star.slot)).map(star => star.modelId));
      active = poses.flatMap(pose => {
        const existing = active.find(star => star.slot === pose.slot);
        const modelId = existing?.modelId ?? deck.take(taken);
        if (modelId === null) return [];
        taken.add(modelId);
        return [{ ...pose, modelId, createdAt: existing?.createdAt ?? clock, fade: existing?.fade ?? 'in',
          replacementAt: existing?.replacementAt,
          nextSwap: existing?.nextSwap ?? nextStarSwap(clock, pose, random) } satisfies Star];
      });
      publish();
    };
    const resize = new ResizeObserver(layout);
    const intersection = new IntersectionObserver(entries => {
      const entry = entries[0];
      const nextVisible = !!entry?.isIntersecting && entry.intersectionRatio > .05;
      if (visible !== nextVisible) { visible = nextVisible; sync(); }
    }, { threshold: [0, .05, .2] });
    // Observe only the mode: per-frame camera telemetry must not restart this clock.
    const fallback = new MutationObserver(sync);
    resize.observe(host);
    const copy = host.parentElement?.querySelector('.landing-text-block');
    if (copy) resize.observe(copy);
    intersection.observe(host);
    if (galaxy) fallback.observe(galaxy, { attributes: true, attributeFilter: ['data-render-mode'] });
    document.addEventListener('visibilitychange', sync);
    reduced.addEventListener('change', sync);
    layout();
    sync();
    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      resize.disconnect();
      intersection.disconnect();
      fallback.disconnect();
      document.removeEventListener('visibilitychange', sync);
      reduced.removeEventListener('change', sync);
    };
  }, [enabled, poolKey]);

  return <div ref={hostRef} className="landing-model-constellation" role="group" aria-label={label} aria-live="off"
    data-state={status} data-active-count={stars.length} data-pool-size={models.length} data-layout="central-cluster">
    {stars.map(star => {
      const model = modelById.get(star.modelId);
      if (!model) return null;
      const style: Variables = { left: star.left, top: star.top, width: star.width,
        '--star-period': `${star.periodMs}ms`, '--star-delay': `${-star.offsetMs - star.createdAt}ms`,
        '--star-size': `${star.size}px`, '--star-peak': star.peak };
      return <div key={star.slot} className="landing-model-star" style={style} data-slot={star.slot}
        data-model-id={model.id} data-fade={star.fade} data-period={star.periodMs.toFixed(0)}>
        <span className="landing-model-star-point" aria-hidden="true" />
        <div className="landing-model-star-caption"><img src={model.iconSrc} width={22} height={22} alt="" draggable={false} />
          <span className="landing-model-star-name" title={model.name}>{model.name}</span></div>
      </div>;
    })}
  </div>;
}
