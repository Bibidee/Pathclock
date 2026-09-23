# Submission checklist

## Completed and evidenced

- [x] Three-contract architecture and trust assumptions documented.
- [x] Freeze-time and evaluation-time evidence policy is validated.
- [x] Evidence origin handling rejects private/internal origins and normalizes allowed origins.
- [x] Validator consensus compares decision-bearing values and validates recomputed outcomes.
- [x] Authorization occurs only after finalized eligible reviews; duplicate authorization is rejected.
- [x] `pytest -q`: 77 passed (20 unit + 57 Direct Mode).
- [x] GenVM lint and SDK-backed validation pass for all three contracts with GenVM `v0.6.0-rc6` (newer version advisory).
- [x] `npm ci`, `npm run typecheck`, and `npm run build` pass.
- [x] GitHub CI passes for contract-source commit `b511b057fcdaf46c161a767c76431925029affe8`: [run 35918896660](https://github.com/Bibidee/Pathclock/actions/runs/35918896660).
- [x] Fresh Studionet deployment, authority binding, frozen spec, positive review and finalized child authorization verified. See [`deployments/studionet.json`](deployments/studionet.json).
- [x] Inconclusive review confirmed no authorization; private-origin contract execution fails and creates no review/authorization.
- [x] Public fixture URLs are pinned to the immutable source commit.
- [x] No client-side secrets are required; contract addresses are public configuration.

## Pending before submission

- [ ] Rebuild and deploy `web` to Vercel using the now-updated production contract addresses.
- [ ] Verify the public home, console, review, and proof routes against the fresh deployment; specifically recheck the prior transient proof-page RPC `Failed to fetch`.
- [ ] Record the actual live URL and deployment source SHA. The linked Vercel account’s existing alias is `pathlock-rho.vercel.app`; `pathlock.vercel.app` is inaccessible to this team.
- [ ] Re-run CI on the final release-metadata commit after deployment details are recorded.

## Explicit limitations

- No measured fee profile is claimed.
- Canonical positive authorization is intentionally left unconsumed; no live consumption transaction is claimed.
- Single admin controls one-time engine configuration; no multisig or timelock is implemented.
- Overall submission status remains **not ready** until the production deploy and public route checks are completed.
