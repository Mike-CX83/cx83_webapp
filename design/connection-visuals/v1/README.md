# CX83 website connection visuals

Created October 10, 2026. Four image concepts for Mike's review and website development. Created using the built-in image generation tool. These are saved assets, not a deployed website change. Mike positively reviewed the four visuals and requested durable GitHub storage.

## The direction

Show people, familiar tools and useful outcomes. Start with ChatGPT. Use the established midnight navy, azure, violet and silver palette. Keep each example understandable without explaining the underlying integration technology.

The homepage overview offers three examples. Each companion image follows one branch in more detail. Existing original CX83 logo artwork and the flyer remain unchanged. Ordinary CX83 Labs lettering in the images identifies the service without generating a replacement logo.

| Image | Purpose | Suggested alt text |
| --- | --- | --- |
| cx83-connections-overview.png | Main homepage connection tree | You and your team direct ChatGPT and connected tools. Three example branches connect customer inquiries, marketing content and daily operations to practical business outcomes. |
| cx83-customer-connections.png | Customer branch detail | Example inquiry workflow: WordPress to HubSpot, then team review before a Gmail follow up or Calendar reminder. ChatGPT can help summarize the inquiry and draft a reply. |
| cx83-marketing-connections.png | Marketing branch detail | Example marketing workflow: Google Drive content goes to ChatGPT for a draft, then human review and approval, then Buffer scheduling to Facebook, Instagram and LinkedIn. |
| cx83-operations-connections.png | Operations branch detail | Example operations map: Google Drive, Sheets and Calendar connect to a workspace with ChatGPT assistance, a dashboard and team review of next steps. |

## Homepage placement

Initial suggestion, now under review after Mike's October 10 follow-up: use the overview within the existing What we do section. Introduce it with “Your tools. Working together.” and a short sentence: “See a few ways we can connect the tools behind your business.” Replace some of that section's explanation rather than adding all four images to the main page.

At desktop width the overview provides the complete picture. The three branch images can open from Customers, Marketing and Operations choices, with an optional link into How it works. A future native web implementation can highlight each branch on selection and expose its plain language explanation. Motion should be optional and subtle.

For phones, use one branch at a time with live readable text. Avoid shrinking the complete desktop tree until its labels become tiny. Keep an accessible text description of every image and avoid making app logos the only labels. The eventual page can reproduce the approved layout using actual brand assets and responsive text instead of baking all content into one bitmap.

## Meaning of the connections

These are illustrative systems CX83 could scope, configure and test. They do not claim that all shown apps are native ChatGPT integrations, that a single subscription enables every connection, or that these are deployed customer case studies. Human review precedes outward publishing in the marketing and customer examples. Connected by CX83 Labs describes the intended implementation role.

Actual app support, accounts and actions will be confirmed for each implementation. Google Drive appears in ChatGPT's supported app documentation. Buffer's documentation describes publishing and scheduling across supported social channels. The diagrams synthesize these possibilities with configured business workflows; they are not vendor architecture diagrams.

Primary source checks:

* [Connected apps in ChatGPT](https://help.openai.com/en/articles/11487775-connected-apps-in-chatgpt)
* [Google Drive app and setup](https://help.openai.com/en/articles/10929079-google-drive-app-and-setup-in-chatgpt)
* [Custom MCP apps in ChatGPT](https://help.openai.com/en/articles/12584461-developer-mode-and-full-mcp-connectors-in-chatgpt)
* [Buffer posts and scheduling](https://developers.buffer.com/guides/posts-and-scheduling.html)

## Review and production notes

All four outputs were visually inspected for wording, node connections and major overlaps. Every image is 1536 by 1024 pixels. The generated app symbols are recognizable visual representations; they are not verified original vendor logo files. For the final native page, use the existing sourced logo assets recorded in tmp/pdfs/tool-logos/sources.json and the website's authentic CX83 SVG. This preserves exact artwork and improves small screen rendering.

The overview is the recommended composition for the first homepage version. Marketing is the clearest single workflow example for explaining how the connections work. Customer and operations companions add breadth without expanding the homepage into a long catalog.

The exact generation prompts are saved in generation-prompts.json. Dimensions, file sizes and hashes are in manifest.json. The original generated outputs remain preserved. No website, CMS, repository or deployment was changed during this asset creation step.

Latest proposed next action: use the existing How it works page for the overview and three detailed examples. Keep the real demonstration on the homepage, with concise development-stage context and a link to the relevant Software entry. Mike has requested recommendations, not implementation of these placements. See ../REVIEW-NOTES.md. The website remains unchanged.
