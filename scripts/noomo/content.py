"""Repeatable product-copy adaptation of the preserved Noomo client modules.

The original Vue components, SplitText animations and scroll anchors remain the
source of truth. Locale/layout changes remount only the text components, never
the Three renderer or the page's scroll state.
"""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "public/noomo-clone"
LANGUAGE_OPTIONS = json.loads((ROOT / "lib/storytelling-languages.json").read_text())

MESSAGES = {
    "zh-CN": {
        "heroLead": "链接想象与现实", "heroSky": "让创意成为作品",
        "clickStart": "点击开始", "tapExplore": "开始探索", "scrollExplore": "向下探索",
        "reimagine": "重塑凤凰", "api": "API 开放平台", "business": "商务合作",
        "support": "联系客服", "language": "简体中文", "languageMenu": "选择语言", "languageUnavailable": "暂未开放", "home": "首页", "menu": "菜单",
        "start": "开始使用", "create": "开始创作", "galaxy": "银河版本", "close": "返回晶体", "uses": "可以用来",
        "footerLead": "让下一次灵感，成为你的作品",
        "chatTitle": "智能对话", "chatCaption": "从想法到答案",
        "imageTitle": "图像创作", "imageCaption": "让想象成为画面",
        "videoTitle": "视频生成", "videoCaption": "让画面开始叙事",
        "audioTitle": "语音合成", "audioCaption": "让文字拥有声音",
        "chatCopy": "与主流 AI 模型对话，整理思路、撰写内容，把问题变成下一步行动。",
        "imageCopy": "用文字描述想象中的画面，生成图像，或在已有作品上继续修改。",
        "videoCopy": "从一句描述或一张图片出发，生成视频，探索镜头、动作与故事。",
        "audioCopy": "将文字转为自然语音，为作品选择合适的声音、语气与节奏。",
        "chatUses": ["写作与改写", "思路梳理", "知识问答"],
        "imageUses": ["概念设计", "产品视觉", "图像编辑"],
        "videoUses": ["短片创作", "动态视觉", "图像转视频"],
        "audioUses": ["视频配音", "有声内容", "多语言朗读"],
        "loading": "正在唤醒想象", "error": "进入创作的另一种方式。",
    },
    "en": {
        "heroLead": "Connect your imagination", "heroSky": "to the sky.",
        "clickStart": "Click to start", "tapExplore": "Tap to explore", "scrollExplore": "Scroll to explore",
        "reimagine": "Reimagine Phoenix", "api": "API Platform", "business": "Business",
        "support": "Support", "language": "English", "languageMenu": "Choose language", "languageUnavailable": "Coming soon", "home": "Home", "menu": "Menu",
        "start": "Get started", "create": "Start creating", "galaxy": "Galaxy edition", "close": "Back to crystals", "uses": "Make it yours",
        "footerLead": "Make your next idea real.",
        "chatTitle": "AI conversations", "chatCaption": "From ideas to answers",
        "imageTitle": "Image creation", "imageCaption": "Give imagination a shape",
        "videoTitle": "Video generation", "videoCaption": "Put your ideas in motion",
        "audioTitle": "Voice synthesis", "audioCaption": "Give your words a voice",
        "chatCopy": "Talk with leading AI models to explore ideas, write content, and turn questions into a next step.",
        "imageCopy": "Describe the image you imagine. Create it from words, or keep refining a work you already have.",
        "videoCopy": "Start with a prompt or an image. Create a video and explore motion, camera angles, and stories.",
        "audioCopy": "Turn text into natural speech. Find the voice, tone, and rhythm that fit your work.",
        "chatUses": ["Writing and editing", "Exploring ideas", "Questions and research"],
        "imageUses": ["Concept design", "Product visuals", "Image editing"],
        "videoUses": ["Short films", "Motion visuals", "Image to video"],
        "audioUses": ["Video voiceovers", "Audio stories", "Multilingual narration"],
        "loading": "Awakening imagination", "error": "Another way into your next creation.",
    },
}


