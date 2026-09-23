# PATHCLOCK Studionet 61999 deployment runbook

## 0. Preflight

Do not deploy until all of these are true:

- target is `studionet`, not `studio-dev`;
- `genlayer network info` reports chain ID `61999` and RPC `https://studio.genlayer.com/api`;
- the active wallet is funded with test GEN;
- all contracts lint and generate schema;
- Direct Mode and source-invariant tests pass;
- frontend typecheck/build pass;
- a measured fee profile has been generated for deploy, freeze, review, child message and configure paths.

## 1. Deploy RemediationRegistry

Deploy `contracts/RemediationRegistry.py`. Wait to `FINALIZED`, verify successful execution, record tx/address.

## 2. Deploy ReleaseAuthority

Deploy `contracts/ReleaseAuthority.py` from the intended administrator wallet. Wait to `FINALIZED`, verify successful execution, record tx/address.

## 3. Deploy PatchReviewEngine

Constructor arguments:

1. registry address
2. authority address

Wait to `FINALIZED`, verify successful execution, record tx/address.

## 4. Bind the engine once

Call on `ReleaseAuthority`:

```text
configure_review_engine(<PatchReviewEngine address>)
```

This is irreversible in the current design. Check every address before signing. Wait to `FINALIZED` and reread `get_config()`.

## 5. Canonical live proof

Use public evidence created specifically for the demonstration. It should be stable and safe for validators to fetch. Freeze one remediation spec, wait for it to finalize, then submit one candidate review.

The review should show:

- frozen spec exists in final state;
- candidate review transaction enters consensus;
- `ACCEPTED` is shown as provisional;
- lifecycle eventually permits `Finalize`, and finalization is submitted if required;
- parent review reaches `FINALIZED` with successful execution;
- its triggered child transaction to `ReleaseAuthority` is tracked to successful completion;
- `get_authorization_for_review(reviewKey)` becomes non-empty;
- `/proof/[reviewKey]` displays the durable final record without a wallet.

Also run at least one negative/inconclusive proof where evidence is unavailable or contradictory and confirm no authorization is minted.

## 6. Populate frontend

Create `web/.env.local`:

```env
NEXT_PUBLIC_REGISTRY_ADDRESS=0x...
NEXT_PUBLIC_REVIEW_ENGINE_ADDRESS=0x...
NEXT_PUBLIC_RELEASE_AUTHORITY_ADDRESS=0x...
NEXT_PUBLIC_GENLAYER_RPC_URL=https://studio.genlayer.com/api
NEXT_PUBLIC_GENLAYER_CHAIN_ID=61999
NEXT_PUBLIC_GENLAYER_EXPLORER=https://explorer-studio.genlayer.com
```

## 7. Vercel

- project root: `web`
- framework: Next.js
- copy the same `NEXT_PUBLIC_*` variables into Vercel;
- deploy;
- smoke-test in a fresh/private browser session;
- test wrong network, disconnected wallet, rejection, transaction error, accepted/provisional, finalization and public proof.

## 8. Source/deployment parity

The source commit submitted to reviewers must be the exact source corresponding to the three deployed addresses and the Vercel deployment. Do not change contract source after canonical deployment without redeploying and updating the manifest.
