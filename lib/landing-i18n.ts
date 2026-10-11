import type { Preferences } from './mock/types';
import { MODEL_METEOR_MODELS, type ModelMeteorDefinition } from './model-meteor-config';

export type LandingLocale = Preferences['language'];
export type LandingModalKind = 'support' | 'business' | 'register' | 'feedback' | 'about' | 'privacy' | 'terms';
export type LandingError = 'save' | 'language' | 'favorite' | 'name' | 'email' | 'message';

export const LANDING_LANGUAGES: readonly { locale: LandingLocale; label: string }[] = [
  { locale: 'zh-CN', label: '中文' },
  { locale: 'en', label: 'English' },
];

const zh = {
  metadata: { title: 'LinkeAI · 星河中的 AI 工作台', description: '一站式 AI 工作台，聚合主流模型、智能体与创作工具。' },
  nav: { home: 'LinkeAI 首页', navigation: '首页导航', api: 'API 开放平台', business: '商务合作', support: '联系客服', current: '当前' },
  hero: { first: '把所有 AI 的能力', second: '聚成同一片星河', description: '在一个工作台中使用主流 AI 模型和创作智能体，完成对话、写作、图像、视频与音频创作。', start: '开始使用' },
  doorway: { title: '主流模型，一个入口', description: '自由切换模型，完成对话、图像、视频与音频创作。账号、积分和历史记录统一管理。', modelsLabel: '展示模型' },
  capabilities: {
    title: '四大核心能力', description: '从一句念头到一部成片，全程不必离开这片星空。',
    items: [
      { kind: 'chat', title: '智能对话', label: 'CHAT', copy: '主流大模型自由切换，多轮推理、代码、写作、翻译一站搞定。' },
      { kind: 'image', title: '图像创作', label: 'IMAGE', copy: '多款主流绘画模型任选，输入文字即刻出图，写实、插画、3D 风格随心切换。' },
      { kind: 'video', title: '视频生成', label: 'VIDEO', copy: '多款主流视频模型任选，文字或图片一键生成电影级视频。' },
      { kind: 'audio', title: '语音合成', label: 'AUDIO', copy: '多语言、多音色智能配音，从旁白到对白，让你的内容拥有专业级声音。' },
    ],
  },
  gallery: {
    collection: '创作案例', title: '看看大家都在用 AI 创作什么', description: '这些都出自与你一样的创作者之手。点开任意一张，就能照着做一份自己的。',
    viewWork: (name: string) => `查看作品：${name}`, more: '加载更多灵感', prompt: '创作提示词',
    views: (count: number) => `${count.toLocaleString('zh-CN')} 次浏览`, uses: (count: number) => `${count.toLocaleString('zh-CN')} 次使用`, favorite: '收藏灵感', favorited: '已收藏', create: '照着做一份',
  },
  signup: { title: '点亮属于你的第一颗星', description: '注册即可启程。对话、图像、视频与智能体，从此都在手边。', register: '立即注册', support: '客服', offer: '注册领新人免费大礼包，AI 绘画 / 视频 / 对话免费开用。' },
  footer: { description: '企业级 AI 接口服务平台', email: '邮箱：liaowei@ai6800.com', feedback: '举报与反馈', about: '关于我们', privacy: '隐私政策', terms: '用户协议', payments: '支付方式示例' },
  modals: {
    support: { title: '联系 LinkeAI 客服', description: '告诉我们你遇到的问题或想咨询的内容。' },
    business: { title: '商务合作', description: '介绍你的团队、应用场景与合作需求。' },
    register: { title: '开启你的星河之旅', description: '创建账户，开启你的第一份创作。' },
    feedback: { title: '举报与反馈', description: '告诉我们你遇到的问题或改进建议。' },
    about: { title: '关于 LinkeAI', description: '一站式 AI 创作平台。' },
    privacy: { title: '隐私政策', description: '了解资料的保存与管理。' },
    terms: { title: '用户协议', description: '了解账户与创作的使用方式。' },
  } satisfies Record<LandingModalKind, { title: string; description: string }>,
  about: ['LinkeAI 把对话、图像、视频、语音和智能体聚到同一扇门后，让每一种创作方式都能自然衔接。', '45 个智能体与 24 款模型，让方案确认、创作、素材管理和文件下载自然衔接。'],
  privacy: ['你的资料、项目和导入文件保存在当前浏览器。你可以在工作台管理项目与素材，或清理浏览器站点数据。', '你的偏好设置用于改善创作体验。删除不再需要的项目与素材，可清理相应资料。'],
  terms: ['你可以在工作台创建、编辑和管理作品。请妥善保存需要保留的内容，并合理使用创作工具。', '你可以预览和下载作品。使用与分享前，请确认内容符合你的用途和要求。'],
  form: {
    close: '关闭', workspace: '进入工作台', understood: '我已了解', accountCreated: '账户已创建', submitted: '提交成功',
    accountSuccess: (points: number) => `当前可用 ${points.toLocaleString('zh-CN')} 积分。现在就开始你的第一份创作。`,
    contactSuccess: '你可以继续浏览，或进入工作台开始创作。', copyEmail: '复制邮箱', copied: '已复制',
    name: '称呼', namePlaceholder: '怎么称呼你', email: '邮箱', feedback: '反馈内容', business: '合作需求', support: '需要什么帮助',
    businessPlaceholder: '描述你的团队、场景或合作想法…', messagePlaceholder: '填写你想咨询的内容…',
    submitting: '提交中…', register: '注册并开始使用', submit: '提交',
  },
  errors: {
    save: '保存失败，请检查浏览器存储是否可用，然后重试。', language: '语言设置保存失败，请重试。', favorite: '收藏保存失败，请重试。',
    name: '请填写你的称呼。', email: '请填写有效的邮箱地址。', message: '请填写你的需求或问题。',
  } satisfies Record<LandingError, string>,
  galaxy: '100,000 Stars 银河背景',
};

