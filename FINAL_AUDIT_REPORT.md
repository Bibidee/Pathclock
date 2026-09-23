# PATHCLOCK FINAL RELEASE STATUS

Audit date: 2026-09-23  
Repository: https://github.com/Bibidee/Pathclock  
Baseline commit: `6a9e4f851ee81006f53df82e27364d1805a40843`
Current source: uncommitted working-tree changes; no final source SHA exists yet.

## Release decision

**Submission ready: NO.** This pass improves frozen evidence-policy enforcement, origin validation, behavioral Direct Mode coverage, and authorization-consumption UX. Contract sources changed, which supersedes the historical deployment. A clean local build and tests do not replace fresh Studionet deployments/proofs, GitHub CI on the final commit, or a production Vercel build from that commit.

## Verified locally

- `pytest -q`: **77 passed**, 0 failed (20 unit + 57 Direct Mode).
- Python byte-compilation: all three contract files pass.
- `cd web && npm ci`: passed (251 packages installed).
- `npm run typecheck`: passed.
- `npm run build`: passed; routes generated for `/`, `/console`, `/release/[reviewKey]`, `/proof/[receiptKey]`.
- `genvm-lint check`: **passed for all three contracts** using GenVM `v0.6.0-rc6`; advisory: a newer runner is available.
- GitHub CI: **not run on these changes**. Local `gh auth status` reports the configured token is invalid.
- Vercel: **not deployed from these changes**. Vercel CLI is authenticated as `bibidee`, but inspection confirms the requested `pathlock.vercel.app` domain is inaccessible under the linked team; the current project alias is `pathlock-rho.vercel.app`.

## Historical live evidence (not evidence for current modified contracts)

`deployments/studionet.json` records the prior deployment and positive/negative proof transactions from source commit `556afcd0ebdd2ff4153b0aa2502c9e4265b9fea1`. Those records remain historical facts only. Because this pass changes `RemediationRegistry.py` and `PatchReviewEngine.py`, all three contracts must be redeployed as one new set, rebound, and re-proved before those addresses can represent this source. No new live transaction has been sent in this pass.

The previously recorded Vercel URL `https://pathlock-rho.vercel.app` is likewise not verified against the current source commit. Do not cite the old CI run or deployment inspection as current release evidence.

## Security work in this pass

- Freeze-time and evaluation-time evidence policy is bounded to version 1 and exactly four supported categories: advisory, patch, tests, deployment.
- Evidence origin parsing rejects credentials, custom ports, IPv6 literals, malformed/internal/single-label hosts, trailing-dot hostnames, and selected non-public IPv4 ranges; normalized origins are compared exactly.
- Direct Mode exercises outcome reconstruction, hostile/missing/conflicting evidence, invalid origins, validator disagreements, replay/identity cases, and finality-only authorization behavior.
- Authorization consumption now has an owner/network guard, SDK-supported write simulation preflight, finality state display, and post-finalization authority reread. The owner wallet is expected to present the actual fee before signing; this code does not claim a measured fee estimate.

## Remaining release blockers

1. Commit the finished source and documentation; record the final SHA.
2. Redeploy registry, authority, and engine; configure the new engine; verify each transaction is FINALIZED.
3. Produce fresh immutable positive and negative/inconclusive proofs plus a deterministic disallowed-origin failure proof; optionally exercise consumption on a second positive review.
4. Restore GitHub authentication, push the final commit, and verify its CI run.
5. Decide whether to use the accessible `pathlock-rho.vercel.app` alias or restore access to `pathlock.vercel.app`; deploy `web` from the final source SHA and verify all public routes and wallet/network states.
6. Update the deployment manifest and this report with only those fresh, independently checked values.

No readiness percentage is assigned while these gates remain open. The detailed stage mapping is in [FULL_LIFECYCLE_AUDIT_REPORT.md](FULL_LIFECYCLE_AUDIT_REPORT.md).
