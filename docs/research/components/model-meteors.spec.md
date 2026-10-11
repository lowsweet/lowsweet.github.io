# Landing model meteors

Source: https://cc888.ai/zh-CN, public MoBan_02 ZuJian_LiuXing component. Frozen JS, CSS, model data and hashes: ../cc888-meteors/.

Interaction: time-driven, restricted to the opening section. Starts 300ms after the existing galaxy entrance completion; next desktop meteor 600ms later. Try another every 1600–2800ms. Each lasts 4600–5400ms. Cap at four desktop / one compact. Shuffle the entire 50-model pool before repeating.

DOM: positioned meteor → rotated flight wrapper → animated run, glow/trail/dot and burst; the burst contains a flash, two flares, two rings and 14 sparks. An independent upright wrapper contains icon, individual characters and an underline. Preserve this structure so the spark nth-child styles and horizontal label match upstream.

Native styles: flight angle -40° to -22°, travel 26rem. Scale .8936–1, brightness .81–1, tail 17.44–22rem. Label ui-monospace/SF Mono/JetBrains Mono/Menlo/Consolas, font-size calc(.8rem + .12rem * scale), weight 500, letter-spacing .06em, color #f2f7fbe0. Icon 1em with .55em right margin. The source's right-side 3×3 layout is replaced by copy-relative landing anchors as requested.

Landing anchors: measure the bottom-left hero copy. Six anchors sit in two rows approximately 64/128px above it; three sit beside its right edge with at least 24px of clearance after accounting for label width. Small per-meteor offsets vary the positions. Keep full labels within the viewport's 24px side insets, below the navbar, and separated from other labels by 24px. If a slot cannot fit, try another; skip the spawn if none fit. Recalculate anchors on resize, font load and section/copy changes.

Animation: preserve all 12 native keyframes and their easing; run reaches the anchor at 22%, dot bursts at 22.5%, characters start at duration×.225 plus distance-from-center×60ms. Each character takes .62s, initial blur .38s; underline starts duration×.225+.38s and lasts 1.1s. Label remains horizontal and fades from 80% to 100%.

Character centering: icon width 1.55em, wide Unicode characters 1.08em, other characters .70em. Compute each center relative to total width and animate from its negative offset to zero. Spaces become NBSP.

Compact (≤1024px): 12px text; one concurrent meteor. Host between navbar bottom+24px and hero-copy top−24px, with 24px side margins. Clip flight/burst to the host. Keep at least 88px available height, clamp label centers to fit full names; travel ≤80% viewport width. Use only the anchors just above the copy, keeping labels near the bottom-left text as on desktop.

Scope: only imported by LandingContent, pointer-events:none, aria-hidden:true. No card/black backdrop. Keep original galaxy/thermal button/foreground. Pause CSS and pending deadlines when offscreen/hidden; clear all jobs and listeners on unmount. Reduced motion, forced static or runtime static galaxy disables meteors.

Readability adaptation: a small drop-shadow on the label glyphs compensates for the existing bright galaxy without adding a backdrop or changing any native keyframes.

Landing palette: scoped CSS RGB-channel variables define warm white #FFF9EF, champagne #E9CBA7 and lilac #D1C5E8. Head/core/cross flares use warm white; tail, glow, both rings, text glow and underline use champagne. Source cyan/green/purple spark groups map to champagne/warm white/lilac. Model glyphs remain white and local SVGs retain their brand colors. Color alpha values, motion, placement and durations remain unchanged. The migration script's pure meteor_stylesheet function reproduces this palette without downloading assets.

QA: 390/768/1440 layouts, 30s actual recording, pool/icon integrity, early scroll, resize, pause/resume, app navigation/unmount, static mode, TypeScript/build and native Stars resource hashes.
