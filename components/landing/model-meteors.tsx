'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { MODEL_METEOR_CONFIG, MODEL_METEOR_MODELS, type ModelMeteorConfig, type ModelMeteorDefinition } from '@/lib/model-meteor-config';
import './model-meteors.css';

type Variables = CSSProperties & Record<`--${string}`, string | number>;
type MeteorState = 'waiting' | 'running' | 'paused' | 'disabled';
interface Character {
  icon: boolean;
  text: string;
  offset: number;
  distance: number;
}
interface Meteor {
  id: number;
  slot: number;
  model: ModelMeteorDefinition;
  characters: Character[];
  widthEm: number;
  jitterX: number;
  jitterY: number;
  left: number;
  top: number;
  angle: number;
  duration: number;
  scale: number;
  brightness: number;
  tail: number;
  travel: number;
  expiryJob: number;
}
interface Job {
  key: number;
  callback: () => void;
  remaining: number;
  deadline: number;
  timer?: number;
}

const wideCharacter = /[\u1100-\u115f\u2e80-\ua4cf\uac00-\ud7a3\uf900-\ufaff\ufe30-\ufe4f\uff00-\uff60\uffe0-\uffe6]/;
const random = (min: number, max: number) => min + Math.random() * (max - min);
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

/** Same character-width and center-out reveal calculation as the source component. */
function charactersFor(name: string) {
  const units = [{ icon: true, text: '', width: 1.55 }, ...Array.from(name, character => ({
    icon: false,
    text: character === ' ' ? '\u00a0' : character,
    width: (wideCharacter.test(character) ? 1 : .62) + .08,
  }))];
  const widthEm = units.reduce((width, unit) => width + unit.width, 0);
  let cursor = 0;
  const characters = units.map(unit => {
    const center = cursor + unit.width / 2 - widthEm / 2;
    cursor += unit.width;
    return { icon: unit.icon, text: unit.text, offset: Number((-center).toFixed(2)), distance: Number(Math.abs(center).toFixed(2)) };
  });
  return { characters, widthEm };
}