def _text_with_lines(paragraph_class: str, lines: list[str], *, dark: bool = False, icon: str = "") -> str:
    """Use source visual vocabulary; text is product copy rather than source brands."""
    icon_html = f'<span class="{icon} ic mb-20 inline-block"></span>' if icon else ""
    line_class = "text-line from-scale half ic" + (" dark" if dark else "")
    fragments = []
    for index, line in enumerate(lines):
        fragments.append(f'<span class="relative z-2">{line}</span>')
        if index != len(lines) - 1:
            fragments.append(f'<br><span class="{line_class} linke-copy-line"></span>')
    return f'<p class="{paragraph_class}">{icon_html}{"".join(fragments)}</p>'


def _make_scene_html() -> dict[str, dict[str, str]]:
    scenes: dict[str, dict[str, str]] = {"zh-CN": {}, "en": {}}
    basic = "lg:text-sans-50 xs:text-sans-30 text-center"
    for locale, texts in [
        ("zh-CN", [
            ["灵感，", "从一个念头开始。"],
            ["把脑海中的想法", "化作可以看见、", "听见、使用的", "作品。"],
            ["一句话，可以成为", "文字、画面、", "影像与声音。"],
            ["你的想法，", "值得被看见。", "从第一句话，", "到完整作品，", "一步步，", "让想象成形。"],
            ["让不同的能力，", "在同一处连接。"],
            ["从一点灵感，", "到完整的作品。"],
            ["让下一次灵感，", "成为你的作品"],
            ["每个念头，", "都可成为创作的起点。"],
            ["从想法开始", "写下你想完成的事。", "对话、写作、图像与影像，", "都从一句描述出发。"],
            ["自由切换模型", "为每个任务选择合适的模型。", "在同一个工作台中尝试，", "找到更贴近想象的结果。"],
            ["让创作衔接", "从文字到图像，再到视频。", "把不同能力接入创作过程，", "让一个想法继续展开。"],
            ["保留每一次尝试", "保存作品与对话记录。", "回到熟悉的起点，", "继续修改，继续创作。"],
            ["四种能力，", "让想象成形。"],
        ]),
        ("en", [
            ["Every idea begins", "with a spark."],
            ["What if the ideas", "in your mind", "became something", "you could create?"],
            ["One idea.", "Words, images,", "motion, and sound."],
            ["Your ideas", "deserve to be seen.", "From a first prompt", "to a finished work,", "one step", "at a time."],
            ["Different abilities.", "One connected workspace."],
            ["From a spark", "to a finished creation."],
            ["Make your next", "idea real."],
            ["Every idea", "can be a beginning."],
            ["Start with an idea", "Describe what you want to make.", "A conversation, a story,", "an image, or a film."],
            ["Choose your model", "Find the right model for your task.", "Try different approaches", "in one familiar workspace."],
            ["Connect your workflow", "Move from words to images and video.", "Bring different abilities together", "and keep your idea moving."],
            ["Keep every iteration", "Save your work and conversations.", "Return to a familiar starting point.", "Refine it. Make something new."],
            ["Four ways to", "bring ideas to life."],
        ]),
    ]:
        result = scenes[locale]
        keys = ["opening", "guides", "phoenix", "inside", "connected", "sparkFire", "final", "featherIntro", "principle0", "principle1", "principle2", "principle3", "crystals"]
        for idx, (key, lines) in enumerate(zip(keys, texts)):
            classes = basic
            if key == "guides": classes = "lg:text-sans-50 xs:text-sans-30 text-right"
            if key in ["connected"]: classes = "xs:text-sans-18 lg:text-sans-26 text-center"
            if key in ["sparkFire", "final", "featherIntro", "crystals"]: classes = "xs:text-sans-38 lg:text-sans-66 text-center"
            if key.startswith("principle"):
                align = "text-right" if key in ["principle1", "principle3"] else "text-left"
                head = f'<span class="xs:text-sans-26 lg:text-sans-38">{lines[0]}</span><br><span class="text-line from-scale dark xs:my-10 lg:my-20 ic linke-copy-line"></span>'
                body = "<br>".join(f'<span class="lg:lines-text-gradient{("-left" if align == "text-right" else "")}">{line}</span>' for line in lines[1:])
                result[key] = f'<p class="xs:text-sans-18 lg:text-sans-26 {align}">{head}{body}</p>'
            else:
                icon = "text-icon-bird" if key == "opening" else "text-icon-bird-2 rotate-180" if key == "phoenix" else "text-icon-feather-white" if key == "featherIntro" else "text-icon-flower-white" if key == "inside" else ""
                result[key] = _text_with_lines(classes, lines, dark=idx >= 3, icon=icon)
        for key, value in [("narrative", "想象" if locale == "zh-CN" else "imagination."), ("light", "看见。" if locale == "zh-CN" else "See."), ("spirit", "感受。" if locale == "zh-CN" else "Feel."), ("sound", "听见。" if locale == "zh-CN" else "Hear.")]:
            result[key] = f'<p class="xs:text-serif-100 whitespace-nowrap lg:text-serif-200 text-center gradient-text gradient-text-big">{value}</p>'
    for locale, labels in [
        ("zh-CN", {
            "start": "开始使用", "support": "客服", "contact": "联系客服",
            "offerAction": "注册领取礼包",
            "offer": "新人免费大礼包，AI 绘画 / 视频 / 对话免费开用",
            "description": "企业级 AI 接口服务平台", "email": "邮箱：",
            "feedback": "举报与反馈", "about": "关于我们", "privacy": "隐私政策", "terms": "用户协议",
            "payments": "支付方式",
        }),
        ("en", {
            "start": "Get started", "support": "Support", "contact": "Contact support",
            "offerAction": "Sign up for a welcome pack",
            "offer": "Create with image, video, and chat tools for free.",
            "description": "AI APIs for teams and businesses", "email": "Email: ",
            "feedback": "Report & feedback", "about": "About us", "privacy": "Privacy policy", "terms": "Terms of use",
            "payments": "Payment methods",
        }),
    ]:
        scenes[locale]["footerActions"] = (
            '<div class="linke-footer-buttons">'
            f'<a class="linke-source-cta linke-footer-start" href="#linke-start">{labels["start"]}</a>'
            f'<a class="linke-source-cta linke-footer-support" href="#linke-support">{labels["support"]}</a>'
            '</div>'
            '<div class="linke-footer-gift">'
            f'<a class="linke-source-cta linke-footer-offer" href="#linke-start">{labels["offerAction"]}</a>'
            f'<p class="linke-footer-offer-copy">{labels["offer"]}</p>'
            '</div>'
        )
        links = ''.join(
            f'<a href="#linke-{key}">{labels[key]}</a>'
            for key in ["feedback", "about", "privacy", "terms"]
        )
        scenes[locale]["footerLegal"] = (
            '<div class="linke-footer-info">'
            '<span>© CORTEXIQ PTE. LTD.</span>'
            f'<span>{labels["description"]}</span>'
            f'<a class="linke-footer-email" href="mailto:liaowei@ai6800.com">{labels["email"]}liaowei@ai6800.com</a>'
            '</div>'
            '<nav class="linke-footer-links">'
            f'<a href="#linke-support">{labels["contact"]}</a>{links}'
            '</nav>'
            f'<div class="linke-footer-payments" role="group" aria-label="{labels["payments"]}">'
            '<img src="/noomo-clone/images/payments/visa.svg" alt="Visa" width="38" height="24">'
            '<img src="/noomo-clone/images/payments/mastercard.svg" alt="Mastercard" width="38" height="24">'
            '<img src="/noomo-clone/images/payments/paypal.svg" alt="PayPal" width="38" height="24">'
            '</div>'
        )
    return scenes


