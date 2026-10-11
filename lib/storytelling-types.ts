import type { Preferences } from './mock/types';

export type StorytellingLocale = Preferences['language'];
export type CrystalCapabilityId = 'chat' | 'image' | 'video' | 'audio';
export type StorytellingDialogKind = 'business' | 'support' | 'feedback' | 'about' | 'privacy' | 'terms';
export type StorytellingAction = 'api' | StorytellingDialogKind;

export interface CrystalCapabilityDefinition {
  id: CrystalCapabilityId;
  modelIndex: 0 | 1 | 2 | 3;
  title: Record<StorytellingLocale, string>;
  copy: Record<StorytellingLocale, string>;
  usecases: Record<StorytellingLocale, readonly string[]>;
}

export const CRYSTAL_CAPABILITIES: readonly CrystalCapabilityDefinition[] = [
  {
    id: 'chat', modelIndex: 0,
    title: { 'zh-CN': '智能对话', en: 'AI chat' },
    copy: {
      'zh-CN': '从一个问题开始，把想法推敲清楚。自由切换主流模型，让写作、推理与代码创作自然衔接。',
      en: 'Start with a question and shape your idea. Switch between leading models for writing, reasoning, and code.',
    },
    usecases: { 'zh-CN': ['构思与写作', '分析与推理', '代码与翻译'], en: ['Ideas and writing', 'Analysis and reasoning', 'Code and translation'] },
  },
  {
    id: 'image', modelIndex: 1,
    title: { 'zh-CN': '图像创作', en: 'Image creation' },
    copy: {
      'zh-CN': '让脑海中的画面变得可见。从文字生成图像，以参考图延展风格，反复打磨你想表达的细节。',
      en: 'Make the picture in your mind visible. Create from words, explore a style with references, and refine every detail.',
    },
    usecases: { 'zh-CN': ['文字生成图像', '参考图创作', '风格探索与编辑'], en: ['Text to image', 'Reference-led creation', 'Style exploration and editing'] },
  },
  {
    id: 'video', modelIndex: 2,
    title: { 'zh-CN': '视频生成', en: 'Video generation' },
    copy: {
      'zh-CN': '为静止的想象赋予时间。将文字或图像变成镜头，尝试不同的运动与节奏，串起你的故事。',
      en: 'Give your imagination a sense of time. Turn words or images into moving scenes and find the rhythm of your story.',
    },
    usecases: { 'zh-CN': ['文字生成视频', '图像生成视频', '分镜与短片创作'], en: ['Text to video', 'Image to video', 'Storyboards and short films'] },
  },
  {
    id: 'audio', modelIndex: 3,
    title: { 'zh-CN': '语音合成', en: 'Voice synthesis' },
    copy: {
      'zh-CN': '让作品拥有自己的声音。选择语言与音色，将文字转为自然的旁白、对白与配音。',
      en: 'Give your work a voice of its own. Choose a language and voice to turn words into natural narration and dialogue.',
    },
    usecases: { 'zh-CN': ['多语言旁白', '角色对白', '内容与视频配音'], en: ['Multilingual narration', 'Character dialogue', 'Voiceovers for content and video'] },
  },
];

export const STORYTELLING_COPY = {
  'zh-CN': {
    title: 'LinkeAI · 链接想象与现实', description: '让想象成为文字、画面、影像与声音。LinkeAI，一站式 AI 创作工作台。',
    hero: '链接想象与现实\n让创意成为作品', departure: '灵感，从一个念头开始。',
    phoenix: '一句话，可以成为文字、画面、影像与声音。', sensory: ['看见。', '感受。', '听见。'],
    principles: ['从想法开始', '自由切换模型', '让创作衔接', '保留每一次尝试'],
    crystals: '四种能力，让想象成形。', final: '让下一次灵感，成为你的作品',
    start: '开始使用', explore: '开始探索', retry: '重新探索', loading: '正在展开你的天空',
    nav: '首页导航', api: 'API 开放平台', business: '商务合作', support: '联系客服', galaxy: '银河版',
    footer: '从想象，到作品。', languageError: '语言设置保存失败，请重试。',
  },
  en: {
    title: 'LinkeAI · Connect imagination to the sky', description: 'Turn ideas into words, images, motion, and sound. Your AI creative workspace.',
    hero: 'Connect your imagination to the sky.', departure: 'Every idea begins with a spark.',
    phoenix: 'One idea. Words, images, motion, and sound.', sensory: ['See.', 'Feel.', 'Hear.'],
    principles: ['Start with an idea', 'Choose your model', 'Connect your workflow', 'Keep every iteration'],
    crystals: 'Four ways to bring ideas to life.', final: 'Make your next idea real.',
    start: 'Get started', explore: 'Start exploring', retry: 'Explore again', loading: 'Your sky is unfolding',
    nav: 'Main navigation', api: 'API Platform', business: 'Partnerships', support: 'Contact', galaxy: 'Galaxy edition',
    footer: 'From imagination to creation.', languageError: 'We couldn’t save your language preference. Please try again.',
  },
} satisfies Record<StorytellingLocale, {
  title: string; description: string; hero: string; departure: string; phoenix: string;
  sensory: readonly string[]; principles: readonly string[]; crystals: string; final: string;
  start: string; explore: string; retry: string; loading: string; nav: string;
  api: string; business: string; support: string; galaxy: string; footer: string; languageError: string;
}>;
