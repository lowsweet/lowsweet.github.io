/* LinkeAI adaptation only. The preserved scene engine owns all rendering. */
(function () {
  'use strict';
  const DATA = /* LINKE_MESSAGES_START */{"messages":{"zh-CN":{"heroLead":"链接你的想象","heroSky":"与天空。","clickStart":"点击开始","tapExplore":"开始探索","scrollExplore":"向下探索","reimagine":"重塑凤凰","api":"API 开放平台","business":"商务合作","support":"联系客服","language":"English","home":"首页","menu":"菜单","start":"开始使用","galaxy":"银河版本","close":"返回晶体","uses":"可以用来","footerLead":"让下一次灵感，成为你的作品。","chatTitle":"智能对话","chatCaption":"从想法到答案","imageTitle":"图像创作","imageCaption":"让想象成为画面","videoTitle":"视频生成","videoCaption":"让画面开始叙事","audioTitle":"语音合成","audioCaption":"让文字拥有声音","chatCopy":"与主流 AI 模型对话，整理思路、撰写内容，把问题变成下一步行动。","imageCopy":"用文字描述想象中的画面，生成图像，或在已有作品上继续修改。","videoCopy":"从一句描述或一张图片出发，生成视频，探索镜头、动作与故事。","audioCopy":"将文字转为自然语音，为作品选择合适的声音、语气与节奏。","chatUses":["写作与改写","思路梳理","知识问答"],"imageUses":["概念设计","产品视觉","图像编辑"],"videoUses":["短片创作","动态视觉","图像转视频"],"audioUses":["视频配音","有声内容","多语言朗读"],"loading":"正在唤醒想象","error":"进入创作的另一种方式。"},"en":{"heroLead":"Connect your imagination","heroSky":"to the sky.","clickStart":"Click to start","tapExplore":"Tap to explore","scrollExplore":"Scroll to explore","reimagine":"Reimagine Phoenix","api":"API Platform","business":"Business","support":"Support","language":"中文","home":"Home","menu":"Menu","start":"Get started","galaxy":"Galaxy edition","close":"Back to crystals","uses":"Make it yours","footerLead":"Make your next idea real.","chatTitle":"AI conversations","chatCaption":"From ideas to answers","imageTitle":"Image creation","imageCaption":"Give imagination a shape","videoTitle":"Video generation","videoCaption":"Put your ideas in motion","audioTitle":"Voice synthesis","audioCaption":"Give your words a voice","chatCopy":"Talk with leading AI models to explore ideas, write content, and turn questions into a next step.","imageCopy":"Describe the image you imagine. Create it from words, or keep refining a work you already have.","videoCopy":"Start with a prompt or an image. Create a video and explore motion, camera angles, and stories.","audioCopy":"Turn text into natural speech. Find the voice, tone, and rhythm that fit your work.","chatUses":["Writing and editing","Exploring ideas","Questions and research"],"imageUses":["Concept design","Product visuals","Image editing"],"videoUses":["Short films","Motion visuals","Image to video"],"audioUses":["Video voiceovers","Audio stories","Multilingual narration"],"loading":"Awakening imagination","error":"Another way into your next creation."}},"sceneHtml":{"zh-CN":{"opening":"<p class=\"lg:text-sans-50 xs:text-sans-30 text-center\"><span class=\"text-icon-bird ic mb-20 inline-block\"></span><span class=\"relative z-2\">灵感，</span><br><span class=\"text-line from-scale half ic linke-copy-line\"></span><span class=\"relative z-2\">从一个念头开始。</span></p>","guides":"<p class=\"lg:text-sans-50 xs:text-sans-30 text-right\"><span class=\"relative z-2\">把脑海中的想法</span><br><span class=\"text-line from-scale half ic linke-copy-line\"></span><span class=\"relative z-2\">化作可以看见、</span><br><span class=\"text-line from-scale half ic linke-copy-line\"></span><span class=\"relative z-2\">听见、使用的</span><br><span class=\"text-line from-scale half ic linke-copy-line\"></span><span class=\"relative z-2\">作品。</span></p>","phoenix":"<p class=\"lg:text-sans-50 xs:text-sans-30 text-center\"><span class=\"text-icon-bird-2 rotate-180 ic mb-20 inline-block\"></span><span class=\"relative z-2\">一句话，可以成为</span><br><span class=\"text-line from-scale half ic linke-copy-line\"></span><span class=\"relative z-2\">文字、画面、</span><br><span class=\"text-line from-scale half ic linke-copy-line\"></span><span class=\"relative z-2\">影像与声音。</span></p>","inside":"<p class=\"lg:text-sans-50 xs:text-sans-30 text-center\"><span class=\"text-icon-flower-white ic mb-20 inline-block\"></span><span class=\"relative z-2\">你的想法，</span><br><span class=\"text-line from-scale half ic dark linke-copy-line\"></span><span class=\"relative z-2\">值得被看见。</span><br><span class=\"text-line from-scale half ic dark linke-copy-line\"></span><span class=\"relative z-2\">从第一句话，</span><br><span class=\"text-line from-scale half ic dark linke-copy-line\"></span><span class=\"relative z-2\">到完整作品，</span><br><span class=\"text-line from-scale half ic dark linke-copy-line\"></span><span class=\"relative z-2\">一步步，</span><br><span class=\"text-line from-scale half ic dark linke-copy-line\"></span><span class=\"relative z-2\">让想象成形。</span></p>","connected":"<p class=\"xs:text-sans-18 lg:text-sans-26 text-center\"><span class=\"relative z-2\">让不同的能力，</span><br><span class=\"text-line from-scale half ic dark linke-copy-line\"></span><span class=\"relative z-2\">在同一处连接。</span></p>","sparkFire":"<p class=\"xs:text-sans-38 lg:text-sans-66 text-center\"><span class=\"relative z-2\">从一点灵感，</span><br><span class=\"text-line from-scale half ic dark linke-copy-line\"></span><span class=\"relative z-2\">到完整的作品。</span></p>","final":"<p class=\"xs:text-sans-38 lg:text-sans-66 text-center\"><span class=\"relative z-2\">让下一次灵感，</span><br><span class=\"text-line from-scale half ic dark linke-copy-line\"></span><span class=\"relative z-2\">成为你的作品。</span></p>","featherIntro":"<p class=\"xs:text-sans-38 lg:text-sans-66 text-center\"><span class=\"text-icon-feather-white ic mb-20 inline-block\"></span><span class=\"relative z-2\">每个念头，</span><br><span class=\"text-line from-scale half ic dark linke-copy-line\"></span><span class=\"relative z-2\">都可成为创作的起点。</span></p>","principle0":"<p class=\"xs:text-sans-18 lg:text-sans-26 text-left\"><span class=\"xs:text-sans-26 lg:text-sans-38\">从想法开始</span><br><span class=\"text-line from-scale dark xs:my-10 lg:my-20 ic linke-copy-line\"></span><span class=\"lg:lines-text-gradient\">写下你想完成的事。</span><br><span class=\"lg:lines-text-gradient\">对话、写作、图像与影像，</span><br><span class=\"lg:lines-text-gradient\">都从一句描述出发。</span></p>","principle1":"<p class=\"xs:text-sans-18 lg:text-sans-26 text-right\"><span class=\"xs:text-sans-26 lg:text-sans-38\">自由切换模型</span><br><span class=\"text-line from-scale dark xs:my-10 lg:my-20 ic linke-copy-line\"></span><span class=\"lg:lines-text-gradient-left\">为每个任务选择合适的模型。</span><br><span class=\"lg:lines-text-gradient-left\">在同一个工作台中尝试，</span><br><span class=\"lg:lines-text-gradient-left\">找到更贴近想象的结果。</span></p>","principle2":"<p class=\"xs:text-sans-18 lg:text-sans-26 text-left\"><span class=\"xs:text-sans-26 lg:text-sans-38\">让创作衔接</span><br><span class=\"text-line from-scale dark xs:my-10 lg:my-20 ic linke-copy-line\"></span><span class=\"lg:lines-text-gradient\">从文字到图像，再到视频。</span><br><span class=\"lg:lines-text-gradient\">把不同能力接入创作过程，</span><br><span class=\"lg:lines-text-gradient\">让一个想法继续展开。</span></p>","principle3":"<p class=\"xs:text-sans-18 lg:text-sans-26 text-right\"><span class=\"xs:text-sans-26 lg:text-sans-38\">保留每一次尝试</span><br><span class=\"text-line from-scale dark xs:my-10 lg:my-20 ic linke-copy-line\"></span><span class=\"lg:lines-text-gradient-left\">保存作品与对话记录。</span><br><span class=\"lg:lines-text-gradient-left\">回到熟悉的起点，</span><br><span class=\"lg:lines-text-gradient-left\">继续修改，继续创作。</span></p>","crystals":"<p class=\"xs:text-sans-38 lg:text-sans-66 text-center\"><span class=\"relative z-2\">四种能力，</span><br><span class=\"text-line from-scale half ic dark linke-copy-line\"></span><span class=\"relative z-2\">让想象成形。</span></p>","narrative":"<p class=\"xs:text-serif-100 whitespace-nowrap lg:text-serif-200 text-center gradient-text gradient-text-big\">想象</p>","light":"<p class=\"xs:text-serif-100 whitespace-nowrap lg:text-serif-200 text-center gradient-text gradient-text-big\">看见。</p>","spirit":"<p class=\"xs:text-serif-100 whitespace-nowrap lg:text-serif-200 text-center gradient-text gradient-text-big\">感受。</p>","sound":"<p class=\"xs:text-serif-100 whitespace-nowrap lg:text-serif-200 text-center gradient-text gradient-text-big\">听见。</p>"},"en":{"opening":"<p class=\"lg:text-sans-50 xs:text-sans-30 text-center\"><span class=\"text-icon-bird ic mb-20 inline-block\"></span><span class=\"relative z-2\">Every idea begins</span><br><span class=\"text-line from-scale half ic linke-copy-line\"></span><span class=\"relative z-2\">with a spark.</span></p>","guides":"<p class=\"lg:text-sans-50 xs:text-sans-30 text-right\"><span class=\"relative z-2\">What if the ideas</span><br><span class=\"text-line from-scale half ic linke-copy-line\"></span><span class=\"relative z-2\">in your mind</span><br><span class=\"text-line from-scale half ic linke-copy-line\"></span><span class=\"relative z-2\">became something</span><br><span class=\"text-line from-scale half ic linke-copy-line\"></span><span class=\"relative z-2\">you could create?</span></p>","phoenix":"<p class=\"lg:text-sans-50 xs:text-sans-30 text-center\"><span class=\"text-icon-bird-2 rotate-180 ic mb-20 inline-block\"></span><span class=\"relative z-2\">One idea.</span><br><span class=\"text-line from-scale half ic linke-copy-line\"></span><span class=\"relative z-2\">Words, images,</span><br><span class=\"text-line from-scale half ic linke-copy-line\"></span><span class=\"relative z-2\">motion, and sound.</span></p>","inside":"<p class=\"lg:text-sans-50 xs:text-sans-30 text-center\"><span class=\"text-icon-flower-white ic mb-20 inline-block\"></span><span class=\"relative z-2\">Your ideas</span><br><span class=\"text-line from-scale half ic dark linke-copy-line\"></span><span class=\"relative z-2\">deserve to be seen.</span><br><span class=\"text-line from-scale half ic dark linke-copy-line\"></span><span class=\"relative z-2\">From a first prompt</span><br><span class=\"text-line from-scale half ic dark linke-copy-line\"></span><span class=\"relative z-2\">to a finished work,</span><br><span class=\"text-line from-scale half ic dark linke-copy-line\"></span><span class=\"relative z-2\">one step</span><br><span class=\"text-line from-scale half ic dark linke-copy-line\"></span><span class=\"relative z-2\">at a time.</span></p>","connected":"<p class=\"xs:text-sans-18 lg:text-sans-26 text-center\"><span class=\"relative z-2\">Different abilities.</span><br><span class=\"text-line from-scale half ic dark linke-copy-line\"></span><span class=\"relative z-2\">One connected workspace.</span></p>","sparkFire":"<p class=\"xs:text-sans-38 lg:text-sans-66 text-center\"><span class=\"relative z-2\">From a spark</span><br><span class=\"text-line from-scale half ic dark linke-copy-line\"></span><span class=\"relative z-2\">to a finished creation.</span></p>","final":"<p class=\"xs:text-sans-38 lg:text-sans-66 text-center\"><span class=\"relative z-2\">Make your next</span><br><span class=\"text-line from-scale half ic dark linke-copy-line\"></span><span class=\"relative z-2\">idea real.</span></p>","featherIntro":"<p class=\"xs:text-sans-38 lg:text-sans-66 text-center\"><span class=\"text-icon-feather-white ic mb-20 inline-block\"></span><span class=\"relative z-2\">Every idea</span><br><span class=\"text-line from-scale half ic dark linke-copy-line\"></span><span class=\"relative z-2\">can be a beginning.</span></p>","principle0":"<p class=\"xs:text-sans-18 lg:text-sans-26 text-left\"><span class=\"xs:text-sans-26 lg:text-sans-38\">Start with an idea</span><br><span class=\"text-line from-scale dark xs:my-10 lg:my-20 ic linke-copy-line\"></span><span class=\"lg:lines-text-gradient\">Describe what you want to make.</span><br><span class=\"lg:lines-text-gradient\">A conversation, a story,</span><br><span class=\"lg:lines-text-gradient\">an image, or a film.</span></p>","principle1":"<p class=\"xs:text-sans-18 lg:text-sans-26 text-right\"><span class=\"xs:text-sans-26 lg:text-sans-38\">Choose your model</span><br><span class=\"text-line from-scale dark xs:my-10 lg:my-20 ic linke-copy-line\"></span><span class=\"lg:lines-text-gradient-left\">Find the right model for your task.</span><br><span class=\"lg:lines-text-gradient-left\">Try different approaches</span><br><span class=\"lg:lines-text-gradient-left\">in one familiar workspace.</span></p>","principle2":"<p class=\"xs:text-sans-18 lg:text-sans-26 text-left\"><span class=\"xs:text-sans-26 lg:text-sans-38\">Connect your workflow</span><br><span class=\"text-line from-scale dark xs:my-10 lg:my-20 ic linke-copy-line\"></span><span class=\"lg:lines-text-gradient\">Move from words to images and video.</span><br><span class=\"lg:lines-text-gradient\">Bring different abilities together</span><br><span class=\"lg:lines-text-gradient\">and keep your idea moving.</span></p>","principle3":"<p class=\"xs:text-sans-18 lg:text-sans-26 text-right\"><span class=\"xs:text-sans-26 lg:text-sans-38\">Keep every iteration</span><br><span class=\"text-line from-scale dark xs:my-10 lg:my-20 ic linke-copy-line\"></span><span class=\"lg:lines-text-gradient-left\">Save your work and conversations.</span><br><span class=\"lg:lines-text-gradient-left\">Return to a familiar starting point.</span><br><span class=\"lg:lines-text-gradient-left\">Refine it. Make something new.</span></p>","crystals":"<p class=\"xs:text-sans-38 lg:text-sans-66 text-center\"><span class=\"relative z-2\">Four ways to</span><br><span class=\"text-line from-scale half ic dark linke-copy-line\"></span><span class=\"relative z-2\">bring ideas to life.</span></p>","narrative":"<p class=\"xs:text-serif-100 whitespace-nowrap lg:text-serif-200 text-center gradient-text gradient-text-big\">imagination.</p>","light":"<p class=\"xs:text-serif-100 whitespace-nowrap lg:text-serif-200 text-center gradient-text gradient-text-big\">See.</p>","spirit":"<p class=\"xs:text-serif-100 whitespace-nowrap lg:text-serif-200 text-center gradient-text gradient-text-big\">Feel.</p>","sound":"<p class=\"xs:text-serif-100 whitespace-nowrap lg:text-serif-200 text-center gradient-text gradient-text-big\">Hear.</p>"}}}/* LINKE_MESSAGES_END */;
  const NS = 'linke-story';
  const validLocales = new Set(['zh-CN', 'en']);
  const languageOptions = DATA.languages ?? [];
  let languageMenu = null;
  let languageTrigger = null;
  const query = new URLSearchParams(location.search);
  const state = {
    locale: validLocales.has(query.get('locale')) ? query.get('locale') : 'zh-CN',
    capabilities: null, ready: false, paused: false, hostPaused: false, disposed: false,
    detail: null, detailBusy: false, detailScroll: 0, detailFocus: null,
  };
  const timers = new Set();
  const cleanups = [];
  let refreshTimer;
  let readyPoll;
  let diagnosticsSubscribed = false;
  const runtime = () => window.__LINKE_STORY_RUNTIME__;
  const later = (fn, delay) => {
    const id = setTimeout(() => { timers.delete(id); if (!state.disposed) fn(); }, delay);
    timers.add(id);
    return id;
  };
  const listen = (target, type, fn, options) => {
    target.addEventListener(type, fn, options);
    cleanups.push(() => target.removeEventListener(type, fn, options));
  };
  // Real destinations preserve middle-click, modifier-click, and new-tab
  // behavior. Ordinary iframe clicks are delegated to the host transition.
  const normalizeNavigationLinks = root => {
    const anchors = root instanceof Element && root.matches('a[href]') ? [root] : [];
    root.querySelectorAll?.('a[href]').forEach(anchor => anchors.push(anchor));
    anchors.forEach(anchor => {
      const hash = new URL(anchor.href, location.href).hash;
      const path = hash === '#linke-start' ? '/app' : hash === '#linke-api' ? '/app?view=api' : null;
      if (!path) return;
      anchor.dataset.linkeNavigation = path;
      anchor.setAttribute('href', path);
      anchor.setAttribute('target', '_parent');
    });
  };
  const navigationObserver = new MutationObserver(records => {
    records.forEach(record => {
      if (record.type === 'attributes') normalizeNavigationLinks(record.target);
      else record.addedNodes.forEach(normalizeNavigationLinks);
    });
  });
  navigationObserver.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['href'] });
  normalizeNavigationLinks(document);
  cleanups.push(() => navigationObserver.disconnect());
  const text = key => DATA.messages?.[state.locale]?.[key] ?? DATA.messages?.en?.[key] ?? key;
  const html = key => DATA.sceneHtml?.[state.locale]?.[key] ?? DATA.sceneHtml?.en?.[key] ?? '';
  const send = (type, detail = {}) => {
    if (window.parent !== window && !state.disposed) {
      window.parent.postMessage({ namespace: NS, type, ...detail }, location.origin);
    }
  };
  const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const closeLanguageMenu = (returnFocus = false) => {
    const trigger = languageTrigger;
    languageMenu?.remove();
    languageMenu = null;
    languageTrigger = null;
    trigger?.setAttribute('aria-expanded', 'false');
    if (returnFocus && trigger?.isConnected) trigger.focus({ preventScroll: true });
  };
  const placeLanguageMenu = () => {
    if (!languageMenu || !languageTrigger) return;
    if (!languageTrigger.isConnected) { closeLanguageMenu(); return; }
    const rect = languageTrigger.getBoundingClientRect();
    const width = languageMenu.offsetWidth;
    const height = languageMenu.offsetHeight;
    const below = rect.bottom + 10;
    const top = below + height <= innerHeight - 12 ? below : rect.top - height - 10;
    languageMenu.style.top = Math.max(12, top) + 'px';
    languageMenu.style.left = Math.max(12, Math.min(rect.right - width, innerWidth - width - 12)) + 'px';
  };
  const openLanguageMenu = trigger => {
    if (languageTrigger === trigger && languageMenu) { closeLanguageMenu(true); return; }
    closeLanguageMenu();
    languageTrigger = trigger;
    languageMenu = document.createElement('div');
    languageMenu.id = 'linke-language-menu';
    languageMenu.className = 'linke-language-menu';
    languageMenu.setAttribute('role', 'menu');
    languageMenu.setAttribute('aria-label', text('languageMenu'));
    languageMenu.dataset.theme = trigger.classList.contains('dark') || trigger.closest('.linke-footer') ? 'dark' : 'light';
    languageMenu.innerHTML = languageOptions.map(option => {
      const enabled = option.enabled && validLocales.has(option.code);
      return '<button type="button" class="linke-language-item" role="menuitemradio" tabindex="-1"'
        + ' aria-checked="' + (option.code === state.locale) + '" data-linke-locale-option="' + escape(option.code) + '"'
        + (enabled ? '' : ' disabled') + '><span class="linke-language-check" aria-hidden="true"></span>'
        + '<span lang="' + escape(option.code) + '">' + escape(option.label) + '</span>'
        + (enabled ? '' : '<span class="linke-language-status">' + escape(text('languageUnavailable')) + '</span>') + '</button>';
    }).join('');
    trigger.setAttribute('aria-haspopup', 'menu');
    trigger.setAttribute('aria-controls', languageMenu.id);
    trigger.setAttribute('aria-expanded', 'true');
    document.body.append(languageMenu);
    placeLanguageMenu();
    languageMenu.querySelector('[aria-checked="true"]:not(:disabled)')?.focus({ preventScroll: true });
  };
  const moveLanguageFocus = key => {
    const items = Array.from(languageMenu?.querySelectorAll('button:not(:disabled)') ?? []);
    if (!items.length) return;
    const current = items.indexOf(document.activeElement);
    const next = key === 'Home' ? 0 : key === 'End' ? items.length - 1
      : (current + (key === 'ArrowUp' ? -1 : 1) + items.length) % items.length;
    items[next].focus({ preventScroll: true });
  };
  const applyLocale = () => {
    document.documentElement.lang = state.locale;
    document.documentElement.dataset.linkeLocale = state.locale;
    document.title = state.locale === 'en' ? 'LinkeAI · Connect your imagination to the sky' : 'LinkeAI · 链接想象与现实';
  };
  const diagnostics = () => {
    const api = runtime();
    const values = api?.getDiagnostics?.() ?? {};
    document.documentElement.dataset.linkeStoryLocale = state.locale;
    document.documentElement.dataset.linkeStoryPaused = String(state.paused);
    document.documentElement.dataset.linkeStoryDetail = state.detail?.id ?? '';
    const observed = {
      Progress: values.progress,
      SmoothY: values.smoothScrollY,
      NativeY: values.nativeScrollY,
      Velocity: values.velocity,
      Fov: values.fov,
      RenderedFrames: values.renderedFrames,
      ProjectCount: values.projectCount,
      Ready: values.ready ?? state.ready,
      SoundEnabled: values.soundEnabled,
      FirstClick: values.firstClick,
      LayoutTarget: values.layoutTargetProgress,
      ScrollPaused: values.scrollPaused,
      Page: values.page,
      SceneWidth: values.width,
      SceneHeight: values.height,
      TimelineTime: values.engineTimelineTime,
    };
    Object.entries(observed).forEach(([key, value]) => {
      document.documentElement.dataset['linkeStory' + key] = value == null ? '' : String(value);
    });
    return { ...values, ready: state.ready, locale: state.locale, paused: state.paused, detail: state.detail?.id ?? null };
  };
  const reportStatus = () => send('status', diagnostics());
  const scheduleRefresh = () => {
    if (refreshTimer) { clearTimeout(refreshTimer); timers.delete(refreshTimer); }
    refreshTimer = later(() => { runtime()?.refresh?.(); reportStatus(); }, 760);
  };
  const setLocale = (locale, notify = false) => {
    if (!validLocales.has(locale)) return;
    if (locale !== state.locale) {
      closeLanguageMenu();
      state.locale = locale;
      applyLocale();
      window.dispatchEvent(new CustomEvent('linke-locale', { detail: { locale } }));
      const store = runtime()?.store;
      if (store?.isCursorTextVisible && !store?.isCursorHoverCase) store.setCursorText?.(text('clickStart'));
      if (state.detail) renderDetail();
      scheduleRefresh();
    }
    if (notify) send('locale', { locale });
    reportStatus();
  };
  const setPaused = paused => {
    if (typeof paused === 'boolean') state.hostPaused = paused;
    state.paused = state.hostPaused || document.hidden;
    const api = runtime();
    if (state.paused) api?.pause?.(); else api?.resume?.();
    diagnostics();
  };
  const navigation = path => {
    const target = new URL(path, location.origin);
    if (target.origin === location.origin && (target.pathname === '/app' || target.pathname === '/galaxy')) {
      runtime()?.store?.setEnableSound?.(false);
      send('navigate', { path });
      if (window.parent === window) location.assign(path);
    }
  };
  const action = kind => {
    if (['api', 'business', 'support', 'feedback', 'about', 'privacy', 'terms'].includes(kind)) {
      if (kind === 'api') runtime()?.store?.setEnableSound?.(false);
      runtime()?.store?.setMobileMenuOpen?.(false);
      send('action', { action: kind });
    }
  };
  const localCapability = id => {
    const index = ['chat', 'image', 'video', 'audio'].indexOf(id);
    if (index < 0) return null;
    return { id, modelIndex: index, title: text(id + 'Title'), copy: text(id + 'Copy'), usecases: text(id + 'Uses') };
  };
  const capability = id => {
    const current = state.capabilities?.find(item => item.id === id);
    if (!current) return localCapability(id);
    const pick = field => typeof current[field] === 'object' && !Array.isArray(current[field]) ? current[field][state.locale] : current[field];
    return { id, modelIndex: current.modelIndex, title: pick('title'), copy: pick('copy'), usecases: pick('usecases') };
  };
  const glyph = id => {
    const shapes = {
      chat: '<path d="M12 14h40v29H29L17 53V43h-5z"/><path d="M22 24h20M22 33h13"/>',
      image: '<rect x="11" y="11" width="42" height="42" rx="3"/><path d="m12 43 13-14 10 11 7-8 11 13"/><circle cx="42" cy="22" r="3"/>',
      video: '<path d="m24 14 29 18-29 18z"/>',
      audio: '<path d="M12 26v12M22 19v26M32 11v42M42 19v26M52 26v12"/>',
    };
    return '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + shapes[id] + '</svg>';
  };
  const renderDetail = () => {
    if (!state.detail) return;
    const info = capability(state.detail.id);
    let element = document.getElementById('linke-capability-detail');
    if (!element) {
      element = document.createElement('section');
      element.id = 'linke-capability-detail';
      element.className = 'linke-capability-detail';
      element.setAttribute('role', 'dialog');
      element.setAttribute('aria-modal', 'true');
      element.setAttribute('aria-labelledby', 'linke-detail-title');
      element.tabIndex = -1;
      document.body.append(element);
    }
    element.innerHTML = '<div class="linke-detail-top"><span class="linke-detail-wordmark">LinkeAI</span><span class="linke-detail-number">0' + (info.modelIndex + 1) + ' / 04</span></div><div class="linke-detail-body"><div class="linke-detail-glyph">' + glyph(info.id) + '</div><h1 id="linke-detail-title">' + escape(info.title) + '</h1><p class="linke-detail-description">' + escape(info.copy) + '</p><div class="linke-detail-uses"><p>' + escape(text('uses')) + '</p><ul>' + info.usecases.map(item => '<li>' + escape(item) + '</li>').join('') + '</ul></div><div class="linke-detail-actions"><button type="button" data-linke-close class="linke-source-cta linke-detail-close">' + escape(text('close')) + '</button><a href="#linke-start" class="linke-source-cta">' + escape(text('start')) + '</a></div></div>';
    return element;
  };
  const transition = (from, to, done) => {
    const api = runtime();
    const parameter = { value: from };
    const reduced = query.get('motion') === 'static' || matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!api?.gsap || reduced) { api?.store?.setIceTransition?.(to); done(); return; }
    api.gsap.to(parameter, { value: to, duration: 1.5, ease: 'power1.inOut', onUpdate: () => api.store.setIceTransition(parameter.value), onComplete: done });
  };
  const openCapability = value => {
    const id = value.startsWith('crystal') ? ['chat', 'image', 'video', 'audio'][Number(value.slice(7))] : value;
    if (!capability(id) || state.detail || state.detailBusy) return;
    const api = runtime();
    if (!api?.ready || api.store?.isTransitionActive) return;
    state.detailBusy = true;
    state.detailFocus = document.activeElement;
    state.detailScroll = api.store.getScroll?.scrollTop?.() ?? window.scrollY;
    state.detailProgress = api.store.getScrollProgress;
    state.detail = { id };
    api.store.setMobileMenuOpen?.(false);
    api.store.setTransitionActive?.(true);
    api.store.setCursorHoverCase?.(false, '');
    api.store.setCursorTextState?.(false);
    api.store.setCurrentPage?.('cases');
    api.store.setSectionColor?.('dark');
    api.store.getScroll?.paused?.(true);
    transition(0, 1, () => {
      const element = renderDetail();
      element.classList.add('is-visible');
      element.focus({ preventScroll: true });
      state.detailBusy = false;
      api.store.setTransitionActive?.(false);
      reportStatus();
    });
    diagnostics();
  };
  const closeDetail = () => {
    if (!state.detail || state.detailBusy) return;
    state.detailBusy = true;
    const api = runtime();
    const element = document.getElementById('linke-capability-detail');
    element?.classList.remove('is-visible');
    api?.store?.setTransitionActive?.(true);
    api?.store?.setCurrentPage?.('home');
    transition(1, 0, () => {
      element?.remove();
      state.detail = null;
      state.detailBusy = false;
      api?.store?.setTransitionActive?.(false);
      if (api?.restoreProgress) api.restoreProgress(state.detailProgress);
      else {
        api?.store?.getScroll?.scrollTop?.(state.detailScroll);
        api?.store?.getScroll?.paused?.(false);
        api?.refresh?.();
      }
      state.detailFocus?.focus?.({ preventScroll: true });
      reportStatus();
    });
  };
  const confirmReady = () => {
    const api = runtime();
    const canvas = document.querySelector('canvas[data-engine-revision],#canvas canvas,canvas');
    if (!api?.ready || !canvas || canvas.width < 1 || canvas.height < 1) return false;
    state.ready = true;
    if (!diagnosticsSubscribed && api.store?.$subscribe) {
      diagnosticsSubscribed = true;
      const unsubscribe = api.store.$subscribe(diagnostics, { detached: true });
      cleanups.push(unsubscribe);
    }
    if (readyPoll) { clearInterval(readyPoll); readyPoll = null; }
    applyLocale();
    setPaused(state.hostPaused);
    send('ready', { revision: '179', ...diagnostics() });
    return true;
  };
  const shutdown = () => {
    if (state.disposed) return;
    closeLanguageMenu();
    runtime()?.store?.setEnableSound?.(false);
    runtime()?.pause?.();
    state.disposed = true;
    if (readyPoll) clearInterval(readyPoll);
    timers.forEach(clearTimeout);
    timers.clear();
    cleanups.splice(0).forEach(fn => fn());
    document.getElementById('linke-capability-detail')?.remove();
  };
  listen(window, 'message', event => {
    if (event.origin !== location.origin || event.data?.namespace !== NS) return;
    if (event.source === window && event.data.type === 'renderer-ready') { confirmReady(); return; }
    if (event.source === window && event.data.type === 'renderer-error') { send('error', { message: event.data.message }); return; }
    if (event.source !== window.parent || event.source === window) return;
    const data = event.data;
    if (data.type === 'init') {
      if (Array.isArray(data.capabilities) && data.capabilities.length === 4) state.capabilities = data.capabilities;
      setLocale(data.locale);
      confirmReady();
    } else if (data.type === 'locale') setLocale(data.locale);
    else if (data.type === 'mute') { runtime()?.store?.setEnableSound?.(false); diagnostics(); }
    else if (data.type === 'pause') setPaused(data.paused);
    else if (data.type === 'status') { confirmReady(); reportStatus(); }
    else if (data.type === 'shutdown') shutdown();
  });
  listen(document, 'click', event => {
    const target = event.target instanceof Element ? event.target : null;
    const languageButton = target?.closest('[data-linke-language-trigger]');
    if (languageButton) {
      event.preventDefault(); event.stopImmediatePropagation(); openLanguageMenu(languageButton); return;
    }
    const languageOption = target?.closest('[data-linke-locale-option]');
    if (languageOption) {
      event.preventDefault(); event.stopImmediatePropagation();
      const locale = languageOption.dataset.linkeLocaleOption;
      if (languageOption.disabled || !validLocales.has(locale) || !languageOptions.some(option => option.code === locale && option.enabled)) return;
      closeLanguageMenu(true);
      runtime()?.store?.setMobileMenuOpen?.(false);
      if (locale !== state.locale) setLocale(locale, true);
      return;
    }
    if (target?.closest('[data-linke-close]')) { event.preventDefault(); event.stopImmediatePropagation(); closeDetail(); return; }
    const anchor = target?.closest('a[href]');
    if (!anchor) return;
    if (anchor.dataset.linkeNavigation) {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || anchor.target === '_blank' || anchor.hasAttribute('download')) return;
      event.preventDefault(); event.stopImmediatePropagation();
      const destination = new URL(anchor.href, location.href);
      navigation(destination.pathname + destination.search + destination.hash);
      return;
    }
    const key = new URL(anchor.href, location.href).hash.replace('#linke-', '');
    if (!['api', 'business', 'support', 'feedback', 'about', 'privacy', 'terms', 'language', 'start', 'galaxy', 'chat', 'image', 'video', 'audio'].includes(key)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if (['chat', 'image', 'video', 'audio'].includes(key)) openCapability(key);
    else if (key === 'language') openLanguageMenu(anchor);
    else if (key === 'start' || key === 'galaxy') navigation(key === 'start' ? '/app' : '/galaxy');
    else action(key);
  }, true);
  listen(document, 'keydown', event => {
    const target = event.target instanceof Element ? event.target : null;
    if (languageMenu) {
      if (event.key === 'Escape') { event.preventDefault(); event.stopImmediatePropagation(); closeLanguageMenu(true); return; }
      if (event.key === 'Tab') { closeLanguageMenu(true); return; }
      if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
        event.preventDefault(); event.stopImmediatePropagation(); moveLanguageFocus(event.key); return;
      }
    } else if (target?.closest('[data-linke-language-trigger]') && ['ArrowDown', 'ArrowUp'].includes(event.key)) {
      event.preventDefault(); event.stopImmediatePropagation(); openLanguageMenu(target.closest('[data-linke-language-trigger]')); return;
    }
    if (!state.detail) return;
    if (event.key === 'Escape') { event.preventDefault(); closeDetail(); }
    if (event.key === 'Tab') {
      const element = document.getElementById('linke-capability-detail');
      const stops = Array.from(element?.querySelectorAll('button,a[href]') ?? []);
      const first = stops[0], last = stops[stops.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === element)) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }
  }, true);
  listen(document, 'pointerdown', event => {
    if (languageMenu && event.target instanceof Node && !languageMenu.contains(event.target) && !languageTrigger?.contains(event.target)) closeLanguageMenu();
  }, true);
  // These controls replace source buttons whose hover state hides the large
  // "Click to start" cursor. Keep that same behavior on the menu and trigger.
  const isLanguageControl = target => target instanceof Element && target.closest('[data-linke-language-trigger],#linke-language-menu');
  listen(document, 'pointerover', event => {
    if (isLanguageControl(event.target)) runtime()?.store?.setCursorHover?.(true);
  }, true);
  listen(document, 'pointerout', event => {
    if (isLanguageControl(event.target) && !isLanguageControl(event.relatedTarget)) runtime()?.store?.setCursorHover?.(false);
  }, true);
  listen(window, 'resize', placeLanguageMenu);
  listen(window, 'scroll', placeLanguageMenu, { capture: true, passive: true });
  listen(window, 'linke-layout', () => closeLanguageMenu());
  listen(document, 'wheel', event => {
    if (languageMenu?.contains(event.target)) event.stopImmediatePropagation();
  }, { capture: true, passive: true });
  listen(document, 'touchmove', event => {
    if (languageMenu?.contains(event.target)) event.stopImmediatePropagation();
  }, { capture: true, passive: true });
  listen(document, 'wheel', event => { if (state.detail) event.preventDefault(); }, { capture: true, passive: false });
  listen(document, 'touchmove', event => { if (state.detail && !event.target.closest?.('#linke-capability-detail')) event.preventDefault(); }, { capture: true, passive: false });
  listen(document, 'visibilitychange', () => setPaused());
  listen(window, 'linke-layout', scheduleRefresh);
  listen(window, 'error', event => {
    if (!state.ready) send('error', { message: String(event.message || 'Scene could not load') });
  });
  listen(window, 'unhandledrejection', event => {
    if (!state.ready) send('error', { message: String(event.reason?.message || event.reason || 'Scene could not load') });
  });
  listen(window, 'pagehide', shutdown);
  window.__LINKE_STORY_BRIDGE__ = { get locale() { return state.locale; }, text, html, setLocale, openCapability, closeDetail, diagnostics, shutdown };
  window.__LINKE_STORY_MESSAGES__ = DATA;
  applyLocale();
  readyPoll = setInterval(confirmReady, 200);
})();
