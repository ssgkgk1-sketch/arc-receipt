# ArcReceipt

Read-only Arc mainnet USDC payment reconciliation for small merchants and freelancers. The public checker and CLI require no wallet connection, key, signing, token allowance, or npm dependency. A separate local-only deployment utility in web/ requests user signatures; it is not published with the public checker and its server is stopped.

## Run (Node 24+)

```sh
npm test
npm run demo
npm run health
node cli.mjs verify TX_HASH RECIPIENT USDC_AMOUNT [EXPECTED_SENDER]
```

Amounts are plain decimal strings. Output is JSON. Exit codes: 0 matched/demo/health, 2 not matched/pending/reverted, 1 invalid data or RPC error. Demo data is synthetic and is not a real payment.

On machines with a managed HTTPS root certificate, use `node --use-system-ca cli.mjs verify ...`. Never disable TLS verification. The health script already uses the system CA store. In explicitly configured proxy environments Node 24 also supports `--use-env-proxy`.

## Optional report anchoring (deployed)

Arc mainnet contract: `0xb7477307e1333af78d0adcb19c26a2a5528cb28b`.
Deployment transaction: `0x4fa411a5be33bbf91f0be1b2fcbf48fa6f06af30ed0eb52125466095613b048f`.
Creation input and runtime bytecode matched the Solidity build on the official primary and dRPC endpoints. The user signed the deployment, with transferred value zero. No report-anchor interaction is claimed.

ReceiptAnchor stores a SHA-256 digest of an offchain report, scoped to the caller and transaction hash. It is an immutable publisher claim, NOT proof that the payment happened or a global invoice-use registry. The publisher can lie: anyone verifying a claim must independently rerun payment verification. No funds are accepted, no approval requested, no external calls made. Do not publish confidential invoice fields onchain; hashes of predictable documents are not encryption.

Contract unit tests: `forge test --offline` (Solidity 0.8.18 must be installed). These tests run on a standard local EVM, NOT an Arc simulation. Arc-specific runtime integration must still be checked before a real deployment. No deployment/signing command is provided yet.

## Why Arc-specific?

Arc emits native USDC Transfer events at 18 decimals and ERC20 mirror events at 6 decimals. We count only the canonical native emitter, preserving integer precision and avoiding double counting. Fees are separate (gasUsed * effectiveGasPrice), not subtracted from recipient transfers. Mint/burn are not accepted as invoice payments. We conservatively require the recipient's net incoming amount within the transaction to meet the expected amount. Optional sender matches the event's sender, not necessarily the transaction signer (routers can differ).

## Trust and limitations

Uses the official public RPC over HTTPS. The RPC operator sees requested hashes and client IP. There is no telemetry or file upload. Receipt and block consistency checks are not cryptographic proofs against a malicious RPC. Only current mainnet event format is supported. No invoice database or reuse protection: merchants must uniquely assign a transaction/log set to each invoice themselves. No identity, AML, tax, chargeback, or security guarantee. MATCHED means only this transaction meets the supplied amount/address criteria. Never use this prototype alone to release valuable goods.

## Grant status

Contract deployed by the user. On 2026-10-11 KST, the user showed DoraHacks "Build Submitted" confirmation and ArcReceipt marked "Under Review" for Arc Microgrants | Circle. This confirms submission, not selection or funding; no grant has been secured. Mainnet signatures belong to the user. Do not enter seed phrases or keys. No further spending is necessary for the read-only checker. Build static checker with `node build-site.mjs`; publish docs/ only, never the local deployment UI.

AI-assisted implementation: OpenAI / Codex desktop. Exact runtime model identifier not independently verified. No paid API used by this project.

## Official references

- https://docs.arc.io/arc/references/usdc-system-events
- https://docs.arc.io/arc/references/connect-to-arc
- https://docs.arc.io/arc/references/evm-differences
- https://dorahacks.io/hackathon/arc-microgrants/detail
