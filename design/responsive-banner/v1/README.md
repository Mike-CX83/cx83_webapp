# CX83 responsive banner, version 1

Created October 10, 2026 at Mike's request. A reusable responsive banner asset package, locally verified and saved for review. No live website files or deployment were changed.

## Files

* `preview.html` and `banner.css`: working responsive banner. Open preview.html in a browser or serve this folder locally.
* `cx83-atmosphere-wide.png`: new 2172 × 724 background plate generated with the built-in image_gen tool from the original banner reference. Requested 3840 × 1280; actual tool output is 2172 × 724, recorded without claiming a larger resolution.
* `cx83-original-banner.avif`: exact copy of the existing 960 × 319 website artwork, including its original logo. Its bytes match the source. Git blob 3afb58548ceed0dab3c814991d5894ce09c16d5a.
* `original-banner-reference.png`: format-converted reference used for the generation tool. This is not a replacement brand master.
* `banner-320.jpg`, `banner-390.jpg`, `banner-768.jpg`, `banner-1440.jpg`, `banner-2560.jpg`, `banner-3440.jpg`: clean browser captures of the assembled banner at those widths.
* `generation-prompt.txt`: exact prompt for the generated background.
* `responsive-checks.json` and `manifest.json`: measured sizes, source integrity and file hashes.

## How it works

The original artwork is a centered foreground image at its original aspect ratio. Its maximum display width is 720 CSS pixels, matching the current website. A generated background extends the blue and violet light and floor reflections across the available width. Only this decorative background fills and adapts to the banner shape. The original logo is never stretched or regenerated.

CSS blends the outer background regions and top edge of the original image into the extended atmosphere. The entire central logo region remains opaque. The responsive wrapper is the reusable banner; the JPGs are convenient static exports, not a substitute for responsive layout.

The selected desktop banner is approximately 239px high. At 390px wide it is approximately 130px high. At 320px wide it is approximately 106px high. The logo stays complete, centered and proportional.

## Validation

Real Chrome layout checked at 320, 390, 768, 1440, 2560 and 3440px. Each measured viewport matched the requested width, all images loaded, banner width equalled available width and there was no horizontal overflow. Original foreground aspect ratio remained 960:319. Phone, desktop and ultrawide renderings were visually inspected for the logo, blend and continuous edge lighting. Original AVIF bytes were compared directly with the repository source and match.

## Next step

Mike reviews this banner. When incorporating it into the website, use the two source layers and CSS, preserve image descriptions and check it inside the actual header/homepage. This package does not change the live banner, navigation, homepage sections or other assets.