export type LandingMessages = typeof zh;

const en: LandingMessages = {
  metadata: { title: 'LinkeAI · Your AI Creative Workspace', description: 'One workspace for leading AI models, agents, and creative tools.' },
  nav: { home: 'LinkeAI home', navigation: 'Main navigation', api: 'API Platform', business: 'Partnerships', support: 'Contact', current: 'Current' },
  hero: { first: 'All the power of AI', second: 'in one galaxy.', description: 'Use leading AI models and creative agents in one workspace for chat, writing, images, video, and audio creation.', start: 'Get started' },
  doorway: { title: 'Leading models. One workspace.', description: 'Switch models for chat, image, video, and audio creation. Manage your account, credits, and history in one place.', modelsLabel: 'Featured models' },
  capabilities: {
    title: 'Four core capabilities', description: 'From your first idea to the final cut, create everything in one workspace.',
    items: [
      { kind: 'chat', title: 'AI chat', label: 'CHAT', copy: 'Switch between leading models for reasoning, coding, writing, and translation, all in one conversation.' },
      { kind: 'image', title: 'Image creation', label: 'IMAGE', copy: 'Turn a prompt into an image. Explore photography, illustration, and 3D styles with your choice of image models.' },
      { kind: 'video', title: 'Video generation', label: 'VIDEO', copy: 'Bring words and images to life with leading video models and cinematic motion.' },
      { kind: 'audio', title: 'Voice synthesis', label: 'AUDIO', copy: 'Give your work a voice with multilingual narration and dialogue in a range of natural voices.' },
    ],
  },
  gallery: {
    collection: 'Creative showcase', title: 'See what people are creating with AI', description: 'These were created by people like you. Open any piece and start something of your own.',
    viewWork: (name: string) => `View creation: ${name}`, more: 'Load more inspiration', prompt: 'Creative prompt',
    views: (count: number) => `${count.toLocaleString('en')} ${count === 1 ? 'view' : 'views'}`, uses: (count: number) => `${count.toLocaleString('en')} ${count === 1 ? 'use' : 'uses'}`, favorite: 'Save inspiration', favorited: 'Saved', create: 'Create your own',
  },
  signup: { title: 'Light your first star', description: 'Sign up to get started. Chat, images, video, and agents are ready for your next idea.', register: 'Sign up', support: 'Support', offer: 'Get a welcome pack and start creating with image, video, and chat tools for free.' },
  footer: { description: 'AI APIs for teams and businesses', email: 'Email: liaowei@ai6800.com', feedback: 'Report & feedback', about: 'About us', privacy: 'Privacy policy', terms: 'Terms of use', payments: 'Supported payment methods' },
  modals: {
    support: { title: 'Contact LinkeAI support', description: 'Tell us what you need help with or what you would like to know.' },
    business: { title: 'Partner with LinkeAI', description: 'Tell us about your team, use case, and partnership ideas.' },
    register: { title: 'Start your journey', description: 'Create an account and bring your first idea to life.' },
    feedback: { title: 'Report & feedback', description: 'Share an issue or a suggestion to help us improve.' },
    about: { title: 'About LinkeAI', description: 'Your all-in-one AI creative platform.' },
    privacy: { title: 'Privacy policy', description: 'How your information is stored and managed.' },
    terms: { title: 'Terms of use', description: 'Using your account and managing your creations.' },
  },
  about: ['LinkeAI brings chat, images, video, voices, and agents into one workspace, so every part of your creative process connects.', '45 agents and 24 models connect planning, creation, asset management, and file downloads.'],
  privacy: ['Your information, projects, and imported files are stored in this browser. Manage projects and assets in the workspace, or clear this site’s browser data.', 'Your preferences help personalize your creative experience. Delete projects and assets you no longer need to remove their data.'],
  terms: ['Create, edit, and manage your work in the workspace. Keep copies of anything you want to retain and use the creative tools responsibly.', 'You can preview and download your work. Before using or sharing it, check that it meets your needs and requirements.'],
  form: {
    close: 'Close', workspace: 'Open workspace', understood: 'Got it', accountCreated: 'Account created', submitted: 'Submitted',
    accountSuccess: (points: number) => `You have ${points.toLocaleString('en')} credits available. Start your first creation now.`,
    contactSuccess: 'Continue exploring, or open the workspace to start creating.', copyEmail: 'Copy email', copied: 'Copied',
    name: 'Name', namePlaceholder: 'What should we call you?', email: 'Email', feedback: 'Your feedback', business: 'Partnership needs', support: 'How can we help?',
    businessPlaceholder: 'Describe your team, use case, or partnership idea…', messagePlaceholder: 'Tell us what you would like to ask…',
    submitting: 'Submitting…', register: 'Sign up and get started', submit: 'Submit',
  },
  errors: {
    save: 'We couldn’t save this. Check that your browser can store data, then try again.', language: 'We couldn’t save your language preference. Please try again.', favorite: 'We couldn’t save this creation. Please try again.',
    name: 'Please enter your name.', email: 'Please enter a valid email address.', message: 'Please describe your needs or question.',
  },
  galaxy: '100,000 Stars galaxy background',
};

