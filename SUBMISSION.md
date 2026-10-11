# Arc Microgrants submission reference — submitted, under review

On 2026-10-11 KST, the user showed DoraHacks confirmation for ArcReceipt and a build card marked "Under Review". This file preserves the prepared application text; it does not independently verify every form field or claim an award.

Project name: ArcReceipt

Builder alias: CHOI

Public builder profile: https://github.com/ssgkgk1-sketch

Contact email: enter privately in the official form (not committed here).

Public repository: https://github.com/ssgkgk1-sketch/arc-receipt

Live checker: https://ssgkgk1-sketch.github.io/arc-receipt/ (confirm published before submitting).

Mainnet deployment: https://explorer.arc.io/address/0xb7477307e1333af78d0adcb19c26a2a5528cb28b

Deployment transaction: 0x4fa411a5be33bbf91f0be1b2fcbf48fa6f06af30ed0eb52125466095613b048f

## Two sentences

ArcReceipt is an experimental, read-only USDC payment reconciliation tool for small merchants and freelancers that checks an expected recipient and amount without connecting a wallet. It handles Arc's native and ERC-20 event streams without double counting, separates gas fees, exports JSON reports, and includes a deployed non-custodial report-hash registry.

## What does it use Arc for?

The checker queries Arc mainnet receipts and blocks and interprets the canonical 18-decimal USDC system events. ReceiptAnchor is deployed on Arc mainnet and can store immutable publisher-scoped report digests; anchoring is optional and no anchor interaction is claimed in the demo. This is an early prototype, not a cryptographic payment proof or audited financial service.

## Applicant declarations — must be confirmed, not invented

- Previous Arc deployments before this project: awaiting applicant answer.
- Prior Circle/Arc funding for this project: none received through this assisted workflow; applicant must confirm any outside history.

## Additional information

AI-assisted development using OpenAI/Codex desktop. 25 JavaScript tests and 6 Solidity tests passed; Solidity tests use a standard local EVM. Synthetic examples are explicitly labeled. No production users, revenue, security audit, or end-to-end mainnet payment/anchor test is claimed. Grant selection is at the organizer's discretion.