SCENE_HTML = _make_scene_html()


def _once(text: str, old: str, new: str) -> str:
    if old not in text:
        raise ValueError(f"Noomo content source changed; missing {old[:100]!r}")
    return text.replace(old, new, 1)


def patch_home(text: str) -> str:
    # Product interactions stay local; the archived site's analytics helper
    # must not initialize a source Google tag when Reimagine is clicked.
    text = _once(text, 'function lt(...x){const{gtag:s}=st();s("event",...x)}', 'function lt(...x){}')
    injection = '''const _linkeLocale=v(window.__LINKE_STORY_BRIDGE__.locale),_linkeRevision=v(0);
window.addEventListener("linke-locale",()=>{_linkeLocale.value=window.__LINKE_STORY_BRIDGE__.locale;_linkeRevision.value++;});
window.addEventListener("linke-layout",()=>{_linkeRevision.value++;});
const _linkeCopy=k=>{_linkeLocale.value;return window.__LINKE_STORY_BRIDGE__.text(k)},_linkeHTML=k=>{_linkeLocale.value;return window.__LINKE_STORY_BRIDGE__.html(k)};
'''
    text = _once(text, "const Ce=", injection + "const Ce=")

    # Replace only HTML content values; source positions and timing props are kept.
    start, end = text.index('We=$({__name:"AnimatedTexts"'), text.index('Ye=Object.assign')
    body = text[start:end]
    keys = ["opening", "guides", "phoenix", "narrative", "light", "spirit", "sound", "inside", "connected", "sparkFire", "final", "featherIntro", "principle0", "principle1", "principle2", "principle3", "crystals"]
    matches = list(re.finditer(r'text:`[^`]*`', body))
    if len(matches) != len(keys):
        raise ValueError(f"Expected {len(keys)} source narrative blocks, got {len(matches)}")
    for match, key in reversed(list(zip(matches, keys))):
        body = body[:match.start()] + f'text:_linkeHTML("{key}")' + body[match.end():]
    first = body.index("const o=[")
    last = body.index("],p=G", first) + 1
    crystal_entries = []
    for idx, capability in enumerate(["chat", "image", "video", "audio"]):
        direction = "left" if idx % 2 == 0 else "right"
        html = f'''`<span class="flex xs:items-center lg:items-start gap-0 flex-col xs:relative lg:absolute h-full lg:-top-12 lg:{direction}-80"><span class="xs:text-sans-26 lg:text-sans-50 whitespace-nowrap relative z-2">${{_linkeCopy("{capability}Title")}}</span><br><span class="text-sans-18 -mt-10 relative z-2">${{_linkeCopy("{capability}Caption")}}</span><span class="absolute xs:hidden lg:block w-full blur-[80px] h-151 bg-dark-400 left-0 top-0 rounded-[100%] -translate-y-1/4"></span></span>`'''
        crystal_entries.append(f'{{className:"xs:{direction}-0 lg:{direction}-[20vw]",id:"crystal{idx}",content:{html},link:"#linke-{capability}"}}')
    body = body[:first] + "const o=[" + ",".join(crystal_entries) + "]" + body[last:]
    # Post-crystal narrative anchors derive from the shortened source section.
    body = body.replace('scrollStart:e(17)+110+(a?20:0),scrollEnd:e(17)+210+(a?20:0),scrollStart2:e(17)+300,scrollEnd2:e(17)+400', 'scrollStart:e(17)+90,scrollEnd:e(17)+170,scrollStart2:e(18)+70,scrollEnd2:e(18)+180')
    text = text[:start] + body + text[end:]
    text = _once(text, 'const r=()=>{a.isTransitionActive||e.push(f.link)}', 'const r=()=>{a.isTransitionActive||window.__LINKE_STORY_BRIDGE__.openCapability(f.id)}')
    # A locale/layout remount can retain an unchanged NDC position. Initialize
    # the label from that position instead of waiting for a movement event.
    text = _once(text,
        'ie(()=>a.getIceCubePositionByIndex[f.id]?.y,T=>{c.value=T,p(),g(),(s.value||t)&&k()})',
        'ie(()=>a.getIceCubePositionByIndex[f.id]?.y,T=>{if(!Number.isFinite(T))return;c.value=T,p(),g(),(s.value||t)&&k()},{immediate:!0})')

    hero_old = '[...M[0]||(M[0]=[te(" The power",-1),d("br",null,null,-1),d("span",{class:"xs:text-serif-26 lg:text-serif-66 font-300 xs:mt-10 lg:mt-0 lg:ml-60 xs:mr-0 lg:mr-15"},"of",-1),te(" digital ",-1)])]'
    text = _once(text, hero_old, '_linkeCopy("heroLead")')
    text = _once(text, '},"storytelling",512)', '},_linkeCopy("heroSky"),512)')
    text = text.replace('t.setCursorText("Click to start")', 't.setCursorText(_linkeCopy("clickStart"))')
    # This cached subtree is remounted on locale/layout changes, preserving its
    # source click-to-explore controls and decorative star images.
    text = text.replace('},"Tap to explore")', '},_linkeCopy("tapExplore"))')
    text = text.replace('}," Scroll to explore ",-1)', '},_linkeCopy("scrollExplore"),1)')
    text = _once(text, 't=oe.split("")', 't=_linkeCopy("create").split("")')
    text = _once(text, 'a=oe.toLowerCase().indexOf("g")', 'a=_linkeCopy("create").toLowerCase().indexOf("g")')
    text = _once(text,
        'at={class:"wrapper w-220 relative h-46 flex pl-22 pr-20 items-center justify-between bg-white/25 rounded-full"}',
        'at={class:"wrapper linke-create-wrapper relative h-46 flex pl-22 pr-20 items-center justify-between bg-white/25 rounded-full"}')
    text = _once(text,
        'H("div",{class:L(["fixed z-10 release-spirit',
        'H("a",{href:"#linke-start","aria-label":_linkeCopy("create"),class:L(["fixed z-10 release-spirit')
    text = _once(text, 'onClick:T},[d("div",at,', '},[d("div",at,')

    # The footer follows the source stagger/blur animation without old logos or
    # external social destinations.
    footer_start, footer_end = text.index('Me=$({__name:"Footer"'), text.index('Ne=Object.assign')
    footer = text[footer_start:footer_end]
    render_start = footer.index('return(c,l)=>')
    render = '''return(c,l)=>(S(),H("footer",{ref_key:"element",ref:a,class:L(["linke-footer w-full fixed z-9 top-0 left-0 pointer-events-none",{"!opacity-0 !pointer-events-none":u(t).getMobileMenuOpen}])},[d("div",{class:"linke-footer-spacer"}),d("div",Ce,[d("p",{class:"text-white text-center linke-footer-lead"},_linkeCopy("footerLead")),d("div",{class:"linke-footer-brand"},"LinkeAI"),d("div",{class:"linke-footer-actions",innerHTML:_linkeHTML("footerActions")},null,8,["innerHTML"])]),d("div",{class:"linke-footer-meta stagger-item opacity-0",innerHTML:_linkeHTML("footerLegal")},null,8,["innerHTML"])],2))}}),'''
    text = text[:footer_start] + footer[:render_start] + render + text[footer_end:]
    # The original compiled footer block tracks only dynamic VNodes. Mark every
    # translated text child with Vue's TEXT patch flag so a locale change patches
    # its DOM rather than leaving the first language in the optimized block.
    footer_start, footer_end = text.index('Me=$({__name:"Footer"'), text.index('Ne=Object.assign')
    footer = text[footer_start:footer_end]
    footer = re.sub(r'_linkeCopy\("([^\"]+)"\)\)', r'_linkeCopy("\1"),1)', footer)
    text = text[:footer_start] + footer + text[footer_end:]

    # Responsive height follows the store instead of the source's mount-only
    # capture, so crossing 1024px does not leave an old scroll spacer.
    text = _once(text, 'gt=$({__name:"index",setup(x){const s=W(),t=v(0)', 'gt=$({__name:"index",setup(x){const s=W(),t=G(()=>s.getTotalScrollLength)')
    text = _once(text, 't.value=s.getTotalScrollLength,s.setCurrentPage("home")', 's.setCurrentPage("home")')
    text = text.replace('V(Qe,{onStartByClick:f})', 'V(Qe,{key:"hero-"+_linkeRevision.value,onStartByClick:f})')
    text = text.replace('V(Ye)', 'V(Ye,{key:"texts-"+_linkeRevision.value})')
    text = text.replace('V(ct)', 'V(ct,{key:"spirit-"+_linkeRevision.value})')
    text = text.replace('V(Je,{visible:a.value}', 'V(Je,{key:"hint-"+_linkeRevision.value,visible:a.value}')
    text = _once(text, 'V(ue,{class:L([', 'V(ue,{key:"footer-"+_linkeRevision.value,class:L([')
    return text


