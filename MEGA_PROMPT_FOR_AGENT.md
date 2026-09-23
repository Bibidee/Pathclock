# PATHCLOCK finishing-agent mega prompt

You are taking over a near-complete GenLayer project called **PATHCLOCK** from an extracted ZIP. Your job is to finish it to a submission-ready standard without changing its product thesis, network, route architecture, or clean-room frontend constraint.

## Non-negotiable target

- Network: **GenLayer Studionet**
- Chain ID: **61999**
- RPC: `https://studio.genlayer.com/api`
- Explorer: `https://explorer-studio.genlayer.com`
- Do **not** switch to Studio Dev / chain 61997.
- Use the injected EIP-1193 browser wallet only. No WalletConnect, Snaps, server key, embedded private key, custodial signer, hidden backend signer, or centralized adjudication endpoint.
- `ACCEPTED` is provisional. Never present it as final product success.
- Release authority is complete only after the review reaches `FINALIZED`, execution succeeds, the finality-triggered child authorization transaction succeeds, and `ReleaseAuthority.get_authorization_for_review(reviewKey)` returns the durable receipt.

## First, read these files in full

1. `README.md`
2. `ARCHITECTURE.md`
3. `CLEAN_ROOM_FRONTEND.md`
4. `DEPLOYMENT_RUNBOOK.md`
5. `SUBMISSION_CHECKLIST.md`
6. all three files in `contracts/`
7. all frontend code in `web/`

Do not begin by redesigning. The architecture is deliberate.

## Critical clean-room frontend rule

PATHCLOCK must never reuse frontend code or imitate route/layout/component structures from any repository under `github.com/ometere123`.

Do not copy JSX, CSS, design tokens, global header/footer patterns, sidebars, operations rails, wallet components, transaction notices, card/ledger/dossier patterns, route families, wording, or page composition from those repos.

Locked public route graph:

```text
/
/console
/release/[reviewKey]
/proof/[receiptKey]
```

Do not add `/dashboard`, `/account`, `/protocol`, `/new`, `/reviews`, `/releases`, `/evidence`, `/consensus`, `/finality`, or `/settings`.

Review creation stays inside `/console` as a composition layer. Evidence inspection stays inside `/release/[reviewKey]` as an in-place drawer.

## Phase 1: establish the exact toolchain

Use the current repository pins as the starting point:

- `genlayer-js` exactly `1.1.8`
- `genlayer-py` v0.18 baseline in `requirements.txt`
- `genlayer-test` v0.29 baseline
- current GenVM linter

Before changing syntax, consult the official current GenLayer docs/SDK reference and confirm compatibility with Studionet 61999. Do not blindly migrate to Studio-dev-only RC APIs.

Record exact final versions in README and lockfiles.

## Phase 2: contract lint/schema/test hardening

