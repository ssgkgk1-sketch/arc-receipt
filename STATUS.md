# Verification — 2026-10-11 KST

## Current status (supersedes the pre-deployment notes below)

The user deployed ReceiptAnchor at 0xb7477307e1333af78d0adcb19c26a2a5528cb28b, transaction 0x4fa411a5be33bbf91f0be1b2fcbf48fa6f06af30ed0eb52125466095613b048f. Rechecked via https://rpc.mainnet.arc.io and https://rpc.drpc.mainnet.arc.io: chain 5042, successful receipt, transferred value zero, creation and runtime bytecode exact matches to the local build. This is a bounded code/transaction check, not a wallet-wide security audit. The local wallet server on 5190 remains stopped. Public static checker excludes deployment and wallet operations. Current tests: 25 Node tests and 6 Solidity tests pass. Application has NOT been submitted. Browser automation cannot initialize on this host (sandbox helper error), so browser UI verification and authenticated form submission remain unverified.

## Historical pre-deployment notes

- Node tests: 21 passed, 0 failed.
- Solidity tests: 6 passed, 0 failed; fuzz test ran 256 inputs.
- Live read-only Arc mainnet health query: chain 5042, block 25264880.
- Public RPC gas price at check: 20,000,001,003 atomic USDC / gas.
- eth_estimateGas for compiled ReceiptAnchor creation, value 0, sender omitted: 0x259df gas. This is a preliminary simulation, not a final wallet quote. Re-estimate with actual sender and current fee before signing. Funding/bridge fees excluded.
- No transaction sent. No wallet connected. No keys accessed. No grant application submitted.
- Synthetic demo is clearly labeled. Local standard-EVM contract tests do not validate Arc runtime specifics. A live end-to-end payment and anchoring demo remains outstanding.
- Mainnet deployment requires a user-controlled compatible wallet, signing by the user, and a final fee quote. Preserve the USD 5 total spending ceiling unless explicitly revised.
- Remaining submission work: public repository, live accessible product/demo, real project deployment/transaction evidence, user contact email and DoraHacks submission.
