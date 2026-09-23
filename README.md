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
pytest tests/direct -q
```

Frontend:

```bash
cd web
cp .env.example .env.local
npm install
npm run typecheck
npm run build
npm run dev
```

The frontend builds even before live addresses are filled, but contract writes/reads are intentionally blocked with a clear configuration message until deployment addresses are supplied. This handoff includes a local ignored `web/.env.local` containing the verified Studionet addresses; production hosting variables are not included.

## Deployment

The verified Studionet deployment is recorded in `deployments/studionet.json`. It was made with an unlocked funded account on chain 61999; do not replace those addresses without redeploying and updating the manifest.

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

The frontend dependency lockfile is committed. `npm run typecheck` and the exact CI command `npm run build` pass for the web project. Python 3.12, the pinned GenLayer packages, and `genvm-lint` are installed in `.venv`; all unit and Direct Mode tests pass, and all contract lint checks pass. The three corrected contract sources are deployed and finalized on Studionet and the engine binding is finalized; the live addresses and transaction hashes are in `deployments/studionet.json`. Canonical positive/negative evidence transactions, a source commit SHA, measured fee profile, CI link, and Vercel deployment remain unpopulated rather than being invented.
