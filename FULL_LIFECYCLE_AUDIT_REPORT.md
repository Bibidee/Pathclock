# PATHCLOCK full lifecycle verification status

Audit date: 2026-09-23  
Baseline source commit: `6a9e4f851ee81006f53df82e27364d1805a40843`
Current pass: uncommitted working-tree changes. Historical chain evidence below is from the previously deployed source commit and does not verify these changes.

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

The old manifest records positive review `0xa0273714547f14e23e2692f6870b6f9c8c9af98be57a98ff324b07b7464f1f07`, successful authorization child `0x18a072ab1d5a7befef670df7fc7e1d004c46cca79c95caf9a3143fd9b24f1a30`, and inconclusive review `0x744529f0d51726b481e77501f1114c56faa7feca2ce3e6638cba4b900e61b0bb`. These must not be represented as evidence for the modified contract source. No fresh review, child, adversarial origin, or consumption transaction was sent during this pass.

## Remaining release gates

1. Commit the final source and documentation.
2. Deploy all three contracts from that commit, bind the engine, and verify finalized deployment/binding receipts.
3. Create fresh positive, negative/inconclusive, and disallowed-origin proofs; optionally demonstrate one-time consumption on a separate positive review.
4. Run CI for that exact commit and deploy the `web` directory to Vercel from the same source SHA.
5. Verify public routes, correct/wrong wallet/network, provisional/final states, evidence inspection, proof rereads, and consumption UX against the fresh deployment.

The single-admin engine binding, mutable public evidence URLs, and lack of an on-chain canonical-proof primitive remain design/trust assumptions and should be disclosed to reviewers.
