# Branding bridge

The CX83 brand system is unfinished. Do not edit `brand_studio` from this website project.

## Where values go

All lasting color, type, radius, shadow, and layout tokens are in `src/app/(frontend)/globals.css` inside `:root`.

| Token | Current value | Status |
| --- | --- | --- |
| `--cx83-primary` | `#101216` | Supplied in `brand_studio/projects/cx83-labs/client-spec.json` |
| `--cx83-secondary` | `#3d4450` | Temporary |
| `--cx83-accent` | `#8a8175` | Temporary |
| `--cx83-background` | `#f7f6f3` | Temporary |
| `--cx83-surface` | `#ffffff` | Temporary |
| `--cx83-text` | `#101216` | Uses the supplied primary |
| `--cx83-muted` | `#5c6370` | Temporary |
| `--cx83-border` | `#e4e0d8` | Temporary |
| `--cx83-radius` | `0.75rem` | Temporary |
| `--cx83-shadow` | soft shadow using `16 18 22` | Temporary |
| `--cx83-container` | `72rem` | Temporary |
| `--cx83-motion` | `180ms` | Temporary |

shadcn variables such as `--primary`, `--background`, and `--border` point at those tokens. Components should use the shadcn or `cx83-*` utilities, not new hex values.

The public site stays on the light token set. Dark theme variables remain in the same file for a later brand decision.

## Assets

Put approved files in `public/brand/`:

- `logo.svg`
- `icon.svg`
- `og.png` at 1200 by 630

The header in `src/components/site/SiteHeader.tsx` currently renders the site name as text. Replace that wordmark with `logo.svg` after the mark is approved.

## Type

`src/app/(frontend)/layout.tsx` loads Geist Sans and Geist Mono as temporary fonts. Geist is the open source font shipped by the Payload template. Replace those font loaders, then point `--font-sans` and `--font-mono` in `globals.css` at the approved families. Do not add a paid font.

## Buttons, cards, and chat

Buttons use `src/components/ui/button.tsx`. Cards and sections use the border, surface, and radius tokens. The assistant panel uses the same tokens, so a brand update in `:root` changes the chat with the rest of the site.
