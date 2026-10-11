# Noomo runtime migration
Source https://storytelling.noomoagency.com/ ; source snapshots docs/research/noomo-source.
Runtime is Nuxt/Vue, Three r179, Sweet3 custom providers/GLSL, preserve complete existing rendering and postprocessing.
Do not modify galaxy assets or workbench. Local clone prefix /noomo-clone/. Keep raw snapshots unchanged.
Phoenix/feather/camera and dev timelines preserve original seek. Original scroll segments map 0–20, smoother smooth 1.5. Assets in cZ; original project count seven.
Use first four shells, ConvexHull pick mesh and source normals; replace Icon at runtime with chat bubble, picture frame, play triangle, audio waveform geometry using bundled Three classes. Four items chat/image/video/audio. Keep original spring hover, icon material and sounds.
Only project0–3 position tracks are remapped across crystal segment 17–18; all nonproject timeline tracks stay original. Crystal segment chosen 320vh desktop / 630vh mobile. Remove remaining project instances, assets optional raw snapshots retained. Maintain seamless enter and exit.
Expose window.__LINKE_STORY_RUNTIME__ with store, scene/settings, gsap, refresh and diagnostic hooks for local content bridge. Readiness message to parent is namespace linke-story, type ready. All commands must be same origin/source. Source analytics disabled.
Preserve normal startup and first gesture sound; pause when hidden. On page disposal stop sounds and document RAF. Child unload provides final cleanup.
Source header fixed top, xs pt20 px20 and lg pt38 px38; source brand black rgb41,52,90 / white; body shifts lilac to rgb2,6,23 dark. Font TTNeoris and TheSeasons italic.
Desktop and mobile timelines cam.glb / cam-mob.glb. Resource bytes roughly10MB plus script/fonts. Original crystal logos are geometry, not textures.
Verify JS syntax, models all load, four project instances, renderer revision179, source hash remains valid.