export const LANDING_MESSAGES: Record<LandingLocale, LandingMessages> = { 'zh-CN': zh, en };

const englishMeteorNames: Readonly<Record<number, string>> = {
  990000354: 'Suno Music 6',
  224: 'Nano Banana 2.1 · Official', 223: 'Nano Banana 2.1 · Per run',
  214: 'GPT Image 2.5 · Official',
  211: 'Qwen 3.8 Flash Next', 210: 'Qwen 3.8 Max 0902', 205: 'Wan 3.0',
  203: 'SD 2.5 · Full · Per sec', 202: 'SD 2.0 · Full · Per sec',
  201: 'SD 2.5 · Full', 200: 'SD 2.0 · Full',
  199: 'SD 2.5 · First/last · Per sec', 198: 'SD 2.5 · Text-to-video · Per sec',
  197: 'SD 2.0 · Reference · Per sec', 196: 'Video upscaling',
  195: 'SD 2.5 · Multi-ref · Per sec', 194: 'SD 2.5 · Reference · Per sec',
  193: 'SD 2.0 · Multi-ref · Per sec',
  192: 'Hailuo H3 Max · First/last frame', 191: 'Hailuo H3 Max · Text-to-video',
  190: 'Omni Flash · First/last frame', 189: 'Qwen 3.8 Flash',
  187: 'Wan 3.0 · Multi-reference', 186: 'Wan 3.0 · Reference-to-video',
  185: 'Wan 3.0 · First/last frame', 184: 'Wan 3.0 · Text-to-video',
};

export const LANDING_METEOR_MODELS: Record<LandingLocale, readonly ModelMeteorDefinition[]> = {
  'zh-CN': MODEL_METEOR_MODELS,
  en: MODEL_METEOR_MODELS.map(model => ({ ...model, name: englishMeteorNames[model.id] ?? model.name })),
};
