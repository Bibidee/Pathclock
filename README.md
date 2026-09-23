# PATHCLOCK

**Consensus-gated security release authorization on GenLayer Studionet (chain 61999).**

PATHCLOCK freezes a concrete remediation requirement, binds a candidate release to public evidence, asks GenLayer validators to independently evaluate whether that candidate satisfies the frozen requirement, and only creates release authority after the review transaction is **FINALIZED**.

The trust model is deliberate: the developer cannot certify their own patch, the customer cannot unilaterally reject a valid remediation, and an ordinary data oracle cannot answer a semantic question such as “does this patch satisfy this frozen security requirement?”

## Network target

| Item | Value |
|---|---|
| Network | GenLayer Studionet |
| Chain ID | `61999` |
| RPC | `https://studio.genlayer.com/api` |
| Explorer | `https://explorer-studio.genlayer.com` |
| Currency | GEN |

**Do not switch this project to Studio-dev 61997.** This handoff is intentionally built for stable Studionet 61999.

## Intelligent-contract system

1. `RemediationRegistry` freezes immutable remediation specifications and source-policy constraints.
2. `PatchReviewEngine` performs the nondeterministic evidence evaluation with an independent validator reconstruction.
3. `ReleaseAuthority` accepts an authorization only from the configured review engine and only through the engine's `on="finalized"` internal message.

The third contract is not decorative. It is the finality boundary. A provisional `ACCEPTED` review cannot create release authority.

## Frontend routes

PATHCLOCK intentionally has only four routes:

- `/`
- `/console`
- `/release/[reviewKey]`
- `/proof/[receiptKey]`

Review creation is a full-screen layer inside `/console`. Evidence inspection is an in-place drawer inside `/release/[reviewKey]`. There is no dashboard/sidebar/account/protocol/new/evidence/finality route family.

## Frontend clean-room rule

The frontend was designed as a clean-room implementation. **No JSX, CSS, route hierarchy, component architecture, layout system, copy pattern, branding treatment, or reusable frontend code from any repository under `github.com/ometere123` may be copied into PATHCLOCK.** See `CLEAN_ROOM_FRONTEND.md`.

## Local setup

Python 3.12+ is recommended for GenLayer testing tooling.

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python -m py_compile contracts/*.py
pytest -q
genvm-lint check contracts/RemediationRegistry.py
genvm-lint check contracts/PatchReviewEngine.py
genvm-lint check contracts/ReleaseAuthority.py
```

Frontend:

```bash
cd web
npm ci
npm run typecheck
npm run build
npm run dev
```

The frontend builds even before live addresses are filled, but contract reads/writes are intentionally blocked with a clear configuration message until deployment addresses are supplied. The checked-in [`deployments/studionet.json`](deployments/studionet.json) records the fresh deployment from contract-source commit `b511b057fcdaf46c161a767c76431925029affe8`; do not replace these addresses without a fresh deployment.

## Deployment

The verified Studionet deployment is recorded in `deployments/studionet.json`. It was made with an unlocked funded account on chain 61999; deployment and proof transactions are linked there. Do not replace those addresses without redeploying and updating the manifest.

Use:

```bash
genlayer network set studionet
genlayer network info
```

Then deploy the three contracts in the order documented in `DEPLOYMENT_RUNBOOK.md`, bind the engine into `ReleaseAuthority`, prove a real end-to-end review, and place the resulting addresses in `web/.env.local` and `deployments/studionet.json`.

## Submission rule

A transaction being `ACCEPTED` is **not** product success. PATHCLOCK should display provisional acceptance as provisional. The completion condition is:

1. review transaction reaches `FINALIZED`;
2. review execution succeeded;
3. finality-triggered child authorization executes successfully;
4. frontend rereads durable contract state;
5. `ReleaseAuthority` returns the release authorization.

See `SUBMISSION_CHECKLIST.md` and `MEGA_PROMPT_FOR_AGENT.md` before submission.

## Included canonical demo fixture

`demo_fixture/` contains a small synthetic vulnerable baseline, candidate patch and evidence documents. After the final repository commit exists, use:

```bash
python scripts/demo_urls.py --owner <github-owner> --repo <repo> --commit <full-sha>
```

to generate immutable raw evidence URLs for the live proof. Replace the deployment-evidence commit placeholder before submitting a real review.

## Build verification performed in this handoff

The verified checks for contract-source commit `b511b057fcdaf46c161a767c76431925029affe8` are `pytest -q` (77 passed), Python byte-compilation, `npm ci`, `npm run typecheck`, `npm run build`, and GenVM lint/SDK-backed validation for all three contracts using GenVM `v0.6.0-rc6` (newer-runner advisory only). GitHub Actions runs [35918896660](https://github.com/Bibidee/Pathclock/actions/runs/35918896660) and [35921670524](https://github.com/Bibidee/Pathclock/actions/runs/35921670524) passed. Live Studionet deployment and both positive and negative proof outcomes are in the manifest and [`FINAL_AUDIT_REPORT.md`](FINAL_AUDIT_REPORT.md). The web app is live at [pathlock-rho.vercel.app](https://pathlock-rho.vercel.app); its four routes return HTTP 200, and the app's GenLayer SDK/RPC read returned the expected proof data. The requested `pathlock.vercel.app` domain remains inaccessible to the linked team. No measured fee profile is claimed; the wallet remains the final fee quote before signing.
