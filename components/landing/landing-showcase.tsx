'use client';

import { useEffect, useRef, useState } from 'react';
import { Eye, Heart } from 'lucide-react';
import { Button, Card } from '@/components/beautiful-ui/primitives';
import type { LandingLocale, LandingMessages } from '@/lib/landing-i18n';
import { LANDING_SHOWCASE, SHOWCASE_BATCH_SIZE, showcaseColumnCount, type LandingShowcaseItem } from '@/lib/landing-showcase';
import './landing-showcase.css';

export function LandingShowcase({ locale, copy, onOpenWork }: {
  locale: LandingLocale;
  copy: LandingMessages['gallery'];
  onOpenWork: (item: LandingShowcaseItem) => void;
}) {
  const gridRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState({ columnCount: 2, width: 0, gap: 0 });
  const [limit, setLimit] = useState(SHOWCASE_BATCH_SIZE);
  const { columnCount, width, gap } = layout;

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const measure = () => {
      const next = { columnCount: showcaseColumnCount(window.innerWidth), width: grid.getBoundingClientRect().width,
        gap: parseFloat(getComputedStyle(grid).columnGap) || 0 };
      setLayout(current => current.columnCount === next.columnCount && current.width === next.width && current.gap === next.gap ? current : next);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(grid);
    measure();
    window.addEventListener('resize', measure, { passive: true });
    return () => { observer.disconnect(); window.removeEventListener('resize', measure); };
  }, []);

  const columns: { item: LandingShowcaseItem; index: number }[][] = Array.from({ length: columnCount }, () => []);
  const heights = Array<number>(columnCount).fill(0);
  const cardWidth = Math.max(1, (width - gap * (columnCount - 1)) / columnCount - 2);
  LANDING_SHOWCASE.slice(0, limit).forEach((item, index) => {
    // Keep source order while placing each next work in the shortest column.
    // Its intrinsic dimensions reserve the correct space before lazy loading.
    const column = width ? heights.indexOf(Math.min(...heights)) : index % columnCount;
    columns[column].push({ item, index });
    heights[column] += cardWidth * item.height / item.width + 2 + gap;
  });

  return <section id="inspiration" className="landing-section landing-inspiration landing-showcase-section"
    data-galaxy-section="inspiration" data-showcase-count={Math.min(limit, LANDING_SHOWCASE.length)} data-showcase-columns={columnCount}>
    <div className="landing-showcase-veil" aria-hidden="true" />
    <div className="landing-showcase-inner">
      <div className="landing-showcase-heading"><h2>{copy.title}</h2><p>{copy.description}</p></div>
      <div ref={gridRef} id="landing-gallery" className="landing-showcase-grid" role="group" aria-label={copy.collection}>
        {columns.map((column, col) => <div className="landing-showcase-column" key={col}>
          {column.map(({ item, index }) => <Card asChild key={item.id}>
            <button type="button" className="landing-showcase-card" data-work-id={item.id} data-source-index={index}
              onClick={() => onOpenWork(item)} aria-label={copy.viewWork(item.title[locale])}>
              <img src={item.src} alt={item.title[locale]} width={item.width} height={item.height}
                loading={index < 5 ? 'eager' : 'lazy'} decoding="async" />
              <span className="landing-showcase-glow" aria-hidden="true" />
              <span className="landing-showcase-meta">
                <span className="landing-showcase-title">{item.title[locale]}</span>
                <span className="landing-showcase-stats">
                  <span aria-label={copy.views(item.views)}><Eye size={13} strokeWidth={2} aria-hidden="true" />{item.views.toLocaleString(locale)}</span>
                  <span aria-label={copy.uses(item.uses)}><Heart size={13} strokeWidth={2} aria-hidden="true" />{item.uses.toLocaleString(locale)}</span>
                </span>
              </span>
            </button>
          </Card>)}
        </div>)}
      </div>
      {limit < LANDING_SHOWCASE.length && <div className="landing-showcase-more">
        <Button onClick={() => setLimit(current => Math.min(current + SHOWCASE_BATCH_SIZE, LANDING_SHOWCASE.length))}>{copy.more}</Button>
      </div>}
    </div>
  </section>;
}
