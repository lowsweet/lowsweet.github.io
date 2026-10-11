# Behaviors extracted from the live site

- Source desktop reference1440×900: header fixed, h2TTNeoris66px/60px, h1TheSeasons280.8px, original char-specific padded gradient glyphs. Those pads were tuned for the literal word storytelling and must be reset for custom text. LinkeAI Chinese uses local Noto Sans/Serif subsets.
- Source mobile390×844: pill Menu expands a full-height crystal-texture navigation, initial Tap to explore at bottom. The full original canvas remains active, not a video substitute.
- ScrollSmoother samples each scroll segment; native scroll position can lead smooth position for1.5s. Camera FOV temporarily rises25→35° with scroll velocity. Compare reference frames only after smooth position and velocity settle.
- Source project scene is seven actual GLB meshes. Each has Cube shell, Icon mesh and ConvexHull picking mesh. Project JPGs are normal maps, not brand artwork.
- Original Reimagine Phoenix randomizes local material parameters; no generation backend. First click enables source sound; switch toggles it. Hidden page pauses ticks and audio.
- Same-origin runtime provides real render-ready after two successful frames, exposes data-* diagnostics and preserves normalized timeline progress through layout changes. Language changes remount only text/header/footer components.
- Whole renderer is isolated in an iframe; route exit disposes iframe document and renderer. Static/reduced-motion renders semantic React content without mounting the heavy scene.
