# PATHCLOCK Final Audit Report

Audit date: 2026-09-23  
Repository: [Bibidee/Pathclock](https://github.com/Bibidee/Pathclock)
Contract-source commit: `b511b057fcdaf46c161a767c76431925029affe8`

## Executive summary

The two contract fixes are committed, pushed, and passed GitHub Actions. A fresh Studionet deployment from that source is finalized and correctly bound. A positive review finalized as `REMEDIATED`, its finality-triggered authorization child finalized, and a public read confirmed the authorization receipt. An unavailable-evidence review finalized as `INCONCLUSIVE`; a public authority read returned no record. A localhost/private-origin submission finalized at consensus level but its contract execution returned `ERROR`, with no review or authorization record. This is the expected rejection, not an accepted review.

The remaining release gate is public website publication/verification. The Vercel project is configured with the fresh public contract addresses, but the requested `pathlock.vercel.app` hostname is inaccessible to the linked Vercel account. The project’s existing production hostname is `pathlock-rho.vercel.app`; a final deploy and route checks are pending. No measured fee profile is claimed.

**Submission readiness: not yet complete.** The verified contracts and CI are submission-quality, but the production site has not yet been rebuilt against this deployment and live-checked.

## Before and after

- Before: approximately 76% readiness (prior handoff estimate; not an independently measured score).
- After engineering and chain verification: 90%+ for contract/test readiness; overall submission remains gated on the production website verification below. A single overall percentage would overstate completion.

## Changes and security assessment

- Freeze-time and evaluation-time policy is limited to version 1 and the four supported evidence categories.
- Evidence origin parsing rejects malformed, credential-bearing, custom-port, private/internal and selected non-public hosts; origins are normalized and compared.
- Direct Mode tests cover outcome reconstruction, missing/unavailable/contradictory evidence, hostile evidence, invalid origins, identity/replay cases, validator variance, and finality-gated authorization.
- Validator agreement compares decision-bearing fields, not free-form explanatory prose, avoiding false disagreement where validators reach the same substantive verdict.
- Authorization consumption has owner/network guards, SDK-supported write simulation, wallet fee confirmation, transaction phases, and a post-finality state reread.
- Trust limitation: one administrator configures the engine once. There is no multisig or timelock. This is documented as a deployment trust assumption rather than adding unnecessary governance machinery.

No confirmed critical/high severity exploitable issue remains in the reviewed code. Public evidence URLs are external inputs and remain subject to upstream availability and content permanence; the demo is pinned to an immutable Git commit. Protocol consensus and the connected wallet remain trust dependencies.

## Reproducible checks

- `pytest -q`: **77 passed** (20 unit, 57 Direct Mode).
- Python byte-compilation: all three contracts pass.
- `cd web && npm ci && npm run typecheck && npm run build`: passed; four intended routes generated.
- GenVM AST lint and SDK-backed validation: all three contracts pass with GenVM `v0.6.0-rc6`; tooling reports a newer runner is available.
- GitHub CI for `b511b057fcdaf46c161a767c76431925029affe8`: [run 35918896660](https://github.com/Bibidee/Pathclock/actions/runs/35918896660), successful.

## Studionet deployment and proofs

Network: GenLayer Studionet, chain 61999. The full manifest is [deployments/studionet.json](deployments/studionet.json).

| Contract | Address | Deployment transaction |
|---|---|---|
| RemediationRegistry | [`0xB3d62b86B191973Db48FD3571a2ff5E59F846e28`](https://explorer-studio.genlayer.com/address/0xB3d62b86B191973Db48FD3571a2ff5E59F846e28) | [`0xe6d957eb3c671e3b77e831f84571b605b6b55a4f34016afaa59bf20c5197be39`](https://explorer-studio.genlayer.com/tx/0xe6d957eb3c671e3b77e831f84571b605b6b55a4f34016afaa59bf20c5197be39) |
| ReleaseAuthority | [`0x95E5445aA3Cc026889B024DecF2AA54B116dABeb`](https://explorer-studio.genlayer.com/address/0x95E5445aA3Cc026889B024DecF2AA54B116dABeb) | [`0x96081b17098af78eec8edc13f3c20b09b52be75b8166fe294271d67f76b48f51`](https://explorer-studio.genlayer.com/tx/0x96081b17098af78eec8edc13f3c20b09b52be75b8166fe294271d67f76b48f51) |
| PatchReviewEngine | [`0x496ef0315E3E4ac5810B7E1cB6045e1FEa6501Cf`](https://explorer-studio.genlayer.com/address/0x496ef0315E3E4ac5810B7E1cB6045e1FEa6501Cf) | [`0x2d538c1fd7a7953584bacf37855436b8e0a733e11724fed5c2b5ec213271e7d3`](https://explorer-studio.genlayer.com/tx/0x2d538c1fd7a7953584bacf37855436b8e0a733e11724fed5c2b5ec213271e7d3) |

Binding transaction: [`0x0df8aac9654fe2b465e9194678e05686d0030768655cfc7b1fc0ef210e0041f7`](https://explorer-studio.genlayer.com/tx/0x0df8aac9654fe2b465e9194678e05686d0030768655cfc7b1fc0ef210e0041f7). Public config read confirms `configured=true`, the engine address matches, and authorization count is 1.

- Frozen spec `pc-2026-b511`: [`0x2c6c37db21e629150f25e00e87089b81d71a8fe1f13389fcb4019da1b3629a0c`](https://explorer-studio.genlayer.com/tx/0x2c6c37db21e629150f25e00e87089b81d71a8fe1f13389fcb4019da1b3629a0c).
- Positive review `positive-2026-b511-001`, `REMEDIATED`: [`0xf692ffc18d720f0ba57c227c70033cc1bf64ec388b69b7ca4a199a769d107b8a`](https://explorer-studio.genlayer.com/tx/0xf692ffc18d720f0ba57c227c70033cc1bf64ec388b69b7ca4a199a769d107b8a). Finality child: [`0x3dc23ab330b7b66f2c66ffeedba9352689e4369d67e6d1f4e0a315f00b217a36`](https://explorer-studio.genlayer.com/tx/0x3dc23ab330b7b66f2c66ffeedba9352689e4369d67e6d1f4e0a315f00b217a36). Authorization receipt key `11fc2ae18cd2193cf9c834952884a95cbc718f3f1279ac4dc7d1050822a85375`; state confirms unconsumed.
- Negative/inconclusive `inconclusive-2026-b511-001`: [`0xe974c7532f6d7335e7c405a5524a588a3ce37050dfb9d5b9983a5fee8ff8596e`](https://explorer-studio.genlayer.com/tx/0xe974c7532f6d7335e7c405a5524a588a3ce37050dfb9d5b9983a5fee8ff8596e). Durable verdict is `INCONCLUSIVE`; authority lookup is empty.
- Disallowed-origin attempt: [`0xd15a41e6fc6b7aa825ca935243f309ebffc1c28abad8cecfc97dabb0a30e99e4`](https://explorer-studio.genlayer.com/tx/0xd15a41e6fc6b7aa825ca935243f309ebffc1c28abad8cecfc97dabb0a30e99e4). The transaction reached consensus, but contract execution returned `ERROR` on the private `127.0.0.1` URL. No review or authorization was created.

Evidence fixture is pinned to immutable source commit `b511b057fcdaf46c161a767c76431925029affe8`. The public review and authorization reads were confirmed directly through Studionet RPC.

## Deployment status and remaining risk

- Requested website domain: [pathlock.vercel.app](https://pathlock.vercel.app) is not accessible under the linked Vercel account. Do not claim it as the app URL unless domain access/assignment is fixed.
- Existing project production alias: [pathlock-rho.vercel.app](https://pathlock-rho.vercel.app). Fresh deployment using the updated contract addresses and public route checks are pending.
- The public proof page previously encountered transient RPC `Failed to fetch`; that route must be rechecked after the fresh deploy and reported if it recurs.
- Fees: no measured fee profile is available from the transaction records used here; the connected wallet is the final source for fee presentation.
- Consumption: canonical positive authorization remains unconsumed; the consumption UI is code-reviewed but no live consume transaction was sent.

## Final decision

Contract and CI evidence: verified. Full submission readiness: **NO, pending production Vercel redeploy and public route/live proof-page verification**. Update this report and the handoff status only after that check; then tag the final release commit and attach the final URL.
