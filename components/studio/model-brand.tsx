'use client';
import type { CSSProperties } from 'react';
import { useTheme } from 'antd-style';
import { resolveModelBrand, type ModelBrandIdentity } from '@/lib/model-brand-assets';

export function ModelBrand({ model, size = 32 }: { model: ModelBrandIdentity; size?: number }) {
  const { isDarkMode } = useTheme();
  const asset = resolveModelBrand(model);
  const src = asset && (isDarkMode ? asset.darkSrc ?? asset.src : asset.src);
  const style = {
    width: size, height: size,
    '--model-brand-ink': isDarkMode ? '#fff' : '#000',
  } as CSSProperties;

  return <span className="ws-model-brand" style={style} data-model-brand={asset?.id}
    data-model-name={model.name} aria-hidden="true">
    {asset && src ? asset.monochrome
      ? <span className="ws-model-brand-mask" style={{ '--model-brand-image': `url("${src}")` } as CSSProperties} />
      : <img src={src} alt="" width={size} height={size} decoding="async" draggable={false} />
      : <span>{model.vendor.slice(0, 2)}</span>}
  </span>;
}
