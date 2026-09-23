# PATHCLOCK full lifecycle verification

Audit date: 2026-09-23  
Contract source commit: `b511b057fcdaf46c161a767c76431925029affe8`

## Lifecycle model

```text
freeze_spec → review_candidate → FINALIZED verdict
                              └→ finalized child authorize
                                 → consume_authorization
                                 → public proof lookup
```

There is no separate remediation-registration transition: a candidate is submitted through `review_candidate`. Only a qualifying review that reaches finality triggers authorization. `canonicalProof` is a manifest/public-page reference, not an on-chain proof object.

## Live Studionet checks

- Registry, authority, and review engine deployed and finalized; binding transaction finalized and state read confirms the authority is configured with the current engine.
- Frozen requirement `pc-2026-b511` references evidence at the immutable contract-source commit.
- Positive review `positive-2026-b511-001` finalized as `REMEDIATED`, with all material checks true and no evidence conflicts. Its authorization child finalized; public state returns receipt key `11fc2ae18cd2193cf9c834952884a95cbc718f3f1279ac4dc7d1050822a85375`, unconsumed.
- Inconclusive review `inconclusive-2026-b511-001` finalized as `INCONCLUSIVE` when three required sources were unavailable; public authority lookup returned empty.
- Private-origin review using `https://127.0.0.1/...` reached consensus but contract execution returned `ERROR`; no review or authorization exists for that key.
- Authority count is 1, matching the single positive review.

Transaction hashes and contract addresses are in [`deployments/studionet.json`](deployments/studionet.json). Review transactions can be looked up at `https://explorer-studio.genlayer.com/tx/<hash>`.

## Automated checks

- `pytest -q`: 77 passed (20 unit and 57 Direct Mode).
- All three contract sources pass GenVM AST lint and SDK-backed validation on GenVM `v0.6.0-rc6` (tool advisory: a newer runner is available).
- Frontend clean install, typecheck, and production build pass.
- GitHub CI for commit `b511b057fcdaf46c161a767c76431925029affe8`: [run 35918896660](https://github.com/Bibidee/Pathclock/actions/runs/35918896660), successful.

## Pending external verification

The Vercel environment now contains the fresh public contract addresses, but the production redeploy and public route/proof-page check are still pending. The account’s existing alias is `pathlock-rho.vercel.app`; the requested `pathlock.vercel.app` domain is not accessible to this Vercel team. The proof page also had a prior transient RPC `Failed to fetch`, so reliability must be checked on the fresh build. No consume transaction or measured fee profile is claimed.

The one-time administrator configuration, mutable evidence hosting, off-chain consensus/provider availability, and wallet/RPC availability remain trust assumptions. The canonical positive authorization was deliberately preserved unconsumed.
