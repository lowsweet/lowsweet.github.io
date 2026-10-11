export interface GalaxySceneConfig {
  source: string;
  seed: number;
  tilt: number;
  diagonal: number;
  farDistance: number;
  fieldOfView: number;
  twinkleStrength: number;
}

export const GALAXY_SCENE_CONFIG: GalaxySceneConfig = {
  source: '/stars-clone/index.html',
  seed: 888,
  tilt: -0.35,
  diagonal: Math.PI / 4,
  farDistance: 80000,
  fieldOfView: 40,
  twinkleStrength: 1,
};

export interface GalaxyCoreHaloConfig {
  enabled: boolean;
  breathPeriodMs: number;
  radiusAmplitude: number;
  brightnessAmplitude: number;
  flowPeriodMs: number;
  uvWarp: number;
  seed: number;
  warmGlowEnabled: boolean;
  warmGlowRadiusAmplitude: number;
  warmGlowBrightnessAmplitude: number;
}

/** The white nucleus stays fixed; only its outer texture receives the motion. */
export const GALAXY_CORE_HALO_CONFIG: GalaxyCoreHaloConfig = {
  enabled: true,
  breathPeriodMs: 7000,
  radiusAmplitude: .03,
  brightnessAmplitude: .04,
  flowPeriodMs: 24000,
  uvWarp: .012,
  seed: 888,
  warmGlowEnabled: true,
  warmGlowRadiusAmplitude: .06,
  warmGlowBrightnessAmplitude: .14,
};

export interface GalaxyEntranceConfig {
  start: { z: number; rx: number; ry: number; cameraScaleZ: number };
  end: { z: number; rx: number; ry: number };
  spinMs: number;
  wheelReplayMs: number;
}

/** Original reference pose; the background layer presents it with reversed horizontal composition. */
export const GALAXY_ENTRANCE_CONFIG: GalaxyEntranceConfig = {
  start: { z: 2000, rx: Math.PI * .05, ry: 5.20 - .225, cameraScaleZ: .83 },
  end: { z: 50000, rx: Math.PI * .05, ry: 5.20 },
  spinMs: 2500,
  wheelReplayMs: 1000,
};

export const GALAXY_KEYFRAMES = [
  { id: 'opening', distance: 1 },
  { id: 'doorway', distance: .74 },
  { id: 'capabilities', distance: .60 },
  { id: 'inspiration', distance: .35 },
  { id: 'signup', distance: .18 },
] as const;

/** Absolute section positions keep gallery changes independent of the camera path. */
export function getGalaxyDistance(scrollY: number, anchors: readonly number[]): number {
  if (!anchors.length || scrollY <= anchors[0]) return 1;
  // Browser zoom can round scrollHeight and innerHeight in opposite directions.
  if (anchors.length >= GALAXY_KEYFRAMES.length && scrollY >= anchors[GALAXY_KEYFRAMES.length - 1] - 2) return .18;
  for (let index = 1; index < GALAXY_KEYFRAMES.length; index++) {
    const end = anchors[index] ?? anchors[anchors.length - 1];
    const start = anchors[index - 1] ?? 0;
    if (scrollY <= end) {
      const fraction = Math.min(1, Math.max(0, (scrollY - start) / Math.max(1, end - start)));
      return GALAXY_KEYFRAMES[index - 1].distance +
        (GALAXY_KEYFRAMES[index].distance - GALAXY_KEYFRAMES[index - 1].distance) * fraction;
    }
  }
  return .18;
}
