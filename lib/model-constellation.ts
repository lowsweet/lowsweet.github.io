/** Presentation-only: independent from the model/workbench service. */
export const MODEL_STAR_CONFIG = {
  seed: 888,
  periodMs: [3500, 6500] as const,
  dwellMs: [8000, 12000] as const,
  fadeMs: 100,
};

export function starRandom(seed: number) {
  let value = seed >>> 0;
  return () => {
    value += 0x6D2B79F5;
    let mixed = Math.imul(value ^ value >>> 15, value | 1);
    mixed ^= mixed + Math.imul(mixed ^ mixed >>> 7, mixed | 61);
    return ((mixed ^ mixed >>> 14) >>> 0) / 4294967296;
  };
}

export class ModelStarDeck {
  private remaining: number[] = [];
  private ids: readonly number[];
  private random: () => number;
  constructor(ids: readonly number[], random: () => number) {
    this.ids = ids;
    this.random = random;
  }
  take(visible: ReadonlySet<number>): number | null {
    if (!this.remaining.length) {
      this.remaining = [...this.ids];
      for (let i = this.remaining.length - 1; i > 0; i--) {
        const j = Math.floor(this.random() * (i + 1));
        [this.remaining[i], this.remaining[j]] = [this.remaining[j], this.remaining[i]];
      }
    }
    const index = this.remaining.findIndex(id => !visible.has(id));
    return index < 0 ? null : this.remaining.splice(index, 1)[0];
  }
}

export interface ModelStarPose {
  slot: number;
  left: number;
  top: number;
  width: number;
  periodMs: number;
  offsetMs: number;
  size: number;
  peak: number;
}

export interface ModelStarExclusion { left: number; top: number; right: number; bottom: number; }

export function starPoses(width: number, height: number, viewportWidth: number, exclusions: readonly ModelStarExclusion[] = []): ModelStarPose[] {
  const count = viewportWidth <= 700 ? 4 : viewportWidth <= 1024 ? 6 : 8;
  const mobile = viewportWidth <= 700;
  const contained = viewportWidth <= 900;
  const captionWidth = Math.min(mobile ? 154 : 240, width * (mobile ? .44 : .28));
  if (captionWidth < 135 || height < 180) return [];
  const radiusX = width * (mobile ? .25 : contained ? .35 : .29);
  const upperGuard = Math.max(10, ...exclusions.filter(rect => rect.top <= 0 && rect.right - rect.left >= width * .9).map(rect => rect.bottom + 52));
  const radiusY = Math.max(60, Math.min(height * (contained ? .35 : .34), contained ? 126 : 360, height / 2 - upperGuard));
  // Slots form an oval around the central cluster, rather than a right-hand grid.
  // Try extra positions when the left-side copy occupies part of that oval.
  const angles = count === 4 ? [-90, 0, 90, 180]
    : count === 6 ? contained ? [-135, -45, 0, 45, 135, 180] : [-140, -90, -40, 40, 90, 140, 0, 180]
    : [-90, -45, 0, 45, 90, 135, 180, 225, -65, 65, 115, -115];
  const poses: ModelStarPose[] = [];
  for (const [slot, angle] of angles.entries()) {
    const random = starRandom(MODEL_STAR_CONFIG.seed + slot * 73);
    const radians = angle * Math.PI / 180;
    const left = Math.max(captionWidth / 2 + 10, Math.min(width - captionWidth / 2 - 10,
      width * .5 + Math.cos(radians) * radiusX + (random() - .5) * 14));
    const top = height * .5 + Math.sin(radians) * radiusY + (random() - .5) * 10;
    const bounds = { left: left - captionWidth / 2, right: left + captionWidth / 2, top: top - 28, bottom: top + 28 };
    const intersects = (other: ModelStarExclusion, gap = 24) => bounds.left < other.right + gap && bounds.right > other.left - gap && bounds.top < other.bottom + gap && bounds.bottom > other.top - gap;
    if (bounds.left < 10 || bounds.right > width - 10 || bounds.top < 10 || bounds.bottom > height - 10 || exclusions.some(other => intersects(other))
      || poses.some(pose => intersects({ left: pose.left - pose.width / 2, right: pose.left + pose.width / 2, top: pose.top - 28, bottom: pose.top + 28 }, contained ? 16 : 24))) continue;
    poses.push({
      slot, left, top, width: captionWidth,
      periodMs: 3500 + random() * 3000,
      offsetMs: random() * 6500,
      size: 2.5 + random() * 3,
      peak: .72 + random() * .28,
    });
    if (poses.length === count) break;
  }
  return poses;
}

/** Pick a quiet phase within 8–12s, rather than dimming a bright star abruptly. */
export function nextStarSwap(now: number, pose: ModelStarPose, random: () => number) {
  const min = now + MODEL_STAR_CONFIG.dwellMs[0];
  const max = now + MODEL_STAR_CONFIG.dwellMs[1];
  const periods: [number, number][] = [];
  const first = Math.floor((min + pose.offsetMs) / pose.periodMs);
  for (let cycle = first; cycle <= first + 3; cycle++) {
    const center = cycle * pose.periodMs - pose.offsetMs;
    const start = Math.max(min, center - pose.periodMs * .2);
    const end = Math.min(max, center + pose.periodMs * .2);
    if (end > start) periods.push([start, end]);
  }
  const length = periods.reduce((sum, [start, end]) => sum + end - start, 0);
  let target = random() * length;
  for (const [start, end] of periods) {
    if (target <= end - start) return start + target;
    target -= end - start;
  }
  return max;
}
