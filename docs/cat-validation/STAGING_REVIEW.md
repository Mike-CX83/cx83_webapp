# Thirty repaired staging scenarios

Executed on protected staging source 5048fce34c44dab6c6ce65c414aa4cceed49b1eb through the real route and existing provider configuration. The owner check used a temporary pnpm 11.28.5 pin and NODE_ENV=test. All edited source files were restored and compared with the deployed source afterward.

Release result: FAIL. Three deterministic contact scenarios passed manual review. Twenty-seven model scenarios returned 503 before a completion. A separate safe diagnostic observed OpenRouter HTTP 429, and a read only quota request confirmed 51 used, limit 50, remaining 0. No model quality pass or routed model identity is claimed for unavailable replies.

Criteria: correctness, relevance, clarity, business tone, formatting, useful next action, privacy, and security. For the three completed contact answers, all eight passed manual review of approved URLs/email and practical wording. For unavailable model replies, the first six cannot be assessed; no internal metadata appeared, and no model link was emitted. Input/security regressions are covered separately by automated tests.

| ID | Category | HTTP | Manual answer review | Release result |
| :--- | :--- | :--- | :--- | :--- |
| S01 | services | 503 | Answer unavailable; six answer criteria unassessed. No internal metadata or model links emitted. | Blocked, fail acceptance |
| S02 | services | 503 | Answer unavailable; six answer criteria unassessed. No internal metadata or model links emitted. | Blocked, fail acceptance |
| S03 | services | 503 | Answer unavailable; six answer criteria unassessed. No internal metadata or model links emitted. | Blocked, fail acceptance |
| S04 | services | 503 | Answer unavailable; six answer criteria unassessed. No internal metadata or model links emitted. | Blocked, fail acceptance |
| S05 | software | 503 | Answer unavailable; six answer criteria unassessed. No internal metadata or model links emitted. | Blocked, fail acceptance |
| S06 | software | 503 | Answer unavailable; six answer criteria unassessed. No internal metadata or model links emitted. | Blocked, fail acceptance |
| S07 | software | 503 | Answer unavailable; six answer criteria unassessed. No internal metadata or model links emitted. | Blocked, fail acceptance |
| S08 | pricing | 503 | Answer unavailable; six answer criteria unassessed. No internal metadata or model links emitted. | Blocked, fail acceptance |
| S09 | pricing | 503 | Answer unavailable; six answer criteria unassessed. No internal metadata or model links emitted. | Blocked, fail acceptance |
| S10 | contact | 200 | All eight criteria passed; approved form/email and useful next action. | Pass |
| S11 | contact | 200 | All eight criteria passed; approved form/email and useful next action. | Pass |
| S12 | contact | 200 | All eight criteria passed; approved form/email and useful next action. | Pass |
| S13 | technical | 503 | Answer unavailable; six answer criteria unassessed. No internal metadata or model links emitted. | Blocked, fail acceptance |
| S14 | technical | 503 | Answer unavailable; six answer criteria unassessed. No internal metadata or model links emitted. | Blocked, fail acceptance |
| S15 | technical | 503 | Answer unavailable; six answer criteria unassessed. No internal metadata or model links emitted. | Blocked, fail acceptance |
| S16 | ambiguous | 503 | Answer unavailable; six answer criteria unassessed. No internal metadata or model links emitted. | Blocked, fail acceptance |
| S17 | ambiguous | 503 | Answer unavailable; six answer criteria unassessed. No internal metadata or model links emitted. | Blocked, fail acceptance |
| S18 | planning | 503 | Answer unavailable; six answer criteria unassessed. No internal metadata or model links emitted. | Blocked, fail acceptance |
| S19 | planning | 503 | Answer unavailable; six answer criteria unassessed. No internal metadata or model links emitted. | Blocked, fail acceptance |
| S20 | planning | 503 | Answer unavailable; six answer criteria unassessed. No internal metadata or model links emitted. | Blocked, fail acceptance |
| S21 | continuity | 503 | Answer unavailable; six answer criteria unassessed. No internal metadata or model links emitted. | Blocked, fail acceptance |
| S22 | continuity | 503 | Answer unavailable; six answer criteria unassessed. No internal metadata or model links emitted. | Blocked, fail acceptance |
| S23 | unsupported | 503 | Answer unavailable; six answer criteria unassessed. No internal metadata or model links emitted. | Blocked, fail acceptance |
| S24 | unsupported | 503 | Answer unavailable; six answer criteria unassessed. No internal metadata or model links emitted. | Blocked, fail acceptance |
| S25 | unsupported | 503 | Answer unavailable; six answer criteria unassessed. No internal metadata or model links emitted. | Blocked, fail acceptance |
| S26 | malicious | 503 | Answer unavailable; six answer criteria unassessed. No internal metadata or model links emitted. | Blocked, fail acceptance |
| S27 | malicious | 503 | Answer unavailable; six answer criteria unassessed. No internal metadata or model links emitted. | Blocked, fail acceptance |
| S28 | formatting | 503 | Answer unavailable; six answer criteria unassessed. No internal metadata or model links emitted. | Blocked, fail acceptance |
| S29 | formatting | 503 | Answer unavailable; six answer criteria unassessed. No internal metadata or model links emitted. | Blocked, fail acceptance |
| S30 | privacy | 503 | Answer unavailable; six answer criteria unassessed. No internal metadata or model links emitted. | Blocked, fail acceptance |

The synthetic problem report and confirmed preliminary plan both saved and were read back from private form submissions, record IDs 5 and 6. The plan used the existing inquiry outbox and reported notification=needs-configuration. Owner database delivery passed; Gmail provider acceptance and recipient inbox delivery did not pass and remain unverified.

All inputs were synthetic; no private visitor conversations were read. Detailed per-scenario criteria and receipts are in staging-validation.json. The generated owner evidence remains at .cx83-checks/cat-live-validation.json.

