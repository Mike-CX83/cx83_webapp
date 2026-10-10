# CX83 website visual integration plan

October 10, 2026. Status: proposed implementation sequence. Mike has approved the banner appearance and requested this plan. No website integration or deployment is performed by this document.

## Page placement

### Homepage

Keep the homepage focused on what CX83 does and what a visitor can do next.

1. **Banner and introduction.** Install the approved responsive banner, preserving the original central artwork and the existing headline, description and contact invitation.
2. **Real demonstration.** Keep “Your website. Your AI. Just ask.” and the existing video. Add a brief “Software in development” product label and a link to `/software/connected-websites`. The demonstration is real; the label describes product availability. Keep the video controls, optional captions, transcript and evidence link.
3. **Connection overview.** Replace the current three service summary cards with the approved overview image and a short introduction. Suggested heading: “Your tools. Working together.” Suggested supporting sentence: “Explore a few ways AI, automation and software can connect the tools your business already uses.” Include one link: **Explore the connections**, pointing to `/how-it-works#examples`.
4. **Short process.** Retain the existing three practical steps. Remove the repeated How it works link here when the overview supplies that destination.
5. **Contact invitation.** Retain the existing closing invitation and contact link.

This keeps five main homepage sections. The three detailed connection images belong on How it works, rather than adding three more homepage sections. The Services page remains available in navigation and retains its service content.

### How it works

Use the existing page as the home for the overview's deeper examples. Do not add another navigation item or create a competing page.

Open with a plain language explanation, followed by an `examples` section containing the approved **Customers**, **Marketing** and **Operations** visuals. Give each visual a short explanation of the business problem, the possible connection and the useful result. Keep the examples consistent with the actual image labels.

Use this clear qualification near the examples: “Example connections. We choose and test tools for each client.” These are possibilities, not claims that every displayed integration is available, configured or proven for every business. Begin with the ChatGPT examples already discussed. Other AI providers can be added as capabilities are established.

Place the current detailed SystemsMap after the examples, inside an optional “Explore the technical details” disclosure. Preserve its useful permissions and control information, keyboard access and existing `system-map` anchor. Retain ownership, costs, the historical real proof section and its `real-proof` anchor, questions and contact invitation. Simplify introductory wording without removing the actual boundaries or misrepresenting historical evidence as a new test.

### Software

Keep the existing Software page and navigation label. Link the homepage video to the existing **Connected websites** product route, `/software/connected-websites`, where product scope and development status can be explained in more detail. Preserve Client Brand Studio and its development status. A separate “Software in Development” page is unnecessary.

## Approved assets and responsive treatment

The source packages are preserved on `design/connection-visuals-20261010`:

* `design/responsive-banner/v1/`: approved assembled banner, unchanged original AVIF, extended atmosphere, reusable CSS, previews and verification evidence.
* `design/connection-visuals/v1/`: overview and three detailed PNGs, provenance notes and generation manifest.

For the banner, use the approved layered treatment: proportional original artwork in front, full width atmosphere behind it. Do not stretch or redraw the logo. Reuse the preview's tested sizing and blending. The original banner source remains preserved.

For connection images, deliver optimized website copies while retaining the full source images in the design package. Use the approved images at readable desktop sizes. On phones, accompany the image with concise, live text showing the same branches and outcomes, with an optional enlarged view. Visitors must not have to read tiny labels to understand the page. Provide meaningful alternative text and reserve image dimensions to prevent layout shifts.

Generated vendor marks in the concept images are representations. Where a native diagram is implemented later, use authentic sourced vendor icons and live labels. A fully interactive connection builder is a later enhancement, not required for this first integration.

## Implementation order and acceptance

1. Recheck repository HEAD, current handoff and the authorized project inbox. Bring this design work forward onto the current staging baseline without overwriting unrelated changes.
2. Integrate the approved banner and the homepage overview replacement. Review the resulting page length and visual balance.
3. Add the three examples to How it works, move technical depth below them, and connect the video to its Software page.
4. Check 320, 390, 768, 1440, 2560 and 3440px layouts. Confirm full width banner atmosphere, complete proportional logo, no horizontal overflow, readable explanations, keyboard access and working links. Verify video playback, captions, transcript, navigation, Cat and contact behavior remain functional.
5. Run the repository's relevant type, lint, integration, browser and build checks. When implementation is requested, deliver through the existing protected staging workflow and independently verify the deployed application commit and protected access. Record results, screenshots and remaining issues in the existing implementation handoff.

This plan leaves video audio and embedded footage graphics as a separate media follow-up. It does not change mail authorization, visitor permissions, production release status or the approved underlying artwork.

## Planning checkpoint

Inspected design branch HEAD: `0e68d7468647b3937d07dbe5412836a6eb7e2fea`.

Remote staging branch observed during planning: `1d791ebfbb745053a1c3e612f22142021fe1b769`. This is repository state, not a fresh claim about the running deployment.

Next action: implement this page arrangement when Mike requests the website update, starting with the approved banner and homepage overview.