def patch_main_content(text: str) -> str:
    # Replace the scene graphic brand, leaving the LinkeAI text wordmarks and
    # the scene's original position, rotation, pulse and brightness untouched.
    text = _once(text, 'logo:"/textures/icon.png"', 'logo:"/textures/linke-logo.png"')
    text = _once(text,
        'const e=X.assetsManager.get("logo");e.minFilter=e.magFilter=dn',
        'const e=X.assetsManager.get("logo");e.minFilter=e.magFilter=It')
    # The upstream symmetric pixel mark concealed the scene's horizontal
    # reflection. Correct only this billboard's U coordinate; the supplied SVG
    # and the loader keep their original orientation.
    text = _once(text,
        'uniform sampler2D map@Sun.map;\n\nvoid main() {\n  gl_FragColor = texture2D(map, vUv);',
        'uniform sampler2D map@Sun.map;\n\nvoid main() {\n  gl_FragColor = texture2D(map, vec2(1. - vUv.x, vUv.y));')
    injection = '''const _linkeMainLocale=rn(window.__LINKE_STORY_BRIDGE__.locale),_linkeMainLayoutRevision=rn(0);
window.addEventListener("linke-locale",()=>{_linkeMainLocale.value=window.__LINKE_STORY_BRIDGE__.locale;});
window.addEventListener("linke-layout",()=>{_linkeMainLayoutRevision.value++;});
const _linkeMainCopy=k=>{_linkeMainLocale.value;return window.__LINKE_STORY_BRIDGE__.text(k)};
const _linkeMainLanguageTrigger=(dark,mobile=false)=>We("button",{type:"button","data-linke-language-trigger":"",class:Vt(["linke-language-trigger",{dark,"linke-language-trigger-mobile":mobile}]),"aria-label":_linkeMainCopy("languageMenu"),"aria-haspopup":"menu","aria-expanded":"false","aria-controls":"linke-language-menu"},[We("span",{class:"linke-language-globe","aria-hidden":"true"}),We("span",null,_linkeMainCopy("language"),1),We("span",{class:"linke-language-chevron","aria-hidden":"true"})],10,["class","aria-label"]);
'''
    text = _once(text, 'wH={class:"flex flex-col gap-64 items-center"}', 'wH={class:"flex flex-col gap-64 items-center"}')
    # Insert a statement between source component constants, not inside a
    # comma-chained declaration.
    text = _once(text, 'EH=Ni({__name:"MobileMenu"', 'EH=Ni({__name:"MobileMenu"')
    anchor = 'CH=Object.assign(ou(EH,[["__scopeId","data-v-89305177"]]),{__name:"NavigationsMobileMenu"}),SH='
    text = _once(text, anchor, anchor.replace(',SH=', ';' + injection + 'const SH='))

    start, end = text.index('EH=Ni({__name:"MobileMenu"'), text.index('LB=Object.assign')
    header = text[start:end]
    for old, key in [("Home", "home"), ("Agency", "api"), ("Labs", "business"), ("Contact", "support")]:
        header = header.replace(f'text:"{old}"', f'text:_linkeMainCopy("{key}")')
        header = re.sub(r'\[\.\.\.r\[\d\]\|\|\(r\[\d\]=\[Al\("' + old + r'",-1\)\]\)\]', f'[Al(_linkeMainCopy("{key}"))]', header)
    header = header.replace('external:"",target:"_blank",', '')
    header = header.replace('https://noomoagency.com', '#linke-api').replace('https://labs.noomoagency.com', '#linke-business').replace('/contacts', '#linke-support')
    old_logo = 'We("div",MH,[We("img",{alt:"Noomo Agency Logo",src:AH,class:Vt(["h-36 w-auto transition-all duration-500 ease-in-out",{"filter brightness-0 invert":Le(e).getSectionColor==="dark"||Le(e).getMobileMenuOpen}])},null,2)]),We("div",TH,[We("img",{alt:"Noomo Agency Logo",src:vH,class:Vt(["top-0 left-0 h-full w-full transition-all duration-500 ease-in-out",{"filter brightness-0 invert":Le(e).getSectionColor==="dark"||Le(e).getMobileMenuOpen}])},null,2)])'
    new_logo = 'We("span",{class:Vt(["linke-wordmark transition-all duration-500 ease-in-out",{"linke-wordmark-light":Le(e).getSectionColor==="dark"||Le(e).getMobileMenuOpen}])},[We("span",{class:"linke-brand-symbol","aria-hidden":"true"}),We("span",null,"LinkeAI")],2)'
    header = _once(header, old_logo, new_logo)
    socials = re.search(r'\[\.\.\.r\[4\]\|\|\(r\[4\]=\[We\("a",\{target:"_blank",href:"https://www.instagram.com/noomoagency/".*?\]\)\]', header)
    if not socials: raise ValueError("Missing original mobile footer links")
    new_social = '[_linkeMainLanguageTrigger(true,true)]'
    header = header[:socials.start()] + new_social + header[socials.end():]
    header = header.replace('IH={class:"md:flex xs:hidden gap-14"}', 'IH={class:"lg:flex xs:hidden gap-14"}')
    header = header.replace('RH={class:"md:hidden xs:block"}', 'RH={class:"lg:hidden xs:block"}')
    terminal = 'text:_linkeMainCopy("support"),link:"#linke-support",type:"none-rounded"},null,8,["class"])])])'
    lang = 'text:_linkeMainCopy("support"),link:"#linke-support",type:"none-rounded"},null,8,["class"]),_linkeMainLanguageTrigger(Le(e).getSectionColor==="dark")])])'
    header = _once(header, terminal, lang)
    header = header.replace('null,8,["class"])', 'null,8,["class","text"])')
    text = text[:start] + header + text[end:]
    text = _once(text, '}," Menu ",2)', '},_linkeMainCopy("menu"),3)')
    # Only the Header VNode receives a responsive key. Its captured device state
    # and source button layout are recreated, while the existing renderer and
    # all app-level scene/scroll instances retain their original keys.
    text = _once(text, 'Tt(M),We("div",Bie', 'Tt(M,{key:"header-"+_linkeMainLayoutRevision.value}),We("div",Bie')
    # All source cursor sizing and color comparisons use the localized string.
    text = text.replace('==="Click to start"', '===window.__LINKE_STORY_BRIDGE__.text("clickStart")')
    return text


def write_messages() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    payload = {"messages": MESSAGES, "sceneHtml": SCENE_HTML, "languages": LANGUAGE_OPTIONS}
    (OUT / "messages.json").write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n")
    bridge = OUT / "linke-bridge.js"
    if bridge.exists():
        data = json.dumps(payload, ensure_ascii=False, separators=(",", ":"))
        source = bridge.read_text()
        source = re.sub(r'/\* LINKE_MESSAGES_START \*/.*?/\* LINKE_MESSAGES_END \*/', lambda _: f'/* LINKE_MESSAGES_START */{data}/* LINKE_MESSAGES_END */', source, flags=re.S)
        bridge.write_text(source)


if __name__ == "__main__":
    write_messages()