Run:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
pytest tests/unit -q
genvm-lint check contracts/RemediationRegistry.py
genvm-lint check contracts/PatchReviewEngine.py
genvm-lint check contracts/ReleaseAuthority.py
pytest tests/direct -q
```

Then generate/verify schemas using the official CLI/runtime path.

Fix any current-SDK incompatibility you find, but preserve these invariants:

### RemediationRegistry

- specs are immutable once frozen;
- each spec binds owner, repository, advisory, exact security requirement, baseline, evidence policy, allowed origins and digest;
- HTTPS/public-source constraints remain bounded;
- no method may edit a frozen spec.

### PatchReviewEngine

- source-dependent review uses actual validator-side web fetches;
- evidence is hostile data, never instructions;
- leader and validator independently fetch/reconstruct evidence;
- validator compares the **substantive decision-bearing fields**, not only JSON shape/enum validity;
- fields include at least outcome, requirement satisfaction, candidate identity, regression tests, patch consistency, deployment consistency, source availability and evidence digest;
- REMEDIATED is impossible if any material check is false or an evidence conflict remains;
- evidence-unavailable/insufficient paths do not default to success or failure: preserve `INCONCLUSIVE`/consensus disagreement safely;
- persist bounded evidence/source commitments;
- never let LLM output choose arbitrary GEN values or addresses;
- all storage writes and contract messages remain outside nondeterministic functions.

### ReleaseAuthority

- configure engine once only;
- only configured review engine can authorize;
- authorization exact-once per review;
- authorization consumption exact-once;
- only recorded release owner can consume;
- review engine emits authorization **on finalized**, never on accepted.

### Direct Mode coverage to add/finish

The ZIP includes baseline tests. Expand them substantially. Include at minimum:

- freeze/read spec;
- duplicate spec;
- malformed URL/private origin;
- duplicate origin;
- overlong fields;
- review for nonexistent spec;
- evidence origin outside frozen allowlist;
- candidate binding;
- successful REMEDIATED path with coherent mocked evidence;
- NOT_REMEDIATED path;
- PARTIAL path;
- unavailable evidence path;
- prompt-injection text inside evidence;
- contradictory evidence;
- malformed LLM response;
- leader/validator substantive disagreement;
- leader says REMEDIATED while one material field false -> reject/downgrade;
- evidence digest mismatch -> validator rejection;
- duplicate review key;
- unauthorized authority caller;
- one-time authority configuration;
- duplicate authorization;
- wrong release owner consumption;
- double consumption;
- multiple specs/reviews sharing contracts without state bleed;
- any async/finality message invariant the Direct Mode runner can test.

Do not create a `tests/conftest.py` that imports/initializes GenLayer contract runtime or loader code. Keep test setup from being mis-discovered as deployable contract source.

## Phase 3: frontend verification and hardening

Run:

```bash
cd web
npm install
npm run typecheck
npm run build
npm run dev
```

Commit the generated `package-lock.json`.

The frontend must remain visually and structurally unique. It is a forensic security-release workstation, not a Web3 dashboard.

Verify:

- `/` is a focused product entry, not a long feature-marketing page;
- `/console` is the release queue and contains the full-screen create flow;
- `/release/[reviewKey]` is the single canonical review room;
- `/proof/[receiptKey]` is public/read-only and works disconnected;
- no sidebar/operations rail;
- no account page;
- no protocol page;
- no raw-ID-heavy UX;
- contract hashes/addresses live under technical detail, not primary product flow;
- mobile is intentionally composed;
- wallet is a small identity chip;
- wrong-network handling explicitly switches/adds Studionet 61999;
- every write estimates fees when supported;
- wallet rejection is understandable;
- transaction status visibly progresses through signature, submitted, consensus, provisional accepted, ready/finalization, finalized, execution verification, state reread;
- `ACCEPTED` visibly says **provisional / not final / no release authority yet**;
- after finalization, reread contract state before showing success;
- if the child authorization has not executed yet, show “waiting for release authority”, not success;
- `UNDETERMINED` gets its own safe state and does not collapse into failure or success.

If current GenLayerJS exposes `canAppeal`, minimum appeal bond, appeal transaction, transaction monitoring, child transaction IDs, or a more accurate READY_TO_FINALIZE status than the handoff code currently uses, integrate those official APIs carefully. Do not invent statuses.

## Phase 4: deploy to Studionet 61999

Do not deploy until lint/schema/tests/build are green.

Use a funded account and verify the CLI/network reports **61999** before every deployment session.

Deploy in this order:

1. `RemediationRegistry.py`
2. `ReleaseAuthority.py`
3. `PatchReviewEngine.py` with registry + authority constructor addresses
4. `ReleaseAuthority.configure_review_engine(PatchReviewEngine)` once

Wait for each deployment/configuration transaction to be truly `FINALIZED` with successful execution.

Populate `deployments/studionet.json` with real addresses and transaction hashes. Record source commit SHA. Do not invent anything.

## Phase 5: create a canonical live evidence fixture

Create a small public evidence set in the repository or another stable public source that validators can fetch. It must be safe, deterministic enough for demonstration, and clearly bind:

- frozen advisory/security requirement;
- vulnerable baseline;
- candidate commit/version;
- patch diff or patch explanation tied to the candidate;
- regression-test evidence;
- deployment/artifact identity tied to the same candidate.

Do not use `example.com` placeholders in the final live proof.

Run one positive end-to-end review and one negative/inconclusive review.

For the positive proof, capture:

- spec-freeze tx;
- review tx;
- provisional accepted observation;
- finalization tx if manual finalization is required;
- finalized successful review receipt;
- finality-triggered child authorization tx;
- final `ReleaseAuthority` state;
- public proof URL.

For the negative/inconclusive proof, prove that no release authority is created.

## Phase 6: prove the finality boundary

This is one of the strongest parts of the project and must be demonstrated, not only claimed.

Show that while the review is merely `ACCEPTED`, `ReleaseAuthority.get_authorization_for_review(reviewKey)` is empty.

Then after the parent becomes `FINALIZED` and the child message executes, show that the authorization exists.

If current Studionet internal-message semantics differ, fix implementation to preserve this exact trust property using official supported finality mechanics.

## Phase 7: Vercel

Set Vercel project root to `web`.

Set:

```env
NEXT_PUBLIC_REGISTRY_ADDRESS=0x...
NEXT_PUBLIC_REVIEW_ENGINE_ADDRESS=0x...
NEXT_PUBLIC_RELEASE_AUTHORITY_ADDRESS=0x...
NEXT_PUBLIC_GENLAYER_RPC_URL=https://studio.genlayer.com/api
NEXT_PUBLIC_GENLAYER_CHAIN_ID=61999
NEXT_PUBLIC_GENLAYER_EXPLORER=https://explorer-studio.genlayer.com
```

Deploy production and test in a clean private browser session.

Do not use a backend or Vercel server function as an authoritative state/adjudication layer.

## Phase 8: clean-room similarity audit

Before final submission, compare PATHCLOCK route graph, component tree, CSS vocabulary and screenshots against existing `github.com/ometere123` frontend projects. The purpose is only to detect accidental similarity.

If PATHCLOCK has drifted toward those frontends, redesign the overlapping section. Do not copy from them during this audit.

## Phase 9: submission evidence

Update README and `deployments/studionet.json` with only verified facts.

Prepare:

- Vercel production URL;
- repository URL;
- source commit;
- CI run;
- 3 contract explorer links;
- canonical positive review tx;
- finalization tx if any;
- authorization child tx;
- negative/inconclusive review tx;
- concise demo steps;
- short demo video.

The demo should visibly show:

1. connect wallet;
2. freeze security requirement;
3. submit candidate evidence;
4. consensus running;
5. `ACCEPTED` shown as provisional;
6. finalization;
7. release authority appearing only after finality;
8. public `/proof/[receiptKey]` opened disconnected.

## Stop conditions

Do not call the project submission-ready if any of these remain:

- wrong network or 61997 anywhere in live configuration;
- schema generation failure;
- contract source differs from deployment source;
- validator only checks output format;
- REMEDIATED can survive a false material check;
- evidence URL can escape frozen origins;
- accepted is treated as final;
- release authority appears before parent finality;
- browser write path unproven;
- public proof relies on localStorage;
- frontend build/typecheck fails;
- live Vercel app points at stale addresses;
- mock data is shown as live state;
- clean-room rule violated.

When finished, return a compact release report containing exact commit SHA, network, three contract addresses, each deployment/config tx, canonical proof transactions, Direct Mode pass count, CI link, Vercel URL, and any remaining limitations. Do not hide limitations.
