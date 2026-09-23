# Deployment scripts

These scripts follow the GenLayer boilerplate convention of exporting `main(client)`. The finishing agent should invoke them through the current CLI-supported deploy-script command for the installed CLI version.

Sequence:

1. `deploy_registry.ts`
2. `deploy_authority.ts`
3. set `PATHCLOCK_REGISTRY_ADDRESS` and `PATHCLOCK_AUTHORITY_ADDRESS`
4. `deploy_engine.ts`
5. set `PATHCLOCK_REVIEW_ENGINE_ADDRESS`
6. `configure_authority.ts`

Every script waits for `FINALIZED`, not merely `ACCEPTED`.
