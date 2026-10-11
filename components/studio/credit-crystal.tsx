'use client';

import { useId } from 'react';
import styles from './credit-crystal.module.css';

export function CreditCrystal({ appearance, size = 24 }: { appearance: 'light' | 'dark'; size?: number }) {
  const id = `credit-crystal-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;

  return <span className={styles.icon} style={{ width: size, height: size }} data-appearance={appearance} aria-hidden="true">
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" focusable="false">
      <defs>
        <linearGradient id={`${id}-body`} x1="5" y1="3" x2="18" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--crystal-light)" />
          <stop offset=".46" stopColor="var(--crystal-mid)" />
          <stop offset="1" stopColor="var(--crystal-shade)" />
        </linearGradient>
        <linearGradient id={`${id}-face`} x1="9.4" y1="7.4" x2="14.6" y2="17.5" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--crystal-shine)" />
          <stop offset=".55" stopColor="var(--crystal-light)" />
          <stop offset="1" stopColor="var(--crystal-mid)" />
        </linearGradient>
        <linearGradient id={`${id}-gold`} x1="6" y1="20" x2="20" y2="12" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--crystal-gold)" />
          <stop offset="1" stopColor="var(--crystal-light)" stopOpacity=".15" />
        </linearGradient>
      </defs>
      <path d="M11.5 1.8 18.9 5.1 21.4 12.9 15.1 21.9 5.7 19.7 2.6 10.2 6.3 4.4Z"
        fill={`url(#${id}-body)`} stroke="var(--crystal-edge)" strokeWidth=".65" strokeLinejoin="round" />
      <path d="m11.5 1.8 7.4 3.3-4.1 5.1-5.4-2.8Z" fill="var(--crystal-light)" fillOpacity=".72" />
      <path d="m18.9 5.1 2.5 7.8-6.6-2.7Z" fill="var(--crystal-shade)" fillOpacity=".68" />
      <path d="m21.4 12.9-6.3 9-4.6-4.6 4.3-7.1Z" fill="var(--crystal-mid)" fillOpacity=".5" />
      <path d="m15.1 21.9-9.4-2.2 4.8-2.4Z" fill={`url(#${id}-gold)`} fillOpacity=".82" />
      <path d="m5.7 19.7-3.1-9.5 6.8-2.8 1.1 9.9Z" fill="var(--crystal-shade)" fillOpacity=".48" />
      <path d="m2.6 10.2 3.7-5.8 5.2-2.6-2.1 5.6Z" fill="var(--crystal-shine)" fillOpacity=".64" />
      <path d="m9.4 7.4 5.4 2.8-4.3 7.1Z" fill={`url(#${id}-face)`} />
      <path d="m6.3 4.4 5.2-2.6 7.4 3.3M2.6 10.2l6.8-2.8 5.4 2.8 6.6 2.7M9.4 7.4l1.1 9.9 4.6 4.6"
        stroke="var(--crystal-shine)" strokeOpacity=".62" strokeWidth=".6" strokeLinejoin="round" />
      <path d="m5.7 19.7 4.8-2.4 4.6 4.6" stroke="var(--crystal-gold)" strokeWidth=".6" strokeOpacity=".8" />
      <path d="m6.7 4.6 4-2M10 7.8l3.6 1.9" stroke="var(--crystal-shine)" strokeWidth=".85" strokeLinecap="round" />
    </svg>
  </span>;
}
