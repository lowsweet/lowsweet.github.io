'use client';

import Link from 'next/link';
import { Button } from '@/components/beautiful-ui/primitives';
import { ThermalClaimFill } from './thermal-claim-fill';

export function LandingStartButton({ label }: { label: string }) {
  return <Button variant="primary" size="md" className="landing-start-thermal" asChild>
    <Link href="/app"><ThermalClaimFill /><span className="landing-start-label">{label}</span></Link>
  </Button>;
}
