import data from './landing-showcase-data.json';
import type { LandingLocale } from './landing-i18n';
import type { Asset } from './mock/types';

export interface LandingShowcaseItem {
  id: string;
  src: string;
  width: number;
  height: number;
  mime: string;
  size: number;
  title: Record<LandingLocale, string>;
  /** Only populated when a real public prompt and its translation are available. */
  prompt?: Record<LandingLocale, string>;
  views: number;
  uses: number;
}

export const LANDING_SHOWCASE: readonly LandingShowcaseItem[] = data;
export const SHOWCASE_BATCH_SIZE = 20;

export function showcaseColumnCount(width: number): number {
  return width >= 1400 ? 5 : width >= 1080 ? 4 : width >= 720 ? 3 : 2;
}

/** Presentation/favorite adapter; the workspace's original gallery is separate. */
export function showcaseToAsset(item: LandingShowcaseItem, locale: LandingLocale): Asset {
  return {
    id: item.id, name: item.title[locale], kind: 'image', url: item.src,
    mime: item.mime, size: item.size, prompt: item.prompt?.[locale] ?? '',
    tags: [], favorite: false, published: false, createdAt: 0, views: item.views,
  };
}
