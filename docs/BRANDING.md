# Branding bridge

The public website is a design draft. The Client Brand Studio package is still being repaired and has not been approved as a finished release. Do not edit `brand_studio` from this website project.

## Active website colors

`src/app/(frontend)/cx83-brand.css` is imported immediately after `globals.css` in the frontend root layout. It overrides the original neutral placeholder colors and is the active public website brand layer. It does not style Payload's separate admin layout.

Source palette from `CX83_Studio_082_Brand_Assets_DRAFT.zip` and `CX83_Website_Brand_START_HERE.md`:

| Role | Value |
| :--- | :--- |
| Electric Blue | `#246BFF` |
| Midnight | `#080E22` |
| Violet | `#8247F5` |
| Silver | `#E6EBF5` |
| White | `#FFFFFF` |

Source supporting tones include `#A4B6D3`, `#B6EAFF`, and `#F5F7FF`. Website semantic tones such as `#174ED4` for readable links and `#515D76` for muted text are deliberate derived colors, not new logo gradient stops. White on Electric Blue has approximately 4.54:1 contrast; the darker link tone is used on pale surfaces.

The same semantic variables feed buttons, forms, cards, and the assistant. Both existing light and dark theme states are supported. Spacing, radius, and motion remain adjustable through the existing base tokens. The homepage's scoped `cx83-home-*` classes also live in the brand stylesheet.

## Assets

`public/brand/cx83-labs-hero.avif` is the existing banner selected by Mike. Its bytes, source path, and aspect ratio are unchanged by the October 9 homepage pass. Next.js already permits this asset in `next.config.js`; preserve that configuration.

The Studio package includes separate light and dark SVG logo treatments. The header still uses the existing text site name in this first pass; no replacement artwork or imitation logo font has been introduced. Do not treat the custom logo lettering name in Studio tokens as an installable webfont.

## Type and editing

The existing Geist fonts remain in use until website typography is approved. No new font or component dependency was installed.

Edit the homepage tagline, overview, and contact email in Payload Site settings. Edit service names, summaries, descriptions, and calls to action in the Services collection. The homepage reads published services. Published projects appear automatically; the homepage hides the work section when none exist rather than displaying a development placeholder.

The headline, section structure, process explanation, and presentation are currently maintained in `src/app/(frontend)/page.tsx`. No schema migration was needed for this pass.