export function ModelMeteors({ enabled, models = MODEL_METEOR_MODELS, config = MODEL_METEOR_CONFIG }: {
  enabled: boolean;
  models?: readonly ModelMeteorDefinition[];
  config?: ModelMeteorConfig;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const runtimeRef = useRef<{ failIcon: (meteor: Meteor) => void } | null>(null);
  const [meteors, setMeteors] = useState<Meteor[]>([]);
  const [status, setStatus] = useState<MeteorState>('waiting');

  useEffect(() => {
    const host = hostRef.current;
    const hero = host?.closest<HTMLElement>('#opening');
    if (!enabled || !config.enabled || !host || !hero) return;
    const copy = hero.querySelector<HTMLElement>('.landing-hero-copy');
    const nav = document.querySelector<HTMLElement>('.landing-nav');
    const galaxy = document.querySelector<HTMLElement>('.galaxy-scene');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const forcedStatic = new URLSearchParams(window.location.search).get('motion') === 'static';
    const pool = models.filter(model => model.name && model.iconSrc);
    const failedIcons = new Set<string>();
    const active = new Map<number, Meteor>();
    const jobs = new Map<number, Job>();
    let deck: ModelMeteorDefinition[] = [];
    let nextMeteor = 0;
    let nextJob = 0;
    let playing = false;
    let disposed = false;
    let measureFrame = 0;
    let compact = window.innerWidth <= config.compactMaxWidth;
    let bounds = host.getBoundingClientRect();
    let copyBounds = copy?.getBoundingClientRect();
    let navBottom = nav?.getBoundingClientRect().bottom ?? 0;
    let rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    setMeteors([]);

    const reportJobs = () => {
      host.dataset.pendingTimers = String(jobs.size);
      host.dataset.armedTimers = String([...jobs.values()].filter(job => job.timer !== undefined).length);
    };
    const publish = () => { if (!disposed) setMeteors([...active.values()]); };
    const arm = (job: Job) => {
      job.deadline = performance.now() + job.remaining;
      job.timer = window.setTimeout(() => {
        jobs.delete(job.key);
        reportJobs();
        if (!disposed && playing) job.callback();
      }, job.remaining);
    };
    const schedule = (delay: number, callback: () => void) => {
      const job = { key: nextJob++, remaining: delay, deadline: 0, callback } satisfies Job;
      jobs.set(job.key, job);
      if (playing) arm(job);
      reportJobs();
      return job.key;
    };
    const cancel = (key: number) => {
      const job = jobs.get(key);
      if (job?.timer !== undefined) window.clearTimeout(job.timer);
      jobs.delete(key);
      reportJobs();
    };
    const remove = (id: number) => {
      const meteor = active.get(id);
      if (!meteor) return;
      cancel(meteor.expiryJob);
      active.delete(id);
      publish();
    };
    const labelHalfWidth = (meteor: Meteor) => meteor.widthEm * (compact ? 12 : (.8 + .12 * meteor.scale) * rootFontSize) / 2;
    const position = (meteor: Meteor, neighbors: readonly Meteor[]) => {
      if (!copyBounds) return false;
      const fontSize = compact ? 12 : (.8 + .12 * meteor.scale) * rootFontSize;
      const halfWidth = labelHalfWidth(meteor);
      const minX = config.insetPx - bounds.left + halfWidth;
      const maxX = window.innerWidth - config.insetPx - bounds.left - halfWidth;
      if (minX > maxX) return false;
      // Six anchors above the copy and three beside it, never at the galaxy core.
      if (meteor.slot < 6) {
        meteor.left = clamp(copyBounds.left - bounds.left + copyBounds.width * (.18 + (meteor.slot % 3) * .32) + meteor.jitterX * 22, minX, maxX);
        meteor.top = copyBounds.top - bounds.top - 64 - Math.floor(meteor.slot / 3) * 64 + meteor.jitterY * 12;
      } else {
        if (compact) return false;
        meteor.left = copyBounds.right - bounds.left + config.insetPx + halfWidth + 18 + meteor.jitterX * 10;
        meteor.top = copyBounds.top - bounds.top + copyBounds.height * (.18 + (meteor.slot - 6) * .32) + meteor.jitterY * 12;
        if (meteor.left > maxX) return false;
      }
      const minY = Math.max(config.insetPx, navBottom - bounds.top + config.insetPx) + fontSize;
      if (meteor.top < minY || meteor.top + fontSize > bounds.height - config.insetPx) return false;
      if (neighbors.some(other => Math.abs(meteor.left - other.left) < halfWidth + labelHalfWidth(other) + config.insetPx && Math.abs(meteor.top - other.top) < fontSize * 1.5 + config.insetPx)) return false;
      meteor.travel = compact ? Math.min(26 * rootFontSize, window.innerWidth * .8) : 26 * rootFontSize;
      return true;
    };
    const place = (meteor: Meteor, neighbors: readonly Meteor[]) => {
      const alternatives = Array.from({ length: compact ? 6 : 9 }, (_, index) => index).filter(slot => slot !== meteor.slot);
      for (let index = alternatives.length - 1; index > 0; index--) {
        const other = Math.floor(Math.random() * (index + 1));
        [alternatives[index], alternatives[other]] = [alternatives[other], alternatives[index]];
      }
      for (const slot of [meteor.slot, ...alternatives]) {
        meteor.slot = slot;
        if (position(meteor, neighbors)) return true;
      }
      return false;
    };
    const takeModel = () => {
      if (!deck.length) {
        deck = pool.filter(model => !failedIcons.has(model.iconSrc));
        for (let index = deck.length - 1; index > 0; index--) {
          const other = Math.floor(Math.random() * (index + 1));
          [deck[index], deck[other]] = [deck[other], deck[index]];
        }
      }
      return deck.shift();
    };
    const spawn = () => {
      if (!playing || active.size >= (compact ? config.compactLimit : config.desktopLimit)) return;
      const model = takeModel();
      if (!model) return;
      const intensity = random(.62, 1);
      const meteor: Meteor = {
        id: nextMeteor++, slot: Math.floor(random(0, compact ? 6 : 9)), model, ...charactersFor(model.name),
        jitterX: random(-1, 1), jitterY: random(-1, 1),
        left: 0, top: 0, angle: random(-40, -22),
        duration: Math.round(random(...config.durationMs)),
        scale: Number((.72 + .28 * intensity).toFixed(3)),
        brightness: Number((.5 + .5 * intensity).toFixed(3)),
        tail: Number((10 + 12 * intensity).toFixed(2)), travel: 0, expiryJob: -1,
      };
      if (!place(meteor, [...active.values()])) { deck.unshift(model); return; }
      active.set(meteor.id, meteor);
      meteor.expiryJob = schedule(meteor.duration + 80, () => remove(meteor.id));
      publish();
    };
    const next = () => schedule(random(...config.spawnIntervalMs), () => { spawn(); next(); });

    const measure = () => {
      if (disposed) return;
      compact = window.innerWidth <= config.compactMaxWidth;
      host.dataset.view = compact ? 'compact' : 'desktop';
      const heroBounds = hero.getBoundingClientRect();
      copyBounds = copy?.getBoundingClientRect();
      navBottom = nav?.getBoundingClientRect().bottom ?? 0;
      let enoughSpace = true;
      if (compact) {
        const top = Math.max(config.insetPx, navBottom - heroBounds.top + config.insetPx);
        const bottom = (copyBounds?.top ?? heroBounds.bottom) - heroBounds.top - config.insetPx;
        const height = Math.max(0, bottom - top);
        host.style.top = `${top}px`;
        host.style.height = `${height}px`;
        enoughSpace = height >= config.compactMinHeightPx;
      } else {
        host.style.removeProperty('top');
        host.style.removeProperty('height');
      }
      bounds = host.getBoundingClientRect();
      rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      const visible = heroBounds.bottom > 0 && heroBounds.top < window.innerHeight;
      if (visible && enoughSpace) {
        const limit = compact ? config.compactLimit : config.desktopLimit;
        [...active.keys()].slice(limit).forEach(remove);
        const placed: Meteor[] = [];
        for (const meteor of active.values()) {
          if (place(meteor, placed)) placed.push(meteor);
          else remove(meteor.id);
        }
        if (active.size) publish();
      }
      const disabled = forcedStatic || reduced.matches || galaxy?.dataset.renderMode === 'static' || !pool.length;
      const shouldPlay = !disabled && visible && enoughSpace && !document.hidden;
      if (playing !== shouldPlay) {
        playing = shouldPlay;
        if (playing) {
          for (const job of jobs.values()) arm(job);
        } else {
          const now = performance.now();
          for (const job of jobs.values()) {
            if (job.timer !== undefined) {
              window.clearTimeout(job.timer);
              job.remaining = Math.max(0, job.deadline - now);
              job.timer = undefined;
            }
          }
        }
        reportJobs();
      }
      if (disabled) [...active.keys()].forEach(remove);
      setStatus(disabled ? 'disabled' : shouldPlay ? 'running' : 'paused');
    };

    runtimeRef.current = {
      failIcon: meteor => {
        failedIcons.add(meteor.model.iconSrc);
        deck = deck.filter(model => model.iconSrc !== meteor.model.iconSrc);
        host.dataset.iconError = meteor.model.iconSrc;
        remove(meteor.id);
      },
    };
    schedule(config.startupDelayMs, () => {
      spawn();
      if (!compact) schedule(config.secondMeteorDelayMs, spawn);
      next();
    });
    // Measuring the compact layer also changes its height. Defer that write
    // out of ResizeObserver delivery to avoid a resize notification loop.
    const scheduleMeasure = () => {
      if (disposed || measureFrame) return;
      measureFrame = requestAnimationFrame(() => {
        measureFrame = 0;
        measure();
      });
    };
    const resize = new ResizeObserver(scheduleMeasure);
    resize.observe(host);
    resize.observe(hero);
    if (copy) resize.observe(copy);
    if (nav) resize.observe(nav);
    const sceneMode = new MutationObserver(measure);
    if (galaxy) sceneMode.observe(galaxy, { attributes: true, attributeFilter: ['data-render-mode'] });
    window.addEventListener('resize', scheduleMeasure);
    window.addEventListener('scroll', scheduleMeasure, { passive: true });
    document.addEventListener('visibilitychange', measure);
    document.fonts.addEventListener('loadingdone', measure);
    reduced.addEventListener('change', measure);
    measure();
    return () => {
      disposed = true;
      playing = false;
      cancelAnimationFrame(measureFrame);
      for (const job of jobs.values()) if (job.timer !== undefined) window.clearTimeout(job.timer);
      jobs.clear();
      active.clear();
      reportJobs();
      host.dataset.state = 'disposed';
      runtimeRef.current = null;
      resize.disconnect();
      sceneMode.disconnect();
      window.removeEventListener('resize', scheduleMeasure);
      window.removeEventListener('scroll', scheduleMeasure);
      document.removeEventListener('visibilitychange', measure);
      document.fonts.removeEventListener('loadingdone', measure);
      reduced.removeEventListener('change', measure);
    };
  }, [enabled, models, config]);

  return <div ref={hostRef} className="landing-model-meteors" aria-hidden="true" data-state={enabled ? status : 'waiting'} data-model-count={models.length} data-active-count={enabled ? meteors.length : 0}>
    {enabled && meteors.map(meteor => <div key={meteor.id} className="landing-meteor" data-model-id={meteor.model.id} data-model-name={meteor.model.name} data-duration={meteor.duration} style={{
      left: meteor.left, top: meteor.top,
      '--meteor-angle': `${meteor.angle}deg`, '--meteor-duration': `${meteor.duration}ms`,
      '--meteor-scale': meteor.scale, '--meteor-brightness': meteor.brightness,
      '--meteor-tail': `${meteor.tail}rem`, '--meteor-travel': `${meteor.travel}px`,
    } as Variables}>
      <div className="landing-meteor-fly"><span className="landing-meteor-run">
        <span className="landing-meteor-glow" /><span className="landing-meteor-trail" /><span className="landing-meteor-dot" />
        <span className="landing-meteor-burst">
          <span className="landing-meteor-flash" /><span className="landing-meteor-flare landing-meteor-flare-a" /><span className="landing-meteor-flare landing-meteor-flare-b" />
          <span className="landing-meteor-ring landing-meteor-ring-a" /><span className="landing-meteor-ring landing-meteor-ring-b" />
          {Array.from({ length: 14 }, (_, index) => <span key={index} className="landing-meteor-spark" style={{ '--meteor-spark-index': index + 1 } as Variables} />)}
        </span>
      </span></div>
      <span className="landing-meteor-upright"><span className="landing-meteor-label">
        {meteor.characters.map((character, index) => {
          const style = { '--meteor-character-offset': `${character.offset}em`, '--meteor-character-distance': character.distance } as Variables;
          return character.icon ? <img key={index} className="landing-meteor-zi landing-meteor-tu" style={style} src={meteor.model.iconSrc} alt="" width={16} height={16} draggable={false} onError={() => runtimeRef.current?.failIcon(meteor)} /> :
            <span key={index} className="landing-meteor-zi" style={style}>{character.text}</span>;
        })}
        <span className="landing-meteor-line" />
      </span></span>
    </div>)}
  </div>;
}
