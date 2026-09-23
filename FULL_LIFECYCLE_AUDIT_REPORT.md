# PATHCLOCK full lifecycle verification status

Audit date: 2026-09-23  
Baseline source commit: `6a9e4f851ee81006f53df82e27364d1805a40843`
Current pass: validator-variance fix in progress. Historical chain evidence below does not verify the current source.

## Lifecycle model

```text
freeze_spec → review_candidate → FINALIZED verdict
                              └→ finalized child authorize
                                 → consume_authorization
                                 → public proof lookup
```

There is no separate “remediation registration” transition: a candidate is registered through `review_candidate`, and a qualifying finalized review triggers authorization. `canonicalProof` is a deployment-manifest/public-page reference, not an on-chain proof object.

## Current local evidence

The Direct Mode suite now exercises substantive evaluation paths: all verdict classes, unavailable and contradictory sources, missing policy inputs, hostile/prompt-injection evidence, malformed and unsupported model results, false material checks, identity/replay conditions, validator disagreement on outcomes/material fields/digests, and finality-triggered authorization boundaries. The current whole suite passes 77 tests (20 unit, 57 Direct Mode).

The frontend clean install, typecheck, and optimized build pass. Consumption UI is now visible only to the release owner on the expected network; it simulates the call, delegates the exact fee display to the wallet before signature, shows transaction phases, and rereads authority state after finality. These are local/code verification facts, not a live verification of the current contracts.

Both AST lint and SDK-backed GenVM validation pass for all three contracts using GenVM `v0.6.0-rc6`; the linter notes a newer runner is available. No current GitHub CI run exists for this uncommitted tree.

## Historical live evidence — prior source only

The previous manifest records positive, child-authorization, and inconclusive proofs for the older contract set; those are historical and not evidence for the current source. A new-source positive attempt `0x3a752e0e38439adb3b49354839600cb95d25ae60a1f18756d3d201bb8cd5a0fd` finalized as `MAJORITY_DISAGREE`; public state reads returned no review or authority record. It must not be described as a successful positive or negative review. No positive proof exists yet for the current source.

## Remaining release gates

1. Commit the final source and documentation.
2. Deploy all three contracts from that commit, bind the engine, and verify finalized deployment/binding receipts.
3. Create fresh positive, negative/inconclusive, and disallowed-origin proofs; optionally demonstrate one-time consumption on a separate positive review.
4. Run CI for that exact commit and deploy the `web` directory to Vercel from the same source SHA.
5. Verify public routes, correct/wrong wallet/network, provisional/final states, evidence inspection, proof rereads, and consumption UX against the fresh deployment.

The single-admin engine binding, mutable public evidence URLs, and lack of an on-chain canonical-proof primitive remain design/trust assumptions and should be disclosed to reviewers.
