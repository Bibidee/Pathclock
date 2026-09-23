# PATHCLOCK FULL LIFECYCLE AUDIT REPORT

Audit date: 2026-09-23  
Repository: https://github.com/Bibidee/Pathclock  
Audited commit: `8698e62ab7421964948d537c9b1a6921882f85a2`

## Scope and conclusion

This audit traced the implemented Pathclock lifecycle and exercised the available local and live evidence. The verified architecture is:

```text
freeze_spec → review_candidate → FINALIZED verdict
                              └→ finalized child authorize
                                 → consume_authorization
                                 → public proof lookup
```

The requested “remediation registration” is not a separate contract transition in this repository. Candidate evidence is submitted to `review_candidate`; a `REMEDIATED` finalized result creates the authority record. Likewise, `canonicalProof` is an off-chain deployment-manifest record, not an on-chain contract object. Those are design facts, not silently inferred lifecycle steps.

## Stage-by-stage findings

| Stage | Function / state change | Validation and abuse resistance | Evidence | Status |
|---|---|---|---|---|
| Review creation | `PatchReviewEngine.review_candidate`; stores immutable review record and increments count | Bounded IDs/fields, frozen spec lookup, unique review key, HTTPS and frozen-origin checks | Live positive and negative reviews; Direct Mode/source tests | Verified |
| Specification freeze | `RemediationRegistry.freeze_spec`; stores spec, policy, origins, digest | One-time spec ID, bounded fields, HTTPS/private-host rejection, immutable storage | Direct tests; live `pc-2026-001` freeze | Verified |
| Evidence submission | Review arguments store advisory/patch/tests/deployment URLs; evaluator fetches text and digests it | URLs must use frozen origins; unavailable sources become `INCONCLUSIVE`; evidence is untrusted prompt data | Live positive/negative transactions; source and origin tests | Verified |
| GenLayer adjudication | `gl.vm.run_nondet_unsafe(evaluate, validator_fn)`; decision fields are persisted | Independent validator fetch/reconstruction and material-field equality; malformed/invalid model output fails closed | Live `REMEDIATED` and `INCONCLUSIVE` reviews; direct/source tests | Verified |
| Verdict finalization | GenLayer transaction reaches `FINALIZED`; review state is durable | Child call is emitted only with `authority.emit(on="finalized")` | Positive child transaction finalized successfully | Verified |
| Remediation registration | No separate function exists; candidate review is the registration boundary | There is no distinct failed-review/remediation object to authorize | Contract inventory confirms absent API | Not applicable to current architecture |
| Release authorization | `ReleaseAuthority.authorize`; stores receipt and digest exactly once | Configured-engine-only sender, valid digest, unique review key, release-owner binding | Live child authorization and Direct Mode negative tests | Verified |
| Authorization consumption | `ReleaseAuthority.consume_authorization`; marks receipt consumed | Release owner only; second consumption rejected | Direct Mode tests cover owner, wrong caller, replay | Locally verified; not consumed on live canonical receipt |
| Canonical proof | `deployments/studionet.json.canonicalProof` and `/proof/[receiptKey]` read final authority state | Proof page derives data from authority/review reads; no mutable client assertion | Manifest, live receipt, public proof implementation | Manifest/UI verified; no on-chain proof object |

## Attack scenarios

| Scenario | Result |
|---|---|
| Empty/short spec, review, candidate, or commit fields | Rejected by bounded validation |
| Duplicate specification or review ID | Rejected; state is not overwritten |
| Private/loopback evidence origin | Rejected by registry/origin guards |
| Evidence unavailable | Produces `INCONCLUSIVE`, no authorization request |
| Prompt injection or claimed verdict inside evidence | Explicitly treated as hostile data in evaluator instructions |
| Leader/validator material disagreement | Validator returns false; transaction cannot finalize as accepted |
| False `REMEDIATED` material checks | Downgraded to `INCONCLUSIVE` |
| Unauthorized engine configuration | Rejected; configuration is one-time |
| Unauthorized authorization call | Rejected; only configured engine may authorize |
| Invalid digest | Rejected |
| Wrong caller consumes receipt | Rejected |
| Double consumption/replayed authorization | Rejected by consumed flag and unique review key |
| Modified frozen spec | No mutation method exists; duplicate ID is rejected |

## Frontend lifecycle review

Verified in code and build: wallet connection/network switching, freeze and review submission, transaction phase/error handling, review polling, provisional-versus-final distinction, evidence inspection, authority-backed public proof, and disconnected proof reads. The frontend does not expose a separate remediation-registration form because the contract does not expose that transition. It also does not expose a consumer action; `consume_authorization` exists in the chain adapter but is not wired to a visible UI control.

## Test evidence

- `pytest -q`: **28 passed**, 0 failed after adding authorization/consumption attack coverage.
- GitHub CI before this test-only commit: contracts and web jobs passed on run [35842661373](https://github.com/Bibidee/Pathclock/actions/runs/35842661373).
- Live positive review: `0xa0273714547f14e23e2692f6870b6f9c8c9af98be57a98ff324b07b7464f1f07` → `REMEDIATED`.
- Live authorization child: `0x18a072ab1d5a7befef670df7fc7e1d004c46cca79c95caf9a3143fd9b24f1a30` → finalized successfully.
- Live negative review: `0x744529f0d51726b481e77501f1114c56faa7feca2ce3e6638cba4b900e61b0bb` → `INCONCLUSIVE`, no authorization.

## Issues and severity

1. **Medium — lifecycle terminology mismatch.** The requested “remediation registration” stage has no distinct state object or function. This is safe for the current automatic authorization architecture, but external reviewers expecting a failed-review → remediation → authorization workflow could misunderstand the model. Recommendation: either document the review as the remediation-registration boundary (current approach) or add a separate remediation record in a future version.
2. **Low — live consumption not exercised.** Consuming the canonical live receipt is an irreversible state change and was not performed. The exact-once, owner-only behavior is directly tested locally.
3. **Low — canonical proof is manifest/UI evidence, not an on-chain proof primitive.** The manifest binds the verified hashes and the UI rereads contract state, but there is no dedicated proof contract.
4. **Low — consumer action is adapter-only.** `consume_authorization` is implemented and tested but not exposed as a user-facing frontend action.

## Scores

- Lifecycle correctness: **86/100** — all implemented transitions are coherent and tested; separate remediation registration and live consumption remain unverified/nonexistent by design.
- Security: **92/100** — strong origin, finality, validator-equivalence, authorization, and consumption controls; single-admin trust remains.
- End-to-end usability: **84/100** — create/review/proof flow works, but remediation registration and consumption are not distinct UI steps.
- Submission readiness: **90/100** — verified deployment and evidence packet are complete, with the limitations above explicitly recorded.

## Final determination

Pathclock’s implemented lifecycle is secure enough for the verified demo and submission packet, but the requested broader lifecycle cannot honestly be called fully reproduced because two requested concepts are not separate implemented transitions and the canonical live authorization was not consumed. This report is intentionally explicit about that boundary.
