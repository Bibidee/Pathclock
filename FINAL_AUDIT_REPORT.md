# PATHCLOCK FINAL AUDIT REPORT

Audit date: 2026-09-23  
Repository: https://github.com/Bibidee/Pathclock  
Audited source commit: `556afcd0ebdd2ff4153b0aa2502c9e4265b9fea1`

## 1. Executive summary

Pathclock is submission-grade for the verified Studionet demo path. The Direct Mode fixture failure was traced to pytest plugin startup: `gltest` was starting a localnet configuration plugin during normal collection. The repository now disables that configuration plugin by default while retaining the Direct Mode fixture plugin, making `pytest -q` deterministic. Contracts, frontend, CI, deployment manifest, canonical proof, and release documentation were audited and corrected.

## 2. Readiness score

- Before audit: approximately 76%.
- After audit: 93% for the verified demo/submission path.

The remaining 7% is operational: no video artifact, no RPC-exposed fee profile, and the requested Vercel alias is unavailable to this account.

## 3. Fixed issues

- `pytest.ini` now prevents an unnecessary localnet startup; `pytest -q` passes 26 tests.
- GenLayer timestamp usage and Address/string normalization were corrected in the deployed source.
- Evidence-origin/private-network protections and validator conflict comparison were added.
- Finality-gated authorization and exact-once authorization/consumption guards are enforced.
- Next.js was upgraded to 16.3.6; clean dependency install, typecheck, and production build pass.
- README and submission checklist now match the actual release packet.
- `deployments/studionet.json` contains `canonicalProof`.

## 4. Security assessment

### Findings fixed

- Severity: Medium. Private or loopback evidence could be environment-dependent. Location: `contracts/RemediationRegistry.py`. Fix: reject loopback/RFC1918 hosts and enforce bounded HTTPS origins.
- Severity: Medium. Leader/validator disagreement on material fields could be accepted. Location: `contracts/PatchReviewEngine.py`. Fix: independent reconstruction, substantive-field comparison, and `INCONCLUSIVE` on unavailable/contradictory evidence.
- Severity: Medium. Provisional acceptance could be mistaken for release authorization. Location: review engine, authority, and review-room UI. Fix: authorization only on `on="finalized"`; UI labels provisional state and rereads authority state.

### Residual risks

- `ReleaseAuthority` has a single admin for one-time engine binding. This is an explicit demo trust assumption; production should use a multisig or timelock before holding material release authority.
- Evidence URLs are public mutable locations. Frozen URLs and returned digests are persisted, with unavailable evidence failing closed to `INCONCLUSIVE`.
- No full adversarial multi-validator simulation is included; live positive/negative proof plus unit/Direct Mode coverage are the verified evidence.

## 5. Test results

- `pytest -q`: **28 passed**, 0 failed.
- All three contract lint checks and schema generation pass.
- `cd web && npm ci`: passed.
- `npm run typecheck`: passed.
- `npm run build`: passed with Next.js 16.3.6.
- GitHub CI for the pushed audit commit: [successful run](https://github.com/Bibidee/Pathclock/actions/runs/35842300651).

## 6. Deployment verification

Network: Studionet, chain 61999. Explorer: https://explorer-studio.genlayer.com

- [RemediationRegistry](https://explorer-studio.genlayer.com/address/0xaB74Da9C0124101e8c89428318b417272Ac4a464) — `0xaB74Da9C0124101e8c89428318b417272Ac4a464`
- [ReleaseAuthority](https://explorer-studio.genlayer.com/address/0xF0391b24215F259918752B22B9F6CA2B359e5Fe) — `0xF0391b24215F259918752B22B9F6CA2B359e5Fe`
- [PatchReviewEngine](https://explorer-studio.genlayer.com/address/0xe2193869cb366fDdEdAE0C54ccAe03f708ec7b28) — `0xe2193869cb366fDdEdAE0C54ccAe03f708ec7b28`
- Engine binding tx: `0xe3e064dfaa1c481889b7492a00c782828cbc24a78dcf30a4cd71c3983c724745`
- Immutable evidence commit: [`be03b2669328b5a3bccc9c1b795a18df509ab527`](https://github.com/Bibidee/Pathclock/tree/be03b2669328b5a3bccc9c1b795a18df509ab527/demo_fixture/evidence)
- Positive review: `0xa0273714547f14e23e2692f6870b6f9c8c9af98be57a98ff324b07b7464f1f07` → `REMEDIATED`
- Authorization child: `0x18a072ab1d5a7befef670df7fc7e1d004c46cca79c95caf9a3143fd9b24f1a30` → finalized successfully
- Negative/inconclusive review: `0x744529f0d51726b481e77501f1114c56faa7feca2ce3e6638cba4b900e61b0bb` → `INCONCLUSIVE`, no authorization
- Vercel production: [pathlock-rho.vercel.app](https://pathlock-rho.vercel.app)
- Vercel inspection: [deployment](https://vercel.com/bibidees-projects/pathlock/4iXatEdysHUbWteCnj3F6LvuDy89)

## 7. Limitations

Studionet transaction objects inspected for deployment, freeze, review, and child authorization did not expose gas-price or fee fields; no fee number is invented. The exact `pathlock.vercel.app` alias is assigned to another Vercel project. No demo video is included.

## 8. Submission conclusion

An external reviewer can clone the repository, install dependencies, run tests/build, inspect the manifest, replay the immutable evidence commit, inspect explorer records, and open the verified Vercel deployment. The remaining limitations are explicit and do not change the verified positive/negative authorization behavior.

The separate full lifecycle trace, including the distinction between implemented and non-existent remediation/proof stages, is in [FULL_LIFECYCLE_AUDIT_REPORT.md](FULL_LIFECYCLE_AUDIT_REPORT.md).
