# Submission checklist — verified state

Only claims supported by the current repository, CI, or live Studionet evidence are marked complete.

## Validity and GenLayer fit

- [x] Three contract sources are present and readable.
- [x] Studionet chain 61999 deployment addresses and source commit are recorded.
- [x] The live frontend reaches the actual contracts; no mock integration is presented as live.
- [x] README explains the semantic remediation problem and GenLayer's role.
- [x] Review outcome has a consequential effect: finality-gated release authorization.
- [x] No centralized backend decides the verdict.

## Contract quality

- [x] Leader and validator fetch/reconstruct the frozen evidence independently.
- [x] Validators compare substantive decision-bearing fields.
- [x] Evidence-unavailable or contradictory input becomes `INCONCLUSIVE`.
- [x] Evidence is treated as hostile data; origins are frozen and bounded.
- [x] Evidence digests are persisted.
- [x] `REMEDIATED` cannot survive a false material check.
- [x] Finality-gated authorization and exact-once guards are proven live.

## Engineering

- [x] `pytest -q`: 26 passed.
- [x] Contract lint and schema generation pass.
- [x] `npm ci`, `npm run typecheck`, and `npm run build` pass.
- [x] Lockfiles, deployment manifest, and `canonicalProof` are committed.
- [x] GitHub CI is green.
- [x] No secrets are in source or client configuration.

## Frontend / UX

- [x] Clean-room route and interaction constraints pass repository invariants.
- [x] Provisional acceptance, finality, reread, public proof, wrong-network, fee estimate, and mobile states are represented.

## Live evidence packet

- [x] Vercel production and inspection URLs.
- [x] Three explorer contract links.
- [x] Positive review and authorization child transactions.
- [x] Negative/inconclusive review transaction.
- [x] Immutable evidence commit, source commit SHA, and CI run link.

## Explicit limitations

- No demo video is included in this repository.
- Studionet RPC responses did not expose gas-price or fee fields, so no measured fee number is claimed.
- `pathlock.vercel.app` is owned by another Vercel project; the verified production URL is recorded in `FINAL_AUDIT_REPORT.md`.
