# CX83 website demonstration media (Phase 2)

This directory is deliberately missing public media binaries until the genuine existing v2 files can be retrieved and reviewed. Do not substitute a stock video, a generated mockup, or a retyped logo.

Required source files from Mike's CX83 Labs Library:

1. `CX83_Website_Showcase_v2.mp4` (source Library size: 7,487,167 bytes)
2. `CX83_Website_Showcase_Poster_v2.jpg` (source Library size: 362,476 bytes)
3. Original or accurately created English timed captions, reviewed against the video. Do not invent speech or onscreen actions.

Place verified copies at:
`public/showcase/cx83-website-showcase-v2.mp4`
`public/showcase/cx83-website-showcase-poster-v2.jpg`
`public/showcase/cx83-website-showcase-v2.en.vtt`

The v2 poster was inspected in the owner's Library on October 9, 2026. It has a Midnight background, real geometric CX83 symbol with custom CX83 LABS lettering, the tagline "Your website. Your AI. Just ask.", and three annotated screenshots (Before, The Request, After). The original MP4 and ZIP are indexed in the Library but their binary bytes were not accessible to the current connector session. Do not claim video was viewed, downloaded, approved or deployed.

Before adding binary assets:
1. Verify authenticity and rights, inspect actual media frames and any branding issues.
2. Use ffprobe to check dimensions, duration, codec, bitrate, audio and rotation.
3. Trim only unwanted phone status bars or secrets if authorized and retain actual screen evidence.
4. Remove any private credentials, tokens or patient/client details.
5. Generate captions/transcript accurately from the inspected video.
6. Record SHA256 checksum of each media file and source.
7. Run the Phase 2 Playwright tests, typecheck, lint and production build.
8. Confirm player works with touch, keyboard, sound off and reduced motion.

The current Phase 2 branch is a source implementation draft. The media guard tests are expected to fail until the files are genuinely supplied. Do not merge this PR or deploy the media player while these requirements remain unresolved.

Related context: `docs/CX83_WEBSITE_BRAND_SYSTEM_CONTEXT.md`, GitHub issue #10.
