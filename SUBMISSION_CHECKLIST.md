# Submission checklist

## Validity gate

- [ ] Three contract sources are present and readable.
- [ ] Canonical Studionet addresses exist on chain 61999.
- [ ] Deployed source matches the submitted repository commit.
- [ ] Live frontend reaches the actual contracts.
- [ ] No mock/simulated contract integration is presented as live.

## GenLayer fit

- [ ] README explains the conflicting incentives and why a normal oracle cannot deterministically answer the semantic remediation question.
- [ ] Review outcome has a consequential effect: release authorization.
- [ ] `ReleaseAuthority` cannot be reached from provisional frontend state.
- [ ] No centralized AI/backend decides the verdict.

## Contract quality

- [ ] leader fetches actual frozen evidence;
- [ ] validator independently fetches/reconstructs actual evidence;
- [ ] validator compares substantive decision-bearing fields;
- [ ] evidence-unavailable path is `INCONCLUSIVE`;
- [ ] evidence content is treated as hostile data;
- [ ] source origins are frozen/bounded;
- [ ] evidence manifest/digests are persisted;
- [ ] REMEDIATED cannot survive with a false material check;
- [ ] finality-gated child message proven live;
- [ ] exact-once authorization and consumption tests pass.

## Engineering

- [ ] fresh clone installs;
- [ ] Python tests pass;
- [ ] contract lint passes;
- [ ] schema generation passes;
- [ ] web typecheck/build pass;
- [ ] lockfiles committed after final install;
- [ ] deployment manifest complete;
- [ ] measured fee profile committed;
- [ ] CI green;
- [ ] no secrets in source/client bundle.

## Frontend / UX

- [ ] only `/`, `/console`, `/release/[reviewKey]`, `/proof/[receiptKey]` routes;
- [ ] creation stays inside `/console`;
- [ ] evidence inspection stays inside review room;
- [ ] wallet is an unobtrusive identity chip;
- [ ] wrong-network flow is understandable;
- [ ] fee estimate shown before signature;
- [ ] ACCEPTED explicitly says provisional/not final;
- [ ] FINALIZED requires successful execution;
- [ ] final state is reread before release authorization is shown;
- [ ] public proof works disconnected;
- [ ] mobile is intentionally composed, not a squeezed desktop table;
- [ ] clean-room similarity audit against `ometere123` frontends passes.

## Live evidence packet

- [ ] Vercel URL
- [ ] demo video
- [ ] three explorer contract links
- [ ] canonical positive review tx
- [ ] triggered authorization child tx
- [ ] negative/inconclusive review tx
- [ ] source commit SHA
- [ ] CI run link
