# Submission checklist — current working-tree state

Only claims supported by the current repository, CI, or live Studionet evidence are marked complete.

## Validity and GenLayer fit

- [x] Three contract sources are present and readable.
- [ ] Fresh Studionet deployment addresses match the final contract source commit. Historical deployment is recorded but superseded by source changes in this pass.
- [ ] Public frontend deployment is built from the final source commit and verified against the current contracts.
- [x] README explains the semantic remediation problem and GenLayer's role.
- [x] Review outcome has a consequential effect: finality-gated release authorization.
- [x] No centralized backend decides the verdict.

## Contract quality

- [x] Leader and validator fetch/reconstruct the frozen evidence independently.
- [x] Validators compare substantive decision-bearing fields.
- [x] Evidence-unavailable or contradictory input becomes `INCONCLUSIVE`.
- [x] Evidence is treated as hostile data; frozen origins are normalized and checked against internal/non-public forms.
- [x] Evidence digests are persisted.
- [x] `REMEDIATED` cannot survive a false material check.
- [ ] Finality-gated authorization and exact-once guards are proven on the new deployment (historical proof exists for previous source).

## Engineering

- [x] `pytest -q`: 77 passed (20 unit + 57 Direct Mode).
- [x] SDK-backed GenVM validation passes for all three contracts (GenVM `v0.6.0-rc6`; a newer runner is available).
- [x] `npm ci`, `npm run typecheck`, and `npm run build` pass.
- [ ] Final source SHA, lockfiles, and updated deployment manifest are committed.
- [ ] GitHub CI is green on the final source SHA (current CLI credential is invalid).
- [x] No secrets are in source or client configuration.

## Frontend / UX

- [x] Clean-room route and interaction constraints pass repository invariants.
- [x] Provisional acceptance, finality, reread, public proof, wrong-network, wallet fee confirmation, and mobile states are represented in code.
- [ ] Latest consumption flow is verified against live Studionet contracts.

## Live evidence packet

- [ ] Vercel production build is deployed from the final source SHA.
- [ ] Three fresh contract deployment links and binding transaction.
- [ ] Fresh positive review and finalized authorization child transaction.
- [ ] Fresh negative/inconclusive review with no authorization.
- [ ] Immutable evidence commit, final source SHA, and current CI run link.

## Explicit limitations

- GitHub CLI authentication was invalid during this pass; final push/CI verification remains pending.
- Vercel CLI is authenticated, but `pathlock.vercel.app` is not accessible to the linked account; choose an accessible production domain before final deployment.
- No measured fee profile is claimed. The connected wallet must present the fee quote before signing.
