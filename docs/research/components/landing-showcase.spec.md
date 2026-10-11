# Landing showcase

Source: https://cc888.ai/zh-CN, public image list captured on 2026-10-11.
Only Landing changes. The workspace catalog and existing persisted assets stay intact.

## Structure and behavior

- Remove memory and brand sections, translations, styles and DOM camera anchors.
- Sections: opening, doorway, capabilities, inspiration, signup. Distances: 1, .74, .60, .35, .18.
- Showcase contains a dark full-section veil, centered heading and lead, flex columns of image buttons, and a neutral load-more button.
- Column count from original script: width >= 1400: 5; >= 1080: 4; >= 720: 3; otherwise 2. Following the latest feedback, assign each next source item to the shortest estimated column, using intrinsic image dimensions before loading.
- Preserve the entire gallery as one oversized native snap area, readable until its bottom. No nested vertical scroller and no horizontal filmstrip.

## Source CSS

- Source rem measured as 15.24px. Use a scoped length unit; do not change the site's root font size.
- Outer padding clamp(4 units, 10vh, 6.5 units) vertically, 2 units horizontally. Inner max width 88 units, centered.
- Header max width 34 units, centered, bottom margin 2.8 units. Omit the decorative eyebrow and line.
- Title clamp(1.6 units, 3.2vw, 2.3 units), weight 300, line height 1.25, letter spacing -.03em, white; bottom margin .9 unit.
- Lead .98 unit, line height 1.8, rgba(242,247,251,.66).
- Columns and rows gap .85 unit, reduced to .6 unit at <=768px. At <=768px, horizontal padding 1 unit; top padding 128px keeps the fixed navigation clear.
- Stretch columns to a common height and distribute any remaining space between cards, keeping all images intact and bottom edges aligned. A shared alpha mask fades the final clamp(88px,12vh,150px) to transparent. Keyboard focus temporarily removes the mask for readable captions and details; it never clips or removes a work.
- Card width 100%, padding 0, border 1px, radius .9 unit, clipped image. Natural width and height attributes reserve its original aspect ratio.
- Hover or focus: rise .25 unit, image scale 1.04; card transitions .35s, image .6s cubic-bezier(.2,.8,.2,1). Neutral border and shadow replace source cyan.
- Image overlay transparent to rgba(4,6,10,.88), initially opacity 0, revealed in .35s. Caption left/right .9 unit, bottom .85 unit, gap .45 unit; fade and translateY(.5 unit) to 0.
- Title .8 unit, weight 500, at most 2 lines. Stats .7 unit, monospace, gap .9 unit; semantic eye/heart marks 13px. Heart number is original uses, independent from personal favorites.
- Full veil: linear-gradient(180deg,#04060a00,#04060ad1 12%,#04060aeb,#04060ad1 88%,#04060a00).
- Reduced/static motion disables transforms/transitions. Buttons and dialogs keep the existing Beautiful UI primitives and footer close actions.

## Data and interactions

- Freeze the 99 images in public-snapshot.json. Import bytes unchanged, validate image dimensions, save content SHA-256 and source URLs. All runtime image paths are local.
- LandingShowcaseItem: stable source-URL hash id, local src, width/height/mime/byte size, bilingual title, optional bilingual real prompt, views and uses.
- Initially 20, add 20 per click, last batch 19; hide load button at 99. Language changes keep displayed count and ordering.
- No prompt is exposed in the public DOM snapshot. Do not infer or reuse the old generic mock prompts. Optional prompt remains absent and its detail block stays hidden.
- Details retain large image, counts, favorite, and create action. Create uses localized actual prompt or localized title as the initial brief.
- Favorite looks up MockService assets by local image URL. Existing asset toggles by its own stored id; first favorite calls addAsset with canonical Chinese metadata, favorite=true, published=false. Flush IndexedDB. Do not pre-seed or migrate the workspace's shared GALLERY.
- Favorite state reads stored URLs; language switch never changes identity. Disable favorite during persistence, preserve current error handling.

## Verification

- Compare original and local layouts at 390, 768, 971 and 1440, Chinese and English; no navigation overlap, wrong aspect ratios or horizontal overflow.
- Verify 20/40/60/80/99, detail behavior, keyboard focus, favorite reload and no duplicate stored copy, create link, long gallery reading and final snap.
- Check camera angles fixed after entrance, continuous forward/reverse zoom, resize and appended gallery anchor measurements, and static mode.
- Save source/local screenshots and actual scroll video. TypeScript, production build, all 99 image hashes and all 197 original galaxy resource hashes must pass.
