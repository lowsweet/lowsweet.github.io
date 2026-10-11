import type { ModelDefinition } from './mock/types';

export type ModelBrandIdentity = Pick<ModelDefinition, 'name' | 'vendor'>;

export interface ModelBrandAsset {
  id: string;
  src: string;
  darkSrc?: string;
  monochrome?: boolean;
}

// Provenance and checksums: docs/research/model-brand-icons/sources.json.
// These files are official graphics; no runtime third-party requests are made.
const assets: Record<string, ModelBrandAsset> = {
  openai: { id: 'openai', src: '/model-brand-icons/openai.svg', monochrome: true },
  claude: { id: 'claude', src: '/model-brand-icons/claude.svg' },
  gemini: { id: 'gemini', src: '/model-brand-icons/gemini.png' },
  deepseek: { id: 'deepseek', src: '/model-brand-icons/deepseek.svg' },
  qwen: { id: 'qwen', src: '/model-brand-icons/qwen.svg' },
  grok: { id: 'grok', src: '/model-brand-icons/grok.svg' },
  glm: { id: 'glm', src: '/model-brand-icons/glm.svg' },
  meta: { id: 'meta', src: '/model-brand-icons/meta.svg' },
  bfl: { id: 'bfl', src: '/model-brand-icons/bfl-black.svg', darkSrc: '/model-brand-icons/bfl-white.svg' },
  midjourney: { id: 'midjourney', src: '/model-brand-icons/midjourney.svg', monochrome: true },
  google: { id: 'google', src: '/model-brand-icons/google.png' },
  wan: { id: 'wan', src: '/model-brand-icons/wan.png' },
  recraft: { id: 'recraft', src: '/model-brand-icons/recraft.svg', monochrome: true },
  kling: { id: 'kling', src: '/model-brand-icons/kling.png' },
  runway: { id: 'runway', src: '/model-brand-icons/runway-black.svg', darkSrc: '/model-brand-icons/runway-white.svg' },
  hailuo: { id: 'hailuo', src: '/model-brand-icons/hailuo.png' },
  suno: { id: 'suno', src: '/model-brand-icons/suno.png' },
  elevenlabs: { id: 'elevenlabs', src: '/model-brand-icons/elevenlabs.svg' },
  'alibaba-cloud': { id: 'alibaba-cloud', src: '/model-brand-icons/alibaba-cloud.svg' },
};

const products: readonly [RegExp, string][] = [
  [/^GPT(?:\b|-)|^Whisper\b/i, 'openai'],
  [/^Claude\b/i, 'claude'],
  [/^Gemini\b/i, 'gemini'],
  [/^DeepSeek\b/i, 'deepseek'],
  [/^Qwen/i, 'qwen'],
  [/^Grok\b/i, 'grok'],
  [/^GLM\b/i, 'glm'],
  [/^Llama\b/i, 'meta'],
  [/^Flux\b/i, 'bfl'],
  [/^Midjourney\b/i, 'midjourney'],
  [/^Imagen\b|^Veo\b/i, 'google'],
  [/^万相|^Wan\b/i, 'wan'],
  [/^Recraft\b/i, 'recraft'],
  [/^Sora\b/i, 'openai'],
  [/^可灵|^Kling\b/i, 'kling'],
  [/^Runway\b/i, 'runway'],
  [/^海螺|^Hailuo\b/i, 'hailuo'],
  [/^Suno\b/i, 'suno'],
  [/^ElevenLabs\b/i, 'elevenlabs'],
  [/^CosyVoice\b/i, 'alibaba-cloud'],
];

const vendors: Record<string, string> = {
  OpenAI: 'openai', Anthropic: 'claude', Google: 'google', DeepSeek: 'deepseek',
  Alibaba: 'alibaba-cloud', xAI: 'grok', Zhipu: 'glm', Meta: 'meta',
  'Black Forest Labs': 'bfl', Midjourney: 'midjourney', Recraft: 'recraft',
  Runway: 'runway', Suno: 'suno', ElevenLabs: 'elevenlabs',
};

export function resolveModelBrand(model: ModelBrandIdentity): ModelBrandAsset | undefined {
  const product = products.find(([pattern]) => pattern.test(model.name.trim()));
  return assets[product?.[1] ?? vendors[model.vendor]];
}
