import models from './landing-models.json';

export interface ModelMeteorDefinition {
  id: number;
  name: string;
  iconSrc: string;
}

export interface ModelMeteorConfig {
  enabled: boolean;
  startupDelayMs: number;
  secondMeteorDelayMs: number;
  spawnIntervalMs: readonly [number, number];
  durationMs: readonly [number, number];
  compactMaxWidth: number;
  desktopLimit: number;
  compactLimit: number;
  insetPx: number;
  compactMinHeightPx: number;
}

/** Frozen display data is independent of the workbench model catalogue. */
export const MODEL_METEOR_MODELS: readonly ModelMeteorDefinition[] = models;

export const MODEL_METEOR_CONFIG: ModelMeteorConfig = {
  enabled: true,
  startupDelayMs: 300,
  secondMeteorDelayMs: 600,
  spawnIntervalMs: [1600, 2800],
  durationMs: [4600, 5400],
  compactMaxWidth: 1024,
  desktopLimit: 4,
  compactLimit: 1,
  insetPx: 24,
  compactMinHeightPx: 88,
};
