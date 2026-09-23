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
- [x] GitHub CI passes for release-evidence commit `8e33b82214b89581a79c7bc5ade4a60cc7b85398`: [run 35921670524](https://github.com/Bibidee/Pathclock/actions/runs/35921670524).
- [x] Fresh Studionet deployment, authority binding, frozen spec, positive review and finalized child authorization verified. See [`deployments/studionet.json`](deployments/studionet.json).
- [x] Inconclusive review confirmed no authorization; private-origin contract execution fails and creates no review/authorization.
- [x] Public fixture URLs are pinned to the immutable source commit.
- [x] No client-side secrets are required; contract addresses are public configuration.
- [x] Vercel production build is READY at [pathlock-rho.vercel.app](https://pathlock-rho.vercel.app), with the fresh public contract addresses.
- [x] Home, console, review, and proof routes return HTTP 200; the app’s GenLayer SDK/RPC read path returned the expected positive review and authorization.

## Pending before submission

- [ ] Assign the requested `pathlock.vercel.app` hostname to the Vercel project; it is currently inaccessible to the linked account. Until then, use only the verified `pathlock-rho.vercel.app` URL.

## Explicit limitations

- No measured fee profile is claimed.
- Canonical positive authorization is intentionally left unconsumed; no live consumption transaction is claimed.
- Single admin controls one-time engine configuration; no multisig or timelock is implemented.
- Browser-based visual rendering was not checked; production routes and direct GenLayer SDK/RPC proof data were verified separately.
- Submission is ready to demonstrate at `pathlock-rho.vercel.app`; exact custom-hostname assignment remains the sole external release caveat.
