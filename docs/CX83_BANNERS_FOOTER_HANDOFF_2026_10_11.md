# Interior banners and footer refinement

Owner authorization: October 11, 2026, 6:43 PM CDT. Protected staging only.
Starting and recovery revision: dc1d818ed87c3651d793041690ea0ed552fc8c2b.
Branch: chatgpt/interior-banners-footer-2026-10-11.

## Current scope

This direction supersedes earlier banner/footer design notes for these surfaces only.
Preserve the homepage and About top banners, original assets, all copy and destinations, Cat, CMS records and application behavior.
Interior banners use the existing blue (#246bff) and violet (#8247f5) at restrained opacity over midnight (#080e22).
Desktop shared banner content has a 21rem minimum height and aligned headings; height can grow for longer content. Mobile uses natural height and consistent 2rem padding.
Footer uses deep violet #211337 through indigo #11182f to midnight blue #09233d, a centered 64rem content limit, two navigation columns, outlined email, reduced vertical space, visible focus and reduced motion support.
Original logo size and asset are preserved. Bottom copyright clearance accommodates the existing fixed Cat launcher.

## Route inventory

Shared InteriorHero covers Software, both product details including Client Brand Studio and Connected Websites, Services and its three service details, How it works, Work, both Work detail templates, Contact, Notes, Search and CMS pages using the fallback title banner.
Shared PageHero covers paginated Notes and the missing-page recovery screen.
PostHero now uses the same compact banner baseline instead of its legacy 80vh/negative-margin arrangement, preserving title, categories, author/date and optional artwork.
Current CMS read: one published staging-check page with the fallback InteriorHero, no published articles. No records were written, removed or published for this change.
Homepage and About hero markup, CSS and asset files are not edited. Shared footer changes apply to both.

## Source and validation

Active stylesheet: src/app/(frontend)/cx83-banners-footer.css, imported once from the frontend root layout. Selectors explicitly exclude cx83-about-refined and do not target homepage/header/Cat.
Runtime changes: shared stylesheet/import, footer markup for decorative icons, article hero class hooks and removal of its obsolete outer top padding.
Existing automated coverage remains intact. Focused banner/footer checks cover nine static index/detail/utility routes at 390 and 1440 pixels, title placement, no horizontal overflow, footer target size, keyboard focus and navigation. Service banner geometry runs inside the existing isolated service fixture suite, which covers all three detail routes at both widths. Existing fixture suites exercise CMS, Work and article templates and existing About/Home preservation assertions.
Screenshot names use the existing interior-* artifact pattern. Full required Staging gate and deployed visual verification are pending at this implementation checkpoint. No passing check or deployment is claimed here.

## Avoiding repeated work

Use the connected GitHub app because local shell DNS cannot resolve github.com. The older desktop checkout contains unrelated changes and is untouched.
Submit the complete change once before PR CI. Let that run finish; rerun only for actual failures or changes. The existing workflow independently validates the merged staging revision before building/deploying its image; do not bypass it.
Do not make documentation-only staging commits merely to record CI status: they trigger another complete build/deploy. Attach the final exact SHA/workflow/visual receipt to the PR and established project mailbox thread thr-3d5ad289.
If interrupted, resume the existing branch/PR and its current workflow instead of recreating the work.
