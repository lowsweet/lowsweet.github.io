# Official model brand assets

`sources.json` is the source-of-truth manifest for the `/app` model icons. It records the official source URL, local file, byte size, SHA-256 hash, retrieval method, and the 24 model-to-brand mappings used by the workspace.

Product marks are used when an official compact product asset was available. Models without a separate official mark use the official vendor symbol; those decisions are listed in `fallbackNotes` in the manifest. Monochrome source artwork is rendered through a CSS alpha mask so it remains readable in light and dark themes without changing the source file or its proportions. Published black and white variants are used where the brand kit provides them.

The application loads only files under `public/model-brand-icons/`. Source attribution remains in the manifest and trademarks remain the property of their respective owners.

